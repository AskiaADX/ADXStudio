/**
 * Modal Dialog Plugin
 */
(function (askia) {
    if (!askia || !askia.modalDialog) {
        throw new Error("NodalDialog.js is not loaded, please load it first");
    }

    var modalDialog     = askia.modalDialog;

    modalDialog.addPlugin('Keyboard-Shortcuts', {
        /**
         * Create form
         * @param  modalDialog
         */
        createButtons : function (modalDialog) {
            var dialogEl = modalDialog.elements.dialog;
            var options = modalDialog.options;
            var optApp  = options.app;


            // Add extra class on the dialog box
            dialogEl.classList.add("Keyboard-Shortcuts");

            dialogEl.innerHTML = [
                '<h1>Keyboard Shortcuts Summary</h1>',
                '<section class="main">',
                '<div class="left">',
                '<ul>',
                '<li><a href="#general">General</a></li>',
                '<li><a href="#workspaceSection">Workspace section</a></li>',
                '<li><a href="#explorerSection">Explorer section</a></li>',
                '<li><a href="#code">Code Editor</a></li>',
                '</ul>',
                '</div>',
                '<div class="right">',
                '<h2 id="general">General</h2>',
                '<p><span class="KBshortcut">Ctrl + R</span>:<span class="shortcutDescription"> Reload the application</span></p>',
                '<p><span class="KBshortcut">Ctrl + Shift + N</span>:<span class="shortcutDescription"> Create a new project</span></p>',
                '<p><span class="KBshortcut">Ctrl + N</span>:<span class="shortcutDescription"> Create a new file</span></p>',
                '<p><span class="KBshortcut">Ctrl + Shift + O</span>:<span class="shortcutDescription"> Open a project</span></p>',
                '<p><span class="KBshortcut">Ctrl + O</span>:<span class="shortcutDescription"> Open a file</span></p>',
                '<p><span class="KBshortcut">Ctrl + S</span>:<span class="shortcutDescription"> Save</span></p>',
                '<p><span class="KBshortcut">Ctrl + Shift + S</span>:<span class="shortcutDescription"> Save as ...</span></p>',
                '<p><span class="KBshortcut">F5</span>:<span class="shortcutDescription"> Open the preview</span></p>',
                '<p><span class="KBshortcut">Ctrl + Shift + T</span>:<span class="shortcutDescription"> Validate the ADC</span></p>',
                '<p><span class="KBshortcut">Ctrl + Shift + B</span>:<span class="shortcutDescription"> Build the ADC</span></p>',
                '<p><span class="KBshortcut">Ctrl + Alt + I</span>:<span class="shortcutDescription"> Open the developper tools of the main window</span></p>',
                '<p><span class="KBshortcut">Ctrl + Alt + E</span>:<span class="shortcutDescription"> Open the developper tools of the explorer</span></p>',
                '<p><span class="KBshortcut">Ctrl + Alt + W</span>:<span class="shortcutDescription"> Open the developper tools of the workspace</span></p>',
                '<h2 id="workspaceSection">Workspace section</h2>',
                '<p><span class="KBshortcut">Shift + Tab</span>:<span class="shortcutDescription"> Move to the next tab</span></p>',
                '<p><span class="KBshortcut">Shift + Ctrl + Tab</span>:<span class="shortcutDescription"> Move to the previous tab</span></p>',
                '<h2 id="explorerSection">Explorer section</h2>',
                '<p><span class="KBshortcut">&uarr;/&darr;</span>:<span class="shortcutDescription"> Navigate in the explorer</span></p>',
                '<p><span class="KBshortcut">+/-</span>:<span class="shortcutDescription"> Open/Close selected folder</span></p>',
                '<p><span class="KBshortcut">&crarr;</span>:<span class="shortcutDescription"> Open/Close selected folder or file</span></p>',
                '<p><span class="KBshortcut">Ctrl + Click</span>:<span class="shortcutDescription"> Select/Unselect folder or file in the explorer</span></p>',
                '<p><span class="KBshortcut">Shift + Click</span>:<span class="shortcutDescription"> Select all files and folders between the two chosen</span></p>',
                '<p><span class="KBshortcut">Ctrl + C</span>:<span class="shortcutDescription"> Copy</span></p>',
                '<p><span class="KBshortcut">Ctrl + X</span>:<span class="shortcutDescription"> Cut</span></p>',
                '<p><span class="KBshortcut">Ctrl + V</span>:<span class="shortcutDescription"> Paste</span></p>',
                '<p><span class="KBshortcut">F2</span>:<span class="shortcutDescription"> Rename the file or folder selected</span></p>',
                '<p><span class="KBshortcut">Del</span>:<span class="shortcutDescription"> Suppr the selection</span></p>',
                '<h2 id="code">Code Editor</h2>',
                '<p><span class="KBshortcut">Ctrl + F</span>:<span class="shortcutDescription"> Search in the current page. If something is selected, it will be the value of the search</span></p>',
                '<p><span class="KBshortcut">Ctrl + Shift + F</span>:<span class="shortcutDescription"> Replace occurences of a word</span></p>',
                '<p><span class="KBshortcut">Ctrl + Click</span>:<span class="shortcutDescription"> Add cursor to the clicked location</span></p>',
                '<p><span class="KBshortcut">Esc</span>:<span class="shortcutDescription"> When multiple cursors are present, this delete all cursor except the last one</span></p>',
                '<p><span class="KBshortcut">Ctrl + C</span>:<span class="shortcutDescription"> Copy</span></p>',
                '<p><span class="KBshortcut">Ctrl + X</span>:<span class="shortcutDescription"> Cut</span></p>',
                '<p><span class="KBshortcut">Ctrl + V</span>:<span class="shortcutDescription"> Paste</span></p>',
                '<p><span class="KBshortcut">Ctrl + End</span>:<span class="shortcutDescription"> Go to the end of the page</span></p>',
                '<p><span class="KBshortcut">Ctrl + Home</span>:<span class="shortcutDescription"> Go to the begginning of the page</span></p>',
                '<p><span class="KBshortcut">Ctrl + U/Z</span>:<span class="shortcutDescription"> Undo</span></p>',
                '<p><span class="KBshortcut">Ctrl + Y</span>:<span class="shortcutDescription"> Redo</span></p>',
                '<p><span class="KBshortcut">Shitf + tab</span>:<span class="shortcutDescription"> Auto indent selected lines, or current line if nothing is selected</span></p>',
                '<p><span class="KBshortcut">Ctrl + A</span>:<span class="shortcutDescription"> Select all</span></p>',
                '<p><span class="KBshortcut">Ctrl + Shift + -</span>:<span class="shortcutDescription"> Collapse all</span></p>',
                '<p><span class="KBshortcut">Ctrl + Shift + +</span>:<span class="shortcutDescription"> Expand all</span></p>',
                '<p><span class="KBshortcut">Ctrl + -</span>:<span class="shortcutDescription"> Collapse curent line</span></p>',
                '<p><span class="KBshortcut">Ctrl + +</span>:<span class="shortcutDescription"> Expand curent line</span></p>',
                '<p><span class="KBshortcut">Ctrl + D</span>:<span class="shortcutDescription"> Delete current line</span></p>',
                '</div>',
                '</section>'
            ].join("");
        },
        beforeDisplay : function (modalDialog) {
            // Remove extra elements before to display
            var el = modalDialog.elements;
            el.dialog.removeChild(el.buttonsContainer);
        },
        listen : function (modalDialog) {
            var el = modalDialog.elements;
            el.wrapper.addEventListener('click', function (event) {
                if (event.srcElement !== el.wrapper) {
                    return;
                }
                modalDialog.close();
            });
        }

    });

}(window.askia));
