

var separator = document.createElement('div');
separator.id = "separator";
separator.addEventListener('mousedown',  function horizDown(event) {

  var currentEl = this;
  var deltaX = event.pageX - this.offsetLeft;
  currentEl.classList.add('drag');
  document.body.classList.add('drag');
  document.body.addEventListener('mouseup', horizUp);
  document.body.addEventListener('mousemove', horizMove);

  function horizMove(event) {
    currentEl.style.left = (event.pageX - deltaX) + 'px';
  }

  function horizUp(event) {
    currentEl.classList.remove('drag');
    document.body.classList.remove('drag');
    document.body.removeEventListener('mouseup', horizUp);
    document.body.removeEventListener('mousemove', horizMove);
    document.getElementById('panel_explorer').style.width = currentEl.offsetLeft + 'px';
    var widthEl = document.getElementById('panel_explorer').offsetWidth;
    currentEl.style.left = widthEl + 'px';
  }
});

var explorerResizer = new adx.Resizer({
 element : document.getElementById("separator"),
 direction : 'vertical'
});

explorerResizer.start();
explorerResizer.stop();
