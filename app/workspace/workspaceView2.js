document.addEventListener("DOMContentLoaded", function (){

    /**
     * Create a single instance of the WorkspaceView
     *
     * @singleton
     * @returns {WorkspaceView}
     * @constructor
     */
    function WorkspaceView() {
        // Management of singleton
        // Enforce only one instance of the WorkspaceView
        if (WorkspaceView._instance) {
            return WorskpaceView._instance;        
        }
        this.activePanelId = "main";

        this.htmlElements = {};
        this.panels = {
            main : new Panel("main", true),
            second : new Panel("second")
        };
        this.htmlElements.panes = document.getElementById('panes');
        this.htmlElements.iframes = document.getElementById('iframes');

        this.askia = window.askia;
        this.contentReference = {
            main : this.panels.main.htmlElements.root.querySelector('.tabs-content'),
            second : this.panels.second.htmlElements.root.querySelector('.tabs-content')
        };

        this.resizer = new this.askia.Resizer({
            element :  this.panels.main.htmlElements.root,
            onResize : function onResize() {
                WorkspaceView.getInstance().fixRendering();
            }
        });


        this.listenHtmlEvents();
        WorkspaceView._instance = this;
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

    /**
     * Search the tab with the specified id and return it
     *
     * @chainable
     * @return {WorkspaceView} Return the current workspace
     */
    WorkspaceView.prototype.listenHtmlEvents = function listenHtmlEvent() {
        this.panels.main.listenHtmlEvents();
        this.panels.second.listenHtmlEvents();
        return this;
    };

    /**
     * Search the tab with the specified id and return it
     *
     * @param {String} tabId Id of the tab to search
     * @return {Tab} Return the find tab or null when not found
     */
    WorkspaceView.prototype.findTab = function findTab(tabId) {
        return this.panels.main.findTab(tabId) || this.panels.second.findTab(tabId) || null;
    };
    
    /**
     * Move a tab to another pane
     *
     * @param {String} tabId The ID of the tab to move
     * @return {Tab} tab The tab moved
     */
    WorkspaceView.prototype.moveToAnotherPane = function (tabId) {
        var tab = this.findTab(tabId);
        if (!tab) {
            return null;
        }
        if (tab.panelId = "main") {
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
     * Return an Array of edited tabs
     *
     * @return {Array} editedTabs The array of edited tabs
     */
    WorkspaceView.prototype.getEditedTabs = function () {
        var editedTabs = [], panelId, tabs, id;
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
        }
        return editedTabs;
    };

	/**
     * Open the specified pane
     *
     * @param {String} panelId Name of the pane to open
     * @chainable
     * @return {WorkspaceView} Return the current workspace
     */
    WorkspaceView.prototype.openPanel = function (panelId) {
        this.setActivePanel(panelId);
        var panel = this.panels[panelId];
        panel.htmlElements.root.classList.add('open');
        panel.isOpen = true;
        var otherPanel = (panel.id === "main") ? this.panels["second"] : this.panels["main"];
        if (panel.isOpen && otherPanel.isOpen) {
            var panesEl = this.htmlElements.panes;
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
	 * Close the specified pane
	 * @param {String} panelId Name of the pane to close
     * @chainable
     * @return {WorkspaceView} Return the current workspace
	 */
    WorkspaceView.prototype.closePanel = function (panelId) {
        var panel = this.panels[panelId];
        panel.htmlElements.root.classList.remove('open');
        panel.isOpen = false;
        var otherPanel = (panel.id === "main") ? this.panels["second"] : this.panels["main"];
        if (!panel.isOpen || !otherPanel.isOpen) {
            var panesEl = this.htmlElements.panes;
            panesEl.classList.remove('split');
            panesEl.classList.add('full');
            this.resizer.stop();
        }
       return this.fixRendering();
    };

    /**
     * Add a tab in a specified panel
     *
     * @param {String} panelId the ID of the specified panel
     * @param {Object} tabConfig the config of the new Tab
     * @return {Tab} Returns the created tab
     */
    WorkspaceView.prototype.addTab = function (panelId, tabConfig) {
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
        this.panels[panelId].removeTab(tabId);
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

    /**
     * Fix scroll elements on tabs
     *
     * @param {String} panelId Name of the pane
     * @chainable
     * @return {WorkspaceView} Return the current workspace
     */
    WorkspaceView.prototype.fixTabsScroll = function (panelId) {
        var htmlElements = this.panels[panelId].htmlElements,
            wrapperEl = htmlElements.tabsWrapper,
            scrollEl  = htmlElements.tabsScroll;
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
        var contentRefEl = this.contentReference[panelId];
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
        var i, l, els = this.htmlElements.iframes.querySelectorAll('.active'),
            paneName;
        if (!els) {
            return this;
        }
        for (i = 0,  l = els.length; i < l; i += 1) {
            paneName = els[i].classList.contains('second') ? 'second' : 'main';
            this.setTabContentPosition(els[i], paneName);
        }

        return this;
    };

    /**
     * Fix the positions of all visible tabs content
     *
     * @chainable
     * @return {WorkspaceView} Return the current workspace
     */
    WorkspaceView.prototype.fixTabContentPositions = function () {
        var i, l, els = this.htmlElements.iframes.querySelectorAll('.active'),
            paneName;
        if (!els) {
            return this;
        }
        for (i = 0,  l = els.length; i < l; i += 1) {
            paneName = els[i].classList.contains('second') ? 'second' : 'main';
            this.setTabContentPosition(els[i], paneName);
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
        var contentRef = this.contentReference[panelId];
        contentEl.style.top = contentRef.offsetTop + 'px';
        contentEl.style.left = contentRef.offsetParent.offsetLeft + 'px';
        contentEl.style.height = contentRef.offsetHeight + 'px';
        contentEl.style.width = contentRef.offsetWidth + 'px';

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
    
    /**
     *
     *
     */
    WorkspaceView.prototype.openOtherPanel = function (panelId) {
        var otherPanel = (panelId === "main") ? this.panels["second"] : this.panels["main"];
        if (otherPanel.hasTab()) {
            this.setActivePanel(otherPanel.id);
            otherPanel.setActiveTab(otherPanel.tabsSelectionOrder[otherPanel.tabsSelectionOrder.length - 1]);
        }
    };


    /**
     * Creates a new instance of panel
     *
     * @param {String} id Id of the panel
     * @param {Boolean} isOpen Open it by default
     * @constructor
     */
    function Panel(id, isOpen) {
        this.id = id;
        this.isOpen = isOpen || false;
        this.activeTabId = null;
        this.tabs = {};
        this.firstTab = null;
        this.lastTab = null;
        this.htmlElements = {};
        this.htmlElements.root = document.getElementById(this.id + "_pane");
        this.htmlElements.tabsScroll = this.htmlElements.root.querySelector('.tabs-scroll');
        this.htmlElements.tabsWrapper = this.htmlElements.root.querySelector('.tabs-wrapper');
        this.htmlElements.placeHolder = this.htmlElements.root.querySelector('.tab-placeholder');
        this.tabsSelectionOrder = [];
    }

	/**
     * Itnit the event linked w
     */
    Panel.prototype.listenHtmlEvents = function () {
        var tabsEl = this.htmlElements.root.querySelector('.tabs'),
            self = this,
            scrollTimeout;

        function onTabsClick (event) {
            var tabId = event.target.parentNode.id.replace(/^(tab-)/, '') || event.target.id.replace(/^(tab-)/, '');
            WorkspaceView.getInstance().setActivePanel(self.id);
            switch (event.target.className) {
                case 'tab-close':
                    self.removeTab(tabId);
                    break;
                case 'tab-end':
                    return;
                default:
                    self.setActiveTab(tabId);
                    break;
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

        function onTabStopDrag(event, xClick) {
            this.removeEventListener('mousemove', onTabDrag);
            this.removeEventListener('mouseup', onTabStopDrag);
            this.classList.remove('on-tab-dragging');

            var details = self.htmlElements.root.dragDetails;
            details.el.classList.remove('dragging');
            details.el.style.left = '';
            if (details.hasMoved) {
                var placeholder = details.placeholder,
                    tabId = details.el.id.replace(/^(tab-)/, '');
                placeholder.parentNode.insertBefore(details.el, placeholder);
                if (!placeholder.previousElementSibling.previousElementSibling) {
                    var beforeTabId = placeholder.nextElementSibling.id.replace(/^(tab-)/, '');
                    self.moveBeforeTab(tabId, beforeTabId);
                    console.log('before : ', beforeTabId);
                } else {
                    var afterTabId = placeholder.previousElementSibling.previousElementSibling.id.replace(/^(tab-)/, '');
                    self.moveAfterTab(tabId, afterTabId);
                    console.log('after : ', afterTabId);
                }
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
        var tab = this.tabs[tabId],
            tabToSelect     = null,
            previousTabId	= tab.previousTabId,
            nextTabId 		= tab.nextTabId;            

        if (previousTabId) {
            tab.tabs[previousTabId].nextTabId = nextTabId;
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
        
        var indexSelected = this.tabsSelectionOrder.indexOf(tab.id);

        if (indexSelected !== -1) {
            this.tabsSelectionOrder.splice(indexSelected, 1);
        }
        //Check if we remove the current tab
        if (tab.isActive()) {
            tabToSelect = this.tabsSelectionOrder[indexSelected - 1] || tab.previousTabId || tab.nextTabId;
            tabToSelect = this.findTab(tabToSelect);
        }
        delete this.tabs[tabId];
        tab.remove();

        if(tabToSelect) {
            this.setCurrentTab(tabToSelect.id);
        } else {
            if (!this.hasTab()) {
                var workspace = WorkspaceView.getInstance();
                workspace.openOtherPanel(this.id);
                workspace.closePanel(this.id);
            }
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
        var tabToDeactivate = this.getActiveTab();
        var tabToActivate = this.findTab(tabId);
        
        // Same tab do nothing
        if (tabToDeactivate && tabToDeactivate.id === tabToActivate.id) {
            return this.getActiveTab();
        }

        // Move the new activated tab at the end of the selections
        var index = this.tabsSelectionOrder.indexOf(tabToActivate.id);
        if (index !== -1) {
            this.tabsSelectionOrder.splice(index, 1);
        }
        this.tabsSelectionOrder.push(tabToActivate.id);

        // Mark the html with CSS class
        if (tabToDeactivate) {
            tabToDeactivate.deactivate();
        }
        tabToActivate.activate();
        this.verify();
        WorkspaceView.getInstance().fixRendering();
        this.activeTabId = tabId;
        return this.getActiveTab();
    };

    //Just for debug
    Panel.prototype.verify = function () {
        var tabs = this.tabs,
            size = 0;
        for (var tab in tabs) {
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
     * Create a new instance of Tab
     *
     * @param {Object} config Config object
     * @param {String} paneId Id of the panel in which to create the tab
     * @constructor
     */
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
        this.nextTabId = null;
        this.previousTabId = null;
    }

    /**
     *	Re the tab in the view
     */
    Tab.prototype.render = function () {
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
        
        this.activate();
        
        var wor = WorkspaceView.getInstance();
        wor.setTabContentPosition(contentEl, this.panelId);
        wor.fixRendering();
/*
		//Close the empty pane but never close both pane
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
     * Get the viewer's URL for the specicied tab
     *
     * @param {boolean} [altContent=false] Alternative containt for toggle tab
     * @return {String} the url
     */
    Tab.prototype.getViewerUrl = function (altContent) {
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
        // return '../viewers/' + viewerSubFolderName + '/viewer.html?tabId=' + this.id + '&' + params.join('&');
        return "fakeviewers/file" + this.id + ".html?tabId=" + this.id + "&" + params.join('&');
    };
    
    /**
     * Method call by the viewer once the tab is ready to be display
     */
    Tab.prototype.ready = function ready() {
        // Make the tab visible
        this.htmlElements.iframeWrapper.style.visibility = '';

        // Focus on the code-mirror editor
        /*if (tab.isActive() && tab.editor && tab.editor.focus) {
                tab.editor.focus();
            }*/
    };
    
    /**
     *	remove the tab from the view
     */
    Tab.prototype.remove = function () {
        var el              = this.htmlElements.tab,
            contentEl       = this.htmlElements.content,
            tabToSelect     = null,
            panel     		= this.getPanel();
 
        
        //Remove the tab
        el.parentNode.removeChild(el);
        contentEl.parentNode.removeChild(contentEl);
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
        return panel.findTab(this.previousTabId);
    };

    /**
     * Search the next tab
     *
     * @return {Tab} The next Tab
     */
    Tab.prototype.getNextTab = function () {
        var panel = this.getPanel();
        return panel.findTab(this.nextTabId);
};

    /**
     * Search the previous selected tab
     *
     * @return {Tab} The previous selected Tab
     */
    Tab.prototype.getPreviousSelectedTab = function () {
        var panel = this.getPanel();
        return panel.findTab(this.previousSelectedTabId);
};

    /**
     * Search the next selected tab
     *
     * @return {Tab} The next selected Tab
     */
    Tab.prototype.getNextSelectedTab = function () {
        var panel = this.getPanel();
        return panel.findTab(this.nextSelectedTabId);
};

    /**
     * Search is the tab is the current activated
     *
     * @return {Boolean} True or false if the tab is the current one
     */
    Tab.prototype.isActive = function () {
        var panel = this.getPanel();
        return (panel.activeTabId === this.id);
    };

    /**
     * Close a tab
     *
     * @return {Tab} the closed Tab
     */
    Tab.prototype.close = function () {
        var panel = this.getPanel();
        panel.removeTab(this.id);
        return this;
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
    
    /**
     * Activate the tab
     * @chainable
     * @return {Tab} Returns the tab
     */
    Tab.prototype.activate = function () {
        this.htmlElements.tab.classList.add('active');
        this.htmlElements.content.classList.add('active');
        return this;
    };

    /**
     * Deactivete the tab
     * @chainable
     * @return {Tab} Returns the tab
     */
    Tab.prototype.deactivate = function () {
        this.htmlElements.tab.classList.remove('active');
        this.htmlElements.content.classList.remove('active');
        return this;
    };
    
    var wor = WorkspaceView.getInstance(),
        main = wor.panels.main,
        second = wor.panels.second;
       
    wor.addTab("main", {id :"1", name : "Tab1", path : "C:\Users\Vincent\Desktop\ADXStudio\app\worspace\workspaceView2.js", content : "ICI", type : "file"});
    wor.addTab("main", {id :"2", name : "Tab2", path : "C:\Users\Vincent\Desktop\ADXStudio\app\worspace\workspaceView2.js", content : "ICI", type : "file"});
    wor.addTab("main", {id :"3", name : "Tab3", path : "C:\Users\Vincent\Desktop\ADXStudio\app\worspace\workspaceView2.js", content : "ICI", type : "file"});
    wor.addTab("second", {id :"4", name : "Tab4", path : "C:\Users\Vincent\Desktop\ADXStudio\app\worspace\workspaceView2.js", content : "ICI", type : "file"});
    wor.addTab("second", {id :"5", name : "Tab5", path : "C:\Users\Vincent\Desktop\ADXStudio\app\worspace\workspaceView2.js", content : "ICI", type : "file"});
      
    window.workspace = WorkspaceView.getInstance();
});