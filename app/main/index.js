(function () {
    var ipc = require('ipc'),
        shell = require('shell'),
        exp = document.getElementById("explorer"),
        wks = document.getElementById("workspace"),
        askia = window.askia,
        countDownReadyWebView = 2; // 2 web-views must be loaded

    /**
     * Look how many web-views are loaded and fire the ready event when all are ready
     */
    function onWebViewLoaded() {
        countDownReadyWebView--;
        if (!countDownReadyWebView) {
            // Resizer between the explorer element and the workspace
            var resExpl = new askia.Resizer({
                element  : document.getElementById('panel_explorer'),
                direction: 'horizontal'
            });

            resExpl.start();
        }
        ipc.send('main-ready');
    }

    // Dev tools of the webview
    exp.addEventListener("dom-ready", function () {
        onWebViewLoaded();
        // exp.openDevTools();
    });
    wks.addEventListener("dom-ready", function () {
        onWebViewLoaded();
        wks.openDevTools();
    });

    /**
     * Show modal dialog from webview
     */
    exp.addEventListener('ipc-message', function (event) {
        if (event.channel === 'show-modal-dialog') {
            askia.modalDialog.show(event.args[0], function(result) {
                if (result.button === 'ok' || result.button === 'yes') {
                    var args = event.args.splice(1, event.args.length); // Remove the first arg
                    if (result.value) {
                        args.push(result.value);
                    }
                    ipc.send.apply(ipc, args);
                }
            });
        }

    });


    /**
     * Show modal dialog from the controller
     */
    ipc.on('show-modal-dialog', function (options, callbackEventName) {
        var args = Array.prototype.slice.call(arguments, 1, arguments.length); // Remove the first args
        askia.modalDialog.show(options, function(result) {
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
    ipc.on('close-modal-dialog', function () {
        askia.modalDialog.close();
    });


    document.addEventListener('DOMContentLoaded', function manageStatus() {
        var statusEl = document.getElementById('panel_status'),
            outEl = document.getElementById("panel_output"),
            resizerStatus = new askia.Resizer({
                element  : statusEl,
                direction: 'vertical',
                revert  : true
            }),
            currentTab;

        /**
         * Open the status bar
         */
        function openStatusBar(id) {
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
        function closeStatusBar() {
            if (currentTab) {
                document.getElementById(currentTab).classList.remove('selected');
                currentTab = null;
            }
            statusEl.classList.remove('opened');
            resizerStatus.stop();
        }

        statusEl.querySelector('.close').addEventListener('click', function onClickOnClose() {
            closeStatusBar();
        });

        outEl.addEventListener('click', function onClickIOnOutput(event) {
            var el = event.srcElement;
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
        ipc.on("output-write", function (text, type) {
            openStatusBar("panel_output"); // Make sure it's open

            var el = document.createElement("p");
            var rg = /(file:\/\/\/[^\s\r\n]+)/gi;
            el.innerText = text;
            el.innerHTML = el.innerText.replace(rg, '<a href="$1" class="open-file-in-folder">$1</a>');
            el.className = type;
            outEl.appendChild(el);
            // Scroll at the end
            var sep = document.createElement("div");
            // sep.innerText = 'SEP';
            outEl.appendChild(sep);
            sep.scrollIntoView();
        });

        /**
         * Clear the output
         */
        ipc.on("output-clear", function () {
            outEl.innerHTML = '';
        });

        /**
         * Close the status bar
         */
        ipc.on("output-close", function () {
           closeStatusBar();
        });
    });

}());
