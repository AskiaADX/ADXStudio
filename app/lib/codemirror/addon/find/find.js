/**
 * Custom find and replace with a cleaner user interface
 */
(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";


    var setTimeout   = window.setTimeout,
        clearTimeout = window.clearTimeout,
        keyCodes = {
            ENTER       : 13,
            ESC         : 27
        };

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
     * Create checkbox element
     * @param {String} id Id of the checkbox
     * @param {String} text Text of the label
     * @return {Object} ret Container/checkbox pair
     * @return {HTMLElement} ret.container Container element
     * @return {HTMLElement} ret.checkbox Reference to the checkbox element
     */
    function createCheckbox(id, text, title) {
        var cont = document.createElement('label');
        cont.className = 'cms-checkbox';
        cont.title = title;

        var chk = document.createElement('input');
        chk.setAttribute('id', id);
        chk.setAttribute('type', 'checkbox');
        cont.appendChild(chk);

        var lbl = document.createElement('span');
        // lbl.setAttribute('for', id);
        lbl.innerHTML = text;
        cont.appendChild(lbl);

        return {
            container : cont,
            checkbox  : chk
        };
    }

    /**
     * Escape text for regular expression
     * @param {String} str Text to escape
     * @return {String} Text escaped
     */
    function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    /**
     * On editor change
     * @param {CodeMirror} instance
     */
    function onEditorChange(instance) {
        if (instance.finder && instance.finder.isOpen()) {
            instance.finder.find();
        }
    }

    /**
     * Try to create a regular expression, return null when the regexp is not valid
     *
     * @param {String} pattern Pattern
     * @param {String} options Regular expression options
     */
    function tryCreateRegexp(pattern, options) {
        try {
            return new RegExp(pattern, options);
        } catch (err) {
            return null;
        }
    }

    /**
     * Return the key associated with the given value object
     *
     * @param {Object} obj Object where to search
     * @param {*} value Value to search
     * @return {String} Key associated with the value or null
     */
    function getObjectKeyFromValue(obj, value) {
        if (!obj) {
            return null;
        }
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key] === value) {
                    return key;
                }
            }
        }
        return null;
    }


    /**
     * Return the key name associated with the command like: "SHIFT-CTRL-F", "SHIFT-CMD-F" etc...
     * @param {CodeMirror} instance Instance of CodeMirror
     * @param {String} command Name of command to search (like: "find", "replace" etc...)
     * @returns {String}
     */
    function getKeyNameFromCommand(instance, command) {
        var keyMapName = instance.options.keyMap || 'default';
        var keyMaps = instance.state.keyMaps;
        var i, l, result;

        // Search in the instance
        for (i = 0, l = keyMaps.length; i < l; i++) {
            result = getObjectKeyFromValue(keyMaps[i], command);
            if (result) return result;
        }

        // Search in the extra-keys
        // and in the statics
        return getObjectKeyFromValue(instance.options.extraKeys, command) ||
            getObjectKeyFromValue(CodeMirror.keyMap[keyMapName], command);
    }

    /**
     * Returns the keyname associated with the event
     *
     * @param {Event} event Event
     */
    var normalizeKeyName = CodeMirror.keyName;

    /**
     * Create a new instance of finder
     *
     * @param {CodeMirror} instance Instance of code mirror
     * @constructor
     */
    function Finder(instance) {
        this.instance = instance;

        // Retrieve the key name associated with the find/replace
        this.keyNames = {};
        this.keyNames[getKeyNameFromCommand(instance, "find")] = 'find';
        this.keyNames[getKeyNameFromCommand(instance, "replace")] = 'replace';
        this.keyNames[getKeyNameFromCommand(instance, "findNext")] = 'findNext';
        this.keyNames[getKeyNameFromCommand(instance, "findPrev")] = 'findPrev';

        // Editor
        this.elEditor       = instance.getWrapperElement();

        // Create the form container element for find/replace
        this.elForm = document.createElement('div');
        this.elForm.className = 'cms-find';

        // Search container
        this.elSearch = document.createElement('div');
        this.elSearch.className = 'cms-find-search';

        // Find pattern
        this.elPatternContainer = document.createElement('div');
        this.elPatternContainer.className = 'cms-find-input-pattern-container';

        this.elPattern = document.createElement('input');
        this.elPattern.setAttribute('type', 'search');
        this.elPattern.className = 'cms-find-input-pattern';

        this.elPatternContainer.appendChild(this.elPattern);
        this.elSearch.appendChild(this.elPatternContainer);

        // Options
        this.elOptions = document.createElement('div');
        this.elOptions.className = 'cms-find-options';

        // -- Case
        var optCase = createCheckbox('cms-find-opt-case', '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M3.275 17.7L7.4 6.7h1.975l4.125 11h-1.9l-.975-2.8h-4.45l-1 2.8zm3.475-4.4h3.275l-1.6-4.55h-.1zm9.875 4.65q-1.275 0-2.025-.687t-.75-1.813q0-1.1.863-1.812t2.212-.713q.575 0 1.125.1t.95.275V13q0-.725-.513-1.175t-1.362-.45q-.575 0-1.05.238t-.825.687l-1.175-.875q.6-.725 1.363-1.075T17.15 10q1.725 0 2.575.813t.85 2.437v4.45H19v-.925h-.1q-.35.575-.95.875t-1.325.3m.3-1.35q.875 0 1.488-.6t.612-1.4q-.35-.2-.837-.312t-.963-.113q-.8 0-1.25.35t-.45.925q0 .5.4.825t1 .325"/></svg>', 'Match Case');
        this.elOptCaseChk = optCase.checkbox;
        this.elOptions.appendChild(optCase.container);

        // -- Words
        var optWords = createCheckbox('cms-find-opt-words', '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M1 19.025v-5h2v3h18v-3h2v5zM9.55 15v-.85h-.075q-.325.5-.875.788t-1.25.287q-1.225 0-1.925-.637t-.7-1.738q0-1.05.813-1.712t2.087-.663q.575 0 1.063.088t.837.287v-.35q0-.675-.462-1.075t-1.263-.4q-.525 0-.987.225t-.788.65L4.95 9.1q.475-.675 1.2-1.025t1.675-.35q1.55 0 2.375.738t.825 2.137V15zM7.9 11.65q-.8 0-1.225.313t-.425.887q0 .5.375.813t.975.312q.8 0 1.363-.562t.562-1.363q-.35-.2-.8-.3t-.825-.1M12.525 15V4.975h1.55V7.8L14 8.8h.075q.075-.125.6-.638t1.65-.512q1.6 0 2.525 1.15t.925 2.65t-.912 2.638t-2.538 1.137q-1.025 0-1.562-.45t-.688-.7H14V15zM16.1 9.05q-1 0-1.55.738T14 11.425q0 .925.55 1.65t1.55.725t1.563-.725t.562-1.65t-.562-1.65T16.1 9.05"/></svg>', 'Match Whole Word');
        this.elOptWordsChk = optWords.checkbox;
        this.elOptions.appendChild(optWords.container);

        // -- Regex
        var optRegex = createCheckbox('cms-find-opt-regex', '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M16 16.92c-.33.05-.66.08-1 .08s-.67-.03-1-.08v-3.51l-2.5 2.48c-.5-.39-1-.89-1.39-1.39l2.48-2.5H9.08c-.05-.33-.08-.66-.08-1s.03-.67.08-1h3.51l-2.48-2.5c.19-.25.39-.5.65-.74c.24-.26.49-.46.74-.65L14 8.59V5.08c.33-.05.66-.08 1-.08s.67.03 1 .08v3.51l2.5-2.48c.5.39 1 .89 1.39 1.39L17.41 10h3.51c.05.33.08.66.08 1s-.03.67-.08 1h-3.51l2.48 2.5c-.19.25-.39.5-.65.74c-.24.26-.49.46-.74.65L16 13.41zM5 19a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2"/></svg>', 'Use Regular Expression');
        this.elOptRegexChk = optRegex.checkbox;
        this.elOptions.appendChild(optRegex.container);

        // End of options
        this.elSearch.appendChild(this.elOptions);

        // Match Result
        this.elMatchResult = document.createElement('div');
        this.elMatchResult.className = "cms-find-match-result";
        this.elSearch.appendChild(this.elMatchResult);

        // Close button
        this.elClose = document.createElement('a');
        this.elClose.setAttribute('href', '#');
        this.elClose.className = 'cms-find-close';
        this.elClose.innerHTML = 'x';
        this.elClose.title = 'Close';
        this.elSearch.appendChild(this.elClose);

        this.elForm.appendChild(this.elSearch);
        // End of search container

        // Navigation
        this.elNav = document.createElement('div');
        this.elNav.className = 'cms-find-nav';

        // Jump to prev
        this.elJumpToPrev = document.createElement('a');
        this.elJumpToPrev.setAttribute('href', '#');
        this.elJumpToPrev.className = 'jump-to-prev';
        this.elJumpToPrev.innerHTML = '&#8593;';
        this.elJumpToPrev.title = 'Previous Match (Ctrl+Shift+G)';
        this.elNav.appendChild(this.elJumpToPrev);

        // Jump to next
        this.elJumpToNext = document.createElement('a');
        this.elJumpToNext.setAttribute('href', '#');
        this.elJumpToNext.className = 'jump-to-next';
        this.elJumpToNext.innerHTML = '&#8595;';
        this.elJumpToNext.title = 'Next Match (Ctrl+G)';
        this.elNav.appendChild(this.elJumpToNext);

        this.elSearch.appendChild(this.elNav);
        // End of navigation

        // Replace container
        this.elReplace = document.createElement('div');
        this.elReplace.className = 'cms-find-replace';

        // Replace text
        this.elReplaceByontainer = document.createElement('div');
        this.elReplaceByontainer.className = 'cms-find-input-replace-container';

        this.elReplaceBy = document.createElement('input');
        this.elReplaceBy.setAttribute('type', 'search');
        this.elReplaceBy.className = 'cms-find-input-replace';

        this.elReplaceByontainer.appendChild(this.elReplaceBy);
        this.elReplace.appendChild(this.elReplaceByontainer);


        // Buttons
        this.elActions = document.createElement('div');
        this.elActions.className = 'cms-replace-actions';

        // Replace one
        this.elReplaceOne = document.createElement('button');
        this.elReplaceOne.className = 'cms-replace-button';
        this.elReplaceOne.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1.1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="m3.221 3.739l2.261 2.269L7.7 3.784l-.7-.7l-1.012 1.007l-.008-1.6a.523.523 0 0 1 .5-.526H8V1H6.48A1.48 1.48 0 0 0 5 2.489V4.1L3.927 3.033zm6.67 1.794h.01q.274.467.806.467q.59 0 .94-.503q.354-.503.353-1.333q0-.766-.301-1.207q-.302-.442-.86-.442q-.608 0-.938.581h-.01V1H9v4.919h.89zm-.015-1.061v-.34q0-.372.175-.601a.54.54 0 0 1 .445-.23a.49.49 0 0 1 .436.233q.155.23.155.643q0 .496-.169.768a.52.52 0 0 1-.47.27a.5.5 0 0 1-.411-.211a.85.85 0 0 1-.16-.532zM9 12.769Q8.616 13 7.892 13q-.845 0-1.369-.533Q6 11.934 6 11.093q0-.972.56-1.53Q7.122 9 8.06 9q.65 0 .94.179v.998a1.26 1.26 0 0 0-.792-.276q-.488 0-.774.298q-.284.294-.283.816q0 .506.272.797q.273.287.749.287q.423 0 .828-.276zM4 7L3 8v6l1 1h7l1-1V8l-1-1zm0 1h7v6H4z" clip-rule="evenodd"/></svg>';
        this.elReplaceOne.title = 'Replace';
        this.elActions.appendChild(this.elReplaceOne);

        // Replace one
        this.elReplaceAll = document.createElement('button');   
        this.elReplaceAll.className = 'cms-replace-button';     
        this.elReplaceAll.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1.1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M11.6 2.677q.22-.465.626-.465q.373 0 .573.353q.201.353.201.966q0 .664-.235 1.067T12.138 5q-.355 0-.537-.374h-.008v.31H11V1h.593v1.677zm-.016 1.1a.8.8 0 0 0 .107.426q.107.17.274.169q.204 0 .314-.216q.113-.217.113-.615q0-.329-.104-.514q-.1-.187-.29-.187q-.18 0-.297.185a.9.9 0 0 0-.117.48zM4.12 7.695L2 5.568l.662-.662l1.006 1v-1.51A1.39 1.39 0 0 1 5.055 3H7.4v.905H5.055a.49.49 0 0 0-.468.493l.007 1.5l.949-.944l.656.656l-2.08 2.085zM9.356 4.93H10V3.22Q10 2.001 9.056 2q-.203 0-.45.073a1.4 1.4 0 0 0-.388.167v.665q.356-.304.75-.304q.392 0 .392.469l-.6.103Q8 3.302 8 4.134q0 .394.183.631A.61.61 0 0 0 8.69 5q.435 0 .657-.48h.009zm.004-1.355v.193a.75.75 0 0 1-.12.436a.37.37 0 0 1-.313.17a.28.28 0 0 1-.22-.095a.38.38 0 0 1-.08-.248q0-.332.332-.389zM7 12.93h-.644v-.41h-.009q-.222.48-.657.48a.61.61 0 0 1-.507-.235Q5 12.528 5 12.135q0-.833.76-.962l.6-.103q0-.47-.392-.47q-.394 0-.75.305v-.665q.142-.095.388-.167t.45-.073Q7 10 7 11.22zm-.64-1.162v-.193l-.4.068q-.333.055-.333.388q0 .15.08.248a.28.28 0 0 0 .22.095a.37.37 0 0 0 .312-.17q.12-.173.12-.436zM9.262 13q.482 0 .738-.173v-.71a.9.9 0 0 1-.552.207a.62.62 0 0 1-.5-.215q-.18-.218-.181-.598q0-.39.189-.612a.64.64 0 0 1 .516-.223q.291 0 .528.207v-.749Q9.806 10 9.374 10q-.626 0-1.001.422Q8 10.842 8 11.57q0 .63.349 1.03t.913.4M2 9l1-1h9l1 1v5l-1 1H3l-1-1zm1 0v5h9V9zm3-2l1-1h7l1 1v5l-1 1V7z" clip-rule="evenodd"/></svg>';
        this.elReplaceAll.title = 'Replace All';
        this.elActions.appendChild(this.elReplaceAll);

        this.elReplace.appendChild(this.elActions);


        this.elForm.appendChild(this.elReplace);
        // End of replace container

        // Add in dom
        this.elEditor.parentNode.insertBefore(this.elForm, this.elEditor);

        // List of current markers
        this.markers = [];
        this.currentMarker = null; // Current marker for replace

        /**
         * State of the finder
         * @type {{open: boolean}}
         */
        this.state = {
            open : false
        };

        // Add all listeners
        this.listen();
    }

    /**
     * Listen form changes
     */
    Finder.prototype.listen = function listen() {
        var self = this,
            searchTimeout;

        // Rebind the key from the editor to the form
        self.elForm.onkeydown = function onkeydownForm(event) {
            var keyName = normalizeKeyName(event);
            if (self.keyNames[keyName]) {
                event.preventDefault();
                event.stopPropagation();
                CodeMirror.commands[self.keyNames[keyName]](self.instance);
                return false;
            }
        };

        self.elPattern.onkeydown = function onkeydownPattern(event) {
            if (event.keyCode === keyCodes.ENTER) {
                self.selectMarker((event.shiftKey) ? -1 : 1);
                event.stopPropagation();
            }
            if (event.keyCode === keyCodes.ESC) {
                self.close();
                event.stopPropagation();
            }
        };
        attachSearchEvent(self.elPattern, function onSearch() {
            var el = this;
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function onSearchTimer() {
                self.find(el.value).selectMarker();
            }, 50);
        });

        this.elJumpToPrev.onclick = function movePrevious() {
            self.selectMarker(-1);
        };

        this.elJumpToNext.onclick = function moveNext() {
            self.selectMarker(1);
        };

        function onOptionChange() {
            if (self.elOptRegexChk.checked) {
                self.elOptWordsChk.checked = false;
            }
            self.elOptWordsChk.disabled = self.elOptRegexChk.checked;
            self.find();
        }

        this.elOptCaseChk.onchange = onOptionChange;
        this.elOptRegexChk.onchange = onOptionChange;
        this.elOptWordsChk.onchange = onOptionChange;

        this.elClose.onclick = function close() {
            self.close();
        };

        this.elReplaceBy.onkeydown = function onkeydownReplaceBy(event) {
            if (event.keyCode === keyCodes.ENTER) {
                self.replaceOne();
                event.stopPropagation();
            }
            if (event.keyCode === keyCodes.ESC) {
                self.close();
                event.stopPropagation();
            }
        };

        this.elReplaceOne.onclick = function replaceOne() {
            self.replaceOne();
        };

        this.elReplaceAll.onclick = function replaceAll() {
            self.replaceAll();
        };
    };

    /**
     * Shorthand to match and display markers
     * @param {String} [pattern] Pattern to find, if not defined use the value of the textbox
     * @chainable
     */
    Finder.prototype.find  = function find(pattern) {
        pattern = (typeof pattern === 'string') ? pattern : this.elPattern.value;
        return this.displayMatches(
            this.match(pattern, this.getOptionsFromForm())
        );
    };

    /**
     * Indicates if the find/replace is open
     * @returns {boolean}
     */
    Finder.prototype.isOpen = function isOpen() {
        return this.state.open;
    };

    /**
     * Open the form for find/replace
     * @param {Boolean} [findAndReplace=false] Find and replace mode
     */
    Finder.prototype.open = function open(findAndReplace) {
        var className = findAndReplace ? 'find-replace' : 'find';
        this.elForm.className = 'cms-find ' + className;
        var formHeight   = this.elForm.offsetHeight,
            editorHeight = this.elEditor.offsetHeight,
            initialPattern = (!this.state.open) ? (this.elPattern.value || '') : '';

        if (!this.isOpen) {
            this.instance.setSize(null, (editorHeight - formHeight));
        };

        if (this.instance.somethingSelected()) {
            initialPattern = this.instance.getSelection().split('\n')[0];
        }
        this.elPattern.value = initialPattern;
        this.elPattern.focus();
        this.instance.off('change', onEditorChange);
        this.instance.on('change', onEditorChange);
        this.state.open = true;
        this.find();
    };

    /**
     * Close the form for find/replace
     */
    Finder.prototype.close = function close() {
        var formHeight   = this.elForm.offsetHeight,
            editorHeight = this.elEditor.offsetHeight;
        this.elForm.className = 'cms-find';
        this.instance.setSize(null, (editorHeight + formHeight));
        this.elPattern.value = '';
        this.clearMarkers();
        this.instance.focus();
        this.instance.off('change', onEditorChange);
        this.state.open = false;
    };

    /**
     * Returns the search options using the form
     * @return {Object} options Search options
     * @return {Boolean} options.caseSensitive Case sensitive search
     * @return {Boolean} options.isRegex Treat the pattern as a regular expression
     * @return {Boolean} options.words Match words
     */
    Finder.prototype.getOptionsFromForm = function getOptionsFromForm() {
        var self = this;
        return {
            caseSensitive : self.elOptCaseChk.checked,
            isRegex       : self.elOptRegexChk.checked,
            words         : self.elOptWordsChk.checked
        };
    };

    /**
     * Find the pattern in the value
     *
     * @param {String} pattern Pattern to find
     * @param {Object} [options] Search options
     * @param {Boolean} [options.caseSensitive=false] Case sensitive search
     * @param {Boolean} [options.isRegex] Treat the pattern as a regular expression
     * @param {Boolean} [options.words] Match words
     * @return {Array} Matches with {start, end, length}
     */
    Finder.prototype.match = function match(pattern, options) {
        options = options || {};

        if (!pattern) {
            return [];
        }

        var value = this.instance.getValue();
        var rgOptions = "mgi";
        if (options.caseSensitive) {
            rgOptions = "mg";
        }
        var matches = [];

        if (!options.isRegex) {
            pattern = escapeRegExp(pattern);
            if (options.words) {
                pattern = "\\b" + pattern + "\\b";
            }
        }

        var rg = tryCreateRegexp(pattern, rgOptions);
        if (!rg) {
            return [];
        }
        var match = rg.exec(value);
        while(match && match.length && match[0] && match[0].length) {
            matches.push({
                start : rg.lastIndex - match[0].length,
                end   : rg.lastIndex,
                length : match[0].length
            });
            match = rg.exec(value);
        }
        return matches;
    };

    /**
     * Remove all markers
     * @chainable
     */
    Finder.prototype.clearMarkers = function clearMarkers() {
        var i, l;
        for(i = 0, l = this.markers.length; i < l; i += 1) {
            this.markers[i].clear();
        }

        this.markers = [];
        if (this.currentMarker) {
            this.currentMarker.clear();
        }
        this.currentMarker = null;
        return this;
    };

    /**
     * Display the matches
     * @param {Array} matches
     * @chainable
     */
    Finder.prototype.displayMatches = function displayMatches(matches) {
        var i, l, match, from, to;
        this.clearMarkers();
        this.elMatchResult.innerHTML = (matches.length) ? matches.length + " matches." : "no result.";

        for (i = 0, l = matches.length; i < l; i += 1) {
            match = matches[i];
            from = this.instance.posFromIndex(match.start);
            to   = this.instance.posFromIndex(match.end);
            this.markers.push(this.instance.markText(from, to, {
                className : 'cms-find-match-occurrence'
            }));
        }

        return this;
    };

    /**
     * Select a marker
     * @param {Number} [direction=0] 0 for current, +1 for next, -1 for previous
     * @chainable
     */
    Finder.prototype.selectMarker = function selectMarker(direction) {
        if (!this.markers.length) {
            return this;
        }
        direction = direction || 0;

        var instance = this.instance,
            cursor   = instance.getCursor(),
            fromTo,
            previous, next , i, l, isNextCh;

        // Reset the cursor position to search into the same line
        if (direction === 0) {
            cursor.ch = 0;
        }

        for (i = 0, l = this.markers.length; i < l; i += 1) {
            fromTo = this.markers[i].find();

            // The next is find
            isNextCh = (direction <= 0 && fromTo.to.ch >= cursor.ch) || (direction > 0 && fromTo.to.ch > cursor.ch);
            if ((fromTo.to.line === cursor.line && isNextCh) ||
                (fromTo.to.line > cursor.line)) {
                next = fromTo;
                break;
            }

            // Register the previous
            previous = fromTo;
        }

        // Select the previous
        if (direction < 0) {
            // Fix when the previous marker was not found,
            // go back to the latest marker
            if (!previous) {
                previous = this.markers[this.markers.length - 1].find();
            }
            if (previous) {
                instance.setSelection(previous.from, previous.to);
                if (this.currentMarker) {
                    this.currentMarker.clear();
                }
                this.currentMarker = this.instance.markText(previous.from, previous.to, {
                    className : 'cms-find-match-current'
                });
            }
        }


        // Select the next
        if (direction >= 0) {
            // Fix when the latest markers was not find,
            // go back to the first marker
            if (!next) {
                next = this.markers[0].find();
            }

            if (next) {
                instance.setSelection(next.from, next.to);
                if (this.currentMarker) {
                    this.currentMarker.clear();
                }
                this.currentMarker = this.instance.markText(next.from, next.to, {
                    className : 'cms-find-match-current'
                });
            }
        }

        return this;
    };

    /**
     * Replace the current selection (under the current marker) or initiate the next marker
     * @chainable
     */
    Finder.prototype.replaceOne = function replaceOne () {
        if (!this.markers.length) {
            return this;
        }

        if (!this.currentMarker) {
            return this.selectMarker();
        }

        var fromTo      = this.currentMarker.find(),
            replacement = this.elReplaceBy.value,
            instance    = this.instance;

        if (!fromTo) {
            return this.selectMarker();
        }

        instance.replaceRange(replacement, fromTo.from, fromTo.to);

        instance.setSelection({
            line : fromTo.from.line,
            ch   : fromTo.from.ch + replacement.length
        });

        // Search the next
        return this.selectMarker(1);
    };

    /**
     * Replace all text
     * @chainable
     */
    Finder.prototype.replaceAll = function replaceAll() {
        if (!this.markers.length) {
            return this;
        }

        var i, l, fromTo,
            replacement = this.elReplaceBy.value,
            instance = this.instance;

        instance.off('change', onEditorChange); // Mute the change

        for (i = 0, l = this.markers.length; i < l; i += 1) {
            fromTo = this.markers[i].find();
            if (fromTo) {
                instance.replaceRange(replacement, fromTo.from, fromTo.to);
            }
        }

        this.clearMarkers();

        instance.on('change', onEditorChange); // Re-listen
        return this.find();
    };

    /**
     * Remove all dom element and events
     */
    Finder.prototype.destroy = function destroyFinder() {
        this.elForm.parentNode.removeChild(this.elForm);
    };



    // CodeMirror Commands
    CodeMirror.commands.find = function find(cm) {
        if (!cm.finder) {
            cm.finder = new Finder(cm);
        }
        cm.finder.open();
    };
    CodeMirror.commands.replace = function replace(cm) {
        if (!cm.finder) {
            cm.finder = new Finder(cm);
        }
        cm.finder.open(true);
    };
    CodeMirror.commands.findNext = function findNext(cm) {
        if (!cm.finder) {
            cm.finder = new Finder(cm);
        }
        cm.finder.open();
        cm.finder.selectMarker(1);
    };
    CodeMirror.commands.findPrev = function findPrev(cm) {
        if (!cm.finder) {
            cm.finder = new Finder(cm);
        }
        cm.finder.open();
        cm.finder.selectMarker(-1);
    };

    // Extend the toTextArea
    (function () {
        var oldToTextArea = CodeMirror.prototype.toTextArea;
        CodeMirror.prototype.toTextArea = function () {
            if (this.finder) {
              this.finder.destroy();
            }
            oldToTextArea.apply(this, arguments);
        };
    }());
});
