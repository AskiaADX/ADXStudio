(function() {
    var ipc = require('electron').ipcRenderer;

    // First try to find it in the URL
    var matchTheme = /\?theme=([^&]*)/gi.exec(window.location.href);
    var initialTheme = null;
    if (matchTheme && matchTheme.length > 1) {
        initialTheme = matchTheme[1];
    }
    
    // If doesn't found, try to search it in the localStorage
    if (!initialTheme) {
        initialTheme = window.localStorage['adxstudio-initial-theme'] || 'default';
    }
    
    window.localStorage['adxstudio-initial-theme'] = initialTheme;
    
    var link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css"); 
    link.href = "../themes/" + initialTheme + "/application.css";
    
    document.head.appendChild(link);
    
    window.askia = window.askia || {};
    window.askia.initialTheme = initialTheme;
    
    function changeTheme(event, themeName) {
        link.href = "../themes/" + themeName + "/application.css";
        if (typeof window.askia.onSwitchTheme === 'function') {
            window.askia.onSwitchTheme(themeName);
        }
    }
    
    ipc.on('switch-theme', changeTheme);
})();