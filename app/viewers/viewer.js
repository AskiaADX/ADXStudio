var viewer = (function () {
    var matchTabId  =  /\?tabid=([^&]+)/gi.exec(window.location.href);
    if (!matchTabId || !matchTabId.length) {
        throw new Error("Invalid context, the tab id is not defined");
    }
    var tabId    = matchTabId[1];
    var parent   = window.parent;
    var tabs     = parent.tabs;
    var tab      = tabs[tabId];

    tab.window = window;

    // Add the CSS of theme
    var link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css"); 
    link.href = "../../themes/" + tabs.theme + "/application.css";
    
    document.head.appendChild(link);
    
    window.addEventListener('focus', function () {
        tabs.onFocus(tab.id);
    });

    tab.viewer = {
        /**
         * Parent window
         */
        parent : parent,
        /**
         * tabs object in parent window
         */
        tabs : tabs,
        /**
         * Current tab
         */
        currentTab  : tab,
         /**
         * When we switch the theme of the interface, propagate events on all tabs
         * @param {String} theme Name of the theme
         */
        switchTheme : function onSwitchTheme(theme) {
            link.href = '../../themes/' + theme + '/application.css';
        },
        /**
         * Save content
         * Should be implemented by the viewer
         */
        saveContent : function () {/* Function that should be implemented in the viewer */},
        /**
         * Save content as
         * Should be implemented by the viewer
         */
        saveContentAs : function () {/* Function that should be implemented in the viewer */},
        /**
         * Save content and close the tab
         * Should be implemented by the viewer
         */
        saveContentAndClose : function () {/* Function that should be implemented in the viewer */},
        /**
         * Request the list of file in the ADC resources directory
         * @param {Function} callback With the structure of the file in args
         */
        getADCStructure : function (callback) {
            var ipc = tabs.ipc;
            if (tab.previousADCStructCb) {
                ipc.removeListener('workspace-update-adc-structure', tab.previousADCStructCb);
            }
            tab.previousADCStructCb = function (event, err, tabId, structure) {
                callback(structure);
            };
            ipc.on('workspace-update-adc-structure', tab.previousADCStructCb);
            ipc.send('workspace-get-adc-structure', tab.id);
        },
        /**
         * Fire loaded event
         */
        fireReady : function fireReady() {
            tabs.onEditorLoaded(tab);
        }
    };

    return tab.viewer;
}());
