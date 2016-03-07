0/**
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
                '<dl>',
                '<dt>Ctrl + R</dt>',
                '<dd>Reload the application</dd>',
                '<dt>Ctrl + Shift + N</dt>',
                '<dd>Create a new project</dd>',
                '<dt>Ctrl + N</dt>',
                '<dd>Create a new file</dd>',
                '<dt>Ctrl + Shift + O</dt>',
                '<dd>Open a project</dd>',
                '<dt>Ctrl + O</dt>',
                '<dd>Open a file</dd>',
                '<dt>Ctrl + S</dt>',
                '<dd>Save</dd>',
                '<dt>Ctrl + Shift + S</dt>',
                '<dd>Save as ...</dd>',
                '<dt>F5</dt>',
                '<dd>Open the preview</dd>',
                '<dt>Ctrl + Shift + T</dt>',
                '<dd>Validate the ADC</dd>',
                '<dt>Ctrl + Shift + B</dt>',
                '<dd>Build the ADC</dd>',
                '<dt>Ctrl + Alt + I</dt>',
                '<dd>Open the developper tools of the main window</dd>',
                '<dt>Ctrl + Alt + E</dt>',
                '<dd>Open the developper tools of the explorer</dd>',
                '<dt>Ctrl + Alt + W</dt>',
                '<dd>Open the developper tools of the workspace</dd>',
                '</dl>',
                '<h2 id="workspaceSection">Workspace section</h2>',
                '<dl>',
                '<dt>Shift + Tab</dt>',
                '<dd>Move to the next tab</dd>',
                '<dt>Shift + Ctrl + Tab</dt>',
                '<dd>Move to the previous tab</dd>',
                '</dl>',
                '<h2 id="explorerSection">Explorer section</h2>',
                '<dl>',
                '<dt>&uarr;/&darr;</dt>',
                '<dd>Navigate in the explorer</dd>',
                '<dt>+/-</dt>',
                '<dd>Open/Close selected folder</dd>',
                '<dt>&crarr;</dt>',
                '<dd>Open/Close selected folder or file</dd>',
                '<dt>Ctrl + Click</dt>',
                '<dd>Select/Unselect folder or file in the explorer</dd>',
                '<dt>Shift + Click</dt>',
                '<dd>Select all files and folders between the two chosen</dd>',
                '<dt>Ctrl + C</dt>',
                '<dd>Copy</dd>',
                '<dt>Ctrl + X</dt>',
                '<dd>Cut</dd>',
                '<dt>Ctrl + V</dt>',
                '<dd>Paste</dd>',
                '<dt>F2</dt>',
                '<dd>Rename the file or folder selected</dd>',
                '<dt>Del</dt>',
                '<dd>Suppr the selection</dd>',
                '</dl>',
                '<h2 id="code">Code Editor</h2>',
                '<dl>',
                '<dt>Ctrl + F</dt>',
                '<dd>Search in the current page. If something is selected, it will be the value of the search</dd>',
                '<dt>Ctrl + Shift + F</dt>',
                '<dd>Replace occurences of a word</dd>',
                '<dt>Ctrl + Click</dt>',
                '<dd>Add cursor to the clicked location</dd>',
                '<dt>Esc</dt>',
                '<dd>When multiple cursors are present, this delete all cursor except the last one</dd>',
                '<dt>Ctrl + C</dt>',
                '<dd>Copy</dd>',
                '<dt>Ctrl + X</dt>',
                '<dd>Cut</dd>',
                '<dt>Ctrl + V</dt>',
                '<dd>Paste</dd>',
                '<dt>Ctrl + End</dt>',
                '<dd>Go to the end of the page</dd>',
                '<dt>Ctrl + Home</dt>',
                '<dd>Go to the begginning of the page</dd>',
                '<dt>Ctrl + U/Z</dt>',
                '<dd>Undo</dd>',
                '<dt>Ctrl + Y</dt>',
                '<dd>Redo</dd>',
                '<dt>Shitf + tab</dt>',
                '<dd>Auto indent selected lines, or current line if nothing is selected</dd>',
                '<dt>Ctrl + A</dt>',
                '<dd>Select all</dd>',
                '<dt>Ctrl + Shift + -</dt>',
                '<dd>Collapse all</dd>',
                '<dt>Ctrl + Shift + +</dt>',
                '<dd>Expand all</dd>',
                '<dt>Ctrl + -</dt>',
                '<dd>Collapse curent line</dd>',
                '<dt>Ctrl + +</dt>',
                '<dd>Expand curent line</dd>',
                '<dt>Ctrl + D</dt>',
                '<dd>Delete current line</dd>',
                '</dl>',
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
