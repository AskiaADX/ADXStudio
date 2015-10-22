(function () {
    "use strict";

    window.tabs  = {
        /**
         * Id of the current active tab
         */
        currentTabId : null,

        /**
         * Latest added tab
         */
        lastTabId    : null,

        /**
         * Add a tab in the collection
         *
         * @param {Tab} tab Tab to add
         */
        addTab       : function addTab(tab) {
            this[tab.id] = tab;

            var lastTab;

            // Register the previous tab
            if (!this.lastTabId) {
                tab.previous = null;
                tab.next     = null;
            } else {
                lastTab = this[this.lastTabId];
                lastTab.next = tab;
                tab.previous = lastTab;
                tab.next = null;
            }

            this.lastTabId = tab.id;
        },

        /**
         * Update the tab with the version coming from the main process
         *
         * @param {Tab} newTabInfo Tab coming from the main process
         */
        updateTab       : function updateTab(newTabInfo) {
            var originalTab = this[newTabInfo.id]; // Tab in the view

            // Copy from the new tab info to the original tab
            var key;
            for (key in newTabInfo) {
                if (newTabInfo.hasOwnProperty(key)) {
                    originalTab[key] = newTabInfo[key];
                }
            }

            this.dispatchEvent('tabcontentchange', originalTab.id, (originalTab.type !== 'projectSettings') ? originalTab.content : null);
        },

        /**
         * Remove the tab in the collection
         *
         * @param {Tab} tab Tab to remove
         */
        removeTab       : function removeTab(tab) {
            var previousSelection, previous, nextSelection, next;

            // Reset the last tab id
            if (this.lastTabId === tab.id) {
                if (tab.next) {
                    this.lastTabId = tab.next.id;
                } else if (tab.previous) {
                    this.lastTabId = tab.previous.id;
                } else {
                    this.lastTabId = null;
                }
            }


            // Reset the previous / next
            previousSelection   = tab.previousSelection;
            nextSelection       = tab.nextSelection;
            previous            = tab.previous;
            next                = tab.next;

            if (previousSelection) {
                previousSelection.nextSelection = nextSelection;
            }
            if (nextSelection) {
                nextSelection.previousSelection = previousSelection;
            }
            if (previous) {
                previous.next = next;
            }
            if (next) {
                next.previous = previous;
            }

            // Remove the reference
            delete this[tab.id];
        },

        /**
         * Event fire when the editor is full loaded
         * @param {Tab} tab Tab currently in used
         * @param {Window} tab.window Window that contains the content of the the tab
         * @param {CodeMirror} tab.editor Code mirror instance on the tab
         */
        onEditorLoaded : function onEditorLoaded(tab) {
            // Make the tab visible
            document.getElementById('content-' + tab.id).childNodes[0].style.visibility = '';

            // Focus on the code-mirror editor
            if (tab.id === this.currentTabId && tab.editor && tab.editor.focus) {
                tab.editor.focus();
            }
        },

        /**
         * Helper function to dispatch event
         *
         * @param {String} eventName Name of the event
         * @param {String} tabId Id of the tab taht initiate the event
         * @param {String|Object|Boolean} content Content of the tab or has changed
         */
        dispatchEvent  : function dispatchEvent(eventName, tabId, content) {
            var tab = this[tabId];
            if (!tab) {
                return;
            }

            var wasModified = false;
            if (typeof content === 'boolean') {
                wasModified =  content;
            } else {
                wasModified = (content !== undefined && tab.content !== content);
            }

            var event = new CustomEvent(eventName, {
                'detail': {
                    'tab'     : tab,
                    'content' : content,
                    'isModified' : wasModified
                }
            });
            document.body.dispatchEvent(event);
        },

        /**
         * Return the pane HTMLElement that host the specified tab
         * @param {String} tabId Id of the tab
         * @return {HTMLElement} Panel
         */
        getPaneElementByTabId : function getPaneElementByTabId(tabId) {
            var el      = document.getElementById('tab-' + tabId),
                paneEl  = el && el.parentNode;
            if (!el) {
                return null;
            }

            while(!paneEl.classList.contains('pane') && paneEl.tagName !== 'body') {
                paneEl = paneEl.parentNode;
            }
            return (paneEl.classList.contains('pane')) ? paneEl : null;
        },

        /**
         * Return the name of pane of the tab
         * @param {String} tabId Id of the tab
         * @return {String} paneMame
         */
        getPaneName : function getPaneName(tabId) {
            var paneEl = this.getPaneElementByTabId(tabId);
            if (!paneEl) {
                return null;
            }
            return paneEl.id.replace(/(_pane)$/, '');
        },

        /**
         * Event fire when a tab is focused
         * @param {String} tabId Id of the focused tab
         */
        onFocus : function onFocus(tabId) {
            this.dispatchEvent('tabfocused', tabId);
        },

        /**
         * Event fire when the content of the editor has changed
         *
         * @param {String} tabId Id of the tab
         * @param {String|Boolean} content Current content in the editor or indicates if has changed
         */
        onContentChange : function onContentChange(tabId, content) {
            this.dispatchEvent('tabcontentchange', tabId, content);
        },

        /**
         * Event fire when the editor request a save
         *
         * @param {String} tabId Id of the tab
         * @param {String|Object} content Current content in the editor
         */
        onSave       : function onSave(tabId, content) {
            this.dispatchEvent('tabcontentsave', tabId, content);
        },

        /**
         * Event fire when the editor request a save as
         *
         * @param {String} tabId Id of the tab
         * @param {String|Object} content Current content in the editor
         */
        onSaveAs     : function onSaveAs(tabId, content) {
            this.dispatchEvent('tabcontentsaveas', tabId, content);
        },

        /**
         * Set the current tab and focus the editor
         * @param {String} tabId Id of the current tab
         */
        setCurrentTab : function setCurrentTab(tabId) {
            var currentTab    = this[tabId],
                currentEditor, previousTab;

            // Register the previous selected tab
            if (!this.currentTabId) {
                currentTab.previousSelection = null;
                currentTab.nextSelection = null;
            } else {
                previousTab = this[this.currentTabId];
                if (previousTab) {
                    previousTab.nextSelection = currentTab;
                }
                currentTab.previousSelection = previousTab;
                currentTab.nextSelection = null;
            }

            // Set the current tab
            this.currentTabId = tabId;

            currentEditor = currentTab && currentTab.editor;
            if (currentEditor && currentEditor.focus) {
                currentEditor.focus();
            }
        },

        /**
         * Search the previous tab to select on the specified pane
         * Mainly used to make a tab content visible when moving a tab to another pane
         * or when removing a tab
         *
         * @param {String} tabId Indicates the id of the tab from where the search should start
         * @param {String} pane Name of the pane where the tab is / was located
         */
        searchPreviousSelectionOnPane : function searchPreviousSelectionOnPane(tabId, pane) {
            var currentTab = this[tabId],
                prevTab = currentTab.previousSelection || currentTab.nextSelection || currentTab.previous || currentTab.next || null,
                prevTabPane = (prevTab && this.getPaneName(prevTab.id)) || null;

            while (prevTab && prevTabPane && prevTabPane !== pane) {
                prevTab = prevTab.previousSelection || prevTab.nextSelection || prevTab.previous || prevTab.next || null;
                prevTabPane = (prevTab && this.getPaneName(prevTab.id)) || null;

                // Break here to avoid infinite loop
                if (prevTab.id === tabId) {
                    return null;
                }
            }
            if ((prevTab && prevTabPane !== pane) || (prevTab && prevTab.id === tabId)) {
                return null;
            }
            return prevTab;
        }
    };
}());



document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    var ipc  = require('ipc'),
        remote	= require('remote'),
        Menu	= remote.require('menu'),
        MenuItem = remote.require('menu-item'),
        shell	= remote.require('shell'),
        linter   = remote.require('eslint').linter,
        tabs = window.tabs,
        askia =  window.askia,
        resizer = new askia.Resizer({
            element : document.getElementById('main_pane'),
            onResize : fixRendering
        }),
        iFramesContainer = document.getElementById('iframes'),
        // Container of tab content
        contentReference = {
            main : document.getElementById('main_pane').querySelector('.tabs-content'),
            second : document.getElementById('second_pane').querySelector('.tabs-content')
        };

    // Expose the reference to the ESLint
    window.eslint = {
        verify : function (code, config) {
            return linter.verify(code, config);
        }
    };

    /**
     * Indicates if the element has horizontal scroll
     * @param {HTMLElement} el
     * @returns {boolean}
     * @ignore
     */
    function hasHorizontalScroll(el) {
        return el.clientWidth !== el.scrollWidth;
    }

    /**
     * Fix scroll elements on tabs
     * @param {String} pane Name of the pane
     */
    function fixTabsScroll(pane) {
        var paneEl = document.getElementById(pane + '_pane'),
            wrapperEl = paneEl.querySelector('.tabs-wrapper'),
            scrollEl  = paneEl.querySelector('.tabs-scroll');
        scrollEl.style.visibility = hasHorizontalScroll(wrapperEl) ? 'visible' : '';
    }
    
    /**
     * Set the position of the tab content
     */
    function setTabContentPosition(contentEl, pane) {
        var contentRefEl = contentReference[pane];
        contentEl.style.top = contentRefEl.offsetTop + 'px';
        contentEl.style.left = contentRefEl.offsetParent.offsetLeft + 'px';
        contentEl.style.height = contentRefEl.offsetHeight + 'px';
        contentEl.style.width = contentRefEl.offsetWidth + 'px';
    }

    /**
     * Fix the positions of all visible tabs content
     */
    function fixTabContentPositions() {
        var i, l, els = iFramesContainer.querySelectorAll('.active'),
            paneName;
        if (!els) {
            return;
        }
        for (i = 0,  l = els.length; i < l; i += 1) {
            paneName = els[i].classList.contains('second') ? 'second' : 'main';
            setTabContentPosition(els[i], paneName);
        }
    }

    /**
     * Fix the entire rendering
     */
    function fixRendering() {
        fixTabsScroll('main');
        fixTabsScroll('second');
        fixTabContentPositions();
    }

     /**
      * Add a tab
      *
      * @param {Tab} tab Tab object
      * @param {String} pane Name of the pane
      * @param {Boolean} [isActive=false] Activate the tab after his creation
      */
    function addTab(tab, pane, isActive) {
        // Open the pane
        openPane(pane);

        // Create the tab
        var tabEl = document.createElement('li');
        tabEl.setAttribute('title', tab.path);
        tabEl.classList.add('tab');
        tabEl.setAttribute('id', 'tab-' + tab.id);

        var tabIcon = document.createElement('span');
        tabIcon.classList.add('tab-icon');
        tabEl.appendChild(tabIcon);

        var tabText = document.createElement('span');
        tabText.classList.add('tab-text');
        tabText.innerHTML = tab.name || 'File';
        tabEl.appendChild(tabText);


        var tabClose = document.createElement('a');
        tabClose.setAttribute('href', '#');
        tabClose.classList.add('tab-close');
        tabEl.appendChild(tabClose);

        // Create the content of the tab
        var contentEl = document.createElement('div');
        contentEl.classList.add('content');
        contentEl.classList.add(pane);
        contentEl.setAttribute('id', 'content-' + tab.id);

        var div = document.createElement('div');
        var viewer = document.createElement('iframe');
        viewer.setAttribute('frameborder', 'no');
        viewer.setAttribute('scrolling', 'no');
        tabs.addTab(tab);
        viewer.src = getViewerUrl(tab);
        div.appendChild(viewer);
        // While waiting the iframe load, hide the content to avoid the white flash
        div.style.visibility = "hidden";

        contentEl.appendChild(div);

        var paneEl = document.getElementById(pane + '_pane');

        paneEl.querySelector('.tabs').insertBefore(tabEl, paneEl.querySelector('.tab-end'));

        iFramesContainer.appendChild(contentEl);
        setTabContentPosition(contentEl, pane);

        if (isActive) {
            setActiveTab(tab, pane);
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

        fixRendering();
    }

    /**
     * Get the viewer's URL for the specicied tab
     *
     * @param {Tab} tab
     */
    function getViewerUrl(tab) {
        var viewerSubFolderName = 'editor';
        switch(tab.type) {
            case 'projectSettings':
                viewerSubFolderName = 'projectSettings';
                break;
            case 'preview':
                viewerSubFolderName = 'preview';
                break;
            case 'file':
                if (tab.fileType === 'image') {
                    viewerSubFolderName = 'image';
                }
                break;
        }
        return '../viewers/' + viewerSubFolderName + '/viewer.html?tabId=' + tab.id;
    }

    /**
     * Set active tab
     *
     * @param {Tab} tab Tab to active
     * @param {String} pane Name of the pane where the tab is located
     */
    function setActiveTab(tab, pane) {
        var el              = document.getElementById('tab-' + tab.id),
            content         = document.getElementById('content-' + tab.id),
            oldActiveTab    = document.getElementById(pane + '_pane').querySelector('.tab.active'),
            oldContent      = oldActiveTab && document.getElementById(oldActiveTab.id.replace(/^tab-/, "content-"));

        setActivePane(pane);
        content.classList.remove(pane === 'main' ? 'second' : 'main');
        content.classList.add(pane);
        setTabContentPosition(content, pane);

        if (el === oldActiveTab) {
            return;
        }

        if (oldActiveTab) {
            oldActiveTab.classList.remove('active');
            oldContent.classList.remove('active');
        }
        el.classList.add('active');
        el.scrollIntoView();
        content.classList.add('active');
        tabs.setCurrentTab(tab.id);
    }

    /**
     * Update the information of the tab
     *
     * @param {Tab} tab Tab to update
     * @param {String} pane Name of the pane
     */
    function updateTab(tab, pane) {
        tabs.updateTab(tab);
    }

    /**
     * Reload the tab and update the information of the tab
     *
     * @param {Tab} tab Tab to update
     * @param {String} pane Name of the pane
     */
    function reloadTab(tab, pane) {
        var contentEl = document.getElementById('content-' + tab.id),
            viewerEl  = contentEl.querySelector('iframe');

        tabs.updateTab(tab, pane);
        viewerEl.src = getViewerUrl(tab);
    }
    
    /**
     * Remove a tab
     *
     * @param {Tab} tab Tab object to remove
     * @param {String} pane Name of the pane where the tab is locased
     */
    function removeTab(tab, pane) {
        var el              = document.getElementById('tab-' + tab.id),
            contentEl       = document.getElementById('content-' + tab.id),
            tabToSelect     = null,
            currentTab      = tabs[tab.id],
            paneState       = getPanesState();

        // First look if the tab to close is the current active one
        if (tabs.currentTabId === currentTab.id) {
            tabToSelect = currentTab.previousSelection || currentTab.nextSelection ||
                currentTab.previous || currentTab.next;
        }

        // Remove the tab reference
        tabs.removeTab(currentTab);

        // Remove the tab
        el.parentNode.removeChild(el);
        contentEl.parentNode.removeChild(contentEl);

        // Set the new active tab
        if (tabToSelect) {
            setActiveTab(tabToSelect, tabs.getPaneName(tabToSelect.id));
        }

        // Close the empty pane but never close both pane
        if ((paneState.main && paneState.second) && !isPaneHasTab(pane)) {
            closePane(pane);
        }

        fixRendering();
    }
    
    /**
     * Move the tab to another pane
     * @param {Object} tab Tab to move
     * @param {String} targetPane Name of the target pane
     */
    function moveTab(tab, targetPane) {
        var el              = document.getElementById('tab-' + tab.id),
            currentTab      = tabs[tab.id],
            paneState,
            targetPaneEl	= document.getElementById(targetPane + '_pane'),
            sourcePaneEl	= tabs.getPaneElementByTabId(tab.id),
            sourcePane		= sourcePaneEl.id.replace(/(_pane)$/, ''),
            prevTab			= null,
            sourceTabLength;
        
        if (sourcePane === targetPane) {
            return;
        }
        
        openPane(targetPane);
        sourceTabLength = sourcePaneEl.querySelectorAll('.tabs > li.tab').length - 1;
        
        // If the tab was visible, then make another tab (in the source pane) visible
        if (el.classList.contains('active')) {
            prevTab = tabs.searchPreviousSelectionOnPane(currentTab.id, sourcePane);
            if (prevTab) {
                var prevEl = document.getElementById('tab-' + prevTab.id);
                var prevContentEl = document.getElementById('content-' + prevTab.id);
                prevEl.classList.add('active');
                prevEl.scrollIntoView();
                prevContentEl.classList.add('active');
                setTabContentPosition(prevContentEl, sourcePane);
            }
        }

        // Move the tab
        targetPaneEl.querySelector('.tabs').insertBefore(el, targetPaneEl.querySelector('.tab-end'));
        el.scrollIntoView();
        
		// Activate the pane
        setActiveTab(tab, targetPane);

        // Close the empty pane but never close both pane
        paneState = getPanesState();
        if (paneState.main && paneState.second) {   
            // MS:Use the sourceTabLength instead of the isPaneHasTab
            // because the DOM seems to be slow and finished updated after this line
            // resulting that the information is wrong at this level
            // To fix that, we calculate the number of tabs in the source pane, before to move the tab
            if (!sourceTabLength) {
                closePane(sourcePane);
            }
        }
        fixRendering();
    }

    /**
     * Set the active pane
     * @param {String} pane Name of the pane to activate
     */
    function setActivePane(pane) {
        var paneEl          = typeof pane === 'string' ?  document.getElementById(pane + '_pane') : pane,
            oldPane         = document.querySelector('.pane.focused');
        if (oldPane && oldPane !== paneEl) {
            oldPane.classList.remove('focused');
        }
        paneEl.classList.add('focused');
    }

    /**
     * Return the state of panes
     * @return {Object} state
     */
    function getPanesState() {
        return {
            main : document.getElementById('main_pane').classList.contains('open'),
            second : document.getElementById('second_pane').classList.contains('open')
        };
    }

    /**
     * Open the specified pane
     * @param {String} pane Name of the pane to open
     */
    function openPane(pane) {
        document.getElementById(pane + '_pane').classList.add('open');
        var state = getPanesState();
        if (state.main && state.second) {
            var panesEl = document.getElementById('panes');
            panesEl.classList.remove('full');
            panesEl.classList.add('split');
			// Enforce the size of the main pane
			// Ensure that tabs sizes will not resize the second pane
            if (!resizer.element.style.width) {
                resizer.element.style.width = (panesEl.offsetWidth / 2) + 'px';
            }
            resizer.start();
        }

        fixRendering();
    }

    /**
     * Indicates if the specified pane has tab
     * @param {String} pane Name of the pane to examine
     */
    function isPaneHasTab(pane) {
        return document.getElementById(pane + '_pane').querySelectorAll('.tabs > li.tab').length;
    }

    /**
     * Close the specified pane
     * @param {String} pane Name of the pane to close
     */
    function closePane(pane) {
        document.getElementById(pane + '_pane').classList.remove('open');
        var state = getPanesState();
        if (!state.main || !state.second) {
            var panesEl = document.getElementById('panes');
            panesEl.classList.remove('split');
            panesEl.classList.add('full');
            resizer.stop();
        }
        fixRendering();
    }

    /**
     * Return the current active tab
     * It uses the DOM to determine it more explicitly
     *
     * @return {Object} active tab
     */
    function getActiveTab() {
        var activePane = document.querySelector('.pane.focused');
        if (!activePane) {
            return null;
        }
        var activeTab = activePane.querySelector('.tab.active');
        if (!activeTab) {
            return null;
        }
        var tabId = activeTab.id.replace(/^tab-/, '');
        return tabs[tabId] || null;
    }

    /**
     * Save the current tab
     */
    function save() {
        var currentTab = getActiveTab();
        if (!currentTab || !currentTab.viewer) {
            return;
        }
        if (typeof currentTab.viewer.saveContent === 'function') {
            currentTab.viewer.saveContent();
        }
    }

    /**
     * Save the current tab as
     */
    function saveAs() {
        var currentTab = getActiveTab();
        if (!currentTab || !currentTab.viewer) {
            return;
        }
        if (typeof currentTab.viewer.saveContentAs === 'function') {
            currentTab.viewer.saveContentAs();
        }
    }

    /**
     * Save all tabs
     */
    function saveAll() {
        // This is a guess manner, it's not 100% sure but it should work
        // Looking into the DOM if the tab is mark as edited,
        // If it is then save it
        var editedTabs = document.querySelectorAll('.tab.edit'),
            i, l,
            ids = [],
            tab;
        if (!editedTabs) {
            return;
        }

        // First of all build an array with all tab ids
        // To have a static reference of the tab to save
        for (i = 0, l = editedTabs.length; i < l; i += 1) {
            ids.push(editedTabs[i].id.replace(/^tab-/, ''));
        }

        // Call save on each tabs
        for (i = 0, l = ids.length; i < l; i += 1) {
            tab = tabs[ids[i]];
            if (!tab || !tab.viewer) {
                continue;
            }
            if (typeof tab.viewer.saveContent === 'function') {
                tab.viewer.saveContent();
            }
        }
    }


    (function initTabEvents() {
        var i, l,
            els = document.querySelectorAll('.tabs'),
            elsTabScrolls = document.querySelectorAll('.tabs-scroll'),
            scrollTimeout,
            resizeTimeout;

        /**
         * Event when clicking on tabs
         *
         * @param {Event} event
         */
        function onTabsClick(event) {
            var el = event.srcElement,
                paneEl,
                tabId,
                tab,
                pane,
                shouldClose = el.classList.contains('tab-close');

            // Click on child nodes
            if (el.parentNode.classList.contains('tab')) {
                el = el.parentNode;
            }

            if (el.classList.contains('tab')) {
                // Has click on the element to close the tab?
                if (shouldClose) {
                    ipc.send('workspace-close-tab', el.id.replace(/^(tab-)/, ''));
                    return;
                }

                tabId = el.id.replace(/^(tab-)/, '');
                paneEl = tabs.getPaneElementByTabId(tabId);
                if (!paneEl) {
                    return;
                }
                pane   = paneEl.id.replace(/(_pane)$/, '');
                tab = tabs[tabId];
                setActiveTab(tab, pane);
            }
        }

		/**
         * On context menu (right-click)
         * @param {Event} event
         */
        function onTabsRightClick(event) {
            var el = event.srcElement,
                paneEl,
                tabId,
                tab,
                pane;

            // Click on child nodes
            if (el.parentNode.classList.contains('tab')) {
                el = el.parentNode;
            }

            if (!el.classList.contains('tab')) {
                return;
            }

            tabId = el.id.replace(/^(tab-)/, '');
            paneEl = tabs.getPaneElementByTabId(tabId);
            if (!paneEl) {
                return;
            }
            pane   = paneEl.id.replace(/(_pane)$/, '');
            tab = tabs[tabId];
            showContextualMenu(tab, pane);
        }
      
		/**
         * Display the contextual menu on tab
         */
        function showContextualMenu(tab, pane) {
            var contextualMenu = new Menu();

            /* Close */
            contextualMenu.append(new MenuItem({
                label: 'Close',
                click: function onClickClose() {
                    ipc.send('workspace-close-tab', tab.id);
                }
            }));
            /* Close others */
            contextualMenu.append(new MenuItem({
                label: 'Close others',
                click: function onClickCloseOthers() {
                    console.warn('TODO::Close others');
                }
            }));
            /* Close all */
            contextualMenu.append(new MenuItem({
                label: 'Close all',
                click: function onClickCloseAll() {
                    console.warn('TODO::Close all');
                }
            }));
            /* Close unmodified */
            contextualMenu.append(new MenuItem({
                label: 'Close unmodified',
                click: function onClickCloseUnmodified() {
                    console.warn('TODO::Close unmodified');
                }
            }));

            contextualMenu.append(new MenuItem({type : 'separator'}));

             /* Move to other pane */
            contextualMenu.append(new MenuItem({
                label: 'Move to other pane',
                click: function onClickCloseMoveToOtherPane() {
                    ipc.send('workspace-move-tab', tab.id, (pane === 'main') ? 'second' : 'main');
                }
            }));

            /* Open file in the OS manner */
            if (/\.html?$/i.test(tab.path)) {
                contextualMenu.append(new MenuItem({type : 'separator'}));
                
                contextualMenu.append(new MenuItem({
                    label: 'Open in browser', 
                    click: function onClickOpen() {
                        shell.openItem(tab.path);
                    }
                }));
            }

            contextualMenu.popup(remote.getCurrentWindow());
        }
      
        /**
         * Event when mousedown on tabs
         *
         * @param {Event} event
         */
        function onTabsMousedown(event) {
            var el = event.srcElement,
                paneEl,
                tabId,
                tab,
                shouldClose = el.classList.contains('tab-close');

            // Has click on the element to close the tab?
            if (shouldClose) {
                return;
            }

            // Click on child nodes
            if (el.parentNode.classList.contains('tab')) {
                el = el.parentNode;
            }

            if (el.classList.contains('tab')) {

                tabId = el.id.replace(/^(tab-)/, '');
                paneEl = tabs.getPaneElementByTabId(tabId);
                if (!paneEl) {
                    return;
                }
                tab = tabs[tabId];

                paneEl.dragDetails = {
                    tab         : tab,
                    el          : el,
                    elWidth     : el.offsetWidth,
                    placeholder : paneEl.querySelector('.tab-placeholder'),
                    delta       : event.pageX - el.offsetLeft,
                    hasMoved    : false,
                    maxLeft     : paneEl.offsetWidth - (el.offsetWidth + 10)
                };
                paneEl.addEventListener('mousemove', onTabDrag);
                paneEl.addEventListener('mouseup', onTabStopDrag);
            }
        }
      
        /**
         * Drag a tab
         * @param event
         */
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

        /**
         * Stop drag event
         */
        function onTabStopDrag() {
            this.removeEventListener('mousemove', onTabDrag);
            this.removeEventListener('mouseup', onTabStopDrag);
            this.classList.remove('on-tab-dragging');

            var details = this.dragDetails;
            details.el.classList.remove('dragging');
            details.el.style.left = '';
            if (details.hasMoved) {
                details.placeholder.parentNode.insertBefore(details.el, details.placeholder);
            }
        }

        for (i = 0, l = els.length; i < l; i += 1) {
            els[i].addEventListener('click', onTabsClick);
			els[i].addEventListener('contextmenu', onTabsRightClick, false);
            els[i].addEventListener('mousedown', onTabsMousedown);
        }

        /**
         * Scrolling on tabs
         * @param event
         */
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

        for (i = 0, l = els.length; i < l; i += 1) {
            elsTabScrolls[i].addEventListener('mousedown', onTabsScroll);
        }

        /**
         * Event when the content of a tab has changed
         *
         * @param {CustomEvent} event
         */
        function onTabContentChange(event) {
            var tab         = event.detail.tab,
                isModified  = event.detail.isModified,
                tabEl       = document.getElementById('tab-' + tab.id);
            if (tabEl.classList.contains('edit') !== isModified) {
                if (isModified) {
                    tabEl.classList.add('edit');
                    ipc.send('workspace-edit-content', tab.id);
                } else {
                    tabEl.classList.remove('edit');
                    ipc.send('workspace-restore-content', tab.id);
                }
            }
        }

        document.body.addEventListener('tabcontentchange', onTabContentChange);
        
        /**
         * Event when the editor request the save
         *
         * @param {CustomEvent} event
         */
        function onTabContentSave(event) {
            var tab         = event.detail.tab,
                content     = event.detail.content;

            ipc.send('workspace-save-content', tab.id, content);
        }

        document.body.addEventListener('tabcontentsave', onTabContentSave);

        /**
         * Event when the editor request the save as
         *
         * @param {CustomEvent} event
         */
        function onTabContentSaveAs(event) {
            var tab         = event.detail.tab,
                content     = event.detail.content;

            ipc.send('workspace-save-content-as', tab.id, content);
        }

        document.body.addEventListener('tabcontentsaveas', onTabContentSaveAs);

        /**
         * Event when a tab is focused
         *
         * @param {CustomEvent} event
         */
        function onTabFocused(event) {
            var tab  = event.detail.tab,
                pane =  tabs.getPaneElementByTabId(tab.id);

            setActivePane(pane);

            ipc.send('workspace-set-current-tab', tab.id);
        }

        document.body.addEventListener('tabfocused', onTabFocused);

        /**
         * Resizing the window
         */
        function onResize() {
            fixRendering();
        }

        window.addEventListener('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(onResize, 100);
        });

    }());

    /* --- LISTEN EVENTS EMIT FROM THE SERVER SIDE CONTROLLER  --- */

    ipc.on('workspace-create-tab', function (err, tab, pane) {
        if (err) {
            console.warn(err);
            return;
        }
        addTab(tab, pane);
    });

    ipc.on('workspace-focus-tab', function (err, tab, pane) {
        if (err) {
            console.warn(err);
            return;
        }

        var el = document.getElementById('tab-' + tab.id);
        if (!el) { // The tab was closed
            addTab(tab, pane, true);
        } else {
            setActiveTab(tab, pane);
        }
    });

    ipc.on('workspace-create-and-focus-tab', function (err, tab, pane) {
        if (err) {
            console.warn(err);
            return;
        }
        addTab(tab, pane, true);
    });

    ipc.on('workspace-save-active-file', save);

    ipc.on('workspace-save-as-active-file', saveAs);

    ipc.on('workspace-save-all-files', saveAll);

    ipc.on('workspace-remove-tab', function (err, tab, pane) {
        if (err) {
            console.warn(err);
            return;
        }
        removeTab(tab, pane);
    });
    
    ipc.on('workspace-change-tab-location', function (err, tab, pane) {
        if (err) {
            console.warn(err);
            return;
        }
        moveTab(tab, pane);
    });

    ipc.on('workspace-update-tab', function (err, tab, pane) {
        if (err) {
            console.warn(err);
            return;
        }
        updateTab(tab, pane);
    });

    ipc.on('workspace-reload-tab', function (err, tab, pane) {
        if (err) {
            console.warn(err);
            return;
        }
        reloadTab(tab, pane);
    });

    ipc.send('workspace-ready');
});
