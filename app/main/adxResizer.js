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
       this.resizeEl.className = 'adx-' + this.direction + ' hide'; // Make it hidden by default

      this.refreshPosition();
      this.element.parentNode.appendChild(this.resizeEl);
    }


    function down(event) {

      var currentEl = this;
      var direction = currentEl.adxResizer.direction;
      var config = currentEl.adxResizer.config;
      var modal = document.createElement('div');
      document.body.appendChild(modal);
      modal.style.zIndex = 999;
      modal.style.width = 100+'vw';
      modal.style.height = 100+'vh';
      modal.style.position = 'absolute';
      modal.style.top = 0;
      modal.style.left = 0;
      modal.style.background = 'transparent';
      config.delta = event[config.pageCoord] - this[config.offsetPos];
      currentEl.classList.add('adx-'+ direction +'-drag');
      currentEl.style.zIndex = 1000;
      document.body.classList.add('adx-'+ direction +'-drag');
      document.body.addEventListener('mouseup', up);
      document.body.addEventListener('mousemove', move);

      function move(event) {
        currentEl.style[config.pos] = (event[config.pageCoord] - config.delta) + 'px';

      }

      function up(event) {
       	document.body.removeChild(modal);
        currentEl.classList.remove('adx-'+ direction +'-drag');
        document.body.classList.remove('adx-'+ direction +'-drag');
        document.body.removeEventListener('mouseup', up);
        document.body.removeEventListener('mousemove', move);
        currentEl.adxEl.style[config.size] = currentEl[config.offsetPos] + 'px';
        currentEl.adxResizer.refreshPosition();
      }
    }

    /**
     * Reset the position of the resizer element
     */
    Resizer.prototype.refreshPosition = function () {
        var self = this,
            config  = self.config,
            resizeEl = self.resizeEl,
            sizeElement = self.element[config.offsetSize];

        resizeEl.style[config.pos] = sizeElement + 'px';
    };

    Resizer.prototype.start = function() {

      var self = this;
      self.refreshPosition();
      var elementToMove = self.resizeEl;
      elementToMove.classList.remove('hide');
      elementToMove.addEventListener('mousedown',  down);
    };

    Resizer.prototype.stop = function() {
      var self = this;
      var elementToMove = self.resizeEl;
      elementToMove.removeEventListener('mousedown', down);
      elementToMove.removeEventListener('mousedown', down);
      elementToMove.classList.add('hide');
    };

    return Resizer;

}());
