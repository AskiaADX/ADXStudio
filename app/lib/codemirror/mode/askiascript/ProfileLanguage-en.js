(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../../mode/askiascript/askiascript"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../../mode/askiascript/askiascript"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function defineLexical(CodeMirror) {
  "use strict";

var askiaScript = CodeMirror.askiaScript;

askiaScript.extend(askiaScript.types, {
    
});

askiaScript.extend(askiaScript.i18n, {
    "types" : {
        
    },    
    "core" : {
        
    }
}, true);

askiaScript.extend(askiaScript.lexical, {
    "namespaces" : {
        "profilelanguage" : {
            "name" : "ProfileLanguage",            
            "ns" : "profilelanguage",            
            "dependencies" : [
                "askialanguage"
            ]
        }
    },    
    "builtin" : [
        {
            "name" : "Base",            
            "ns" : "profilelanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : [
                " Retrieves the weighted base for the table",                
                "",                
                " @example",                
                " Dim dBase = Base",                
                " "
            ],            
            "version" : "5.3.5.0"
        },        
        {
            "name" : "SumAll",            
            "ns" : "profilelanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : [
                " Returns the sum of all responses counts in the profile question - different from the base if the question is multiple",                
                "",                
                " @example",                
                " Dim dSum = SumAll",                
                " "
            ],            
            "version" : "5.3.5.0"
        }
    ],    
    "members" : {
        
    }
}, true);

});
