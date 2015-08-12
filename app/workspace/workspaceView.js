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
     * @param {Tab} tab Tab coming from the main process
     */
    updateTab       : function updateTab(tab) {
        var viewTab = this[tab.id]; // Tab in the view

        tab.previousSelection = viewTab.previousSelection;
        if (tab.previousSelection) {
            tab.previousSelection.nextSelection  = tab;
        }
        tab.previous = viewTab.previous;
        if (tab.previous) {
            tab.previous.next = tab;
        }
        tab.nextSelection = viewTab.nextSelection;
        if (tab.nextSelection) {
            tab.nextSelection.previousSelection = tab;
        }
        tab.next = viewTab.next;
        if (tab.next) {
            tab.next.previous = tab;
        }

        this[tab.id] = tab;
        this.dispatchEvent('tabcontentchange', tab.id, tab.content);
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
        if (tab.id === this.currentTabId && tab.editor) {
            tab.editor.focus && tab.editor.focus();
        }
    },

    /**
     * Helper function to dispatch event
     *
     * @param {String} eventName Name of the event
     * @param {String} tabId Id of the tab taht initiate the event
     * @param {String} content Content of the tab
     */
    dispatchEvent  : function dispatchEvent(eventName, tabId, content) {
        var tab = this[tabId];
        if (!tab) {
            return;
        }

        var event = new CustomEvent(eventName, {
            'detail': {
                'tab'     : tab,
                'content' : content,
                'isModified' : (tab.content !== content)
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

    onFocus : function onFocus(tabId) {
        var paneEl = this.getPaneElementByTabId(tabId),
            oldActive = document.querySelector('.pane.focused');
        if (!paneEl || oldActive === paneEl) {
            return;
        }

        oldActive.classList.remove('focused');
        paneEl.classList.add('focused');
    },

    /**
     * Event fire when the content of the editor has changed
     *
     * @param {String} tabId Id of the tab
     * @param {String} content Current content in the editor
     */
    onContentChange : function onContentChange(tabId, content) {
        this.dispatchEvent('tabcontentchange', tabId, content);
    },

    /**
     * Event fire when the editor request a save
     *
     * @param {String} tabId Id of the tab
     * @param {String} content Current content in the editor
     */
    onSave       : function onSave(tabId, content) {
        this.dispatchEvent('tabcontentsave', tabId, content);
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
        if (currentEditor) {
            currentEditor.focus && currentEditor.focus();
        }
    }
};


document.addEventListener('DOMContentLoaded', function () {

    var ipc  = require('ipc'),
        tabs = window.tabs,
        resizer = new adx.Resizer({
            element : document.getElementById('main_pane')
        });

    resizer.start();

     /**
      * Add a tab
      *
      * @param {Tab} tab Tab object
      * @param {String} pane Name of the pane
      * @param {Boolean} [isActive=false] Activate the tab after his creation
      */
    function addTab(tab, pane, isActive) {
         // Create the tab
         var tabEl = document.createElement('li');
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
         contentEl.setAttribute('id', 'content-' + tab.id);

         var div = document.createElement('div');
         var viewerSubFolderName = 'codemirror';
         if (tab.adcConfig) {
             viewerSubFolderName = 'adcconf';
         } else if (tab.fileType === 'image') {
             viewerSubFolderName = 'image';
         }


         var viewer = document.createElement('iframe');
         viewer.setAttribute('frameborder', 'no');
         viewer.setAttribute('scrolling', 'no');
         tabs.addTab(tab);
         viewer.src = '../viewers/' + viewerSubFolderName + '/viewer.html?tabId=' + tab.id;
         div.appendChild(viewer);
         // While waiting the iframe load, hide the content to avoid the white flash
         div.style.visibility = "hidden";

         contentEl.appendChild(div);

         var paneEl = document.getElementById(pane + '_pane');

         paneEl.querySelector('.tabs').insertBefore(tabEl, paneEl.querySelector('.tab-end'));
         paneEl.querySelector('.tabs-content').appendChild(contentEl);

         if (isActive) {
             setActiveTab(tab, pane);
         }
    }

    /**
     * Set active tab
     *
     * @param {Tab} tab Tab to active
     * @param {String} pane Name of the pane where the tab is located
     */
    function setActiveTab(tab, pane) {
        var paneEl          = document.getElementById(pane + '_pane'),
            el              = document.getElementById('tab-' + tab.id),
            content         = document.getElementById('content-' + tab.id),
            oldPane         = document.querySelector('.pane.focused'),
            oldActiveTab    = document.getElementById(pane + '_pane').querySelector('.tab.active'),
            oldContent      = oldActiveTab && document.getElementById(oldActiveTab.id.replace(/^tab-/, "content-"));

        if (oldPane && oldPane !== paneEl) {
            oldPane.classList.remove('focused');
        }
        paneEl.classList.add('focused');

        if (el === oldActiveTab) {
            return;
        }

        if (oldActiveTab) {
            oldActiveTab.classList.remove('active');
            oldContent.classList.remove('active');
        }
        el.classList.add('active');
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
     * Remove a tab
     *
     * @param {Tab} tab Tab object to remove
     * @param {String} pane Name of the pane where the tab is locased
     */
    function removeTab(tab, pane) {
        var el              = document.getElementById('tab-' + tab.id),
            contentEl       = document.getElementById('content-' + tab.id),
            tabToSelect     = null,
            currentTab      = tabs[tab.id];



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
            setActiveTab(tabToSelect, pane);
        }
    }



    (function initTabEvents() {
        var i, l,
            els = document.querySelectorAll('.tabs');

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
         * Event when the content of a tab has changed
         *
         * @param {CustomEvent} event
         */
        function onTabContentChange(event) {
            var tab         = event.detail.tab,
                isModified  = event.detail.isModified,
                tabEl       = document.getElementById('tab-' + tab.id),
                tabTextEl   = tabEl.querySelector('.tab-text');
            if (tabEl.classList.contains('edit') !== isModified) {
                if (isModified) {
                    tabEl.classList.add('edit');
                } else {
                    tabEl.classList.remove('edit');
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

        for (i = 0, l = els.length; i < l; i += 1) {
            els[i].addEventListener('click', onTabsClick);
        }
    } ());


    /* --- LISTEN EVENTS EMIT FROM THE SERVER SIDE CONTROLLER  --- */

    ipc.on('workspace-create-tab', function (err, tab, pane) {
        if (err) {
            alert(err.message);
            return;
        }
        addTab(tab, pane);
    });

    ipc.on('workspace-focus-tab', function (err, tab, pane) {
        if (err) {
            alert(err.message);
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
           alert(err.message);
           return;
        }
        addTab(tab, pane, true);
    });

    ipc.on('workspace-remove-tab', function (err, tab, pane) {
        if (err) {
            alert(err.message);
            return;
        }
       removeTab(tab, pane);
    });

    ipc.on('workspace-update-tab', function (err, tab, pane) {
        if (err) {
            console.log(err);
            alert(err.message);
            return;
        }
        updateTab(tab, pane);
    });

    ipc.send('workspace-ready');
});
