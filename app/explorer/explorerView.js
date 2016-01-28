// the object map is created to give unique id to each item
var electron    = require('electron');
var remote 		= electron.remote;
var Menu 		= remote.Menu;
var MenuItem 	= remote.MenuItem;
var ipc 		= electron.ipcRenderer;
var shell   	= electron.shell;
var lastSelected;


function selectWithShiftKey(firstItem, secondItem) {
    if (document.querySelector('.selected')) {
        divGlobal = document.querySelectorAll('.selected');
        for (var i = 0, l = divGlobal.length; i < l; i++) {
            divGlobal[i].classList.remove('selected');
        }
    }
    var firstItemPath = firstItem.parentNode.file.path;
    var secondItemPath = secondItem.parentNode.file.path;
    var checkIfWeSelect = false;

    var items = document.getElementsByClassName('item-info');
    for (var i = 0, l = items.length; i < l; i++) {
        var itemsPath = items[i].parentNode.file.path;
        if ((itemsPath == firstItemPath) || (itemsPath == secondItemPath)) {
            checkIfWeSelect = (checkIfWeSelect == true)? false : true;
        }
        //if (!checkIfWeSelect && items[i].classList.add('selected')) {
        //    items[i].classList.remove('selected');
        //}

        if (checkIfWeSelect) {
            items[i].classList.add('selected');
        }
    }
    if (firstItem.classList.length != 2) {
        firstItem.classList.add('selected');
    }
    if (secondItem.classList.length != 2) {
        secondItem.classList.add('selected');
    }
}

function selectItem(e) {
    var divGlobal = document.querySelector('.selected');
    var itemInfo = this;

    if (e.shiftKey) {
        if (!divGlobal) { 
            itemInfo.classList.add('selected');
            lastSelected = itemInfo;
        } else {
            selectWithShiftKey(lastSelected, itemInfo);
        }
        return;
    }

    if (e.ctrlKey) {
        if (itemInfo == divGlobal) {
            divGlobal.classList.remove('selected');
        } else if (itemInfo.classList.length == 2) {
            itemInfo.classList.remove('selected');
        } else {
            itemInfo.classList.add('selected');
        }
        return;
    }

    if (document.querySelector('.selected')) {
        divGlobal = document.querySelectorAll('.selected');
        for (var i = 0, l = divGlobal.length; i < l; i++) {
            divGlobal[i].classList.remove('selected');
        }
    }

    itemInfo.classList.add('selected');
    lastSelected = itemInfo;
}

function itemRightClick(e) {
    e.preventDefault();
    selectItem.call(this, e);


    var selectedElements = document.querySelectorAll('.selected');
    var files = [];
    for (var i = 0, l = selectedElements.length; i < l; i++) {
        files.push(selectedElements[i].parentNode.file);
    }
    var el = this.parentNode;
    var file = el.file;

    var contextualMenu = new Menu();

    /* Add file */
    function addNewFile(menuItem) {
        var messageByType = {
            file : 'File name:',
            directory : 'Directory name:',
            html  : 'HTML file name:',
            css : 'Stylesheet file name:',
            js  : 'Javascript file name:'
        };
        var filePath = file.path;
        if (file.type === 'file') { // Remove the file name
            filePath = filePath.replace(file.name, '');
        }
        ipc.sendToHost('show-modal-dialog', {
            type: 'prompt',
            message : messageByType[menuItem.id],
            buttonText : {
                ok : "Create",
                cancel : "Don't create"
            }
        }, 'explorer-add-item', filePath, menuItem.id);
    }
    if (files.length == 1) {
        contextualMenu.append(new MenuItem({
            label : 'New',
            submenu : [
                {
                    id  : 'file',
                    label : 'File',
                    click : addNewFile
                },
                {
                    id : 'directory',
                    label : 'Directory',
                    click : addNewFile
                },
                {
                    type : 'separator'
                },
                {
                    id : 'html',
                    label : 'HTML file',
                    click : addNewFile
                },
                {
                    id : 'css',
                    label : 'Stylesheet',
                    click : addNewFile
                },
                {
                    id : 'js',
                    label : 'Javascript file',
                    click : addNewFile
                }
            ]
        }));

        contextualMenu.append(new MenuItem({type : 'separator'}));
    }
    if (file.root) {
        contextualMenu.append(new MenuItem({
            label : 'Project settings',
            click : function () {
                ipc.send('explorer-show-project-settings');
            }
        }));
    } else {
        /* Open file in the OS manner */
        if (/\.html?$/i.test(file.name)) {
            contextualMenu.append(new MenuItem({
                label: 'Open in browser',
                click: function onClickOpen() {
                    shell.openItem(file.path);
                }
            }));

            contextualMenu.append(new MenuItem({type : 'separator'}));
        }
        if (files.length == 1) {

            /* Rename file */
            contextualMenu.append(new MenuItem({
                label: 'Rename',
                click: function onClickRename() {
                    ipc.sendToHost('show-modal-dialog', {
                        type: 'prompt',
                        message : 'Rename:',
                        buttonText : {
                            ok : "Rename",
                            cancel : "Don't rename"
                        },
                        value: file.name
                    }, 'explorer-rename', file);

                }
            }));

            contextualMenu.append(new MenuItem({type : 'separator'}));

            /* Remove file */
            contextualMenu.append(new MenuItem({
                label: 'Remove',
                click: function onClickRemove() {

                    ipc.sendToHost('show-modal-dialog', {
                        type: 'yesNo',
                        message: 'Do you really want to remove `' + file.name + '`?',
                        buttonText : {
                            yes : "Remove",
                            no : "Don't remove"
                        }
                    }, 'explorer-remove', file);

                }
            }));

            contextualMenu.append(new MenuItem({type : 'separator'}));

            /*cut file*/
            contextualMenu.append(new MenuItem({
                label: 'Cut',
                click: function onClickCut() {
                    ipc.send('cut-file', file);
                }

            }));

            /*copy file*/
            contextualMenu.append(new MenuItem({
                label: 'Copy',
                click: function onClickCopy() {
                    ipc.send('copy-file', file);
                }
            }));

            /*paste file*/
            contextualMenu.append(new MenuItem({
                label: 'Paste',
                click: function onClickPaste() {
                    ipc.send('paste-file', file);
                }
            }));
        }

        if (files.length > 1) {
            contextualMenu.append(new MenuItem({
                label: 'Remove All',
                click: function onClickRemoveAll() {

                    ipc.sendToHost('show-modal-dialog', {
                        type: 'yesNo',
                        message: 'Do you really want to remove these files?',
                        buttonText : {
                            yes : "Remove",
                            no : "Don't remove"
                        }
                    }, 'explorer-remove-all', files);

                }
            }));
        }
    }

    contextualMenu.popup(remote.getCurrentWindow());
}

function itemclick(e) {

    var itemInfo = this;
    var item = itemInfo.parentNode;
    var file = item.file;
    var child = item.querySelector('.child');
    var toggle;

    selectItem.call(this, e);
    if (e.ctrlKey) {
        return;
    } else if (e.shiftKey) {
        return;
    }

    // Folder system
    if (file.type === 'folder' || item.id === 'root') {
        toggle = itemInfo.querySelector('.toggle');

        if (child.style.display === 'block') {
            //if it's open, then we close it on click
            child.style.display = '';
            toggle.classList.remove('open');
        } else {
            // if it's close we open it on click
            child.style.display = 'block';
            toggle.classList.add('open');
        }

        if (!file.loaded) {
            ipc.send('explorer-load-folder', file.path);
            file.loaded = true;
        }

    } else {
        ipc.send('explorer-load-file', file);
    }
}


document.addEventListener('DOMContentLoaded', function () {
    /*
     *
     * @param {String} path Path of Directory.
     * @param {Array} files files or folder inside rootPath.
     * @param {Boolean} isRoot indicate if e are on root.
     */
    ipc.on('explorer-expand-folder', function (event, err, path, files, isRoot, rootName) {
        var root = (isRoot) ? document.getElementById('root').querySelector('.child') :
        document.querySelector('div[data-path=\'' + path.replace(/(\\)/g, '\\\\').replace(/(:)/g, '\\:') + '\']').querySelector('.child');
        var deep = parseInt(root.getAttribute('data-deep'), 10);
        root.innerHTML = '';

        if (isRoot) {
            root.parentNode.setAttribute('data-path', path);
            root.parentNode.file = {
                root : true,
                path: path,
                type: 'folder',
                name: /(?:\/|\\)([^\/\\]+)(?:\/|\\)?$/.exec(path)[1]
            };
            var rootInfo = root.parentNode.querySelector('.item-info');
            rootInfo.removeEventListener('click', itemclick);
            rootInfo.addEventListener('click', itemclick, false);
            rootInfo.removeEventListener('contextmenu', itemRightClick);
            rootInfo.addEventListener('contextmenu', itemRightClick, false);
            root.parentNode.querySelector('.name').innerHTML = rootName;
            root.parentNode.style.display = 'block';
        }


        for (var i = 0; i < files.length; i += 1) {

            var item = document.createElement('div');
            item.className = files[i].type;
            item.title = files[i].path;
            item.setAttribute('data-path', files[i].path);
            item.file = files[i];

            var itemInfo = document.createElement('div');
            itemInfo.className = 'item-info';

            //The function when someone click on a div itemInfo
            itemInfo.addEventListener('click', itemclick, false);
            itemInfo.addEventListener('contextmenu', itemRightClick, false);

            var toggle = document.createElement('div');
            toggle.className = 'toggle';
            toggle.style.marginLeft = (deep * 10) + 'px';
            itemInfo.appendChild(toggle);

            var icon = document.createElement('div');
            icon.className = 'icon';
            itemInfo.appendChild(icon);

            var name = document.createElement('div');
            name.className = 'name';
            name.innerHTML = files[i].name;
            itemInfo.appendChild(name);

            item.appendChild(itemInfo);

            if (files[i].type == 'folder') {
                var child = document.createElement('div');
                child.className = "child";
                child.setAttribute('data-deep', deep + 1);
                item.appendChild(child);
            }
            root.appendChild(item);
        }
    });


    ipc.send('explorer-ready');
});
