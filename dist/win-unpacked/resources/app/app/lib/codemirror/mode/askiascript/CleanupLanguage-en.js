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
        "cleanuplanguage" : {
            "name" : "CleanupLanguage",            
            "ns" : "cleanuplanguage",            
            "dependencies" : [
                "calcarithmlanguage"
            ]
        }
    },    
    "members" : {
        "cell" : [
            {
                "name" : "SetBackColor",                
                "ns" : "cleanuplanguage",                
                "base" : "method",                
                "type" : "cell",                
                "args" : [
                    {
                        "name" : "Color",                        
                        "type" : "string",                        
                        "desc" : "indicate which color you wat to use"
                    }
                ],                
                "desc" : [
                    " allows you to set the backcolour of a cell",                    
                    " you can use the name of the color or its html notation",                    
                    " you can also use a number like 0"
                ],                
                "examples" : [
                    "\tCurrentTable.GetCell(1,1).SetBackColor(\"blue\")",                    
                    "\tCurrentTable.GetCell(1,1).SetBackColor(\"#00ff00\").SetBold()",                    
                    "\tCurrentTable.GetCell(1,1).SetBackColor(0)"
                ],                
                "alsoSee" : [
                    "SetForeColor",                    
                    "SetBold",                    
                    "SetItalic",                    
                    "SetUnderline"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "SetBold",                
                "ns" : "cleanuplanguage",                
                "base" : "method",                
                "type" : "cell",                
                "args" : [
                    {
                        "name" : "IsBold",                        
                        "type" : "number",                        
                        "desc" : "indicate if you want to set or remove the setting (true by default)",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " allows you to set the font of a cell to bold",                    
                    " "
                ],                
                "examples" : [
                    "\tCurrentTable.GetCell(1,1).SetBold(True)",                    
                    "\tCurrentTable.GetCell(1,1).SetForeColor(\"#00ff00\").SetBold()"
                ],                
                "alsoSee" : [
                    "SetForeColor",                    
                    "SetBackColor",                    
                    "SetItalic",                    
                    "SetUnderline"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "SetForeColor",                
                "ns" : "cleanuplanguage",                
                "base" : "method",                
                "type" : "cell",                
                "args" : [
                    {
                        "name" : "Color",                        
                        "type" : "variant",                        
                        "desc" : "indicate which color you want to use as a string (or red component as a number)"
                    },                    
                    {
                        "name" : "Green",                        
                        "type" : "number",                        
                        "desc" : "Green component of the color",                        
                        "opt" : true
                    },                    
                    {
                        "name" : "Blue",                        
                        "type" : "number",                        
                        "desc" : "Blue component of the color",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " allows you to set the forecolour of a cell",                    
                    " you can use the name of the color or its html notation",                    
                    " you can also use a number like 0"
                ],                
                "examples" : [
                    "\tCurrentTable.GetCell(1,1).SetForeColor(\"blue\")",                    
                    "\tCurrentTable.GetCell(1,1).SetForeColor(\"#00ff00\").SetBold()",                    
                    "\tCurrentTable.GetCell(1,1).SetForeColor(0,0,0)"
                ],                
                "alsoSee" : [
                    "SetBackColor",                    
                    "SetBold",                    
                    "SetItalic",                    
                    "SetUnderline"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "SetItalic",                
                "ns" : "cleanuplanguage",                
                "base" : "method",                
                "type" : "cell",                
                "args" : [
                    {
                        "name" : "IsItalic",                        
                        "type" : "number",                        
                        "desc" : "indicate if you want to set or remove the setting (true by default)",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " allows you to set the font of a cell to italic",                    
                    " "
                ],                
                "examples" : [
                    "\tCurrentTable.GetCell(1,1).SetItalic(True)",                    
                    "\tCurrentTable.GetCell(1,1).SetForeColor(\"#00ff00\").SetItalic()"
                ],                
                "alsoSee" : [
                    "SetForeColor",                    
                    "SetBackColor",                    
                    "SetBold",                    
                    "SetUnderline"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "SetText",                
                "ns" : "cleanuplanguage",                
                "base" : "method",                
                "type" : "cell",                
                "args" : [
                    {
                        "name" : "Text",                        
                        "type" : "string"
                    }
                ],                
                "desc" : [
                    " allows you to change the text in a cell ",                    
                    " "
                ],                
                "examples" : [
                    "    If  CurrentTable.GetCell(10,3).Value < 5 Then",                    
                    "\t   CurrentTable.GetCell(10,3).SetText(\"not available\")",                    
                    "\tEndIf"
                ],                
                "alsoSee" : "SetText",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "SetUnderline",                
                "ns" : "cleanuplanguage",                
                "base" : "method",                
                "type" : "cell",                
                "args" : [
                    {
                        "name" : "IsUnderline",                        
                        "type" : "number",                        
                        "desc" : "indicate if you want to set or remove the setting (true by default)",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " allows you to set the font of a cell to underline",                    
                    " "
                ],                
                "examples" : [
                    "\tCurrentTable.GetCell(1,1).SetUnderline(True)",                    
                    "\tCurrentTable.GetCell(1,1).SetForeColor(\"#00ff00\").SetUnderline()"
                ],                
                "alsoSee" : [
                    "SetForeColor",                    
                    "SetBackColor",                    
                    "SetBold",                    
                    "SetItalic"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "SetValue",                
                "ns" : "cleanuplanguage",                
                "base" : "method",                
                "type" : "cell",                
                "args" : [
                    {
                        "name" : "Value",                        
                        "type" : "number"
                    }
                ],                
                "desc" : [
                    " allows you to change the value in a cell - if you want to format it in a different way, use SetText",                    
                    " "
                ],                
                "examples" : "\tCurrentTable.GetCell(10,3).SetValue(17)",                
                "alsoSee" : "SetText",                
                "version" : "5.3.5.0"
            }
        ]
    }
}, true);

});
