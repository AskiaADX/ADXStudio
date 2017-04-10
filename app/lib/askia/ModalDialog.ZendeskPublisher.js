/**
 * Modal Dialog Plugin
 */
(function (askia) {
  if (!askia || !askia.modalDialog) {
    throw new Error('ModalDialog.js is not loaded, please load it first');
  }

  const modalDialog = askia.modalDialog;
  let autoIncrement = 0;

  modalDialog.addPlugin('zendeskPublisher', {
    /**
     * Create form
     * @param  modalDialog
     */
    createButtons: function (modalDialog) {
      autoIncrement++;
      modalDialog.elements.preferences = {};
      let root = modalDialog.elements.bodyContainer;
      let el = modalDialog.elements.preferences;
      let options = modalDialog.options || {};
      let preferences = options.preferences || {};

      // Add extra class on the dialog box
      modalDialog.elements.dialog.classList.add('zendesk-publisher');
      modalDialog.elements.message.textContent = 'Dou you want to publish on zendesk with the following attributes?';

      // Server Demo url
      el.demoUri = document.createElement('div');
      el.demoUri.className = 'askia-modal-zendesk-publisher-container';

      el.demoUriLabel = document.createElement('label');
      el.demoUriLabel.setAttribute('for', 'modal_preferences_demoUri_' + autoIncrement);
      el.demoUriLabel.innerHTML = 'Demo url:';
      el.demoUri.appendChild(el.demoUriLabel);

      el.demoUriInput = document.createElement('input');
      el.demoUriInput.setAttribute('id', 'modal_preferences_demoUri_' + autoIncrement);
      el.demoUriInput.setAttribute('type', 'text');
      if (preferences.uriDemo) {
        el.demoUriInput.value = preferences.uriDemo;
      }
      el.demoUri.appendChild(el.demoUriInput);

      root.appendChild(el.demoUri);

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
      el.commentDisableLabel.innerHTML = 'Disable Comment';
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
      el.promotedLabel.innerHTML = 'Promoted';
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
    validate: function validate (modalDialog, retVal) {
      const el = modalDialog.elements.preferences;
      retVal.value = {
        promoted: el.promotedInput.checked,
        commentDisable: el.commentDisableInput.checked,
        uriDemo: el.demoUriInput.value
      }
    }
  });

}(window.askia));
