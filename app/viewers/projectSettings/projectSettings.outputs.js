
window.projectSettings = window.projectSettings || {};

document.addEventListener('DOMContentLoaded', function () {
  const tab = viewer.currentTab;
  const outputsListEl = document.getElementById('outputs_list');
  const contentsEl = document.getElementById('contents');
  const contentsBodyEl = contentsEl.querySelector('tbody');
  let currentSelectedOutputIndex;
  let originalOutputs;
  let currentOutputs;
  let newIncrement;
  let muteChange;

  /**
   * Reset the global variables
   */
  function reset () {
    currentSelectedOutputIndex = -1;
    originalOutputs = tab.adxConfig.outputs || {};
    if (!originalOutputs.outputs) {
      originalOutputs.outputs = [];
    }
    if (!originalOutputs.defaultOutput) {
      originalOutputs.defaultOutput = '';
    }
    // Copy of the object
    currentOutputs = JSON.parse(JSON.stringify(originalOutputs));
    newIncrement = originalOutputs.outputs.length;
    muteChange = false;
  }

  /**
   * Initialize outputs
   */
  window.projectSettings.initOutputs = function initOutputs () {
    reset();

    let opt;
    const list = currentOutputs.outputs;
    const defaultOutput = currentOutputs.defaultOutput;

    outputsListEl.innerHTML = '';
    for (let i = 0, l = list.length; i < l; i += 1) {
      opt = document.createElement('option');
      opt.setAttribute('value', list[i].id);

      if (list[i].id === defaultOutput) {
        opt.innerText = list[i].id + ' (Default)';
        opt.setAttribute('selected', 'selected');
      } else {
        opt.innerText = list[i].id;
      }

      outputsListEl.appendChild(opt);
    }

    loadOutput();
  };


  /**
   * Trigger the change
   */
  function triggerChange () {
    window.projectSettings.onchange();
  }

  /**
   * Indicates if the outputs has changed or not
   * @returns {boolean}
   */
  function hasChanged () {
    if (currentOutputs.defaultOutput !== originalOutputs.defaultOutput) {
      return true;
    }
    if (currentOutputs.outputs.length !== originalOutputs.outputs.length) {
      return true;
    }

    let curOutput;
    let oriOutput;
    let curContent;
    let oriContent;
    let key;
    for (let i = 0, l = currentOutputs.outputs.length; i < l; i += 1) {
      curOutput = currentOutputs.outputs[i];
      oriOutput = originalOutputs.outputs[i];
      if (curOutput.contents.length !== oriOutput.contents.length) {
        return true;
      }

      if (curOutput.id !== oriOutput.id) {
        return true;
      }
      // Use falsy to validate if the comparison make sense
      // for example oriOutput.condition could not exist
      // if curOutput.condition == '' then it's equal
      if (oriOutput.condition || curOutput.condition) {
        if (curOutput.condition !== oriOutput.condition) {
          return true;
        }
      }
      // Use falsy to validate if the comparison make sense
      // for example oriOutput.description could not exist
      // if curOutput.description == '' then it's equal
      if (oriOutput.description || curOutput.description) {
        if (curOutput.description !== oriOutput.description) {
          return true;
        }
      }

      // Use falsy to validate if the comparison make sense
      // for example oriOutput.manageLoopDepth could not exist
      // if curOutput.manageLoopDepth == 0 then it's equal
      if (oriOutput.manageLoopDepth || curOutput.manageLoopDepth) {
        if (curOutput.manageLoopDepth !== oriOutput.manageLoopDepth) {
          return true;
        }
      }


      for (let j = 0, k = curOutput.contents.length; j < k; j += 1) {
        curContent = curOutput.contents[j];
        oriContent = oriOutput.contents[j];

        for (key in curContent) {
          if (curContent.hasOwnProperty(key)) {
            if (curContent[key] !== oriContent[key]) {
              return true;
            }
          }
        }
      }

    }

    return false;
  }

  /**
   * Return the output using his id
   * @param {String} id
   */
  function getOutputIndex (id) {
    const list = currentOutputs.outputs;

    for (let i = 0, l = list.length; i < l; i += 1) {
      if (list[i].id === id) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Load the selected output
   */
  function loadOutput () {
    const index = getOutputIndex(outputsListEl.value);
    if (index === -1) {
      return;
    }
    const output = currentOutputs.outputs[index];
    if (!output) {
      return;
    }

    muteChange = true;
    currentSelectedOutputIndex = index;
    document.getElementById('output_id').value = output.id;
    document.getElementById('output_condition').value = output.condition || '';
    document.getElementById('output_description').value = output.description || '';
    document.getElementById('output_default').checked = (output.id === currentOutputs.defaultOutput);
    document.getElementById('output_manageLoopDepth').value = output.manageLoopDepth || 0;

    loadContents();
    muteChange = false;
  }


  /**
   * Save the current output
   */
  function saveCurrentOutput () {
    if (currentSelectedOutputIndex === -1) {
      return;
    }
    const output = currentOutputs.outputs[currentSelectedOutputIndex];
    if (!output) {
      return;
    }

    output.id = document.getElementById('output_id').value;
    output.condition = document.getElementById('output_condition').value;
    output.description = document.getElementById('output_description').value;
	output.manageLoopDepth = document.getElementById('output_manageLoopDepth').value;

    if (document.getElementById('output_default').checked || currentOutputs.outputs.length < 2) {
      const previousDefault = currentOutputs.defaultOutput;
      if (previousDefault !== output.id) {
        const previousDefaultIndex = getOutputIndex(previousDefault);
        if (previousDefaultIndex !== -1) {
          outputsListEl.options[previousDefaultIndex].innerText = currentOutputs.outputs[previousDefaultIndex].id;
        }
      }
      currentOutputs.defaultOutput = output.id;
    }

    outputsListEl.options[currentSelectedOutputIndex].setAttribute('value', output.id);
    outputsListEl.options[currentSelectedOutputIndex].innerText = output.id +
      ((output.id === currentOutputs.defaultOutput) ? ' (Default)' : '');

    triggerChange();
  }

  outputsListEl.addEventListener('change', function () {
    saveCurrentOutput();
    loadOutput();
  });

  /**
   * Add a new content in the table
   * @param content
   * @return {HTMLElement} Return the create table row
   */
  function addContent (content) {
    const row = document.createElement('tr');
    row.content = content;
    const contentFile = document.createElement('td');
    contentFile.className = 'output-content content-file';
    contentFile.innerHTML = '<span>' + content.mode + '/' + content.fileName + '</span>';
    row.appendChild(contentFile);

    const contentPosition = document.createElement('td');
    contentPosition.className = 'output-content content-position';
    contentPosition.innerHTML = '<span>' + content.position + '</span>';
    row.appendChild(contentPosition);

    const contentType = document.createElement('td');
    contentType.className = 'output-content content-type';
    contentType.innerHTML = '<span>' + content.type + '</span>';
    row.appendChild(contentType);

    const contentControls = document.createElement('td');
    contentControls.className = 'output-content content-controls';
    contentControls.innerHTML = '<a href="#" class="del">Delete</a>';
    row.appendChild(contentControls);

    contentsBodyEl.appendChild(row);
    return row;
  }

  /**
   * Load the list of contents
   */
  function loadContents () {
    if (currentSelectedOutputIndex === -1) {
      return;
    }
    const output = currentOutputs.outputs[currentSelectedOutputIndex];
    const contents = output.contents;

    contentsBodyEl.innerHTML = ''; // Clear first

    if (contents) {
      for (let i = 0, l = contents.length; i < l; i += 1) {
        addContent(contents[i]);
      }
    }

  }

  /**
   * Make a cell editable
   *
   * @param {HTMLElement} element Cell to edit
   * @param {String|"position"|"type"|"file"} propKey Key to edit
   */
  function editContentCell (element, propKey) {
    const content = element.parentNode.content;
    let structKey;
    let options;
    let opt;
    let groupOpt;

    const select = document.createElement('select');
    const span = element.querySelector('span');

    switch (propKey) {
    case 'position':
      options = ['none', 'head', 'placeholder', 'foot'];
      break;
    case 'type':
      options = ['text', 'binary', 'html', 'javascript', 'css', 'image', 'video', 'audio', 'flash', 'asx'];
      break;
    }

    // Display the select box
    function displaySelect () {
      span.style.display = 'none';
      element.appendChild(select);
      select.focus();

      select.addEventListener('blur', function () {
        if (propKey !== 'file') {
          content[propKey] = select.value;
        } else {
          const splitResult = select.value.split('/');

          content.mode = splitResult[0];
          content.fileName = splitResult[1];

          // Implicitly set the type of the content
          if (/\.js$/i.test(content.fileName)) {
            content.type = 'javascript';
          } else if (/\.(css|hss|sass|less|ccss|pcss)$/i.test(content.fileName)) {
            content.type = 'css';
          } else if (/\.(html|htm|xhtm|xhtml)$/i.test(content.fileName)) {
            content.type = 'html';
          } else if (/\.(gif|jpeg|jpg|tif|tiff|png|bmp|pdf|ico|cur)$/i.test(content.fileName)) {
            content.type = 'image';
          } else if (/\.(aif|iff|m4a|mid|mp3|mpa|ra|wav|wma|ogg|oga|webma)$/i.test(content.fileName)) {
            content.type = 'audio';
          } else if (/\.(3g2|3gp|avi|flv|mov|mp4|mpg|rm|wmv|webm)$/i.test(content.fileName)) {
            content.type = 'video';
          } else if (/\.(xml|rss|atom|svg|md|txt|csv|json)$/i.test(content.fileName)) {
            content.type = 'text';
          } else if (/\.(swf)$/i.test(content.fileName)) {
            content.type = 'flash';
          } else if (/\.(asx)$/i.test(content.fileName)) {
            content.type = 'asx';
          } else {
            content.type = 'binary';
          }
          element.parentNode.querySelector('.content-type span').innerHTML = content.type;
        }

        span.innerHTML = select.value;
        element.removeChild(select);
        span.style.display = 'block';
        triggerChange();
      });
    }

    if (propKey !== 'file') {
      for (let i = 0, l = options.length; i < l; i += 1) {
        opt = document.createElement('option');
        opt.setAttribute('value', options[i]);
        opt.innerHTML = options[i];
        if (content[propKey] === options[i]) {
          opt.setAttribute('selected', 'selected');
        }
        select.appendChild(opt);
      }
      displaySelect();
    } else {
      viewer.getADXStructure(function (structure) {
        for (structKey in structure) {
          if (structure.hasOwnProperty(structKey)) {
            options = structure[structKey];
            groupOpt = document.createElement('optgroup');
            groupOpt.setAttribute('label', structKey);

            for (i = 0, l = options.length; i < l; i += 1) {
              opt = document.createElement('option');
              opt.setAttribute('value', structKey + '/' + options[i]);
              opt.innerHTML = options[i];
              if (content.mode === structKey && content.fileName === options[i]) {
                opt.setAttribute('selected', 'selected');
              }
              groupOpt.appendChild(opt);
            }

            select.appendChild(groupOpt);
          }
        }
        displaySelect();
      });
    }
  }

  /**
   * Delete a content
   */
  function deleteContent (element) {
    const content = element.content;
    const output = currentOutputs.outputs[currentSelectedOutputIndex];
    const contents = output.contents;
    const idx = contents.indexOf(content);
    if (idx !== -1) {
      contents.splice(idx, 1);
      element.parentNode.removeChild(element);
      triggerChange();
    }
  }

  document.getElementById('output_meta').addEventListener('change', function onMetaChange () {
    if (muteChange) {
      return;
    }
    saveCurrentOutput();
  });

  contentsEl.addEventListener('click', function (event) {
    let el = event.srcElement;
    let command = 'edit';

    if (el.tagName.toLowerCase() === 'select') {
      event.stopPropagation();
      return;
    }
    if (el.tagName.toLowerCase() === 'a') {
      event.preventDefault();
      if (el.classList.contains('del')) {
        command = 'del';
      }
      el = el.parentNode;
    }
    if (el.tagName.toLowerCase() === 'span') {
      el = el.parentNode;
    }

    if (command === 'del') {
      deleteContent(el.parentNode);
    } else {
      if (el.classList.contains('content-position')) {
        editContentCell(el, 'position');
      } else if (el.classList.contains('content-type')) {
        editContentCell(el, 'type');
      } else if (el.classList.contains('content-file')) {
        editContentCell(el, 'file');
      }
    }
  });

  document.getElementById('add_content').addEventListener('click', function onClickAddContent () {
    const content = {
      mode: '',
      fileName: '',
      type: '',
      position: 'none'
    };
    const output = currentOutputs.outputs[currentSelectedOutputIndex];
    const contents = output.contents;
    contents.push(content);
    const tr = addContent(content);
    editContentCell(tr.querySelector('.content-file'), 'file');
    triggerChange();
  });

  document.getElementById('new_output').addEventListener('click', function onClickNewOutput () {
    newIncrement++;
    muteChange = true;
    const output = {
      id: 'output_' + newIncrement,
      contents: []
    };
    currentOutputs.outputs.push(output);
    const opt = document.createElement('option');
    opt.setAttribute('value', output.id);
    opt.innerText = output.id;

    if (currentOutputs.outputs.length === 1) {
      opt.innerText += ' (Default)';
      currentOutputs.defaultOutput = output.id;
    }

    outputsListEl.appendChild(opt);
    outputsListEl.value = output.id;
    loadOutput();
    muteChange = false;

    triggerChange();
  });

  document.getElementById('delete_output').addEventListener('click', function onClickDeleteOutput () {
    const index = getOutputIndex(outputsListEl.value);
    if (index === -1) {
      return;
    }

    window.askia.modalDialog.show({
      type: 'yesNo',
      message: 'Do you really want to delete this output?'
    }, function (retVal) {
      if (retVal.button !== 'yes') {
        return;
      }
      muteChange = true;
      const outputId = outputsListEl.value;
      currentOutputs.outputs.splice(index, 1);
      outputsListEl.removeChild(outputsListEl.querySelector('option:checked'));

      if (outputId === currentOutputs.defaultOutput) {
        currentOutputs.defaultOutput = currentOutputs.outputs.length ? currentOutputs.outputs[0].id : '';
        if (currentOutputs.outputs.length) {
          outputsListEl.options[0].innerText = currentOutputs.outputs[0].id + ' (Default)';
        }
      }

      if (currentOutputs.outputs.length) {
        outputsListEl.value = currentOutputs.outputs[0].id;
      }
      document.getElementById('output_id').value = '';
      document.getElementById('output_condition').value = '';
      document.getElementById('output_description').value = '';
      document.getElementById('output_default').checked = false;
      document.getElementById('output_manageLoopDepth').value = 0;
      loadOutput();
      muteChange = false;

      triggerChange();
    });

  });



  /**
   * Return the current outputs object
   */
  window.projectSettings.getCurrentOutputs = function getCurrentOutputs () {
    return currentOutputs;
  };

  /**
   * Indicates if the info has changed
   * @returns {boolean}
   */
  window.projectSettings.hasOutputsChanged = hasChanged;

  // Init now
  window.projectSettings.initOutputs();
});
