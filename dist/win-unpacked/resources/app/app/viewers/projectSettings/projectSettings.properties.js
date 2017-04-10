
window.projectSettings = window.projectSettings || {};

document.addEventListener('DOMContentLoaded', function () {
  const tab = viewer.currentTab;
  const categoriesListEl = document.getElementById('categories_list');
  const propertiesEl = document.getElementById('properties_table');
  const propertiesBodyEl = propertiesEl.querySelector('tbody');
  const innerFormEl = document.getElementById('property_inner_form');
  const innerFormInitialParentEl = innerFormEl.parentNode;
  const elPropType = document.getElementById('property_type');
  const elTypeString = innerFormEl.querySelector('.property-type-string');
  const elTypeNumber = innerFormEl.querySelector('.property-type-number');
  const elTypeColor = innerFormEl.querySelector('.property-type-color');
  const elTypeQuestion = innerFormEl.querySelector('.property-type-question');
  const elTypeFile = innerFormEl.querySelector('.property-type-file');
  const elPropOptionList = innerFormEl.querySelector('.property-options-list');
  let currentSelectedCatIndex;
  let originalProps;
  let currentProps;
  let categoryIncrement;
  let propertyIncrement;
  let muteChange;

  /**
   * Reset the global variables
   */
  function reset () {
    currentSelectedCatIndex = -1;
    originalProps = tab.adxConfig.properties || {};
    if (!originalProps.categories) {
      originalProps.categories = [];
    }
    // Copy of the object
    currentProps = JSON.parse(JSON.stringify(originalProps));
    categoryIncrement = currentProps.categories.length;
    propertyIncrement = 0; // Will be modified in the init with the length of properties
    muteChange = false;
  }

  /**
   * Initialize the properties
   */
  window.projectSettings.initProperties = function initProperties () {
    reset();

    let opt;
    const list = originalProps.categories;

    categoriesListEl.innerHTML = '';
    for (let i = 0, l = list.length; i < l; i += 1) {
      opt = document.createElement('option');
      opt.setAttribute('value', list[i].id);
      opt.innerText = list[i].name;

      categoriesListEl.appendChild(opt);
      propertyIncrement += (list[i].properties && list[i].properties.length) || 0;
    }

    loadCategory();
  };

  /**
   * Trigger the change
   */
  function triggerChange () {
    window.projectSettings.onchange();
  }

  /**
   * Return true if the items are equals
   *
   * @param a
   * @param b
   */
  function deepEqual (a, b) {
    if (typeof a !== typeof b) {
      return false;
    }

    switch (typeof a) {
    case 'string':
    case 'number':
    case 'boolean':
      return (a === b);
    default:
      if (Array.isArray(a)) {
        if (!Array.isArray(b)) {
          return false;
        }
        if (a.length !== b.length) {
          return false;
        }
        for (let i = 0, l = a.length; i < l; i += 1) {
          if (!deepEqual(a[i], b[i])) {
            return false;
          }
        }
        return true;
      } else {
        for (const k in a) {
          if (a.hasOwnProperty(k)) {
            if (!b.hasOwnProperty(k)) {
              return false;
            }
            if (!deepEqual(a[k], b[k])) {
              return false;
            }
          }
        }
        return true;
      }
      break;
    }
  }

  /**
   * Indicates if the properties has changed or not
   * @returns {boolean}
   */
  function hasChanged () {
    if (currentProps.categories.length !== originalProps.categories.length) {
      return true;
    }

    let curCat;
    let oriCat;
    let curProp;
    let oriProp;
    for (let i = 0, l = currentProps.categories.length; i < l; i += 1) {
      curCat = currentProps.categories[i];
      oriCat = originalProps.categories[i];
      if (curCat.properties.length !== oriCat.properties.length) {
        return true;
      }

      if (curCat.id !== oriCat.id) {
        return true;
      }

      if (curCat.name !== oriCat.name) {
        return true;
      }


      for (let j = 0, k = curCat.properties.length; j < k; j += 1) {
        curProp = curCat.properties[j];
        oriProp = oriCat.properties[j];
        if (!deepEqual(curProp, oriProp)) {
          return true;
        }
      }

    }

    return false;
  }

  /**
   * Return the category using his id
   * @param {String} id
   */
  function getCategoryIndex (id) {
    const list = currentProps.categories;

    for (let i = 0, l = list.length; i < l; i += 1) {
      if (list[i].id === id) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Load the selected category
   */
  function loadCategory () {
    const index = getCategoryIndex(categoriesListEl.value);
    if (index === -1) {
      return;
    }
    const category = currentProps.categories[index];
    if (!category) {
      return;
    }
    muteChange = true;
    currentSelectedCatIndex = index;
    document.getElementById('category_id').value = category.id;
    document.getElementById('category_name').value = category.name || '';

    loadProperties();
    muteChange = false;
  }

  /**
   * Save the current category
   */
  function saveCurrentCategory () {
    saveCurrentProperty();
    if (currentSelectedCatIndex === -1) {
      return;
    }
    const category = currentProps.categories[currentSelectedCatIndex];
    if (!category) {
      return;
    }

    category.id = document.getElementById('category_id').value;
    category.name = document.getElementById('category_name').value;


    categoriesListEl.options[currentSelectedCatIndex].setAttribute('value', category.id);
    categoriesListEl.options[currentSelectedCatIndex].innerText = category.name;

    triggerChange();
  }

  categoriesListEl.addEventListener('change', function () {
    saveCurrentCategory();
    loadCategory();
  });

  /**
   * Add a new property in the table
   * @param property
   * @return {HTMLElement} Return the first created table row
   */
  function addProperty (property) {
    const row = document.createElement('tr');
    row.property = property;
    row.className = 'collapsable-row';

    const toggle = document.createElement('td');
    toggle.className = 'cat-prop property-toggle';
    toggle.innerHTML = '<span class="toggle"></span>';
    row.appendChild(toggle);

    const propertyId = document.createElement('td');
    propertyId.className = 'cat-prop property-id';
    propertyId.innerHTML = '<span>' + property.id + '</span>';
    row.appendChild(propertyId);

    const propertyName = document.createElement('td');
    propertyName.className = 'cat-prop property-name';
    propertyName.innerHTML = '<span>' + property.name + '</span>';
    row.appendChild(propertyName);

    const propertyType = document.createElement('td');
    propertyType.className = 'cat-prop property-type';
    propertyType.innerHTML = '<span>' + property.type + '</span>';
    row.appendChild(propertyType);

    const propertyControls = document.createElement('td');
    propertyControls.innerHTML = '<a href="#" class="del">Delete</a>';
    row.appendChild(propertyControls);

    const rowPlaceholder = document.createElement('tr');
    rowPlaceholder.className = 'inner-form';
    const cellPlaceholder = document.createElement('td');
    cellPlaceholder.setAttribute('colspan', 5);
    rowPlaceholder.appendChild(cellPlaceholder);

    propertiesBodyEl.appendChild(row);
    propertiesBodyEl.appendChild(rowPlaceholder);

    return row;
  }

  /**
   * Add a new property-option in the table
   * @param option
   * @return {HTMLElement} Return the first created table row
   */
  function addPropertyOption (option) {
    const rowOption = document.createElement('span');
    rowOption.className = 'property-options-list-row';
    rowOption.option = option;

    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    rowOption.appendChild(checkbox);

    const inputValue = document.createElement('input');
    inputValue.setAttribute('type', 'text');
    inputValue.setAttribute('placeholder', 'value');
    inputValue.setAttribute('title', 'Option value');
    inputValue.className = 'property-option-value';
    inputValue.value = option.value;
    rowOption.appendChild(inputValue);

    const inputText = document.createElement('input');
    inputText.setAttribute('type', 'text');
    inputText.setAttribute('placeholder', 'text');
    inputText.setAttribute('title', 'Option text');
    inputText.className = 'property-option-text';
    inputText.value = option.text;
    rowOption.appendChild(inputText);

    elPropOptionList.appendChild(rowOption);

    inputValue.focus();
    return rowOption;
  }

  /**
   * Load the list of properties
   */
  function loadProperties () {
    if (currentSelectedCatIndex === -1) {
      return;
    }
    const category = currentProps.categories[currentSelectedCatIndex];
    const properties = category.properties;

    propertiesBodyEl.innerHTML = ''; // Clear first

    for (let i = 0, l = properties.length; i < l; i += 1) {
      addProperty(properties[i]);
    }
  }

  /**
   * Return the current property
   */
  function getCurrentProperty () {
    const row = propertiesBodyEl.querySelector('.editing');
    return (row) ? row.property : null;
  }

  /**
   * Save the current editable property
   */
  function saveCurrentProperty (keepItOpen) {
    const row = propertiesBodyEl.querySelector('.editing');
    const rowForm = propertiesBodyEl.querySelector('.editable');
    const property = row && row.property;

    if (!rowForm || !row || !property) {
      return;
    }


    const keys = ['id', 'name', 'description', 'type', 'value', 'mode', 'require', 'visible'];
    const type = elPropType.value;
    let el;
    switch (type) {
    case 'string':
      keys.push('pattern');
      break;
    case 'number':
      keys.push('min', 'max', 'decimal');
      break;
    case 'color':
      keys.push('colorFormat');
      break;
    case 'file':
      keys.push('fileExtension');
      break;
    case 'question':
      keys.push('chapter', 'single', 'multiple', 'numeric', 'open', 'date');
      break;
    }


    for (let i = 0, l = keys.length; i < l; i += 1) {
      const k = keys[i];
      el = document.getElementById('property_' + k);
      switch ((el.getAttribute('type') || 'text').toLowerCase()) {
      case 'checkbox':
        property[k] = el.checked;
        break;
      case 'number':
        if (el.value) {
          property[k] = parseFloat(el.value);
        }
        break;
      default:
        property[k] = el.value;
        break;
      }
    }

    // Options
    const optRows = elPropOptionList.querySelectorAll('.property-options-list-row');
    let optRow;
    let opt;
    for (let i = 0, l = optRows.length; i < l; i += 1) {
      optRow = optRows[i];
      opt = optRow.option;
      if (!opt) {
        continue;
      }
      opt.value = optRow.querySelector('.property-option-value').value;
      opt.text = optRow.querySelector('.property-option-text').value;
    }

    row.querySelector('.property-id span').innerText = property.id;
    row.querySelector('.property-name span').innerText = property.name;
    row.querySelector('.property-type span').innerText = property.type;

    // Reset the DOM
    if (!keepItOpen) {
      row.classList.remove('editing');
      rowForm.classList.remove('editable');
      innerFormInitialParentEl.appendChild(innerFormEl);
    }

    triggerChange();
  }

  /**
   * Display the attributes according to the selected property type
   */
  function displayAttributesByType () {
    const type = elPropType.value;
    elTypeString.style.display = (type === 'string') ? 'block' : 'none';
    elTypeNumber.style.display = (type === 'number') ? 'block' : 'none';
    elTypeColor.style.display = (type === 'color') ? 'block' : 'none';
    elTypeQuestion.style.display = (type === 'question') ? 'block' : 'none';
    elTypeFile.style.display = (type === 'file') ? 'block' : 'none';
  }

  elPropType.addEventListener('change', function onPropTypeChanged () {
    displayAttributesByType();
  });

  /**
   * Display the inner form to edit the property
   *
   * @param {HTMLElement} element Row to edit
   */
  function editProperty (element) {
    saveCurrentProperty();
    muteChange = true;
    const property = element.property;
    const rowForm = element.nextElementSibling;
    rowForm.querySelector('td').appendChild(innerFormEl);

    const keys = ['id', 'name', 'description', 'type', 'value', 'mode', 'require', 'visible',
      'pattern', 'min', 'max', 'decimal', 'colorFormat', 'fileExtension',
      'chapter', 'single', 'multiple', 'numeric', 'open', 'date'];
    let el;

    for (let i = 0, l = keys.length; i < l; i += 1) {
      const k = keys[i];
      el = document.getElementById('property_' + k);
      switch ((el.getAttribute('type') || 'text').toLowerCase()) {
      case 'checkbox':
        el.checked = property[k];
        if (k === 'visible' && !(k in property)) {
          el.checked = true;
        }
        break;
      case 'number':
        el.value = (k in property) ? property[k] : '';
        break;
      default:
        el.value = ((k in property) ? property[k] : '').trim();
        break;
      }
    }

    displayAttributesByType();

    // Clear the list of options
    elPropOptionList.innerHTML = '';
    if (property.options && property.options.length) {
      for (i = 0, l = property.options.length; i < l; i += 1) {
        addPropertyOption(property.options[i]);
      }
    }

    element.classList.add('editing');
    rowForm.classList.add('editable');
    document.getElementById('property_id').focus();
    muteChange = false;
  }

  /**
   * Delete a property option
   *
   * @param {HTMLElement} element Row to remove
   */
  function deletePropertyOption (element) {
    const option = element.option;
    const property = getCurrentProperty();
    if (!option || !property || !property.options) {
      return;
    }

    const idx = property.options.indexOf(option);
    if (idx !== -1) {
      property.options.splice(idx, 1);
      element.parentNode.removeChild(element);

      triggerChange();
    }
  }

  /**
   * Delete a property
   *
   * @param {HTMLElement} element Row to remove
   */
  function deleteProperty (element) {
    window.askia.modalDialog.show({
      type: 'yesNo',
      message: 'Do you really want to delete this property?'
    }, function (retVal) {
      if (retVal.button !== 'yes') {
        return;
      }

      saveCurrentProperty();
      const property = element.property;
      const category = currentProps.categories[currentSelectedCatIndex];
      const properties = category.properties;
      const idx = properties.indexOf(property);
      if (idx !== -1) {
        properties.splice(idx, 1);
        if (innerFormEl.parentNode.parentNode === element.nextElementSibling) {
          innerFormInitialParentEl.appendChild(innerFormEl);
        }
        element.parentNode.removeChild(element.nextElementSibling);
        element.parentNode.removeChild(element);

        triggerChange();
      }
    });
  }

  document.getElementById('category_meta').addEventListener('change', function onMetaChange () {
    if (muteChange) {
      return;
    }
    saveCurrentCategory();
  });

  innerFormEl.addEventListener('change', function onFormChange () {
    if (muteChange) {
      return;
    }
    const keepItOpen = true;
    saveCurrentProperty(keepItOpen);
  });

  innerFormEl.querySelector('.add-property-option').addEventListener('click', function onClickAddOption (event) {
    event.preventDefault();
    event.stopPropagation();

    const property = getCurrentProperty();
    if (!property) {
      return;
    }

    if (!property.options) {
      property.options = [];
    }
    const wasEmpty = (elPropOptionList.childNodes.length === 0);
    const opt = { value: '', text: '' };
    property.options.push(opt);
    const firstRow = addPropertyOption(opt);

    // Add two options the first time
    if (wasEmpty) {
      const secondOpt = { value: '', text: '' };
      property.options.push(secondOpt);
      addPropertyOption(secondOpt);
      // But focus the first one
      firstRow.querySelector('.property-option-value').focus();
    }

    triggerChange();
  });

  innerFormEl.querySelector('.delete-property-options').addEventListener('click', function onClickDeleteOptions (event) {
    event.preventDefault();
    event.stopPropagation();

    const checkboxes = elPropOptionList.querySelectorAll('.property-options-list-row input[type=checkbox]:checked');
    if (!checkboxes || !checkboxes.length) {
      return;
    }
    for (let i = 0, l = checkboxes.length; i < l; i += 1) {
      deletePropertyOption(checkboxes[i].parentNode);
    }
  });

  propertiesEl.addEventListener('click', function (event) {
    const el = event.srcElement;
    let row = el;
    let command = 'edit';

    while (row.tagName.toLowerCase() !== 'tr' && row.tagName.toLowerCase() !== 'body') {
      row = row.parentNode;
    }

    if (row.tagName.toLowerCase() !== 'tr' || row.classList.contains('inner-form')) {
      return;
    }

    if (el.tagName.toLowerCase() === 'a') {
      event.preventDefault();
      if (el.classList.contains('del')) {
        command = 'del';
      }
    }


    if (command === 'del') {
      deleteProperty(row);
    } else {
      if (row.classList.contains('editing')) {
        saveCurrentProperty();
      } else {
        editProperty(row);
      }
    }
  });

  document.getElementById('add_property').addEventListener('click', function onClickAddProperty () {
    propertyIncrement++;
    const property = {
      id: 'property_' + propertyIncrement,
      name: 'Property ' + propertyIncrement,
      description: '',
      type: 'boolean',
      value: 'false',
      visible: true
    };
    const category = currentProps.categories[currentSelectedCatIndex];
    const properties = category.properties;
    properties.push(property);
    const tr = addProperty(property);
    editProperty(tr);
    triggerChange();
  });

  document.getElementById('new_category').addEventListener('click', function onClickNewCategory () {
    categoryIncrement++;
    muteChange = true;
    const category = {
      id: 'category_' + categoryIncrement,
      name: 'Category ' + categoryIncrement,
      properties: []
    };
    currentProps.categories.push(category);
    const opt = document.createElement('option');
    opt.setAttribute('value', category.id);
    opt.innerText = category.name;

    categoriesListEl.appendChild(opt);
    categoriesListEl.value = category.id;
    loadCategory();
    muteChange = false;

    triggerChange();
  });

  document.getElementById('delete_category').addEventListener('click', function onClickDeleteCategory () {
    const index = getCategoryIndex(categoriesListEl.value);
    if (index === -1) {
      return;
    }

    window.askia.modalDialog.show({
      type: 'yesNo',
      message: 'Do you really want to delete this category and his properties?'
    }, function (retVal) {
      if (retVal.button !== 'yes') {
        return;
      }
      muteChange = true;
      currentProps.categories.splice(index, 1);
      categoriesListEl.removeChild(categoriesListEl.querySelector('option:checked'));

      if (currentProps.categories.length) {
        categoriesListEl.value = currentProps.categories[0].id;
      }
      document.getElementById('category_id').value = '';
      document.getElementById('category_name').value = '';
      loadCategory();
      muteChange = false;

      triggerChange();
    });

  });


  /**
   * Return the current properties object
   */
  window.projectSettings.getCurrentProperties = function getCurrentProperties () {
    return currentProps;
  };

  /**
   * Indicates if the info has changed
   * @returns {boolean}
   */
  window.projectSettings.hasPropertiesChanged = hasChanged;

  // Init now
  window.projectSettings.initProperties();
});
