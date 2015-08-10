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
    return {
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
         * Fire loaded event
         */
        fireReady : function () {
            tabs.onEditorLoaded(tab);
        }
    };
}());
