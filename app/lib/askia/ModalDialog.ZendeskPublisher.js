/**
 * Modal Dialog Plugin
 */
(function (askia) {
    if (!askia || !askia.modalDialog) {
        throw new Error("ModalDialog.js is not loaded, please load it first");
    }

    var modalDialog     = askia.modalDialog,
        autoIncrement   = 0;

    modalDialog.addPlugin('zendeskPublisher', {
        /**
         * Create form
         * @param  modalDialog
         */
        createButtons : function (modalDialog) {
            autoIncrement++;
            modalDialog.elements.preferences = {};
            var root = modalDialog.elements.bodyContainer,
                el   = modalDialog.elements.preferences,
                options = modalDialog.options || {},
                preferences = options.preferences || {},
                author = (preferences.author) || {};
            
            // Add extra class on the dialog box
            modalDialog.elements.dialog.classList.add('zendesk-publisher');
            modalDialog.elements.message.textContent = "Dou you want to publish on zendesk with the following attributes?";

            // Disable Comment
            el.commentDisable = document.createElement('div');
            el.commentDisable.className = 'askia-modal-zendesk-publisher-checkbox-container';

            el.commentDisableInput = document.createElement('input');
            el.commentDisableInput.setAttribute('id', 'modal_zendesk-publisher_commentDisable_' + autoIncrement);
            el.commentDisableInput.setAttribute('type', 'checkbox');
            if (preferences.commentDisable) {
                el.commentDisableInput.setAttribute('checked', 'checked');
            }
            el.commentDisable.appendChild(el.commentDisableInput);

            el.commentDisableLabel = document.createElement('label');
            el.commentDisableLabel.setAttribute('for', 'modal_zendesk-publisher_commentDisable_' + autoIncrement);
            el.commentDisableLabel.innerHTML = "Disable Comment";
            el.commentDisable.appendChild(el.commentDisableLabel);
            
            root.appendChild(el.commentDisable);
            
            // Promoted
            el.promoted = document.createElement('div');
            el.promoted.className = 'askia-modal-zendesk-publisher-checkbox-container';

            el.promotedInput = document.createElement('input');
            el.promotedInput.setAttribute('id', 'modal_zendesk-publisher_promoted_' + autoIncrement);
            el.promotedInput.setAttribute('type', 'checkbox');
            if (preferences.promoted) {
                el.promotedInput.setAttribute('checked', 'checked');
            }
            el.promoted.appendChild(el.promotedInput);

            el.promotedLabel = document.createElement('label');
            el.promotedLabel.setAttribute('for', 'modal_zendesk-publisher_promoted_' + autoIncrement);
            el.promotedLabel.innerHTML = "Promoted";
            el.promoted.appendChild(el.promotedLabel);

            root.appendChild(el.promoted);

            modalDialog.addOkButton();
            modalDialog.addCancelButton();
        },
        /**
         * Validate the form
         * @param modalDialog
         * @param retVal
         */
        validate : function validate(modalDialog, retVal) {
            var el   = modalDialog.elements.preferences;
            retVal.value 	 = {
                promoted 		: el.promotedInput.checked,
                commentDisable 	: el.commentDisableInput.checked
            }
        }
    });

}(window.askia));
