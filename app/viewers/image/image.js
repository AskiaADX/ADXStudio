


(function () {
    var matchTabId  =  /\?tabid=([^&]+)/gi.exec(window.location.href);
    if (!matchTabId || !matchTabId.length) {
        throw new Error("Invalid context, the tab id is not defined");
    }
    var tabId    = matchTabId[1];
    var parent   = window.parent;
    var tabs     = parent.tabs;
    var tab      = tabs[tabId];

    var contener = document.getElementById('contener');
    var img = document.createElement('img');
    img.src = 'file:///' + tab.path;
    img.id = 'imageLoaded';
    img.alt = tab.name;
    img.title = tab.name;
  //  img.style.order = '2';
  //  img.style.alignSelf = 'center';
    img.style.backgroundImage = "url('bg.png')";
    img.style.backgroundRepeat = "repeat";
    document.body.appendChild(img);
    contener.appendChild(img);
}());

var img = document.getElementById('imageLoaded');
var toolbar = document.getElementById('toolbarimg');
var zoomin = toolbar.querySelector('.zoomIn');
var  zoomout = toolbar.querySelector('.zoomOut');
var  size = toolbar.querySelector('.initialSize');
var element = {};
var i = 50;
//function click on each button of the toolbar.

toolbar.addEventListener('click', function(event) {
  element = {
    elclass: event.srcElement.className || event.srcElement.parentNode.className
  };
    toolbarexe();
});

function toolbarexe() {
  //function click ZOOMIN
  if (element.elclass == 'zoomIn tool') {
    console.log(img.style.width);
    i += 10;
    img.style.width = i + '%';
    console.log(i);
  }

//function click ZOOMOUT
  if (element.elclass == 'zoomOut tool') {
    i -= 10;
    img.style.width = i + '%';
  }

  //function click INITSIZE
    if (element.elclass == 'initialSize tool') {
      img.style.width = 50 + '%';
      i = 50;
    }
    if (element.elclass == 'chessControl tool') {
      switch (img.style.backgroundImage) {

        case 'none':
          img.style.backgroundImage = "url('bg.png')";
          break;

        default:
          img.style.backgroundImage = "none";
      }

    }else {
      return;
    }
}
