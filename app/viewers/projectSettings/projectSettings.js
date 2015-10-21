window.projectSettings = window.projectSettings || {};

document.addEventListener('DOMContentLoaded', function () {
    var tabs = viewer.tabs;
    var tab = viewer.currentTab;
    var formProjectSettingsEl = document.getElementById("formProjectSettings");

    /**
     * Return the current configuration
     */
    function getCurrentConfig() {
        return {
            info     : window.projectSettings.getCurrentInfo(),
            outputs  : window.projectSettings.getCurrentOutputs(),
            properties : window.projectSettings.getCurrentProperties()
        };
    }

    // Form Submit
    formProjectSettingsEl.addEventListener('submit', function onSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        tabs.onSave(tab.id, getCurrentConfig());
        return false;
    });

    document.body.addEventListener('keydown', function onKeydown(event) {
        var S = 83;
        if (event.keyCode === S && event.ctrlKey) {
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

    // Changes
    window.projectSettings.onchange = function onformchange() {
        var hasChanged = window.projectSettings.hasInfoChanged() ||
                            window.projectSettings.hasOutputsChanged() ||
                            window.projectSettings.hasPropertiesChanged();

        tabs.onContentChange(tab.id, hasChanged);
    };

    viewer.fireReady();
    formProjectSettingsEl.focus();
});