
window.projectSettings = window.projectSettings || {};

document.addEventListener('DOMContentLoaded', function () {
  const tab = viewer.currentTab;
  let infoChanges = null;


  document.getElementById('info').addEventListener('change', function onFormChange (event) {
    const info = tab.adxConfig.info;
    const element = event.srcElement;
    const name = element.name;
    const rg = /([^\[]+)(?:\[([^\]]+)\])?/;
    const matches = rg.exec(name);
    let topKey = null;
    const key = matches[1];
    const subKey = matches[2];
    let originalValue = info[key];
    let currentValue = element.value;

    if (key === 'questions' || key === 'responses' || key === 'controls') {
      topKey = 'constraints';
      originalValue = info[topKey];
      if (originalValue) {
        originalValue = originalValue[key];
      }
    }

    if (subKey) {
      if (originalValue) {
        originalValue = originalValue[subKey];
      } else {
        originalValue = undefined;
      }
    }

    if (element.getAttribute('type') === 'number') {
      if (currentValue) {
        currentValue = parseInt(currentValue, 10);
      }
    } else if (element.getAttribute('type') === 'checkbox') {
      currentValue = element.checked;
    }

    if (key === 'categories') {
      currentValue = currentValue.split(/\s*,\s*/);
    }

    /* Don't use strict equality just in case */
    if (originalValue !== currentValue) {

      // Register the change
      if (!infoChanges) {
        infoChanges = {};
      }
      if (topKey && !infoChanges[topKey]) {
        infoChanges[topKey] = {};
      }
      if (!subKey) {
        if (topKey) {
          infoChanges[topKey][key] = currentValue;
        } else {
          infoChanges[key] = currentValue;
        }
      } else {
        if (topKey && !infoChanges[topKey][key]) {
          infoChanges[topKey][key] = {};
        }        else if (!topKey && !infoChanges[key]) {
          infoChanges[key] = {};
        }

        if (topKey) {
          infoChanges[topKey][key][subKey] = currentValue;
        } else {
          infoChanges[key][subKey] = currentValue;
        }
      }

    } else {

      // Restore the original
      if (infoChanges) {
        if (!subKey) {
          if (topKey) {
            delete infoChanges[topKey][key];
          } else {
            delete infoChanges[key];
          }
        } else {
          if (topKey) {
            delete infoChanges[topKey][key][subKey];
            if (!Object.keys(infoChanges[topKey][key]).length) {
              delete infoChanges[topKey][key];
            }
          } else {
            delete infoChanges[key][subKey];
            if (!Object.keys(infoChanges[key]).length) {
              delete infoChanges[key];
            }
          }
        }
      }

      if (topKey && !Object.keys(infoChanges[topKey]).length) {
        delete infoChanges[topKey];
      }

      if (infoChanges && !Object.keys(infoChanges).length) {
        infoChanges = null;
      }
    }

    window.projectSettings.onchange();
  });

  /**
   * Initialize the info
   */
  window.projectSettings.initInfo = function initInfo () {
    infoChanges = null;

    const info = tab.adxConfig.info;
    let key;
    let constraints;

    // Set the textual-information
    const infoText = ['name', 'guid', 'date', 'version', 'description', 'helpURL', 'author', 'company', 'site'];
    for (let i = 0, l = infoText.length; i < l; i += 1) {
      document.getElementById(infoText[i]).value = (info[infoText[i]] || '').trim();
    }

    if (tab.adxType === 'adc' && tab.adxVersion === '2.0.0') {
      // Special case for the style which uses 2 data (width and height)
      if (info.style) {
        if (typeof info.style.width === 'number') {
          document.getElementById('style_width').value = info.style.width;
        }
        if (typeof info.style.height === 'number') {
          document.getElementById('style_height').value = info.style.height;
        }
      }
      // Set the categories in the textbox
      if (Array.isArray(info.categories)) {
        document.getElementById('categories').value = info.categories.join(', ');
      }
    }

    if (tab.adxType === 'adc') {
      // Set the constraints information
      const infoConstraints = {
        questions: ['chapter', 'single', 'multiple', 'numeric', 'open', 'date', 'requireParentLoop'],
        responses: ['min', 'max'],
        controls: ['responseblock', 'label', 'textbox', 'listbox', 'checkbox', 'radiobutton']
      };

      for (key in infoConstraints) {
        if (infoConstraints.hasOwnProperty(key)) {
          constraints = infoConstraints[key];
          for (i = 0, l = constraints.length; i < l; i++) {
            if (key === 'responses') {
              document.getElementById(key + '_' + constraints[i]).value = (info.constraints[key] && info.constraints[key][constraints[i]].replace('*', '')) || '';
            } else {
              document.getElementById(key + '_' + constraints[i]).checked = (info.constraints[key] && info.constraints[key][constraints[i]]) || false;
            }

          }
        }
      }
    }
  };

  /**
   * Return the current info object
   */
  window.projectSettings.getCurrentInfo = function getCurrentInfo () {
    let key;
    let constraints;
    const objInfo = {};

    // Set the textual-information
    const infoText = ['name', 'guid', 'date', 'version', 'description', 'helpURL', 'author', 'company', 'site'];
    for (let i = 0, l = infoText.length; i < l; i += 1) {
      objInfo[infoText[i]] = document.getElementById(infoText[i]).value.trim();
    }

    if (tab.adxType === 'adc' && tab.adxVersion === '2.0.0') {
      // Special case for the style which uses 2 data (width and height)
      if (document.getElementById('style_width').value || document.getElementById('style_height').value) {
        objInfo.style = {
          width: parseInt(document.getElementById('style_width').value, 10) || 0,
          height: parseInt(document.getElementById('style_height').value, 10) || 0
        };
      }
    }

    if (tab.adxType === 'adc' && tab.adxVersion === '2.0.0') {
      // Set the categories in the textbox
      objInfo.categories = document.getElementById('categories').value.split(/\s*,\s*/);
    }

    if (tab.adxType === 'adc') {
      // Set the constraints information
      const infoConstraints = {
        questions: ['chapter', 'single', 'multiple', 'numeric', 'open', 'date', 'requireParentLoop'],
        responses: ['min', 'max'],
        controls: ['responseblock', 'label', 'textbox', 'listbox', 'checkbox', 'radiobutton']
      };

      objInfo.constraints = {};
      for (key in infoConstraints) {
        if (infoConstraints.hasOwnProperty(key)) {
          objInfo.constraints[key] = {};
          constraints = infoConstraints[key];
          for (i = 0, l = constraints.length; i < l; i++) {
            if (key === 'responses') {
              objInfo.constraints[key][constraints[i]] = parseInt(document.getElementById(key + '_' + constraints[i]).value) || '*';
            } else {
              objInfo.constraints[key][constraints[i]] = document.getElementById(key + '_' + constraints[i]).checked;
            }
          }
        }
      }
    }

    return objInfo;
  };

  /**
   * Indicates if the info has changed
   * @returns {boolean}
   */
  window.projectSettings.hasInfoChanged = function hasInfoChanged () {
    return !!infoChanges;
  };

  window.projectSettings.initInfo();

});