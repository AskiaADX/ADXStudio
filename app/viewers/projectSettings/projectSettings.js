window.projectSettings = window.projectSettings || {};

document.addEventListener('DOMContentLoaded', function () {
  const workspaceView = viewer.workspaceView;
  const tab = viewer.currentTab;
  const formProjectSettingsEl = document.getElementById('formProjectSettings');

  // Make it available in workspace view
  tab.projectSettings = window.projectSettings;

  if (tab.adxType === 'adp') {
    const toHide = document.querySelectorAll('.adc-only');
    for (let i = 0, l = toHide.length; i < l; i += 1) {
      toHide[i].classList.add('not-visible');
    }
  }
  
  if (tab.adxType === 'adc' && tab.adxVersion === '2.1.0') {
    const toHide = document.querySelectorAll('.adc1-only');
    for (let i = 0, l = toHide.length; i < l; i += 1) {
      toHide[i].classList.add('not-visible');
    }
  }

  /**
   * Reload the form
   */
  window.projectSettings.reloadForm = function reloadForm () {
    window.projectSettings.initInfo();
    window.projectSettings.initOutputs();
    window.projectSettings.initProperties();
  };

  /**
   * Return the information if the content has changed
   */
  window.projectSettings.hasChanged = function hasChanged () {
    return window.projectSettings.hasInfoChanged() ||
      window.projectSettings.hasOutputsChanged() ||
      window.projectSettings.hasPropertiesChanged();
  };


  // Changes
  window.projectSettings.onchange = function onformchange () {
    workspaceView.onContentChange(tab.id, window.projectSettings.hasChanged());
  };

  /**
   * Return the current configuration
   */
  window.projectSettings.getCurrentConfig = function getCurrentConfig () {
    return {
      info: window.projectSettings.getCurrentInfo(),
      outputs: window.projectSettings.getCurrentOutputs(),
      properties: window.projectSettings.getCurrentProperties()
    };
  };


  // Form Submit
  viewer.saveContent = function saveContent () {
    workspaceView.onSave(tab.id, window.projectSettings.getCurrentConfig());
  };
  // Save as
  viewer.saveContentAs = function saveContentAs () {
    workspaceView.onSaveAs(tab.id, window.projectSettings.getCurrentConfig());
  };
  // Save and close
  viewer.saveContentAndClose = function saveContentAndClose () {
    workspaceView.onSaveAndClose(tab.id, window.projectSettings.getCurrentConfig());
  };

  formProjectSettingsEl.addEventListener('submit', function onSubmit (event) {
    event.preventDefault();
    event.stopPropagation();
    viewer.saveContent();
    return false;
  });

  document.body.addEventListener('keydown', function onKeydown (event) {
    const S = 83;
    if (event.keyCode === S && event.ctrlKey) {
      event.stopPropagation();
      event.preventDefault();
      formProjectSettingsEl.dispatchEvent(new Event('submit'));
    }
  });


  // Navigation
  document.querySelector('nav').addEventListener('click', function onNavigation (event) {
    const el = event.srcElement;
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