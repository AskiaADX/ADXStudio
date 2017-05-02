(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"), require("../../mode/askiascript/askiascript"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror", "../../mode/askiascript/askiascript"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    var askiaScript  = CodeMirror.askiaScript,
        forEach      = askiaScript.forEach,
        escapeRegExp = askiaScript.escapeRegExp,
        bases        = askiaScript.bases,
        types        = askiaScript.types,
        classNames   = askiaScript.classNames,
        senseClassNames   = classNames.sense,
        descClassNames    = classNames.description,
        translate   = askiaScript.translate,
        PERIOD      = '.',
        COLON      	= ':',
    // Browser support
        browserSupport = {
            selectstart     : ("onselectstart" in document.createElement('div')),
            selectionEvent  : (window.selectstart) ? "selectstart" : "mousedown"
        };

    /**
     * Returns the list of suggestions
     *
     * @param {CodeMirror} instance Instance of code mirror
     * @param {Object} [context] Indicates the context of the suggestion
     * @return {Array} Suggestions
     */
    function getSuggestions(instance, context) {
        var member      = '',
            patterns    = askiaScript.patterns,
            accessors   = askiaScript.accessors,
            dictionary  = askiaScript.dictionary,
            builtin     = (instance.options &&
                instance.options.dictionary &&
                instance.options.dictionary.all) ||
                dictionary.builtin;

        if (context) {
            member = (context.style || '').replace(patterns.prefixes, '');
            member = (context.brace && accessors[member]) || (context.curve && types.ARRAY) || member;
            if (member === "module") {
                for (var i = 0, l = instance.options.dictionary.modules.length; i < l; i++) {
                    var mod = instance.options.dictionary.modules[i];
                    if (mod.name === context.content.replace("::", "")) {
                        return mod.functions;
                    }
                }
            }
            return dictionary.members[member];
        } else {
            return builtin;
        }
    }

    /**
     * Returns suggestions according to the key press
     * @param {CodeMirror} instance Instance of code mirror
     * @return {Array|null} Suggestions
     */
    function askiascriptHint(instance) {
        // Find the token at the cursor
        var cur           = instance.getCursor(),
            token         = instance.getTokenAt(cur),
            tokenState    = token.state.inner || token.state, // State in normal or multi-mode
            contextToken  = token,
            contextTokenState = contextToken.state.inner || contextToken.state, // State in normal or multi-mode
            context       = null,
            isMember      = ((token.string.charAt(0) === PERIOD) || (token.string.charAt(1) === COLON));

        // Don't enable the hint on string
        // or on comment
        if (!isMember && (token.type === classNames.STRING || token.type === classNames.COMMENT)) {
            return null;
        }

        // If it's not a 'word-style' token, ignore the token.
        if (!/^[\w_]*$/.test(token.string)) {
            contextToken = {
                start     : cur.ch,
                end       : cur.ch,
                string    : "",
                state     : tokenState
            };
            contextTokenState = contextToken.state.inner || contextToken.state;
        }

        // If it's a member then search from what
        if (isMember) {
            contextToken = instance.getTokenAt({
                line  : cur.line,
                ch    : contextToken.start
            });
            contextTokenState = contextToken.state.inner || contextToken.state;
            if ((contextToken.string.charAt(0) !== PERIOD) && (contextToken.string.charAt(1) !== COLON)) {
                return null;
            }

            contextToken = instance.getTokenAt({
                line  : cur.line,
                ch    : contextToken.start
            });
            contextTokenState = contextToken.state.inner || contextToken.state;

            // Check the context before the punctuation
            if (contextToken.type === classNames.PUNCTUATION) {
                context = (contextTokenState.currentScope || contextTokenState.lastToken);
            } else {
                context = contextTokenState.lastToken || tokenState.lastToken;
            }
        }

        return getSuggestions(instance, context);
    }

    /**
     * Indicates if the element contains a css class
     *
     * @param {HTMLElement} el DOM element
     * @param {String} className CSS class name to verify
     * @return {Boolean}  True when the element contains the specify classname
     */
    function hasClass(el, className) {
        var cl = el.className,
            rg = new RegExp("\\b" + className + "\\b", "g");
        return rg.test(cl);
    }

    /**
     * Add css class in the element
     * @param {HTMLElement} el DOM Element
     * @param {String} className CSS class to add on the element
     */
    function addClass(el, className) {
        if (!el.className || !hasClass(el, className)) {
            el.className += ((el.className) ? ' ' : '') + className;
        }
    }

    /**
     * Remove css class in the element
     * @param {HTMLElement} el DOM Element
     * @param {String} className CSS class to remove on the element
     */
    function removeClass(el, className) {
        var cl = el.className,
            rg = new RegExp("\\b(" + className + ")\\b", "g");
        el.className = cl.replace(rg, '');
    }

    /**
     * Set the options in the specified select box
     *
     * Polyfill is to fix an IE bug with the select.innerHTML which act as an select.innerText
     *
     * @param {HTMLElement} element Select box element
     * @param {String} options Options as string
     */
    var setSelectOptions = (function () {
        var selectTest = document.createElement("select");
        selectTest.innerHTML = "<option>test</option>";
        if (!/^<option>/gi.test(selectTest.innerHTML)) {
            return function setSelectOptionsIEFix(element, options) {
                var div = document.createElement("div");
                div.innerHTML = "<select>" + options + "</select>";
                var child = div.childNodes[0].options;
                element.innerHTML = "";
                forEach(child, function appendOptions(option) {
                    element.appendChild(option.cloneNode(true));
                });
            };
        }

        // Normal browser
        return function setSelectOptionsModern(element, options) {
            element.innerHTML = options;
        };

    } ());

    /**
     * Add search event according on the browser support
     * @param {HTMLElement} el Input element
     * @param {Function} fn Function to attach
     */
    function attachSearchEvent(el, fn) {
        if ('oninput' in el) {
            el.oninput = fn;
        } else {
            el.onclick = el.onkeyup = fn;
        }
    }

    /**
     * Prevent the default
     * @param {Object} e Event
     */
    function preventDefault(e) {
        e.preventDefault();
        return false;
    }

    /**
     * Disable selection
     */
    function disableSelection() {
        CodeMirror.on(document.body, browserSupport.selectionEvent, preventDefault);
    }

    /**
     * Enable selection
     */
    function enableSelection() {
        CodeMirror.off(document.body, browserSupport.selectionEvent, preventDefault);
    }

    /**
     * Add or remove css class according to the flag
     * @param {Boolean} add When true, add the css class on element otherwize remove it
     * @param {HTMLElement} el DOM element
     * @param {String} className CSS class to add or remove
     */
    function updateClass(add, el, className) {
        if (add) {
            addClass(el, className);
        } else {
            removeClass(el, className);
        }
    }

    /**
     * Remove remain spaces at the end of the string
     * @param {String} str String to trim
     * @return {String} String without spaces at the end
     */
    function trimRight(str) {
        var spaces = /(\s*)$/;
        return str.replace(spaces, '');
    }

    /**
     * Get the regular expression for the specify token
     * @param {String} str String of the token
     * @param {Boolean} [exactMatch=false] Enforce a full word match
     * @return {RegExp} Regular expression to find the token
     */
    function getTokenRegexp(str, exactMatch) {
        str = trimRight(str);
        // var start = escapeRegExp(str).replace(/[.]/, '.?');
        // Escape with all special characters that could trigger the suggestion
        // but without to be part of the suggestion itself
        // Do it for the two first characters to handle stuff like '</' => '<?/?'
        // Be careful the . will be replace by \.
        var start = escapeRegExp(str).replace(/^(\\\.|=|<|"|'|\/|:)/, '$1?').replace(/^(.\?)(\.|=|<|"|'|\/|:)/, '$1$2?');
        if (start === '') {
            start = ".*";
        }
        if (exactMatch) {
            start += '$';
        }
        return new RegExp('^' + start, 'i');
    }

    /**
     * Indicates if the suggested item could be display
     * @param {Object} item Suggestion item contains
     * @param {RegExp} rg Regular expression to test the name of the item
     * @return {Boolean} Return true when the item could be display, false otherwize
     */
    function shouldBeDisplay(item, rg) {
        return rg.test(item.name);
    }

    /**
     * Throttle technique to delay frequent execution
     * Useful for the resizing
     *
     * @param {Function} fn Function to execute
     * @param {Number} interval Interval of the time allowed between two successive execution
     * @param {Object} [scope] Execution scope
     * @return {Function} Throttle function
     */
    function throttle(fn, interval, scope) {
        var lastCallTime = 0, elapsed, lastArgs, timer;

        function execute() {
            fn.apply(scope || this, lastArgs);
            lastCallTime = new Date().getTime();
        }

        return function throttleFunction() {
            elapsed = new Date().getTime() - lastCallTime;
            lastArgs = arguments;

            clearTimeout(timer);
            if (!lastCallTime || elapsed >= interval) {
                execute();
            } else {
                timer = setTimeout(execute, interval - elapsed);
            }
        };
    }

    /**
     * Remove the question delimiter
     *
     * @param {String} text Text to clean
     * @return {String} Clean text
     */
    function removeQuestionDelimiters(text) {
        var match = askiaScript.patterns.question.exec(text);
        if (match && match.length === 4) {
            return match[2];
        }
        return text;
    }

    /**
     * Initialize the description for the code mirror instance
     * @param {CodeMirror} instance
     * @constructor
     */
    function Description(instance) {
        // CodeMirror instance
        this.instance       = instance;
        this.currentQuestion = this.instance.options && this.instance.options.currentQuestion;
        this.domResources = [];

        // Cache of questions
        this.questionsCache = {};
        this.currentDisplayQuestion = null;
        // Question navigation History
        this.questionNavHistory = [];

        // Editor
        this.elEditor       = instance.getWrapperElement();

        // Root of description
        this.elDesc          = document.createElement('div');
        this.elDesc.className = descClassNames.DESCRIPTION;

        if (this.instance.options.debug) {
            this.elDebug = document.createElement('div');
            this.elDebug.className = descClassNames.DEBUG;
        }

        // Table of content
        this.elToc           = document.createElement('div');
        this.elToc.className = descClassNames.TOC;
        this.elTocList       = document.createElement('ul');
        this.elToc.appendChild(this.elTocList);
        this.elDesc.appendChild(this.elToc);
        this.buildToc();


        // Empty item in description
        this.elEmptyDescItem = document.createElement('div');
        this.elEmptyDescItem.className = descClassNames.ITEM;
        this.elDesc.appendChild(this.elEmptyDescItem);
        this.elLastItem = this.elEmptyDescItem;


        // Prepare description for question
        this.createQuestionDescElements();

        // Vertical splitter
        this.elVSplit        = document.createElement('div');
        this.elVSplit.className = descClassNames.SPLITTER_V;
        this.elDesc.appendChild(this.elVSplit);

        // Insert the description element after the editor
        this.elEditor.parentNode.insertBefore(this.elDesc, this.elEditor.nextSibling);
        this.domResources.push(this.elDesc);

        // Insert the debug window after the description
        if (this.elDebug) {
            this.elDesc.parentNode.insertBefore(this.elDebug, this.elDesc.nextSibling);
            this.domResources.push(this.elDebug);
        }

        // Horizontal splitter just before the description
        this.elHSplit        = document.createElement('div');
        this.elHSplit.className = descClassNames.SPLITTER_H;
        this.elEditor.parentNode.insertBefore(this.elHSplit, this.elDesc);
        this.domResources.push(this.elHSplit);

        // Search
        this.searchResults = null;

        // Listen events
        this.listen();

        // Resize
        this.resize();

        return this;
    }

    /**
     * Log the text in the debugger
     *
     * @param {String} text Text to write
     * @chainable
     */
    Description.prototype.log = function log(text) {
        if (!this.elDebug) {
            return this;
        }
        var newLine = document.createElement('p');
        newLine.appendChild(document.createTextNode(text));
        this.elDebug.appendChild(newLine);
        newLine.scrollIntoView(true);
    };

    /**
     * Create the elements for the question description
     */
    Description.prototype.createQuestionDescElements = function createQuestionDescElements() {
        var self = this;

        // Go to previous
        this.elGoToPrevious     = document.createElement('a');
        this.elGoToPrevious.href = '#';
        this.elGoToPrevious.setAttribute('data-linkTo', '__previous_question__');
        this.elGoToPrevious.appendChild(document.createTextNode(translate('description.previous')));

        // Shortcut of the question
        this.elQuestionName = document.createElement('h1');

        // Command on responses
        this.elResponsesInsert  = document.createElement('input');
        this.elResponsesInsert.setAttribute('type', 'button');
        this.elResponsesInsert.setAttribute('value', translate('description.insertResponsesRange'));
        this.elResponsesInsert.onclick = function onClickInsert() {
            self.insertResponsesRange();
        };
        this.elResponsesSearch = document.createElement('input');
        this.elResponsesSearch.setAttribute('type', 'search');
        this.elResponsesSearch.setAttribute('placeholder', translate('description.searchResponses'));
        attachSearchEvent(this.elResponsesSearch, function onSearchResponses() {
            self.filterResponses(this.value);
        });

        this.elResponsesCommand = document.createElement('div');
        this.elResponsesCommand.setAttribute('class', classNames.description.RESPONSES_COMMAND);
        this.elResponsesCommand.appendChild(this.elResponsesSearch);
        this.elResponsesCommand.appendChild(this.elResponsesInsert);

        // Responses
        this.elResponses = document.createElement('select');
        this.elResponses.setAttribute('multiple', 'multiple');
        this.elResponses.setAttribute('size', 9);

        // Parent loop
        this.elParentLoopCaptionTitle = document.createElement('h2');
        this.elParentLoopCaptionTitle.appendChild(document.createTextNode(translate('description.parentLoop')));
        this.elParentLoopCaption = document.createElement('a');
        this.elParentLoopCaption.setAttribute('href', '#');

        // Caption
        this.elQuestionCaptionTitle = document.createElement('h2');
        this.elQuestionCaptionTitle.appendChild(document.createTextNode(translate('description.caption')));
        this.elQuestionCaption = document.createElement('p');

        // Type
        this.elQuestionTypeTitle = document.createElement('h2');
        this.elQuestionTypeTitle.appendChild(document.createTextNode(translate('description.type')));
        this.elQuestionType = document.createElement('p');

        // Min
        this.elQuestionMinTitle = document.createElement('h2');
        this.elQuestionMinTitle.appendChild(document.createTextNode(translate('description.minValue')));
        this.elQuestionMin = document.createElement('p');

        // Max
        this.elQuestionMaxTitle = document.createElement('h2');
        this.elQuestionMaxTitle.appendChild(document.createTextNode(translate('description.maxValue')));
        this.elQuestionMax = document.createElement('p');


        // Final build
        this.elQuestionDescItem = document.createElement('div');
        this.elQuestionDescItem.appendChild(this.elGoToPrevious);
        this.elQuestionDescItem.appendChild(this.elQuestionName);
        this.elQuestionDescItem.appendChild(this.elResponsesCommand);
        this.elQuestionDescItem.appendChild(this.elResponses);
        this.elQuestionDescItem.appendChild(this.elParentLoopCaptionTitle);
        this.elQuestionDescItem.appendChild(this.elParentLoopCaption);
        this.elQuestionDescItem.appendChild(this.elQuestionCaptionTitle);
        this.elQuestionDescItem.appendChild(this.elQuestionCaption);
        this.elQuestionDescItem.appendChild(this.elQuestionTypeTitle);
        this.elQuestionDescItem.appendChild(this.elQuestionType);
        this.elQuestionDescItem.appendChild(this.elQuestionMinTitle);
        this.elQuestionDescItem.appendChild(this.elQuestionMin);
        this.elQuestionDescItem.appendChild(this.elQuestionMaxTitle);
        this.elQuestionDescItem.appendChild(this.elQuestionMax);

        this.elQuestionDescItem.className = descClassNames.ITEM;
    };

    /**
     * Add event listener
     */
    Description.prototype.listen = function listenEvents() {
        var self = this,
            instance = this.instance,
            namespace = instance.options && instance.options.namespace,
            hasOverflow = false,
            buffer;

        // Add overflow on parent
        function addOverflow() {
            if (hasOverflow) return;
            self.elEditor.parentNode.style.overflow = "hidden";
            hasOverflow = true;
        }

        // Remove the overflow on parent
        function removeOverflow() {
            self.elEditor.parentNode.style.overflow = "";
            hasOverflow = false;
        }

        // Catch the click on the link (use the bubblization)
        CodeMirror.on(self.elDesc, 'click', function onLinkClick(e) {
            var el     = e.srcElement || e.target,
                linkTo = el.getAttribute("data-linkto"),
                map, keyword, member, item;
            if (linkTo) {
                map = (linkTo.indexOf('versions.') !== 0) ?  linkTo.split('.') : ['versions', linkTo.replace('versions.', '')];
                keyword = map.length > 1 ? map[1] : map[0];
                member = map.length > 1 ? map[0] : null;
                if (keyword === '__previous_question__') {
                    if (self.questionNavHistory.length) {
                        self.displayQuestion(self.questionNavHistory.pop());
                    }
                    return;
                }
                if (member === '__question__') {
                    self.saveQuestionToHistory();
                    searchAndDisplayDescription((instance.options &&
                    instance.options.dictionary &&
                    instance.options.dictionary.questions), {
                        string  : keyword
                    });
                    return;
                }
                item = askiaScript.find(keyword, member);
                if (item) {
                    self.display(item);
                }
            }
        });

        // Resize the description
        CodeMirror.on(self.elHSplit, 'mousedown', function resizeDescription(e) {
            //noinspection JSValidateTypes
            if (e.which !== 1) { // Press the left mouse button
                return;
            }

            var startTop  = parseInt(self.elHSplit.style.top, 10),
                y         = (e.pageY - startTop);
            disableSelection();
            addClass(self.elHSplit, descClassNames.SPLITTER_RESIZING);

            // When moving the splitter
            function moveHSplitter(e) {
                self.elHSplit.style.top = (e.pageY - y) + 'px';
            }

            // When finish the resizing
            function endHResizing() {
                CodeMirror.off(document.body, 'mousemove', moveHSplitter);
                CodeMirror.off(document.body, 'mouseup', endHResizing);
                removeClass(self.elHSplit, descClassNames.SPLITTER_RESIZING);
                enableSelection();


                var parent       = self.elEditor.parentNode,
                    parentTop    = parent.offsetTop,
                    parentHeight = parent.offsetHeight,
                    splitterTop  = parseInt(self.elHSplit.style.top, 10),
                    editorHeight = splitterTop - parentTop,
                    descHeight   = parentHeight - editorHeight;



                // Fix the sizes
                if (editorHeight < 100) {
                    editorHeight = 100;
                    descHeight   = parentHeight - editorHeight;
                }
                if (descHeight < 100) {
                    descHeight = 100;
                }

                parent.style.height = parentHeight + "px";
                self.elDesc.style.height = descHeight + 'px';
                self.resize();
                parent.style.height = "";
            }

            CodeMirror.on(document.body, 'mousemove', moveHSplitter);
            CodeMirror.on(document.body, 'mouseup', endHResizing);
        });

        // Resize the toc
        CodeMirror.on(self.elVSplit, 'mousedown', function resizeToc(e) {
            if (e.which !== 1) { // Press the left mouse button
                return;
            }

            var startLeft  = parseInt(self.elVSplit.style.left, 10),
                x         = (e.pageX - startLeft);

            disableSelection();
            addClass(self.elVSplit, descClassNames.SPLITTER_RESIZING);

            // When moving the splitter
            function moveVSplitter(e) {
                self.elVSplit.style.left = (e.pageX - x) + 'px';
            }

            // When finish the resizing
            function endVResizing() {
                CodeMirror.off(document.body, 'mousemove', moveVSplitter);
                CodeMirror.off(document.body, 'mouseup', endVResizing);
                removeClass(self.elVSplit, descClassNames.SPLITTER_RESIZING);
                enableSelection();


                var parent       = self.elDesc,
                    parentLeft   = parent.offsetLeft,
                    parentWidth  = parent.offsetWidth,
                    splitterLeft = parseInt(self.elVSplit.style.left, 10),
                    tocWidth     = splitterLeft - parentLeft,
                    tocItemWidth = parentWidth - tocWidth;

                // Fix the sizes
                if (tocItemWidth < 200) {
                    tocItemWidth = 200;
                    tocWidth   = parentWidth - tocItemWidth;
                }
                if (tocWidth < 200) {
                    tocWidth = 200;
                }

                self.elToc.style.width = tocWidth + 'px';
                self.resize();
            }

            CodeMirror.on(document.body, 'mousemove', moveVSplitter);
            CodeMirror.on(document.body, 'mouseup', endVResizing);
        });

        // Listen resizing on parent element
        CodeMirror.on(window, 'resize', throttle(function resize() {
            addOverflow();
            this.resize();
            clearTimeout(buffer);
            buffer = setTimeout(removeOverflow, 100);
        }, 50, self));

        // Enable the contextual listener (by default)
        instance.initContextualListener();

        instance.on('askiaTokenFound', function(token) {
            instance.description.display(token);
        });
    };

    /**
     * Filter the toc
     * @param {String} value Value to search
     */
    Description.prototype.filter = function filter(value) {
        var self = this;

        if (!value) {
            removeClass(self.elTocList, descClassNames.FILTERED);
            return self;
        }

        var i, l, item, parentList, toggler;

        if (self.searchResults && self.searchResults.length) {
            for (i = 0, l = self.searchResults.length; i < l; i++) {
                item = self.searchResults[i];
                removeClass(item, descClassNames.FOUND);
                removeClass(item.parentNode.parentNode, descClassNames.FOUND);
            }
        }
        self.searchResults = self.elTocList.querySelectorAll('li[data-search*=' + value.toLowerCase() + ']');

        if (self.searchResults && self.searchResults.length) {
            addClass(self.elTocList, descClassNames.FILTERED);
            for (i = 0, l = self.searchResults.length; i < l; i += 1) {
                item       = self.searchResults[i];
                parentList = item.parentNode;
                addClass(item, descClassNames.FOUND);
                addClass(parentList.parentNode, descClassNames.FOUND);
                // li > p
                toggler = (parentList.parentNode.childNodes[0].tagName.toLowerCase() ==='p') ?
                    parentList.parentNode.childNodes[0].querySelector('a.' + descClassNames.TOGGLE)
                    : null;
                if (toggler) {
                    addClass(toggler, descClassNames.TOGGLE_EXPAND);
                    parentList.style.display = 'block';
                }
            }
        }
        return self;
    };

    /**
     * Build the toc
     */
    Description.prototype.buildToc = function buildToc() {
        var self       = this,
            namespace  = self.instance.options && self.instance.options.namespace,
            dictionary = askiaScript.dictionary,
            builtin    = dictionary.builtin,
            members    = dictionary.members,
            arrMembers = [],
            key;

        for (key in types) {
            if (types.hasOwnProperty(key) && key !== 'ANY_TYPE') {
                arrMembers.push(types[key]);
            }
        }
        arrMembers = arrMembers.sort();

        // Toggle list (collapse/expand)
        function toggle(e) {
            var el      = e.srcElement || e.target,
                sublist = el.parentNode.parentNode.childNodes[1]; // > p > li > ul

            e.preventDefault();
            if (!el.getAttribute('data-linkto')) { // Don't stop propagation on linkto element
                e.stopPropagation();
            }

            //noinspection JSValidateTypes
            if (!hasClass(el, descClassNames.TOGGLE)) {
                el = el.parentNode.childNodes[0]; // > p > a
            }

            //noinspection JSValidateTypes
            if (hasClass(el, descClassNames.TOGGLE_EXPAND)) {
                //noinspection JSValidateTypes
                removeClass(el, descClassNames.TOGGLE_EXPAND);
                sublist.style.display = 'none';
            } else {
                //noinspection JSValidateTypes
                addClass(el, descClassNames.TOGGLE_EXPAND);
                sublist.style.display = 'block';
            }
            return false;
        }

        // Build sub-list
        function buildList(name, title, data) {
            var root       = document.createElement('li'),
                subRoot    = document.createElement('p'),
                titleLink  = askiaScript.createDescLink(title, 'core.' + name),
                toggler,
                innerList,
                linkToPrefix = name === 'builtin' ? '' : name + '.';

            if (data) {
                innerList = document.createElement('ul');
                forEach(data, function buildTocForEachItem(item) {
                    if (!askiaScript.availableInNS(item, namespace)) {
                        return;
                    }
                    if (!item.name || item.deprecated || item.base === bases.SNIPPET) {
                        return;
                    }
                    var li      = document.createElement('li'),
                        linkTo  = linkToPrefix + item.name;

                    li.setAttribute('data-search', item.name.toLowerCase());
                    li.appendChild(askiaScript.createDescLink(item.name, linkTo));
                    innerList.appendChild(li);
                });

                toggler = document.createElement('a');
                toggler.href = '#';
                toggler.className = descClassNames.TOGGLE;
                CodeMirror.on(toggler, 'click', toggle);
                subRoot.appendChild(toggler);
            }

            titleLink.className = descClassNames.TITLE_LINK;
            subRoot.appendChild(titleLink);
            root.appendChild(subRoot);
            if (innerList) {
                innerList.style.display = 'none';
                root.appendChild(innerList);
            }
            root.setAttribute('data-search', title.toLowerCase());
            self.elTocList.appendChild(root);
        }


        function addSearchInput() {
            var root       = document.createElement('li'),
                input      = document.createElement('input');
            root.className = descClassNames.FOUND;
            input.setAttribute('type', 'search');
            input.setAttribute('placeholder', translate('description.searchKeywords'));
            attachSearchEvent(input, function onSearch() {
                self.filter(this.value);
            });
            root.appendChild(input);
            self.elTocList.appendChild(root);
        }

        addSearchInput();
        buildList('versions', translate('types.releaseNotes'));
        buildList('builtin', translate('types.builtin'), builtin);
        forEach(arrMembers, function buildListForEachMembers(name) {
            if (members[name]) {
                var memberItem = askiaScript.find(name, 'core');
                if (!memberItem || askiaScript.availableInNS(memberItem, namespace)) {
                    buildList(name, translate('types.' + name), members[name]);
                }
            }
        });
    };

    /**
     * Fix the position of splitters
     * @chainable
     */
    Description.prototype.fixSplitters = function fixSplitters() {
        if (!this.elHSplit || !this.elVSplit) {
            return this;
        }

        var editorWidth  = this.elEditor.offsetWidth,
            editorHeight = this.elEditor.offsetHeight,
            editorTop    = this.elEditor.offsetTop,
            tocWidth     = this.elToc.offsetWidth,
            descHeight   = this.elDesc.offsetHeight;

        this.elHSplit.style.width = editorWidth + 'px';
        this.elHSplit.style.top   = (editorHeight + editorTop) + 'px';
        this.elHSplit.style.left  = this.elEditor.offsetLeft + 'px';

        this.elVSplit.style.top  = (editorHeight + editorTop) + 'px';
        this.elVSplit.style.left = tocWidth + 'px';
        this.elVSplit.style.height = descHeight + 'px';
        return this;
    };

    /**
     * Fix the size of the content
     * @chainable
     */
    Description.prototype.fixContent = function fixContent() {
        var tocWidth    = this.elToc.offsetWidth,
            parentWidth = this.elToc.parentNode.offsetWidth,
            remainWidth = parentWidth - tocWidth;

        if (this.elLastItem) {
            this.elLastItem.style.width = remainWidth + 'px';
        }

        return this;
    };

    /**
     * Resize the editor and the description node
     * @chainable
     */
    Description.prototype.resize = function resizeDescription() {
        var descHeight   = this.elDesc.offsetHeight,
            parentHeight = this.elEditor.parentNode.offsetHeight,
            editorTop    = this.elEditor.offsetTop,
            remainHeight = parentHeight - (descHeight + editorTop);

        if (this.elDebug) {
            remainHeight -= this.elDebug.offsetHeight;
        }

        this.instance.setSize(null, remainHeight);

        this.fixContent();
        this.fixSplitters();

        return this;
    };

    /**
     * Save the the current display question to the history
     */
    Description.prototype.saveQuestionToHistory = function saveQuestionToHistory() {
        var l = this.questionNavHistory.length;
        if (l && this.questionNavHistory[l - 1] === this.currentDisplayQuestion) {
            return;
        }
        this.questionNavHistory.push(this.currentDisplayQuestion);
    };

    /**
     * Reset the current display question
     * @chainable
     */
    Description.prototype.resetCurrentDisplayQuestion = function resetCurrentDisplayQuestion() {
        this.currentDisplayQuestion = null;
        this.questionNavHistory = [];
        return this;
    };

    /**
     * Clear the current displayed description
     * @param {Boolean} [clearAll] Clear all description included the empty item
     * @chainable
     */
    Description.prototype.clear = function clearDescription(clearAll) {
        var i, l, elem;
        if (this.elDesc && this.elDesc.hasChildNodes()) {
            this.elLastItem = null;

            // Clear all first
            for (i = 0, l = this.elDesc.childNodes.length; i < l; i += 1) {
                elem = this.elDesc.childNodes[i];
                if (elem && hasClass(elem, descClassNames.ITEM)) {
                    this.elDesc.removeChild(elem);
                }
            }

            // Add the empty item if require (default behaviour)
            if (!clearAll) {
                this.elDesc.appendChild(this.elEmptyDescItem);
                this.elLastItem = this.elEmptyDescItem;
                this.fixContent();
            }
        }
        return this;
    };

    /**
     * Display the description of the specify item
     *
     * @param {Object} item Suggestion item
     */
    Description.prototype.display = function displayDescription(item) {
        var descElement = item.description && item.description.element,
            hasDesc     = !!descElement,
            questionName;

        // Reset the latest token info
        this.instance.contextualListener.lastTokenInfo = null;

        // Use only one desc element for all questions
        // Update the desc element using the question information
        if (item.base === bases.QUESTION) {
            descElement = this.elQuestionDescItem;
            hasDesc     = true;
            questionName = item.name;
            if (questionName === this.currentQuestion) {
                questionName += " (CurrentQuestion)";
            }
            questionName += " (" + translate('types.' + item.type) + ")";
            this.elQuestionName.innerHTML = questionName;
            this.displayQuestion(null);

            // Send the message to which indicates the current selected question
            if (this.questionsCache[item.name.toLocaleLowerCase()]) {
                this.displayQuestion(this.questionsCache[item.name.toLocaleLowerCase()]);
            } else {
                this.instance.sendMessage('selectquestion_' + item.name);
            }
        } else {
            this.resetCurrentDisplayQuestion();
        }

        // Clear the content
        this.clear(hasDesc);

        if (hasDesc) {
            this.elDesc.appendChild(descElement);
            this.elLastItem = descElement;
            this.fixContent();
        }
    };

    /**
     * Display the description of the question
     *
     * @param {Object} question Question
     */
    Description.prototype.displayQuestion = function displayQuestion(question) {
        this.currentDisplayQuestion = question;

        if (question && question.shortcut && !this.questionsCache[question.shortcut.toLowerCase()]) {
            this.questionsCache[question.shortcut.toLowerCase()] = question;
        }

        var i, l, str = [],
            shortcut  = question && question.shortcut,
            questionName = shortcut || '',
            responses = question && question.responses,
            parentLoop = question && (question.parentLoop || question.parentloop);

        this.elGoToPrevious.style.display =  this.questionNavHistory.length ? 'block' : 'none';
        if (question) {
            if (shortcut && this.currentQuestion === shortcut) {
                questionName += " (CurrentQuestion)";
            }
            questionName += " (" + translate('types.' + question.type) + ")";
        }
        this.elQuestionName.innerHTML = questionName;

        this.elResponses.innerHTML = '';
        if (responses) {
            for (i = 0, l = responses.length; i < l; i++) {
                str.push(this.createResponseOption(responses[i]));
            }
            setSelectOptions(this.elResponses, str.join(''));
        }
        if (responses) {
            l = responses.length;
            this.elResponses.setAttribute('size', (l > 9) ? 9 : l);
        }
        this.elResponses.style.display = (responses) ? 'block' : 'none';
        this.elResponsesCommand.style.display = (responses) ? 'block' : 'none';

        // Parent loop
        this.elParentLoopCaptionTitle.style.display = (parentLoop) ? 'block' : 'none';
        this.elParentLoopCaption.style.display = (parentLoop) ? 'block' : 'none';
        this.elParentLoopCaption.innerHTML = parentLoop || '';
        if (parentLoop) {
            this.elParentLoopCaption.setAttribute('data-linkto', '__question__.' + parentLoop.toLowerCase());
        }
        // Caption
        this.elQuestionCaptionTitle.style.display = (question && question.caption) ? 'block' : 'none';
        this.elQuestionCaption.innerHTML = question && question.caption || '';
        // Type
        this.elQuestionTypeTitle.style.display = (question) ? 'block' : 'none';
        this.elQuestionType.innerHTML = (question && question.type && translate('types.' + question.type)) || '';
        // Min
        this.elQuestionMinTitle.style.display = (question && 'min' in question) ? 'block' : 'none';
        this.elQuestionMin.innerHTML = (question && 'min' in question) ? question.min : '';
        // Max
        this.elQuestionMaxTitle.style.display = (question && 'max' in question) ? 'block' : 'none';
        this.elQuestionMax.innerHTML = (question && 'max' in question) ? question.max : '';
    };

    /**
     * Create the HTML option string for the specified response
     * @param {Object} response Response object
     * @param {Boolean} [selected=false] Select the response by default
     * @return {String} HTML Option
     */
    Description.prototype.createResponseOption = function createResponseOption(response, selected) {
        var caption = response.index,
            selectedAttr = (selected) ? ' selected="selected"' : '';
        if (response.index != response.entryCode) {
            caption += ' - (' + response.entryCode + ') ';
        }
        caption += ' - ' + response.caption;
        return '<option value="' + response.index + '"' + selectedAttr  + '>' + caption + '</option>';
    };

    /**
     * Build a range of number
     *
     * Instead of {1;2;3} => {1 To 3}
     * Instead of {1;2;3;5;6;7;10} => {1 To 3; 5 To 7; 10}
     *
     * @param {Number[]} selections Selections
     * @returns {string} Range
     */
    Description.prototype.buildResponsesRange = function buildResponsesRange(selections) {
        var finalRange = [],
            fallback   = [],
            start,
            end,
            current,
            previous, i, l;

        for (i = 0, l = selections.length; i < l; i++) {
            current = selections[i];

            if (start && end && previous) {
                if ((previous + 1) === current) {
                    fallback.push(current);
                    end++;
                } else if ((end - start) > 1) {
                    finalRange.push(start + ' To ' + end);
                    fallback = [current];
                    previous = null;
                } else {
                    finalRange.push(fallback.join(';'));
                    fallback = [current];
                    previous = null;
                }
            } else {
                fallback.push(current);
            }

            // Set the start of the range
            if (!previous) {
                start = current;
                end   = current;
            }
            if (i < (l-1)) {
                previous = current;
            }
        }

        // Verify the latest range
        if (fallback.length && previous && current && start && end) {
            if ((previous + 1) === current && (end - start) > 1) {
                finalRange.push(start + ' To ' + end);
                fallback = [];
            }
        }

        // Add fallback if necessary
        if (fallback.length) {
            finalRange.push(fallback.join(';'));
        }

        return finalRange.join(';');
    };

    /**
     * Filter the responses using the value
     * @param {String} value Value to search
     */
    Description.prototype.filterResponses = function filterResponses(value) {
        var rg        = value ? new RegExp(escapeRegExp(value), "i") : null,
            responses =  (this.currentDisplayQuestion && this.currentDisplayQuestion.responses) || [],
            response,
            str       = [],
            options = this.elResponses.options,
            isSelected = {},
            i, l;

        // Search all selected options
        for (i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                isSelected[parseInt(options[i].value, 10)] = true;
            }
        }

        // Build the HTML options
        for (i = 0, l = responses.length; i < l; i++) {
            response = responses[i];
            if (isSelected[response.index] || !rg || rg.exec(response.index + ' ' + response.entryCode + ' ' + response.caption)) {
                str.push(this.createResponseOption(response, isSelected[response.index]));
            }
        }
        setSelectOptions(this.elResponses, str.join(''));
    };

    /**
     * Insert selected responses range
     */
    Description.prototype.insertResponsesRange = function insertResponsesRange() {
        var instance        = this.instance,
            cur             = instance.getCursor(),
            token           = instance.getTokenAt(cur),
            isCurveScope    =  (token && token.state && token.state.currentScope && token.state.currentScope.curve),
            options         = this.elResponses.options,
            selectedOptions = [], i, l, text;
        for (i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                selectedOptions.push(parseInt(options[i].value, 10));
            }
        }
        if (!selectedOptions.length) {
            return;
        }
        text = this.buildResponsesRange(selectedOptions.sort());
        if (!isCurveScope) {
            text = '{' + text + '}';
        }
        instance.insertText(text, true);
    };

    /**
     * Remove all dom element and events
     */
    Description.prototype.destroy = function destroyDescription() {
        var i, l, element;
        if (this.domResources) {
            for (i = 0, l = this.domResources.length; i < l; i += 1) {
                element = this.domResources[i];
                element.parentNode.removeChild(element);
            }
        }
        CodeMirror.off(window, 'resize', this.resize);
    };

    /**
     * Listen the current editor context (text selected or in the context)
     * @param {CodeMirror} instance Instance of the CodeMirror
     * @constructor
     */
    function ContextualListener(instance) {
        this.instance       = instance;
        // Latest selected token/line/text
        this.lastTokenInfo  = null;
    }

    /**
     * Return false if the token is not valid (comments or string)
     * @param token
     */
    ContextualListener.prototype.isValidToken = function isValidToken(token) {
        return (token && token.type && token.type !== classNames.COMMENT && token.type !== classNames.STRING);
    };

    /**
     * Compare the current token info with the latest one
     * Return true if the token info is the same
     * @param current
     */
    ContextualListener.prototype.isSameTokenInfo = function isSameTokenInfo(current) {
        var prev = this.lastTokenInfo;
        return !(!prev || prev.line !== current.line || prev.start !== current.start || prev.end !== current.end || prev.string !== current.string);
    };

    /**
     * Search (in collection) and trigger the `askiaTokenFound` event if the token is found
     * @param {Array} collection Collection from where to search the token
     * @param {Object} tokenInfo Token to find in the collection
     */
    ContextualListener.prototype.fireWhenFound = function fireWhenFound(collection, tokenInfo) {
        collection = collection || [];
        var string = removeQuestionDelimiters(tokenInfo.string),
            rg = getTokenRegexp(string, true), // Exact match
            i, l, item, match,
            instance = this.instance,
            namespace = instance.options && instance.options.namespace;

        // Filter the match items
        for (i = 0, l = collection.length; i < l; i += 1) {
            item = collection[i];
            if (shouldBeDisplay(item, rg) && !item.snippet && askiaScript.availableInNS(item, namespace)) {
                match = item;
                if (!match.deprecated) {
                    break;
                }
            }
        }

        // Display the description of the current selection
        if (match) {
            CodeMirror.signal(instance, 'askiaTokenFound', match);
            // Register the latest token info right now
            this.lastTokenInfo = tokenInfo;
        }
    };

    /**
     * Listen the editor
     */
    ContextualListener.prototype.listen = function () {
        var self = this,
            instance = this.instance;

        // Listen when the cursor change
        instance.on('cursorActivity', function onCursorActivity() {
            // Only for AskiaScriptMode
            if (!instance.isAskiaScriptMode()) {
                return;
            }
            var cur                 = instance.getCursor(),
                token               = instance.getTokenAt(cur),
                tokenInfo           = {
                    line    : cur.line,
                    start   : token && token.start,
                    end     : token && token.end,
                    string  : token && token.string
                },
                searchQuestion;

            // Don't fire it twice
            if (self.isSameTokenInfo(tokenInfo)) {
                return;
            }

            searchQuestion = new ContextualQuestionToken(self, cur.line, token);
            if (searchQuestion.moonWalkThroughQuestion()) {
                tokenInfo.start = searchQuestion.questionToken.start;
                tokenInfo.end = searchQuestion.questionToken.end;
                tokenInfo.string = searchQuestion.questionToken.string;
                // Already displayed
                if (self.isSameTokenInfo(tokenInfo)) {
                    return;
                }
                self.fireWhenFound((instance.options &&
                                        instance.options.dictionary &&
                                        instance.options.dictionary.questions), tokenInfo);
                return;
            }

            if (!self.isValidToken(token)) {
                return;
            }

            // Search using the current context
            self.fireWhenFound(askiascriptHint(instance), tokenInfo);
        });
    };

    /**
     * Reset the cache
     */
    ContextualListener.prototype.reset = function () {
        this.lastTokenInfo  = null;
    };

    /**
     * Manage the research of the context question token
     * @param {ContextualListener} contextualListener
     * @param {Number} line
     * @param {Object} token
     * @constructor
     */
    function ContextualQuestionToken(contextualListener, line, token) {
        this.contextualListener = contextualListener;
        this.startToken = token;
        this.line = line;
        this.operatorCount = 0;
        this.currentToken = token;
        this.questionToken = null;
        this.countOperator(this.startToken);
    }

    // Increment or not the operator count
    ContextualQuestionToken.prototype.countOperator = function countOperator(token) {
        if (!token || token.type !== classNames.OPERATOR) {
            return;
        }
        // On curve bracket don't count the TO operator {1 TO 5} for example
        if (token.state && token.state.currentScope && token.state.currentScope.curve) {
            return;
        }
        this.operatorCount++;
    };

    // Search while found a contextual question token
    // Return the question token when it's found
    ContextualQuestionToken.prototype.moonWalkThroughQuestion = function moonWalkThroughQuestion() {
        if (this.startToken.type === classNames.QUESTION) {
            return null;
        }
        if (!this.currentToken) {
            return null;
        }
        var cur = {
            line : this.line,
            ch   : this.currentToken.start - 1
        }, prev,
        instance = this.contextualListener.instance;

        if (cur.ch < 0) {
            this.currentToken = null;
            return null;
        }

        prev = instance.getTokenAt(cur);
        if (prev.start === this.currentToken.start) {
            this.currentToken = null;
            return null;
        }

        // Count the number of operator found
        this.countOperator(prev);
        if (this.operatorCount > 1) {
            this.currentToken = null;
            return null;
        }

        // Look if the current token allows to moonwalk again
        if (prev.type === classNames.QUESTION) {
            this.currentToken = prev;
            this.questionToken = prev;
            return this.questionToken;
        }

        if (prev.type && prev.type !== classNames.OPERATOR &&
            prev.type !== classNames.PUNCTUATION &&
            prev.type !== classNames.NUMBER &&
            prev.type !== classNames.STRING &&
            (prev.type || '').indexOf(classNames.MEMBER_PREFIX) === -1) {
            this.currentToken = null;
            return null;
        }

        this.currentToken = prev;
        return this.moonWalkThroughQuestion();
    };

    /**
     * Initialize the contextual listener
     */
    CodeMirror.prototype.initContextualListener = function () {
        if (!this.contextualListener) {
            this.contextualListener = new ContextualListener(this);
            this.contextualListener.listen();
        }
        return this;
    };

    /**
     * Indicates if the current innerMode is 'askiascript'
     */
    CodeMirror.prototype.isAskiaScriptMode = function () {
        var mode = this.getModeAt(this.getCursor());
        return (mode && mode.name === 'askiascript');
    };

    /**
     * Indicates if the current innerMode is 'xml' or 'html'
     */
    CodeMirror.prototype.isXmlLikeMode = function () {
        var mode = this.getModeAt(this.getCursor());
        return (mode && (mode.name === 'xml' || mode.name === 'html'));
    };

    /**
     * Send message to the executatble application
     * For Design.exe only, because it create a fake of AJAX request
     * @chainable
     */
    CodeMirror.prototype.sendMessage = function sendMessage(message) {
        var instance = this;
        // Only call it for the local exe
        if (instance.options.localExe) {
            var encodedMessage = encodeURIComponent(message);
            window.navigate("admsg_" + encodedMessage);
        }
    };

    /**
     * Trigger the compilation
     * This method is implemented by the method doLiveCompilation
     */
    CodeMirror.prototype.triggerCompile = function triggerCompile() {};

    /**
     * Activate the live compilation
     * @chainable
     */
    CodeMirror.prototype.doLiveCompilation = function doLiveCompilation() {
        var instance    = this,
            clearTimeout  = window.clearTimeout,
            setTimeout    = window.setTimeout,
            timeout       = null;

        // Compile the script using Design.exe
        function compile() {
            instance.save(); // Copy the current value to the textarea
                             // (Snapshot of the current state)
            instance.sendMessage('compile');
        }

        // Collect all variables
        function operateCompile() {
            instance.operation(compile);
        }

        // Trigger the change (do the operation) using timer (thread)
        function trigger() {
            clearTimeout(timeout);
            timeout   = setTimeout(operateCompile, 750);
        }

        // Make that method public
        instance.triggerCompile = trigger;

        // Register the change event once for all
        instance.on("change", trigger);

        // Ask Design.exe to compile the script once it's loaded
        setTimeout(compile, 250);

        return this;
    };

    /**
     * Manage the drop of question in the editor
     * (Specific for Design 5)
     * @param {String} shortcut Shortcut of the question to drop
     * @param {Number} left Position left of the cursor
     * @param {Number} top Position top of the cursor
     * @chainable
     */
    CodeMirror.prototype.doQuestionDrop = function doQuestionDrop(shortcut, left, top) {
        var instance = this,
            coords = instance.coordsChar({
                left : left,
                top  : top
            });
        instance.focus();
        instance.setSelection(coords);
        instance.replaceSelection(shortcut);
        instance.setCursor(coords.line, coords.ch + shortcut.length);
        return this;
    };

    /**
     * Insert text at the current cursor position, move the cursor at the end of text inserted
     * (Specific for Design 5)
     * @param {String} text Text to insert
     * @param {Boolean} [select=false] Select the inserted text
     * @chainable
     */
    CodeMirror.prototype.insertText = function insertText(text, select) {
        var instance = this,
            from  = instance.getCursor('from'),
            to = {
                line : from.line,
                ch   : from.ch + text.length
            };
        instance.focus();
        instance.replaceSelection(text);
        if (!select) {
            instance.setCursor(to);
        } else {
            instance.setSelection(from, to);
        }
        return this;
    };

    /**
     * Display the question information
     * (Specific for Design 5)
     * @param {Object} question Question to display
     * @chainable
     */
    CodeMirror.prototype.displayQuestion = function displayQuestion(question) {
        var instance = this;
        if (instance.description) {
            instance.description.displayQuestion(question);
        }
        return this;
    };

    /**
     * Clear all compilation error (remove all line widgets about error)
     * @chainable
     */
    CodeMirror.prototype.clearCompilationError = function clearCompilationError() {
        var instance = this;
        instance.clearGutter(classNames.GUTTER_ERRORS);
        return this;
    };

    /**
     * Create the marker to apply on gutter when there is an error
     * @param {Number} line Line number where the marker should be add
     * @param {String} message Error message
     * @return {*}
     */
    CodeMirror.prototype.setGutterMarkerError = function setGutterMarkerError (line, message) {
        var instance = this,
            marker = document.createElement("div");

        marker.className = classNames.GUTTER_ERROR;
        marker.title     = message;
        return instance.setGutterMarker(line, classNames.GUTTER_ERRORS, marker);
    };

    /**
     * Display compilation error
     *
     * @param {String} msg Message of the error
     * @param {Object} from Coordinates where the error start from
     * @param {Number} from.line Line number where the error start from
     * @param {Number} from.ch Index of the characters where the error start from
     * @param {Object} to Coordinates where the error end to
     * @param {Number} to.line Line number where the error end to
     * @param {Number} to.ch Index of the characters where the error end to
     * @param {Boolean} liveCompilation Indicates if the compilation is live
     * @chainable
     */
    CodeMirror.prototype.showCompilationError = function showCompilationError(msg, from, to, liveCompilation) {
        var instance = this;

        if (instance.isSuggesting && liveCompilation) {
            return instance;
        }

        instance.operation(function operationShowCompilationError() {
            instance.focus();
            instance.clearCompilationError();

            // Mark all error lines
            var i, l;
            for (i = from.line, l = to.line; i <= l; i++) {
                instance.setGutterMarkerError(i, msg);
            }


            // Select the error
            if (!liveCompilation) {
                instance.setSelection(from, to);
            }
        });
        return this;
    };

    /**
     * Enable suggest and auto-completion with snippets
     * @chainable
     */
    CodeMirror.prototype.suggest = function suggest() {

        // Enable the contextual listener (by default)
        this.initContextualListener();

        // Defined the lexical if not already done
        askiaScript.defineLexical(askiaScript.lexical);

        // Instance of the code mirror
        var instance 	= this,
            namespace   = instance.options && instance.options.namespace,
            snippets    = askiaScript.snippets,

        // DOM elements
            elEditor        = instance.getWrapperElement(),
            elSuggest 	    = document.createElement('div'),
            elSuggestList   = document.createElement('ul'),

        // Status
            range	 	    = {},
            cache    	    = [],
            displayed	    = [],
            selectedIndex   = -1,
            initialToken    = null,

        // Auto close some punctuation
            closeChars      = {
                'U+005B' : ']',
                'U+007B' : '}',
                // For IE
                '['      : ']',
                '{'      : '}'
            },

        // Latest event type
        // Because in certain cases the keyup are triggered twice
            lastEventType,
            lastEventKey,
            lastEventSeed,

        // Keycodes
            keyCodes = {
                BACKSPACE   : 8,
                TAB         : 9,
                ENTER       : 13,
                SHIFT       : 16,
                CTRL        : 17,
                ALT         : 18,
                META_LEFT   : 91,
                META_RIGHT  : 92,
                ESC         : 27,
                SPACE       : 32,
                PAGE_UP     : 33,
                PAGE_DOWN   : 34,
                UP          : 38,
                DOWN        : 40,
                A           : 65,
                Z           : 90,
                COLON		: 186,
                PERIOD      : 190
            };

        // domResources element
        this.domResources = [];

        // State of suggestion
        this.isSuggesting = false;

        // Creates the element to list suggestions
        elSuggest.appendChild(elSuggestList);


        elSuggest.className = senseClassNames.SENSE;
        document.body.appendChild(elSuggest);
        this.domResources.push(elSuggest);


        /**
         * Clear the list of suggestion
         */
        function clearList() {
            unselect();
            while (elSuggestList.hasChildNodes()) {
                elSuggestList.removeChild(elSuggestList.lastChild);
            }
            cache            = [];
            displayed 	     = [];
            range		     = {};
            initialToken     = null;
        }

        /**
         * Return the offset of element
         *
         * @param {HTMLElement} element
         * @return {Object} Offset of the element
         */
        function getOffset(element) {
            var rect = element.getBoundingClientRect();
            return {
                top     : rect.top + document.body.scrollTop,
                left    : rect.left + document.body.scrollLeft
            };
        }

        /**
         * Update the position of the suggestion box
         * @param {Object} [coord] Coordinate to place the box
         */
        function updatePosition(coord) {
            var pos = (coord) ?
                    instance.charCoords(coord) :
                    instance.cursorCoords(false),
                wrapperLeft  = (pos.left - 35),
                wrapperTop   = (pos.bottom + 5),
                wrapperWidth = elSuggest.offsetWidth,
                endWrapper   =  wrapperLeft + wrapperWidth,
                endEditor    = getOffset(elEditor).left + elEditor.offsetWidth;

            // Fix the left side
            if (endWrapper > endEditor) {
                wrapperLeft = endEditor - (wrapperWidth + 5);
            }

            elSuggest.style.left = wrapperLeft + "px";
            elSuggest.style.top  = wrapperTop + "px";
        }

        /**
         * Un-select the current suggestion
         */
        function unselect() {
            if (~selectedIndex) {
                removeClass(displayed[selectedIndex].element, senseClassNames.SELECTED);
            }
            // Keep the description visible
            // (instance.description && instance.description.clear());
            selectedIndex = -1;
        }

        /**
         * Select an element
         * @param {Number} index Index of the element in the displayed array
         */
        function select(index) {
            var element = displayed[index].element,
                item    = displayed[index].item,
                belowFold = (elSuggest.scrollTop + elSuggest.clientHeight < element.offsetTop + element.clientHeight),
                aboveFold = !belowFold && (elSuggest.scrollTop > element.offsetTop);

            unselect();
            addClass(element, senseClassNames.SELECTED);

            if (belowFold || aboveFold) {
                element.scrollIntoView(aboveFold);
            }
            selectedIndex = index;

            (instance.description && instance.description.display(item));
        }

        /**
         * Move the selection in the suggestions list
         * @param {Number} keyCode keyCode to find the good direction
         * @return {Boolean} Return true when a selection has been done.
         */
        function moveSelection(keyCode) {
            if (!instance.isSuggesting || !displayed.length) {
                return false;
            }

            var index   = selectedIndex,
                unit    = (keyCode === keyCodes.PAGE_UP || keyCode === keyCodes.PAGE_DOWN) ? 10 : 1;


            if (keyCode === keyCodes.DOWN || keyCode === keyCodes.PAGE_DOWN) {
                index += unit;
            } else if (keyCode === keyCodes.UP || keyCode === keyCodes.PAGE_UP) {
                index -= unit;
            }
            if (index >= displayed.length) {
                index = displayed.length - 1;
            } else if (index < 0) {
                index = 0;
            }

            select(index);
            return true;
        }

        /**
         * Create a suggestion HTML element
         * @param {Object} item Suggestion item
         * @param {Boolean} visible Indicates if the item should be visible
         * @return {HTMLElement} Return the created HTML element
         */
        function createSuggestionElement(item, visible) {
            var li       = document.createElement('li'),
                spanIcon = document.createElement('span'),
                spanName = document.createElement('span'),
                spanType,
                spanArgs,
                spanArg,
                args,
                i, l,
                str,
                repeatable = '';

            if (item.base === bases.FUNCTION || item.base === bases.METHOD) {
                spanArgs = document.createElement('span');
                spanArgs.className = senseClassNames.ITEM_ARGS;
                spanArgs.appendChild(document.createTextNode('('));
                //noinspection JSUnresolvedVariable
                args = item.args;
                if (args && args.length) {
                    for (i = 0, l = args.length; i < l; i++) {
                        spanArg = document.createElement('span');
                        spanArg.className = senseClassNames.ITEM_ARG;
                        //noinspection JSUnresolvedVariable
                        repeatable = args[i].repeatable ? '*' : '';

                        str = args[i].name + ':' + translate('types.' + args[i].type) + repeatable;
                        //noinspection JSUnresolvedVariable
                        if (args[i].opt) {
                            str = '[' + str + ']';
                        }
                        if (i > 0) {
                            str = ', ' + str;
                        }
                        spanArg.appendChild(document.createTextNode(str));
                        spanArgs.appendChild(spanArg);
                    }
                }

                spanArgs.appendChild(document.createTextNode(')'));
            }


            spanIcon.className = senseClassNames.ITEM_ICON;

            spanName.appendChild(document.createTextNode(item.name));
            if (item.type && item.base !== bases.CONSTANT) {
                spanType = document.createElement('span');
                spanType.appendChild(document.createTextNode(':' + translate('types.' + item.type)));
                spanType.className = senseClassNames.ITEM_TYPE;
            }
            if (item.base === bases.SNIPPET) {
                spanType = document.createElement('span');
                spanType.appendChild(document.createTextNode(' ' + translate('description.snippet')));
                spanType.className = senseClassNames.ITEM_SNIPPET_TAB;
            }

            li.appendChild(spanIcon);
            li.appendChild(spanName);
            if (spanArgs) {
                li.appendChild(spanArgs);
            }
            if (spanType) {
                li.appendChild(spanType);
            }

            li.onclick = function (e) {
                /* e.stopPropagation();
                 itemClick(item);
                 instance.focus();*/
                e.stopPropagation();
                insert(item);
                close();
                autoComplete();
                instance.focus();
            };

            updateClass(visible, li, senseClassNames.VISIBLE);
            addClass(li, (item.base === bases.QUESTION) ? item.base + ' ' + item.type : item.base);

            return li;
        }

        /**
         * Load all suggestions
         * @param {Array} suggestions All suggestion items
         * @param {RegExp} rg Regular expression to find the text of the current token
         * @return {Boolean} Return true when the suggestions has been loaded, false otherwize
         */
        function loadSuggestions(suggestions, rg) {
            if (!suggestions || (!suggestions.hints && !suggestions.length) ||
                (suggestions.hints && (!suggestions.list || !suggestions.list.length))) {
                close();
                return false;
            }

            var list = suggestions.hints ? suggestions.list : suggestions,
                isAsMode = !suggestions.hints, // Is Askia Mode
                i, l, item, li, visible;

            for (i = 0, l = list.length; i < l; ++i) {
                item = list[i];
                if (!isAsMode) {
                    item = {
                        name : list[i],
                        base : 'const'
                    };
                }
                if (!isAsMode || (item && item.name && !item.deprecated && askiaScript.availableInNS(item, namespace))) {
                    visible = shouldBeDisplay(item, rg);
                    li = createSuggestionElement(item, visible);
                    elSuggestList.appendChild(li);
                    cache.push({
                        item    : item,
                        element : li
                    });
                    if (visible) {
                        displayed.push(cache[cache.length - 1]);
                    }
                }
            }

            unselect();
            return true;
        }

        /**
         * Close the suggestions list
         */
        function close() {
            elSuggest.style.display = 'none';
            clearList();
            instance.isSuggesting = false;
        }

        /**
         * Open the suggestions list
         */
        function open() {
            if (!instance.isSuggesting) {
                elSuggest.style.display = displayed.length ? 'block' : 'none';
                updatePosition();
                if (displayed.length) {
                    displayed[0].element.scrollIntoView();
                }
            }
            instance.isSuggesting = displayed.length ? true : false;
        }

        /**
         * Filter the list of suggestions
         * @param {RegExp} rg Regular expression of the current token
         */
        function filter(rg) {
            unselect();
            displayed = [];
            for (var i = 0, l = cache.length; i < l; ++i) {
                var obj = cache[i],
                    item = obj.item,
                    element = obj.element,
                    visible = shouldBeDisplay(item, rg);
                if (visible) {
                    displayed.push(obj);
                }
                updateClass(visible, element, senseClassNames.VISIBLE);
            }
            elSuggest.style.display = displayed.length ? 'block' : 'none';
            instance.isSuggesting = displayed.length ? true : false;
        }

        /**
         * Insert the item in the editor
         * @param {Object} item Suggestion item to insert
         */
        function insert(item) {
            var isMethod   = item.base === bases.METHOD,
                isFunction = (isMethod || item.base === bases.FUNCTION),
                isQuestion = (item.base === bases.QUESTION),
                initialTokenText = (initialToken && initialToken.className === classNames.QUESTION_DELIMITER && initialToken.string) || '',
                delimiter  =  initialTokenText || '^',
                prefix     = (isMethod || item.base === bases.PROPERTY) ? '.' : '',
                text       = prefix + item.name;

            if (item.module) {
                prefix 	= "::";
                text 	= prefix + item.name;
            }

            if (isFunction) {
                text += '()';
            } else if (isQuestion && (~text.indexOf(' ') || initialTokenText)) { // Question with spaces or starting with delimiter
                text = delimiter + text + delimiter;
            }
            instance.replaceRange(text, range.from, range.to);
            // If function or method which have require argument, put the cursor back into parenthesis
            //noinspection JSUnresolvedVariable
            if (isFunction && item.args && item.args.length && !item.args[0].opt) {
                instance.setCursor({
                    line : range.from.line,
                    ch   : instance.getLine(range.from.line).length - 1
                });
            }
            // If closing, apply the indentation
            if (item.open && !item.close) {
                instance.indentLine(range.from.line);
            }
        }

        /**
         * Pick the selected suggestion or the first one by default
         * @return {Boolean} Return true when a suggestion has been inserted
         */
        function pick() {
            var ret = false,
                index;

            if (displayed && displayed.length) {
                index =  (~selectedIndex) ? selectedIndex : 0;
                insert(displayed[index].item);
                ret = true;
            }

            if (ret) {
                close();
                autoComplete();
            }

            return ret;
        }

        /**
         * Auto-complete with snippet
         * @param {Object} [cur] Coordinate of the cursor in the editor
         * @return {Boolean} Return true when a snippet has been inserted
         */
        function autoComplete(cur) {
            if (!instance.isAskiaScriptMode()) {
                return false;
            }
            (cur = cur || instance.getCursor());

            var lineInfo = instance.lineInfo(cur.line),
                text     = lineInfo.handle.text,
                length   = snippets.length,
                snippet,
                textHelper,
                selected = false,
                rg = /_(.*?)_/gi,
                line, match, matchCount, item,
                start, end,
                i, l;

            if (length) {
                while (length--) {
                    item = snippets[length];
                    item.regex.lastIndex = 0;  // Reset the lastIndex to always search at the beginning
                    if (item.regex.test(text)) {

                        // Select whole line
                        start = {
                            line : cur.line,
                            ch   : 0
                        };
                        end = {
                            line : cur.line,
                            ch   : instance.getLine(cur.line).length
                        };
                        instance.setSelection(start, end);

                        // Replace the hole line by the snippet
                        //noinspection JSUnresolvedVariable
                        snippet = item.snippet;
                        instance.replaceSelection(snippet.join('\n').replace(/_(.*?)_/gi, '$1') , 'end');

                        // Indent line and select the helper text
                        for (i = 0, l = snippet.length; i < l; i += 1) {
                            line  = snippet[i];
                            matchCount = 0;
                            match = rg.exec(line);
                            while(match) {
                                matchCount += 1;

                                // Mark all matches with the class helper
                                textHelper = match[1];
                                start.line = end.line = cur.line + i;
                                start.ch   =  rg.lastIndex - (textHelper.length + (matchCount * 2));
                                end.ch     = start.ch + textHelper.length;

                                instance.markText(start, end, senseClassNames.HELPER);

                                // Select the text helper when not already selected
                                if (!selected) {
                                    // Use a new object, because the selection is not synchronous
                                    instance.setSelection({
                                        line : start.line,
                                        ch   : start.ch
                                    }, {
                                        line : end.line,
                                        ch   : end.ch
                                    });
                                    selected = true;
                                }

                                match = rg.exec(line);
                            }
                            instance.indentLine(cur.line + i);
                        }

                        return true;
                    }
                }
            }

            return false;
        }

        /**
         * Close punctuation
         * @param {KeyboardEvent} event Event
         * @param {Object} cur Cursor position
         */
        function closePunctuation(event, cur) {
            var closeChar = closeChars[event.keyIdentifier] || closeChars[event.char] || closeChars[event.key];

            if (closeChar) {
                instance.replaceSelection(closeChar, 'end');
                instance.setCursor({
                    line : cur.line,
                    ch   : cur.ch
                });
            }
        }

        /**
         * Change the behaviour when some special keys (ENTER, TAB, DOWN, UP) has been pressed
         * @param {Object} event Event triggered by the editor
         * @param {Object} cur Coordinates of the cursor
         * @return {Boolean} Return true when something was happen
         */
        function specialKey(event, cur) {
            var keyCode 	= event.keyCode,
                eventType 	= event.type,
                keyup       = (eventType === 'keyup'),
                keydown     = (eventType === 'keydown');

            switch(keyCode) {
                case keyCodes.TAB:
                    return pick() || autoComplete(cur);
                case keyCodes.DOWN:
                case keyCodes.UP:
                case keyCodes.PAGE_UP:
                case keyCodes.PAGE_DOWN:
                    return moveSelection(keyCode);
                case keyCodes.ENTER:
                    if (~selectedIndex) {
                        return pick();
                    }
            }

            return false;
        }

        /**
         * Returns true when the character is allowed for XML/HTML suggestion
         * @param {object} event DOM Event object
         */
        function isLegalXmlChar(event) {
            var cur            = instance.getCursor(),
                token              = instance.getTokenAt(cur),
                text               = token.string;

            // Yes suggest after '<' or '</'
            if (/<\/?/.test(text)) {
                return true;
            }

            // If the last char is '=' or space and when inside a tag
            if (/(\s|=)$/.test(text)) {
                if (token.type === "string" && (!/['"]/.test(text.charAt(text.length - 1)) || text.length == 1)) {
                    return false;
                }
                var inner = CodeMirror.innerMode(instance.getMode(), token.state).state;
                return (!!inner.tagName);
            }

            return false;
        }

        /**
         * Returns true when the character allow suggestion
         * @param {object} event DOM Event object
         */
        function isLegalChar(event) {
            var keyCode = event.keyCode,
                legalChar      = (keyCode >= keyCodes.A && keyCode <= keyCodes.Z) ||
                    keyCode === keyCodes.PERIOD ||
                	keyCode === keyCodes.COLON ||
                    keyCode === keyCodes.BACKSPACE,
                unicode,
                printableChar;

            // Search legal characters for xml like mode
            if (!instance.isAskiaScriptMode() && instance.isXmlLikeMode()) {
                legalChar = legalChar || isLegalXmlChar(event);
            }

            if (legalChar)  {
                return legalChar;
            }

            // "U+00XX" -> Characters
            if (event.keyIdentifier) {
                unicode = (event.keyIdentifier || event.key).toString().replace(/(U\+)/i, "");
                printableChar = String.fromCharCode(parseInt(unicode, 16));
            } else {
                printableChar = event.char || event.key || "";
            }

            return /^[a-zA-Z0-9_]$/.test(printableChar);
        }

        /**
         * Stop the event propagation and default
         * @param event
         */
        function stopEvent(event) {
            event.preventDefault();
            event.stopPropagation();
            event.codemirrorIgnore = true;
        }

        // Treat special key enter
        function treatSpecialCharacters(instance, event) {
            if (specialKey(event, instance.getCursor())) {
                stopEvent(event);
                return true;
            }
            return false;
        }

        /**
         * Return true when the event are triggered twice
         * Because in certain cases the keydown and keypress are triggered twice,
         * mostly in IE in Design.exe Frame
         * Only take in account the first one.
         * @param event
         * @return {Boolean}
         */
        function isDuplicateEvent(event) {
            var isDuplicate = (lastEventType === event.type && lastEventKey === event.keyCode);
            lastEventType = event.type; // Save it for the next check
            lastEventKey = event.keyCode;
            if (lastEventSeed) {
                clearTimeout(lastEventSeed);
            }
            lastEventSeed = setTimeout(function () {
                lastEventType = null;
                lastEventKey = null;
            }, 10);
            return isDuplicate;
        }

        /**
         * Fork from the show-hint
         */
        CodeMirror.registerHelper("hintSuggest", "auto", function(cm, options) {
            var helpers = cm.getHelpers(cm.getCursor(), "hint"), words;
            if (helpers.length) {
                for (var i = 0; i < helpers.length; i++) {
                    var cur = helpers[i](cm, options);
                    if (cur && cur.list.length) return cur;
                }
            } else if (words = cm.getHelper(cm.getCursor(), "hintWords")) {
                if (words) return CodeMirror.hintSuggest.fromList(cm, {words: words});
            } else if (CodeMirror.hint.anyword) {
                return CodeMirror.hint.anyword(cm, options);
            }
        });

        /**
         * Fork from the show-hint
         */
        CodeMirror.registerHelper("hintSuggest", "fromList", function(cm, options) {
            var cur = cm.getCursor(), token = cm.getTokenAt(cur);
            var to = CodeMirror.Pos(cur.line, token.end);
            if (token.string && /\w/.test(token.string[token.string.length - 1])) {
                var term = token.string, from = CodeMirror.Pos(cur.line, token.start);
            } else {
                var term = "", from = to;
            }
            var found = [];
            for (var i = 0; i < options.words.length; i++) {
                var word = options.words[i];
                if (word.slice(0, term.length) == term)
                    found.push(word);
            }

            if (found.length) return {list: found, from: from, to: to};
        });


        /**
         * Suggest
         * @param {CodeMirror} instance Instance of the CodeMirror editor
         * @param {Object} event Event
         * @return {Boolean} Return true to stop the event propagation or false for the normal flow
         */
        function suggest(instance, event) {
            if (event.ctrlKey) {
                return false;
            }
            //noinspection JSUnresolvedFunction
            var isAsMode       = instance.isAskiaScriptMode(),
                keyCode        = event.keyCode,
                cur            = instance.getCursor(),
                token          = instance.getTokenAt(cur),
                navKey         = (keyCode === keyCodes.DOWN ||
                keyCode === keyCodes.UP ||
                keyCode === keyCodes.PAGE_DOWN ||
                keyCode === keyCodes.PAGE_UP),
                legalChar      = isLegalChar(event),
                isOpenQuestion = (isAsMode && token.type === classNames.QUESTION_DELIMITER),
                onQuestion     = (isAsMode && initialToken && initialToken.type === classNames.QUESTION_DELIMITER),
                fixLength      = 0,
                s, l, rg, isAnotherToken,
                suggestions;

            // Meta key
            if (keyCode === keyCodes.CTRL || keyCode === keyCodes.SHIFT || keyCode === keyCodes.ALT ||
                keyCode === keyCodes.META_LEFT || keyCode === keyCodes.META_RIGHT) {
                return false;
            }

            if (!isDuplicateEvent(event)) {
                closePunctuation(event, cur);
            }

            // Don't display the suggestion on backspace
            if (keyCode === keyCodes.BACKSPACE && !instance.isSuggesting) {
                return false;
            }

            // Verify the state of the initialToken
            if (onQuestion) {
                if (cur.ch >= initialToken.start && cur.ch < initialToken.end) {
                    close();
                    return false;
                }
            }

            // We want a single cursor position.
            //noinspection JSUnresolvedFunction
            if (!isOpenQuestion && !onQuestion && (!legalChar || instance.somethingSelected())) {
                if (!navKey) {
                    close();
                }
                return false;
            }

            // Make sure to do nothing with navkeys
            if (navKey) {
                return false;
            }

            isAnotherToken = (range && token && range.from && range.from.ch !== token.start);
            if (!onQuestion && ((keyCode === keyCodes.PERIOD || keyCode === keyCodes.COLON) || isAnotherToken)) {
                updatePosition({
                    line : cur.line,
                    ch	 : token.start
                });
                clearList();
            }


            // Initial range
            range = {
                from    : {
                    line    : cur.line,
                    ch      : (onQuestion) ? initialToken.start : token.start
                },
                to      : {
                    line    : cur.line,
                    ch      : token.end
                }
            };

            // Search the string
            s = token.string;
            if (onQuestion) {
                s = instance.getRange(range.from, range.to);
            }

            // If we are on xml like language
            if (instance.isXmlLikeMode()) {
                // If we are creating a tag
                // get the previous token to know if characters before is '<' or '</'
                // Then move the range to insert the suggestion at the right location
                if (/\btag\b/.test(token.type) && !/^</.test(s)) {

                    var previousChars = instance.getRange({
                        line: range.from.line,
                        ch: (range.from.ch > 2) ? range.from.ch - 2 : range.from.ch - 1
                    }, {
                        line: range.from.line,
                        ch: range.from.ch
                    });
                    var match = /(<\/?)/.exec(previousChars);
                    previousChars = (match && match.length) ? match[1] : '';

                    s = previousChars + s;
                    range.from.ch -= previousChars.length;
                }

                // If inside a tag and we see the equal sign '='
                // we assuming we are assigning an attribute
                // in that case move the range just after the equal sign
                //
                var inner = CodeMirror.innerMode(instance.getMode(), token.state);
                if (inner && inner.state && inner.state.tagName && s === '=') {
                    range.from.ch += 1;
                }
            }

            // Fix the length of token, when there is a space at the end
            l = s.length - 1;
            while(s.charAt(l) === ' ') {
                fixLength -= 1;
                l -= 1;
            }
            range.to.ch = token.end + fixLength;

            // Regular expression to filter the search
            rg = (isAsMode) ?
                getTokenRegexp(s.replace(askiaScript.patterns.questionDelimiter, ''))
                : getTokenRegexp(s);

            if (!cache.length) {
                if (isAsMode) {
                    suggestions = isOpenQuestion ? instance.options.dictionary.questions : askiascriptHint(instance);
                } else {
                    suggestions = CodeMirror.hintSuggest.auto(instance, (instance.options && instance.options.hintOptions));
                    if (suggestions) {
                        suggestions.hints = true;
                    }
                }

                if (loadSuggestions(suggestions, rg)) {
                    initialToken = token;
                    open();
                }
            } else {
                filter(rg);
            }

            return false;
        }

        // Listen key event of the editor
        instance.on('keydown', treatSpecialCharacters);
        instance.on('keyup', suggest);

        // Listen the click to close the suggestion
        CodeMirror.on(elEditor, 'click', function onEditorClick() {
            close();
        });

        // Override the close suggestion
        instance.closeSuggestion = close;

        return this;
    };

    /**
     * Method to close the suggestion
     */
    CodeMirror.prototype.closeSuggestion = function closeSuggestion() {
        /*
         It's implemented in the instance of the suggest
         See in CodeMirror.prototype.suggest
         */
    };

    /**
     * Enable the description panel
     *
     * @chainable
     */
    CodeMirror.prototype.enableDescription = function enableDescription() {
        // Defined the lexical if not already done
        askiaScript.defineLexical(askiaScript.lexical);

        var instance = this;
        if (!instance.description) {
            // Do it into another thread to speed the load
            setTimeout(function delayEnableDescription() {
                instance.description = new Description(instance);
            }, 100);
        }
        return this;
    };

    /**
     * Activate the sense (collect local variables and suggest)
     * @chainable
     */
    CodeMirror.prototype.sense = function sense() {
        var instance = this,
            options = instance.options;

        if (options.localExe) {
            this.doLiveCompilation();
        }

        return this.suggest().enableDescription();
    };

    /**
     * Destroy the code mirror instance
     * This method save the text into the textarea and remove the editor
     * and all associated resources
     *
     * @return {CodeMirror} Return the destroyed instance
     */
    CodeMirror.prototype.destroy = function destroy() {
        var i, l, element;
        if (this.domResources) {
            for (i = 0, l = this.domResources.length; i < l; i += 1) {
                element = this.domResources[i];
                element.parentNode.removeChild(element);
            }
        }
        (this.description && this.description.destroy());
        (this.finder && this.finder.destroy());
        return this.toTextArea();
    };

    /**
     *
     */
    CodeMirror.prototype.importAskiaScriptModules = function ImportAskiaScriptModules(module) {
        var instance = this,
            dictionary = instance.options.dictionary;
        dictionary.updateModules(module);
    };
});
