const zenDesk         = require('node-zendesk');
const fs              = require('fs');
const common          = require('../common/common.js');
const path            = require('path');
const errMsg          = common.messages.error;
const successMsg      = common.messages.success;
const Configurator    = require('../configurator/ADXConfigurator.js').Configurator;
const request         = require('request');

/**
 * Instantiate a Zendesk publisher
 *
 * @class PublisherZenDesk
 * @private
 * @param {Configurator} configurator the configuration of the article
 * @param {Object} preferences User preferences
 * @param {Object} options Options of the platform, if the options are not specified the user preferences will be loaded.
 * @param {String} options.username ZenDesk username
 * @param {String} options.password ZenDesk password
 * @param {String} options.url ZenDesk base URL
 * @param {String} options.section Title of the ZenDesk section into where the publish should be done
 * @param {Boolean} [options.promoted=false] Promoted article
 * @param {Boolean} [options.disableComments=false] Disabled comments
 * @param {String} [options.demoUrl] URL to the online demo
 * @param {Boolean} [options.silent=false] Don't write in the console
 */
function PublisherZenDesk(configurator, preferences, options) {
    if (!configurator) {
        throw new Error(errMsg.missingConfiguratorArg);
    }
    if (!(configurator instanceof Configurator)) {
        throw new Error(errMsg.invalidConfiguratorArg);
    }

    /**
     * Options of the publisher
     *
     * @name PublisherZenDesk#options
     * @type {Object}
     */
    this.options = options || {};

    /**
     * Configurator of the ADX
     *
     * @name PublisherZenDesk#configurator
     * @type {Configurator}
     */
    this.configurator = configurator;

    if (options.logger) {
        this.logger = options.logger;
    }
    if (options.printMode) {
        this.printMode = options.printMode || 'default';
    }
    
    if (preferences && preferences.ZenDesk) {
        for (var option in preferences.ZenDesk) {
            if (preferences.ZenDesk.hasOwnProperty(option)) {
                if (!(option in this.options)) {
                    this.options[option] = preferences.ZenDesk[option];
                }
            }
        }
    }

    // All of these options must be present either in the command line either in the preference file of the user
    const neededOptions = ['username', 'password', 'url', 'section'];
    for (let i = 0, l = neededOptions.length; i < l; i++) {
        let neededOption = neededOptions[i];
        if (!this.options.hasOwnProperty(neededOption)) {
            throw new Error(errMsg.missingPublishArgs + '\n missing argument : ' + neededOption);
        }
    }

    this.client = zenDesk.createClient({
        username    : this.options.username,
        password    : this.options.password,
        remoteUri	: this.options.url + "/api/v2/help_center",
        helpcenter 	: true  // IMPORTANT: Should be always set to true, otherwise the article methods are not available
    });
}

/**
 * Write an error output in the console
 *
 * @param {String} text Text to write in the console
 */
PublisherZenDesk.prototype.writeError = function writeError(text) {
    const args = Array.prototype.slice.call(arguments);
    if (this.printMode === 'html' && args.length) {
        args[0] = '<div class="error">' + args[0] + '</div>';
    }
    if (this.logger && typeof this.logger.writeError === 'function') {
        this.logger.writeError.apply(this.logger, args);
    } else {
        common.writeError.apply(common, args);
    }
};

/**
 * Write a warning output in the console
 *
 * @param {String} text Text to write in the console
 */
PublisherZenDesk.prototype.writeWarning = function writeWarning(text) {
    const args = Array.prototype.slice.call(arguments);
    if (this.printMode === 'html' && args.length) {
        args[0] = '<div class="warning">' + args[0] + '</div>';
    }
    if (this.logger && typeof this.logger.writeWarning === 'function') {
        this.logger.writeWarning.apply(this.logger, args);
    } else {
        common.writeWarning.apply(common, args);
    }
};

/**
 * Write a success output in the console
 *
 * @param {String} text Text to write in the console
 */
PublisherZenDesk.prototype.writeSuccess = function writeSuccess(text) {
    const args = Array.prototype.slice.call(arguments);
    if (this.printMode === 'html' && args.length) {
        args[0] = '<div class="success">' + args[0] + '</div>';
    }
    if (this.logger && typeof this.logger.writeSuccess === 'function') {
        this.logger.writeSuccess.apply(this.logger, args);
    } else {
        common.writeSuccess.apply(common, args);
    }
};

/**
 * Write an arbitrary message in the console without specific prefix
 *
 * @param {String} text Text to write in the console
 */
PublisherZenDesk.prototype.writeMessage = function writeMessage(text) {
    const args = Array.prototype.slice.call(arguments);
    if (this.printMode === 'html' && args.length) {
        args[0] = '<div class="message">' + args[0] + '</div>';
    }
    if (this.logger && typeof this.logger.writeMessage === 'function') {
        this.logger.writeMessage.apply(this.logger, args);
    } else {
        common.writeMessage.apply(common, args);
    }
};


/**
 * Find the section id of a section with the Title
 *
 * @param {PublisherZenDesk} self
 * @param {Function} callback
 * @param {Error} [callback.err=null]
 * @ignore
 */
function findSectionIdByTitle(self, callback) {
    let title = self.options.section;
    if (typeof title !== 'string') {
        callback(errMsg.invalidSectionArg);
        return;
    }

    title = title.toLowerCase();

    self.client.sections.list((err, req, result) => {
        if (err) {
            if (typeof callback === "function") {
                callback(err);
            }
            return;
        }

        for (let section in result) {
            if (result.hasOwnProperty(section)) {
                if (result[section].name.toLowerCase() === title) {
                    if (typeof callback === "function") {
                        callback(null, result[section].id);
                        return;
                    }
                }
            }
        }

        callback(errMsg.nonExistingSection);
    });
}

/**
 * Generate an HTML string which is a line of a 3 columns array with the name of the property category.
 *
 * @param {Object} category object which represents a category of properties.
 * @ignore
 */
function generateHtmlCodeForCategory(category) {
    return '<tr>\n' +
        '<th data-sheets-value="[null,2,&quot;' + category.name + '&quot;]">' + category.name + '</th>\n' +
        '<td> </td>\n' +
        '<td> </td>\n' +
        '</tr>\n' ;
}

/**
 * Generate a string which is the concatenation of all the options separated by ' '.
 * @param {Object} opt object containing the options of a property.
 * @ignore
 */
function generateHtmlCodeForOptions(opt) {
    const values = [];
    for (let i = 0 , l = opt.length ; i < l ; i++) {
        values.push(opt[i].text);
    }
    return values.join(", ");    
}

/**
 * Generate an HTML string which is a line of a 3 columns array with the standard description of a property.
 *
 * @param {Object} property object which represents a property.
 * @ignore
 */
function generateHtmlCodeForProperty(property) {
    let value = property.value;
    if (value === undefined) {
        value = "";
    }
    return  '<tr>\n' +
        '<td data-sheets-value="[null,2,&quot;' + property.name + '&quot;]">' + property.name + '</td>\n' +
        '<td data-sheets-value="[null,2,&quot;' + property.type + '&quot;]">' + property.type + '</td>\n' +
        '<td data-sheets-value="[null,2,&quot;' + property.description + ' ' + value + '&quot;,null,null,null,1]">' +
        (property.description ? ('Description : ' + property.description) : "") +
        (property.value ? ('<br/>Value : ' + property.value) : "") +
        (property.options ? ('<br/>Options : ' + generateHtmlCodeForOptions(property.options)) : "") +
        (property.colorFormat ? ('<br/>ColorFormat : ' + property.colorFormat) : "") +'</td>\n' +
        '</tr>\n' ;
}

/**
 * Transform the constraints of an adx (from the config) to a sentence
 *
 * @param {Object} constraints The constraints.
 * @ignore
 */
function constraintsToSentence(constraints) {
    if (!constraints) return "";
    const questions = [];
    const controls = [];
    if (constraints.questions) {
        for (let key in constraints.questions) {
            if (constraints.questions.hasOwnProperty(key) && constraints.questions[key]) {
                questions.push(key);
            }
        }
    }
    if (constraints.controls) {
        for (let key in constraints.controls) {
            if (constraints.controls.hasOwnProperty(key) && constraints.controls[key]) {
                controls.push(key);
            }
        }
    }

    // TODO::PLEASE PUT ALL OF THE FOLLOWING HARD-CODED STRING IN THE common.js
    let numberOfResponses = '';
    if (constraints.responses) {
        if ("min" in constraints.responses) {
            numberOfResponses = "Number minimum of responses : " + constraints.responses.min + ".\n";
        }
        if ("max" in constraints.responses) {
            numberOfResponses += "Number maximum of responses : " + constraints.responses.max + ".\n";
        }
    }


    return "This control is compatible with " +
        questions.join(", ") +
        " questions.\n" + numberOfResponses +
        "You can use the following controls : " +
        controls.join(", ") + ".";
}

/**
 * Create a String which contains an html dynamic array with the properties
 *
 * @param {Object} prop The properties. Should give configurator.get().properties
 * @ignore
 */
function propertiesToHtml(prop) {
    if (!prop) {
        throw new Error(errMsg.missingPropertiesArg);
    }
    const result = ['<table class="askiatable" dir="ltr" cellspacing="0" cellpadding="0">',
                  '<colgroup><col width="281" /><col width="192" /><col width="867" /></colgroup>',
                  '<tbody><tr><td style="text-transform: uppercase; font-weight: bold;" data-sheets-value="[null,2,&quot;Parameters&quot;]">Parameters</td>',
                  '<td style="text-transform: uppercase; font-weight: bold;" data-sheets-value="[null,2,&quot;Type&quot;]">Type</td>',
                  '<td style="text-transform: uppercase; font-weight: bold;" data-sheets-value="[null,2,&quot;Comments and/or possible value&quot;]">Comments and/or possible value</td>',
                  '</tr><tr><td> </td><td> </td><td> </td></tr>'];

    for (let i = 0, l = prop.categories.length; i < l; i++) {
        result.push(generateHtmlCodeForCategory(prop.categories[i]));
        for (let j = 0, k = prop.categories[i].properties.length; j < k; j++) {
            result.push(generateHtmlCodeForProperty(prop.categories[i].properties[j]));
        }
    }
    result.push('</tbody></table>');
    return result.join('');
}

/**
 * Create the JSON formatted article
 *
 * @param {PublisherZenDesk} self
 * @param {Function} callback
 * @param {Error} [callback.err=null]
 * @ignore
 */
function createJSONArticle (self, callback) {
    const pathTemplate = (self.configurator.projectType === "adp") ? common.ZENDESK_ADP_ARTICLE_TEMPLATE_PATH : common.ZENDESK_ADC_ARTICLE_TEMPLATE_PATH;
    fs.readFile(path.join(__dirname,"../../", pathTemplate), 'utf-8', (err, data) => {
        if (err) {
            callback(err);
            return;
        }

        const conf = self.configurator.get();
        const projectType = self.configurator.projectType;
        const replacements = [
            {
                pattern : /\{\{ADXProperties:HTML\}\}/gi,
                replacement : propertiesToHtml(conf.properties)
            },
            {
                pattern : /\{\{ADXListKeyWords\}\}/gi,
                replacement : `${projectType}; javascript; ${projectType === "adp" ? "page" : "control"}; design; askiadesign; ${conf.info.name}`
            },
            {
                pattern : /\{\{ADXConstraints\}\}/gi,
                replacement : constraintsToSentence(conf.info.constraints)
            }];

        callback(null, {
            article : {
                title               : conf.info.name,
                body                : common.evalTemplate(data, conf, replacements),
                promoted            : !!self.options.promoted,
                comments_disabled   : !!self.options.disableComments // Make it boolean
            }
        });
    });
}

/**
 * Delete article's attachments (if the article already exist) in the specified section
 * pre-condition : there is the possibility to have two articles with the same name but not in the same section
 *
 * @param {PublisherZenDesk} self
 * @param {String} title The title of the article to check
 * @param {Function} callback
 * @param {Error} [callback.err=null]
 * @ignore
 */
function deleteAttachmentsIfArticle(self, title, section_id, callback) {
    self.client.articles.listBySection(section_id, (err, req, result) => {
        if (err) {
            if (typeof callback === "function") {
                callback(err);
            }
            return;
        }

        //the part below is needed to check if some people added articles directly from the web
        let idToDelete = 0;
        for (let i = 0, l = result.length; i < l; i += 1) {
            if (result[i].name === title) {
                if (idToDelete) { // Already exist
                    callback(errMsg.tooManyArticlesExisting);
                    return;
                }
                idToDelete = result[i].id;
            }
        }

        // No article to delete
        if (!idToDelete) {
            callback(null);
            return;
        }

        //Find all attachments of an article
        self.client.articleattachments.list(idToDelete, (err, status, attachments) => {
            if (err) {
                callback(err);
                return;
            }

            attachments = attachments.article_attachments;
            const length = attachments.length;

            function doDeletion(index) {
                if (index >= length) {
                    callback(null, idToDelete);
                    return;
                }
                self.client.articleattachments.delete(attachments[index].id, (err) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    index++;
                    doDeletion(index);
                });
            }

            doDeletion(0);
        });
    });
}

/**
 * Upload all the files that are available (.adx, .qex, .png)
 *
 * @param {PublisherZenDesk} self
 * @param {Array} files An array containing Strings which are the absolute paths of the files
 * @param {Number} articleId The Id of the article
 * @param {Function} callback
 * @ignore
 */
function uploadAvailableFiles(self, files, articleId, callback) {
    const attachments = {};

    function uploadAvailableFilesRecursive(index) {
        const formData = {
            'file' : fs.createReadStream(files[index])
        };
        const data = {
            url		: self.options.url + "/api/v2/help_center/articles/" + articleId + "/attachments.json",
            formData: formData,
            headers : {
                'Authorization' : "Basic " + new Buffer(self.options.username + ":" + self.options.password).toString('base64')
            }
        };

        request.post(data, (err, resp, body) => {
            if (err) {
                callback(err);
                return;
            }

            body = JSON.parse(body);

            let prefix = files[index].match(/\.([a-z]+)$/i)[1];
            if (prefix.toLowerCase() === "adc" || prefix.toLowerCase() === "adp") prefix = "adx";
            attachments[prefix] = {
                id   : body.article_attachment.id,
                name : body.article_attachment.file_name
            };
            index++;

            if (index < files.length) {
                uploadAvailableFilesRecursive(index);
            } else {
                // The latest iteration
                callback(null, attachments);
            }
        });
    }

    uploadAvailableFilesRecursive(0);
}

/**
 * Check if we already have an article or if we need to create one
 *
 * @param {PublisherZenDesk} publisher
 * @param {Number} articleToUpdateId The id of the article to update
 * @param {Number} id The id of the article to create if the article does not exist
 * @param {JSON} jsonArticle of the article to create if the article does not exist
 * @param {Function} cb
 * @param {Error} [cb.err=null]
 * @ignore
 */
function createArticle(publisher, articleToUpdateId, id, jsonArticle, cb) {
    if (articleToUpdateId) {
        publisher.client.articles.show(articleToUpdateId, (err, req, article) => {
            if (err) {
                cb(err);
                return;
            }
            article.title = jsonArticle.article.title;
            article.body = jsonArticle.article.body;
            article.promoted = jsonArticle.article.promoted;
            article.comments_disabled = jsonArticle.article.comments_disabled;
            cb(err, req, article);
        });
    } else {
        publisher.client.articles.create(id, jsonArticle, cb);    
    }
}

/**
 * Publish the article on the ZenDesk platform
 *
 * @param {Function} callback
 * @param {Error} [callback.err=null]
*/
PublisherZenDesk.prototype.publish = function(callback) {
    const self = this;

    findSectionIdByTitle(self, (err, id) => {
        if (err) {
            if (typeof callback === "function") {
                callback(err);
            }
            return;
        }

        self.writeSuccess(successMsg.zenDeskSectionFound);

        createJSONArticle(self, (err, jsonArticle) => {
            if (err) {
                if (typeof callback === "function") {
                    callback(err);
                }
                return;
            }
            deleteAttachmentsIfArticle(self, jsonArticle.article.title, id, (err, articleToUpdateId) => {
                if (err) {
                    if (typeof callback === "function") {
                        callback(err);
                    }
                    return;
                }
                createArticle(self, articleToUpdateId, id, jsonArticle, (err, req, article) => {
                    if (err) {
                        if (typeof callback === "function") {
                            callback(err);
                        }
                        return;
                    }
                    if (articleToUpdateId) {
                        self.writeSuccess("an article already exist with this name. Updating...");
                    } else {
                        self.writeSuccess(successMsg.zenDeskArticleCreated);
                    }

                    const filesToPush = [];
                    const name = self.configurator.get().info.name;
                    const binPath = path.resolve(path.join(self.configurator.path, common.ADX_BIN_PATH, name + '.' + self.configurator.projectType));
                    fs.stat(binPath, (err, stats) => {
                        if (stats && stats.isFile()) {
                            filesToPush.push(binPath);
                        } else {
                            callback(errMsg.badNumberOfADXFiles);
                            return;
                        }
                        const qexPath = path.resolve(path.join(self.configurator.path, common.QEX_PATH, name + '.qex'));
                        fs.stat(qexPath, (err, stats) => {
                            if (stats && stats.isFile()) {
                                filesToPush.push(qexPath);
                            }
                            const previewPath = path.resolve(path.join(self.configurator.path, 'preview.png'));
                            fs.stat(previewPath, (err, stats) => {
                                if (stats && stats.isFile()) {
                                    filesToPush.push(previewPath);
                                }
                                uploadAvailableFiles(self, filesToPush, article.id, (err, attachments) => {
                                    if (err) {
                                        callback(err);
                                        return;
                                    }

                                    self.writeSuccess(successMsg.zenDeskAttachmentsUploaded);

                                    const replacements = [
                                        {
                                            pattern : /\{\{ADXQexFileURL\}\}/gi,
                                            replacement : (attachments.qex && attachments.qex.id) ?  ('<li>To download the qex file, <a href="/hc/en-us/article_attachments/' + attachments.qex.id + '/' + attachments.qex.name + '">click here</a></li>') : ""
                                        },
                                        {
                                            pattern : /\{\{ADXFileURL\}\}/gi,
                                            replacement : '<a href="/hc/en-us/article_attachments/' + attachments.adx.id + '/' + attachments.adx.name + '">click here</a>'
                                        }
                                    ];

                                    // TODO::We should upload the file to the demo server from this app
                                    //'/hc/en-us/article_attachments/' + attachmentsIDs.png.id + '/' + attachmentsIDs.png.name 
                                    const urlToPointAt = self.options.demoUrl || '';
                                    replacements.push({
                                        pattern         : /\{\{ADXPreview\}\}/gi,
                                        replacement     : (attachments.png && attachments.png.id)? '<p><a href="' + urlToPointAt + '" target="_blank"> <img style="max-width: 100%;" src="/hc/en-us/article_attachments/' + attachments.png.id + '/' + attachments.png.name + '" alt="" /> </a></p>' : "ad"
                                    });
                                    replacements.push({
                                        pattern         : /\{\{ADXLiveDemo\}\}/gi,
                                        replacement     : (!self.options.demoUrl) ? '' : '<li><a href="' + self.options.demoUrl + '" target="_blank">To access to the live survey, click on the picture above.</a></li>'
                                    });
                                    const articleUpdated = common.evalTemplate(article.body, {}, replacements);
                                    self.client.translations.updateForArticle(article.id, 'en-us', {body:articleUpdated}, (err) => {
                                        if (err) {
                                            callback(err);
                                            return;
                                        }
                                        self.writeSuccess(successMsg.zenDeskTranslationUpdated);
                                        self.client.articles.update(article.id, article, (err) => {
                                            if (!err) {
                                                self.writeSuccess(successMsg.zenDeskArticleUpdated);
                                            }
                                            if (typeof callback === 'function') {
                                                callback(err);
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

/**
 * List all the sections. This method has been implemented for the integration in ADXStudio
 *
 * @param {Function} callback
 */
PublisherZenDesk.prototype.listSections = function(callback) {
    const self = this;
    self.client.sections.list((err, req, res) => {
        if (err) {
            callback(err);
            return;
        } 
        callback(null, res);
    });
};

//Make it public
exports.PublisherZenDesk = PublisherZenDesk ;