/**
 * Global namespace
 */
window.askia = window.askia || {};


window.askia.Resizer = (function () {


  /**
   * Create an horizontal or vertical resizable splitter
   *
   *      const h = new askia.Resizer({
   *          element    : document.getElementById('Left'),
   *          direction  : 'horizontal'
   *      });
   *
   *     h.start();
   *
   *     const v = new askia.Resizer({
   *          element : document.getElementById('Top'),
   *          direction : 'vertical'
   *     });
   *
   *     v.start();
   *
   * @param {Object} options Options
   * @param {HTMLElement}  options.element HTML element to resize
   * @param {String|"vertical"|"horizontal"} options.direction Direction of the splitter
   * @param {Function} options.onResize Callback to call when the resizer has been resized
   * @param {Boolean} options.revert Use the opposite side (top for vertical direction and right for horizontal)
   */
  function Resizer (options) {
    this.options = options || {};
    this.element = this.options.element;
    this.direction = this.options.direction || 'horizontal';

    this.config = {
      delta: null,
      pageCoord: (this.direction === 'horizontal') ? 'pageX' : 'pageY',
      offsetPos: (this.direction === 'horizontal') ? 'offsetLeft' : 'offsetTop',
      pos: (this.direction === 'horizontal') ? 'left' : 'top',
      offsetSize: (this.direction === 'horizontal') ? 'offsetWidth' : 'offsetHeight',
      size: (this.direction === 'horizontal') ? 'width' : 'height',
      revert: options.revert
    };

    if (options.revert) {
      this.config.offsetSize = (this.direction === 'horizontal') ? 'offsetLeft' : 'offsetTop';
    }

    if (this.options.onResize && typeof this.options.onResize === 'function') {
      this.config.onResize = options.onResize;
    }


    if (!this.element) {
      throw new Error('Require Element object.');
    }

    this.resizeEl = document.createElement('div');
    this.resizeEl.adxEl = this.element;
    this.resizeEl.adxResizer = this;
    this.resizeEl.className = 'askia-resizer-' + this.direction + ' askia-resizer-hide'; // Make it hidden by default

    this.refreshPosition();
    this.element.parentNode.appendChild(this.resizeEl);
  }

  function down (event) {
    const currentEl = this;
    const direction = currentEl.adxResizer.direction;
    const config = currentEl.adxResizer.config;
    const modal = document.createElement('div');
    modal.className = 'askia-resizer-modal';
    modal.classList.add(direction);
    document.body.appendChild(modal);
    config.delta = event[config.pageCoord] - this[config.offsetPos];
    currentEl.classList.add('askia-resizer-' + direction + '-drag');
    document.body.classList.add('askia-resizer-' + direction + '-drag');
    document.body.addEventListener('mouseup', up);
    document.body.addEventListener('mousemove', move);

    function move (event) {
      currentEl.style[config.pos] = (event[config.pageCoord] - config.delta) + 'px';
    }

    function up () {
      document.body.removeChild(modal);
      currentEl.classList.remove('askia-resizer-' + direction + '-drag');
      document.body.classList.remove('askia-resizer-' + direction + '-drag');
      document.body.removeEventListener('mouseup', up);
      document.body.removeEventListener('mousemove', move);
      let size = currentEl[config.offsetPos];
      if (config.revert) {
        size = currentEl.adxEl[config.offsetSize] - currentEl[config.offsetPos];
        size += currentEl.adxEl[(direction === 'horizontal') ? 'offsetWidth' : 'offsetHeight'];
      }
      currentEl.adxEl.style[config.size] = size + 'px';
      currentEl.adxResizer.refreshPosition();
      if (config.onResize) {
        config.onResize();
      }
    }
  }

  /**
   * Reset the position of the resizer element
   */
  Resizer.prototype.refreshPosition = function () {
    const self = this;
    const config = self.config;
    const resizeEl = self.resizeEl;
    const sizeElement = self.element[config.offsetSize];

    resizeEl.style[config.pos] = sizeElement + 'px';
  };

  Resizer.prototype.start = function () {

    const self = this;
    self.refreshPosition();
    const elementToMove = self.resizeEl;
    elementToMove.classList.remove('askia-resizer-hide');
    elementToMove.addEventListener('mousedown', down);
  };

  Resizer.prototype.stop = function () {
    const self = this;
    const elementToMove = self.resizeEl;
    elementToMove.removeEventListener('mousedown', down);
    elementToMove.removeEventListener('mousedown', down);
    elementToMove.classList.add('askia-resizer-hide');
  };

  return Resizer;

}());
