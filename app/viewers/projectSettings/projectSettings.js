window.projectSettings = window.projectSettings || {};

document.addEventListener('DOMContentLoaded', function () {
    var tabs = viewer.tabs;
    var tab = viewer.currentTab;
    var formProjectSettingsEl = document.getElementById("formProjectSettings");

    // Make it available in workspace view
    tab.projectSettings = window.projectSettings;

    /**
     * Reload the form
     */
    window.projectSettings.reloadForm = function reloadForm() {
        window.projectSettings.initInfo();
        window.projectSettings.initOutputs();
        window.projectSettings.initProperties();
    };

    /**
     * Return the information if the content has changed
     */
    window.projectSettings.hasChanged = function hasChanged() {
        return window.projectSettings.hasInfoChanged() ||
            window.projectSettings.hasOutputsChanged() ||
            window.projectSettings.hasPropertiesChanged();
    };


    // Changes
    window.projectSettings.onchange = function onformchange() {
        tabs.onContentChange(tab.id, window.projectSettings.hasChanged());
    };

    /**
     * Return the current configuration
     */
    window.projectSettings.getCurrentConfig  = function getCurrentConfig() {
        return {
            info     : window.projectSettings.getCurrentInfo(),
            outputs  : window.projectSettings.getCurrentOutputs(),
            properties : window.projectSettings.getCurrentProperties()
        };
    };


    // Form Submit
    viewer.saveContent = function saveContent() {
        tabs.onSave(tab.id, window.projectSettings.getCurrentConfig());
    };
    // Save as
    viewer.saveContentAs = function saveContentAs() {
        tabs.onSaveAs(tab.id, window.projectSettings.getCurrentConfig());
    };
    // Save and close
    viewer.saveContentAndClose = function saveContentAndClose() {
        tabs.onSaveAndClose(tab.id, window.projectSettings.getCurrentConfig());
    };

    formProjectSettingsEl.addEventListener('submit', function onSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        viewer.saveContent();
        return false;
    });

    document.body.addEventListener('keydown', function onKeydown(event) {
        var S = 83;
        if (event.keyCode === S && event.ctrlKey) {
            event.stopPropagation();
            event.preventDefault();
            formProjectSettingsEl.dispatchEvent(new Event('submit'));
        }
    });


    // Navigation
    document.querySelector('nav').addEventListener('click', function onNavigation(event) {
        var el = event.srcElement;
        if (el.tagName.toLowerCase() === 'a') {
            event.preventDefault();
            event.stopPropagation();


            // Previous selection
            this.querySelector('.active').classList.remove('active');
            formProjectSettingsEl.querySelector('.active').classList.remove('active');

            // Current selection
            el.classList.add('active');
            formProjectSettingsEl.querySelector(el.getAttribute('href')).classList.add('active');

            return false;
        }
    });


    viewer.fireReady();
    formProjectSettingsEl.focus();
});