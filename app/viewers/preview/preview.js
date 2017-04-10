/* global viewer WebSocket */

/**
 * Management of the Preview tab, Properties and Theme
 * Properties with the following format:
 * id           : Id of the property
 * defaultValue : Default Value of the property
 * value        : Actual value (read from the form) of the property
 * type         : Type of the property (Color, String, Number, Boolean)
 * colorFormat  : Format of the color ('hexa' or 'rgb' or 'rgba' or null)
 */
document.addEventListener('DOMContentLoaded', function () {
  const themesTemplate = [{
    name: 'Typography',
    type: 'category'
  },
  {
    name: 'Font Family',
    type: 'string',
    value: 'Arial, Helvetica, sans-serif',
    id: 'fontfamily'
  },
  {
    name: 'Base Font Size',
    type: 'string',
    value: '16px',
    id: 'basefs'
  },
  {
    name: 'Large Font Size',
    type: 'string',
    value: '1.5rem',
    id: 'largefs'
  },
  {
    name: 'Normal Font Size',
    type: 'string',
    value: '1.05rem',
    id: 'normalfs'
  },
  {
    name: 'Small Font Size',
    type: 'string',
    value: '0.85rem',
    id: 'smallfs'
  },
  {
    name: 'Line Height',
    type: 'string',
    value: '1.2',
    id: 'lineheight'
  },
  {
    name: 'Borders',
    type: 'category'
  },
  {
    name: 'Border Width',
    type: 'string',
    value: '0.0625em',
    id: 'borderwidth'
  },
  {
    name: 'Border Radius',
    type: 'string',
    value: '0.1875em',
    id: 'borderradius'
  },
  {
    name: 'Paddings',
    type: 'category'
  },
  {
    name: 'Horizontal Padding',
    type: 'string',
    value: '1.0em',
    id: 'hpadding'
  },
  {
    name: 'Vertical Padding',
    type: 'string',
    value: '1.0em',
    id: 'vpadding'
  },
  {
    name: 'Colors',
    type: 'category'
  },
  {
    name: 'White color',
    type: 'color',
    value: '255,255,255,1',
    id: 'whitecolor'
  },
  {
    name: 'Black Color',
    type: 'color',
    value: '34,34,34,1',
    id: 'blackcolor'
  },
  {
    name: 'Primary Color',
    type: 'color',
    value: '40,59,73,1',
    id: 'primarycolor'
  },
  {
    name: 'Primary Dark Color',
    type: 'color',
    value: '25,39,48,1',
    id: 'primarydarkcolor'
  },
  {
    name: 'Primary Light Color',
    type: 'color',
    value: '72,101,121,1',
    id: 'primarylightcolor'
  },
  {
    name: 'Secondary Color',
    type: 'color',
    value: '223,67,53,1',
    id: 'secondarycolor'
  },
  {
    name: 'Secondary Dark Color',
    type: 'color',
    value: '175,36,23,1',
    id: 'secondarydarkcolor'
  },
  {
    name: 'Secondary Light Color',
    type: 'color',
    value: '240,120,109,1',
    id: 'secondarylightcolor'
  },
  {
    name: 'Neutral Color',
    type: 'color',
    value: '221,221,221,1',
    id: 'neutralcolor'
  },
  {
    name: 'Neutral Dark Color',
    type: 'color',
    value: '170,170,170,1',
    id: 'neutraldarkcolor'
  },
  {
    name: 'Neutral Light Color',
    type: 'color',
    value: '238,238,238,1',
    id: 'neutrallightcolor'
  },
  {
    name: 'Error Color',
    type: 'color',
    value: '192,57,43,1',
    id: 'errorcolor'
  }
  ];
  const themeDefault = (function () {
    const obj = {};
    for (let i = 0, j = themesTemplate.length; i < j; i += 1) {
      const item = themesTemplate[i];
      obj[item.id] = item.value;
    }
    return obj;
  }());
  const askia = window.askia;
  const resizer = new askia.Resizer({
    element: document.getElementById('grid'),
    direction: 'vertical',
    revert: true
  });
  const tab = viewer.currentTab;
  const wsConnection = new WebSocket('ws://localhost:' + tab.ports.ws);

  wsConnection.onopen = function () {
    // Initial message
    wsConnection.send(JSON.stringify({
      action: 'getConfig'
    }));
  };

  wsConnection.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.error) {
      console.warn(data.message);
      return;
    }
    // Update the form
    if (data.action === 'getConfig' || data.action === 'reloadConfig') {
      FormBuilder.getInstance().update(data.message);
    } else if (data.action === 'reload') {
      FormBuilder.getInstance().reloadPreview();
    }
  };

  /**
   * Convert a number to his base 16
   * @param {Number} c Number to convert
   * @returns {string} Representation of number in base 16
   */
  function componentToHex (c) {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  /**
   * Return the format of the color ("hexa","rgb","rgba",null)
   * @param {String} color 
   */
  function getColorFormat (color) {
    const indexes = { 'hexa': 1, 'rgb': 2, 'alpha': 3 };
    const rgColorFormat = /^\s*(#[0-9a-f]{3,6})|((?:,?\s*[0-9]{1,3}\s*){3}(,\s*[0-1]?(?:\.[0-9]+)?)?)\s*$/i;
    const match = rgColorFormat.exec(color);
    if (!match) return null;
    if (match[indexes.hexa]) return 'hexa';
    return (match[indexes.alpha]) ? 'rgba' : 'rgb';
  }

  /**
   * Convert the hexa color value of the color picker to the specified format
   * @param {String} format 
   * @param {String} value 
   */
  function hexaTo (format, value) {
    switch (format) {
    case 'hexa':
      return value;
    case 'rgb':
      return hexToRgb(value);
    case 'rgba':
      return hexToRgb(value) + ',1';
    default:
      return value;
    }
  }

  /**
   * Verify if the two colors have the same format
   * @param {String} colorA 
   * @param {String} colorB 
   */
  function isColorSameFormat (colorA, colorB) {
    return (getColorFormat(colorA) !== null && (getColorFormat(colorA) === getColorFormat(colorB)));
  }

  /**
   * Convert RGB color to hexadecimal color
   *
   * @param {Number} r Red color (0-255)
   * @param {Number} g Green color (0-255)
   * @param {Number} b Blue color (0-255)
   * @returns {string} Hexadecimal representation with the '#'
   */
  function rgbToHex (r, g, b) {
    return '#' + componentToHex(parseFloat(r)) + componentToHex(parseFloat(g)) + componentToHex(parseFloat(b));
  }

  /**
   * Concert hexadecimal to RGB color as string "RED, GREEN, BLUE"
   * The hexadecimal could be in shorthand form (#03f for #0033ff)
   *
   * @param {String} hex Color in hexadecimal format (with or without '#')
   * @returns {String|Null} RGB color separate with ','
   */
  function hexToRgb (hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? '' + parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) : null;
  }

  /**
   * Transform a given color to hexa format
   * @param {String} str The color to transform 
   */
  function getValueForColorPicker (str) {
    const colorFormat = getColorFormat(str);
    switch (colorFormat) {
    case 'hexa':
      return str;
    case 'rgb': //same as rgba so no break
    case 'rgba':
      return rgbToHex(...str.split(','));
    default:
      return getColorValueFromAskiaScript(str);
    }
  }

  /**
   * Try to match the askiascript to the Theme variables
   * Return the corresponding color to hexa format for the color picker
   * @param {String} str Askiascript of the properties
   */
  function getColorValueFromAskiaScript (str) {
    const rgThemeScript = /^\s*\{\%\:?=\s*Theme\.(?:(?:var|propvalue)\(\")?(.*?)(?:\"\))?\s*\%\}\s*$/i;
    const match = rgThemeScript.exec(str);
    if (!match || match.length !== 2) return '#000000';
    const id = match[1].toLowerCase();
    const value = themeDefault[id];
    if (getColorFormat(value) === 'hexa') return value;
    if (id in themeDefault && value && (getColorFormat(value) === 'rgba' || getColorFormat(value) === 'rgb')) {
      return rgbToHex(...value.split(','));
    }
    return '#000000';
  }

  /**
   * Indicates if the value of the property has changed according to it's default value
   * @param property
   * @return {Boolean} True if the property has changed
   */
  function hasPropertyChanged (property) {
    return property.value !== property.defaultValue;
  }

  /**
   * Escape the HTML for the tag attribute
   * @param {String} text
   */
  function escapeHtmlAttr (text) {
    return typeof text === 'string' ? text.replace(/"/g, '&quot;') : text;
  }

  /**
   * Get url parameter
   *
   * @param {String} name Name of parmeter to read
   * @param {Document} [doc=window.document] Document from where to read the location
   * @return {String} Return the value of the parameter or ""
   */
  function getUrlParameter (name, doc) {
    if (!name || typeof (name) !== 'string') {
      return '';
    }
    doc = doc || document;
    const rgExp = new RegExp(name + '=([^\\&]*)', 'i');
    const arrResult = rgExp.exec(doc.location.search);
    if (!arrResult) {
      return '';
    }
    if (arrResult.length < 2) {
      return '';
    }
    return arrResult[1] || '';
  }

  /**
   * Build the form using the ADX info
   * @singleton
   */
  function FormBuilder () {
    if (FormBuilder.instance) {
      return FormBuilder.instance;
    }
    FormBuilder.instance = this;
    this.grid = document.getElementById('grid');
    this.iframe = document.getElementById('preview_frame');
    this.addressURL = document.getElementById('addressURL');

    // Listen the location change of the iframe
    this.onlocationChange = () => {
      // Wait a few in case of the HTTP redirect
      setTimeout(() => {
        this.addressURL.value = this.iframe.contentWindow.location.href;
      }, 500);
    };
    this.iframe.addEventListener('load', () => {
      this.onlocationChange();
    });
  }

  /**
   * Return a single instance of the ADX
   */
  FormBuilder.getInstance = function () {
    if (!FormBuilder.instance) {
      FormBuilder.instance = new FormBuilder();
    }
    return FormBuilder.instance;
  };

  /**
   * Update the form with the newest information
   * @param {Object} adxInfo
   * @chainable
   */
  FormBuilder.prototype.update = function (adxInfo) {
    return this.init(adxInfo).build().listen().reloadPreview();
  };

  /**
   * Backup the current selection of the properties before to re-init the form
   */
  FormBuilder.prototype.backup = function () {
    this._backup = {};

    /**
     * Don't back up if this.form doesn't exist
     */
    if (!this.form) {
      return;
    }

    this._backup.emulation = this.form.emulation;
    this._backup.fixture = this.form.fixture;
    this._backup.props = {};

    const properties = this.form.properties;

    /**
     * We don't back up the theme cause they are saved in Theme.json in .vscode folder
     */

    for (let i = 0, l = properties.length; i < l; i += 1) {
      const property = properties[i];
      if (hasPropertyChanged(property)) {
        this._backup.props[property.id] = property.value;
      }
    }
  };

  /**
   * Reset all default properties values
   */
  FormBuilder.prototype.reset = function () {
    this.form = null;
    this._backup = null;
    return this.update(this.adxInfo);
  };

  /**
   * Reset all default theme values
   */
  FormBuilder.prototype.resetTheme = function () {
    this.form.themes = {};
    for (let i = 0, j = themesTemplate.length; i < j; i += 1) {
      const item = themesTemplate[i];
      if (item.type === 'category') continue;
      document.getElementById('theme_' + item.id).value = item.value;
      if (item.type === 'color') {
        document.getElementById('themeColor_' + item.id).value = rgbToHex(...item.value.split(','));
      }
    }
    this.reloadPreview();
  };

  /**
   * Initialize the form builder with the ADX information
   * #chainable
   * @param {Object} adxInfo
   * @param {Object} adcInfo.config Information from config.xml
   * @param {String} adcInfo.defaultFixture Fixture to use by default
   * @param {Array} adcInfo.fixtures List of feaxtures
   * @param {Array} adcInfo.emulations List of emulations
   */
  FormBuilder.prototype.init = function (adxInfo) {

    this.backup();

    this.adxInfo = adxInfo;
    this.config = adxInfo.config;
    this.defaultFixture = adxInfo.defaultFixture;
    this.fixtures = adxInfo.fixtures;
    this.categories = this.config.properties.categories;
    this.emulations = adxInfo.emulations;

    this.form = {
      emulation: this.emulations[0],
      fixture: this.defaultFixture,
      properties: [],
      propertyById: {},
      themes: this.adxInfo.themes || {}
    };

    // Verify the backup against the current info
    if (this._backup && this._backup.emulation) {
      let isFound = false;
      for (let i = 0, l = this.emulations.length; i < l; i += 1) {
        if (this.emulations[i].replace(/\.xml$/i, '') === this._backup.emulation) {
          isFound = true;
          break;
        }
      }
      // Use it for the current form
      if (isFound) {
        this.form.emulation = this._backup.emulation;
      }
    }

    // Verify the backup against the current info
    if (this._backup && this._backup.fixture) {
      let isFound = false;
      for (i = 0, l = this.fixtures.length; i < l; i += 1) {
        if (this.fixtures[i].replace(/\.xml$/i, '') === this._backup.fixture) {
          isFound = true;
          break;
        }
      }
      // Use it for the current form
      if (isFound) {
        this.form.fixture = this._backup.fixture;
      }
    }

    return this;
  };

  /**
   * Build the form
   * @chainable
   */
  FormBuilder.prototype.build = function () {
    const html = [];

    html.push('<table>');
    html.push('<td class="tab-preview"><button id="properties-tab" class="tab-preview-button selected">Properties</button></td>');
    html.push('<td class="tab-preview"><button id="theme-tab" class="tab-preview-button">Theme</button></td>');
    html.push('</table>');
    html.push('<div id="subgrid"><div id="properties-panel">');

    html.push(this.emulationsToHtml());
    html.push('<div id="adx-properties">');
    for (let i = 0, l = this.categories.length; i < l; i += 1) {
      html.push(this.categoryToHtml(this.categories[i]));
    }
    html.push('</div>');
    html.push('</div>');
    html.push('<div id="theme-panel" style="display: none;">');
    html.push(this.themeToHtml());
    html.push('</div></div>');

    this.grid.innerHTML = html.join('');
    return this;
  };

  /**
   * Build the theme screen
   * #return {String}
   */
  FormBuilder.prototype.themeToHtml = function () {
    const html = [];

    html.push('<table><tr>');
    html.push('<td><h2>Theme</h2></td>');
    html.push('<td class="reset-cell"><button id="reset-theme" class="preview-button">Reset</button></td>');
    html.push('</tr></table>');

    let isFirstCategory = true;

    for (let i = 0, l = themesTemplate.length; i < l; i++) {

      const item = themesTemplate[i];

      // Case a category
      if (item.type === 'category') {
        if (!isFirstCategory) {
          html.push('</table>');
        }
        html.push('<h3>' + item.name + '</h3>');
        html.push('<table>');
        isFirstCategory = false;
        continue;
      }

      // Case not a category: theme properties
      // Use Theme.json value for the variable value
      let value = (item.id in this.form.themes) ? this.form.themes[item.id] : item.value;
      let classColor = '';
      if (item.type === 'color') {
        classColor = 'class=color_text';
      }
      html.push('<tr><td><label for="theme_' + item.id + '">' + item.name + '</label></td>');
      html.push('<td><input type="text" name="theme_' + item.id + '" id="theme_' + item.id + '"');
      html.push('" value="' + value + '"' + classColor + ' required="required" data-themeType="' + item.type + '">');

      if (item.type === 'color') {
        const hexa = getValueForColorPicker(value);
        html.push('<input type="color" id="themeColor_' + item.id + '" value="' + hexa + '" >');
      }
      html.push('</td></tr>');
    }
    html.push('</table>');

    return html.join('');
  };

  /**
   * Transform the emulations to his HTML representation
   * #return {String}
   */
  FormBuilder.prototype.emulationsToHtml = function () {
    const html = [];

    html.push('<table><tr>');
    html.push('<td><h2>Properties</h2></td>');
    html.push('<td class="reset-cell"><button id="reset" class="preview-button">Reset</button></td>');
    html.push('</tr></table>');
    html.push('<table>');
    html.push('<tr><td><label for="fixture">Fixture:</label></td>');
    html.push('<td><select id="fixture">');
    const fixtures = this.fixtures;
    const defaultFixture = this.form.fixture.replace(/\.xml$/i, '');
    for (let i = 0, l = fixtures.length; i < l; i++) {
      const fixture = fixtures[i].replace(/\.xml$/i, '');
      const selected = fixture === defaultFixture ? ' selected="selected"' : '';
      html.push('<option id="' + fixture + '"' + selected + '>' + fixture + '</option>');
    }
    html.push('</select></td></tr>');
    html.push('<tr><td><label for="emulation">Emulation:</label></td>');
    html.push('<td><select id="emulation">');
    const emulations = this.emulations;
    const defaultEmulation = this.form.emulation.replace(/\.xml$/i, '');
    for (let i = 0, l = emulations.length; i < l; i++) {
      const emulation = emulations[i].replace(/\.xml$/i, '');
      const selected = emulation === defaultEmulation ? ' selected="selected"' : '';
      html.push('<option id="' + emulation + '"' + selected + '>' + emulation + '</option>');
    }
    html.push('</select></td></tr>');
    html.push('</table>');
    return html.join('');
  };

  /**
   * Transform a category to his HTML representation
   * @param {Object} category ADX Category
   * #return {String}
   */
  FormBuilder.prototype.categoryToHtml = function (category) {
    const html = [];
    html.push('<h3>' + category.name + '</h3>');
    html.push('<table>');
    for (let i = 0, l = category.properties.length; i < l; i++) {
      html.push(this.propertyToHtml(category.properties[i]));
    }
    html.push('</table>');
    return html.join('');
  };

  /**
   * Transform a property his HTML representation
   * @param {Object} property ADX Property
   * #return {String}
   */
  FormBuilder.prototype.propertyToHtml = function (property) {
    const type = property.type;
    let value = property.value.toString();  // The value for color will preserve his original format
    const defaultValue = value;               // The default value for a color is on the original format
    let colorFormat = property.colorFormat;

    // Determine the format of color using the default value
    if (type === 'color' && !colorFormat) {
      colorFormat = getColorFormat(value) || 'rgba';
    }

    // Reset with backup value
    // For type color, only if the same format
    if (this._backup && this._backup.props && (property.id in this._backup.props)) {
      if (type !== 'color' || isColorSameFormat(value, this._backup.props[property.id])) {
        value = this._backup.props[property.id];
      }
    }

    this.form.properties.push({
      id: property.id,
      defaultValue: defaultValue,
      value: value,
      type: type,
      colorFormat: colorFormat
    });
    // Pointer to the item in the array
    this.form.propertyById[property.id] = this.form.properties[this.form.properties.length - 1];

    const html = [];
    const attrs = [];

    html.push('<tr>');
    html.push('<td><label for="property_' + property.id + '">' + property.name + '</label></td>');
    html.push('<td>');

    let inputType = 'text';

    if (type === 'number' || type === 'file') {
      inputType = type;
    }
    if (typeof property.min === 'number' && isFinite(property.min)) {
      attrs.push('min="' + property.min + '"');
    }
    if (typeof property.max === 'number' && isFinite(property.max)) {
      attrs.push('max="' + property.max + '"');
    }
    if (property.pattern) {
      attrs.push('pattern="' + escapeHtmlAttr(property.pattern) + '"');
    }
    if (property.require) {
      attrs.push('required="required"');
    }
    if (type === 'color') {
      attrs.push('class="color_text"');
    }
    if (Array.isArray(property.options) || type === 'boolean') {
      const opts = property.options || [{ value: 0, text: 'False' }, { value: 1, text: 'True' }];
      html.push('<select id="property_' + property.id + '">');
      opts.forEach((opt) => {
        const selected = opt.value.toString() === value ? ' selected="selected"' : '';
        html.push('<option value="' + escapeHtmlAttr(opt.value) + '"' + selected + '>' + opt.text + '</option>');
      });
      html.push('</select>');
    } else {
      html.push('<input type="' + inputType + '" id="property_' + property.id + '" value="' + escapeHtmlAttr(value) + '" ' + attrs.join(' ') + '/>');
      if (type === 'color') {
        html.push('<input type="color" id="color_' + property.id + '" value="' + getValueForColorPicker(value) + '" />');
      }
    }
    html.push('</td>');
    html.push('</tr>');
    return html.join('');
  };

  /**
   * Read the interview id in the iframe url and return it
   * @returns {String}
   */
  FormBuilder.prototype.getInterviewIdFromUrl = function () {
    return getUrlParameter('_id', this.iframe.contentWindow);
  };

  /**
   * Add listener
   * @chainable
   */
  FormBuilder.prototype.listen = function () {

    document.getElementById('reset').addEventListener('click', () => {
      this.reset();
    });
    document.getElementById('reset-theme').addEventListener('click', () => {
      this.resetTheme();
    });
    document.getElementById('properties-tab').addEventListener('click', () => {
      document.getElementById('properties-panel').style.display = 'block';
      document.getElementById('theme-panel').style.display = 'none';
      if (!document.getElementById('properties-tab').classList.contains('selected')) {
        document.getElementById('properties-tab').classList.add('selected');
        document.getElementById('theme-tab').classList.remove('selected');
      }
    });
    document.getElementById('theme-tab').addEventListener('click', () => {
      document.getElementById('properties-panel').style.display = 'none';
      document.getElementById('theme-panel').style.display = 'block';
      if (!document.getElementById('theme-tab').classList.contains('selected')) {
        document.getElementById('theme-tab').classList.add('selected');
        document.getElementById('properties-tab').classList.remove('selected');
      }
    });

    // Listen changes on the property grid
    this.grid.addEventListener('change', (event) => {
      const el = event.target || event.srcElement;
      let value = el.value;
      if (el.id === 'emulation' || el.id === 'fixture') {
        this.form[el.id] = value;
        this.restartInterview();
        return;
      }

      // Manage binding between input text and color picker 
      if (el.type !== 'color' && el.id.startsWith('property')) {
        const property = this.form.propertyById[el.id.replace(/^(property_)/i, '')];
        if (property.type === 'color') {
          document.getElementById('color_' + property.id).value = getValueForColorPicker(el.value);
        }
        property.value = el.value;
      } else if (el.type === 'color' && el.id.startsWith('color')) {
        const property = this.form.propertyById[el.id.replace(/^(color_)/i, '')];
        document.getElementById('property_' + property.id).value = hexaTo(property.colorFormat, el.value);
        property.value = hexaTo(property.colorFormat, el.value);
      } else if (el.type !== 'color' && el.id.startsWith('theme')) {
        const themeId = el.id.replace(/^(theme_)/i, '');
        if (el.getAttribute('data-themeType') === 'color') {
          document.getElementById('themeColor_' + themeId).value = getValueForColorPicker(el.value);
        }
        if (themeDefault[themeId] !== el.value) {
          this.form.themes[themeId] = el.value;
        } else {
          delete this.form.themes[themeId];
        }
      } else if (el.type === 'color' && el.id.startsWith('themeColor')) {
        const value = hexaTo('rgba', el.value);
        const themeId = el.id.replace(/^(themeColor_)/i, '');
        document.getElementById('theme_' + themeId).value = value;
        if (themeDefault[themeId] !== value) {
          this.form.themes[themeId] = value;
        } else {
          delete this.forms.themes[themeId];
        }
      }
      this.reloadPreview();
    });
    return this;
  };

  /**
   * Reload the preview
   * @chainable
   */
  FormBuilder.prototype.reloadPreview = function (action) {
    const params = [];

    action = action || (this.iframe.src === 'Loading.html') ? 'restart' : 'show';

    const properties = this.form.properties;
    for (let i = 0, l = properties.length; i < l; i += 1) {
      let property = properties[i];
      if (property.value !== property.defaultValue) {
        params.push('prop[' + encodeURIComponent(property.id) + ']=' + encodeURIComponent(property.value));
      }
    }

    for (let theme in this.form.themes) {
      params.push('theme[' + encodeURIComponent(theme) + ']=' + encodeURIComponent(this.form.themes[theme]));
    }

    // Change the url with the corresponding selected emulation
    const emulation = this.form.emulation;
    const fixture = this.form.fixture.replace(/\.xml$/i, '');
    const intvwId = this.getInterviewIdFromUrl();
    let url = 'http://localhost:' + tab.ports.http + '/fixture/' + fixture + '/' + emulation + '/' + action + '.html';
    if (intvwId && action === 'show') {
      params.push('_id=' + intvwId);
    }
    if (params.length) {
      url += '?' + params.join('&');
    }

    this.addressURL.value = url;
    this.iframe.src = url;
    return this;
  };

  /**
   * Restart a new interview
   */
  FormBuilder.prototype.restartInterview = function () {
    return this.reloadPreview('restart');
  };

  document.getElementById('openPreview').addEventListener('click', () => {
    const builder = FormBuilder.getInstance();
    const url = builder.addressURL.value;
    const intvwId = builder.getInterviewIdFromUrl();

    if (url) {
      // Remove the interview to start a new interview id
      viewer.workspaceView.openExternal(url.replace('_id=' + intvwId, ''));
    }
  });

  document.getElementById('reloadPreview').addEventListener('click', () => {
    FormBuilder.getInstance().reloadPreview();
  });

  document.getElementById('restartInterview').addEventListener('click', () => {
    FormBuilder.getInstance().restartInterview();
  });

  resizer.start();
  viewer.fireReady();
});
