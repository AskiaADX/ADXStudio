/*
 * Based on codemirror/mode/htmlembedded/
 */
(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"), require("../css/css"),
            require("../../addon/mode/multiplex"), require('../askiascript/askiascript'));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror", "../css/css",
            "../../addon/mode/multiplex", "../askiascript/askiascript"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    CodeMirror.defineMode("askiascriptcss", function(config, parserConfig) {
        return CodeMirror.multiplexingMode(CodeMirror.getMode(config, "css"), {
            open: parserConfig.open || parserConfig.scriptStartRegex || "{%",
            close: parserConfig.close || parserConfig.scriptEndRegex || "%}",
            mode: CodeMirror.getMode(config, parserConfig.scriptingModeSpec)
        });
    }, "css");

    CodeMirror.defineMIME("application/askiascript+css", { name: "askiascriptcss", scriptingModeSpec: "askiascript" });
    CodeMirror.defineMIME("askiascript/css", { name: "askiascriptcss", scriptingModeSpec: "askiascript" });

});
