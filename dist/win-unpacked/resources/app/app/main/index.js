(function () {
  const electron = require('electron');
  const ipc = electron.ipcRenderer;
  const shell = electron.shell;
  const exp = document.getElementById('explorer');
  const wks = document.getElementById('workspace');
  const askia = window.askia;
  let countDownReadyWebView = 2; // 2 web-views must be loaded


  /**
   * Look how many web-views are loaded and fire the ready event when all are ready
   */
  function onWebViewLoaded () {
    countDownReadyWebView--;
    if (!countDownReadyWebView) {
      // Resizer between the explorer element and the workspace
      let resExpl = new askia.Resizer({
        element: document.getElementById('panel_explorer'),
        direction: 'horizontal'
      });

      resExpl.start();
      ipc.send('main-ready');
    }
  }

  // Dev tools of the webview
  exp.addEventListener('dom-ready', function onExplorerDomReady () {
    onWebViewLoaded();
  });
  wks.addEventListener('dom-ready', function onWorkspaceDomReady () {
    onWebViewLoaded();
  });

  /**
   * Show modal dialog from webview
   */
  exp.addEventListener('ipc-message', function listenExplorerMessage (event) {
    if (event.channel === 'show-modal-dialog') {
      askia.modalDialog.show(event.args[0], function (result) {
        if (result.button === 'ok' || result.button === 'yes') {
          let args = event.args.splice(1, event.args.length); // Remove the first arg
          if (result.value) {
            args.push(result.value);
          }
          ipc.send.apply(ipc, args);
        }
      });
    }
  });

  /**
   * Set the focus on the workspace by default
   */
  ipc.on('application-focus', function () {
    wks.focus();
  });


  /**
   * Show modal dialog from the controller
   */
  ipc.on('show-modal-dialog', function showModalDialog (event, options) {
    let args = Array.prototype.slice.call(arguments, 2, arguments.length); // Remove the first args
    askia.modalDialog.show(options, function (result) {
      args.push(result.button);
      if (result.value) {
        args.push(result.value);
      }
      ipc.send.apply(ipc, args);
    });
  });

  /**
   * Close the modal dialog from the controller
   */
  ipc.on('close-modal-dialog', function closeModalDialog () {
    askia.modalDialog.close();
  });

  /**
   * Toggle the dev tools on the specified view
   * @param event
   * @param {String} view View to toggle
   */
  ipc.on('toggle-dev-tools', function toggleDevTools (event, view) {
    switch (view) {
    case 'explorer':
      if (exp.isDevToolsOpened()) {
        exp.closeDevTools();
      } else {
        exp.openDevTools();
      }
      break;
    case 'workspace':
      if (wks.isDevToolsOpened()) {
        wks.closeDevTools();
      } else {
        wks.openDevTools();
      }
      break;
    }
  });


  document.addEventListener('DOMContentLoaded', function manageStatus () {
    const statusEl = document.getElementById('panel_status');
    const outEl = document.getElementById('panel_output');
    const resizerStatus = new askia.Resizer({
      element: statusEl,
      direction: 'vertical',
      revert: true
    });
    let currentTab;

    /**
     * Open the status bar
     */
    function openStatusBar (id) {
      if (currentTab !== id) {
        if (currentTab) {
          document.getElementById(currentTab).classList.remove('selected');
          currentTab = null;
        }
        if (id) {
          document.getElementById(id).classList.add('selected');
          currentTab = id;
        }
      }
      statusEl.classList.add('opened');
      resizerStatus.start();
    }

    /**
     * Close the status bar
     */
    function closeStatusBar () {
      if (currentTab) {
        document.getElementById(currentTab).classList.remove('selected');
        currentTab = null;
      }
      statusEl.classList.remove('opened');
      resizerStatus.stop();
    }

    statusEl.querySelector('.close').addEventListener('click', function onClickOnClose () {
      closeStatusBar();
    });

    outEl.addEventListener('click', function onClickIOnOutput (event) {
      let el = event.srcElement;
      if (el.classList.contains('open-file-in-folder')) {
        event.stopPropagation();
        event.preventDefault();
        shell.showItemInFolder(el.getAttribute('href'));
      }
    });

    /**
     * Write in the output
     * @param {String} text Text to write
     */
    ipc.on('output-write', function (event, text) {
      openStatusBar('panel_output'); // Make sure it's open

      //let el = document.createElement("div");
      let rg = /(file:\/\/\/[^\s\r\n]+)/gi;
      text = text.replace(rg, '<a href="$1" class="open-file-in-folder">$1</a>');
      outEl.insertAdjacentHTML('beforeend', text);
      // outEl.appendChild(el);
      // Scroll at the end
      let sep = document.createElement('div');
      // sep.innerText = 'SEP';
      outEl.appendChild(sep);
      sep.scrollIntoView();
    });

    /**
     * Clear the output
     */
    ipc.on('output-clear', function () {
      outEl.innerHTML = '';
    });

    /**
     * Close the status bar
     */
    ipc.on('output-close', function () {
      closeStatusBar();
    });
  });

}());
