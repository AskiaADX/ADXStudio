/**
 * Modal Dialog Plugin
 */
(function (askia) {
  if (!askia || !askia.modalDialog) {
    throw new Error('ModalDialog.js is not loaded, please load it first');
  }

  const modalDialog = askia.modalDialog;
  let autoIncrement = 0;
  // const electron = require('electron');
  // const remote = electron.remote;
  const remote = require('@electron/remote');
  const openDialog = remote.dialog;

  /**
   * Show open directory dialog box
   * @param {String} defaultPath
   * @param {Function} callback
   */
  function showOpenDirectory (defaultPath, callback) {
    openDialog.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath: defaultPath
    }).then((result)=>{
      if(callback && result.filePaths && result.filePaths.length) {
        callback(result.filePaths[0]);
      }
    });
  }

  modalDialog.addPlugin('newADXProject', {
    /**
     * Create form
     * @param  modalDialog
     */
    createButtons: function (modalDialog) {
      autoIncrement++;
      modalDialog.elements.newProject = {};
      const root = modalDialog.elements.bodyContainer;
      const el = modalDialog.elements.newProject;
      let i;
      let l;
      let options;

      const templateList = {
        adc: (modalDialog.options && modalDialog.options.adcTemplates),
        adp: (modalDialog.options && modalDialog.options.adpTemplates),
        default: [
          { name: 'blank' },
          { name: 'all' }
        ]
      }

      // Add extra class on the dialog box
      modalDialog.elements.dialog.classList.add('new-project');

      // Title
      el.title = document.createElement('p');
      el.title.className = 'askia-modal-new-project-title';
      el.title.innerHTML = 'Create a new project';

      root.appendChild(el.title);

      // Type
      el.type = document.createElement('div');
      el.type.className = 'askia-modal-new-project-container';

      el.typeLabel = document.createElement('label');
      el.typeLabel.setAttribute('for', 'modal_new_proj_type_' + autoIncrement);
      el.typeLabel.innerHTML = 'Type:';
      el.type.appendChild(el.typeLabel);

      el.typeInput = document.createElement('select');
      el.typeInput.setAttribute('id', 'modal_new_proj_type_' + autoIncrement);

      let types = ['adc', 'adp'];
      let option
      for (let i = 0, l = types.length; i < l; i += 1) {
        let type = types[i];
        option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        el.typeInput.appendChild(option);
      }

      el.type.appendChild(el.typeInput);
      root.appendChild(el.type);

      // Name
      el.name = document.createElement('div');
      el.name.className = 'askia-modal-new-project-container';

      el.nameLabel = document.createElement('label');
      el.nameLabel.setAttribute('for', 'modal_new_proj_name_' + autoIncrement);
      el.nameLabel.innerHTML = 'Name:';
      el.name.appendChild(el.nameLabel);

      el.nameInput = document.createElement('input');
      el.nameInput.setAttribute('type', 'text');
      el.nameInput.setAttribute('id', 'modal_new_proj_name_' + autoIncrement);
      el.name.appendChild(el.nameInput);
      // Register for the auto focus
      modalDialog.elements.autoFocusOn = el.nameInput;

      root.appendChild(el.name);

      // Path
      el.path = document.createElement('div');
      el.path.className = 'askia-modal-new-project-container';

      el.pathLabel = document.createElement('label');
      el.pathLabel.setAttribute('for', 'modal_new_proj_path_' + autoIncrement);
      el.pathLabel.innerHTML = 'Path:';
      el.path.appendChild(el.pathLabel);

      el.pathInput = document.createElement('input');
      el.pathInput.setAttribute('id', 'modal_new_proj_path_' + autoIncrement);
      el.pathInput.className = 'pathInput';
      el.pathInput.setAttribute('type', 'text');
      el.pathInput.value = (modalDialog.options && modalDialog.options.defaultRootDir) || '';
      el.path.appendChild(el.pathInput);

      el.pathButton = document.createElement('button');
      el.pathButton.innerHTML = '...';
      el.path.appendChild(el.pathButton);

      root.appendChild(el.path);

      // Description
      el.description = document.createElement('div');
      el.description.className = 'askia-modal-new-project-container';

      el.descriptionLabel = document.createElement('label');
      el.descriptionLabel.setAttribute('for', 'modal_new_proj_desc_' + autoIncrement);
      el.descriptionLabel.innerHTML = 'Description:';
      el.description.appendChild(el.descriptionLabel);

      el.descriptionInput = document.createElement('textarea');
      el.descriptionInput.setAttribute('id', 'modal_new_proj_desc_' + autoIncrement);
      el.description.appendChild(el.descriptionInput);

      root.appendChild(el.description);

      // Template to use
      el.template = document.createElement('div');
      el.template.className = 'askia-modal-new-project-container';

      el.templateLabel = document.createElement('label');
      el.templateLabel.setAttribute('for', 'modal_new_proj_template_' + autoIncrement);
      el.templateLabel.innerHTML = 'Template:';
      el.template.appendChild(el.templateLabel);

      el.templateInput = document.createElement('select');
      el.templateInput.setAttribute('id', 'modal_new_proj_template_' + autoIncrement);
      options = [];
      for (i = 0, l = templateList.default.length; i < l; i++) {
        options.push('<option value="' + templateList.default[i].name + '">' + templateList.default[i].name + '</option>');
      }
      el.templateInput.innerHTML = options.join('');
      el.template.appendChild(el.templateInput);
      root.appendChild(el.template);

      // OK / Cancel button

      modalDialog.addOkButton();
      modalDialog.addCancelButton();


      el.typeInput.addEventListener('change', function () {
        const type = this.selectedOptions[0].innerHTML;
        options = [];
        for (i = 0, l = templateList[type].length; i < l; i++) {
          options.push('<option value="' + templateList[type][i].name + '">' + templateList[type][i].name + '</option>');
        }
        el.templateInput.innerHTML = options.join('');
      });
    },


    /**
     * Listen events
     * @param modalDialog
     */
    listen: function listen (modalDialog) {
      const el = modalDialog.elements.newProject;
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
          const el = modalDialog.elements.newProject;
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
      const el = modalDialog.elements.newProject;
      retVal.value = {
        projectType: el.typeInput.value,
        name: el.nameInput.value,
        path: el.pathInput.value,
        description: el.descriptionInput.value,
        template: el.templateInput.value
      };
      if (!retVal.value.name) {
        askia.modalDialog.show({
          type: 'okOnly',
          message: 'The `name` parameter is require'
        });
        return false;
      }
    }
  });

}(window.askia));
