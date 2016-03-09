document.addEventListener('DOMContentLoaded', function () {
    var  askia =  window.askia,
        resizer = new askia.Resizer({
            element: document.getElementById('grid'),
            direction: 'vertical',
            revert : true
        }),
        tab = viewer.currentTab,
        wsConnection =  new WebSocket("ws://localhost:" + tab.ports.ws);

    wsConnection.onopen = function onWsOpen() {
        // Initial message
        wsConnection.send(JSON.stringify({
            action : 'getConfig'
        }));
    };

    wsConnection.onmessage = function onWsMessage(event) {
        var data = JSON.parse(event.data);
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
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    /**
     * Convert RGB color to hexadecimal color
     *
     * @param {Number} r Red color (0-255)
     * @param {Number} g Green color (0-255)
     * @param {Number} b Blue color (0-255)
     * @returns {string} Hexadecimal representation with the '#'
     */
    function rgbToHex(r, g, b) {
        return "#" + componentToHex(parseFloat(r)) + componentToHex(parseFloat(g)) + componentToHex(parseFloat(b));
    }

    /**
     * Concert hexadecimal to RGB color as string "RED, GREEN, BLUE"
     * The hexadecimal could be in shorthand form (#03f for #0033ff)
     *
     * @param {String} hex Color in hexadecimal format (with or without '#')
     * @returns {String|Null} RGB color separate with ','
     */
    function hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? "" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) : null;
    }

    /**
     * Indicates if the value of the property has changed according to it's default value
     * @param property
     * @return {Boolean} True if the property has changed
     */
    function hasPropertyChanged(property) {
        if (property.type !== 'color') {
            return (property.value !== property.defaultValue);
        }
        // Convert the color to the original format
        var value = property.value;
        var isHexa = (value.substr(0, 1) === '#');
        if (property.colorFormat === 'hexa' && !isHexa) {
            value = rgbToHex.apply(null, value.split(','));
        } else if (property.colorFormat === 'rgb' && isHexa) {
            value = hexToRgb(value);
            if (property.colorAlpha !== null ) {
                value += ',' + property.colorAlpha;
            }
        }

        return property.defaultValue !== value;
    }

    /**
     * Build the form using the ADC info
     * @singleton
     */
    function FormBuilder() {
        if (FormBuilder.instance) {
            return FormBuilder.instance;
        }
        FormBuilder.instance = this;
        this.grid    = document.getElementById("grid");
        this.iframe  = document.getElementById("preview_frame");
        this.addressURL = document.getElementById("addressURL");
        this.listen(); // Only one listener
    }

    /**
     * Return a single instance of the ADC
     */
    FormBuilder.getInstance = function getInstance() {
        if (!FormBuilder.instance) {
            FormBuilder.instance = new FormBuilder();
        }
        return FormBuilder.instance;
    };


    /**
     * Update the form with the newest information
     * @param {Object} adcInfo
     * @chainable
     */
    FormBuilder.prototype.update = function update(adcInfo) {
        return this.init(adcInfo).build().reloadPreview();
    };

    /**
     * Backup the current selection before to re-init the form
     */
    FormBuilder.prototype.backup = function backup() {
        this._backup = {};

        if (!this.form) {
            return;
        }

        this._backup.output  = this.form.output;
        this._backup.fixture = this.form.fixture;
        this._backup.props   = {};

        var properties = this.form.properties,
            property,
            i, l;

        for (i = 0, l = properties.length; i < l; i += 1) {
            property = properties[i];
            if (hasPropertyChanged(property)) {
                this._backup.props[property.id] = property.value;
            }
        }
    };

    /**
     * Reset all default values
     */
    FormBuilder.prototype.reset = function reset() {
        this.form = null;
        this._backup = null;
        return this.update(this.adcInfo);
    };

    /**
     * Initialize the form builder with the ADC information
     * #chainable
     */
    FormBuilder.prototype.init = function init(adcInfo) {
        var i, l, isFound = false;

        this.backup();

        this.adcInfo       = adcInfo;
        this.config        = adcInfo.config;
        this.fixtures      = adcInfo.fixtures;
        this.categories    = this.config.properties.categories;
        this.outputs       = this.config.outputs;

        this.form    = {
            output  : this.outputs.defaultOutput,
            fixture : this.fixtures.defaultFixture,
            properties : [],
            propertyById  : {}
        };


        // Verify the backup against the current info
        if (this._backup && this._backup.output) {
            for (i = 0, l = this.outputs.outputs.length, isFound = false; i < l; i += 1) {
                if (this.outputs.outputs[i].id === this._backup.output) {
                    isFound = true;
                    break;
                }
            }
            // Use it for the current form
            if (isFound) {
                this.form.output = this._backup.output;
            }
        }

        // Verify the backup against the current info
        if (this._backup && this._backup.fixture) {
            for (i = 0, l = this.fixtures.list.length, isFound = false; i < l; i += 1) {
                if (this.fixtures.list[i].replace(/\.xml$/i, '') === this._backup.fixture) {
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
    FormBuilder.prototype.build = function build() {
        var html = [], i, l;

        html.push(this.outputsToHtml());

        for (i = 0, l = this.categories.length; i < l; i += 1) {
            html.push(this.categoryToHtml(this.categories[i]));
        }
        this.grid.innerHTML = html.join('');

        var self = this;
        document.getElementById("reset").addEventListener('click', function onReset() {
            self.reset();
        });

        return this;
    };

    /**
     * Transform the outputs to his HTML representation
     * #return {String}
     */
    FormBuilder.prototype.outputsToHtml = function outputsToHtml() {
        var i, l,
            selected,
            html = [],
            outputs = this.outputs.outputs,
            defaultOutput = this.form.output,
            fixtures = this.fixtures,
            defaultFixture = this.form.fixture.replace(/\.xml$/i, ''),
            fixture;

        html.push('<table><tr>');
        html.push('<td><h2>ADC Properties</h2></td>');
        html.push('<td class="reset-cell"><button id="reset">Reset</button></td>');
        html.push('</tr></table>');
        html.push('<table>');
        html.push('<tr><td><label for="output">Output:</label></td>');
        html.push('<td><select id="output">');
        for (i = 0, l = outputs.length; i < l; i++) {
            selected = outputs[i].id === defaultOutput ? ' selected="selected"' : '';
            html.push('<option id="' + outputs[i].id + '"' + selected + '>' + outputs[i].id + '</option>');
        }
        html.push('</select></td></tr>');
        html.push('<tr><td><label for="fixture">Fixture:</label></td>');
        html.push('<td><select id="fixture">');
        for (i = 0, l = fixtures.list.length; i < l; i++) {
            fixture = fixtures.list[i].replace(/\.xml$/i, '');
            selected = fixture === defaultFixture ? ' selected="selected"' : '';
            html.push('<option id="' + fixture + '"' + selected + '>' + fixture + '</option>');
        }
        html.push('</select></td></tr>');
        html.push('</table>');
        return html.join('');
    };

    /**
     * Transform a category to his HTML representation
     * @param {Object} category ADC Category
     * #return {String}
     */
    FormBuilder.prototype.categoryToHtml = function categoryToHtml(category) {
        var html = [], i, l;
        html.push('<h3>' + category.name + '</h3>');
        html.push('<table>');
        for (i = 0, l = category.properties.length; i < l; i++) {
            html.push(this.propertyToHtml(category.properties[i]));
        }
        html.push('</table>');
        return html.join('');
    };

    /**
     * Transform a property his HTML representation
     * @param {Object} property ADC Property
     * #return {String}
     */
    FormBuilder.prototype.propertyToHtml =  function propertyToHtml(property) {
        var html = [],
            type = property.type,
            value = property.value.toString(),  // The value for color will preserve his original format
            defaultValue = value,               // The default value for a color is on the original format
            displayValue = value,               // The value to display for a color is always hexa
            attrs = [],
            colorFormat = null,
            colorAlpha = null,
            rgba, isHexa;

        // Determine the format of color using the default value
        if (type === 'color') {
            value        = value.replace(/\s/g, ""); // Remove spaces
            defaultValue = value;
            displayValue = value;
            colorFormat = (defaultValue.substr(0, 1) !== '#') ? 'rgb'  : 'hexa';

            // Get the RGB components and set the display value
            if (colorFormat === 'rgb') {
                rgba = defaultValue.split(",");
                if (rgba.length === 4) {
                    colorAlpha = rgba[3];
                }
                displayValue = rgbToHex(rgba[0], rgba[1], rgba[2]);
            }
        }

        if (this._backup && this._backup.props && (property.id in this._backup.props)) {
            value = this._backup.props[property.id];
            displayValue = value;

            // Make sure the format in the backup value is still correct
            // and convert the value accordingly
            if (type === 'color') {
                isHexa = (value.substr(0, 1) === '#');
                if (!isHexa) {
                    rgba = value.split(",");
                    displayValue = rgbToHex(rgba[0], rgba[1], rgba[2]);
                }
                if (colorFormat === 'hexa' && !isHexa) {
                    value = displayValue;
                } else if (colorFormat === 'rgb' && isHexa) {
                    value = hexToRgb(value);
                }
            }
        }

        html.push('<tr>');
        html.push('<td><label for="property_' + property.id  + '">' + property.name + '</label></td>');
        html.push('<td>');

        this.form.properties.push({
            id           : property.id,
            defaultValue : defaultValue,
            value        : value,
            type         : type,
            colorFormat  : colorFormat,
            colorAlpha   : colorAlpha
        });
        // Pointer to the item in the array
        this.form.propertyById[property.id] = this.form.properties[this.form.properties.length - 1];

        if (type === 'string' || type === 'question') {
            type = 'text';
        }
        if (typeof property.min === 'number' && isFinite(property.min)) {
            attrs.push('min="' + property.min + '"');
        }
        if (typeof property.max === 'number' && isFinite(property.max)) {
            attrs.push('max="' + property.max + '"');
        }
        if (property.pattern) {
            attrs.push('pattern="' + property.pattern + '"');
        }
        if (property.require) {
            attrs.push('required="required"');
        }
        if (Array.isArray(property.options) || type === 'boolean') {
            var opts = property.options || [{value : 0, text : "False"}, {value : 1, text : "True"}];
            html.push('<select id="property_' + property.id + '">');
            opts.forEach(function (opt) {
                var selected = opt.value.toString() === value ? ' selected="selected"' : '';
                html.push('<option value="' + opt.value + '"' + selected + '>' + opt.text + '</option>');
            });
            html.push('</select>');
        } else {
            if (type === "color") {
                html.push('<input type="text" id="color_' + property.id + '" value="' + property.value + '" class="color_text"'  + attrs.join(' ') + '/>');
            }
            html.push('<input type="' + type + '" id="property_' + property.id + '" value="' + displayValue + '" ' + attrs.join(' ') + '/>');
        }
        html.push('</td>');
        html.push('</tr>');
        return html.join('');
    };

    /**
     * Add listener
     * @chainable
     */
    FormBuilder.prototype.listen = function listen() {
        var self = this;

        self.ongridChange = function ongridChange(event) {
            var el = event.target || event.srcElement,
                property,
                value = el.value;

            if (el.id === 'output' || el.id === 'fixture') {
                self.form[el.id] = value;
            } else {
                property = self.form.propertyById[el.id.replace(/^(property_|color_)/i, '')];
                if (property.colorFormat === 'rgb') {
                    value = hexToRgb(value);
                    // Add the original alpha value
                    if (property.colorAlpha !== null) {
                        value += ',' + property.colorAlpha;
                    }
                }
                property.value = value;
            }
            self.reloadPreview();
        };
        this.grid.addEventListener('change', self.ongridChange);

        return this;
    };

    /**
     * Reload the preview
     * @chainable
     */
    FormBuilder.prototype.reloadPreview = function reloadPreview(){
        var properties = this.form.properties,
            property,
            params  = [],
            output  = this.form.output,
            fixture = this.form.fixture,
            url     = "http://localhost:" + tab.ports.http + "/output/",
            i, l,
            tempValue;

        for (i = 0, l = properties.length; i < l; i += 1) {
            property = properties[i];
            if (property.value !== property.defaultValue) {
                if (property.value === null) {
                    var inputColor = document.querySelectorAll('#property_' + property.id + '')[0];
                    var inputText = document.querySelectorAll('#color_' + property.id + '')[0];
                    var rgb = inputText.value.split(',');
                    property.value = inputText.value;
                    inputColor.value = rgbToHex(rgb[0], rgb[1], rgb[2]);
                } else if (property.type === "color") {
                    var inputText = document.querySelectorAll('#color_' + property.id + '')[0];
                    var inputColor = document.querySelectorAll('#property_' + property.id + '')[0];
                    if (property.value.substr(0, 1) !== '#') {
                    var rgb = property.value.split(',');
                    inputColor.value = rgbToHex(rgb[0], rgb[1], rgb[2]);
                    } else {
                        inputColor.value = property.value;
                    }
                    inputText.value = property.value;
                }

                params.push(encodeURIComponent(property.id) + "=" + encodeURIComponent(property.value));
            }
        }

        url += output+ "/" + fixture;
        if (params.length) {
            url += '?' + params.join('&')
        }
        this.iframe.src = url ;
        this.addressURL.value = url;

        return this;
    };

    document.getElementById('openPreview').addEventListener('click', function () {
        var builder = FormBuilder.getInstance();
        var url = builder.addressURL.value;
        if (url) {
            viewer.tabs.openExternal(url);
        }
    });

    document.getElementById('reloadPreview').addEventListener('click', function () {
        FormBuilder.getInstance().reloadPreview();
    });

    resizer.start();
    viewer.fireReady();
});
