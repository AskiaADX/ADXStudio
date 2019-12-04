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
        "masquerwlanguage" : {
            "name" : "MasqueRWLanguage",            
            "ns" : "masquerwlanguage",            
            "dependencies" : [
                "masquelanguage"
            ]
        }
    },    
    "builtin" : [
        {
            "name" : "EndOfSurvey",            
            "ns" : "masquerwlanguage",            
            "base" : "const",            
            "type" : "question",            
            "desc" : "Return a virtual question which indicates the end of the survey - it's used in conjunction with GoTo",            
            "examples" : "Interview.Goto(endOfSurvey)",            
            "version" : "5.4.1.0"
        }
    ],    
    "members" : {
        "interview" : [
            {
                "name" : "GoTo",                
                "ns" : "masquerwlanguage",                
                "base" : "method",                
                "type" : "interview",                
                "args" : [
                    {
                        "name" : "targetQuestion",                        
                        "type" : "question"
                    }
                ],                
                "desc" : [
                    " Reference action: Go to",                    
                    "",                    
                    " Redirect the respondent to the specified question.",                    
                    "",                    
                    " When it's reached, this method break the execution flow, it behaves like a Return statement.",                    
                    " Parameters"
                ],                
                "examples" : [
                    " Interview.GoTo(q2)",                    
                    "",                    
                    " ' Example with question inside the loop",                    
                    " ' Go to the second iteration of the question inside the loop",                    
                    " Interview.GoTo(qInLoop.Iteration(2))",                    
                    "",                    
                    " ' Example with EndOfSurvey keyword",                    
                    " ' Go to the end of the survey",                    
                    " Interview.GoTo(EndOfSurvey)",                    
                    "",                    
                    " ' Bad code: Compiler exception",                    
                    " If q1 Has {1} Then",                    
                    "     Interview.GoTo(q1) ",                    
                    "     q2.SetValue(1) ' <= \"Unreachable code\" ",                    
                    " EndIf",                    
                    "",                    
                    " ' Good code",                    
                    " If q1 Has {1} Then",                    
                    "    Interview.GoTo(q2)",                    
                    " Else ",                    
                    "    q2.SkipAndKeepData().SetValue(1) ' <= This code is reachable",                    
                    " EndIf "
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "SetLanguage",                
                "ns" : "masquerwlanguage",                
                "base" : "method",                
                "type" : "interview",                
                "args" : [
                    {
                        "name" : "languageAbbr",                        
                        "type" : "string"
                    }
                ],                
                "desc" : [
                    " Change the language of the current interview.",                    
                    "",                    
                    " Parameters",                    
                    "",                    
                    " - languageAbbr [Required] {String} Abbreviation of the language to use (not case sensitive)"
                ],                
                "examples" : [
                    " Interview.SetLanguage(\"FRA\") ' Interview.LanguageAbbr ' => \"FRA\"",                    
                    " ",                    
                    " Interview.SetLanguage(\"fra\").SetScenario(\"french\")",                    
                    " "
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "SetScenario",                
                "ns" : "masquerwlanguage",                
                "base" : "method",                
                "type" : "interview",                
                "args" : [
                    {
                        "name" : "name",                        
                        "type" : "string"
                    }
                ],                
                "desc" : [
                    " Change the scenario of the current interview (the scenario is also known as the version)",                    
                    "",                    
                    " Parameters",                    
                    "  - name [Required] {String} Name of the scenario to use"
                ],                
                "examples" : [
                    " Interview.SetScenario(\"administrator\")",                    
                    "",                    
                    " ' Example with calls chain",                    
                    " Interview.SetScenario(\"user\").SetLanguage(\"ENG\")"
                ],                
                "version" : "5.4.1.0"
            }
        ],        
        "question" : [
            {
                "name" : "ChangeSubQuestionsOrder",                
                "ns" : "masquerwlanguage",                
                "base" : "method",                
                "type" : "question",                
                "desc" : "Skips a question",                
                "examples" : [
                    " Dim randomOrder = {1; 2; 3}.Shuffle()",                    
                    " ChapterQuestionnaire.ChangeSubQuestionsOrder(randomOrder)"
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "SetValue",                
                "ns" : "masquerwlanguage",                
                "base" : "method",                
                "type" : "question",                
                "args" : [
                    {
                        "name" : "value",                        
                        "type" : "anytype",                        
                        "desc" : "to set"
                    }
                ],                
                "desc" : "Sets a value to a question",                
                "examples" : [
                    " age.SetValue(21) ' => Set age to 21",                    
                    " gender.SetValue(2) ' => set to female",                    
                    " newspapers.SetValue({1;5}) ' => set a set",                    
                    " name.SetValue(\"Peter Holmes\") ' => set a string",                    
                    " today.SetValue(#10/3/1999#) ' => set to female",                    
                    " rating.Iteration(3).SetValue(2) => set a question within a loop"
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "Skip",                
                "ns" : "masquerwlanguage",                
                "base" : "method",                
                "type" : "question",                
                "desc" : "Skips a question",                
                "examples" : [
                    " age.Skip() ' => Skip a question",                    
                    " Demgraphics.Skip() => Skip a whole chapter"
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "SkipAndKeepData",                
                "ns" : "masquerwlanguage",                
                "base" : "method",                
                "type" : "question",                
                "desc" : "Skips a question",                
                "examples" : [
                    " Gender.SkipAndKeepData() ' => Makes the question invisible",                    
                    " Age.SkipAndKeepData().SetValue(21) => Skips the question and sets it in one go"
                ],                
                "version" : "5.4.1.0"
            }
        ]
    }
}, true);

});
