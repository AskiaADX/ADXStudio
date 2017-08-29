/**
 * Modal Dialog Plugin
 */
(function (askia) {
  if (!askia || !askia.modalDialog) {
    throw new Error('ModalDialog.js is not loaded, please load it first');
  }

  const modalDialog = askia.modalDialog;
  let autoIncrement = 0;
  const electron = require('electron');
  const remote = electron.remote;
  const openDialog = remote.dialog;

  /**
   * Show open directory dialog box
   * @param {String} defaultPath
   * @param {Function} callback
   */
  function showOpenDirectory (defaultPath, callback) {
    openDialog.showOpenDialog({
      properties: ['openFile'],
      defaultPath: defaultPath
    }, callback);
  }

  modalDialog.addPlugin('import-design', {
    /**
     * Create form
     * @param  modalDialog
     */
    createButtons: function (modalDialog) {
      autoIncrement++;
      modalDialog.elements.importDesign = {};
      const root = modalDialog.elements.bodyContainer;
      const el = modalDialog.elements.importDesign;
      let i;
      let l;
      let options;

      // Add extra class on the dialog box
      modalDialog.elements.dialog.classList.add('import-design');

      // Title
      el.title = document.createElement('p');
      el.title.className = 'askia-modal-import-design-title';
      el.title.innerHTML = 'Import';

      root.appendChild(el.title);

      // Name
      el.name = document.createElement('div');
      el.name.className = 'askia-modal-import-design-container';

      el.nameLabel = document.createElement('label');
      el.nameLabel.setAttribute('for', 'modal_import_design_name_' + autoIncrement);
      el.nameLabel.innerHTML = 'Target Name:';
      el.name.appendChild(el.nameLabel);

      el.nameInput = document.createElement('input');
      el.nameInput.setAttribute('type', 'text');
      el.nameInput.setAttribute('id', 'modal_import_design_name_' + autoIncrement);
      el.name.appendChild(el.nameInput);
      // Register for the auto focus
      modalDialog.elements.autoFocusOn = el.nameInput;

      root.appendChild(el.name);

      // Path
      el.path = document.createElement('div');
      el.path.className = 'askia-modal-import-design-container';

      el.pathLabel = document.createElement('label');
      el.pathLabel.setAttribute('for', 'modal_import_design_path_' + autoIncrement);
      el.pathLabel.innerHTML = 'Source Path:';
      el.path.appendChild(el.pathLabel);

      el.pathInput = document.createElement('input');
      el.pathInput.setAttribute('id', 'modal_import_design_path_' + autoIncrement);
      el.pathInput.className = 'pathInput';
      el.pathInput.setAttribute('type', 'text');
      el.pathInput.value = '';
      el.path.appendChild(el.pathInput);

      el.pathButton = document.createElement('button');
      el.pathButton.innerHTML = '...';
      el.path.appendChild(el.pathButton);

      root.appendChild(el.path);

      // Question
      el.question = document.createElement('div');
      el.question.className = 'askia-modal-import-design-container';

      el.questionLabel = document.createElement('label');
      el.questionLabel.setAttribute('for', 'modal_import_design_question_' + autoIncrement);
      el.questionLabel.innerHTML = 'Question Name:';
      el.question.appendChild(el.questionLabel);

      el.questionInput = document.createElement('input');
      el.questionInput.setAttribute('type', 'text');
      el.questionInput.setAttribute('id', 'modal_import_design_question_' + autoIncrement);
      el.question.appendChild(el.questionInput);
      // Register for the auto focus
      modalDialog.elements.autoFocusOn = el.questionInput;

      root.appendChild(el.question);

      // OK / Cancel button

      modalDialog.addOkButton();
      modalDialog.addCancelButton();
    },


    /**
     * Listen events
     * @param modalDialog
     */
    listen: function listen (modalDialog) {
      const el = modalDialog.elements.importDesign;
      modalDialog.events = modalDialog.events || {};
      modalDialog.events.browseDirectory = function (event) {
        event.stopPropagation();
        showOpenDirectory(el.pathInput.value, function (folderpath) {
          if (folderpath) {
            el.pathInput.value = folderpath;
          }
        });
      };
      el.pathButton.addEventListener('click', modalDialog.events.browseDirectory);
    },


    /**
     * Remove listeners
     * @param modalDialog
     */
    removeListeners: function removeListeners (modalDialog) {
      if (modalDialog.events) {
        if (modalDialog.events.browseDirectory) {
          const el = modalDialog.elements.importDesign;
          el.pathButton.removeEventListener('click', modalDialog.events.browseDirectory);
        }
      }

    },


    /**
     * Validate the form
     * @param modalDialog
     * @param retVal
     */
    validate: function validate (modalDialog, retVal) {
      const el = modalDialog.elements.importDesign;
      retVal.value = {
        targetName : el.nameInput.value,
        sourcePath : el.pathInput.value,
        currentQuestion : el.questionInput.value
      };
      if (!retVal.value.targetName) {
        askia.modalDialog.show({
          type: 'okOnly',
          message: 'The `name` parameter is require'
        });
        return false;
      }
      if (!retVal.value.sourcePath) {
        askia.modalDialog.show({
          type: 'okOnly',
          message: 'The `source path` parameter is require'
        });
        return false;
      }
      if (!retVal.value.currentQuestion) {
        askia.modalDialog.show({
          type: 'okOnly',
          message: 'The `question name` parameter is require'
        });
        return false;
      }
    }
  });

}(window.askia));
