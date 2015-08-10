(function () {
    var tab      = viewer.currentTab; // From viewer.js

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

    viewer.fireReady();
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
    i += 10;
    img.style.width = i + '%';
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
