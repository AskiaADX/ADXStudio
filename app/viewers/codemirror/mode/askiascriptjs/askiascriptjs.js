/*
 * Based on codemirror/mode/htmlembedded/
 */
(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"), require("../javascript/javascript"),
            require("../../addon/mode/multiplex"), require('../askiascript/askiascript'));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror", "../javascript/javascript",
            "../../addon/mode/multiplex", "../askiascript/askiascript"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    CodeMirror.defineMode("askiascriptjs", function(config, parserConfig) {
        return CodeMirror.multiplexingMode(CodeMirror.getMode(config, "javascript"), {
            open: parserConfig.open || parserConfig.scriptStartRegex || "{%",
            close: parserConfig.close || parserConfig.scriptEndRegex || "%}",
            mode: CodeMirror.getMode(config, parserConfig.scriptingModeSpec)
        });
    }, "javascript");

    CodeMirror.defineMIME("application/askiascript+javascript", { name: "askiascriptjs", scriptingModeSpec: "askiascript" });
    CodeMirror.defineMIME("askiascript/javascript", { name: "askiascriptjs", scriptingModeSpec: "askiascript" });

});
