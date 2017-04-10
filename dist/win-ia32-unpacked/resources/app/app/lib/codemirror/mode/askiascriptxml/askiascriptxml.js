/*
 * Based on codemirror/mode/htmlembedded/
 */
(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"), require("../xml/xml"),
            require("../../addon/mode/multiplex"), require('../askiascript/askiascript'));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror", "../xml/xml",
            "../../addon/mode/multiplex", "../askiascript/askiascript"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    CodeMirror.defineMode("askiascriptxml", function(config, parserConfig) {
        return CodeMirror.multiplexingMode(CodeMirror.getMode(config, "xml"), {
            open: parserConfig.open || parserConfig.scriptStartRegex || "{%",
            close: parserConfig.close || parserConfig.scriptEndRegex || "%}",
            mode: CodeMirror.getMode(config, parserConfig.scriptingModeSpec)
        });
    }, "xml");

    CodeMirror.defineMIME("application/askiascript+xml", { name: "askiascriptxml", scriptingModeSpec: "askiascript" });
    CodeMirror.defineMIME("askiascript/xml", { name: "askiascriptxml", scriptingModeSpec: "askiascript" });

});
