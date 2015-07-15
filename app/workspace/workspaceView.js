window.tabs  = {
    /**
     * Id of the current active tan
     */
    currentTabId : null,
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
        this.currentTabId = tabId;
        var currentTab    = this[tabId];
        var currentEditor = currentTab && currentTab.editor;

        if (currentEditor) {
            currentEditor.focus && currentEditor.focus();
        }
    }
};


document.addEventListener('DOMContentLoaded', function () {
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
        window.tabs[tab.id] = tab;
        editor.src = '../editor/codemirror/editor.html?tabId=' + tab.id;
        div.appendChild(editor);

        contentEl.appendChild(div);

        var paneEl    = document.getElementById(pane + '_pane');

        paneEl.querySelector('.tabs').insertBefore(tabEl, paneEl.querySelector('.tab-end'));
        paneEl.querySelector('.tabs-content').appendChild(contentEl);

        if (isActive) {
            setActiveTab(tabEl, paneEl);
        }
    }

    (function initTabEvents() {
        var i, l,
            els = document.querySelectorAll('.tabs');
        for (i = 0, l = els.length; i < l; i += 1) {
            els[i].addEventListener('click', function (event) {
                var el = event.srcElement, paneEl, pane;
                var shouldClose = el.classList.contains('tab-close');

                // Click on child nodes
                if (el.parentNode.classList.contains('tab')) {
                    el = el.parentNode;
                }

                if (el.classList.contains('tab')) {
                    // Has click on the element to close the tab?
                    if (shouldClose) {
                      removeTab(el);
                      return;
                    }

                    if (el.classList.contains('active')) {
                        return;
                    }

                    paneEl = el.parentNode;
                    while(!paneEl.classList.contains('pane') && paneEl.tagName !== 'body') {
                        paneEl = paneEl.parentNode;
                    }

                    if (paneEl.classList.contains('pane')) {
                        setActiveTab(el, paneEl);
                    }
                }
            });
        }
    } ());

    ipc.on('workspace-create-and-focus-tab', function (err, tab, pane) {
        if (err) {
           alert(err.message);
           return;
        }
        addTab(tab, pane, true);
    });

    ipc.on('workspace-create', function (err, tab, pane) {
        if (err) {
            alert(err.message);
            return;
        }
        addTab(tab, pane);
    });


    ipc.send('workspace-ready');
});
