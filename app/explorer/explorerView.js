// the object map is created to give unique id to each item
const electron = require('electron');
let remote = electron.remote;
let Menu = remote.Menu;
let MenuItem = remote.MenuItem;
let ipc = electron.ipcRenderer;
let shell = electron.shell;
let dblClick = JSON.parse(localStorage['adxstudio-initial-useDblClick']);
let lastSelected;
let keyCodes = {
  pageUp: 33,
  pageDown: 34,
  enter: 13,
  suppr: 46,
  up: 38,
  down: 40,
  plus: 107,
  less: 109,
  c: 67,
  x: 88,
  v: 86,
  F2: 113,
  menu: 93
};

function removeMenu (files) {
  let file = files[0];
  if (files.length === 1) {
    ipc.sendToHost('show-modal-dialog', {
      type: 'yesNo',
      message: 'Do you really want to remove `' + file.name + '`?',
      buttonText: {
        yes: 'Remove',
        no: 'Don\'t remove'
      }
    }, 'explorer-remove', file);
  } else {
    ipc.sendToHost('show-modal-dialog', {
      type: 'yesNo',
      message: 'Do you really want to remove these files?',
      buttonText: {
        yes: 'Remove',
        no: 'Don\'t remove'
      }
    }, 'explorer-remove-all', files);
  }
}

function displayMenu (files, contextualMenu) {
  let file = files[0];

  /* Add file */
  function addNewFile (menuItem) {
    let messageByType = {
      file: 'File name:',
      directory: 'Directory name:',
      html: 'HTML file name:',
      css: 'Stylesheet file name:',
      js: 'Javascript file name:',
      asx: 'Askia Script Xtension file name'
    };
    let filePath = file.path;
    if (file.type === 'file') { // Remove the file name
      filePath = filePath.replace(file.name, '');
    }
    ipc.sendToHost('show-modal-dialog', {
      type: 'prompt',
      message: messageByType[menuItem.id],
      buttonText: {
        ok: 'Create',
        cancel: 'Don\'t create'
      }
    }, 'explorer-add-item', filePath, menuItem.id);
  }
  if (files.length === 1) {
    contextualMenu.append(new MenuItem({
      label: 'New',
      submenu: [
        {
          id: 'file',
          label: 'File',
          click: addNewFile
        },
        {
          id: 'directory',
          label: 'Directory',
          click: addNewFile
        },
        {
          type: 'separator'
        },
        {
          id: 'html',
          label: 'HTML file',
          click: addNewFile
        },
        {
          id: 'css',
          label: 'Stylesheet',
          click: addNewFile
        },
        {
          id: 'js',
          label: 'Javascript file',
          click: addNewFile
        },
        {
          id: 'asx',
          label: 'Askia Script Xtension file',
          click: addNewFile
        }
      ]
    }));

    contextualMenu.append(new MenuItem({ type: 'separator' }));

    if (!file.root) {
      /* Open file in the OS manner */
      if (/\.html?$/i.test(file.name)) {
        contextualMenu.append(new MenuItem({
          label: 'Open in browser',
          click: function onClickOpen () {
            shell.openPath(file.path);
          }
        }));
      }

      /*cut file*/
      contextualMenu.append(new MenuItem({
        label: 'Cut',
        click: function onClickCut () {
          ipc.send('cut-file', file);
        }

      }));

      /*copy file*/
      contextualMenu.append(new MenuItem({
        label: 'Copy',
        click: function onClickCopy () {
          ipc.send('copy-file', file);
        }
      }));

      /*paste file*/
      contextualMenu.append(new MenuItem({
        label: 'Paste',
        click: function onClickPaste () {
          ipc.send('paste-file', file);
        }
      }));

      contextualMenu.append(new MenuItem({ type: 'separator' }));

      /* Rename file */
      contextualMenu.append(new MenuItem({
        label: 'Rename',
        click: function onClickRename () {
          ipc.sendToHost('show-modal-dialog', {
            type: 'prompt',
            message: 'Rename:',
            buttonText: {
              ok: 'Rename',
              cancel: 'Don\'t rename'
            },
            value: file.name
          }, 'explorer-rename', file);

        }
      }));

      /* Remove file */
      contextualMenu.append(new MenuItem({
        label: 'Remove',
        click: function () {
          removeMenu(files);
        }
      }));
    } else {
      contextualMenu.append(new MenuItem({
        label: 'Project settings',
        click: function () {
          ipc.send('explorer-show-project-settings');
        }
      }));
    }
  }
  if (files.length > 1) {
    /*cut file*/
    contextualMenu.append(new MenuItem({
      label: 'Cut All',
      click: function onClickCut () {
        ipc.send('cut-all-file', files);
      }

    }));

    /*copy file*/
    contextualMenu.append(new MenuItem({
      label: 'Copy All',
      click: function onClickCopy () {
        ipc.send('copy-all-file', files);
      }
    }));

    /*paste file*/
    contextualMenu.append(new MenuItem({
      label: 'Paste All',
      click: function onClickPaste () {
        ipc.send('paste-file', file);
      }
    }));

    contextualMenu.append(new MenuItem({ type: 'separator' }));

    contextualMenu.append(new MenuItem({
      label: 'Remove All',
      click: function () {
        removeMenu(files);
      }
    }));
  }
}

function checkIfRootIsSelected () {
  let root = document.getElementById('root').querySelector('.item-info');
  if (root.classList.contains('selected')) {
    root.classList.remove('selected');
  }
}

function selectWithShiftKey (firstItem, secondItem) {
  if (document.querySelector('.selected')) {
    let divGlobal = document.querySelectorAll('.selected');
    for (let j = 0, m = divGlobal.length; j < m; j++) {
      divGlobal[j].classList.remove('selected');
    }
  }
  let firstItemPath = firstItem.parentNode.file.path;
  let secondItemPath = secondItem.parentNode.file.path;
  if (firstItemPath === secondItemPath) {
    firstItem.classList.add('selected');
    checkIfRootIsSelected();
    return;
  }

  let checkIfWeSelect = false;
  let items = document.getElementsByClassName('item-info');
  for (let i = 0, l = items.length; i < l; i++) {
    let itemsPath = items[i].parentNode.file.path;
    if ((itemsPath === firstItemPath) || (itemsPath === secondItemPath)) {
      checkIfWeSelect = (checkIfWeSelect === true) ? false : true;
    }

    if (checkIfWeSelect) {
      items[i].classList.add('selected');
    }
  }
  if (firstItem.classList !== undefined && firstItem.classList.length !== 2) {
    firstItem.classList.add('selected');
  }
  if (secondItem.classList !== undefined && secondItem.classList.length !== 2) {
    secondItem.classList.add('selected');
  }
  checkIfRootIsSelected();
}

function selectItem (e) {
  let divGlobal = document.querySelector('.selected');
  let itemInfo = this;

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
    if (itemInfo === divGlobal) {
      divGlobal.classList.remove('selected');
    } else if (itemInfo.classList.length === 2) {
      itemInfo.classList.remove('selected');
    } else {
      itemInfo.classList.add('selected');
      lastSelected = itemInfo;
    }
    checkIfRootIsSelected();
    return;
  }

  if (document.querySelector('.selected')) {
    divGlobal = document.querySelectorAll('.selected');
    for (let i = 0, l = divGlobal.length; i < l; i++) {
      divGlobal[i].classList.remove('selected');
    }
  }

  itemInfo.classList.add('selected');
  lastSelected = itemInfo;
}

function itemDoubleClick (e) {
  if (!dblClick) {
    return;
  }
  let itemInfo = this;
  let item = itemInfo.parentNode;
  let file = item.file;

  selectItem.call(this, e);
  if (e.ctrlKey) {
    return;
  } else if (e.shiftKey) {
    return;
  }
  if (file.type === 'file') {
    ipc.send('explorer-load-file', file);
  }
}

function itemRightClick (e) {
  e.preventDefault();

  selectItem.call(this, e);
  let selectedElements = document.querySelectorAll('.selected');
  let files = [];
  let filesParent = [];
  for (let i = 0, l = selectedElements.length; i < l; i++) {
    files.push(selectedElements[i].parentNode.file);
    filesParent.push(selectedElements[i].parentNode);
  }

  let contextualMenu = new Menu();

  displayMenu(files, contextualMenu, filesParent);

  contextualMenu.popup(remote.BrowserWindow.getAllWindows()[0]);
}

function itemclick (e) {
  let itemInfo = this;
  let item = itemInfo.parentNode;
  let file = item.file;
  let child = item.querySelector('.child');
  let toggle;

  selectItem.call(this, e);
  if (e.ctrlKey) {
    return;
  } else if (e.shiftKey) {
    return;
  }

  // Folder system
  if (file.type === 'folder' || item.id === 'root') {
    toggle = itemInfo.querySelector('.toggle');

    if (child.classList.contains('expand')) {
      //if it's open, then we close it on click
      child.classList.remove('expand');
      toggle.classList.remove('open');
    } else {
      // if it's close we open it on click
      child.classList.add('expand');
      toggle.classList.add('open');
    }

    if (!file.loaded) {
      ipc.send('explorer-load-folder', file.path);
      file.loaded = true;
    }
  }
  if (dblClick) {
    return;
  }
  if (file.type === 'file') {
    ipc.send('explorer-load-file', file);
  }
}

function copy () {
  let selectedElements = document.querySelectorAll('.selected');
  let files = [];
  for (let i = 0, l = selectedElements.length; i < l; i++) {
    files.push(selectedElements[i].parentNode.file);
  }
  if (files.length === 1) {
    let file = files[0];
    ipc.send('copy-file', file);
  } else if (files.length > 1) {
    ipc.send('copy-all-file', files);
  }
}

function cut () {
  let selectedElements = document.querySelectorAll('.selected');
  let files = [];
  for (let i = 0, l = selectedElements.length; i < l; i++) {
    files.push(selectedElements[i].parentNode.file);
  }
  if (files.length === 1) {
    let file = files[0];
    ipc.send('cut-file', file);
  } else if (files.length > 1) {
    ipc.send('cut-all-file', files);
  }
}

function paste () {
  let selectedElements = document.querySelectorAll('.selected');
  let files = [];
  for (let i = 0, l = selectedElements.length; i < l; i++) {
    files.push(selectedElements[i].parentNode.file);
  }
  if (files.length === 1) {
    let file = files[0];
    ipc.send('paste-file', file);
  } else if (files.length > 1) {
    ipc.send('paste-file', files);
  }
}

function getPreviousItemInfo (el) {
  let child = el.querySelector('.child');
  if (child && child.classList.contains('expand')) {
    let allChildren = child.parentNode.querySelectorAll('.child.expand > div > .item-info');
    if (allChildren && allChildren.length) {
      return allChildren[allChildren.length - 1];
    }
  }
  return null;
}

function keyNavigator (e) {
  let selectedElements = document.querySelectorAll('.selected');

  let root = document.getElementById('root').getElementsByClassName('item-info')[0];
  for (let i = 0, l = selectedElements.length; i < l; i++) {
    selectedElements[i].classList.remove('selected');
  }

  if (selectedElements.length !== 0) {
    let items = document.getElementsByClassName('item-info');
    let lastItem = items[items.length - 1];
    let selectedElement;
    if (!e.shiftKey) {
      selectedElement = lastSelected;
    } else {
      selectedElement = (selectedElements[0] !== lastSelected) ? selectedElements[0] : selectedElements[selectedElements.length - 1];
    }
    let file = selectedElement.parentNode.file || selectedElement.parentNode;

    let nextEl = selectedElement.parentNode.nextSibling;
    let prevEl = selectedElement.parentNode.previousSibling;

    if (e.keyCode === keyCodes.up) {
      let itemToSelect = null;
      let findEl = null;

      if (selectedElement === root) {
        itemToSelect = lastItem;
        if (!e.shiftKey) {
          lastSelected = itemToSelect;
          selectedElement.classList.remove('selected');
          itemToSelect.classList.add('selected');
        } else {
          root.classList.add('selected');
        }
        return;
      }

      if (prevEl) {
        // By default select the prev sibling
        itemToSelect = prevEl.querySelector('.item-info');

        // If the next sibling contains children and if open then pick it
        findEl = getPreviousItemInfo(prevEl);
        if (findEl) {
          itemToSelect = findEl;
        }
      } else {
        // No previous sibling, so go up to the parent node
        itemToSelect = selectedElement.parentNode.parentNode.previousSibling;
      }
      if (itemToSelect.classList === undefined && !e.shiftKey) {
        selectedElement.classList.remove('selected');
        root.classList.add('selected');
        lastSelected = root;
        return;
      }
      // If there is an item to select
      if (itemToSelect) {
        if (!e.shiftKey || selectedElement === root) {
          selectedElement.classList.remove('selected');
        } else {
          selectWithShiftKey(lastSelected, itemToSelect);
        }
        itemToSelect.classList.add('selected');
        if (!e.shiftKey) {
          lastSelected = itemToSelect;
        }
      }
    } else if (e.keyCode === keyCodes.down) {
      let itemToSelect = null;
      let findEl = null;

      if (selectedElement === root && !e.shiftKey) {
        itemToSelect = document.getElementById('root').querySelector('.child').querySelector('.item-info');
        itemToSelect.classList.add('selected');
        if (!e.shiftKey) {
          lastSelected = itemToSelect;
          selectedElement.classList.remove('selected');
        } else {
          selectWithShiftKey(lastSelected, itemToSelect);
        }
        return;
      } else if (selectedElement === root && e.shiftKey) {
        root.classList.add('selected');
        return;
      }

      if (nextEl) {
        // By default select the next sibling
        itemToSelect = nextEl.querySelector('.item-info');

        let child = selectedElement.parentNode.querySelector('.child');
        if (child && child.classList.contains('expand')) {
          findEl = child.children[0].querySelector('.item-info');
          if (findEl) {
            itemToSelect = findEl;
          }
        }
      }
      if (!nextEl && !e.shiftKey) {
        if (selectedElement !== lastItem) {
          itemToSelect = selectedElement.parentNode.parentNode.parentNode.nextSibling.querySelector('.item-info');
        } else {
          itemToSelect = root;
        }
      } else if (!nextEl && e.shiftKey) {
        if (selectedElement !== lastItem) {
          itemToSelect = selectedElement.parentNode.parentNode.parentNode.nextSibling.querySelector('.item-info');
        } else {
          itemToSelect = selectedElement;
        }
        selectWithShiftKey(lastSelected, itemToSelect);
        return;
      }

      if (itemToSelect) {
        if (!e.shiftKey) {
          selectedElement.classList.remove('selected');
        } else {
          selectWithShiftKey(lastSelected, itemToSelect);
          return;
        }
        itemToSelect.classList.add('selected');
        if (!e.shiftKey) {
          lastSelected = itemToSelect;
        }
      }
    } else if (e.keyCode === keyCodes.plus) {
      selectedElement.classList.add('selected');
      if (selectedElement.parentNode.file.type === 'folder') {
        let toggle = selectedElement.querySelector('.toggle');
        let child = selectedElement.parentNode.querySelector('.child');
        if (child.classList.contains('expand')) {
          return;
        } else {
          // if it's close we open it on keydown
          child.classList.add('expand');
          toggle.classList.add('open');
        }

        if (!file.loaded) {
          ipc.send('explorer-load-folder', file.path);
          file.loaded = true;
        }
      }
    } else if (e.keyCode === keyCodes.less) {
      selectedElement.classList.add('selected');
      if (selectedElement.parentNode.file.type === 'folder') {
        let toggle = selectedElement.querySelector('.toggle');
        let child = selectedElement.parentNode.querySelector('.child');
        if (child.classList.contains('expand')) {
          //if it's open, then we close it on keydown
          child.classList.remove('expand');
          toggle.classList.remove('open');
        } else {
          return;
        }

        if (!file.loaded) {
          ipc.send('explorer-load-folder', file.path);
          file.loaded = true;
        }
      }
    } else if (e.keyCode === keyCodes.enter) {
      selectedElement.classList.add('selected');
      // Folder system
      if (selectedElement.parentNode.file.type === 'folder') {
        let toggle = selectedElement.querySelector('.toggle');
        let child = selectedElement.parentNode.querySelector('.child');

        if (child.classList.contains('expand')) {
          //if it's open, then we close it on keydown
          child.classList.remove('expand');
          toggle.classList.remove('open');
        } else {
          // if it's close we open it on keydown
          child.classList.add('expand');
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
  } else if (selectedElements.length === 0) {
    root.classList.add('selected');
    lastSelected = root;
  }
}

function renameWithKeyboard () {
  let file = document.querySelector('.selected').parentNode.file;
  ipc.sendToHost('show-modal-dialog', {
    type: 'prompt',
    message: 'Rename:',
    buttonText: {
      ok: 'Rename',
      cancel: 'Don\'t rename'
    },
    value: file.name
  }, 'explorer-rename', file);
}

function supprWithKeyboard () {
  let selectedElements = document.querySelectorAll('.selected');
  let files = [];
  for (let i = 0, l = selectedElements.length; i < l; i++) {
    files.push(selectedElements[i].parentNode.file);
  }
  removeMenu(files);
}

function menuWithKeyboard () {
  let selectedElements = document.querySelectorAll('.selected');
  let files = [];
  let filesParent = [];
  for (let i = 0, l = selectedElements.length; i < l; i++) {
    files.push(selectedElements[i].parentNode.file);
    filesParent.push(selectedElements[i].parentNode);
  }

  let contextualMenu = new Menu();

  displayMenu(files, contextualMenu, filesParent);

  contextualMenu.popup(remote.BrowserWindow.getAllWindows()[0]);
}

function upExplorer () {
  let selectedElement = document.querySelector('.selected');
  let root = document.getElementById('root').getElementsByClassName('item-info')[0];

  selectedElement.classList.remove('selected');
  root.classList.add('selected');
}

function downExplorer () {
  let selectedElement = document.querySelector('.selected');
  let rootChilds = document.getElementById('root').querySelector('.child').querySelectorAll('.item-info');
  let lastChild = rootChilds[rootChilds.length - 1];

  selectedElement.classList.remove('selected');
  lastChild.classList.add('selected');
}

function switchClick (event, clickToUse) {
  dblClick = clickToUse;
}

//Add shortcut to navigate in the explorer
document.addEventListener('keydown', function (e) {
  if ((e.keyCode === keyCodes.c) && (e.ctrlKey)) {
    copy();
  } else if ((e.keyCode === keyCodes.x) && (e.ctrlKey)) {
    cut();
  } else if ((e.keyCode === keyCodes.v) && (e.ctrlKey)) {
    paste();
  } else if ((e.keyCode === keyCodes.enter) || (e.keyCode === keyCodes.up) || (e.keyCode === keyCodes.less) || (e.keyCode === keyCodes.plus) || (e.keyCode === keyCodes.down)) {
    keyNavigator(e);
  } else if (e.keyCode === keyCodes.F2) {
    renameWithKeyboard();
  } else if (e.keyCode === keyCodes.menu) {
    menuWithKeyboard(e);
  } else if (e.keyCode === keyCodes.suppr) {
    supprWithKeyboard();
  } else if (e.keyCode === keyCodes.pageUp) {
    upExplorer();
  } else if (e.keyCode === keyCodes.pageDown) {
    downExplorer();
  }
});

ipc.on('switch-click', switchClick);

document.addEventListener('DOMContentLoaded', function () {
  /*
   *
   * @param {String} path Path of Directory.
   * @param {Array} files files or folder inside rootPath.
   * @param {Boolean} isRoot indicate if e are on root.
   */
  ipc.on('explorer-expand-folder', function (event, err, path, files, isRoot, rootName) {
    let root = (isRoot) ? document.getElementById('root').querySelector('.child')
      : document.querySelector('div[data-path=\'' + path.replace(/(\\)/g, '\\\\').replace(/(:)/g, '\\:') + '\']').querySelector('.child');
    let deep = parseInt(root.getAttribute('data-deep'), 10);
    root.innerHTML = '';

    if (isRoot) {
      root.parentNode.setAttribute('data-path', path);
      root.parentNode.file = {
        root: true,
        path: path,
        type: 'folder',
        name: /(?:\/|\\)([^\/\\]+)(?:\/|\\)?$/.exec(path)[1]
      };
      let rootInfo = root.parentNode.querySelector('.item-info');
      rootInfo.removeEventListener('click', itemclick);
      rootInfo.addEventListener('click', itemclick, false);
      rootInfo.removeEventListener('contextmenu', itemRightClick);
      rootInfo.addEventListener('contextmenu', itemRightClick, false);
      root.parentNode.querySelector('.name').innerHTML = rootName;
      //root.parentNode.setAttribute('title', path);
    }


    for (let i = 0; i < files.length; i += 1) {

      let item = document.createElement('div');
      item.className = files[i].type;
      //item.title = files[i].path;
      item.setAttribute('data-path', files[i].path);
      item.file = files[i];

      let itemInfo = document.createElement('div');
      itemInfo.className = 'item-info';

      //The function when someone click on a div itemInfo
      itemInfo.addEventListener('dblclick', itemDoubleClick, false);
      itemInfo.addEventListener('click', itemclick, false);
      itemInfo.addEventListener('contextmenu', itemRightClick, false);

      let toggle = document.createElement('div');
      toggle.className = 'toggle';
      toggle.style.marginLeft = (deep * 10) + 'px';
      itemInfo.appendChild(toggle);

      let icon = document.createElement('div');
      // icon.className = (files[i].type === 'file') ? ('icon ' + files[i].path.split('.')[files[i].path.split('.').length - 1].toLowerCase()) : 'icon';
      icon.className = ('icon ' + files[i].path.split('.')[files[i].path.split('.').length - 1].toLowerCase());
      itemInfo.appendChild(icon);

      let name = document.createElement('div');
      name.className = 'name';
      name.innerHTML = files[i].name;
      itemInfo.appendChild(name);

      item.appendChild(itemInfo);

      if (files[i].type === 'folder') {
        let child = document.createElement('div');
        child.className = 'child';
        child.setAttribute('data-deep', deep + 1);
        item.appendChild(child);
      }
      root.appendChild(item);
    }
  });

  ipc.send('explorer-ready');
});
