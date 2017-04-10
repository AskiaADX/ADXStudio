/**
 * Global namespace
 */
window.askia = window.askia || {};

window.askia.modalDialog = (function () {

  // Stack of displayed modal
  let modalStack = [];

    // Current instance
  let currentInstance;

    // Modal plugins
  let plugins = {};

  const KEY_ENTER = 13;
  const KEY_ESC = 27;

  // Global event on keydown
  function onDialogKeydown (event) {
    if (event.keyCode === KEY_ENTER) {
      currentInstance.validate();
    }    else if (event.keyCode === KEY_ESC) {
      currentInstance.cancel();
    }
  }

  // Global event on click
  function onDialogClick (event) {
    const el = event.target || event.srcElement;
    const key = el.getAttribute('data-key');

    if (key) {
      if (key === 'cancel') {
        currentInstance.cancel();
      } else {
        currentInstance.validate(key);
      }
    }
  }

  /**
   * Create a new instance of modal dialog
   * @constructor
   * @param {Object|String} options Options or Message to display
   * @param {String} options.message Message to display
   * @param {String|"okOnly"|"yesNoCancel"|"prompt"|"yesNo"|"okCancel"} [options.type='okOnly'] type of the dialog
   * @param {Object} [options.buttonText] Text of the buttons
   * @param {String} [options.buttonText.ok='Ok'] Text of the Ok button
 * @param {String} [options.buttonText.yes='Yes'] Text of the Yes button
 * @param {String} [options.buttonText.no='No'] Text of the No button
 * @param {String} [options.buttonText.cancel='Cancel'] Text of the Cancel button
   * @param {String} [options.value=''] Initial value for prompt dialog
   * @param {Function} [callback] callback
   * @param {Object} [callback.retVal] Return value
   * @param {String|"ok"|"cancel"|"yes"|"no"} callback.retVal.button Indicates which button has been clicked
   * @param {String} [callback.retVal.value] User input for prompt dialog
   */
  function ModalDialog (options, callback) {
    this.options = {};
    if (typeof options === 'string') {
      this.options.message = options;
    } else {
      this.options = options || this.options;
    }

    // Default values
    this.options.type = this.options.type || 'okOnly';
    this.options.message = this.options.message || '';
    this.options.value = this.options.value || '';

    const defaultButtonText = {
      ok: 'Ok',
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel'
    };

    if (!this.options.buttonText) {
      this.options.buttonText = defaultButtonText;
    }
    this.options.buttonText.ok = this.options.buttonText.ok || defaultButtonText.ok;
    this.options.buttonText.yes = this.options.buttonText.yes || defaultButtonText.yes;
    this.options.buttonText.no = this.options.buttonText.no || defaultButtonText.no;
    this.options.buttonText.cancel = this.options.buttonText.cancel || defaultButtonText.cancel;

    // Plugin associated with the type of the current modal
    this.plugin = plugins[this.options.type] || null;

    // HTML Elements
    this.elements = {};

    // Register the end callback
    this.callback = callback || null;

    this.createElements().listen();

    currentInstance = this;
    modalStack.push(currentInstance);
  }


  /**
   * Add Global  Listener events
   * @static
   */
  ModalDialog.addGlobalListener = function listen () {
    if (ModalDialog.isListening) {
      return;
    }
    document.body.addEventListener('keydown', onDialogKeydown);
    document.body.addEventListener('click', onDialogClick);
    ModalDialog.isListening = true;
  };


  /**
   * Remove Global  Listener events
   * @static
   */
  ModalDialog.removeGlobalListeners = function removeListeners () {
    if (modalStack.length === 0) {
      document.body.removeEventListener('keydown', onDialogKeydown);
      document.body.removeEventListener('click', onDialogClick);
      ModalDialog.isListening = false;
    }
  };


  /**
   * Create all HTML Elements
   * @chainable
   */
  ModalDialog.prototype.createElements = function createElements () {
    const initialZIndex = 1000 + modalStack.length;
    const el = this.elements;

    // Wrapper
    el.wrapper = document.createElement('div');
    el.wrapper.className = 'askia-modal-wrapper';
    el.wrapper.style.zIndex = initialZIndex;

    // Dialog box
    el.dialog = document.createElement('div');
    el.dialog.className = 'askia-modal-dialog';
    el.dialog.style.zIndex = initialZIndex + 1;
    el.wrapper.appendChild(el.dialog);

    // Register for the auto-focus on start up
    el.autoFocusOn = el.dialog;

    // Message elements
    el.messageContainer = document.createElement('div');
    el.messageContainer.className = 'askia-modal-message-container';

    el.message = document.createElement('div');
    el.message.className = 'askia-modal-message';
    el.message.innerHTML = this.options.message;

    el.messageContainer.appendChild(el.message);
    el.dialog.appendChild(el.messageContainer);

    el.bodyContainer = document.createElement('div');
    el.bodyContainer.className = 'askia-modal-body-container';
    el.dialog.appendChild(el.bodyContainer);

    // Buttons
    el.buttonsContainer = document.createElement('div');
    el.buttonsContainer.className = 'askia-modal-buttons-container';

    if (!this.plugin || typeof this.plugin.createButtons !== 'function') {
      switch (this.options.type) {
      case 'yesNo':
        this.addYesNoButtons();
        break;
      case 'yesNoCancel':
        this.addYesNoButtons();
        this.addCancelButton();
        break;
      case 'prompt':
        el.prompt = document.createElement('input');
        el.prompt.setAttribute('type', 'text');
        el.prompt.className = 'askia-modal-input-prompt';
        el.prompt.value = this.options.value;
        el.bodyContainer.appendChild(el.prompt);
          // Register for the auto-focus on start up
        el.autoFocusOn = el.prompt;
        this.addOkButton();
        this.addCancelButton();
        break;
      case 'okCancel':
        this.addOkButton();
        this.addCancelButton();
        break;
      default: // okOnly
        this.addOkButton();
        break;
      }
    } else {
      this.plugin.createButtons(this);
    }

    el.dialog.appendChild(el.buttonsContainer);


    // Lightbox
    el.lightbox = document.createElement('div');
    el.lightbox.className = 'askia-modal-lightbox';
    el.lightbox.style.zIndex = initialZIndex;

    if (this.plugin && typeof this.plugin.beforeDisplay === 'function') {
      this.plugin.beforeDisplay(this);
    }

    // Append it in the document
    document.body.appendChild(el.lightbox);
    document.body.appendChild(el.wrapper);

    el.autoFocusOn.focus();

    return this;
  };

  /**
   * Add `yes/no` buttons
   * @chainable
   */
  ModalDialog.prototype.addYesNoButtons = function addYesNoButtons () {
    const btnText = this.options.buttonText;
    return this.addButton('yes', 'yes', btnText.yes)
      .addButton('no', 'no', btnText.no);
  };

  /**
   * Add `ok` button
   * @chainable
   */
  ModalDialog.prototype.addOkButton = function addOkButton () {
    const btnText = this.options.buttonText;
    return this.addButton('ok', 'ok', btnText.ok);
  };

  /**
   * Add `cancel` button
   * @chainable
   */
  ModalDialog.prototype.addCancelButton = function addCancelButton () {
    const btnText = this.options.buttonText;
    return this.addButton('cancel', 'cancel', btnText.cancel);
  };

  /**
   * Create an HTML Element that represent a button and add it into the buttons container element
   * @param {String} key To retrieve it in the elements collection
   * @param {String} className Class name of the button (auto-prefix with 'askia-modal-button-'
   * @param {String} text Text of the button
   * @chainable
   */
  ModalDialog.prototype.addButton = function addButton (key, className, text) {
    this.elements[key] = document.createElement('button');
    const el = this.elements[key];
    el.className = 'askia-modal-button-' + className;
    el.setAttribute('data-key', key);
    el.innerHTML = text;
    this.elements.buttonsContainer.appendChild(el);
    return this;
  };


  /**
   * Listen
   * @chainable
   */
  ModalDialog.prototype.listen = function listen () {
    ModalDialog.addGlobalListener();

    if (this.plugin && typeof this.plugin.listen === 'function') {
      this.plugin.listen(this);
    }

    const self = this;
    this.removeListeners = function removeListeners () {
      ModalDialog.removeGlobalListeners();

      if (self.plugin && typeof self.plugin.removeListeners === 'function') {
        self.plugin.removeListeners(self);
      }
      return self;
    };

    return this;
  };

  /**
   * Remove all listeners
   * @chainable
   */
  ModalDialog.prototype.removeListeners = function removeListeners () {
    /* Implemented inside #listen() */
  };

  /**
   * Validate the form (ok, yes, no)
   * @param {String} [buttonKey='ok|yes'] Button pressed
   */
  ModalDialog.prototype.validate = function validate (buttonKey) {
    const retVal = {
      button: buttonKey || (/yes/.test(this.options.type) ? 'yes' : 'ok')
    };

    if (this.elements.prompt) {
      retVal.value = this.elements.prompt.value;
    }

    if (this.plugin && typeof this.plugin.validate === 'function') {
      const pluginRetVal = this.plugin.validate(this, retVal);
      if (typeof pluginRetVal === 'boolean' && !pluginRetVal) {
        return;
      }
    }

    if (typeof this.callback === 'function') {
      this.callback(retVal);
    }

    this.close();
  };

  /**
   * Cancel the form (cancel)
   */
  ModalDialog.prototype.cancel = function cancel () {
    if (typeof this.callback === 'function') {
      this.callback({
        button: 'cancel'
      });
    }
    this.close();
  };

  /**
   * Close the modal
   */
  ModalDialog.prototype.close = function close () {
    modalStack.pop(); // Unstack
    currentInstance = modalStack[modalStack.length - 1]; // Unstack
    this.removeListeners();
    document.body.removeChild(this.elements.wrapper);
    document.body.removeChild(this.elements.lightbox);
  };

  return {
    /**
     * Add a modal dialog plugin
     * @param {String} type Type of the modal dialog
     * @param {Object} plugin Plugin
     * @param {Function} [plugin.createButtons] Method used to customize the button
     * @param {ModalDialog} {plugin.createButtons.modalDialog} Instance of the ModalDialog
     * @param {Function} {plugin.listen} Method to listen extra events
     * @param {ModalDialog} {plugin.listen.modalDialog} Instance of the ModalDialog
     * @param {Function} {plugin.removeListeners} Method to remove extra listeners
     * @param {ModalDialog} {plugin.removeListeners.modalDialog} Instance of the ModalDialog
     * @param {Function} {plugin.validate} Use to prepare the return value for the callback
     * @param {ModalDialog} {plugin.validate.modalDialog} Instance of the ModalDialog
     * @param {ModalDialog} {plugin.validate.retVal} Return value
     */
    addPlugin: function addPlugin (type, plugin) {
      plugins[type] = plugin;
    },
    /**
     * Show a modal dialog
     *
     *
     *       askia.modalDialog.show({
     *          type : 'prompt',
     *          message : 'Please enter the new name',
     *          value : value
     *       }, function (retVal) {
     *          console.log(retVal.button);
     *          console.log(retVal.value);
     *       });
     *
     *       askia.modalDialog.show({
     *          type : 'yesNoCancel',
     *          message : 'Are you sure to continue?'
     *       }, function (retVal) {
     *           console.log(retVal.button);
     *       });
     *
     * @param {Object} options Configuration of modalDialog.
     * @param {String|"okOnly"|"yesNoCancel"|"prompt"|"yesNo"|"okCancel"} options.type type of the modal.
     * @param {String} options.value initial value for prompt window.
     * @param {Function} [callback] callback
     * @return {ModalDialog} Return the instance of the ModalDialog
     */
    show: function showModalDialog (options, callback) {
      return new ModalDialog(options, callback);
    },
    /**
     * Close the current modal dialog
     */
    close: function closeModalDialog () {
      if (currentInstance) {
        currentInstance.close();
      }
    }
  };
}());
