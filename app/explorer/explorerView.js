// the object map is created to give unique id to each item
var remote 		= require('remote');
var Menu 		= remote.require('menu');
var MenuItem 	= remote.require('menu-item');
var ipc 		= require('ipc');
var shell   	= require('shell');

function selectItem() {
    var divGlobal = document.querySelector('.selected');
    var itemInfo = this;

    if (divGlobal) {
        divGlobal.classList.remove('selected');
    }

    itemInfo.classList.add('selected');
}

function itemRightClick(e) {
    e.preventDefault();

    var el = this.parentNode;
    var file = el.file;
    selectItem.call(this);

    var contextualMenu = new Menu();
  
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
  
  
  	/* Rename file */
    contextualMenu.append(new MenuItem({
        label: 'Rename',
        click: function onClickRename() {
            ipc.sendToHost('show-modal-dialog', {
                type: 'prompt',
                message : 'Rename:',
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
                message: 'Do you really want to remove `' + file.name + '`?'
            }, 'explorer-remove', file);

        }
    }));

    contextualMenu.popup(remote.getCurrentWindow());
}

function itemclick() {

    var itemInfo = this;
    var item = itemInfo.parentNode;
    var file = item.file;
    var child = item.querySelector('.child');
    var toggle;

    selectItem.call(this);

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
    ipc.on('explorer-expand-folder', function (err, path, files, isRoot, rootName) {
        elLoader.style.display = 'none';
        var root = (isRoot) ? document.getElementById('root').querySelector('.child') :
            document.querySelector('div[data-path=\'' + path.replace(/(\\)/g, '\\\\').replace(/(:)/g, '\\:') + '\']').querySelector('.child');
        var deep = parseInt(root.getAttribute('data-deep'), 10);
        root.innerHTML = '';

        if (isRoot) {
            root.parentNode.setAttribute('data-path', path);
            root.parentNode.file = {
                path: path,
                type: 'folder',
                name: /(?:\/|\\)([^\/\\]+)(?:\/|\\)?$/.exec(path)[1]
            };
            root.parentNode.querySelector('.item-info').onclick = itemclick;
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
            itemInfo.onclick = itemclick;

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
