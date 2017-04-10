document.addEventListener('DOMContentLoaded', function () {
    var tab      = viewer.currentTab; // From viewer.js
    var toolbarEl = document.getElementById('toolbar');
    var elements = {
        container : document.getElementById('container'),
        toolbar   : {
            zoomIn    : toolbarEl.querySelector('.zoomIn'),
            zoomOut   : toolbarEl.querySelector('.zoomOut'),
            zoomReset : toolbarEl.querySelector('.initialSize'),
            toggleChess : toolbarEl.querySelector('.chessControl')
        }
    };

    // Load the image
    elements.image =  (function () {
        var img = document.createElement('img');
        img.src = 'file:///' + tab.path;
        img.alt = tab.name;
        img.title = tab.name;
        img.style.backgroundImage = "url('bg.png')";
        img.style.backgroundRepeat = "repeat";
        elements.container.appendChild(img);
        return img;
    }());

    /**
     * Zoom in
     */
    function zoomIn() {
        var zoom = parseInt(elements.image.style.zoom || 100, 10);
        zoom += 10;
        elements.image.style.zoom = zoom + '%';
    }

    /**
     * Zoom out
     */
    function onMouseDownZoomIn() {
        var timer;
        function onMouseUp() {
            clearInterval(timer);
            elements.toolbar.zoomIn.removeEventListener('mouseup', onMouseUp);
        }
        elements.toolbar.zoomIn.addEventListener('mouseup', onMouseUp, false);
        zoomIn();
        timer = setInterval(zoomIn, 100);
    }

    /**
     * Zoom out
     */
    function zoomOut() {
        var zoom = parseInt(elements.image.style.zoom || 100, 10);
        zoom -= 10;
        elements.image.style.zoom = zoom + '%';
    }

    /**
     * Zoom out
     */
    function onMouseDownZoomOut() {
        var timer;
        function onMouseUp() {
            clearInterval(timer);
            elements.toolbar.zoomOut.removeEventListener('mouseup', onMouseUp);
        }
        elements.toolbar.zoomOut.addEventListener('mouseup', onMouseUp, false);
        zoomOut();
        timer = setInterval(zoomOut, 100);
    }

    /**
     * Zoom reset
     */
    function zoomReset() {
        elements.image.style.zoom = '';
    }

    /**
     * Toggle chess background
     */
    function toggleChess() {
        var currentBg = elements.image.style.backgroundImage;
        elements.image.style.backgroundImage = (!currentBg || currentBg === 'none') ? "url('bg.png')" : "none";
    }

    elements.toolbar.zoomIn.addEventListener('mousedown', onMouseDownZoomIn, false);
    elements.toolbar.zoomOut.addEventListener('mousedown', onMouseDownZoomOut, false);
    elements.toolbar.zoomReset.addEventListener('click', zoomReset, false);
    elements.toolbar.toggleChess.addEventListener('click', toggleChess, false);


    viewer.fireReady();
});
