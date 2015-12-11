/**
 * Modal Dialog Plugin
 */
(function (askia) {
    if (!askia || !askia.modalDialog) {
        throw new Error("NodalDialog.js is not loaded, please load it first");
    }

    var modalDialog     = askia.modalDialog,
        autoIncrement   = 0,
        electron        = require('electron'),
        remote          = electron.remote,
        openDialog      = remote.dialog;

    /**
     * Show open directory dialog box
     * @param {String} defaultPath
     * @param {Function} callback
     */
    function showOpenDirectory(defaultPath, callback) {
        openDialog.showOpenDialog({
            properties: ['openDirectory'],
            defaultPath : defaultPath
        }, callback);
    }

    modalDialog.addPlugin('newADCProject', {
        /**
         * Create form
         * @param  modalDialog
         */
        createButtons : function (modalDialog) {
            autoIncrement++;
            modalDialog.elements.newProject = {};
            var root = modalDialog.elements.bodyContainer,
                el   = modalDialog.elements.newProject,
                i, l,
                templateList =  (modalDialog.options && modalDialog.options.adcTemplates) || [
                        { name : 'blank'},
                        {name : 'all'}
                    ],
                options;

            // Add extra class on the dialog box
            modalDialog.elements.dialog.classList.add('new-project');

            // Title
            el.title = document.createElement('p');
            el.title.className = 'askia-modal-new-project-title';
            el.title.innerHTML = 'Create a new ADX project';

            root.appendChild(el.title);

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
            el.pathInput.value = (modalDialog.options && modalDialog.options.defaultRootDir) || "";
            el.path.appendChild(el.pathInput);

            el.pathButton = document.createElement('button');
            el.pathButton.innerHTML = "...";
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
            for (i = 0, l = templateList.length; i < l; i++) {
                options.push('<option value="' + templateList[i].name + '">' + templateList[i].name + '</option>');
            }
            el.templateInput.innerHTML = options.join('');
            el.template.appendChild(el.templateInput);
            root.appendChild(el.template);

            // OK / Cancel button

            modalDialog.addOkButton();
            modalDialog.addCancelButton();
        },


        /**
         * Listen events
         * @param modalDialog
         */
        listen        : function listen(modalDialog) {
            var el   = modalDialog.elements.newProject;
            modalDialog.events  = modalDialog.events || {};
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
        removeListeners : function removeListeners(modalDialog) {
            if (modalDialog.events) {
                if (modalDialog.events.browseDirectory) {
                    var el   = modalDialog.elements.newProject;
                    el.pathButton.removeEventListener('click', modalDialog.events.browseDirectory);
                }
            }

        },


        /**
         * Validate the form
         * @param modalDialog
         * @param retVal
         */
        validate : function validate(modalDialog, retVal) {
            var el   = modalDialog.elements.newProject;
            retVal.value = {
                name : el.nameInput.value,
                path : el.pathInput.value,
                description : el.descriptionInput.value,
                template : el.templateInput.value
            };
        }
    });

}(window.askia));
