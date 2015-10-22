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
         * Save content
         * Should be implemented by the viewer
         */
        saveContent : function () {/* Function that should be implemented in the viewer */},
        /**
         * Fire loaded event
         */
        fireReady : function fireReady() {
            tabs.onEditorLoaded(tab);
        }
    };

    return tab.viewer;
}());
