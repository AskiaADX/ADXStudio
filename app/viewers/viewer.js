(function () {
    var matchTabId  =  /\?tabid=([^&]+)/gi.exec(window.location.href);
    if (!matchTabId || !matchTabId.length) {
        throw new Error("Invalid context, the tab id is not defined");
    }
    var isAltFrame 		= /&altFrame=1/gi.test(window.location.href);
    var tabId    		= matchTabId[1];
    var parent   		= window.parent;
    var workspaceView	= parent.workspace;
    var tab				= workspaceView.findTab(tabId);

    tab.window = window;

    // Add the CSS of theme
    var link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css"); 
    link.href = "../../themes/" + workspaceView.theme + "/application.css";

    document.head.appendChild(link);

    window.addEventListener('focus', function () {
        workspaceView.setActiveTab(tabId);
    });

    var viewer = {
        /**
         * Parent window
         */
        parent : parent,
        /**
         * workspaceView object in parent window
         */
        workspaceView : workspaceView,
        /**
         * Current tab
         */
        currentTab  : tab,
        /**
         * When we switch the theme of the interface, propagate events on all workspaceView
         * @param {String} theme Name of the theme
         */
        switchTheme : function onSwitchTheme(theme) {
            link.href = '../../themes/' + theme + '/application.css';
        },
        /**
         * Change font size
         * Should be implemented by the viewer
         */
        changeFontSize: function onChangeFontSize(size) {/* Function that should be implemented in the viewer */},
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
         * Request the list of file in the ADX resources directory
         * @param {Function} callback With the structure of the file in args
         */
        getADXStructure : function (callback) {
            var ipc = workspaceView.ipc;
            if (tab.previousADXStructCb) {
                ipc.removeListener('workspace-update-adx-structure', tab.previousADXStructCb);

            }
            tab.previousADXStructCb = function (event, err, tabId, structure) {
                callback(structure);
            };
            ipc.on('workspace-update-adx-structure', tab.previousADXStructCb);
            ipc.send('workspace-get-adx-structure', tab.id);
        },
        /**
         * Fire loaded event
         */
        fireReady : function fireReady() {
            workspaceView.onEditorLoaded(tab);
        }
    };

    if (!isAltFrame) {
        tab.window = window;
        tab.viewer = viewer;
    } else {
        tab.altWindow = window;
        tab.altViewer = viewer;
    }

    window.viewer = viewer;
}());
