const fs            = require('fs');
const path          = require('path');
const et            = require('elementtree');
const subElement    = et.SubElement;
const common        = require('../common/common.js');
const errMsg        = common.messages.error;

/**
 * Object used to read and manipulate the config.xml file of an ADX
 *
 *      const ADX = require('adxutil').ADX;
 *
 *      const myAdx = new ADX('path/to/adx/');
 *      myAdx.load(function (err) {
 *          if (err) {
 *              throw err;
 *          }
 *
 *          // Get the instance of the Configurator
 *          const conf = myAdx.configurator;
 *
 *          console.log(conf.info.name());
 *
 *      });
 *
 *
 * @class Configurator
 * @param {String} dir Path of the ADX directory
 */
function Configurator(dir) {
    if (!dir) {
        throw new Error(errMsg.invalidPathArg);
    }

    /**
     * Path of the ADX directory
     *
     * @name Configurator#path
     * @type {String}
     */
    this.path   = dir;

    /**
     * Type of the project (`adc` or `adp`)
     *
     * @name Configurator#projectType
     * @type {String|"adc"|"adp"}
     */
    this.projectType = null;

    /**
     * Version of the ADX project
     *
     * @name Configurator#projectVersion
     * @type {String}
     */
    this.projectVersion = null;

    /**
     * XML document (ElementTree)
     *
     * @name Configurator#xmlDoc
     * @type {Object}
     * @private
     */
    this.xmldoc = null;

    /**
     * Info of the ADX
     *
     * @name Configurator#info
     * @type {Configurator.Info}
     */
    this.info = null;

    /**
     * Outputs of the ADX
     *
     * @name Configurator#outputs
     * @type {Configurator.Outputs}
     */
    this.outputs = null;

    /**
     * Properties of the ADX
     *
     * @name Configurator#properties
     * @type {Configurator.Properties}
     */
    this.properties = null;
}

/**
 * Create a new instance of the ADX configurator object
 *
 * @ignore
 */
Configurator.prototype.constructor = Configurator;

/**
 * Read the config.xml file and initialize all properties of the current instance object
 *
 *       // Load the config file
 *       configurator.load(function (err) {
 *          if (err) {
 *              throw err;
 *          }
 *          console.log(adxInfo.name());
 *       });
 *
 * @param {Function} [callback] Callback function
 * @param {Error} [callback.err] Error
 */
Configurator.prototype.load = function load(callback) {

    callback = callback || function () {};
    const self = this;

    common.dirExists(this.path, (err, isExist) => {
        if (err) {
            callback(err);
            return;
        }
        if (!isExist) {
            callback(errMsg.noSuchFileOrDirectory);
            return;
        }

        const filePath = path.join(self.path, common.CONFIG_FILE_NAME);


        fs.readFile(filePath, (err, data) => {
            if (err) {
                callback(err);
                return;
            }
            self.fromXml(data.toString());
            callback(null);

        });

    });
};

/**
 * Get the entire configuration as object
 *
 *       // Get the info object
 *       configurator.get();
 *       // {
 *       //   info : { // .... },
 *       //   outputs : { // ... },
 *       //   properties : { // ...}
 *       // }
 *
 * @return {Object}
 */
Configurator.prototype.get = function get() {
    return {
        info : this.info.get(),
        outputs : this.outputs.get(),
        properties : this.properties.get()
    };
};

/**
 * Set th configuration using an object
 *
 *       // Get the info object
 *       configurator.set(
 *          info {
 *              name : "My ADC"
 *              version : "2.2.0.beta1",
 *              date  : "2019-06-25",
 *              guid  : "the-guid",
 *              description : "Description of the ADC"
 *              author  : "The author name",
 *              company : "The company name",
 *              site    : "http://website.url.com",
 *              helpURL : "http://help.url.com",
 *              constraints : {
 *                  questions : {
 *                     single : true,
 *                     multiple : true
 *                  },
 *                  controls : {
 *                      responseBlock : true
 *                  },
 *                  responses : {
 *                      max : 10
 *                  }
 *              }
 *          },
 *          outputs : {
 *              defaultOutput : "main",
 *              outputs : [
 *                 {
 *                     id : "main",
 *                     description : "Main output",
 *                      contents : [
 *                           {
 *                              fileName : 'main.css',
 *                              type : 'css',
 *                              mode : 'static',
 *                              position : 'head'
 *                          },
 *                          {
 *                              fileName : 'main.html',
 *                              type : 'html',
 *                              mode : 'dynamic',
 *                              position : 'placeholder'
 *                          },
 *                          {
 *                              fileName : 'main.js',
 *                              type : 'javascript',
 *                              mode : 'static',
 *                              position: 'foot'
 *                          }
 *                      ]
 *                  },
 *                  {
 *                      id : "second",
 *                      description : "Second output",
 *                      condition : "Browser.Support(\"javascript\")",
 *                      contents : [
 *                          {
 *                              fileName : 'second.css',
 *                              type : 'css',
 *                              mode : 'static',
 *                              position : 'head'
 *                          },
 *                          {
 *                              fileName : 'second.html',
 *                              type : 'html',
 *                              mode : 'dynamic',
 *                              position : 'placeholder'
 *                          },
 *                          {
 *                              fileName : 'second.js',
 *                              type : 'javascript',
 *                              mode : 'static',
 *                              position : 'foot'
 *                          }
 *                      ]
 *                  },
 *                  {
 *                      id : "third",
 *                      description : "Third output",
 *                      maxIterations : 12,
 *                      defaultGeneration : false,
 *                      contents : [
 *                          {
 *                              fileName : "third.css",
 *                              type  : "css",
 *                              mode : "static",
 *                              position : "head",
 *                              attributes : [
 *                                  {
 *                                      name : "rel",
 *                                      value : "alternate"
 *                                  },
 *                                  {
 *                                      name : "media",
 *                                      value : "print"
 *                                  }
 *                              ]
 *                          },
 *                          {
 *                              fileName : 'HTML5Shim.js',
 *                              type : 'javascript',
 *                              mode : 'static',
 *                              position : 'head',
 *                              yieldValue : '<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
 *                          }
 *                      ]
 *                 }
 *              },
 *              properties : {
 *                  categories : [
 *                     {
 *                         id : "general",
 *                         description : "General",
 *                         properties  : [
 *                               {
 *                                  id : "background",
 *                                  name : "Background color",
 *                                  type : "color",
 *                                  description : "Color of the ADC background",
 *                                  colorFormat : "rgb",
 *                                  value  : "255,255,255"
 *                              }
 *                        ]
 *                     }
 *                  ]
 *              }
 *        });
 *
 * @param {Object} data Data to set
 * @param {Object} [data.info] Info data
 * @param {Object} [data.outputs] Outputs data
 * @param {Object} [data.properties] Properties data
 */
Configurator.prototype.set = function set(data) {
    if (data.info) {
        this.info.set(data.info);
    }
    if (data.outputs) {
        this.outputs.set(data.outputs);
    }
    if (data.properties) {
        this.properties.set(data.properties);
    }
};

/**
 * Return the configuration as xml
 *
 *       // Serialize the config to XML
 *       configurator.toXml();
 *       // -> <?xml version="1.0" encoding="utf-8"?>
 *             <control  xmlns="http://www.askia.com/2.3.0/ADCSchema"
 *             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 *             xsi:schemaLocation="http://www.askia.com/2.3.0/ADCSchema https://raw.githubusercontent.com/AskiaADX/ADXSchema/2.3.0/ADCSchema.xsd"
 *             version="2.3.0"
 *             askiaCompat="5.6.0">
 *                 <info>
 *                     <name>My Name</name>
 *                     <guid>the-guid</guid>
 *                     ....
 *                 </info>
 *                 <outputs defaultOutput="default">
 *                     ....
 *                 </outputs>
 *                 <properties>
 *                     ....
 *                 </properties>
 *               </control>
 *
 * @return {String}
 */
Configurator.prototype.toXml = function toXml() {
    const xml = [];
    const projectType = this.projectType;
    const projectVersion = this.projectVersion;
    const rootName = (projectType === 'adc') ? 'control' : 'page';
    const namespaceURI = 'http://www.askia.com/' + projectVersion + '/' + projectType.toUpperCase() + 'Schema';
    const schemaURI = 'https://raw.githubusercontent.com/AskiaADX/ADXSchema/' + projectVersion + '/' + projectType.toUpperCase() + 'Schema.xsd';
    const infoXml = this.info.toXml();
    const outputsXml = this.outputs.toXml();
    const propertiesXml = this.properties.toXml();
    let askiaCompat;

    switch(projectVersion) {
        case '2.3.0':
          askiaCompat = "5.6.0";
          break;

        case '2.2.0':
          askiaCompat = "5.5.2";
          break;

        case '2.1.0':
            askiaCompat = "5.4.2";
            break;

        case '2.0.0':
        default:
            askiaCompat = "5.3.3";
            break;
    }

    xml.push('<?xml version="1.0" encoding="utf-8"?>');
    xml.push('<' + rootName + '  xmlns="' + namespaceURI + '"' +
            '\n          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
            '\n          xsi:schemaLocation="' + namespaceURI + ' ' + schemaURI + '"' +
            '\n          version="' + projectVersion + '"' +
            '\n          askiaCompat="' + askiaCompat + '">');

    if (infoXml) {
        xml.push(infoXml);
    }
    if (outputsXml) {
        xml.push(outputsXml);
    }
    if (propertiesXml) {
        xml.push(propertiesXml);
    }
    xml.push('</' + rootName + '>');

    return xml.join('\n');
};

/**
 * Re-init the configurator using the xml string
 *
 *       // Load the configuration using an xml string
 *       // xmlString contains information from config.xml
 *       configurator.fromXml(xmlString);
 *
 */
Configurator.prototype.fromXml = function fromXml(xml) {
    this.xmldoc = et.parse(xml);
    const rootEl = this.xmldoc.getroot();

    switch (rootEl && rootEl.tag) {
        case 'control':
            this.projectType = 'adc';
            this.projectVersion = rootEl.get("version") || "2.0.0";
            break;
        case 'page':
            this.projectType = 'adp';
            this.projectVersion = rootEl.get("version") || "2.1.0";
            break;
        default:
            throw new Error(errMsg.invalidConfigFile);
    }

    this.info = new ADXInfo(this);
    this.outputs = new ADXOutputs(this);
    this.properties = new ADXProperties(this);
};

/**
 * Save the current configuration
 *
 * @param {Function} [callback]
 * @param {Error} callback.err
 */
Configurator.prototype.save = function save(callback) {
    const filePath = path.join(this.path, common.CONFIG_FILE_NAME);
    const self = this;
    fs.writeFile(filePath, this.toXml(), {encoding : 'utf8'}, (err) => {
        if (!err) {
            self.load(callback);
        } else {
            if (typeof callback === 'function') {
                callback(err);
            }
        }
    });
};

/**
 * Provide an object to manipulate the meta-information of the ADX (config.xml > info)
 *
 *      const ADX = require('adxutil').ADX;
 *
 *      const myAdx = new ADX('path/to/adx/');
 *      myAdx.load(function (err) {
 *          if (err) {
 *              throw err;
 *          }
 *
 *          // Get the instance of the Info
 *          const info = myAdx.configurator.info;
 *
 *          console.log(info.get());
 *
 *      });
 *
 * @class Configurator.Info
 * @param {ADX.Configurator} configurator Instance of the configurator
 */
function ADXInfo(configurator) {

    /**
     * Parent configurator
     *
     * @name Configurator.Info#configurator
     * @type {Configurator}
     */
    this.configurator = configurator;
}

/**
 * Creates a new instance of ADX Info
 *
 * @ignore
 */
ADXInfo.prototype.constructor = ADXInfo;

/**
 * Get the entire information as object
 *
 *       // Get the info object
 *       adxInfo.get();
 *       // {
 *       //   name : "My ADC"
 *       //   version : "2.2.0.beta1",
 *       //   date  : "2019-06-25",
 *       //   guid  : "the-guid",
 *       //   description : "Description of the ADC"
 *       //   author  : "The author name",
 *       //   company : "The company name",
 *       //   site    : "http://website.url.com",
 *       //   helpURL : "http://help.url.com",
 *       //   constraints : {
 *       //       questions : {
 *       //          single : true,
 *       //          multiple : true
 *       //       },
 *       //       controls : {
 *       //           responseBlock : true
 *       //       },
 *       //       responses : {
 *       //           max : 10
 *       //       }
 *       //   }
 *       // }
 *
 * @name Configurator.Info#get
 * @function
 * @return {Object}
 */
ADXInfo.prototype.get = function get() {
    const self = this;
    const result = {};
    const projectType = this.configurator.projectType;
    const projectVersion = this.configurator.projectVersion;
    const info = ["name", "guid", "version", "date", "description", "company", "author", "site", "helpURL"];

    if (projectType === 'adc') {
        info.push("categories");
        if (projectVersion === '2.0.0') {
            info.push("style");
        }
        info.push("constraints");
    }

    info.forEach((methodName) => {
         result[methodName] = self[methodName]();
    });
    return result;
};

/**
 * Set the information using a plain object
 *
 *       // Get the info object
 *       adxInfo.set({
 *          name : "My ADC"
 *          version : "2.2.0.beta1",
 *          date  : "2019-06-25",
 *          guid  : "the-guid",
 *          description : "Description of the ADC"
 *          author  : "The author name",
 *          company : "The company name",
 *          site    : "http://website.url.com",
 *          helpURL : "http://help.url.com",
 *          constraints : {
 *              questions : {
 *                 single : true,
 *                 multiple : true
 *              },
 *              controls : {
 *                  responseBlock : true
 *              },
 *              responses : {
 *                  max : 10
 *              }
 *          }
 *        });
 *
 *
 * @name Configurator.Info#set
 * @function
 * @param {Object} data Data to set
 * @param {String} [data.name] Name of the ADX
 * @param {String} [data.version] Version of the ADX
 * @param {String} [data.date] Date of the ADX (YYYY-MM-dd)
 * @param {String} [data.guid] GUID of the ADX
 * @param {String} [data.description] Description of the ADX
 * @param {String} [data.author] Author(s) of the ADX (name1 <name1@email.com, name2 <name2@email.com>)
 * @param {String} [data.company] Company name of the creator
 * @param {String} [data.site] Web site URL of the creator
 * @param {String} [data.helpURL] URL to the ADX help
 * @param {Object} [data.style] [DEPRECATED] Style of the ADC
 * @param {Number} [data.style.width] [DEPRECATED] Width of the ADC (in pixel)
 * @param {Number} [data.style.height] [DEPRECATED] Height of the ADC (in pixel)
 * @param {String[]} [data.categories] [DEPREACATED] Categories of the ADC
 * @param {Object} [data.constraints] Constraints of the ADC (ADC ONLY)
 * @param {Object} [data.constraints.questions] Questions constraints of the ADC (ADC ONLY)
 * @param {Boolean} [data.constraints.questions.chapter] Allow or not on chapter
 * @param {Boolean} [data.constraints.questions.single] Allow  or not on single questions
 * @param {Boolean} [data.constraints.questions.multiple] Allow or not on multi-coded questions
 * @param {Boolean} [data.constraints.questions.numeric] Allow or not on numeric questions
 * @param {Boolean} [data.constraints.questions.open] Allow or not on open-ended questions
 * @param {Boolean} [data.constraints.questions.date] Allow or not on date questions
 * @param {Boolean} [data.constraints.questions.requireParentLoop] Require or not on a parent loop question
 * @param {Number} [data.constraints.questions.requireLoopDepth] Require or not on a parent loop question
 * @param {Boolean} [data.constraints.questions.manageSemiOpen] Require or not on questions with semi-opens
 * @param {Boolean} [data.constraints.questions.manageHeader] Require or not on questions with header responses(non selectable)
 * @param {Object} [data.constraints.controls] Controls constraints of the ADC (ADC ONLY)
 * @param {Boolean} [data.constraints.controls.responseBlock] Allow or not on response-block
 * @param {Boolean} [data.constraints.controls.label] Allow or not on label
 * @param {Boolean} [data.constraints.controls.textbox] Allow or not on text-box
 * @param {Boolean} [data.constraints.controls.listbox] Allow or not on list-box
 * @param {Boolean} [data.constraints.controls.checkbox] Allow or not on checkbox
 * @param {Boolean} [data.constraints.controls.radiobutton] Allow or not on radio button
 * @param {Object} [data.constraints.responses] Responses constraints of the ADC (ADC ONLY)
 * @param {Number} [data.constraints.responses.min] Minimum allowed responses
 * @param {Number} [data.constraints.responses.max] Maximum allowed responses
 */
ADXInfo.prototype.set = function set(data) {
    const self = this;

    if (!data) {
        return;
    }


    ["name", "guid", "version", "date", "description", "company", "author", "site",
        "helpURL", "categories", "style", "constraints"].forEach((methodName) => {
            if (data.hasOwnProperty(methodName)) {
                self[methodName](data[methodName]);
            }
        });
};


["name", "guid", "version", "date", "description", "company", "author", "site", "helpURL"].forEach(function (propName) {
    /**
     * Get or set the name of the ADX
     *
     *       // Get the name of the ADX
     *       adxInfo.name();
     *
     *       // Set the name of the ADX
     *       adxInfo.name("New name");
     *
     * @name Configurator.Info#name
     * @function
     * @param {String} [data] Name of the ADX to set
     * @returns {String} Name of the ADX
     */
    /**
     * Get or set the GUID of the ADX
     *
     *       // Get the guid of the ADX
     *       adxInfo.guid();
     *
     *       // Set the guid of the ADC
     *       const uuid = require('uuid'');
     *       adxInfo.guid(uuid.v4());
     *
     * @name Configurator.Info#guid
     * @function
     * @param {String} [data] GUID of the ADX to set
     * @returns {String} GUID of the ADX
     */
    /**
     * Get or set the version of the ADX
     *
     *       // Get the version of the ADX
     *       adxInfo.version();
     *
     *       // Set the version of the ADX
     *       adxInfo.version("2.0.0.beta1");
     *
     * @name Configurator.Info#version
     * @function
     * @param {String} [data] Version of the ADX to set
     * @returns {String} Version of the ADX
     */
    /**
     * Get or set the description of the ADX
     *
     *       // Get the description of the ADX
     *       adxInfo.description();
     *
     *       // Set the description of the ADX
     *       adxInfo.description("This is the description of the ADX");
     *
     * @name Configurator.Info#description
     * @function
     * @param {String} [data] Description of the ADX to set
     * @returns {String} Description of the ADX
     */
    /**
     * Get or set the company name of the ADX creator
     *
     *       // Get the company of the ADX
     *       adxInfo.company();
     *
     *       // Set the company of the ADX
     *       adxInfo.company("Askia SAS");
     *
     * @name Configurator.Info#company
     * @function
     * @param {String} [data] Company name to set
     * @returns {String} Company of the ADX creator
     */
    /**
     * Get or set the author(s) of the ADX
     *
     *       // Get the author(s) of the ADX
     *       adxInfo.author();
     *
     *       // Set the author(s) of the ADX
     *       adxInfo.author("John Doe <john.doe@unknow.com>, Foo Bar <foo@bar.com>");
     *
     * @name Configurator.Info#author
     * @function
     * @param {String} [data] Author(s) to set
     * @returns {String} Author(s)
     */
    /**
     * Get or set the date creation of the ADX
     *
     *       // Get the date
     *       adxInfo.date();
     *
     *       // Set the date
     *       adxInfo.date("2015-06-25");
     *
     * @name Configurator.Info#date
     * @function
     * @param {String} [data] Date to set
     * @returns {String} Date
     */
    /**
     * Get or set the website URL of the ADX creator
     *
     *       // Get the site
     *       adxInfo.site();
     *
     *       // Set the site URL
     *       adxInfo.site("http://my.website.com");
     *
     * @name Configurator.Info#site
     * @function
     * @param {String} [data] URL to set
     * @returns {String} Site URL
     */
    /**
     * Get or set the help URL of the ADX
     *
     *       // Get the help URL
     *       adxInfo.helpURL();
     *
     *       // Set the help URL
     *       adxInfo.helpURL("http://my.help.file.com");
     *
     * @name Configurator.Info#helpURL
     * @function
     * @param {String} [data] URL to set
     * @returns {String} Help URL
     */

    ADXInfo.prototype[propName] = function (data) {
        const xmldoc = this.configurator.xmldoc;
        let elInfo = xmldoc.find('info');
        const isSetter = data !== undefined;

        // No root info
        if (!elInfo && isSetter) {
            elInfo = subElement(xmldoc.getroot(), 'info');
        } else if (!elInfo && !isSetter) {
            return '';
        }

        let el = elInfo.find(propName);

        // No element
        if (!el && isSetter) {
            el = subElement(elInfo, propName);
        } else if (!el && !isSetter) {
            return '';
        }

        if (isSetter) {
            el.text = data;
        }
        return el.text;
    };
});

/**
 * Get or set the style
 *
 *       // Get the style of the ADC
 *       adxInfo.style();
 *
 *       // Set the style of the ADC
 *       adxInfo.style({
 *          width  : 400,
 *          height : 200
 *       });
 *
 * @deprecated
 * @name Configurator.Info#style
 * @function
 * @param {Object} [data] Style to set
 * @param {Number} [data.width] Style width
 * @param {Number} [data.height] Style height
 * @returns {Object}
 */
ADXInfo.prototype.style = function style(data) {
    if (this.configurator.projectType !== 'adc') {
        return;
    }
    if (this.configurator.projectVersion !== "2.0.0") {
        return;
    }
    const  xmldoc = this.configurator.xmldoc;
    let elInfo = xmldoc.find("info");
    const isSetter = (data !== undefined);

    if (!elInfo && isSetter) {
        elInfo = subElement(xmldoc.getroot(), "info");
    } else if (!elInfo && !isSetter) {
        return { width : 0,height : 0 };
    }


    let el = elInfo.find("style");
    if (!el && isSetter) {
        el = subElement(elInfo, "style");
    } else if (!el && !isSetter) {
        return {width : 0, height : 0};
    }

    const result = {};
    let w, h;
    if (isSetter) {
        if (data.width !== undefined) {
            el.set("width", data.width);
        }
        if (data.height !== undefined) {
            el.set("height", data.height);
        }
    }
    w = el.get("width") || "0";
    h = el.get("height") || "0";

    result.width = parseInt(w, 10);
    result.height = parseInt(h, 10);

    return result;
};

/**
 * Get or set the categories
 *
 *       // Get the categories of the ADC
 *       adxInfo.categories();
 *
 *       // Set the categories of the ADC
 *       adxInfo.categories(["General", "Slider", "Single"]);
 *
 * @deprecated
 * @name Configurator.Info#categories
 * @function
 * @param {String[]} [data] Array of string which represent the categories to set
 * @returns {String[]} Name of categories
 */
ADXInfo.prototype.categories = function categories(data) {
    if (this.configurator.projectType !== 'adc') {
        return;
    }
    const xmldoc = this.configurator.xmldoc;
    let elInfo = xmldoc.find('info');
    const isSetter = Array.isArray(data);

    // No root info
    if (!elInfo && isSetter) {
        elInfo = subElement(xmldoc.getroot(), 'info');
    } else if (!elInfo && !isSetter) {
        return [];
    }

    let el = elInfo.find("categories");

    // No categories
    if (!el && isSetter) {
        el = subElement(elInfo, 'categories');
    } else if (!el && !isSetter) {
        return [];
    }

    const result = [];
    if (isSetter) {
        el.delSlice(0, el.len());
        data.forEach((text) => {
            const cat = subElement(el, 'category');
            cat.text = text;
        });
    }

    el.iter('category', (cat) => {
        result.push(cat.text);
    });

    return result;
};

/**
 * Get or set the constraints
 *
 *       // Get the constraints of the ADC
 *       adxInfo.constraints();
 *
 *       // Set the constraints of the ADC
 *       adxInfo.constraints({
 *          questions : {
 *              single : true,
 *              multiple : true
 *          },
 *          controls : {
 *              responseBlock : true,
 *              label : false
 *          },
 *          responses : {
 *              max : 25
 *          }
 *       });
 *
 * @name Configurator.Info#constraints
 * @function
 * @param {Object} [data] Constraint data to set (ADC ONLY)
 * @return {Object} Constraints
 */
ADXInfo.prototype.constraints = function constraints(data) {
    const projectVersion = this.configurator.projectVersion;

    if (this.configurator.projectType !== 'adc') {
        return;
    }
    const xmldoc = this.configurator.xmldoc;
    let elInfo = xmldoc.find("info");

    // No root info
    if (!elInfo && data) {
        elInfo = subElement(xmldoc.getroot(), 'info')
    } else if (!elInfo && !data) {
        return {};
    }

    let el = elInfo.find("constraints");

    // No constraints
    if (!el && data) {
        el = subElement(elInfo, 'constraints');
    } else if (!el && !data) {
        return {};
    }

    const result = {};

    if (data) {
        Object.keys(data).forEach((on) => {
            if (on !== 'questions' &&  on !== 'responses' &&  on !== 'controls') {
               return;
            }
            let node = el.find("constraint[@on='" + on + "']");
            if (!node) {
                node = subElement(el, "constraint");
                node.set("on", on);
            }

            Object.keys(data[on]).forEach((attName) => {
                const value = data[on][attName].toString();
                node.set(attName,  value);
            });

        });
    }

    el.iter('constraint', (constraint) => {
        const on = constraint.get("on");
        const value = {};

        constraint.keys().forEach((attName) => {
            if (attName === 'on') {
                return;
            }
            let v = constraint.get(attName);
            if (attName === 'min' || attName === 'max') {
                if (v !== '*') {
                    v = parseInt(v, 10);
                }
            } else if(attName === 'requireLoopDepth') {
              if (projectVersion !== '2.2.0' & projectVersion !== '2.3.0') {
                return;
              } else {

                // v = (v == 'true' ? 1 : 0);
                if (v == 'false') {
                    v = 0;
                } else if (v == 'true'){
                    v = 1;
                }
              }
            } else {
              v = v !== undefined && (v !== 'false' && v !== '0' );
            }

            value[attName] = v;
        });

        result[on] = value;
    });

    return result;
};

/**
 * Get or set the constraint (ADC Only)
 *
 *       // Get the constraint 'single' on questions
 *       adxInfo.constraint('questions', 'single');
 *
 *       // Set the constraint 'single' on questions
 *       adxInfo.constraint('questions', 'single', true);
 *
 * @name Configurator.Info#constraint
 * @function
 * @param {String} where Which constraint to target
 * @param {String} attName Name of the constraint attribute to get or set
 * @param {Boolean|Number} [attValue] Value of the attribute to set
 * @return {Boolean|Number} Value of the attribute
 */
ADXInfo.prototype.constraint = function constraint(where, attName, attValue) {
    const xmldoc = this.configurator.xmldoc;
    let el = xmldoc.find("info/constraints/constraint[@on='" + where + "']");
    let result;
    if (attValue !== undefined) {
        if (!el) {
            const parent = xmldoc.find('info/constraints');
            if (!parent) {
                throw new Error("Unable to find the  `constraints` node ");
            }
            el = subElement(parent, 'constraint');
            el.set("on", where);
        }
        el.set(attName, attValue.toString());
    }

    if (!el) {
        return (attName === 'min' || attName === 'max') ? Infinity  : false;
    }

    result = el.get(attName);

    // Some properties are treat as number instead of boolean
    if (attName === 'min' || attName === 'max') {
        if (result === '*') {
            return Infinity;
        }
        return parseInt(result, 10);
    }

    if (result === undefined) {
        return false;
    }

    return (result !== "false" && result !== "0");
};

/**
 * Return the info as xml string
 *
 *       // Serialize the info to XML
 *       adxInfo.toXml();
 *       // -> <info><name>MyADC</name><guid>the-guid</guid>....</info>
 *
 * @name Configurator.Info#toXml
 * @function
 * @return {String}
 */
ADXInfo.prototype.toXml = function toXml() {
    const xml = [];
    const self = this;
    const projectType = this.configurator.projectType;
    const projectVersion = this.configurator.projectVersion;
    const constraintsKeys = ['questions', 'controls', 'responses'];
    let style;
    let constraints;

    xml.push('  <info>');

    ["name", "guid", "version", "date", "description", "company", "author", "site",
        "helpURL"].forEach((methodName) => {
            let data = self[methodName]();
            if (methodName === 'description' || methodName === 'author') {
                data = '<![CDATA[' + data + ']]>';
            }
            xml.push('    <' + methodName + '>' + data + '</' + methodName + '>');
    });

    // ADC Only
    if (projectType === 'adc') {
        xml.push('    <categories>');
        self.categories().forEach((cat) => {
            xml.push('      <category>' + cat + '</category>');
        });
        xml.push('    </categories>');

        if (projectVersion === '2.0.0') {
            style = self.style();
            xml.push('    <style width="' + style.width + '" height="' + style.height + '" />' );
        }

        constraints = self.constraints();
        xml.push('    <constraints>');

        constraintsKeys.forEach((on) => {
            if (!constraints[on]) {
                return;
            }
            let str = '      <constraint on="' + on + '"';
            let constraint = constraints[on];
            for(let key in constraint) {
                if (constraint.hasOwnProperty(key)) {
                    str += ' ' + key + '="' + constraint[key].toString() + '"';
                }
            }
            str += ' />';
            xml.push(str);
        });
        xml.push('    </constraints>');
    }

    xml.push('  </info>');
    return xml.join('\n');
};


/**
 * Provide an object to manipulate the outputs  of the ADC (config.xml > outputs)
 *
 *      const ADX = require('adxutil').ADX;
 *
 *      const myAdx = new ADC('path/to/adx/');
 *      myAdx.load(function (err) {
 *          if (err) {
 *              throw err;
 *          }
 *
 *          // Get the instance of the Outputs
 *          const outputs = myAdx.configurator.outputs;
 *
 *          console.log(outputs.get());
 *
 *      });
 *
 * @class Configurator.Outputs
 * @param {ADX.Configurator} configurator Instance of the configurator
 */
function ADXOutputs(configurator) {
    /**
     * Parent configurator
     *
     * @name Configurator.Outputs#configurator
     * @type {Configurator}
     */
    this.configurator = configurator;
}

/**
 * Creates a new instance of ADX Outputs
 *
 * @ignore
 */
ADXOutputs.prototype.constructor = ADXOutputs;

/**
 * Get or set the default ADX output
 *
 *       // Get the id default output
 *       adxOutputs.defaultOutput();
 *
 *       // Set the default output id
 *       adxOutputs.defaultOutput("without_javascript");
 *
 * @name Configurator.Outputs#defaultOutput
 * @function
 * @param {String} [data] Id of the default output to set
 * @returns {String} Id of the default output
 */
ADXOutputs.prototype.defaultOutput = function defaultOutput(data) {
    const xmldoc = this.configurator.xmldoc;
    let el = xmldoc.find("outputs");
    if (!el) {
        el = subElement(xmldoc.getroot(), 'outputs');
    }
    if (data && typeof data === 'string') {
        el.set('defaultOutput', data);
    }
    return el.get('defaultOutput');
};

/**
 * Get outputs as an object
 *
 *       // Get the outputs object
 *       adxOutputs.get();
 *       // {
 *       //   defaultOutput  : "main",
 *       //   outputs : [{
 *       //      id : 'main',
 *       //      description : "Description of the output"
 *       //      condition : "Condition of the output",
 *       //      manageLoopDepth : "manageLoopDepth"
 *       //      contents  : [{
 *       //         fileName : "default.html",
 *       //         type     : "html",
 *       //         mode     : "dynamic",
 *       //         position : "placeholder"
 *       //      }]
 *       //   }]
 *
 * @name Configurator.Outputs#get
 * @function
 * @returns {Object}
 */
ADXOutputs.prototype.get = function get() {
    const xmldoc = this.configurator.xmldoc;
    const projectType = this.configurator.projectType;
    const projectVersion = this.configurator.projectVersion;
    const el = xmldoc.find("outputs");
    const outputs = [];

    if (!el) {
        return null;
    }

    el.iter('output', (output) => {
        // Output element
        const item = {
            id : output.get("id"),
            condition : output.get("condition")
        };
        const descEl = output.find("description");
        if (descEl) {
            item.description = descEl.text;
        }
        const conditionEl = output.find("condition");
        if (conditionEl) {
            item.condition = conditionEl.text;
        }

        // ADC Only
        if (projectType === 'adc') {
            if (projectVersion == "2.2.0" | projectVersion == "2.3.0") {
              const manageLoopDepth = output.get("manageLoopDepth");
              item.manageLoopDepth = parseInt(manageLoopDepth);

              const manageLoopDepthEl = output.find("manageLoopDepth");
              if (manageLoopDepthEl) {
                  item.manageLoopDepth = parseInt(manageLoopDepthEl.value);
              }
            }

            const defaultGeneration = output.get("defaultGeneration");
            if (defaultGeneration) {
                item.defaultGeneration = (defaultGeneration === "1" || defaultGeneration === "true");
            }
            const maxIter = output.get("maxIterations");
            if (maxIter) {
                item.maxIterations = (maxIter === "*") ? "*" : parseInt(maxIter, 10);
            }
        }
        // ADP Only
        else if (projectType === 'adp') {
            const masterPage = output.get("masterPage");
            if (masterPage) {
                item.masterPage = masterPage;
            }
        }

        // Contents
        const contents = [];
        output.iter('content', (content) => {
            const itemContent = {};
            const fileName = content.get('fileName');
            if (fileName) {
                itemContent.fileName = fileName;
            }
            const type = content.get('type');
            if (type) {
                itemContent.type = type;
            }
            const mode = content.get('mode');
            if (mode) {
                itemContent.mode = mode;
            }
            const position = content.get('position');
            if (position) {
                itemContent.position = position;
            }

            // ADC Only
            if (projectType === 'adp' && itemContent.position === 'placeholder') {
                return;
            }

            // Attributes
            const attributes = [];
            content.iter('attribute', (attribute) => {
                const itemAttr = {};
                itemAttr.name = attribute.get("name");
                const value = attribute.find("value");
                if (value) {
                    itemAttr.value = value.text;
                }
                attributes.push(itemAttr);
            });

            if (attributes.length) {
                itemContent.attributes = attributes;
            }

            // Yield
            const yieldNode = content.find('yield');
            if (yieldNode) {
                itemContent.yieldValue = yieldNode.text;
            }

            contents.push(itemContent);

        });

        if (contents.length) {
            item.contents = contents;
        }

        outputs.push(item);
    });

    return {
        defaultOutput : this.defaultOutput(),
        outputs       : outputs
    };
};

/**
 * Set the outputs using a plain object
 *
 *       // Get the outputs object
 *       adxOutputs.set({
 *          defaultOutput : "main",
 *          outputs : [
 *             {
 *                 id : "main",
 *                 description : "Main output",
 *                  contents : [
 *                       {
 *                          fileName : 'main.css',
 *                          type : 'css',
 *                          mode : 'static',
 *                          position : 'head'
 *                      },
 *                      {
 *                          fileName : 'main.html',
 *                          type : 'html',
 *                          mode : 'dynamic',
 *                          position : 'placeholder'
 *                      },
 *                      {
 *                          fileName : 'main.js',
 *                          type : 'javascript',
 *                          mode : 'static',
 *                          position: 'foot'
 *                      }
 *                  ]
 *              },
 *              {
 *                  id : "second",
 *                  description : "Second output",
 *                  condition : "Browser.Support(\"javascript\")",
 *                  contents : [
 *                      {
 *                          fileName : 'second.css',
 *                          type : 'css',
 *                          mode : 'static',
 *                          position : 'head'
 *                      },
 *                      {
 *                          fileName : 'second.html',
 *                          type : 'html',
 *                          mode : 'dynamic',
 *                          position : 'placeholder'
 *                      },
 *                      {
 *                          fileName : 'second.js',
 *                          type : 'javascript',
 *                          mode : 'static',
 *                          position : 'foot'
 *                      }
 *                  ]
 *              },
 *              {
 *                  id : "third",
 *                  description : "Third output",
 *                  maxIterations : 12,
 *                  defaultGeneration : false,
 *                  manageLoopDepth : 0,
 *                  contents : [
 *                      {
 *                          fileName : "third.css",
 *                          type  : "css",
 *                          mode : "static",
 *                          position : "head",
 *                          attributes : [
 *                              {
 *                                  name : "rel",
 *                                  value : "alternate"
 *                              },
 *                              {
 *                                  name : "media",
 *                                  value : "print"
 *                              }
 *                          ]
 *                      },
 *                      {
 *                          fileName : 'HTML5Shim.js',
 *                          type : 'javascript',
 *                          mode : 'static',
 *                          position : 'head',
 *                          yieldValue : '<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
 *                      }
 *                  ]
 *             }
 *
 *       });
 *
 * @name Configurator.Outputs#set
 * @function
 * @param {Object} data Data to set
 * @param {String} [data.defaultOutput] Id of the default output
 * @param {Object[]} [data.outputs] Outputs
 * @param {String} [data.outputs.id] Id of the output
 * @param {String} [data.outputs.masterPage] Master page to use for the ADP output
 * @param {String} [data.outputs.description] Description of the output
 * @param {String} [data.outputs.condition] AskiaScript condition to use the output
 * @param {Number} [data.outputs.manageLoopDepth] manage loop depth of the output
 * @param {Object[]} [data.outputs.contents] List of contents (files) used by the output
 * @param {String} [data.outputs.contents.fileName] Name of the file
 * @param {String|"text"|"html"|"css"|"javascript"|"binary"|"image"|"audio"|"video"|"flash"|"asx"} [data.outputs.contents.type] Name of the file
 * @param {String|"dynamic"|"static"|"share"|"modules"} [data.outputs.contents.mode] Extract mode
 * @param {String|"none"|"head"|"placeholder"|"foot"} [data.outputs.contents.position] Position in the final page document
 * @param {Object[]} [data.outputs.contents.attributes] List of HTML attributes
 * @param {String} [data.outputs.contents.attributes.name] Name of the HTML attribute
 * @param {String} [data.outputs.contents.attributes.value] Value of the HTML attribute
 * @param {String} [data.outputs.contents.yieldValue] Yield value, used to override the auto-generation
 */
ADXOutputs.prototype.set = function set(data) {
    const xmldoc = this.configurator.xmldoc;
    let el = xmldoc.find("outputs");
    const projectType = this.configurator.projectType;
    const projectVersion = this.configurator.projectVersion;

    if (!data) {
        return;
    }

    if (!el) {
        el = subElement(xmldoc.getroot(), 'outputs');
    }

    if (data.defaultOutput) {
        el.set("defaultOutput", data.defaultOutput);
    }
    if (!data.outputs || !Array.isArray(data.outputs)) {
        return;
    }
    el.delSlice(0, el.len());
    data.outputs.forEach((output) => {
        const item = subElement(el, 'output');

        // All output xml attributes
        item.set("id", output.id || "");
        // ADC Only
        if (projectType === 'adc') {
          if (typeof output.defaultGeneration === 'boolean') {
            item.set("defaultGeneration", output.defaultGeneration.toString());
          }
          if (output.maxIterations) {
            item.set("maxIterations", output.maxIterations);
          }
          if (projectVersion == '2.2.0' | projectVersion == '2.3.0') {
            item.set("manageLoopDepth", parseInt(output.manageLoopDepth));
          }
        }
        // ADP Only
        else if (projectType === 'adp') {
          if (output.masterPage) {
              item.set("masterPage", output.masterPage);
          }
        }

        // All output sub-nodes
        if (output.description) {
            var desc = subElement(item, 'description');
            desc.text = output.description;
        }
        if (output.condition) {
            var cond = subElement(item, 'condition');
            cond.text = output.condition;
        }

        if (!output.contents || !Array.isArray(output.contents)) {
            return;
        }

        output.contents.forEach((content) => {
            // ADP don't use content with "placeholder" position
            if (projectType === 'adp' && content.position === 'placeholder') {
                return;
            }
            const itemContent = subElement(item, 'content');
            itemContent.set("fileName", content.fileName || "");
            itemContent.set("type", content.type || "");
            itemContent.set("mode", content.mode || "");
            itemContent.set("position", content.position || "");

            if (content.attributes && Array.isArray(content.attributes)) {
                content.attributes.forEach((attribute) => {
                    const itemAttr = subElement(itemContent, 'attribute');
                    itemAttr.set('name', attribute.name || "");
                    if (typeof attribute.value === 'string') {
                        const itemAttrVal = subElement(itemAttr, 'value');
                        itemAttrVal.text = attribute.value;
                    }
                });
            }
            if (content.yieldValue) {
                const itemYield = subElement(itemContent, 'yield');
                itemYield.text = content.yieldValue;
            }

        });
    });

};

/**
 * Return the outputs as xml string
 *
 *       // Serialize the outputs to XML
 *       adxOutputs.toXml();
 *       // -> <outputs defaultOutput="main"><output id="main"> ...</outputs>
 *
 * @name Configurator.Outputs#toXml
 * @function
 * @return {String}
 */
ADXOutputs.prototype.toXml = function toXml() {
    const xml = [];
    const data = this.get();
    const projectType = this.configurator.projectType;
    const projectVersion = this.configurator.projectVersion;

    if (!data) {
        return '';
    }
    xml.push('  <outputs defaultOutput="' + data .defaultOutput + '">');
    if (Array.isArray(data.outputs)) {
        data.outputs.forEach((output) => {
            let outputAttr = '';

            // ADC Only
            if (projectType === 'adc') {
                if (typeof output.defaultGeneration === 'boolean') {
                    outputAttr += ' defaultGeneration="' + output.defaultGeneration.toString() + '"';
                }
                if (output.maxIterations) {
                    outputAttr += ' maxIterations="' + output.maxIterations + '"';
                }
                if (projectVersion == '2.2.0' | projectVersion == '2.3.0') {
                  let manageLoopDepth = output.manageLoopDepth;
                  if (isNaN(manageLoopDepth)) {
                    manageLoopDepth = 0;
                  }
                  outputAttr += ' manageLoopDepth="' + manageLoopDepth + '"';
                }
            }
            // ADP Only
            else if (projectType ==='adp') {
                if (output.masterPage) {
                    outputAttr += ' masterPage="' + output.masterPage + '"';
                }
            }

            xml.push('    <output id="' + output.id + '"' + outputAttr + '>');
            if (output.description) {
                xml.push('      <description><![CDATA[' + output.description + ']]></description>');
            }
            if (output.condition) {
                xml.push('      <condition><![CDATA[' + output.condition + ']]></condition>');
            }

            if (Array.isArray(output.contents)) {
                output.contents.forEach((content) => {
                    // ADC Only
                    if (projectType === 'adp' && content.position === 'placeholder'){
                        return;
                    }
                    const xmlContent = [];
                    xmlContent.push('      <content');
                    xmlContent.push(' fileName="', content.fileName || "", '"');
                    xmlContent.push(' type="', content.type || "", '"');
                    xmlContent.push(' mode="', content.mode || "", '"');
                    xmlContent.push(' position="', content.position || "", '"');
                    if (!content.attributes && !content.yieldValue) {
                        xmlContent.push(' />');
                    } else {
                        xmlContent.push('>');
                        if (Array.isArray(content.attributes)) {
                            content.attributes.forEach((attr) => {
                                xmlContent.push('\n        <attribute name="' + attr.name + '">');
                                if (attr.value) {
                                    xmlContent.push('\n          <value><![CDATA[' + (attr.value || "") + ']]></value>');
                                }
                                xmlContent.push('\n        </attribute>');
                            });
                        }

                        if (content.yieldValue) {
                            xmlContent.push('\n        <yield><![CDATA[' + content.yieldValue + ']]></yield>');
                        }
                        xmlContent.push('\n      </content>');
                    }
                    xml.push(xmlContent.join(''));
                });
            }
            xml.push('    </output>');
        });
    }
    xml.push('  </outputs>');
    return xml.join('\n');
};


/**
 * Provide an object to manipulate the propertues of the ADC (config.xml > properties)
 *
 *      const ADX = require('adxutil').ADX;
 *
 *      const myAdx = new ADX('path/to/adc/');
 *      myAdx.load(function (err) {
 *          if (err) {
 *              throw err;
 *          }
 *
 *          // Get the instance of the Properties
 *          const properties = myAdx.configurator.properties;
 *
 *          console.log(properties.get());
 *
 *      });
 *
 * @class Configurator.Properties
 * @param {ADX.Configurator} configurator Instance of the configurator
 */
function ADXProperties(configurator) {

    /**
     * Parent configurator
     *
     * @name Configurator.Properties#configurator
     * @type {Configurator}
     */
    this.configurator = configurator;
}

/**
 * Creates a new instance of ADX Properties
 *
 * @ignore
 */
ADXProperties.prototype.constructor = ADXProperties;


/**
 * Get properties as an object
 *
 *       // Get the properties object
 *       adxProperties.get();
 *       // {
 *       //   categories : [{
 *       //      id : "general",
 *       //      name : "General"
 *       //      properties  : [{
 *       //         id : "renderingType",
 *       //         name : "Rendering Type",
 *       //         type : "string",
 *       //         description : "Type of the ADC rendering",
 *       //         value : "classic",
 *       //         options : [{
 *       //           value : "classic",
 *       //           text  : "Classical"
 *       //         }, {
 *       //           value : "image",
 *       //           text  : "Image"
 *       //         }]
 *       //      }]
 *       //   }, {
 *       //      id : "styles",
 *       //      name : "Styles",
 *       //      properties : [{
 *       //         id : "bg",
 *       //         name : "Background color",
 *       //         type : "color",
 *       //         description : "Background color of the ADC",
 *       //         colorFormat : "rgb",
 *       //         value : "255,255,255"
 *       //      }]
 *       //   }
 *       // }
 *
 * @name Configurator.Properties#get
 * @function
 * @returns {Object}
 */
ADXProperties.prototype.get = function get() {
    const xmldoc = this.configurator.xmldoc;
    const projectType = this.configurator.projectType;
    const el = xmldoc.find("properties");
    const categories = [];

    if (!el) {
        return null;
    }

    el.iter('category', (category) => {
        // Category element
        const itemCategory = {
            id : category.get("id") || "",
            name : category.get("name") || "",
            // condition: category.get("condition") || "",
            properties : []
        };

        // const conditionEl = category.find("condition");
        // if (conditionEl) {
        //     itemCategory.condition = conditionEl.text;
        // }

        category.iter('property', (property) => {
            const itemProperty = {};
            const xsiType = property.get('xsi:type');
            if (xsiType && xsiType !== 'standardProperty') {
                itemProperty.xsiType = xsiType;
            }
            itemProperty.id = property.get('id') || "";
            let val = property.get('name');
            if (val) {
                itemProperty.name = val;
            }
            val = property.get('type');
            if (val) {
                itemProperty.type = val;
            }
            val = property.get('mode');
            if (val) {
                itemProperty.mode = val;
            }
            val = property.get('visible');
            if (val) {
                itemProperty.visible = (val !== "false" && val !== "0");
            }
            val = property.get('require');
            if (val) {
                itemProperty.require = (val !== "false" && val !== "0");
            }

            // Number
            val = property.get('min');
            if (val) {
                itemProperty.min = parseFloat(val) || val;
            }
            val = property.get('max');
            if (val) {
                itemProperty.max = parseFloat(val) || val;
            }
            val = property.get('decimal');
            if (val) {
                itemProperty.decimal = parseInt(val, 10) || val;
            }

            // String
            val = property.get('pattern');
            if (val) {
                itemProperty.pattern = val;
            }

            // File
            val = property.get('fileExtension');
            if (val) {
                itemProperty.fileExtension = val;
            }

            // Color
            val = property.get('colorFormat');
            if (val) {
                itemProperty.colorFormat = val;
            }

            // Questions
            val = property.get('chapter');
            if (val) {
                itemProperty.chapter = (val !== "false" && val !== "0");
            }
            val = property.get('single');
            if (val) {
                itemProperty.single = (val !== "false" && val !== "0");
            }
            val = property.get('multiple');
            if (val) {
                itemProperty.multiple = (val !== "false" && val !== "0");
            }
            val = property.get('numeric');
            if (val) {
                itemProperty.numeric = (val !== "false" && val !== "0");
            }
            val = property.get('open');
            if (val) {
                itemProperty.open = (val !== "false" && val !== "0");
            }
            val = property.get('date');
            if (val) {
                itemProperty.date = (val !== "false" && val !== "0");
            }

            const desc = property.find('description');
            if (desc) {
                itemProperty.description = desc.text;
            }

            property.iter('value', (value) => {
                // The theme attribute has been deprecated
                // only use valud that doesn't have this attribute
                const deprecatedTheme = value.get("theme");
                if (!deprecatedTheme && !("value" in itemProperty)) {
                    itemProperty.value = value.text || "";
                }
            });

            const options = property.find('options');
            if (options) {
                const itemOptions = [];
                options.iter('option', (option) => {
                    itemOptions.push({
                        value : option.get("value") || "",
                        text : option.get("text") || ""
                    });
                });
                if (itemOptions.length) {
                    itemProperty.options = itemOptions;
                }
            }

            // Deprecated system properties
            if ( itemProperty.xsiType === 'askiaProperty' &&  itemProperty.id === 'askia-theme') {
                return;
            }

            // ADC only: property type=question is available for ADC only
            if (projectType !== 'adc' && itemProperty.type === 'question') {
                return;
            }

            itemCategory.properties.push(itemProperty);
        });

        categories.push(itemCategory);
    });

    return {
        categories       : categories
    };
};


/**
 * Set the properties using a plain object
 *
 *       // Get the properties object
 *       adxProperties.set({
 *          categories : [
 *             {
 *                 id : "general",
 *                 description : "General",
 *                 properties  : [
 *                       {
 *                          id : "background",
 *                          name : "Background color",
 *                          type : "color",
 *                          description : "Color of the ADC background",
 *                          colorFormat : "rgb",
 *                          value  : "255,255,255"
 *                      }
 *                ]
 *             }
 *          ]
 *       });
 *
 * @name Configurator.Properties#set
 * @function
 * @param {Object} data Data to set
 * @param {Object[]} [data.categories] Categories
 * @param {String} [data.categories.id] Id of the category
 * @param {String} [data.categories.name] User friendly name of the category
 * @param {Object[]} [data.categories.properties] Properties of the category
 * @param {String} [data.categories.properties.id] Id of the property
 * @param {String} [data.categories.properties.name] Name of the property
 * @param {String|"number"|"boolean"|"string"|"color"|"file"|"question"} [data.categories.properties.type] Type of the property
 * @param {String} [data.categories.properties.description] Description of the property
 * @param {String|"static"|"dynamic"|"modules"} [data.categories.properties.mode] Reading mode of the property value
 * @param {Boolean} [data.categories.properties.visible] Visibility of the property value
 * @param {Boolean} [data.categories.properties.require] Requirement of the property value
 * @param {String} [data.categories.properties.pattern] Pattern of the string property
 * @param {Number} [data.categories.properties.min] Min value of the number property
 * @param {Number} [data.categories.properties.max] Max value of the number property
 * @param {Number} [data.categories.properties.decimal] Allowed decimal of the number property
 * @param {Boolean} [data.categories.properties.chapter] Allowed chapter for question property
 * @param {Boolean} [data.categories.properties.single] Allowed single-closed question for question property
 * @param {Boolean} [data.categories.properties.multiple] Allowed multi-coded question for question property
 * @param {Boolean} [data.categories.properties.numeric] Allowed numeric question for question property
 * @param {Boolean} [data.categories.properties.open] Allowed open-ended question for question property
 * @param {Boolean} [data.categories.properties.date] Allowed date/time question for question property
 * @param {String} [data.categories.properties.value] Default property value
 * @param {Object[]} [data.categories.properties.options] List of options
 * @param {String} [data.categories.properties.options.value] Value of the option
 * @param {String} [data.categories.properties.options.text] Text of the option to display
 */
ADXProperties.prototype.set = function set(data) {
    const xmldoc = this.configurator.xmldoc;
    const projectType = this.configurator.projectType;
    let el = xmldoc.find("properties");

    if (!data || !data.categories || !Array.isArray(data.categories)) {
        return;
    }

    if (!el) {
        el = subElement(xmldoc.getroot(), 'properties');
    }
    el.delSlice(0, el.len());
    data.categories.forEach((category) => {
        const itemCategory = subElement(el, 'category');

        itemCategory.set("id", category.id || "");
        itemCategory.set("name", category.name || "");
        // itemCategory.set("condition", category.condition || "");

        if (category.properties && Array.isArray(category.properties)) {
            category.properties.forEach((property) => {
                // property question is available for the ADC only
                if (projectType !== 'adc' && property.type === 'question') {
                    return;
                }
                const itemProperty = subElement(itemCategory, 'property');
                itemProperty.set('xsi:type', property.xsiType || "standardProperty");
                itemProperty.set('id', property.id || "");
                const props = ["name", "type", "mode", "require", "visible", "min", "max", "decimal", "pattern",
                    "fileExtension", "colorFormat", "chapter", "single", "multiple", "numeric", "open", "date"];
                props.forEach((prop) => {
                    if (prop in property) {
                        itemProperty.set(prop, property[prop].toString());
                    }
                });

                if ("description" in property) {
                    const itemDesc = subElement(itemProperty, "description");
                    itemDesc.text = property.description || "";
                }
                if ("value" in property) {
                    const itemValue = subElement(itemProperty, "value");
                    itemValue.text = property.value || "";
                }

                if (property.options && Array.isArray(property.options)) {
                    const itemOptions = subElement(itemProperty, "options");
                    property.options.forEach((option) => {
                        const itemOption = subElement(itemOptions, "option");
                        itemOption.set("value", option.value.toString());
                        itemOption.set("text", option.text.toString());
                    });
                }
            });
        }
    });

};


/**
 * Return the properties as xml string
 *
 *       // Serialize the properties to XML
 *       adxProps.toXml();
 *       // -> <properties><category id="genereal" name="Genereal"> ...</properties>
 *
 * @name Configurator.Properties#toXml
 * @function
 * @return {String}
 */
ADXProperties.prototype.toXml = function toXml() {
    const xml = [];
    const data = this.get();
    const projectType = this.configurator.projectType;

    if (!data) {
        return '';
    }
    xml.push('  <properties>');
    if (Array.isArray(data.categories)) {
        data.categories.forEach((category) => {
            xml.push('    <category id="' + (category.id || "") + '" name="' + (category.name || "")  + '">');

            // if (category.condition) {
            //     xml.push('      <condition><![CDATA[' + category.condition + ']]></condition>');
            // }

            if (Array.isArray(category.properties)) {
                category.properties.forEach((property) => {
                    // The property question ia only available for the ADC
                    if (projectType !== 'adc' && property.type === 'question') {
                        return;
                    }
                    const xmlProp = [];
                    let value;
                    xmlProp.push('      <property');
                    xmlProp.push(' xsi:type="', (property.xsiType || "standardProperty"), '"');
                    xmlProp.push(' id="', property.id || "", '"');
                    const props = ["name", "type", "mode", "require", "visible", "min", "max", "decimal", "pattern",
                        "fileExtension", "colorFormat", "chapter", "single", "multiple", "numeric", "open", "date"];
                    props.forEach((prop) => {
                        if (prop in property) {
                            xmlProp.push(' ' + prop + '="', property[prop].toString() , '"');
                        }
                    });
                    xmlProp.push('>');

                    if ("description" in property) {
                        xmlProp.push('\n        <description><![CDATA[' + property.description + ']]></description>');
                    }
                    if ("value" in property) {
                        value = property.value;
                        if (value !== "") {
                            value = '<![CDATA[' + value + ']]>';
                        }
                        xmlProp.push('\n        <value>' + value + '</value>');
                    }
                    if (property.options && Array.isArray(property.options)) {
                        xmlProp.push('\n        <options>');
                        property.options.forEach((opt) => {
                            xmlProp.push('\n          <option value="' + opt.value +'" text="' + opt.text + '" />');
                        });
                        xmlProp.push('\n        </options>');
                    }


                    xmlProp.push('\n      </property>');

                    xml.push(xmlProp.join(''));
                });
            }
            xml.push('    </category>');
        });
    }
    xml.push('  </properties>');
    return xml.join('\n');
};

// Make it public
exports.Configurator = Configurator;
