document.addEventListener('DOMContentLoaded', function () {
  /**
   * Create a single instance of the WorkspaceView
   *
   * @singleton
   * @returns {WorkspaceView}
   * @constructor
   */
  function WorkspaceView () {
    // Management of singleton
    // Enforce only one instance of the WorkspaceView
    if (WorkspaceView._instance) {
      return WorkspaceView._instance;
    }
    WorkspaceView._instance = this;

    this.activePanelId = 'main';

    this.htmlElements = {};
    this.panels = {
      main: new Panel('main', true),
      second: new Panel('second')
    };
    this.htmlElements.panes = document.getElementById('panes');
    this.htmlElements.iframes = document.getElementById('iframes');

    this.askia = window.askia;
    this.theme = this.askia.initialTheme;
    this.contentReference = {
      main: this.panels.main.htmlElements.root.querySelector('.tabs-content'),
      second: this.panels.second.htmlElements.root.querySelector('.tabs-content')
    };
    this.modalDialog = this.askia.modalDialog;

    this.electron = require('electron');
    this.ipc = this.electron.ipcRenderer;
    this.remote = require('@electron/remote');
    this.Menu = this.remote.Menu;
    this.MenuItem = this.remote.MenuItem;
    this.shell = this.remote.shell;
    this.resizer = new this.askia.Resizer({
      element: this.panels.main.htmlElements.root,
      onResize: function onResize () {
        WorkspaceView.getInstance().fixRendering();
      }
    });

    this.init();
  }

  /**
   * Get the unique instance of the WorkspaceView
   *
   * @returns {WorkspaceView}
   */
  WorkspaceView.getInstance = function () {
    if (!WorkspaceView._instance) {
      WorkspaceView._instance = new WorkspaceView();
    }
    return WorkspaceView._instance;
  };

  /***************************************************************************************
   *	 							Init part of the workspace							   *
     ***************************************************************************************/
  /**
   * Init the workspaceView instance
   */
  WorkspaceView.prototype.init = function init () {
    //theme commander
    const self = this;
    this.askia.onSwitchTheme = function onSwitchTheme (theme) {
      const wor = WorkspaceView.getInstance();
      for (const panelId in wor.panels) {
        const panel = wor.panels[panelId];
        if (!panel || !panel.tabs) {
          continue;
        }
        for (const tabId in panel.tabs) {
          const tab = panel.tabs[tabId];
          if (!tab || !tab.viewer) {
            continue;
          }

          if (typeof tab.viewer.switchTheme === 'function') {
            tab.viewer.switchTheme(theme);
          }
          if (tab.altViewer && typeof tab.altViewer.switchTheme === 'function') {
            tab.altViewer.switchTheme(theme);
          }
        }
      }
      self.theme = theme;
    };

    //Event starter
    this.listenHtmlEvents();
    this.listenIpcEvents();
  };

  /**
   * Search the tab with the specified id and return it
   *
   * @chainable
   * @return {WorkspaceView} Return the current workspace
   */
  WorkspaceView.prototype.listenHtmlEvents = function listenHtmlEvent () {
    this.panels.main.listenHtmlEvents();
    this.panels.second.listenHtmlEvents();
    return this;
  };

  /**
   * Listen IPC event to communicate with all part of the application
   */
  WorkspaceView.prototype.listenIpcEvents = function listenIpcEvents () {
    const self = this;

    this.ipc.on('workspace-update-tab', function (event, err, newTabConfig, panelId) {
      if (err) {
        console.warn(err);
        return;
      }
      self.updateTab(newTabConfig, panelId);
    });

    this.ipc.on('workspace-save-active-file', function () {
      self.save();
    });

    this.ipc.on('workspace-save-as-active-file', function () {
      self.save(true);
    });

    this.ipc.on('workspace-save-all-files', function () {
      self.saveAll();
    });

    this.ipc.on('workspace-create-tab', function (event, err, tabConfig, panelId) {
      if (err) {
        console.warn(err);
        return;
      }
      self.addTab(panelId, tabConfig);
    });

    this.ipc.on('workspace-create-and-focus-tab', function (event, err, tabConfig, panelId) {
      if (err) {
        console.warn(err);
        return;
      }
      self.addTab(panelId, tabConfig);
    });

    this.ipc.on('workspace-focus-tab', function (event, err, tabConfig, panelId) {
      if (err) {
        console.warn(err);
        return;
      }
      if (!self.findTab(tabConfig.id)) {
        self.addTab(panelId, tabConfig);
      } else {
        self.setActiveTab(tabConfig.id);
      }

    });

    this.ipc.on('workspace-remove-tab', function (event, err, tabConfig, panelId) {
      if (err) {
        console.warn(err);
        return;
      }
      self.panels[panelId].removeTab(tabConfig.id);
    });

    this.ipc.on('workspace-remove-tabs', function (event, err, removedTabs) {
      if (err) {
        console.warn(err);
        return;
      }
      self.removeAllTabs(removedTabs);
    });

    this.ipc.on('workspace-reload-tab', function (event, err, tabConfig, panelId) {
      if (err) {
        console.warn(err);
        return;
      }
      self.reloadTab(tabConfig, panelId);
    });

    this.ipc.on('workspace-rename-tabs', function (event, err, tabsConfig, panelIds) {
      if (err) {
        console.warn(err);
        return;
      }
      tabsConfig.forEach((tabConfig, index) => {
        self.renameTab(tabConfig, panelIds[index]);
      });
    });

    this.ipc.on('switch-size', function (event, size) {
      self.switchFontSize(size);
    });

    this.ipc.on('next-tab', function () {
      self.nextTab();
    });

    this.ipc.on('prev-tab', function () {
      self.prevTab();
    });

    this.ipc.send('workspace-ready');
  };

  /***************************************************************************************
   * 							Content position and tabs Scroll						   *
     ***************************************************************************************/
  /**
   * Fix scroll elements on tabs
   *
   * @param {String} panelId Name of the pane
   * @chainable
   * @return {WorkspaceView} Return the current workspace
   */
  WorkspaceView.prototype.fixTabsScroll = function (panelId) {
    const htmlElements = this.panels[panelId].htmlElements;
    const wrapperEl = htmlElements.tabsWrapper;
    const scrollEl = htmlElements.tabsScroll;
    if (wrapperEl.clientWidth !== wrapperEl.scrollWidth) {
      scrollEl.querySelector('.scroll-right').classList.remove('disabled');
      scrollEl.querySelector('.scroll-left').classList.remove('disabled');
    } else {
      scrollEl.querySelector('.scroll-right').classList.add('disabled');
      scrollEl.querySelector('.scroll-left').classList.add('disabled');
    }

    return this;
  };

  /**
   * Set the position of the tab content
   *
   * @param {HTMLElement} contentEl HTML Element of the content
   * @param {String} panelId Id of the panel
   * @chainable
   * @return {WorkspaceView} Return the current workspace
   */
  WorkspaceView.prototype.setTabContentPosition = function (contentEl, panelId) {
    const contentRefEl = this.contentReference[panelId];
    contentEl.style.top = contentRefEl.offsetTop + 'px';
    contentEl.style.left = contentRefEl.offsetParent.offsetLeft + 'px';
    contentEl.style.height = contentRefEl.offsetHeight + 'px';
    contentEl.style.width = contentRefEl.offsetWidth + 'px';

    return this;
  };

  /**
   * Fix the positions of all visible tabs content
   *
   * @chainable
   * @return {WorkspaceView} Return the current workspace
   */
  WorkspaceView.prototype.fixTabContentPositions = function () {
    const els = this.htmlElements.iframes.querySelectorAll('.active');
    let paneName;
    if (!els) {
      return this;
    }
    for (let i = 0, l = els.length; i < l; i += 1) {
      paneName = els[i].classList.contains('second') ? 'second' : 'main';
      this.setTabContentPosition(els[i], paneName);
    }

    return this;
  };

  /**
   * Fix the entire rendering
   *
   * @chainable
   * @return {WorkspaceView} Return the current workspace
   */
  WorkspaceView.prototype.fixRendering = function () {
    return this.fixTabsScroll('main')
      .fixTabsScroll('second')
      .fixTabContentPositions();
  };

  /***************************************************************************************
   * 									Panel Commander								   	   *
     ***************************************************************************************/
  /**
   * Open the specified pane
   *
   * @param {String} panelId Name of the pane to open
   * @chainable
   * @return {WorkspaceView} Return the current workspace
   */
  WorkspaceView.prototype.openPanel = function (panelId) {
    this.setActivePanel(panelId);
    const panel = this.panels[panelId];
    panel.htmlElements.root.classList.add('open');
    panel.isOpen = true;
    const otherPanel = (panel.id === 'main') ? this.panels.second : this.panels.main;
    const panesEl = this.htmlElements.panes;
    if (!otherPanel.hasTab()) {
      otherPanel.isOpen = false;
      otherPanel.htmlElements.root.classList.remove('open');
      panesEl.classList.remove('split');
      panesEl.classList.add('full');
    }
    if (panel.isOpen && otherPanel.isOpen) {
      panesEl.classList.remove('full');
      panesEl.classList.add('split');
      // Enforce the size of the main pane
      // Ensure that tabs sizes will not resize the second pane
      if (!this.resizer.element.style.width) {
        this.resizer.element.style.width = (panesEl.offsetWidth / 2) + 'px';
      }
      this.resizer.start();
    }
    return this.fixRendering();
  };

  /**
 * Close the specified pane when it's possible
 * @param {String} panelId Name of the pane to close
   * @chainable
   * @return {WorkspaceView} Return the current workspace
 */
  WorkspaceView.prototype.closePanel = function (panelId) {
    const panel = this.panels[panelId];
    const otherPanel = (panel.id === 'main') ? this.panels.second : this.panels.main;

    // Always keep open 1 panel
    if (!otherPanel.isOpen) {
      const panesEl = this.htmlElements.panes;
      panesEl.classList.remove('split');
      panesEl.classList.add('full');
      this.resizer.stop();
      return this;
    }
    panel.htmlElements.root.classList.remove('open');
    panel.isOpen = false;

    const panesEl = this.htmlElements.panes;
    panesEl.classList.remove('split');
    panesEl.classList.add('full');

    if (!this.panels.main.isOpen && this.panels.second.isOpen) {
      for (const tab in this.panels.second.tabs) {
        this.moveToAnotherPane(tab);
      }
    }

    return this.fixRendering();
  };

  /**
   * Open the other panel
   *
   * @param {String} PanelId, the panelId of the current panel
   */
  WorkspaceView.prototype.openOtherPanel = function (panelId) {
    const otherPanel = (panelId === 'main') ? this.panels.second : this.panels.main;
    if (otherPanel.hasTab()) {
      this.setActivePanel(otherPanel.id);
      otherPanel.setActiveTab(otherPanel.tabsSelectionOrder[otherPanel.tabsSelectionOrder.length - 1]);
    }
  };

  /**
   * Search the current active panel
   *
   * @return {Panel} The current active panel
   */
  WorkspaceView.prototype.getActivePanel = function () {
    return this.panels[this.activePanelId];
  };

  /**
   * Set the active Panel
   *
   * @param {String} panelId Id of the panel to activate
   * @return {Panel} Return the new active panel
   */
  WorkspaceView.prototype.setActivePanel = function (panelId) {
    this.activePanelId = panelId;
    if (this.activePanelId === 'main') {
      this.panels.main.htmlElements.root.classList.add('focused');
      this.panels.second.htmlElements.root.classList.remove('focused');
    } else {
      this.panels.main.htmlElements.root.classList.remove('focused');
      this.panels.second.htmlElements.root.classList.add('focused');
    }
    return this.getActivePanel();
  };

  /***************************************************************************************
   * 									Tabs Commander								   	   *
     ***************************************************************************************/
  /**
   * Add a tab in a specified panel
   *
   * @param {String} panelId the ID of the specified panel
   * @param {Object} tabConfig the config of the new Tab
   * @return {Tab} Returns the created tab
   */
  WorkspaceView.prototype.addTab = function (panelId, tabConfig) {
    if (panelId === '') return;
    return this.panels[panelId].addTab(tabConfig);
  };

  /**
   * Remove a tab from a specified panel
   *
   * @param {String} panelId the ID of the specified panel
   * @param {String} tabId the id of the tab to remove
   * @return {Tab} Returns the removed tab
   */
  WorkspaceView.prototype.removeTab = function (panelId, tabId) {
    const self = this;
    const panel = this.panels[panelId];
    const tab = panel.tabs[tabId];
    if (!tab) {
      return;
    }

    //if the tab is not edited
    if (!tab.edited) {
      this.ipc.send('workspace-close-tab', tabId);
      return;
    }

    //else if the tab is edited
    this.modalDialog.show({
      type: 'yesNoCancel',
      message: 'Do you want to save it before?'
    }, function (retVal) {
      switch (retVal.button) {
      case 'yes':
        tab.viewer.saveContentAndClose();
        break;
      case 'no':
          // Close it
        self.ipc.send('workspace-close-tab', tabId);
        break;
      case 'cancel':
          // Abandon
        break;
      }
    });
  };

  /**
   * Remove all tabs in a panel
   *
   * @param {String} [exceptTabId] Tab to not remove
   */
  WorkspaceView.prototype.removeAllTabs = function (removedTabs) {
    for (let i = 0, l = removedTabs.length; i < l; i++) {
      const panelId = removedTabs[i].pane;
      const tabId = removedTabs[i].tab.id;
      this.panels[panelId].removeTab(tabId);
    }
  };

  /**
   * Search the tab with the specified id and return it
   *
   * @param {String} tabId Id of the tab to search
   * @return {Tab} Return the find tab or null when not found
   */
  WorkspaceView.prototype.findTab = function findTab (tabId) {
    return this.panels.main.findTab(tabId) || this.panels.second.findTab(tabId) || null;
  };

  /**
   * Return an Array of edited tabs
   *
   * @return {Array} editedTabs The array of edited tabs
   */
  WorkspaceView.prototype.getEditedTabs = function () {
    /*const editedTabs = [], panelId, tabs, id;
    for (panelId in this.panels) {
        if (this.panels.hasOwnProperty(panelId)) {
            tabs = this.panels[panelId].tabs;
            for (id in tabs) {
                if (tabs.hasOwnProperty(id)) {
                    if (tabs[id].edited) {
                        editedTabs.push(tabs[id]);
                    }
                }
            }
        }
    }*/
    const editedTabs = [];
    let panelId;
    let tabs;
    let id;
    for (panelId in this.panels) {
      if (!panelId) {
        continue;
      }
      tabs = this.panels[panelId].tabs;
      for (id in tabs) {
        if (!id) {
          continue;
        }
        if (tabs[id].edited) {
          editedTabs.push(tabs[id]);
        }
      }
    }
    return editedTabs;
  };

  /**
   * Set the active tab and focus it
   *
   * @param {String|Boolean} tabConfigId if we need to activate an existing tab
   */
  WorkspaceView.prototype.setActiveTab = function (tabConfigId) {
    let panel = this.getActivePanel();
    let tab;
    let tabId;
    if (!tabConfigId) {
      tab = panel.getActiveTab();
      tabId = tab.id;
    } else {
      tabId = tabConfigId;
      tab = this.findTab(tabId);
      panel = this.panels[tab.panelId];
    }
    if (tabId) {
      this.setActivePanel(panel.id);
      panel.setActiveTab(tabId);
    }
  };

  /**
   * Move a tab to another pane
   *
   * @param {String} tabId The ID of the tab to move
   * @return {Tab} tab The tab moved
   */
  WorkspaceView.prototype.moveToAnotherPane = function (tabId) {
    const self = this;
    const tab = this.findTab(tabId);
    if (!tab) {
      return null;
    }
    let tabToSelect = null;
    const previousTabId = tab.previousTabId;
    const nextTabId = tab.nextTabId;
    const oldPanel = this.panels[tab.panelId];
    const panel = (tab.panelId === 'main') ? this.panels.second : this.panels.main;

    this.openPanel(panel.id);

    panel.htmlElements.root.querySelector('.tabs').insertBefore(tab.htmlElements.tab, panel.htmlElements.root.querySelector('.tab-end'));


    function removeFromOldPanel () {
      if (previousTabId) {
        oldPanel.tabs[previousTabId].nextTabId = nextTabId;
      }
      if (nextTabId) {
        oldPanel.tabs[nextTabId].previousTabId = previousTabId;
      }
      if (oldPanel.lastTab === tab) {
        oldPanel.lastTab = oldPanel.tabs[previousTabId] || null;
      }
      if (oldPanel.firstTab === tab) {
        oldPanel.firstTab = oldPanel.tabs[nextTabId] || null;
      }

      const indexSelected = oldPanel.tabsSelectionOrder.indexOf(tab.id);

      if (indexSelected !== -1) {
        oldPanel.tabsSelectionOrder.splice(indexSelected, 1);
      }

      // Check if we remove the current tab
      if (tab.isActive()) {
        tabToSelect = oldPanel.tabsSelectionOrder[indexSelected - 1] || tab.previousTabId || tab.nextTabId;
        tabToSelect = oldPanel.findTab(tabToSelect);
      }

      tab.htmlElements.content.classList.remove(oldPanel.id);
      delete oldPanel.tabs[tabId];
    }

    function addToNewPanel () {
      self.openPanel(panel.id);

      if (panel.lastTab) {
        tab.previousTabId = panel.lastTab.id;
        panel.lastTab.nextTabId = tab.id;
        tab.nextTabId = null;
      }
      if (!panel.firstTab) {
        tab.previousTabId = null;
        panel.firstTab = tab;
      }
      panel.lastTab = tab;
      panel.tabs[tab.id] = tab;
      tab.panelId = panel.id;
      tab.htmlElements.content.classList.add(panel.id);
    }

    removeFromOldPanel();
    addToNewPanel();

    this.ipc.send('workspace-move-tab', tabId, tab.panelId);

    if (tabToSelect) {
      oldPanel.setActiveTab(tabToSelect.id);
    } else {
      if (!oldPanel.hasTab()) {
        self.closePanel(oldPanel.id);
      }
    }

    return panel.setActiveTab(tab.id);
  };

  /**
   * Update the information of the tab
   *
   * @param {Object} newTabConfig new config of the tab to update
   * @param {String} panelId Id of the pane
   */
  WorkspaceView.prototype.updateTab = function (newTabConfig, panelId) {
    const tab = this.panels[panelId].tabs[newTabConfig.id];
    if (!tab) {
      return;
    }

    //Copy the new config in the tab
    for (const key in newTabConfig) {
      if (newTabConfig.hasOwnProperty(key)) {
        tab[key] = newTabConfig[key];
      }
    }

    //Update de editor code when we are in project settings
    if (newTabConfig.type === 'projectSettings' && newTabConfig.displayAltViewer) {
      newTabConfig.editor.setValue(newTabConfig.content);
    }

    tab.tabContentChange(tab.content);
  };

  /**
   * Reload the tab and update the information of the tab
   *
   * @param {Object} tabConfig config of the tab to update
   * @param {String} panelId id of the pane
   */
  WorkspaceView.prototype.reloadTab = function (tabConfig, panelId) {
    this.updateTab(tabConfig, panelId);
    this.panels[panelId].reloadTab(tabConfig.id);
  };

  /***************************************************************************************
   * 									Event and controls							   	   *
     ***************************************************************************************/
  /**
   * Call when the content of the editor has changed
   *
   * @param {String} tabId Id of the tab
   * @param {String|Boolean} content Current content in the editor or indicates if has changed
   */
  WorkspaceView.prototype.onContentChange = function (tabId, content) {
    const tab = this.findTab(tabId);
    if (!tab) {
      return;
    }
    tab.tabContentChange(content);
  };

  /**
   * Display the tab
   *
   * @param {Tab} tab The tab to display
   */
  WorkspaceView.prototype.onEditorLoaded = function (tab) {
    tab.ready();
  };

  /**
   * Change the font size
   *
   * @param {String} size The new font size
   */
  WorkspaceView.prototype.switchFontSize = function (size) {
    for (const panelId in this.panels) {
      const panel = this.panels[panelId];
      if (!panel || !panel.tabs) {
        continue;
      }
      for (const tabId in panel.tabs) {
        const tab = panel.tabs[tabId];
        if (!tab || !tab.viewer) {
          continue;
        }

        if (typeof tab.viewer.changeFontSize === 'function') {
          tab.viewer.changeFontSize(size);
        }
        if (tab.altViewer && typeof tab.altViewer.changeFontSize === 'function') {
          tab.altViewer.changeFontSize(size);
        }
      }
    }
  };

  /**
   * Display the previous Tab
   */
  WorkspaceView.prototype.prevTab = function () {
    const currentPanel = this.getActivePanel();
    const currentTab = currentPanel.getActiveTab();
    const otherPanel = (currentPanel.id === 'main') ? this.panels.second : this.panels.main;
    let toActivate;

    if (!currentTab.previousTabId) {
      if (otherPanel.isOpen) {
        this.setActivePanel(otherPanel.id);
        toActivate = otherPanel.lastTab.id;
      } else {
        toActivate = currentPanel.lastTab.id;
      }
    } else {
      toActivate = currentTab.previousTabId;
    }

    this.setActiveTab(toActivate);
  };

  /**
   * Display the next Tab
   */
  WorkspaceView.prototype.nextTab = function () {
    const currentPanel = this.getActivePanel();
    const currentTab = currentPanel.getActiveTab();
    const otherPanel = (currentPanel.id === 'main') ? this.panels.second : this.panels.main;
    let toActivate;

    if (!currentTab.nextTabId) {
      if (otherPanel.isOpen) {
        this.setActivePanel(otherPanel.id);
        toActivate = otherPanel.firstTab.id;
      } else {
        toActivate = currentPanel.firstTab.id;
      }
    } else {
      toActivate = currentTab.nextTabId;
    }

    this.setActiveTab(toActivate);
  };

  /**
   * call in html viewer and send it to controller to save content
   *
   * @param {String} tabId the id of the tab to save
   * @param {String} content the content of the tab
   */
  WorkspaceView.prototype.onSave = function (tabId, content) {
    this.ipc.send('workspace-save-content', tabId, content);
  };

  /**
   * call in html viewer and send it to controller to save content as
   *
   * @param {String} tabId the id of the tab to save
   * @param {String} content the content of the tab
   */
  WorkspaceView.prototype.onSaveAs = function (tabId, content) {
    this.ipc.send('workspace-save-content-as', tabId, content);
  };

  /**
   * call in html viewer and send it to controller to save content and close the tab
   *
   * @param {String} tabId the id of the tab to save
   * @param {String} content the content of the tab
   */
  WorkspaceView.prototype.onSaveAndClose = function (tabId, content) {
    this.ipc.send('workspace-save-content-and-close', tabId, content);
  };

  /**
   * Save content of the active tab
   *
   * @param {Boolean} saveAs If we want to save as or juste save the document
   */
  WorkspaceView.prototype.save = function (saveAs) {
    const panel = this.getActivePanel();
    if (saveAs) {
      panel.save(saveAs);
    } else {
      panel.save();
    }
  };

  /**
   * Save all tabs
   */
  WorkspaceView.prototype.saveAll = function () {
    const tabs = this.getEditedTabs();
    for (const id in tabs) {
      tabs[id].save();
    }
  };

  /**
   * Rename a tab
   *
   * @param {Object} tabConfig config of the tab to renam
   * @param {String} panelId id of the pane
   */
  WorkspaceView.prototype.renameTab = function (tabConfig, panelId) {
    const panel = this.panels[panelId];
    panel.renameTab(tabConfig);
  };

  /**
   * Open an external browser window with the specified url
   * @param {String} url URL to open
   */
  WorkspaceView.prototype.openExternal = function openExternal (url) {
    this.shell.openExternal(url);
  };

  /**
   * Creates a new instance of panel
   *
   * @param {String} id Id of the panel
   * @param {Boolean} isOpen Open it by default
   * @constructor
   */
  function Panel (id, isOpen) {
    this.id = id;
    this.isOpen = isOpen || false;
    this.activeTabId = null;
    this.tabs = {};
    this.firstTab = null;
    this.lastTab = null;
    this.htmlElements = {};
    this.htmlElements.root = document.getElementById(this.id + '_pane');
    this.htmlElements.tabsScroll = this.htmlElements.root.querySelector('.tabs-scroll');
    this.htmlElements.tabsWrapper = this.htmlElements.root.querySelector('.tabs-wrapper');
    this.htmlElements.placeHolder = this.htmlElements.root.querySelector('.tab-placeholder');
    this.tabsSelectionOrder = [];
  }

  /**
   * Itnit the event linked w
   */
  Panel.prototype.listenHtmlEvents = function () {
    const workspace = WorkspaceView.getInstance();
    const tabsEl = this.htmlElements.root.querySelector('.tabs');
    const self = this;
    let scrollTimeout;

    function onTabsClick (event) {
      const tabId = event.target.parentNode.id.replace(/^(tab-)/, '') || event.target.id.replace(/^(tab-)/, '');
      switch (event.target.className) {
      case 'tab-close':
        workspace.removeTab(self.id, tabId);
        break;
      case 'tab-end':
        return;
      default:
        workspace.setActivePanel(self.id);
        self.setActiveTab(tabId);
        break;
      }
    }

    function onTabsRightClick (event) {
      const tabId = event.target.parentNode.id.replace(/^(tab-)/, '') || event.target.id.replace(/^(tab-)/, '');
      if (event.target.className !== 'tab-end') {
        const tab = self.findTab(tabId);
        if (tab) {
          showContextualMenu(tab);
        }
      }
    }

    /**
     * Display the contextual menu on tab
     */
    function showContextualMenu (tab) {
      const contextualMenu = new workspace.Menu();
      /* Close */
      contextualMenu.append(new workspace.MenuItem({
        label: 'Close',
        click: function onCloseClick () {
          workspace.removeTab(self.id, tab.id);
        }
      }));

      /* Close others */
      contextualMenu.append(new workspace.MenuItem({
        label: 'Close others',
        click: function onCloseOthersClick () {
          workspace.ipc.send('workspace-close-all-tabs', {
            except: tab.id
          });
          //workspace.removeAllTabs(tab.id);
        }
      }));
      /* Close all */
      contextualMenu.append(new workspace.MenuItem({
        label: 'Close all',
        click: function onCloseAllClick () {
          workspace.ipc.send('workspace-close-all-tabs');
        }
      }));

      contextualMenu.append(new workspace.MenuItem({ type: 'separator' }));

      /* Move to other pane */
      contextualMenu.append(new workspace.MenuItem({
        label: 'Move to other pane',
        click: function onMoveToOtherPaneClick () {
          workspace.moveToAnotherPane(tab.id);
        }
      }));

      /* Open file in the OS manner */
      if (/\.html?$/i.test(tab.path)) {
        contextualMenu.append(new workspace.MenuItem({ type: 'separator' }));

        contextualMenu.append(new workspace.MenuItem({
          label: 'Open in browser',
          click: function onClickOpen () {
            workspace.shell.openPath(tab.path);
          }
        }));
      }


      contextualMenu.popup(workspace.remote.BrowserWindow.getAllWindows()[0]);
    }

    function onTabsMousedown (event) {
      let el = event.srcElement;
      const shouldClose = el.classList.contains('tab-close');
      let tabId;
      let tab;

      if (shouldClose) {
        return;
      }
      if (el.parentNode.classList.contains('tab')) {
        el = el.parentNode;
      }

      if (el.classList.contains('tab')) {
        tabId = event.target.parentNode.id.replace(/^(tab-)/, '');
        tab = self.findTab(tabId);
        let paneEl = el;

        while (!paneEl.classList.contains('pane') && paneEl.tagName !== 'body') {
          paneEl = paneEl.parentNode;
        }


        self.htmlElements.root.dragDetails = {
          tab: tab,
          el: el,
          elWidth: el.offsetWidth,
          placeholder: self.htmlElements.root.querySelector('.tab-placeholder'),
          delta: event.pageX - el.offsetLeft,
          hasMoved: false,
          maxLeft: paneEl.offsetWidth - (el.offsetWidth + 10)
        };

        paneEl.addEventListener('mousemove', onTabDrag);
        paneEl.addEventListener('mouseup', onTabStopDrag);
      }
    }

    function onTabDrag (event) {
      const details = this.dragDetails;
      let siblingEl;
      let siblingLeftLimit;
      let nextEl;
      let pos;
      if (!this.classList.contains('on-tab-dragging')) {
        details.el.classList.add('dragging');
        details.el.parentNode.insertBefore(details.placeholder, details.el);
        details.placeholder.style.width = details.el.offsetWidth + 'px';
        this.classList.add('on-tab-dragging');
      }

      // Lower and upper bound of the element
      pos = (event.pageX - details.delta);
      if (pos > details.maxLeft) {
        pos = details.maxLeft;
      }

      // Move it
      details.el.style.left = pos + 'px';

      // Is the bound the el is lower than the half of the previous el?
      siblingEl = details.placeholder.previousElementSibling;
      while (siblingEl && siblingEl === details.el) {
        siblingEl = siblingEl.previousElementSibling;
      }
      if (siblingEl && siblingEl.classList.contains('tab')) {
        siblingLeftLimit = siblingEl.offsetLeft + (siblingEl.offsetWidth / 2);
        if (pos < siblingLeftLimit) {
          siblingEl.parentNode.insertBefore(details.placeholder, siblingEl);
          details.hasMoved = true;
          return;
        }
      }

      // Is the bound the el is greater than the half of the next el?
      siblingEl = details.placeholder.nextElementSibling;
      while (siblingEl && siblingEl === details.el) {
        siblingEl = siblingEl.nextElementSibling;
      }
      if (siblingEl && siblingEl.classList.contains('tab')) {
        siblingLeftLimit = siblingEl.offsetLeft + (siblingEl.offsetWidth / 2);
        if ((pos + details.elWidth) > siblingLeftLimit) {
          nextEl = siblingEl.nextElementSibling;
          while (nextEl && nextEl === details.el) {
            nextEl = nextEl.nextElementSibling;
          }
          siblingEl.parentNode.insertBefore(details.placeholder, nextEl);
          details.hasMoved = true;
        }
      }
    }

    function onTabStopDrag () {
      this.removeEventListener('mousemove', onTabDrag);
      this.removeEventListener('mouseup', onTabStopDrag);
      this.classList.remove('on-tab-dragging');

      const details = self.htmlElements.root.dragDetails;
      details.el.classList.remove('dragging');
      details.el.style.left = '';
      if (details.hasMoved) {
        const placeholder = details.placeholder;
        const tabId = details.el.id.replace(/^(tab-)/, '');
        placeholder.parentNode.insertBefore(details.el, placeholder);
        if (!placeholder.previousElementSibling.previousElementSibling) {
          const beforeTabId = placeholder.nextElementSibling.id.replace(/^(tab-)/, '');
          self.moveTabBefore(tabId, beforeTabId);
        } else {
          const afterTabId = placeholder.previousElementSibling.previousElementSibling.id.replace(/^(tab-)/, '');
          self.moveTabAfter(tabId, afterTabId);
        }
      }
    }

    function onTabsScroll (event) {
      const el = event.srcElement;
      const isScrollLeft = el.classList.contains('scroll-left');
      const isScrollRight = el.classList.contains('scroll-right');
      const direction = (isScrollLeft) ? 'left' : (isScrollRight) ? 'right' : false;
      const tabsWrapper = el.parentNode.parentNode.querySelector('.tabs-wrapper');

      // No explicit direction
      if (!direction) {
        return;
      }

      function doScroll () {
        tabsWrapper.scrollLeft += (direction === 'right') ? 75 : -75;
      }

      function clearTimer () {
        clearInterval(scrollTimeout);
        document.body.removeEventListener('mouseup', clearTimer);
      }

      document.body.addEventListener('mouseup', clearTimer);

      doScroll();
      scrollTimeout = setInterval(doScroll, 150);
    }

    // Add events on tabs container and tabs scroll
    tabsEl.addEventListener('click', onTabsClick);
    tabsEl.addEventListener('contextmenu', onTabsRightClick, false);
    tabsEl.addEventListener('mousedown', onTabsMousedown);
    this.htmlElements.tabsScroll.addEventListener('mousedown', onTabsScroll);
  };

  /**
   * Find a tab by the ID
   *
   * @param {String} tabId The Id of the tab
   * @return {Tab} tab The finded Tab
   */
  Panel.prototype.findTab = function (tabId) {
    return this.tabs[tabId];
  };

  /**
   * Add a given tab in the pane and in the view
   *
   * @param {Object} tabConfig Config of the tab to add
   * @return {Tab} tab the added Tab
   */
  Panel.prototype.addTab = function (tabConfig) {
    const workspace = WorkspaceView.getInstance();
    workspace.openPanel(this.id);

    const tab = new Tab(tabConfig, this.id);
    if (this.lastTab) {
      tab.previousTabId = this.lastTab.id;
      this.lastTab.nextTabId = tab.id;
    }
    if (!this.firstTab) {
      this.firstTab = tab;
    }
    this.lastTab = tab;
    this.tabs[tab.id] = tab;

    tab.render();

    return this.setActiveTab(tab.id);
  };

  /**
   * Delete a tab from the pane and form the view
   *
   * @param {String} tabId The Id of the tab
   * @return {Tab} the deleted Tab
   */
  Panel.prototype.removeTab = function (tabId) {
    const tab = this.tabs[tabId];
    let tabToSelect = null;
    const previousTabId = tab.previousTabId;
    const nextTabId = tab.nextTabId;
    const workspace = WorkspaceView.getInstance();


    if (previousTabId) {
      this.tabs[previousTabId].nextTabId = nextTabId;
    }
    if (nextTabId) {
      this.tabs[nextTabId].previousTabId = previousTabId;
    }
    if (this.lastTab === tab) {
      this.lastTab = this.tabs[previousTabId] || null;
    }
    if (this.firstTab === tab) {
      this.firstTab = this.tabs[nextTabId] || null;
    }

    const indexSelected = this.tabsSelectionOrder.indexOf(tab.id);

    if (indexSelected !== -1) {
      this.tabsSelectionOrder.splice(indexSelected, 1);
    }

    // Check if we remove the current tab
    if (tab.isActive()) {
      tabToSelect = this.tabsSelectionOrder[indexSelected - 1] || tab.previousTabId || tab.nextTabId;
      tabToSelect = this.findTab(tabToSelect);
    }
    delete this.tabs[tabId];
    tab.remove();

    if (tabToSelect) {
      this.setActiveTab(tabToSelect.id);
    } else {
      if (!this.hasTab()) {
        workspace.closePanel(this.id);
      }
    }

    return tab;
  };

  /**
   * Move specified tab before or after another tab
   *
   * @param {"before"|"after"} direction Direction of move
   * @param {String} tabId Id of the tab to move
   * @param {String} destinationTabId Id of the destination tab where to move
   * @return {Tab} tab The current Tab
   */
  Panel.prototype.moveTab = function (direction, tabId, destinationTabId) {
    const tab = this.tabs[tabId];
    const previousTabId = tab.previousTabId;
    const previousTab = this.tabs[previousTabId];
    const nextTabId = tab.nextTabId;
    const nextTab = this.tabs[nextTabId];

    let beforeTabId;
    let beforeTab;
    let afterTabId;
    let afterTab;

    if (direction === 'before') {
      beforeTabId = destinationTabId;
      beforeTab = this.tabs[beforeTabId] || null;
      afterTabId = (beforeTab && beforeTab.previousTabId) || null;
      afterTab = this.tabs[afterTabId] || null;
    } else {
      afterTabId = destinationTabId;
      afterTab = this.tabs[afterTabId] || null;
      beforeTabId = (afterTab && afterTab.nextTabId) || null;
      beforeTab = this.tabs[beforeTabId] || null;
    }

    if (previousTab) {
      previousTab.nextTabId = nextTabId;
    }
    if (nextTab) {
      nextTab.previousTabId = previousTabId;
    }
    // If we are moving the first tab,
    // take the next one and assign it as the first tab
    if (this.firstTab === tab && nextTab) {
      this.firstTab = nextTab;
    } else if (this.firstTab === beforeTab) {
      this.firstTab = tab;
    }
    // If we are moving the last tab,
    // take the previous one and assign it as the last tab
    if (this.lastTab === tab && previousTab) {
      this.lastTab = previousTab;
    } else if (this.lastTab === afterTab) {
      this.lastTab = tab;
    }

    // Upgrade the reference of the tab that has been moved
    tab.nextTabId = beforeTabId;
    tab.previousTabId = afterTabId;

    // Upgrade the reference of the tabs around
    if (beforeTab) {
      beforeTab.previousTabId = tabId;
    }
    if (afterTab) {
      afterTab.nextTabId = tabId;
    }

    return tab;
  };

  /**
   * Move specified tab before the another tab
   *
   * @param {String} tabId Id of the tab to move
   * @param {String} beforeTabId Id of the destination tab before where to move
   * @return {Tab} tab The current Tab
   */
  Panel.prototype.moveTabBefore = function (tabId, beforeTabId) {
    return this.moveTab('before', tabId, beforeTabId);
  };

  /**
   * Move specified tab after the another tab
   *
   * @param {String} tabId Id of the tab to move
   * @param {String} afterTabId Id of the destination tab after where to move
   * @return {Tab} tab The current Tab
   */
  Panel.prototype.moveTabAfter = function (tabId, afterTabId) {
    return this.moveTab('after', tabId, afterTabId);
  };

  /**
   * Rename the specified tab
   *
   * @param {String} tabId The Id of the tab
   * @param {String} name New name of the tab
   * @return {Tab} tab The current Tab
   */
  Panel.prototype.renameTab = function (tabId, name) {
    const tab = this.tabs[tabId];
    tab.rename(name);
    return tab;
  };

  /**
   * Check if the pane contain any tab
   *
   * @return {Boolean} if there is tab in the pane
   */
  Panel.prototype.hasTab = function () {
    return (!!Object.keys(this.tabs).length);
  };

  /**
   * Get the active Tab
   *
   * @return {Tab} The current Tab
   */
  Panel.prototype.getActiveTab = function () {
    return this.tabs[this.activeTabId];
  };

  /**
   * Set the active tab
   * @return {Tab} The current active tab
   */
  Panel.prototype.setActiveTab = function (tabId) {
    const tabToDeactivate = this.getActiveTab();
    const tabToActivate = this.findTab(tabId);

    // Same tab do nothing
    if (tabToDeactivate && tabToDeactivate.id === tabToActivate.id) {
      return this.getActiveTab();
    }

    // Move the new activated tab at the end of the selections
    if (tabToActivate) {
      const index = this.tabsSelectionOrder.indexOf(tabToActivate.id);
      if (index !== -1) {
        this.tabsSelectionOrder.splice(index, 1);
      }
      this.tabsSelectionOrder.push(tabToActivate.id);
    }

    // Mark the html with CSS class
    if (tabToDeactivate) {
      tabToDeactivate.deactivate();
    }
    this.activeTabId = tabId;

    if (tabToActivate) {
      tabToActivate.activate();
    }
    this.verify();
    WorkspaceView.getInstance().fixRendering();
    return this.getActiveTab();
  };

  /**
   * Reload the tab and update the information of the tab
   *
   * @param {String} tabId the id of the tab to reload
   */
  Panel.prototype.reloadTab = function (tabId) {
    const tab = this.findTab(tabId);
    tab.reload();
  };

  /**
   * Reload the tab and update the information of the tab
   *
   * @param {Object} tabConfig config of the tab to rename
   */
  Panel.prototype.renameTab = function (tabConfig) {
    const tab = this.findTab(tabConfig.id);
    if (!tab) {
      return;
    }
    tab.rename(tabConfig);
  };

  //Just for debug
  Panel.prototype.verify = function () {
    const tabs = this.tabs;
    let size = 0;
    for (const tab in tabs) {
      if (this.tabsSelectionOrder.indexOf(tab) === -1) {
        console.warn(tab + ' not in selected');
        return false;
      }
      ++size;
    }

    if (size === this.tabsSelectionOrder.length) {
      return true;
    }

    console.warn(size, this.tabsSelectionOrder.length);
    console.warn(this.tabsSelectionOrder);
    return false;
  };

  /**
   * Save the active tab
   *
   * @param {Boolean} saveAs If we want to save as or juste save the document
   */
  Panel.prototype.save = function (saveAs) {
    const tab = this.getActiveTab();
    if (saveAs) {
      tab.save(saveAs);
    } else {
      tab.save();
    }
  };

  /**
   * Create a new instance of Tab
   *
   * @param {Object} config Config object
   * @param {String} paneId Id of the panel in which to create the tab
   * @constructor
   */
  function Tab (config, paneId) {
    this.id = config.id;
    this.adcConfig = config.adcConfig || null;
    this.adcStructure = config.adcStructure || null;
    this.adxConfig = config.adxConfig || null;
    this.adxType = config.adxType || null;
    this.adxVersion = config.adxVersion || null;
    this.name = config.name;
    this.path = config.path;
    this.type = config.type;
    this.fileType = config.fileType;
    this.content = config.content;
    this.edited = false;
    this.mode = config.mode || null;
    this.ports = config.ports || null;
    this.panelId = paneId;
    this.viewer = null;
    this.altViewer = null;
    this.htmlElements = {
      tab: null,
      tabIcon: null,
      tabText: null,
      tabClose: null,
      iframeWrapper: null,
      iframe: null,
      altIframe: null,
      toggleWrapper: null,
      buttonForm: null,
      buttonCode: null,
      content: null
    };
    this.nextTabId = null;
    this.previousTabId = null;
  }

  /**
   *	Re the tab in the view
   */
  Tab.prototype.render = function () {
    // Create the tab
    const tabEl = document.createElement('li');
    tabEl.setAttribute('title', this.path);
    tabEl.classList.add('tab');
    tabEl.setAttribute('id', 'tab-' + this.id);

    this.htmlElements.tab = tabEl;

    if (this.name !== 'Preview') {
      const tabIcon = document.createElement('span');
      tabIcon.className = 'tab-icon ' + this.name.split('.')[this.name.split('.').length - 1].toLowerCase();
      //tabIcon.classList.add('tab-icon');
      tabEl.appendChild(tabIcon);
      this.htmlElements.tabIcon = tabIcon;
    }

    const tabText = document.createElement('span');
    tabText.classList.add('tab-text');
    tabText.innerHTML = this.name || 'File';
    tabEl.appendChild(tabText);

    this.htmlElements.tabText = tabText;

    const tabClose = document.createElement('a');
    tabClose.setAttribute('href', '#');
    tabClose.classList.add('tab-close');
    tabEl.appendChild(tabClose);

    this.htmlElements.tabClose = tabClose;

    // Create the content of the tab
    const contentEl = document.createElement('div');
    contentEl.classList.add('content');
    contentEl.classList.add(this.panelId);
    contentEl.setAttribute('id', 'content-' + this.id);

    this.htmlElements.content = contentEl;

    const iFrameWrapper = document.createElement('div');
    iFrameWrapper.className = 'iframe-wrapper';

    this.htmlElements.iframeWrapper = iFrameWrapper;

    const iFrame = document.createElement('iframe');
    iFrame.setAttribute('frameborder', 'no');
    iFrame.setAttribute('scrolling', 'no');
    iFrame.src = this.getViewerUrl();

    iFrameWrapper.appendChild(iFrame);

    this.htmlElements.iframe = iFrame;

    // While waiting the iframe load, hide the content to avoid the white flash
    iFrameWrapper.style.visibility = 'hidden';

    if (this.type === 'projectSettings') {
      const wor = WorkspaceView.getInstance();
      const self = this;
      iFrameWrapper.classList.add('multi-iframes');

      const altIFrame = document.createElement('iframe');
      altIFrame.setAttribute('frameborder', 'no');
      altIFrame.setAttribute('scrolling', 'no');
      altIFrame.src = this.getViewerUrl(true);
      iFrameWrapper.appendChild(altIFrame);

      this.htmlElements.altIframe = altIFrame;

      const toggleWrapper = document.createElement('div');
      toggleWrapper.className = 'toggle-wrapper';
      iFrameWrapper.appendChild(toggleWrapper);

      this.htmlElements.toggleWrapper = toggleWrapper;

      const buttonForm = document.createElement('button');
      buttonForm.textContent = 'Form';
      toggleWrapper.appendChild(buttonForm);

      this.htmlElements.buttonForm = buttonForm;

      const buttonCode = document.createElement('button');
      buttonCode.textContent = 'Code';
      toggleWrapper.appendChild(buttonCode);

      this.htmlElements.buttonCode = buttonCode;

      if (this.mode === 'form') {
        iFrame.style.display = 'none';
        this.displayAltViewer = true;
        buttonForm.className = 'active-sub-tab';
      } else {
        this.displayAltViewer = false;
        altIFrame.style.display = 'none';
        buttonCode.className = 'active-sub-tab';
      }

      buttonForm.addEventListener('click', function () {
        if (self.displayAltViewer) { // Already displayed
          return;
        }

        // ask the conversion of the config object to xml
        wor.ipc.once('workspace-xml-to-config', function (event, err, config) {
          // Reload the content using the new config
          self.adcConfig = config;
          self.projectSettings.reloadForm();
          // Toggle iframes
          self.displayAltViewer = true;
          iFrame.style.display = 'none';
          altIFrame.style.display = '';
          self.mode = 'form';
          buttonForm.classList.add('active-sub-tab');
          buttonCode.classList.remove('active-sub-tab');
        });
        wor.ipc.send('workspace-convert-xml-to-config', self.editor.getValue(), self.id);
      });

      buttonCode.addEventListener('click', function () {
        if (!self.displayAltViewer) { // Already displayed
          return;
        }

        // ask the conversion of the config object to xml
        wor.ipc.once('workspace-config-to-xml', function (event, err, xml) {
          // Reload the content using the new xml
          self.editor.setValue(xml);
          // Toggle iframes
          self.displayAltViewer = false;
          altIFrame.style.display = 'none';
          iFrame.style.display = '';
          self.mode = 'code';
          buttonForm.classList.remove('active-sub-tab');
          buttonCode.classList.add('active-sub-tab');
        });
        wor.ipc.send('workspace-convert-config-to-xml', self.projectSettings.getCurrentConfig(), self.id);
      });
    }

    contentEl.appendChild(iFrameWrapper);

    const paneEl = document.getElementById(this.getPanel().id + '_pane');

    paneEl.querySelector('.tabs').insertBefore(tabEl, paneEl.querySelector('.tab-end'));

    const iFramesContainer = document.getElementById('iframes');
    iFramesContainer.appendChild(contentEl);

    this.activate();

    const wor = WorkspaceView.getInstance();
    wor.setTabContentPosition(contentEl, this.panelId);
    wor.fixRendering();
  };

  /**
   * Get the viewer's URL for the specicied tab
   *
   * @param {boolean} [altContent=false] Alternative containt for toggle tab
   * @return {String} the url
   */
  Tab.prototype.getViewerUrl = function (altContent) {
    let viewerSubFolderName = 'editor';
    const params = [];
    switch (this.type) {
    case 'projectSettings':
      if (altContent) {
        viewerSubFolderName = 'projectSettings';
      }
      break;
    case 'preview':
      viewerSubFolderName = 'preview';
      break;
    case 'file':
      if (this.fileType === 'image') {
        viewerSubFolderName = 'image';
      }
      break;
    }
    if (altContent) {
      params.push('altFrame=1');
    }
    return '../viewers/' + viewerSubFolderName + '/viewer.html?tabId=' + this.id + '&' + params.join('&');
  };

  /**
   * Method call by the viewer once the tab is ready to be display
   */
  Tab.prototype.ready = function ready () {
    // Make the tab visible
    this.htmlElements.iframeWrapper.style.visibility = '';

    // Focus on the code-mirror editor
    if (this.isActive()) {
      this.window.focus();
      if (this.editor) this.editor.focus();
    }
  };

  /**
   *	Remove the tab from the view
   */
  Tab.prototype.remove = function () {
    const el = this.htmlElements.tab;
    const contentEl = this.htmlElements.content;

    el.parentNode.removeChild(el);
    contentEl.parentNode.removeChild(contentEl);
  };

  /**
   * Search the panel witch contains the tab
   *
   * @return {Panel} The panel witch contains the tab
   */
  Tab.prototype.getPanel = function () {
    const wor = WorkspaceView.getInstance();
    return wor.panels[this.panelId];
  };

  /**
   * Search the previous tab
   *
   * @return {Tab} The previous Tab
   */
  Tab.prototype.getPreviousTab = function () {
    const panel = this.getPanel();
    return panel.findTab(this.previousTabId);
  };

  /**
   * Search the next tab
   *
   * @return {Tab} The next Tab
   */
  Tab.prototype.getNextTab = function () {
    const panel = this.getPanel();
    return panel.findTab(this.nextTabId);
  };

  /**
   * Search is the tab is the current activated
   *
   * @return {Boolean} True or false if the tab is the current one
   */
  Tab.prototype.isActive = function () {
    const panel = this.getPanel();
    return (panel.activeTabId === this.id);
  };

  /**
   * Close a tab
   *
   * @return {Tab} the closed Tab
   */
  Tab.prototype.close = function () {
    const panel = this.getPanel();
    panel.removeTab(this.id);
    return this;
  };

  /**
   * Activate the tab
   * @chainable
   * @return {Tab} Returns the tab
   */
  Tab.prototype.activate = function () {
    const editor = this && this.editor;
    this.htmlElements.tab.scrollIntoView();
    this.htmlElements.tab.classList.add('active');
    this.htmlElements.content.classList.add('active');

    if (editor && editor.focus) {
      editor.focus();
    }
    return this;
  };

  /**
   * Deactivate the tab
   * @chainable
   * @return {Tab} Returns the tab
   */
  Tab.prototype.deactivate = function () {
    this.htmlElements.tab.classList.remove('active');
    this.htmlElements.content.classList.remove('active');
    return this;
  };

  /**
   * Reload the tab and update the information of the tab
   */
  Tab.prototype.reload = function () {
    this.htmlElements.iframe.src = this.getViewerUrl(this);
  };

  /**
   * Reload the tab and update the information of the tab
   *
   * @param {Object} tabConfig config of the tab to rename
   */
  Tab.prototype.rename = function (tabConfig) {
    this.name = tabConfig.name;
    this.path = tabConfig.path;
    this.htmlElements.tabText.innerHTML = this.name || 'File';
    this.htmlElements.tab.setAttribute('title', this.path);
  };

  /**
   * Event when the content of a tab has changed
   *
   * @param {String} content
   */
  Tab.prototype.tabContentChange = function (content) {
    const wor = WorkspaceView.getInstance();
    if (this.content && this.content !== content) {
      this.edited = true;
      this.htmlElements.tab.classList.add('edit');
      wor.ipc.send('workspace-edit-content', this.id);
    } else {
      this.edited = false;
      this.htmlElements.tab.classList.remove('edit');
      wor.ipc.send('workspace-restore-content', this.id);
    }
  };

  /**
   *Save the current Tab
 *
   * @param {Boolean} saveAs If we want to save as or juste save the document
   */
  Tab.prototype.save = function (saveAs) {
    if (saveAs) {
      this.viewer.saveContentAs();
    } else {
      this.viewer.saveContent();
    }
  };

  window.workspace = WorkspaceView.getInstance();
});
