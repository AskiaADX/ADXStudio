document.addEventListener('DOMContentLoaded', function () {
    var  askia =  window.askia,
        resizer = new askia.Resizer({
            element: document.getElementById('preview'),
            direction: 'vertical'
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
            if (property.value !== property.defaultValue) {
                this._backup.props[property.id] = property.value;
            }
        }
    };

    /**
     * Initialize the form builder with the ADC information
     * #chainable
     */
    FormBuilder.prototype.init = function init(adcInfo) {
        var i, l, isFound = false;

        this.backup();

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

        html.push('<h2>ADC Properties</h2>');
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
            value = property.value.toString(),
            attrs = [];

        if (this._backup && this._backup.props && (property.id in this._backup.props)) {
            value = this._backup.props[property.id];
        }

        html.push('<tr>');
        html.push('<td><label for="property_' + property.id  + '">' + property.name + '</label></td>');
        html.push('<td>');

        this.form.properties.push({
            id           : property.id,
            defaultValue : property.value.toString(),
            value        : value
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
            html.push('<input type="' + type + '" id="property_' + property.id + '" value="' + value + '" ' + attrs.join(' ') + '/>');
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
            var el = event.target || event.srcElement;
            if (el.id === 'output' || el.id === 'fixture') {
                self.form[el.id] = el.value;
            } else {
                self.form.propertyById[el.id.replace(/^property_/i, '')].value = el.value;
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
            i, l;

        for (i = 0, l = properties.length; i < l; i += 1) {
            property = properties[i];
            if (property.value !== property.defaultValue) {
                params.push(encodeURIComponent(property.id) + "=" + encodeURIComponent(property.value));
            }
        }

        url += output+ "/" + fixture + '?' + params.join('&');
        this.iframe.src = url ;

        return this;
    };


    resizer.start();
    viewer.fireReady();
});