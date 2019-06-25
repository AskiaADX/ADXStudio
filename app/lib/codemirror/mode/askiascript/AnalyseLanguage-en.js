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
        "analyselanguage" : {
            "name" : "AnalyseLanguage",            
            "ns" : "analyselanguage",            
            "dependencies" : [
                "aggregatedlanguage"
            ]
        }
    },    
    "builtin" : [
        {
            "name" : "ColQuestion",            
            "ns" : "analyselanguage",            
            "base" : "const",            
            "type" : "question",            
            "desc" : "Return the first question placed in the column",            
            "remarks" : "The returned question is invalid if this used in a sub-population or a calculated variable",            
            "examples" : "ColQuestion.Shortcut ' => \"gender\" if the question in the column",            
            "version" : "5.3.5.0"
        },        
        {
            "name" : "ColSubQuestion",            
            "ns" : "analyselanguage",            
            "base" : "const",            
            "type" : "question",            
            "desc" : [
                " Return the first question child of the first question placed in the column",                
                " This is extremely useful if you want to have a template that picks automatically on which questions are used and creates a increment weighting for instance"
            ],            
            "remarks" : "The returned question is invalid if this used in a sub-population or a calculated variable",            
            "examples" : "ColSubQuestion.Shortcut ' => \"Rating\" if the question in the column is a loop called Brands who has one sub-question called Rating",            
            "version" : "5.3.5.0"
        },        
        {
            "name" : "Completed",            
            "ns" : "analyselanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : [
                " Retrieves 1 if the interview is completed, 0 ow",                
                "",                
                " @example",                
                " On(Completed,\"Done\",\"Unfinished\") ' returns two strings according to the state of the interview",                
                " ",                
                " "
            ],            
            "remarks" : "Only available in AskiaVista. In analyse you can create a variable"
        },        
        {
            "name" : "EndInterview",            
            "ns" : "analyselanguage",            
            "base" : "const",            
            "type" : "date",            
            "desc" : [
                " Retrieves the date at which the interview was finished",                
                "",                
                " @example",                
                " (EndInterview - StartInterview)*24*60 ' returns the number of minutes the interview took",                
                " ",                
                " "
            ],            
            "remarks" : "Only available in AskiaVista. In analyse you can create a variable"
        },        
        {
            "name" : "IntvwId",            
            "ns" : "analyselanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : [
                " Retrieves the ID of the interview as stored in the SQL server database",                
                "",                
                " @example",                
                " InvwID ' returns the Id of the interview",                
                " ",                
                " "
            ],            
            "remarks" : "Only available in AskiaVista. In analyse you can create a variable"
        },        
        {
            "name" : "IntvwOrder",            
            "ns" : "analyselanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : [
                " Retrieves the order of the interview as stored in the databse ( 1-based)",                
                "",                
                " @example",                
                " IntvwOrder ' returns the index of the interview",                
                " ",                
                " "
            ],            
            "remarks" : "Only available in AskiaVista. In analyse you can create a variable"
        },        
        {
            "name" : "RowQuestion",            
            "ns" : "analyselanguage",            
            "base" : "const",            
            "type" : "question",            
            "desc" : "Return the first question placed in the rows in a tab-definition",            
            "remarks" : "The returned question is invalid if this used in a sub-population or a calculated variable",            
            "examples" : "RowQuestion.Shortcut ' => \"gender\" if the question in the row",            
            "version" : "5.3.5.0"
        },        
        {
            "name" : "RowSubQuestion",            
            "ns" : "analyselanguage",            
            "base" : "const",            
            "type" : "question",            
            "desc" : [
                " Return the first question child of the first question placed in the rows",                
                " This is extremely useful if you want to have a template that picks automatically on which questions are used and creates a increment weighting for instance"
            ],            
            "remarks" : "The returned question is invalid if this used in a sub-population or a calculated variable",            
            "examples" : "RowSubQuestion.Shortcut ' => \"Rating\" if the question in the row is a loop called Brands who has one sub-question called Rating",            
            "version" : "5.3.5.0"
        },        
        {
            "name" : "Seed",            
            "ns" : "analyselanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : [
                " Retrieves the pseudo-unique number of the interview ",                
                "",                
                " @example",                
                " Seed ' returns the index of the interview",                
                " ",                
                " "
            ],            
            "remarks" : "Only available in AskiaVista. In analyse you can create a variable"
        },        
        {
            "name" : "StartInterview",            
            "ns" : "analyselanguage",            
            "base" : "const",            
            "type" : "date",            
            "desc" : [
                " Retrieves the date at which the interview was started",                
                "",                
                " @example",                
                " StartInterview.Day() ' returns the day of the month of the starting interview",                
                " ",                
                " "
            ],            
            "remarks" : "Only available in AskiaVista. In analyse you can create a variable"
        }
    ],    
    "members" : {
        "question" : [
            {
                "name" : "ToEntryCodeStr",                
                "ns" : "analyselanguage",                
                "base" : "property",                
                "type" : "variant",                
                "desc" : [
                    "\tReturns the response as an entry code for closed question",                    
                    "\tIt returns a string if the question is single, an array of string is the question is multiple",                    
                    "",                    
                    "\tIt's the default property which is added when you campare a question to a string",                    
                    "",                    
                    "\tq1 Has {\"1\"} is transformed into q1.ToEntryCodeStr() Has {\"1\"}"
                ],                
                "examples" : [
                    "\tgender.ToEntryCodeStr ' => \"1\"",                    
                    "\tbrands.ToEntryCodeStr ' => {\"3\"; \"5\"; \"6\"}",                    
                    "",                    
                    "\t' When no value specified:",                    
                    "",                    
                    "\tgender.value ' => DK",                    
                    "\tage.value ' => DK",                    
                    "\tbrands.value ' => {}",                    
                    "\tq1_other.value ' => \"\"",                    
                    "\tbirthday.value ' => DK"
                ],                
                "version" : "5.4.5.0"
            },            
            {
                "name" : "Value",                
                "ns" : "analyselanguage",                
                "base" : "property",                
                "type" : "variant",                
                "desc" : [
                    "\tReturns the basic value(s) (answers) of the question in the current iteration.",                    
                    "\tWhen there is no response the value return is DK,",                    
                    "\texcepted for the open-ended and multi-coded questions"
                ],                
                "examples" : [
                    "\tgender.value ' => 1",                    
                    "\tage.value ' => 33",                    
                    "\tbrands.value ' => {3; 5; 6}",                    
                    "\tq1_other.value ' => \"bla bla bla\"",                    
                    "\tbirthday.value ' => #14/02/1978#",                    
                    "",                    
                    "\t' When no value specified:",                    
                    "",                    
                    "\tgender.value ' => DK",                    
                    "\tage.value ' => DK",                    
                    "\tbrands.value ' => {}",                    
                    "\tq1_other.value ' => \"\"",                    
                    "\tbirthday.value ' => DK"
                ],                
                "version" : "5.3.5.0"
            }
        ]
    }
}, true);

});
