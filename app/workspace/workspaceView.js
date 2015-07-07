document.addEventListener('DOMContentLoaded', function () {
    var ipc = require('ipc');

    /**
     * Set active tab
     * @param {HTMLElement} el HTML Element that represent the tab
     * @paran {HTMLElement} pane HTML Element that represent the pane
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
        var pre = document.createElement('pre');
        pre.innerText = tab.content;
        div.appendChild(pre);
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

                // Click on child nodes
                if (el.parentNode.classList.contains('tab')) {
                    el = el.parentNode;
                }


                if (el.classList.contains('tab')) {
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


    /*addTab({
        id : 'test1',
        name : 'test1',
        content : 'Hello\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nworld!'
    }, 'main', true);*/
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