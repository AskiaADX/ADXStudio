/**
 * Modal Dialog Plugin
 */
(function (askia) {
  if (!askia || !askia.modalDialog) {
    throw new Error('ModalDialog.js is not loaded, please load it first');
  }

  const modalDialog = askia.modalDialog;

  modalDialog.addPlugin('about', {
    /**
     * Create form
     * @param  modalDialog
     */
    createButtons: function (modalDialog) {
      const dialogEl = modalDialog.elements.dialog;
      const options = modalDialog.options;
      const optApp = options.app;
      const appVersion = (optApp && optApp.version) || 'undefined';

      // Add extra class on the dialog box
      dialogEl.classList.add('about');

      dialogEl.innerHTML = [
        '<section class="main">',
        '<div class="left">',
        '</div>',
        '<div class="right">',
        '<h3>ADX Studio</h3>',
        '<h4>Askia Design eXtension Studio</h4>',
        '<p>version ' + appVersion + '</p>',
        '<p>Maxime Gasnier, Vincent Tellier, Louis Ledoux, Mamadou Sy, Paul Nevin, Mehdi Ait Bachir, J&#233;r&#244;me Duparc, J&#233;r&#244;me Sopo&#231;ko, Robbe Van der Gucht</p>',
        '<p>Sections of this application use or are based upon third-party technologies: <a href="http://electron.atom.io/" target="_blank">Electron</a>, <a href="https://nodejs.org/en/" target="_blank">NodeJS</a>.</p>',
        '<p>Made with <span style="color: #e74c3c">&hearts;</span> in Paris at <a href="http://www.askia.com/" target="_blank">Askia</a> &copy; 2017 all rights reserved.</p></div>',
        '</div>',
        '</section>'
      ].join('');
    },
    beforeDisplay: function (modalDialog) {
      // Remove extra elements before to display
      const el = modalDialog.elements;
      el.dialog.removeChild(el.buttonsContainer);
    },
    listen: function (modalDialog) {
      const el = modalDialog.elements;
      el.wrapper.addEventListener('click', function (event) {
        if (event.srcElement !== el.wrapper) {
          return;
        }
        modalDialog.close();
      });
    }

  });

}(window.askia));
