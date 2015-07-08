/*
 * Based on codemirror/mode/htmlembedded/
 */
(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"), require("../htmlmixed/htmlmixed"),
            require("../../addon/mode/multiplex"), require('../askiascript/askiascript'));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror", "../htmlmixed/htmlmixed",
            "../../addon/mode/multiplex", "../askiascript/askiascript"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    CodeMirror.defineMode("askiascripthtml", function(config, parserConfig) {
        return CodeMirror.multiplexingMode(CodeMirror.getMode(config, "htmlmixed"), {
            open: parserConfig.open || parserConfig.scriptStartRegex || "{%",
            close: parserConfig.close || parserConfig.scriptEndRegex || "%}",
            mode: CodeMirror.getMode(config, parserConfig.scriptingModeSpec)
        });
    }, "htmlmixed");

    CodeMirror.defineMIME("application/askiascript+html", { name: "askiascripthtml", scriptingModeSpec: "askiascript" });
    CodeMirror.defineMIME("askiascript/html", { name: "askiascripthtml", scriptingModeSpec: "askiascript" });

});
