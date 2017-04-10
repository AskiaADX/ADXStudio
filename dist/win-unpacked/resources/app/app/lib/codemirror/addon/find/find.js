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
    function createCheckbox(id, text) {
        var cont = document.createElement('div');

        var chk = document.createElement('input');
        chk.setAttribute('id', id);
        chk.setAttribute('type', 'checkbox');
        cont.appendChild(chk);

        var lbl = document.createElement('label');
        lbl.setAttribute('for', id);
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

        // Navigation
        this.elNav = document.createElement('div');
        this.elNav.className = 'cms-find-nav';

        // Jump to prev
        this.elJumpToPrev = document.createElement('a');
        this.elJumpToPrev.setAttribute('href', '#');
        this.elJumpToPrev.className = 'jump-to-prev';
        this.elJumpToPrev.innerHTML = '&#8593;';
        this.elNav.appendChild(this.elJumpToPrev);

        // Jump to next
        this.elJumpToNext = document.createElement('a');
        this.elJumpToNext.setAttribute('href', '#');
        this.elJumpToNext.className = 'jump-to-next';
        this.elJumpToNext.innerHTML = '&#8595;';
        this.elNav.appendChild(this.elJumpToNext);

        this.elSearch.appendChild(this.elNav);
        // End of navigation

        // Options
        this.elOptions = document.createElement('div');
        this.elOptions.className = 'cms-find-options';

        // -- Case
        var optCase = createCheckbox('cms-find-opt-case', "Match case");
        this.elOptCaseChk = optCase.checkbox;
        this.elOptions.appendChild(optCase.container);

        // -- Regex
        var optRegex = createCheckbox('cms-find-opt-regex', "Regex");
        this.elOptRegexChk = optRegex.checkbox;
        this.elOptions.appendChild(optRegex.container);

        // -- Words
        var optWords = createCheckbox('cms-find-opt-words', "Words");
        this.elOptWordsChk = optWords.checkbox;
        this.elOptions.appendChild(optWords.container);

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
        this.elSearch.appendChild(this.elClose);

        this.elForm.appendChild(this.elSearch);
        // End of search container


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
        this.elReplaceOne = document.createElement('input');
        this.elReplaceOne.setAttribute('type', 'button');
        this.elReplaceOne.value = 'Replace';
        this.elActions.appendChild(this.elReplaceOne);

        // Replace one
        this.elReplaceAll = document.createElement('input');
        this.elReplaceAll.setAttribute('type', 'button');
        this.elReplaceAll.value = 'Replace All';
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
            // Fix when the previous marke was not found,
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
