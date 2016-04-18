document.addEventListener("DOMContentLoaded", function (){

    function WorkspaceView() {
        // Management of singleton
        // Enforce only one instance of the WorkspaceView
        if (WorkspaceView._instance) {
            return WorskpaceView._instance;        
        }

        this.htmlElements = {};
        this.panels = {
            main : new Panel("main", true),
            second : new Panel("second")
        };
        this.htmlElements.panes = document.getElementById('panes');
        this.htmlElements.iframes = document.getElementById('iframes');

        this.panels.main.htmlEvents();
        this.panels.second.htmlEvents();
        
        WorkspaceView._instance = this;
    };

    WorkspaceView.getInstance = function () {
        if (!WorkspaceView._instance) {
            WorkspaceView._instance = new WorkspaceView();
        }
        return WorkspaceView._instance;
    };

    /**
     * Move a tab to another pane
     *
     * @param {String} tabId The ID of the tab to move
     * @return {Tab} tab The tab moved
     */
    WorkspaceView.prototype.moveToAnotherPane = function (tabId) {
        var tab = this.panels.main.findTab(tabId) || this.panels.second.findTab(tabId);
        if (!tab) {
            return null;
        }
        if(tab.panelId = "main") {
            this.panels.second.add(tab);
            this.panels.main.remove(tabId);
            tab.panelId = "second";
        } else {
            this.panels.main.add(tab);
            this.panels.second.remove(tabId);
            tab.panelId = "main";
        }
        return tab;
    };

    /**
     * Give the current panel
     *
     * @return {Panel} panel The current panel
     */
    WorkspaceView.prototype.getCurrentPanel = function () {
        var panel = (this.panel.main.isCurrent)? this.panels.main : this.panels.second;
        return panel;
};

    /**
     * Return an Array of tab witch were edited
     *
     * @return {Array} editedTabs The array of edited tabs
     */
    WorkspaceView.prototype.getEditedTabs = function () {
        var editedTabs = [];
        for (var panelId in this.panels) {
            for(var id in this.panels[panelId].tabs) {
                if (this.panels[panelId].tabs[id].edited) {
                    editedTabs.push(this.panels[panelId].tabs[id]);
                } 
            }   
        }
        return editedTabs;
    };
    
    /**
     * Fix scroll elements on tabs
     * 
     * @param {String} pane Name of the pane
     */
    WorkspaceView.prototype.fixTabsScroll = function (panelId) {
        var paneEl = this.panels[panelId].htmlElements.root,
            wrapperEl = this.panels[panelId].htmlElements.tabsWrapper,
            scrollEl  = this.panels[panelId].htmlElements.tabsScroll;
        if (wrapperEl.clientWidth !== wrapperEl.scrollWidth) {
            scrollEl.querySelector('.scroll-right').classList.remove('disabled');
            scrollEl.querySelector('.scroll-left').classList.remove('disabled');
        } else {
            scrollEl.querySelector('.scroll-right').classList.add('disabled');
            scrollEl.querySelector('.scroll-left').classList.add('disabled');
        }
    };

    /**
     * Set the position of the tab content
     */
    WorkspaceView.prototype.setTabContentPosition = function (contentEl, panelId) {
        var contentRefEl = contentReference[this.panels[panelId]];
        contentEl.style.top = contentRefEl.offsetTop + 'px';
        contentEl.style.left = contentRefEl.offsetParent.offsetLeft + 'px';
        contentEl.style.height = contentRefEl.offsetHeight + 'px';
        contentEl.style.width = contentRefEl.offsetWidth + 'px';
    };
    
    /**
     * Fix the positions of all visible tabs content
     */
    WorkspaceView.prototype.fixTabContentPositions = function () {
        var i, l, els = iFramesContainer.querySelectorAll('.active'),
            paneName;
        if (!els) {
            return;
        }
        for (i = 0,  l = els.length; i < l; i += 1) {
            paneName = els[i].classList.contains('second') ? 'second' : 'main';
            this.setTabContentPosition(els[i], paneName);
        }
    };
    
    /**
  	 * Fix the entire rendering
  	 */
    WorkspaceView.prototype.fixRendering = function () {
        this.fixTabsScroll('main');
        this.fixTabsScroll('second');
        //this.fixTabContentPositions();
    };
    
	/**
     * Open the specified pane
     *
     * @param {String} panelId Name of the pane to open
     */
    WorkspaceView.prototype.openPanel = function (panelId) {
        var panel = this.panels[panelId];
        panel.htmlElements.root.classList.add('open');
        panel.isOpen = true;
        var otherPanel = (panel.id === "main") ? this.panels["second"] : this.panels["main"];
        if (panel.isOpen && otherPanel.isOpen) {
            var panesEl = this.htmlElements.panes
            panesEl.classList.remove('full');
            panesEl.classList.add('split');
            // Enforce the size of the main pane
            // Ensure that tabs sizes will not resize the second pane
            if (!resizer.element.style.width) {
                resizer.element.style.width = (panesEl.offsetWidth / 2) + 'px';
            }
            resizer.start();
        }
        this.fixRendering();
    };
    
    /**
	 * Close the specified pane
	 * @param {String} panelId Name of the pane to close
	 */
    WorkspaceView.prototype.closePanel = function (panelId) {
        var panel = this.panels[panelId];
        panel.htmlElements.root.classList.remove('open');
        panel.isOpen = false;
        var otherPanel = (panel.id === "main") ? this.panels["second"] : this.panels["main"];
        if (!panel.isOpen || !otherPanel.isOpen) {
            var panesEl = this.htmlElements.panes
            panesEl.classList.remove('split');
            panesEl.classList.add('full');
            resizer.stop();
        }
        this.fixRendering();
    };

    /**
     * Add a tab in a specified panel
     *
     * @param {String} panelId the ID of the specified panel
     * @param {Object} tabConfig the config of the new Tab
     */
    WorkspaceView.prototype.addTab = function (panelId, tabConfig) {
        this.panels[panelId].addTab(tabConfig);
    };
    
    /**
     * Remove a tab from a specified panel
     *
     * @param {String} panelId the ID of the specified panel
     * @param {String} tabId the id of the tab to remove
     */
    WorkspaceView.prototype.removeTab = function (panelId, tabId) {
        this.panels[panelId].removeTab(tabId);
    };
    
    /**
     * Search the current active panel
     *
     * @return {Panel} The current active panel
     */
    WorkspaceView.prototype.getActivePanel = function () {
        var activePanel;
        if (this.panels.main.htmlElements.root.classList.contains('focused')) {
            activePanel = this.panels.main;
        }
        if (this.panels.second.htmlElements.root.classList.contains('focused')) {
            activePanel = this.panels.second;
        }
        return activePanel;
    };
    
    /**
     * Set the active Tab
     */
    WorkspaceView.prototype.setActivePanel = function () {
      	var panel = this.getActivePanel();
        panel.setActiveTab();
    };
    
    
    
    function Panel(id, isOpen) {
        this.id = id;
        this.isOpen = isOpen || false;
        this.currentTabId = null;
        this.tabs = {};
        this.firstTab = null;
        this.lastTab = null;
        this.htmlElements = {};
        this.htmlElements.root = document.getElementById(this.id + "_pane");
        this.htmlElements.tabsScroll = this.htmlElements.root.querySelector('.tabs-scroll');
        this.htmlElements.tabsWrapper = this.htmlElements.root.querySelector('.tabs-wrapper');
        this.htmlElements.placeHolder = this.htmlElements.root.querySelector('.tab-placeholder');
    }

	/**
     * Itnit the event linked w
     */
    Panel.prototype.htmlEvents = function () {
        var tabsEl = this.htmlElements.root.querySelector('.tabs'),
            self = this,
            scrollTimeout,
            resizeTimeout;

        function onTabsClick (event) {
            var tabId = event.target.parentNode.id.replace(/^(tab-)/, '') || event.target.id.replace(/^(tab-)/, '');

            self.setPanel();
            if (event.target.className === "tab-close") {
                self.removeTab(tabId);
            } else {
                self.setActiveTab(tabId);
            }
        }

        function onTabsRightClick (event) {
            var tabId = event.target.parentNode.id.replace(/^(tab-)/, '');
            console.warn("Right Click Menu not implemented yet");
        }

        function onTabsMousedown (event) {
            var el = event.srcElement,
                shouldClose = el.classList.contains('tab-close'),
                tabId,
                tab;

            if (shouldClose) {
                return;
            }
            if (el.parentNode.classList.contains('tab')){
                el = el.parentNode;
            }

            if (el.classList.contains('tab')) {
                tabId = event.target.parentNode.id.replace(/^(tab-)/, '');
                tab = self.findTab(tabId);
                var paneEl= el;
                
                while(!paneEl.classList.contains('pane') && paneEl.tagName !== 'body') {
                    paneEl = paneEl.parentNode;
                }


                self.htmlElements.root.dragDetails = {
                    tab         : tab,
                    el          : el,
                    elWidth     : el.offsetWidth,
                    placeholder : self.htmlElements.root.querySelector('.tab-placeholder'),
                    delta       : event.pageX - el.offsetLeft,
                    hasMoved    : false,
                    maxLeft     : paneEl.offsetWidth - (el.offsetWidth + 10)
                };

                paneEl.addEventListener('mousemove', onTabDrag);
                paneEl.addEventListener('mouseup', onTabStopDrag);
            }
        }

        function onTabDrag(event) {
            var details = this.dragDetails;
            var siblingEl, siblingLeftLimit, nextEl, pos;
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
                    while(nextEl && nextEl === details.el) {
                        nextEl = nextEl.nextElementSibling;
                    }
                    siblingEl.parentNode.insertBefore(details.placeholder, nextEl);
                    details.hasMoved = true;
                }
            }
        }

        function onTabStopDrag() {
            this.removeEventListener('mousemove', onTabDrag);
            this.removeEventListener('mouseup', onTabStopDrag);
            this.classList.remove('on-tab-dragging');

            var details = self.htmlElements.root.dragDetails;
            details.el.classList.remove('dragging');
            details.el.style.left = '';
            if (details.hasMoved) {
                details.placeholder.parentNode.insertBefore(details.el, details.placeholder);
            }
        }

        function onTabsScroll(event) {
            var el = event.srcElement,
                isScrollLeft = el.classList.contains('scroll-left'),
                isScrollRight = el.classList.contains('scroll-right'),
                direction = (isScrollLeft) ? 'left' : (isScrollRight) ? 'right' : false,
                tabsWrapper = el.parentNode.parentNode.querySelector('.tabs-wrapper');

            // No explicit direction
            if (!direction) {
                return;
            }

            function doScroll() {
                tabsWrapper.scrollLeft += (direction === 'right') ? 75 : -75;
            }

            function clearTimer() {
                clearInterval(scrollTimeout);
                document.body.removeEventListener('mouseup', clearTimer);
            }

            document.body.addEventListener('mouseup', clearTimer);

            doScroll();
            scrollTimeout = setInterval(doScroll, 150);
        }

        //Add Event on tabs container and tabs scroll
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
        var wor = WorkspaceView.getInstance();
        wor.openPanel(this.id);
        
		this.setPanel();
        
        var tab = new Tab(tabConfig, this.id);
        if (this.lastTab) {
            tab.previousTabId = this.lastTab.id;
            this.lastTab.nextTabId = tab.id;
        }
        if (!this.firstTab) {
            this.firstTab = tab;
        }
        this.lastTab = tab;
        this.tabs[tab.id] = tab;
        
        tab.create();

        this.setCurrentTab(tab.id);

        return tab;
    };

    /**
     * Set the panel to "active" or not
     */
    Panel.prototype.setPanel = function () {
        var wor = WorkspaceView.getInstance();
        var otherPanel = (this.id === "main") ? wor.panels.second : wor.panels.main;
        if (otherPanel.htmlElements.root.classList.contains('focused')) {
            otherPanel.htmlElements.root.classList.remove('focused');            
        }
        this.htmlElements.root.classList.add('focused');
    };

    /**
     * Delete a tab from the pane and form the view
     *
     * @param {String} tabId The Id of the tab
     * @return {Tab} the deleted Tab
     */
    Panel.prototype.removeTab = function (tabId) {
        var tab = this.tabs[tabId];
        var previousTabId = tab.previousTabId;
        var nextTabId = tab.nextTabId;

        tab.remove();

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
        delete this.tabs[tabId];

        if (!this.hasTab()) {
            var wor = WorkspaceView.getInstance();
            wor.closePanel(this.id);
        }
        
        return tab;
    };

    /**
     * update current Tab while moving
     *
     * @param {String} tabId The Id of the tab
     * @param {String} beforeTabId The Id of the tab before the current one
     * @return {Tab} tab The current Tab
     */
    Panel.prototype.moveBeforeTab = function (tabId, beforeTabId) {
        var tab = this.tabs[tabId];
        var beforeTab = this.tabs[beforeTabId];
        if (this.lastTab.id === tabId) {
            this.tabs[tab.previousTabId].nextTabId = tab.nextTabId;
            this.lastTab = this.tabs[tab.previousTabId];
        }
        if (this.firstTab.id === beforeTabId) {
            this.firstTab = tab;
        }

        if (beforeTab.nextTabId === tabId) {
            beforeTab.nextTabId = tab.nextTabId;
        }
        tab.nextTabId = beforeTabId;
        tab.previousTabId = beforeTab.previousTabId;

        beforeTab.previousTabId = tabId;

        return tab;
    };

    /**
     * update current Tab while moving
     *
     * @param {String} tabId The Id of the tab
     * @return {Tab} tab The current Tab
     */
    Panel.prototype.moveAfterTab = function (tabId, afterTabId) {
        var tab = this.tabs[tabId];
        var afterTab = this.tabs[afterTabId];
        if (this.firstTab.id === tabId) {
            this.tabs[tab.nextTabId].previousTabId = tab.previousTabId;
            this.firstTab = this.tabs[tab.nextTabId];
        }
        if (this.lastTab.id === afterTabId) {
            this.lastTab = tab;
        }

        if (afterTab.previousTabId === tabId) {
            afterTab.previousTabId = tab.previousTabId;
        }
        tab.nextTabId = afterTab.nextTabId;
        tab.previousTabId = afterTabId;

        afterTab.nextTabId = tabId;

        return tab;
    };

    /**
     * Rename the specified tab
     *
     * @param {String} tabId The Id of the tab
     * @param {String} afterTabId The Id of the tab after the current one
     * @return {Tab} tab The current Tab
     */
    Panel.prototype.renameTab = function (tabId, name) {
        var tab = this.tabs[tabId];
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
     * Set the tab passed in parameter
     *
     * @param {String} tabId The Id of the tab
     * @return {Tab} the current Tab
     */
    Panel.prototype.setCurrentTab = function (tabId) {
        var previousSelected = this.currentTabId;
        if (previousSelected !== null) {
            this.tabs[tabId].previousSelectedTabId = previousSelected;
            this.tabs[previousSelected].nextSelectedTab = tabId;
        }
        this.tabs[tabId].nextSelectedTabId = null;
        this.currentTabId = tabId;
        this.setActiveTab(tabId);
        return this.getCurrentTab();
    }; //focus

    /**
     * Get the current Tab
     *
     * @return {Tab} The current Tab
     */
    Panel.prototype.getCurrentTab = function () {
        return this.tabs[this.currentTabId];
    };

    /**
     * set the active tab
     */
    Panel.prototype.setActiveTab = function (tabId) {
        var tab = this.findTab(tabId);
        tab.setActiveTab();
    }

    function Tab(config, paneId) {
        this.id = config.id;
        this.adxConfig = config.adxConfig || null;
        this.adxType = config.adxType || null;
        this.adxVersion = config.adxVersion || null;
        this.name = config.name;
        this.path = config.path	;
        this.type = config.type;
        this.fileType = config.fileType;
        this.content = config.content;
        this.edited = false;
        this.mode = config.mode || null;
        this.panelId = paneId;
        this.viewer = null;
        this.altViewer = null;
        this.htmlElements = {
            tab : null,
            tabIcon : null,
            tabText : null,
            tabClose : null,
            iframeWrapper : null,
            iframe : null,
            altIframe : null,
            toggleWrapper : null,
            buttonForm : null,
            buttonCode : null,
            content : null
        };
        this.nextSelectedTabId = null;
        this.previousSelectedTabId = null;
        this.nextTabId = null;
        this.previousTabId = null;
}

    /**
     *	Create the tab in the view
     */
    Tab.prototype.create = function () {
        // Create the tab
        var tabEl = document.createElement('li');
        tabEl.setAttribute('title', this.path);
        tabEl.classList.add('tab');
        tabEl.setAttribute('id', 'tab-' + this.id);

        this.htmlElements.tab = tabEl;

        var tabIcon = document.createElement('span');
        tabIcon.classList.add('tab-icon');
        tabEl.appendChild(tabIcon);

        this.htmlElements.tabIcon = tabIcon;

        var tabText = document.createElement('span');
        tabText.classList.add('tab-text');
        tabText.innerHTML = this.name || 'File';
        tabEl.appendChild(tabText);

        this.htmlElements.tabText = tabText;

        var tabClose = document.createElement('a');
        tabClose.setAttribute('href', '#');
        tabClose.classList.add('tab-close');
        tabEl.appendChild(tabClose);

        this.htmlElements.tabClose = tabClose;

        // Create the content of the tab
        var contentEl = document.createElement('div');
        contentEl.classList.add('content');
        contentEl.classList.add(this.panelId);
        contentEl.setAttribute('id', 'content-' + this.id);

        this.htmlElements.content = contentEl;

        var iFrameWrapper = document.createElement('div');
        iFrameWrapper.className = "iframe-wrapper";

        this.htmlElements.iframeWrapper = iFrameWrapper;

        var iFrame = document.createElement('iframe');
        iFrame.setAttribute('frameborder', 'no');
        iFrame.setAttribute('scrolling', 'no');
        iFrame.src = this.getViewerUrl();

        iFrameWrapper.appendChild(iFrame);

        this.htmlElements.iframe = iFrame;

        // While waiting the iframe load, hide the content to avoid the white flash
        iFrameWrapper.style.visibility = "hidden";

        if (this.type === "projectSettings") {
            iFrameWrapper.classList.add('multi-iframes');

            var altIFrame = document.createElement('iframe');
            altIFrame.setAttribute('frameborder', 'no');
            altIFrame.setAttribute('scrolling', 'no');
            altIFrame.src = this.getViewerUrl(true);
            iFrameWrapper.appendChild(altIFrame);

            this.htmlElements.altIframe = altIFrame;

            var toggleWrapper = document.createElement('div');
            toggleWrapper.className = "toggle-wrapper";
            iFrameWrapper.appendChild(toggleWrapper);

            this.htmlElements.toggleWrapper = toggleWrapper;

            var buttonForm = document.createElement('button');
            buttonForm.textContent = "Form";
            toggleWrapper.appendChild(buttonForm);

            this.htmlElements.buttonForm = buttonForm;

            var buttonCode = document.createElement('button');
            buttonCode.textContent = "Code";
            toggleWrapper.appendChild(buttonCode);

            this.htmlElements.buttonCode = buttonCode;

            if (this.mode === "form") {
                iFrame.style.display = "none";
                this.displayAltViewer = true;
                buttonForm.className = "active-sub-tab";
            } else {
                this.displayAltViewer = false;
                altIFrame.style.display = "none";
                buttonCode.className = "active-sub-tab";
            }

            buttonForm.addEventListener('click', function() {
                if (this.displayAltViewer) { // Already displayed
                    return;
                }
                // ask the conversion of the config object to xml
                /*ipc.once('workspace-xml-to-config', function (event, err, config) {
                // Reload the content using the new config
                this.adcConfig = config;
                this.projectSettings.reloadForm();
                // Toggle iframes
                this.displayAltViewer = true;
                iFrame.style.display = "none";
                altIFrame.style.display = "";
                this.config.mode = "form";
                this.mode = "form";
                buttonForm.classList.add("active-sub-tab");
                buttonCode.classList.remove("active-sub-tab");
            });
            ipc.send('workspace-convert-xml-to-config', this.editor.getValue(), this.id);*/
            });

            buttonCode.addEventListener('click', function() {
                if (!this.displayAltViewer) { // Already displayed
                    return;
                }
                // ask the conversion of the config object to xml
                /*ipc.once('workspace-config-to-xml', function (event, err, xml) {
                // Reload the content using the new xml
                this.editor.setValue(xml);
                // Toggle iframes
                this.displayAltViewer = false;
                altIFrame.style.display = "none";
                iFrame.style.display = "";
                this.mode = "code";
                this.config.mode = "code";
                buttonForm.classList.remove("active-sub-tab");
                buttonCode.classList.add("active-sub-tab");
            });
            ipc.send('workspace-convert-config-to-xml', this.projectSettings.getCurrentConfig(), this.id);*/
            });
        }

        contentEl.appendChild(iFrameWrapper);

        var paneEl = document.getElementById(this.getPanel().id + '_pane');

        paneEl.querySelector('.tabs').insertBefore(tabEl, paneEl.querySelector('.tab-end'));

        var iFramesContainer = document.getElementById('iframes');
        iFramesContainer.appendChild(contentEl);
        
        this.setActiveTab();
        /*setTabContentPosition(contentEl, pane);

    if (isActive) {
        setActiveTab(this, pane);
    }

    // Close the empty pane but never close both pane
    var paneState       = getPanesState();
    if (paneState.main && paneState.second) {
        if (!isPaneHasTab('main')) {
            closePane('main');
        } else if (!isPaneHasTab('second')) {
            closePane('second');
        }
    }

    fixRendering();*/
    };

    /**
     *	remove the tab from the view
     */
    Tab.prototype.remove = function () {
        var el              = document.getElementById('tab-' + this.id),
            contentEl       = document.getElementById('content-' + this.id),
            tabToSelect     = null,
            panel     		= this.getPanel();

        //Check if we remove the current tab
        if(panel.currentTabId === this.id) {
            tabToSelect = this.previousSelectedTabId || this.nextSelectedTabId || this.previousTabId || this.nextTabId;
            tabToSelect = panel.findTab(tabToSelect);
        }

        //Remove the tab
        el.parentNode.removeChild(el);
        contentEl.parentNode.removeChild(contentEl);

        if(tabToSelect) {
            panel.setCurrentTab(tabToSelect.id);
        }
    };

    /**
     * Search the panel witch contains the tab
     *
     * @return {Panel} The panel witch contains the tab
     */
    Tab.prototype.getPanel = function () {
        var wor = WorkspaceView.getInstance();
        return wor.panels[this.panelId];
    };

    /**
     * Search the previous tab
     *
     * @return {Tab} The previous Tab
     */
    Tab.prototype.getPreviousTab = function () {
        var panel = this.getPanel();
        var tab = panel.findTab(this.previousTabId);
        return tab;
    };

    /**
     * Search the next tab
     *
     * @return {Tab} The next Tab
     */
    Tab.prototype.getNextTab = function () {
        var panel = this.getPanel();
        var tab = panel.findTab(this.nextTabId);
        return tab;
};

    /**
     * Search the previous selected tab
     *
     * @return {Tab} The previous selected Tab
     */
    Tab.prototype.getPreviousSelectedTab = function () {
        var panel = this.getPanel();
        var tab = panel.findTab(this.previousSelectedTabId);
        return tab;
};

    /**
     * Search the next selected tab
     *
     * @return {Tab} The next selected Tab
     */
    Tab.prototype.getNextSelectedTab = function () {
        var panel = this.getPanel();
        var tab = panel.findTab(this.nextSelectedTabId);
        return tab;
};

    /**
     * Search is the tab is the current one
     *
     * @return {Boolean} True or false if the tab is the current one
     */
    Tab.prototype.isCurrent = function () {
        var panel = this.getPanel();
        return (panel.currentTabId === this.id);
    };

    /**
     * Close a tab
     *
     * @return {Tab} the closed Tab
     */
    Tab.prototype.close = function () {
        Panel.removeTab(this.id);
        return this;
    };

    /**
     *
     *
     *
     */
    Tab.prototype.getViewerUrl = function (altContent) {
        return "about:blank";
        var viewerSubFolderName = 'editor';
        var params = [];
        switch(this.type) {
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
 	 * Rename the specified tab
 	 *
     * @param {Strin} name The new name of the tab
     * @return {Tab} The current Tab
     */
    Tab.prototype.rename = function (name) {
        this.htmlElements.tabText.innerHTML = name;
        this.name = name;
        return this;
    };
    
    Tab.prototype.getActiveTab = function () {
        var wor = WorkspaceView.getInstance();
        var panel = wor.getActivePanel();
        var activeTab = panel.htmlElements.tabsWrapper.querySelector('.tab.active');
        
        if (activeTab) {
            activeTab = activeTab.id.replace(/^tab-/, "");
            activeTab = panel.findTab(activeTab);
        }
        return activeTab;
    };
    
    Tab.prototype.setActiveTab = function () {
        if (this.htmlElements.tab.classList.contains('active')) {
            return;
        }
        var oldActiveTab = this.getActiveTab();
        
        if (oldActiveTab) {
            oldActiveTab.htmlElements.tab.classList.remove('active');
            oldActiveTab.htmlElements.content.classList.remove('active');
        }
        
        this.htmlElements.tab.classList.add('active');
        this.htmlElements.content.classList.add('active');
        
    };
    
    
    var wor = WorkspaceView.getInstance(),
        main = wor.panels.main,
        second = wor.panels.second,
        askia =  window.askia,
        iFramesContainer = wor.htmlElements.iframes,
        contentReference = {
            main : main.htmlElements.root.querySelector('.tabs-content'),
            second : second.htmlElements.root.querySelector('.tabs-content')
        },
        resizer = new askia.Resizer({
            element : main.htmlElements.root,
            onResize : wor.fixRendering
        });


    //main.htmlEvents();
    //second.htmlEvents();
    wor.addTab("main", {id :"1", name : "Tab1", path : "C:\Users\Vincent\Desktop\ADXStudio\app\worspace\workspaceView2.js", type : "file"});
    wor.addTab("main", {id :"2", name : "Tab2", path : "C:\Users\Vincent\Desktop\ADXStudio\app\worspace\workspaceView2.js", type : "file"});
    wor.addTab("main", {id :"3", name : "Tab3", path : "C:\Users\Vincent\Desktop\ADXStudio\app\worspace\workspaceView2.js", type : "file"});
    wor.addTab("second", {id :"4", name : "Tab4", path : "C:\Users\Vincent\Desktop\ADXStudio\app\worspace\workspaceView2.js", type : "file"});
    wor.addTab("second", {id :"5", name : "Tab5", path : "C:\Users\Vincent\Desktop\ADXStudio\app\worspace\workspaceView2.js", type : "file"});
    
    console.dir(wor);
    
    window.workspace = WorkspaceView.getInstance();
});