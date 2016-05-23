(function () {
    document.addEventListener("DOMContentLoaded", function () {
        var matchTabId  =  /\?tabid=([^&]+)/gi.exec(window.location.href);
        if (!matchTabId || !matchTabId.length) {
            throw new Error("Invalid context, the tab id is not defined");
        }
        var isAltFrame = /&altFrame=1/gi.test(window.location.href);
        var tabId     = matchTabId[1];
        var parent    = window.parent;
        var workspace = parent.workspace;
        var tab       = workspace.findTab(tabId);

        tab.ready();
    });
}());
