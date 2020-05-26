/* global d3 */
var commonJS = typeof module === 'object' && typeof module.exports === 'object';

function createSimpleScroll(opts) {
  var localD3;
  var easingFn;
  var timer;
  var root;
  var timerInstance = null;

  if (opts) {
    localD3 = opts.d3;
    easingFn = opts.easingFn;
    timer = opts.timer;
    root = opts.root;
  }

  if (!localD3 && !commonJS) {
    // Probably being included via script tags. Try the global D3.
    localD3 = d3;
  }

  function scrollTo(toTop, time) {
    var fromTop = root.scrollTop;
    var scrollDistance = toTop - fromTop;

    timerInstance = timer(updateScrollTop);

    function updateScrollTop(elapsed) {
      var portion = easingFn((elapsed * 1.0) / time);
      var scrollChange = scrollDistance * portion;

      root.scrollTop = fromTop + scrollChange;

      // Stop the timer if we've scrolled as far as requested.
      if (scrollDistance < 0 && root.scrollTop <= toTop) {
        stopScroll();
      } else if (scrollDistance >= 0 && root.scrollTop >= toTop) {
        stopScroll();
      }
      if (elapsed > time) {
        stopScroll();
      }
    }
  }

  function scrollToElement(el, time, marginAboveTargetElement = 0) {
    scrollTo(el.offsetTop - marginAboveTargetElement, time);
  }

  function stopScroll() {
    if (timerInstance) {
      timerInstance.stop();
      timerInstance = null;
    }
  }

  function isStillScrolling() {
    return timerInstance !== null;
  }

  return {
    scrollTo: scrollTo,
    scrollToElement: scrollToElement,
    stopScroll: stopScroll,
    isStillScrolling: isStillScrolling
  };
}

if (commonJS) {
  module.exports = createSimpleScroll;
}
