/**
 * Self-executed function
 * @param {CodeMirror} CodeMirror namespace
 */
(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function extendCodeMirror(CodeMirror) {
    "use strict";

    var askiaScript = {};

    CodeMirror.askiaScript = askiaScript;

    /**
     * Returns true if the specified value is |object|.
     *
     * @return {Function} Whether variable is |object|.
     */
    askiaScript.isObject = (function buildIsObject() {
        var toString = Object.prototype.toString;
        if (toString.call(null) === '[object Object]') {
            //noinspection JSValidateTypes
            return function isObject(value) {
                // check ownerDocument here as well to exclude DOM nodes
                return value !== null && value !== void 0 && toString.call(value) === '[object Object]' && value.ownerDocument === void 0;
            };
        }

        return function isObject(value) {
            return toString.call(value) === '[object Object]';
        };
    }());

    /**
     * Returns true if the specified value is |array|.
     *
     * @static
     * @param {Object} value Variable to test.
     * @return {Boolean} Whether variable is |array|.
     */
    askiaScript.isArray = function isArray(value) {
        // ES5
        if (typeof Array.isArray === "function") {
            return Array.isArray(value);
        }

        return typeof value === "object" &&
            Object.prototype.toString.call(value) === "[object Array]";
    };

    /**
     * Iterate through array and evaluate the callback function for each item
     *
     * @param {Array} arr Array to iterate
     * @param {Function} fn Callback function
     */
    askiaScript.forEach = function forEach(arr, fn) {
        if (!askiaScript.isArray(arr)) {
            return;
        }

        // ES5
        if (typeof Array.prototype.forEach === 'function') {
            arr.forEach(fn);
            return;
        }

        var i, l;
        for (i = 0, l = arr.length; i < l; i += 1) {
            fn(arr[i], i, arr);
        }
    };

    /**
     * Extend an object by one or more objects. If the boolean flag is specified at the end of arguments its will be executed recursively.
     *
     * @static
     * @param {Object} obj The object to extend.
     * @param {Object} [objX] The objects needed.
     * @param {Boolean} [deep=false] Flag for recursion.
     * @return {Object}
     */
    askiaScript.extend = function extend(obj, objX, deep) {
        var slice   = Array.prototype.slice,
            forEach = askiaScript.forEach,
            isObject = askiaScript.isObject,
            isArray = askiaScript.isArray,
            arg     = arguments[arguments.length - 1],
            hasBool = typeof arg === 'boolean',
            isDeep  = hasBool ? arg : false,
            to      = hasBool ? arguments.length - 1 : arguments.length;

        obj  = obj || {};

        forEach(slice.call(arguments, 1, to), function forEachArgs(source) {
            var prop, clone, src, copy, isObj, isArr;

            if (source != null) {
                for (prop in source) {
                    //noinspection JSUnfilteredForInLoop
                    src  = obj[prop];
                    //noinspection JSUnfilteredForInLoop
                    copy = source[prop];
                    //noinspection JSUnfilteredForInLoop
                    if (obj === source[prop]) {
                        continue;
                    }

                    isArr = isArray(copy);
                    isObj = isObject(copy);
                    if (isDeep === true && copy && (isObj || isArr)) {
                        if ( isArr ) {
                            // Contatenate with the exiting array
                            clone = src && isArray(src) ? src : [];
                            obj[prop] = clone.concat(copy.slice());
                        } else {
                            clone = src && isObject(src) ? src : {};
                            // Never move original objects, clone them
                            //noinspection JSUnfilteredForInLoop,JSValidateTypes
                            obj[prop] = extend(clone, copy, true);
                        }
                    } else if (copy !== undefined) {
                        //noinspection JSUnfilteredForInLoop
                        obj[prop] = source[prop];
                    }
                }
            }
        });

        return obj;
    };


    askiaScript.classNames = {
        COMMENT				: 'comment',
        NUMBER				: 'number',
        STRING				: 'string',
        OPERATOR			: 'operator',
        PUNCTUATION			: 'punctuation',
        KEYWORD				: 'keyword',
        VARIABLE			: 'anytype',
        LABEL               : 'label',
        UNDEFINED_LABEL     : 'undef-label',
        QUESTION    		: 'question',
        MODULE	  			: 'module',
        QUESTION_DELIMITER  : 'questiondelimiter',
        MEMBER_PREFIX		: 'member-',
        BUILTIN_PREFIX      : 'builtin-',
        ERROR				: 'error',
        HELPER              : 'helper',
        GUTTER_ERRORS       : 'cms-gutter-errors',
        GUTTER_ERROR        : 'cms-gutter-error',
        sense               : {
            SENSE 	                : 'cms-sense',
            VISIBLE		            : 'cms-visible',
            SELECTED                : 'cms-selected',
            HELPER                  : 'cms-helper',
            ITEM_ARGS               : 'cms-args',
            ITEM_ARG                : 'cms-arg',
            ITEM_ICON               : 'cms-icon',
            ITEM_TYPE               : 'cms-type',
            ITEM_SNIPPET_TAB        : 'cms-snippet-tab'
        },
        description         : {
            DESCRIPTION             : 'cms-desc',
            ITEM                    : 'cms-desc-item',
            TOC                     : 'cms-toc',
            HELPER                  : 'cms-helper',
            EXPRESSION              : 'cms-expression',
            DEPRECATED              : 'cms-deprecated',
            SPLITTER_H              : 'cms-split-h',
            SPLITTER_V              : 'cms-split-v',
            SPLITTER_RESIZING       : 'cms-split-resizing',
            TITLE_LINK              : 'cms-title-link',
            TOGGLE                  : 'cms-toggle',
            TOGGLE_EXPAND           : 'cms-expand',
            KEYWORDS_CONTAINER      : 'cms-desc-keywords-container',
            FILTERED                : 'filtered',
            FOUND                   : 'found',
            RESPONSES_COMMAND       : 'cms-desc-responses-command',
            DEBUG                   : 'cms-debug'
        }
    };

    askiaScript.bases = {
        STATEMENT : 'statement',
        OPERATOR  : 'operator',
        FUNCTION  : 'function',
        METHOD 	  : 'method',
        PROPERTY  : 'property',
        CONSTANT  : 'const',
        QUESTION  : 'question',
        VARIABLE  : 'variable',
        SNIPPET   : 'snippet',
        CORE      : 'core',
        VERSIONS  : 'versions'
    };

    askiaScript.types = {
        NUMBER    : 'number',
        BOOLEAN   : 'boolean',
        STRING    : 'string',
        DATE      : 'date',
        ARRAY     : 'array',
        QUESTION  : 'question',
        RESPONSES : 'responses',
        RESPONSE  : 'response',
        ANY_TYPE   : 'anytype'
    };

    askiaScript.i18n = {
        types       : {
            anytype     : 'Any',
            chapter     : 'Chapter',
            single      : 'Single',
            multiple    : 'Multiple',
            open        : 'Open',
            numeric     : 'Numeric',
            datetime    : 'Date/Time',
            loop        : 'Loop',
            'single-lopp' : "Single loop",
            'multiple-loop' : "Multiple loop",
            'numeric-loop' : "Numeric loop",
            builtin     : 'Global',
            versions    : "Versions",
            releaseNotes : "Release notes"
        },
        description : {
            parameters : 'Parameters:',
            returns    : 'Returns:',
            type       : 'Type:',
            none       : 'None',
            expression : 'expression',
            optional   : '(Optional)',
            repeatable : '(Repeatable)',
            deprecated : 'Deprecated',
            remarks    : 'Remarks:',
            synonyms   : 'Synonyms:',
            snippet    : 'Snippet',
            prefer     : 'Prefer the usage of:',
            alsoSee    : 'Also see:',
            creation   : 'Creation:',
            examples   : 'Examples:',
            sinceVersion  : 'Since version:',
            searchKeywords : 'Search keywords ...',
            searchResponses : 'Search responses ...',
            insertResponsesRange : "Insert range",
            caption : "Caption",
            minValue : "Minimum:",
            maxValue : "Maximum:",
            previous : "<< Previous",
            parentLoop : "Parent loop:"
        },
        core    : {
            'versions' : {
                desc : ""
            },
            'builtin' : {
                desc : ""
            }
        }
    };

    askiaScript.lexical = {
        namespaces : {},
        versions : [],
        builtin : [],
        members : {},
        snippets : []
    };

    /**
     * Return the full locale object for the given key
     * @param {String} key
     * @return {Object|String} Locale object
     */
    askiaScript.getLocaleObject = function getLocaleObject(key) {
        if (typeof key !== 'string' && typeof key !== 'number') {
            throw new Error('Invalid argument, translation require a string or a number in arg');
        }
        if (typeof key === 'number') {
            return key;
        }

        var isAvailableKey = /^[\S]+$/gi, /* Key without spaces */
            current        = askiaScript.i18n,
            map            = key.split('.'),
            i, l;

        if (!isAvailableKey.test(key)) { /* Plain text message */
            return null;
        }

        for (i = 0, l = map.length; i < l; i += 1) {
            if (!current[map[i]]) {
                return null; /* Could not found: return the key */
            }
            current = current[map[i]];
        }

        return current;
    };

    askiaScript.translate = function translate(key) {
        var locale = CodeMirror.askiaScript.getLocaleObject(key),
            rg, i, l;

        if (typeof (locale) !== 'string') { /* The current should be a string otherwize, return the key */
            return key;
        }

        /* Format the text using the arguments  */
        if (arguments.length > 1) {
            for (i = 1, l = arguments.length; i < l; i += 1) {
                rg = new RegExp("\\{" + (i - 1) + "\\}", "gi");
                locale = locale.replace(rg, arguments[i]);
            }
        }

        return locale;
    };

    askiaScript.sortItems  = function sortItems(a, b) {
        var aName = (a.name || '').toLowerCase(),
            bName = (b.name || '').toLowerCase();

        if (aName > bName) {
            return 1;
        } else if (aName < bName) {
            return -1;
        } else {
            return 0;
        }
    };

    /**
     * Escape text for regular expression
     * @param {String} str Text to escape
     * @return {String} Text escaped
     */
    askiaScript.escapeRegExp = function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };

    askiaScript.buildRegexp = function buildRegexp(words) {
        return new RegExp("^((" + words.join(")|(") + "))\\b", "i");
    }

    /**
     * Event when clicking on the description link
     * @param e
     */
    function clickOnDescriptionLink(e) {
        e.preventDefault();
        return false;
    }

    /**
     * Create an DOM link to another description
     * @param {String} text Text of the link
     * @param {String} [linkTo] Description data link (use the text by default)
     * @return {HTMLElement} Fragment created
     */
    askiaScript.createDescLink = function  createDescriptionLink(text, linkTo) {
        linkTo = linkTo || text;

        var link  = document.createElement('a');

        link.href = "#" + text;
        link.setAttribute("data-linkto", linkTo);
        text = text.replace(/^core\./i, '');
        link.appendChild(document.createTextNode(text));
        CodeMirror.on(link, "click", clickOnDescriptionLink);

        return link;
    };

    askiaScript.defineLexical = function defineLexical(lexical) {
        // Enforce only one call of it
        if (askiaScript.isDefined){
            return;
        }

        askiaScript.isDefined = true;

        // build patterns
        var classNames  = askiaScript.classNames,
            bases       = askiaScript.bases,
            getLocaleObject = askiaScript.getLocaleObject,
            translate   = askiaScript.translate,
            extend      = askiaScript.extend,
            isArray     = askiaScript.isArray,
            forEach     = askiaScript.forEach,
            COMMON      = 'common',
        // Dictionary of builtin keyword the key is the keyword in lowercase
            internalDictionary  = {
                core    : {},
                builtin : {},
                versions : {},
                members : {
                    common : {}
                }
            },
            coreItems   = [],
            accessors   = {},
            sortItems   = askiaScript.sortItems;

        /**
         * Create an DOM HTML fragment with html code
         * @param {String} html HTML Code
         * @return {HTMLElement} Fragment created
         */
        function createHTMLFragment(html) {
            var frag = document.createDocumentFragment(),
                temp = document.createElement('div');
            temp.innerHTML = html;
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
            //noinspection JSValidateTypes
            return frag;
        }

        /**
         * Create title element for the description
         * @param {Object} item Item
         * @param {HTMLElement} container HTML container
         */
        function appendDescriptionTitle(item, container) {
            if (item.base === bases.SNIPPET) {
                return;
            }
            var el = document.createElement('h1'),
                name = (item.type !== bases.CORE) ? item.name : translate('types.' + item.name);

            el.appendChild(document.createTextNode(name));
            if (item.deprecated) {
                el.className = classNames.description.DEPRECATED;
            }
            container.appendChild(el);

            if (item.deprecated) {
                el = document.createElement('strong');
                el.appendChild(document.createTextNode(translate('description.deprecated')));
                el.className = classNames.description.DEPRECATED;
                container.appendChild(el);
            }
        }

        /**
         * Create description element for the description
         * @param {Object} item Item
         * @param {HTMLElement} container HTML container
         */
        function appendDescriptionDesc(item, container, asSingleLine) {
            if (!item.desc) {
                return;
            }
            var desc = isArray(item.desc) ? item.desc : [item.desc];
            if (asSingleLine) {
                desc = [desc.join('')];
            }
            forEach(desc, function buildDesc(text) {
                var el = document.createElement('p');
                el.appendChild(createHTMLFragment(text));
                container.appendChild(el);
            });
        }

        /**
         * Create description element for the creation
         * @param {Object} item Item
         * @param {HTMLElement} container HTML container
         */
        function appendDescriptionCreation(item, container) {
            if (!item.creation) {
                return;
            }

            var creations = isArray(item.creation) ? item.creation : [item.creation],
                el = document.createElement('h2');

            el.appendChild(document.createTextNode(translate('description.creation')));
            container.appendChild(el);

            forEach(creations, function buildCreation(creation) {
                var p = document.createElement('p');
                p.appendChild(createHTMLFragment(creation));
                container.appendChild(p);
            });
        }

        /**
         * Create description element for the examples
         * @param {Object} item Item
         * @param {HTMLElement} container HTML container
         */
        function appendDescriptionExamples(item, container) {
            if (!item.examples) {
                return;
            }

            var examples = isArray(item.examples) ? item.examples : [item.examples],
                el = document.createElement('h2'),
                pre = document.createElement('pre'),
                code = document.createElement('core');


            el.appendChild(document.createTextNode(translate('description.examples')));
            container.appendChild(el);

            code.appendChild(createHTMLFragment(examples.join('\r\n')));
            pre.appendChild(code);
            container.appendChild(pre);
        }

        /**
         * Create description element for the usage preference
         * @param {Object} item Item
         * @param {HTMLElement} container HTML container
         */
        function appendDescriptionPrefer(item, container) {
            if (!item.prefer) {
                return;
            }

            var prefers = isArray(item.prefer) ? item.prefer : [item.prefer],
                el = document.createElement('h2'),
                ul = document.createElement('ul');

            el.appendChild(document.createTextNode(translate('description.prefer')));
            container.appendChild(el);

            forEach(prefers, function buildPrefers(prefer) {
                var li = document.createElement('li');
                li.appendChild(askiaScript.createDescLink(prefer));
                ul.appendChild(li);
            });

            container.appendChild(ul);
        }

        /**
         * Create description element for the remarks
         * @param {Object} item Item
         * @param {HTMLElement} container HTML container
         */
        function appendDescriptionRemarks(item, container) {
            if (!item.remarks) {
                return;
            }

            var remarks = isArray(item.remarks) ? item.remarks : [item.remarks],
                el = document.createElement('h2');
            el.appendChild(document.createTextNode(translate('description.remarks')));
            container.appendChild(el);

            forEach(remarks, function buildRemarks(remark) {
                el = document.createElement('p');
                el.appendChild(createHTMLFragment(remark));
                container.appendChild(el);
            });
        }

        /**
         * Create description element for the synonyms
         * @param {Object} item Item
         * @param {HTMLElement} container HTML container
         */
        function appendDescriptionSynonyms(item, container) {
            if (!item.synonyms) {
                return;
            }

            var synonyms = isArray(item.synonyms) ? item.synonyms : [item.synonyms],
                el;

            // Don't include the self reference
            if (synonyms.length === 1 && synonyms[0] === item.name) {
                return;
            }

            el = document.createElement('h2');

            el.appendChild(document.createTextNode(translate('description.synonyms')));
            container.appendChild(el);

            forEach(synonyms, function buildSynonyms(synonym) {
                // Don't include the self reference
                if (synonym !== item.name) {
                    el = document.createElement('p');
                    el.appendChild(askiaScript.createDescLink(synonym));
                    container.appendChild(el);
                }
            });
        }

        /**
         * Create description element for the also see
         * @param {Object} item Item
         * @param {HTMLElement} container HTML container
         */
        function appendDescriptionAlsoSee(item, container) {
            if (!item.alsoSee) {
                return;
            }

            var alsoSees = isArray(item.alsoSee) ? item.alsoSee : [item.alsoSee],
                el = document.createElement('h2'),
                ul = document.createElement('ul');

            el.appendChild(document.createTextNode(translate('description.alsoSee')));
            container.appendChild(el);

            forEach(alsoSees, function buildSynonyms(alsoSee) {
                var li    = document.createElement('li');
                li.appendChild(askiaScript.createDescLink(alsoSee));
                ul.appendChild(li);
            });

            container.appendChild(ul);
        }

        /**
         * Create snippet element for the description
         * @param {Object} item Item
         * @param {HTMLElement} container HTML container
         */
        function appendDescriptionSnippet(item, container) {
            if (item.base !== bases.SNIPPET) {
                return;
            }
            var i, l,
                snippet = item.snippet,
                el, text;
            for (i = 0, l = snippet.length; i < l; i++) {
                el = document.createElement('p');
                text = snippet[i];
                text = text.replace(/([^ ]+)/gi, '<b>$1</b>');
                text = text.replace(/<b>_(.*?)_<\/b>/gi, '<span class="' + classNames.description.HELPER + '">$1</span>');
                if (!text) {
                    text = '<span class="' + classNames.description.EXPRESSION + '">' + translate('description.expression') + '</span>'
                }
                el.appendChild(createHTMLFragment(text));
                container.appendChild(el);
            }
        }

        /**
         * Create description element for the arguments
         * @param {Object} item Item
         * @param {HTMLElement} container HTML container
         */
        function appendDescriptionArgs(item, container) {
            if (item.base !== bases.FUNCTION && item.base !== bases.METHOD) {
                return;
            }

            var el          = document.createElement('h2'),
                args        = item.args,
                arg,
                elArg, elDesc,
                i, l, text;

            el.appendChild(document.createTextNode(translate('description.parameters')));
            container.appendChild(el);

            el = document.createElement('ul');
            if (!args || !args.length) {
                elArg  = document.createElement('li');
                elDesc = document.createElement('p');
                elDesc.appendChild(document.createTextNode(translate('description.none')));
                elArg.appendChild(elDesc);
                el.appendChild(elArg);
            } else {
                for (i = 0, l = args.length; i < l; i++) {
                    arg = args[i];

                    // Create element
                    elArg     = document.createElement('li');

                    // Build the full name of argument
                    elDesc = document.createElement('span');
                    elDesc.appendChild(document.createTextNode(arg.name + " - "));
                    if (arg.type !== askiaScript.types.ANY_TYPE) {
                        elDesc.appendChild(askiaScript.createDescLink(translate('types.' + arg.type), 'core.' + arg.type));
                    } else {
                        elDesc.appendChild(document.createTextNode(translate('types.' + arg.type)));
                    }
                    text = "";
                    // Flag as optional
                    if (arg.opt) {
                        text += " " + translate('description.optional');
                    }
                    if (arg.repeatable) {
                        text += " " + translate('description.repeatable');
                    }
                    if (text) {
                        elDesc.appendChild(document.createTextNode(text));
                    }
                    elArg.appendChild(elDesc);

                    // Build the description
                    if (arg.desc) {
                        elDesc = document.createElement('p');
                        elDesc.appendChild(createHTMLFragment(arg.desc));
                        elArg.appendChild(elDesc);
                    }

                    // Append in the list
                    el.appendChild(elArg);
                }
            }

            container.appendChild(el);
        }

        /**
         * Create description element for the version since the item availability
         * @param {Object} item Item
         * @param container
         */
        function appendDescriptionSinceVersion(item, container) {
            if (item.version) {
                var el = document.createElement('h2');

                el.appendChild(document.createTextNode(translate('description.sinceVersion')));
                container.appendChild(el);

                el = document.createElement('p');
                el.appendChild(askiaScript.createDescLink(item.version, bases.VERSIONS + '.' + item.version));

                container.appendChild(el);
                registerKeywordsInVersionsStack(item);
            }
        }

        /**
         * Register the keywords in the versions stack
         * @param {Object} item Item
         */
        function registerKeywordsInVersionsStack(item) {
            if (!item.version) {
                return;
            }

            // Reference the version
            if (!internalDictionary.versions[item.version.toLowerCase()]) {
                 versionItem = {
                     name           : item.version,
                     keywords       : []
                 };
                 internalDictionary.versions[versionItem.name.toLowerCase()] = versionItem;
             }

            // Add the current item in the stack of the version
            var versionItem = internalDictionary.versions[item.version.toLowerCase()],
                parent      = item.parent || {
                    name : 'builtin'
                },
                linkTo = '',
                name = '', parentName = parent.name;

            versionItem.keywords = versionItem.keywords || [];

            if (parent.name !== 'builtin') {
                linkTo  = parent.name + '.';
                name = translate('types.' + parent.name) + '.';
            }
            if (item.base === bases.CORE && item.type === bases.CORE) {
                linkTo = bases.CORE + '.';
                name = translate('types.' + item.name);
                parentName = item.name;
            } else {
                name += item.name;
            }
            linkTo += item.name;

            // Push the keywords in the stack
            versionItem.keywords.push({
                parentName  : parentName,
                linkTo      : linkTo,
                name        : name
            });
        }

        /**
         * Create an automatic description element for the versions (releases notes)
         * @param {HTMLElement} container HTML container
         */
        function appendAutoVersionsDescription(container) {
            var sortNames = [],
                items = internalDictionary.versions,
                key;
            for (key in items) {
                if (items.hasOwnProperty(key)) {
                    sortNames.push(key);
                }
            }
            sortNames = sortNames.sort().reverse();
            forEach(sortNames, function forEachVersion(versionName) {
                var item = items[versionName],
                    node, el;
                if (!item.name) {
                    return;
                }

                // Prepare the description of the item
                node = mergeAndPrepareDescription('versions', item);
                el   = node.description.element.cloneNode(true);
                container.appendChild(el);
            });
        }

        /**
         * List all keywords of a given version
         * @param {Object} item Item
         * @param container
         */
        function appendDescriptionVersionKeywords(item, container) {
            if (!item.keywords) {
                return;
            }

            var keywords       = item.keywords.sort(function sortKeywords(a, b){
                    var aName = (a.parentName || '').toLowerCase(),
                        bName = (b.parentName || '').toLowerCase();

                    if (aName > bName) {
                        return 1;
                    } else if (aName < bName) {
                        return -1;
                    } else {
                        return sortItems(a, b);
                    }
                }),
                lastDiv        = null,
                lastUl         = null,
                lastParentName = '';

            forEach(keywords, function addKeyword(keyword) {
                if (lastParentName !== keyword.parentName) {
                    if (lastDiv) {
                        container.appendChild(lastDiv);
                    }

                    lastParentName = keyword.parentName;
                    lastDiv = document.createElement('div');
                    lastDiv.className = classNames.description.KEYWORDS_CONTAINER;

                    var h3     = document.createElement('h3');
                    h3.appendChild(document.createTextNode(translate('types.' + keyword.parentName)));
                    lastDiv.appendChild(h3);

                    lastUl = document.createElement('ul');
                    lastDiv.appendChild(lastUl);
                }

                var li = document.createElement('li');
                li.appendChild(askiaScript.createDescLink(keyword.name, keyword.linkTo));
                lastUl.appendChild(li);
            });

            // Append the latest element
            if (lastDiv) {
                container.appendChild(lastDiv);
            }
            lastDiv = document.createElement('div');
            lastDiv.style.clear='both';
            container.appendChild(lastDiv);

        }

        /**
         * Create an arbitrary section for additional information
         * @param {Object} item Item
         * @param container
         */
        function appendDescriptionSection(section, container) {
            if (section.name) {
                var tagName = section.tagName || 'h2',
                    el = document.createElement(tagName),
                    textNode = document.createTextNode(section.name),
                    link;
                if (section.linkName) {
                    link = document.createElement('a');
                    link.setAttribute('name', section.linkName);
                    link.appendChild(textNode);
                    el.appendChild(link);
                } else {
                    el.appendChild(textNode);
                }
                container.appendChild(el);

                if (section.desc) {
                    appendDescriptionDesc(section, container, true);
                }
            }
        }

        /**
         * Create arbitrary sections for additional information
         * @param {Object} item Item
         * @param container
         */
        function appendDescriptionSections(item, container) {
            if (item.sections && item.sections.length) {
                var i, l;
                for (i = 0, l = item.sections.length; i < l; i += 1) {
                    appendDescriptionSection(item.sections[i], container);
                }
            }
        }

        /**
         * Create description element for the type or the return type
         * @param {Object} item Item
         * @param container
         */
        function appendDescriptionType(item, container) {
            if (item.type && item.type !== bases.CORE) {
                var el = document.createElement('h2'),
                    subTitle = (item.base === bases.FUNCTION || item.base === bases.METHOD) ?
                        translate('description.returns') :
                        translate('description.type');

                el.appendChild(document.createTextNode(subTitle));
                container.appendChild(el);

                el = document.createElement('p');
                if (item.type !== askiaScript.types.ANY_TYPE) {
                    el.appendChild(askiaScript.createDescLink(translate('types.' + item.type), 'core.' + item.type));
                } else {
                    el.appendChild(document.createTextNode(translate('types.' + item.type)));
                }

                container.appendChild(el);
            }
        }

        /**
         * Prepare the description element for the specify item
         * @param {Object} item Item to update
         * @return {Object} Return the updated item
         */
        function prepareDescription(item) {
            //noinspection JSUnresolvedVariable
            var elContainer   = document.createElement('div');

            // Append the title
            appendDescriptionTitle(item, elContainer);

            // Append the description
            appendDescriptionDesc(item, elContainer);

            // Append the creation
            appendDescriptionCreation(item, elContainer);

            // Append arguments
            appendDescriptionArgs(item, elContainer);

            // Append the final type of the type of the return
            appendDescriptionType(item, elContainer);

            // Keywords of a given version
            if (item.parent && item.parent.name === bases.VERSIONS) {
                appendDescriptionVersionKeywords(item, elContainer);
            }

            // Append the preference usage
            appendDescriptionPrefer(item, elContainer);

            // Append remarks
            appendDescriptionRemarks(item, elContainer);

            // Append synonyms
            appendDescriptionSynonyms(item, elContainer);

            // Append examples
            appendDescriptionExamples(item, elContainer);

            // Append also see
            appendDescriptionAlsoSee(item, elContainer);

            // Append additional sections
            appendDescriptionSections(item, elContainer);

            // Append snippet
            appendDescriptionSnippet(item, elContainer);

            // Append the version of the availability
            appendDescriptionSinceVersion(item, elContainer);

            // Add the class name
            elContainer.className = classNames.description.ITEM;

            item.description = item.description || {};
            item.description.element = elContainer;
            return item;
        }

        /**
         * Merge the item with the locale the associated locale object
         * @param {String} mapKey Map key to find the locale object
         * @param {Object} item Item to merge with locale
         * @return {Object} Return the merge item
         */
        function mergeWithLocale(mapKey, item) {
            var locale =  getLocaleObject(mapKey + '.' + item.name),
                localeArgs,
                itemArgs = item.args || [],
                itemArg, localeArg,
                i, l;

            // Use the locale of another object
            if (locale && locale.as) {
                locale = getLocaleObject(mapKey + '.' + locale.as);
            }

            // Copy the locale object for manipulation
            locale = extend({}, locale || {});
            localeArgs = extend({}, locale.args || {});

            // Remove the args for the special merge treatment
            delete locale.args;

            // Extend the item with the locale object
            item = extend(item, locale, true);

            // Extend the args
            for (i = 0, l = itemArgs.length; i < l ; i += 1) {
                itemArg   = itemArgs[i] || {};
                localeArg = localeArgs[itemArg.name];

                if (localeArg) {
                    extend(itemArg, localeArg, true);
                }
            }
            return item;
        }

        /**
         * Call mergeWithLocale and then prepareDescription
         * @param {String} mapKey Map key to find the locale object
         * @param {Object} item Item to build
         * @return {Object} Return the updated item
         */
        function mergeAndPrepareDescription(mapKey, item) {
            return prepareDescription(mergeWithLocale(mapKey, item));
        }

        /**
         * Create an item for the core builtin and members root items
         * @param {String} name
         * @return {Object} Item created
         */
        function createCoreItem(name) {
            var item = mergeAndPrepareDescription('core', {
                name : name,
                type : bases.CORE,
                base : bases.CORE
            });

            internalDictionary.core[name.toLowerCase()] = item;
            coreItems.push(item);
            return item;
        }

        /**
         * Regular expressions patterns
         */
        askiaScript.patterns = (function initPatterns() {

            var buildRegexp = askiaScript.buildRegexp;

            var patterns = {
                    number				: /^-?\d+\.?\d*/,
                    float				: /^-?\d+\.\d+/,
                    stringPrefix		: /^"/,
                    operator			: /^[\+\-\*\/<>=]/,
                    punctuation			: /^::|[\(\)\[\]\{\},:;\.]/,
                    questionDelimiter   : /^(\?\?|\^|%%)/,
                    question			: /^(\?\?|\^|%%)(.*?)(\1)/,
                	module	   			: /^([_a-zA-Z][_a-zA-Z0-9]*)/,
                    variable			: /^([_a-zA-Z@][_a-zA-Z0-9]*)/,
                    labelDeclaration    : /^([_a-zA-Z][_a-zA-Z0-9]*:)/,
                    label               : /^([_a-zA-Z][_a-zA-Z0-9]*)/,
                    prefixes            : buildRegexp([classNames.MEMBER_PREFIX, classNames.BUILTIN_PREFIX]),
                    members             : {}
                },
                lexBuiltin  = lexical.builtin || [],
                lexMembers  = lexical.members || {},
                lexCommon   = (lexical.members && lexical.members.common) || [],
                lexVersions = lexical.versions || [],
                operator    = [],
                builtin     = [],
                opening     = [],
                closing     = [],
                middle      = [],
                common      = [],
                declaration = [],
                useLabel    = [],
                anytype     = [],
                commonMember  = [],
                anytypeMember = {},
                updateAnytype = [],
                types 		= [],
                member, key, l, items, item, arr, parent, versionsItem,ver;

            // Prepare the versions
            l = lexVersions.length;
            if (l) {
                versionsItem = createCoreItem('versions');
                while(l--) {
                    item = lexVersions[l];
                    if (!item.name) {
                        continue;
                    }

                    ver = internalDictionary.versions[item.name.toLowerCase()];
                    if (ver) { // If exist update the description
                        if (typeof ver.desc === 'string') {
                            ver.desc = [ver.desc];
                        } else if (!ver.desc) {
                            ver.desc = [];
                        }
                        if (item.desc) {
                            if (isArray(item.desc)) {
                                ver.desc = ver.desc.concat(item.desc);
                            } else {
                                ver.desc.push(item.desc);
                            }
                            internalDictionary.versions[item.name.toLowerCase()] = ver;
                        }
                    } else {
                        // Set the parent relationship
                        item.parent = versionsItem;
                        internalDictionary.versions[item.name.toLowerCase()] = item;
                    }
                }
            }

            // Add all builtin and operator
            l = lexBuiltin.length;
            if (l) {
                parent = createCoreItem('builtin');
                while(l--) {
                    item = lexBuiltin[l];
                    if (!item.name) {
                        continue;
                    }

                    // Set the parent relationship
                    item.parent = parent;

                    // Prepare the description of the item
                    mergeAndPrepareDescription('builtin', item);

                    internalDictionary.builtin[item.name.toLowerCase()] = item;
                    switch(item.base) {
                        case bases.OPERATOR:
                            operator.push(item.name);
                            break;
                        case bases.STATEMENT:
                            if (item.open && item.close) {
                                middle.push(item.name);
                            } else if (item.close) {
                                opening.push(item.name);
                            } else if (item.open) {
                                closing.push(item.name);
                            } else if (item.declare) {
                                declaration.push(item.name);
                            } else if (item.useLabel) {
                                useLabel.push(item.name);
                            } else {
                                common.push(item.name);
                            }
                            break;
                        default:
                            builtin.push(item.name);
                            break;
                    }
                }
            }

            patterns.wordOperator = buildRegexp(operator);
            patterns.builtin      = buildRegexp(builtin);
            patterns.opening      = buildRegexp(opening);
            patterns.middle       = buildRegexp(middle);
            patterns.closing      = buildRegexp(closing);
            patterns.common       = buildRegexp(common);
            patterns.declaration  = buildRegexp(declaration);
            patterns.useLabel     = buildRegexp(useLabel);

            // Prepare common
            l = lexCommon.length;
            if (l) {
                while(l--) {
                    if (lexCommon[l].name) {
                        mergeAndPrepareDescription('members.common', lexCommon[l]);

                        commonMember.push(lexCommon[l].name);
                        internalDictionary.members.common[lexCommon[l].name.toLowerCase()] = lexCommon[l];
                    }
                }
            }


            // Add all members
            for (key in lexMembers) {
                if (lexMembers.hasOwnProperty(key) && key !== COMMON) {
                    types.push(key);
                    arr     = [];
                    member  = {};
                    items   = lexMembers[key];
                    l       = items.length;

                    parent = createCoreItem(key);

                    if (l) {
                        while(l--) {
                            item = items[l];

                            // Set the parent relationship
                            item.parent = parent;

                            if (item.accessor) {
                                accessors[key] = item.accessor;
                            } else {
                                mergeAndPrepareDescription('members.' + key, item);

                                arr.push(item.name);
                                anytype.push(item.name);
                                member[item.name.toLowerCase()] = item;
                                anytypeMember[item.name.toLowerCase()] = item;
                                updateAnytype.push(item); // Update the lexical too
                            }
                        }
                    }
                    internalDictionary.members[key] = member;
                    patterns.members[key] = buildRegexp(arr.concat(commonMember));
                }
            }

            patterns.types = buildRegexp(types);

            patterns.members.anytype = buildRegexp(anytype.concat(commonMember));
            internalDictionary.members.anytype = anytypeMember;

            // Add the anytype in the lexical
            lexical.members.anytype = updateAnytype;


            // Add versions
            if (lexVersions.length) {
                appendAutoVersionsDescription(versionsItem.description.element);
            }

            return patterns;
        }());

        /**
         * Snippets
         *
         * @type {Array}
         */
        askiaScript.snippets = (function initSnippets() {

            var escapeRegExp   = askiaScript.escapeRegExp,
                snippets       = lexical.snippets || [],
                l              = snippets.length,
                snippet, name;

            if (l) {
                while(l--) {
                    snippet = snippets[l];
                    name = snippet.name;
                    snippet.regex = new RegExp('^\\s*' + escapeRegExp(name) + '\\s*$', 'gi');
                    snippet.base  = bases.SNIPPET;
                    prepareDescription(snippet);
                }
            }

            return snippets;
        }());

        /**
         * Value type of accessors (array -> anytype, responses -> response)
         */
        askiaScript.accessors = accessors;

        /**
         * Find the definition item of the word in dictionary
         *
         * @param {String} word Word to find
         * @param {String} [type] Type of member to find
         * @return {Object|Null} Returns the definition or null when not found
         */
        askiaScript.find = function findDefinition(word, type) {
            word = word.toLowerCase();
            type = type && type.toLowerCase();

            if (!type) {
                return (internalDictionary.builtin[word] || null);
            }
            if (type === bases.VERSIONS) {
                return internalDictionary.versions[word] || null;
            }
            if (type !== bases.CORE) {
                return ((internalDictionary.members[type] &&
                            internalDictionary.members[type][word])
                                || internalDictionary.members.common[word] || null);
            } else {
                return internalDictionary.core[word] || null;
            }
        };

        /**
         * Indicates if the item is available in the specified ns
         * @param {Object} item Item to test
         * @param {String} ns Namespace
         */
        askiaScript.availableInNS = function availableInNamespace(item, ns) {
            if (!ns || typeof ns !== 'string') {
                return true;
            }
            ns = ns.toLocaleLowerCase();
            if (!item.ns) {
                return true;
            }
            // Check if the item is excluded in the specified namespace
            if (item.excludeIn) {
                if (isArray(item.excludeIn)) {
                    if (item.excludeIn.indexOf(ns) !== -1) {
                        return false;
                    }
                } else if (typeof item.excludeIn === 'string') {
                    if (item.excludeIn === ns) {
                        return false;
                    }
                }
            }
            var namespaces = askiaScript.dictionary.namespaces;
            var namespaceItem = namespaces && namespaces[ns];
            var deps = namespaceItem && namespaceItem.dependencies;
            var i, l;
            // Compare with namespace dependencies
            if (deps) {
                for (i = 0, l = deps.length; i < l; i += 1) {
                    if (item.ns === deps[i]) {
                        return true;
                    }
                }
            }
            // Compare the current specified namespace
            return (item.ns === ns);
        };

        /**
         * Public dictionary already sort for the sense
         */
        askiaScript.dictionary = (function initDictionary() {
            var members     = {},
                lexMembers  = lexical.members,
                common      = lexMembers.common || [],
                items, key,
                builtin,
                versions,
                lexNamespaces = lexical.namespaces,
                namespaces   = {},
                nsItem;

            for (key in lexMembers) {
                if (lexMembers.hasOwnProperty(key) && key !== COMMON) {
                    items = lexMembers[key].concat(common);
                    members[key] = items.sort(sortItems);
                }
            }

            builtin = lexical.builtin.slice();
            builtin = builtin.concat(askiaScript.snippets.slice());

            versions = lexical.versions.slice();

            // Expand the dependencies
            function addRecursiveDependencies(outputObj, parentDeps) {
                var i, l, name, item;
                outputObj.cache = outputObj.cache || {};
                for (i = 0, l = parentDeps.length; i < l; i += 1) {
                    name = parentDeps[i];
                    if (outputObj.cache[name]) { // Already treat
                        continue;
                    }
                    outputObj.cache[name] = true; // Mark as treat
                    if (outputObj.dependencies.indexOf(name) === -1) {
                        outputObj.dependencies.push(name);
                    }
                    item = lexNamespaces[name];
                    if (item && item.dependencies) {
                        addRecursiveDependencies(outputObj, item.dependencies);
                    }
                }
            }

            // Rebuild/Expand the dependencies of the namespaces
            for (key in lexNamespaces) {
                if (lexNamespaces.hasOwnProperty(key)) {
                    nsItem = extend({}, lexNamespaces[key]);
                    if (nsItem.dependencies && isArray(nsItem.dependencies)) {
                        addRecursiveDependencies(nsItem, nsItem.dependencies)
                        delete nsItem.cache;
                    }
                    namespaces[key] = nsItem;
                }
            }

            return {
                members : members,
                builtin : builtin.sort(sortItems),
                versions : versions,
                core    : coreItems,
                namespaces : namespaces,
                toDictionary : function toDictionary() {
                    function stringifyArray(o) {
                        var out = [], val, i, l;

                        for (i = 0, l = o.length; i < l; i++) {
                            if (o[i] !== 'description') {
                                val = o[i];

                                if (typeof val === 'string') {
                                    out.push('"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"');
                                } else if (typeof val === 'number' || typeof val === 'boolean') {
                                    out.push(val);
                                } else if (isArray(val)) {
                                    out = out.concat(val);
                                } else if (typeof  val === 'object') {
                                    out.push(stringifyObject(val));
                                }
                            }
                        }

                        return '[\n\t' + out.join(',\n\t') +  '\n]';
                    }

                    function stringifyObject(o) {
                        var out = [],
                            key, val;

                        for (key in o) {
                            if (o.hasOwnProperty(key) && key !== 'description') {
                                val = o[key];

                                if (typeof val === 'string') {
                                    out.push('\t"' + key + '" : "' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"');
                                } else if (typeof val === 'number' || typeof val === 'boolean') {
                                    out.push('\t"' + key + '" : ' + val);
                                } else if (isArray(val)) {
                                    out.push('\t"' + key + '" : ' + stringifyArray(val));
                                } else if (typeof  val === 'object') {
                                    out.push('\t"' + key + '" : ' + stringifyObject(val));
                                }
                            }
                        }
                        return '{\n' + out.join(',\n') + '\n}';
                    }

                    var strBuiltin = [],
                        strMembers = [],
                        strInnerMembers = [],
                        strCores   = [],
                        memberKey;

                    forEach(coreItems, function forEachCore(item) {
                        strCores.push('\t\t' + stringifyObject(item));
                    });

                    forEach(builtin, function forEachBuiltin(item) {
                        if (item.base === bases.SNIPPET || item.base === bases.QUESTION) {
                            return;
                        }
                        strBuiltin.push('\t\t' + stringifyObject(item));
                    });


                    for (memberKey in members) {
                        if (members.hasOwnProperty(memberKey) && memberKey !== 'anytype') {
                            strInnerMembers = [];
                            forEach(members[memberKey], function forEachMembers(item) {
                                strInnerMembers.push('\t\t' + stringifyObject(item));
                            });
                            strMembers.push('\t\t"' + memberKey + '" : [\n\t\t\t' + strInnerMembers.join(',\n') + '\n\t\t\t]');
                        }
                    }

                    return '{\n' +
                            '\t"core" : [\n\t\t' +
                                    strCores.join(',\n') +
                             '\n\t\t],\n' +
                            '\t"builtin" : [\n\t\t' +
                                    strBuiltin.join(',\n') +
                            '\n\t\t],\n' +
                            '\t"members" : {\n' +
                                    strMembers.join(',\n') +
                            '\n\t}' +
                            '\n}';
                },
                toJSDuckComments : function toJSDuckComments() {
                    function getIndent(indentLength) {
                        var i, indent = '';
                        for (i = 0; i < indentLength; i++) {
                            indent += ' ';
                        }
                        return indent;
                    }

                    function stringify(value, indent, indentLength) {
                        indentLength = indentLength || 0;
                        indent = indent + getIndent(indentLength)
                        var str = [];

                        if (typeof value === 'string') {
                            return indent + '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
                        } else if (typeof value === 'number' || typeof val === 'boolean') {
                            return indent + value;
                        } else if (isArray(value)) {
                            forEach(value, function forEachVal(val) {
                                str.push(stringify(val, (indentLength + 1)));
                            });
                            return str.join(',\n');
                        } else if (typeof  value === 'object') {
                            return stringifyObject(value, indentLength + 1);
                        }
                        return '';
                    }

                    function stringifyArray(o, indentLength) {
                        var out = [], i, l,
                            indent = '\t\t';

                        (indentLength = indentLength || 0);
                        indent += getIndent(indentLength);

                        for (i = 0, l = o.length; i < l; i++) {
                            if (o[i] !== 'description') {
                                out.push(stringify(o[i], indent, indentLength + 1));
                            }
                        }

                        return '[\n' + out.join(',\n') +  '\n' + indent + ']';
                    }

                    function buildString(s, indent) {
                        indent = getIndent(indent);

                        if (isArray(s)) {
                           return ' * ' + indent + s.join('\n * ' + indent);
                        } else {
                            return ' * ' + indent + s.replace('\n', '\n * ' + indent);
                        }
                    }

                    function buildCommentMember(object, member) {
                        var out = [],
                            memberType = (object.base === 'function'
                                        || object.base === 'method') ?
                                            '@method'
                                                : '@property',
                            objectType = (object.type) ? '{' + object.type + '}' : '';

                        out.push('/**');

                        // Description first
                        if (object.desc) {
                            out.push(buildString(object.desc));
                            out.push(' * ');
                        }


                        // Examples
                        if (object.examples) {
                            out.push(buildString(object.examples, 4));
                            out.push(' * ');
                        }

                        // Member
                        member = member || '';
                        if (member) member = '.' + member;
                        out.push(' * @member AskiaScript' + member);
                        out.push(' * ' + memberType + ' ' + objectType + ' ' + object.name);

                        // Parameters
                        if (object.args) {
                            // TODO::Write arguments
                        }

                        out.push('*\/');
                        return out.join('\n');
                    }

                    var strBuiltin = [],
                        strMembers = [],
                        strInnerMembers = [],
                        strCores   = [],
                        memberKey;

                    /*forEach(coreItems, function forEachCore(item) {
                        strCores.push('/**\n\t@dictionary:core\n' + stringifyObject(item) + '\n*\/');
                    });*/

                    forEach(builtin, function forEachBuiltin(item) {
                        if (item.base === bases.SNIPPET || item.base === bases.QUESTION) {
                            return;
                        }
                        strBuiltin.push(buildCommentMember(item));
                    });


                    /*for (memberKey in members) {
                        if (members.hasOwnProperty(memberKey) && memberKey !== 'anytype') {
                            strMembers.push("\n/**\n *\tMEMBERS " + memberKey.toUpperCase() + "\n*\/\n\n");
                            strInnerMembers = [];
                            forEach(members[memberKey], function forEachMembers(item) {
                                strInnerMembers.push('/**\n\t@dictionary:members:' + memberKey + "\n" + stringifyObject(item) + "\n*\/");
                            });
                            strMembers.push(strInnerMembers.join('\n'));
                        }
                    } */

                    return strBuiltin.join('\n');

                },
                toCppComments : function toCppComments(fromMember) {

                    function stringifySection(o) {
                        if (!o.name) {
                            return '';
                        }
                        var out = [], itemDef = [];
                        itemDef.push(" @section");
                        if (o.tagName) {
                            itemDef.push("{" + o.tagName + "}");
                        }
                        itemDef.push(o.name);

                        out.push(itemDef.join(' '));
                        if (o.linkName) {
                            out.push(" @linkName " + o.linkName);
                        }
                        if (o.desc) {
                            out.push(" @content");
                            if (isArray(o.desc)) {
                                out.push(' ' + o.desc.join('\n '));
                            } else {
                                out.push(' ' + o.desc);
                            }
                            out.push('');
                        }
                        return out.join('\n');
                    }

                    function stringifyArg(o) {
                        var out = [], name;
                        out.push(' @param');
                        out.push('{' + translate('types.' + o.type) + '}');
                        name = (o.opt) ? '[' + o.name + ']' : o.name;
                        if (o.prefix) {
                            name = translate('types.' + o.prefix) + ':' + name;
                        }
                        if (o.repeatable) {
                            name += '*';
                        }
                        out.push(name);
                        if (o.desc) {
                            out.push(isArray(o.desc) ? o.desc.join(' ') : o.desc);
                        }
                        return out.join(' ');
                    }

                    function stringifyItem(o) {
                        var out = [], itemDef = [];

                        if (o.base) {
                            if (o.base === 'core') {
                                itemDef.push(' @class');
                            }
                            else {
                                itemDef.push(' @' + o.base);
                            }
                            if (o.type && o.type !=='core' && o.base !== 'function' && o.base !== 'method') {
                                itemDef.push('{' + translate('types.' + o.type) + '}');
                            }
                            if (o.name) {
                                itemDef.push((o.base === 'core') ? translate('types.' + o.name) : o.name);
                            }
                            if (itemDef.length) {
                                out.push(itemDef.join(' '));
                            }
                        } else  if (o.name) {   // ->  For version
                            out.push(' @versionName ' + o.name);
                        }

                        if (o.accessor) {
                            out.push(' @accessor ' + translate('types.' + o.accessor));
                        }
                        if (o.args && isArray(o.args)) {
                            forEach(o.args, function forEachArgs(arg){
                                out.push(stringifyArg(arg));
                            });
                        }
                        if (o.type && (o.base === 'function' || o.base === 'method')) {
                            out.push(' @return {' + translate('types.' + o.type) + '}');
                        }
                        if (o.declare) {
                            out.push(' @declare');
                        }
                        if (o.useLabel) {
                            out.push(' @useLabel');
                        }
                        if (o.deprecated) {
                            out.push(' @deprecated');
                        }
                        if (o.prefer) {
                            out.push(' @prefer ' + (isArray(o.prefer) ? o.prefer.join(', ') : o.prefer));
                        }
                        if (o.open) {
                            out.push(' @open ' + o.open);
                        }
                        if (o.close) {
                            out.push(' @close ' + o.close);
                        }

                        if (o.desc) {
                            out.push(' @description\n');
                            if (isArray(o.desc)) {
                                out.push(' ' + o.desc.join('\n '));
                            } else {
                                out.push(' ' + o.desc);
                            }
                            out.push('');
                        }

                        if (o.creation) {
                            out.push(' @creation\n');
                            if (isArray(o.creation)) {
                                out.push(' ' + o.creation.join('\n '));
                            } else {
                                out.push(' ' + o.creation);
                            }
                            out.push('');
                        }

                        if (o.examples) {
                            out.push(' @examples\n');
                            if (isArray(o.examples)) {
                                out.push(' ' + o.examples.join('\n '));
                            } else {
                                out.push(' ' + o.examples);
                            }
                            out.push('');
                        }

                        if (o.remarks) {
                            out.push(' @remarks\n');
                            if (isArray(o.remarks)) {
                                out.push(' ' + o.remarks.join('\n '));
                            } else {
                                out.push(' ' + o.remarks);
                            }
                            out.push('');
                        }

                        if (o.sections && isArray(o.sections)) {
                            forEach(o.sections, function (section) {
                                out.push(stringifySection(section));
                            });
                        }
                        if (o.synonyms) {
                            out.push(' @synonyms ' + (isArray(o.synonyms) ? o.synonyms.join(', ') : o.synonyms));
                        }
                        if (o.alsoSee) {
                            out.push(' @alsoSee ' + (isArray(o.alsoSee) ? o.alsoSee.join(', ') : o.alsoSee));
                        }
                        if (o.version) {
                            out.push(' @since ' + o.version);
                        }

                        return out.join('\n');
                    }

                    var output = [];

                    forEach(coreItems, function forEachCore(coreItem) {
                        var strInnerMembers = [],
                            name = coreItem.name;

                        if (fromMember && fromMember !== name) {
                            return;
                        }
                        output.push("\n// " + name.toUpperCase() + "\n\n");
                        if (name !== 'builtin' && name !== 'versions') {
                            output.push('/**\n @askiaScript\n' + stringifyItem(coreItem) + '\n*\/\n');
                        }

                        if (name === 'builtin') {
                            forEach(builtin, function forEachBuiltin(item) {
                                if (item.base === bases.SNIPPET || item.base === bases.QUESTION) {
                                    return;
                                }
                                strInnerMembers.push('/**\n @askiaScript\n' + stringifyItem(item) + '\n*\/');
                            });
                            output.push(strInnerMembers.join('\n'));
                        }
                        else if (name === 'versions') {
                            forEach(versions, function forEachVersion(item) {
                                strInnerMembers.push('/**\n @askiaScript\n' + stringifyItem(item) + '\n*\/');
                            });
                            output.push(strInnerMembers.join('\n'));
                        }
                        else if (name in members) {

                            forEach(members[name], function forEachMembers(item) {
                                strInnerMembers.push('/**\n @askiaScript\n @member ' + translate('types.' + name) + "\n" + stringifyItem(item) + "\n*\/");
                            });
                            output.push(strInnerMembers.join('\n'));
                        }
                    });

                    if (!fromMember || fromMember === 'snippets') {
                        output.push("\n\n// SNIPPETS\n\n");
                        forEach(askiaScript.snippets, function forEachSnippet(o) {
                            output.push('/**\n @askiaScript');
                            output.push(' @snippet ' + o.name);
                            if (isArray(o.snippet)) {
                                output.push(' ' + o.snippet.join('\n ') + '\n*\/');
                            } else {
                                output.push(' ' + o.snippet + '\n*\/');
                            }
                        });
                    }
                    return output.join('\n');
                }

            };
        } ());

    };

    CodeMirror.defineMode("askiascript", function defineAskiaScriptMode(options) {
        "use strict";

        // Defined the lexical if not already done
        CodeMirror.askiaScript.defineLexical(CodeMirror.askiaScript.lexical);

        //noinspection JSUnresolvedVariable
        // AskiaScript static config
        var askiaScript = CodeMirror.askiaScript,
            bases       = askiaScript.bases,
            types       = askiaScript.types,
            classNames  = askiaScript.classNames,
            accessors   = askiaScript.accessors,
            patterns    = askiaScript.patterns,
            dictionary  = askiaScript.dictionary,
            questions   = {},
            localVariables = {},
            labels      = {},
            funcNames   = {},

        // Don't consume characters during match
            DONT_CONSUME = false,
            modules = options.modules || {};
        // Public dictionary for the instance of the editor
        // It's accessible through the options
        options.dictionary = (function createEditorDictionary() {
            var buildRegexp = askiaScript.buildRegexp;
            var l,
                question,
                collection = [],
                fragment    = [],
                result     = {},
                sortItems  = askiaScript.sortItems;

            if (options.questions && options.questions.length) {
                l = options.questions.length;
                while (l--) {
                    question = options.questions[l];
                    //noinspection JSUnresolvedVariable
                    questions[question.shortcut] = question;
                    //noinspection JSUnresolvedVariable
                    collection.push({
                        name : question.shortcut,
                        type : question.type,
                        base : bases.QUESTION
                    });
                }
                //noinspection JSUnresolvedVariable
                if (options.currentQuestion && questions[options.currentQuestion]) {
                    //noinspection JSUnresolvedVariable
                    questions['currentquestion'] = questions[options.currentQuestion];
                }
            }

            function buildModuleRegexp() {
                var funcs 	= [],
                    obj		= {};
                for (var key in modules) {
                    funcs = [];
                    var module = modules[key];
                    if (!module.length) {
                        continue;
                    }
                    for (var i = 0, l = module.length; i < l; i++) {
                        funcs.push(module[i].name);
                    }
                    obj[key] = buildRegexp(funcs);
                }
                CodeMirror.askiaScript.patterns.members["module"] = obj;
            }

            if (modules) {
                for (var key in modules) {
                    var module = modules[key];
                    if (!module.length) {
                        continue;
                    }
                    for (var i = 0, l = module.length; i < l; i++) {
                        module[i].module = key;
                    }
                }
                buildModuleRegexp();
            }

            // All questions and builtin
            fragment = (dictionary.builtin.concat(collection)).sort(sortItems);

            function updateModules(mod) {
                for (var key in mod) {
                    if (!mod[key].length) {
                        continue;
                    }
                    for (var i = 0, l = mod[key].length; i < l; i++) {
                        mod[key][i].module = key;
                    }
                    modules[key] = mod[key];
                }
                buildModuleRegexp();
            }
            
            function update(vars, lbls, funcs) {
                l = vars.length;
                localVariables = {};
                labels = {};
                funcNames = {};
                if (l) {
                    while(l--) {
                        localVariables[vars[l].name.toLowerCase()] = vars[l];
                    }
                }
                l = lbls.length;
                if (l) {
                    while(l--) {
                        labels[lbls[l].name.toLowerCase()] = lbls[l];
                    }
                }
                l = funcs.length;
                if (l) {
                    while(l--) {
                        funcNames[funcs[l].name.toLowerCase()] = funcs[l];
                    }
                }
                result.variables = vars.sort(sortItems);
                result.labels    = lbls.sort(sortItems);
                result.functions = funcs.sort(sortItems);
                result.all       = fragment.concat(vars).concat(lbls).concat(funcs).sort(sortItems);
            }

            result = {
                all       : fragment,
                questions : collection.sort(sortItems),
                modules   : modules,
                variables : [],
                labels    : [],
                functions : [],
                update    : update,
                updateModules : updateModules
            };

            return result;
        }());


        function indent(state) {
            state.currentIndent++;
        }

        function dedent(state) {
            state.currentIndent--;
        }

        function stackScope(current, state) {
            if (state.lastToken) {
                state.scope = state.scope || [];
                state.lastToken.brace = (current === '[');
                state.lastToken.curve = (current === '{');
                state.currentScope = state.lastToken;
                state.scope.push(state.lastToken);
            }
        }

        function unstackScope(current, state) {
            if (state.scope && state.scope.length) {
                state.currentScope = state.scope.pop();
            } else {
                state.currentScope = null;
            }
        }

        /**
         * Indicates if the token is a comment
         * @param stream
         * @return {String|Boolean} Return 'comment' or false
         */
        function matchComment(stream) {
            var ch = stream.peek();
            if (ch === "'") {
                stream.skipToEnd();
                return classNames.COMMENT;
            }
            return false;
        }

        /**
         * Indicates if the token is a number
         * @param stream
         * @return {String|Boolean} Return 'number' or false
         */
        function matchNumber(stream) {
            if (stream.match(patterns.number, DONT_CONSUME)) {
                // Manage the floats literal
                if (stream.match(patterns.float)) {
                    // prevent from getting extra . on 1..
                    if (stream.peek() === '.') {
                        stream.backUp(1);
                    }
                    return classNames.NUMBER;
                }
                // Now consume the number
                if (stream.match(patterns.number)) {
                    return classNames.NUMBER;
                }
            }

            return false;
        }

        /**
         * String tokenizer
         * @param stream
         * @param state
         */
        function stringTokenizer(stream, state) {
            while (!stream.eol()) {
                stream.eatWhile(/[^'"\/\\]/);
                if (stream.eat('\\')) {
                    stream.next();
                } else if (stream.match(patterns.stringPrefix)) {
                    state.tokenize = tokenBase;
                    return classNames.STRING;
                } else {
                    stream.eat(/['"\/]/);
                }
            }
            return classNames.STRING;
        }

        /**
         * Indicates if the token is a string
         * @param stream
         * @param state
         * @return {String|Boolean|Object} Return 'string' or false
         */
        function matchString(stream, state) {
            if (stream.match(patterns.stringPrefix)) {
                state.tokenize = stringTokenizer;
                return state.tokenize(stream, state);
            }
            return false;
        }

        /**
         * Indicates if the token is an operator
         * @param stream
         * @return {String|Boolean} Return 'operator' or false
         */
        function matchOperator(stream) {
            if (stream.match(patterns.operator)	 ||
                stream.match(patterns.wordOperator)) {
                return classNames.OPERATOR;
            }
            return false;
        }

        /**
         * Indicates if the token match a punctuation
         * @param stream
         * @return {String|Boolean} Return 'punctuation' or false
         */
        function matchPunctuation(stream) {
            if (stream.match(patterns.punctuation)) {
                return classNames.PUNCTUATION;
            }
            return false;
        }

        /**
         * Indicates if the token match an opening keyword
         * @param stream
         * @param state
         * @return {String|Boolean} Return 'keyword' or false
         */
        function matchOpening(stream, state) {
            var match = stream.match(patterns.opening);
            if (match) {
                indent(state);
                state.indentInfo = match[1];
                return classNames.KEYWORD;
            }
            return false;
        }

        /**
         * Indicates if the token match a middle keyword
         * @param stream
         * @return {String|Boolean} Return 'keyword' or false
         */
        function matchMiddle(stream) {
            if (stream.match(patterns.middle)) {
                return classNames.KEYWORD;
            }
            return false;
        }

        /**
         * Indicates if the token match a closing keyword
         * @param stream
         * @param state
         * @return {String|Boolean} Return 'keyword' or false
         */
        function matchClosing(stream, state) {
            if (stream.match(patterns.closing)) {
                dedent(state);
                return classNames.KEYWORD;
            }
            return false;
        }

        /**
         * Indicates if the token match a variable declaration
         * @param stream
         * @param state
         * @return {String|Boolean} return 'keyword' or false
         */
        function matchDeclaration(stream, state) {
            if (stream.match(patterns.declaration)) {
                state.declaration = true;
                return classNames.KEYWORD;
            }
            return false;
        }

        /**
         * Indicates if the token match a keyword which use a label
         *
         * @param stream
         * @param state
         * @return {String|Boolean} return 'keyword' or false
         */
        function matchUseLabel(stream, state) {
            if (stream.match(patterns.useLabel)) {
                state.useLabel = true;
                return classNames.KEYWORD;
            }
            return false;
        }

        /**
         * Indicates if the token match a builtin
         * @param stream
         * @return {String|Boolean} return the type of builtin or false
         */
        function matchBuiltin(stream) {
            var match = stream.match(patterns.builtin, DONT_CONSUME),
                item;
            if (match && match.length > 1) {
                item = askiaScript.find(match[1]);
                if (item && item.base !== bases.OPERATOR) {
                    stream.match(patterns.builtin); // Eat now
                    return classNames.BUILTIN_PREFIX + item.type;
                }
            }
            return false;
        }

        /**
         * Indicates if the token match a variable declaration
         * @param stream
         * @param state
         * @return {String|Boolean} return 'variable' or false
         */
        function matchLocalVariable(stream, state) {
            var match = stream.match(patterns.variable, DONT_CONSUME);
            if (match && match.length > 1) {
                if (state.declaration || localVariables[match[1].toLowerCase()]) {
                    var item = localVariables[match[1]];
                    stream.match(patterns.variable); // Eat now
                    return  (item && item.className) || classNames.VARIABLE;
                }
            }
            return false;
        }

        /**
         * Indicates if the token match a function declaration
         * @param stream
         * @param state
         * @return {String|Boolean} return 'function' or false
         */
        function matchFunction(stream, state) {
            var match = stream.match(patterns.variable, DONT_CONSUME),
                item;
            if (match && match.length > 1) {
                if (state.declaration || funcNames[match[1].toLowerCase()]) {
                    item = funcNames[match[1].toLowerCase()];
                    if (item && item.base !== bases.OPERATOR) {
                        stream.match(patterns.variable); // Eat now
                        return classNames.BUILTIN_PREFIX + item.type;
                    }
                }
            }
            return false;
        }

        /**
         * Indicates if the token match the declaration of label
         *
         * @param stream
         * @return {String|Boolean} return 'label' or false
         */
        function matchLabelDeclaration(stream) {
           if (stream.match(patterns.labelDeclaration)) {
               return classNames.LABEL;
           }
           return false;
        }

        /**
         * Indicates if the token match a label
         *
         * @param stream
         * @return {String|Boolean} return 'label', 'undef-label' or false
         */
        function matchLabel(stream, state) {
            var match = stream.match(patterns.label, DONT_CONSUME);
            if (match && match.length > 1) {
                if (state.useLabel || labels[match[1].toLowerCase()]) {
                    stream.match(patterns.label); // Eat now
                    return labels[match[1].toLowerCase()] ? classNames.LABEL : classNames.UNDEFINED_LABEL;
                }
            }
            return false;
        }

        /**
         * Indicates if the token match a common keyword
         * @param stream
         * @return {String|Boolean} returns 'keyword' or false
         */
        function matchCommon(stream) {
            if (stream.match(patterns.common)) {
                return classNames.KEYWORD;
            }
            return false;
        }

        /**
         * Indicates if the token match a member
         * @param stream
         * @param state
         * @return {String|Boolean} return the style of the member of false
         */
        function matchMembers(stream, state) {
            var type = (state.lastToken && state.lastToken.style) || '',
                match;
            type = type.replace(patterns.prefixes, '');

            // Try with the latest scope if it's defined
            if (!patterns.members[type] && state.currentScope) {
                type = state.currentScope.style || '';
                type = type.replace(patterns.prefixes, '');
                type = (state.currentScope.brace && accessors[type]) || (state.currentScope.curve && types.ARRAY) || types.ANY_TYPE;
            }
            // Try with the previous token
            else if (state.lastToken) {
                if (state.lastToken.content === ')') {
                    type = types.ANY_TYPE;
                } else if (state.lastToken.content === '}') {
                    type = types.ARRAY;
                }
            }

            if (patterns.members[type]) {
                if (patterns.members[type][state.lastToken.content]) {
                    match = stream.match(patterns.members[type][state.lastToken.content]);
                    var funcs = options.dictionary.modules[state.lastToken.content];
                    for (var i = 0, l = funcs.length; i < l; i++) {
                        if (match && funcs[i].name === match[1]) {
                            type = funcs[i].type;
                            return classNames.MEMBER_PREFIX + type;
                        }
                    }
                } else {
                    match = stream.match(patterns.members[type]);
                }

                if (match) {
                    return classNames.MEMBER_PREFIX + askiaScript.find(match[1], type).type;
                }
            }
            return false;
        }

        /**
         * Indicates if the token match a question
         * @param stream
         * @return {String|Boolean} Return the style of question or false
         */
        function matchQuestion(stream) {
            // Search also if the variable exist
            var match = stream.match(patterns.question) || stream.match(patterns.variable),
                index, question;
            if (match && match.length > 1) {
                // Use ??question?? or ^question^ or question
                index = (match.length === 4) ? 2 : 1;
                question = questions[match[index]];
                return (question && classNames.QUESTION) || false;
            }
            return false;
        }

        /**
         * Indicates if the token match a question delimiter (with no question inside)
         * @param stream
         * @return {String|Boolean} Return the style of the question delimiter of false
         */
        function matchQuestionDelimiter(stream) {
            if (stream.match(patterns.questionDelimiter)) {
                return classNames.QUESTION_DELIMITER;
            }
            return false;
        }

        /**
         * Match types
         */
        function matchTypes(stream) {
            if (stream.match(patterns.types)) {
                return classNames.KEYWORD;
            }
            return false;
        }

        /**
         * Indicates an error
         * @param stream
         * @return {string} return 'error'
         */
        function matchError(stream) {
            stream.next();
            return classNames.ERROR;
        }

        /**
         * Find imported modules
         */
        function matchModules(stream) {
            // Search also if the variable exist
            var match = stream.match(patterns.module, DONT_CONSUME),
                module;
            if (match && match.length > 1) {
                module = modules[match[1]];
                //make the stream go ahead
                if (module) {
                    match = stream.match(patterns.module);
                }
                return (module && classNames.MODULE) || false;
            }
            return false;
        }

        // tokenizers
        function tokenBase(stream, state) {
            if (stream.eatSpace()) {
                return null;
            }

            return matchComment(stream) ||
                matchNumber(stream) ||
                matchString(stream, state) ||
                matchOperator(stream) ||
                matchModules(stream) ||
                matchPunctuation(stream) ||
                matchOpening(stream, state) ||
                matchMiddle(stream) ||
                matchClosing(stream, state) ||
                matchDeclaration(stream, state) ||
                matchUseLabel(stream, state) ||
                matchMembers(stream, state) ||
                matchCommon(stream) ||
                matchBuiltin(stream) ||
                matchTypes(stream) ||
                matchLocalVariable(stream, state) ||
                matchFunction(stream, state) ||
                matchLabelDeclaration(stream) ||
                matchLabel(stream, state) ||
                matchQuestion(stream) ||
                matchQuestionDelimiter(stream) ||
                matchError(stream);
        }

        function tokenLexer(stream, state) {
            var style = state.tokenize(stream, state);
            var current = stream.current();

            /**
             * Here is the management of connectors
             * for autocomplete
             */
            // Handle '.' connected identifiers
            if (current === '.' || current === '::') {
                style = state.tokenize(stream, state);
                current = stream.current();
                if (style && ~(style.indexOf(classNames.MEMBER_PREFIX))) {
                    return style;
                } else {
                    return classNames.ERROR;
                }
            }

            // Remove the current scope
            if (state.scope && state.scope.length === 0) {
                state.currentScope = null;
            }

            if (~('('.indexOf(current))) {
                stackScope(current, state);
            }
            if (~(')'.indexOf(current))) {
                unstackScope(current, state);
            }
            if (~('[{'.indexOf(current))) {
                stackScope(current, state);
                indent(state);
            }

            if (~('}]'.indexOf(current))) {
                unstackScope(current, state);
                if (dedent(state)) {
                    return classNames.ERROR;
                }
            }

            return style;
        }

        return {
            electricChars   : 'fFtTnNeE', // EndI[f], nex[t], the[n], els[e]
            startState      : function () {
                return {
                    tokenize        : tokenBase,
                    lastToken       : null,
                    currentIndent   : 0,
                    nextLineIndent  : 0,
                    declaration     : false,
                    useLabel        : false,
                    indentInfo      : null
                };
            },
            token           : function (stream, state) {
                if (stream.sol()) {
                    state.currentIndent += state.nextLineIndent;
                    state.nextLineIndent = 0;
                    state.declaration = false;
                    state.useLabel    = false;
                    state.indentInfo  = null;
                }
                var style = tokenLexer(stream, state);

                state.lastToken = {
                    style        : style,
                    content      : stream.current()
                };

                return style;
            },
            indent          : function (state, textAfter) {

                var trueText = textAfter.replace(/^\s+|\s+$/g, '');
                if (trueText.match(patterns.closing) || trueText.match(patterns.middle)) {
                    return options.indentUnit * (state.currentIndent - 1);
                }

                if (state.currentIndent < 0) {
                    return 0;
                }

                return state.currentIndent * options.indentUnit;
            }
        };
    });

    /**
     * Activate the auto-collect of local variables
     */
    function collectVariables(instance) {
        // Defined the lexical if not already done
        askiaScript.defineLexical(askiaScript.lexical);

        var elEditor      = instance.getWrapperElement(),
            options       = instance.options,
            clearTimeout  = window.clearTimeout,
            setTimeout    = window.setTimeout,
            timeout       = null,
            types         = askiaScript.types,
            bases         = askiaScript.bases,
            classNames    = askiaScript.classNames;


        /*
         * Add css class in the element
         * @param {HTMLElement} el DOM Element
         * @param {String} className CSS class to add on the element
         */
        function addClass(el, className) {
            if (!el.className || !hasClass(el, className)) {
                el.className += ((el.className) ? ' ' : '') + className;
            }
        }

        /*
         * Remove css class in the element
         * @param {HTMLElement} el DOM Element
         * @param {String} className CSS class to remove on the element
         */
        function removeClass(el, className) {
            var cl = el.className,
                rg = new RegExp("\\b(" + className + ")\\b", "g");
            el.className = cl.replace(rg, '');
        }

        // Update local variables declare with 'dim' keyword
        function refreshVariables() {
            var regexps     = [
                    {
                        type : 'variable',
                        re   : /^(?:.*\{%)?\s*(?:dim)\s+([a-z_][a-z0-9_]*)/mgi
                    },
                    {
                        type : 'variable',
                        re   : /(?:forsum|formax|formin|forset)\s*\("(.+?)"/mgi
                    },
                    {
                        type : 'label',
                        re   : /^\s*([a-z_][a-z0-9_]*):\s*$/mgi
                    },
	                {
                        type : 'function',
                        re   : /^\s*(?:export\s+)?(?:function)\s+([a-z_][a-z0-9_]*)\s*\((.*?)\)\s*(?:as)\s+([a-z]*)/mgi
    	            }
                ],
                value       = instance.getValue(),
                functions   = [],
                variables   = [],
                labels      = [],
                definedLabels = {},
                vars 		= {},
                re, match,
                i, l,
                undefinedLabelElements, el;

            for (i = 0, l = regexps.length; i < l; i++) {
                re = regexps[i].re;
                match = re.exec(value);
                while (match) {
                    if (regexps[i].type === 'variable') {
                        variables.push({
                            name : match[1],
                            type : types.ANY_TYPE,
                            className : classNames.VARIABLE,
                            base : bases.VARIABLE
                        });
                        vars[match[1].toLowerCase()] = {
                            name : match[1],
                            type : types.ANY_TYPE,
                            className : classNames.VARIABLE,
                            base : bases.VARIABLE
                        };
                    } else if (regexps[i].type === 'label') {
                        labels.push({
                            name : match[1]
                        });
                        definedLabels[match[1].toLowerCase()] = true;
                    } else if (regexps[i].type === 'function') {
                        var args = []
                        if (match[2]) {
                            var rg = /([a-z_][a-z0-9_]*)\s+(?:as)\s+([a-z]*)/gi;
                            var arg = rg.exec(match[2]);
                            while (arg) {
                                args.push({
                                    name : arg[1],
                                    type : arg[2]
                                });
                                var variable = vars[arg[1]];
                                if (variable && variable.type !== arg[2]) {
                                    for (var i = 0, l = variables.length; i < l; i++) {
                                        if (variables[i].name === variable.name) {
                                            variables[i].type = types.ANY_TYPE;
                                        }
                                    }
                                } else {
                                    variables.push({
                                        name : arg[1],
                                        type : arg[2],
                                        className : classNames.BUILTIN_PREFIX + arg[2],
                                        base : bases.VARIABLE
                                    });
                                    vars[arg[1].toLowerCase()] = {
                                        name : arg[1],
                                        type : arg[2],
                                        className : classNames.BUILTIN_PREFIX + arg[2],
                                        base : bases.VARIABLE
                                    };
                                }
                                arg = rg.exec(match[2]);
                            }
                        }
                        functions.push({
                            base : 'function',
                            name : match[1],
                            type : match[3].toLowerCase(),
                            args : args
                        });
                    }
                    match = re.exec(value);
                }
            }

            // Code mirror syntax highlight hack
            // Refresh the dom itself
            undefinedLabelElements = (elEditor.querySelectorAll && elEditor.querySelectorAll('.cm-' + classNames.UNDEFINED_LABEL)) || [];
            for (i = 0, l = undefinedLabelElements.length; i < l; i++) {
                el = undefinedLabelElements[i];
                if (definedLabels[el.innerText.toLowerCase()]) {
                    removeClass(el, 'cm-' + classNames.UNDEFINED_LABEL);
                    addClass(el, 'cm-' + classNames.LABEL);
                }
            }

            // Refresh the dictionary
            if (options.dictionary && options.dictionary.update) {
                options.dictionary.update(variables, labels, functions);
            }
        }

        // Collect all variables
        function collectVariables() {
            instance.operation(refreshVariables);
        }

        // Trigger the change (do the operation) using timer (thread)
        function trigger() {
            clearTimeout(timeout);
            timeout   = setTimeout(collectVariables, 50);
        }

        // Register the change event once for all
        instance.on("change", trigger);

        // Refresh variables on load
        refreshVariables();

        return this;
    };

    /**
     * This hook is called at the initialization of each editor
     * We use it to collect variables before the first tokenizer cycle
     * @param {CodeMirror} instance CodeMirror editor instance
     */
    CodeMirror.defineInitHook(function initAskiaScriptInstance(instance) {
        collectVariables(instance);
    });

    CodeMirror.defineMIME("application/askiascript", "askiascript");

});