/**
 * Modal Dialog Plugin
 */
(function (askia) {
    if (!askia || !askia.modalDialog) {
        throw new Error("NodalDialog.js is not loaded, please load it first");
    }

    var modalDialog     = askia.modalDialog;

    modalDialog.addPlugin('loader', {
        /**
         * Create form
         * @param  modalDialog
         */
        createButtons : function (modalDialog) {
            modalDialog.elements.newProject = {};
            var root = modalDialog.elements.bodyContainer,
                el   = modalDialog.elements.newProject,
                i, l,
                templateList =  askia.modalDialog.adctemplates,
                options;

            // Add extra class on the dialog box
            modalDialog.elements.dialog.classList.add('loader');

            // Override the validation and cancellation
            modalDialog.validate = function dummyValidate() {};
            modalDialog.cancel = function dummyCancel(){};
        }
    });

}(window.askia));

