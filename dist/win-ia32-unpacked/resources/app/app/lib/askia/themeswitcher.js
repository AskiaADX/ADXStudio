(function () {
  const ipc = require('electron').ipcRenderer;

  // First try to find it in the URL
  const initialTheme = window.localStorage['adxstudio-initial-theme'] || 'default';

  window.localStorage['adxstudio-initial-theme'] = initialTheme;

  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.href = '../themes/' + initialTheme + '/application.css';

  document.head.appendChild(link);

  window.askia = window.askia || {};
  window.askia.initialTheme = initialTheme;

  function changeTheme (event, themeName) {
    link.href = '../themes/' + themeName + '/application.css';
    if (typeof window.askia.onSwitchTheme === 'function') {
      window.askia.onSwitchTheme(themeName);
    }
  }

  ipc.on('switch-theme', changeTheme);
})();