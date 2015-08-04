// the object map is created to give unique id to each item
var remote = require('remote');
var menu = remote.require('menu');
var menuItem = remote.require('menu-item');
var ipc = require('ipc');

var map = {
  autoincrement: 0
};



function itemclick(itemInfo) {

  var item = itemInfo.parentNode;
  var parentItem = item.parentNode;
  var divGlobal = document.querySelector('.selected');
  var file = map[item.id];
  var child = item.querySelector('.child');
  var toggle;

  // Folder system
  if (file.type === 'folder') {
    toggle = itemInfo.querySelector('.toggle');

    if(child.style.display === 'block') {
      //if it's open, then we close it on click
      child.style.display = '';
      toggle.classList.remove('open');
    } else {
      // if it's close we open it on click
      child.style.display = 'block';
      toggle.classList.add('open');
    }

    if(!file.loaded) {
      ipc.send('explorer-load-folder', file.path, item.id);
      file.loaded = true;
    }
  } else {
    itemInfo.classList.add('selected');
    ipc.send('explorer-load-file', file);
    if (divGlobal){
        divGlobal.classList.remove('selected')
    }
  }
}

function rightClick () {
console.log('g');
}

document.addEventListener('DOMContentLoaded', function() {
  ipc.on('explorer-expand-folder', function( err, files, elementid) {
    var root = document.getElementById(elementid).querySelector('.child');
    var deep = parseInt(root.getAttribute('data-deep'), 10);
    root.innerHTML = '';

    for (var i = 0; i < files.length; i += 1) {

      map.autoincrement++;
      map['item'+ map.autoincrement] = files[i];

      var item = document.createElement('div');
      item.className = files[i].type;
      item.id = 'item'+ map.autoincrement;

      var itemInfo = document.createElement('div');
      itemInfo.className = 'item-info';
      //The function when someone click on a div itemInfo
      itemInfo.onclick = function(e) {

        if(e.button == 0) {
          console.log(e);
        itemclick(this);
        }
      };

      itemInfo.addEventListener('contextmenu', function(e) {

        console.log(e.srcElement.parentNode);
        var menu1 = new menu();
        menu1.append(new menuItem({ label: 'Rename', click: function() {

        

          } }));

        e.preventDefault();
        menu1.popup(remote.getCurrentWindow());
      }, false);


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

      if(files[i].type == 'folder') {
        var child = document.createElement('div');
        child.className="child";
        child.setAttribute('data-deep', deep + 1);
        item.appendChild(child);
      }
        root.appendChild(item);
    }
});
  ipc.send('explorer-ready');
});
