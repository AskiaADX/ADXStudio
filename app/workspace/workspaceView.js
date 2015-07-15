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
    addTab       : function (tab) {
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
     * Remove the tab in the collection
     *
     * @param {Tab} tab Tab to remove
     */
    removeTab       : function (tab) {
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
    onEditorLoaded : function (tab) {
        if (tab.id === this.currentTabId && tab.editor) {
            tab.editor.focus && tab.editor.focus();
        }
    },

    /**
     * Set the current tab and focus the editor
     * @param {String} tabId Id of the current tab
     */
    setCurrentTab : function (tabId) {
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
<<<<<<< HEAD
    var ipc = require('ipc');

    /**
     * Set active tab
     * @param {HTMLElement} el HTML Element that represent the tab
     * @param {HTMLElement} pane HTML Element that represent the pane
     */
    function setActiveTab(el, paneEl) {
        var tabId           = el.id.replace(/^(tab-)/, ''),
            content         = document.getElementById('content-' + tabId),
            oldActiveTab    = paneEl.querySelector('.tab.active'),
            oldContent      = oldActiveTab && document.getElementById(oldActiveTab.id.replace(/^tab-/, "content-"));

        if (el === oldActiveTab) {
            return;
        }

        if (oldActiveTab) {
            oldActiveTab.classList.remove('active');
            oldContent.classList.remove('active');
        }
        el.classList.add('active');
        content.classList.add('active');
        window.tabs.setCurrentTab(tabId);
    }

    /**
     * Remove a tab
     * @param {HTMLElement} el HTML Element that represent the tab
     */
     function removeTab(el) {

       var tabId = el.id.replace(/^(tab-)/, '');
       var tabContainer = el.parentNode;
       var contentEl = document.getElementById('content-' + tabId);
       var contentContainer = contentEl.parentNode;

       tabContainer.removeChild(el);
       contentContainer.removeChild(contentEl);
     }
=======
    var ipc = require('ipc'),
        tabs = window.tabs;
>>>>>>> 171c33d27b1c448a0e867b6a170fe5460a581203

     /**
      * Add a tab
      *
      * @param {Tab} tab Tab object
      * @param {String} pane Name of the pane
      * @param {Boolean} [isActive=false] Activate the tab after his creation
      */
    function addTab(tab, pane, isActive) {
        // Create the tab
        var tabEl     = document.createElement('li');
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
        var editor = document.createElement('iframe');
        editor.setAttribute('frameborder', 'no');
        editor.setAttribute('scrolling', 'no');
        tabs.addTab(tab);
        editor.src = '../editor/codemirror/editor.html?tabId=' + tab.id;
        div.appendChild(editor);

        contentEl.appendChild(div);

        var paneEl    = document.getElementById(pane + '_pane');

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
        var el              = document.getElementById('tab-' + tab.id),
            content         = document.getElementById('content-' + tab.id),
            oldActiveTab    = document.getElementById(pane + '_pane').querySelector('.tab.active'),
            oldContent      = oldActiveTab && document.getElementById(oldActiveTab.id.replace(/^tab-/, "content-"));

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
        for (i = 0, l = els.length; i < l; i += 1) {
            els[i].addEventListener('click', function (event) {
                var el = event.srcElement,
                    paneEl,
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

                    if (el.classList.contains('active')) {
                        return;
                    }

                    paneEl = el.parentNode;
                    while(!paneEl.classList.contains('pane') && paneEl.tagName !== 'body') {
                        paneEl = paneEl.parentNode;
                    }
                    pane = paneEl.id.replace(/(_pane)$/, '');

                    if (paneEl.classList.contains('pane')) {
                        tab = tabs[el.id.replace(/^(tab-)/, '')];
                        setActiveTab(tab, pane);
                    }
                }
            });
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

    ipc.on('workspace-remote-tab', function (err, tab, pane) {
        if (err) {
            alert(err.message);
            return;
        }
       removeTab(tab, pane);
    });

    ipc.send('workspace-ready');
});
