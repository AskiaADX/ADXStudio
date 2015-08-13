var adx = {};

/**

* create an horizontal or vertical resizer

    var h = new adx.Resizer({
      element : document.getElementById('Left'),
      direction : 'horizontal'
    });

    h.start();

    var v = new adx.Resizer({
      element : document.getElementById('Top'),
      direction : 'vertical'
    });

*add param "HTMLElement" option.element element to resize
*add param "vertical" | "horizontal" option.direction describe the direction of the resizer

*/
adx.Resizer = (function() {

  function Resizer(option) {
      this.option = option || {};
      this.element = this.option.element;
      this.direction = this.option.direction || 'horizontal';

      this.config = {
        delta: null,
        pageCoord: (this.direction == 'horizontal') ? 'pageX' : 'pageY',
        offsetPos: (this.direction == 'horizontal') ? 'offsetLeft' : 'offsetTop',
        pos: (this.direction == 'horizontal') ? 'left' : 'top',
        offsetSize: (this.direction == 'horizontal') ? 'offsetWidth' : 'offsetHeight',
        size: (this.direction == 'horizontal') ? 'width' : 'height'
      };

       if (!this.element) {
          throw new Error('Require Element object.');
       }

       this.resizeEl = document.createElement('div');
       this.resizeEl.adxEl = this.element;
       this.resizeEl.adxResizer = this;
       this.resizeEl.className = 'adx-' + this.direction;

       if (this.resizeEl.className === 'adx-horizontal') {

         this.resizeEl.style.left = this.element.offsetWidth + 'px';
         this.element.parentNode.appendChild(this.resizeEl);

       } else if (this.resizeEl.className === 'adx-vertical') {

         this.resizeEl.style.top = this.element.offsetHeight + 'px';
         this.element.parentNode.appendChild(this.resizeEl);
       }
    }


    function down(event) {

      var currentEl = this;
      var direction = currentEl.adxResizer.direction;
      var config = currentEl.adxResizer.config;
      config.delta = event[config.pageCoord] - this[config.offsetPos];
      currentEl.classList.add('adx-'+ direction +'-drag');
      document.body.classList.add('adx-'+ direction +'-drag');
      document.body.addEventListener('mouseup', up);
      document.body.addEventListener('mousemove', move);

      function move(event) {
        currentEl.style[config.pos] = (event[config.pageCoord] - config.delta) + 'px';

      }

      function up(event) {
        currentEl.classList.remove('adx-'+ direction +'-drag');
        document.body.classList.remove('adx-'+ direction +'-drag');
        document.body.removeEventListener('mouseup', up);
        document.body.removeEventListener('mousemove', move);
        currentEl.adxEl.style[config.size] = currentEl[config.offsetPos] + 'px';
        var widthEl = currentEl.adxEl[config.offsetSize];
        currentEl.style[config.pos] = widthEl + 'px';
      }
    }

    Resizer.prototype.start = function() {

      var self = this;

          var elementToMove = self.resizeEl;
          elementToMove.classList.remove('hide');
          elementToMove.addEventListener('mousedown',  down);
    }

    Resizer.prototype.stop = function() {
      var self = this;
      var elementToMove = self.resizeEl;

      elementToMove.removeEventListener('mousedown', down);
      elementToMove.removeEventListener('mousedown', down);
      elementToMove.classList.add('hide');
    }

    return Resizer;

}());
