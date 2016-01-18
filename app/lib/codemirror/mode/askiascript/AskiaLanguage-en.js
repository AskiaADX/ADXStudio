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
    "ARRAY" : "array",    
    "DATE" : "date",    
    "NUMBER" : "number",    
    "STRING" : "string"
});

askiaScript.extend(askiaScript.i18n, {
    "types" : {
        "array" : "Array",        
        "date" : "Date",        
        "number" : "Number",        
        "string" : "String"
    },    
    "core" : {
        "array" : {
            "ns" : "askialanguage",            
            "creation" : "Assign a set of values (also an empty set) between curly brackets ({}) and separated by semi colon (;)",            
            "desc" : "Variable which contains a collection of data items that can be selected by indices computed at run-time.",            
            "examples" : [
                " dim my_array = {}",                
                " dim my_numerical_array = {1;2;3}",                
                " dim my_boolean_array = {true;false;true}",                
                " dim my_string_array = {\"a\";\"b\";\"c\"}",                
                " dim my_date_array = {#21/09/2011#;#22/10/2011#;#24/12/2011#}"
            ],            
            "alsoSee" : [
                "Range",                
                "To"
            ],            
            "version" : "5.3.2.0"
        },        
        "date" : {
            "ns" : "askialanguage",            
            "creation" : [
                " <h3>Date:</h3>",                
                " Assign a date to a variable using (between) the hash sign (#) and using slash as separator (/).<br />#DD/MM/YYYY#",                
                " <h3>Time:</h3>",                
                " Assign a time to a variable using (between) the hash sign (#) and using colon as separator (:).<br />#HH:MM[:SS]# The seconds are optional",                
                " <h3>Date and time in one go:</h3>",                
                " Assign a date and time to a variable using (between) the hash sign (#) and using slash as separator (/) for the date and colon (:) for the time. The date and time separated by a space.<br />#DD/MM/YYYY HH:MM[:SS]# format"
            ],            
            "desc" : "Variable which contains date and/or time.",            
            "examples" : [
                " dim my_date = #25/03/2011#",                
                " dim my_time = #16:32#",                
                " dim my_time = #16:32:07#",                
                " dim my_date_time = #25/03/2011 16:32#",                
                " dim my_date_time = #25/03/2011 16:32:07#"
            ],            
            "version" : "5.3.2.0"
        },        
        "number" : {
            "ns" : "askialanguage",            
            "creation" : "Assign a number to a variable.<br/>To create a double or decimal value, the decimal dot period separator is require",            
            "desc" : "Variable which contains a numerical value.<br />The numerical value could be an integer or a double.",            
            "examples" : [
                " dim my_integer = 1",                
                " dim my_negative = -3",                
                " dim my_double = 0.1",                
                " dim my_shorthand_double = .3 ' => same as 0.3"
            ],            
            "version" : "5.3.2.0"
        },        
        "string" : {
            "ns" : "askialanguage",            
            "creation" : [
                " Assign a string value (also an empty string) between double quotes (\").<br/>If the string to assign contains a double quotes it's possible to escape it using the slash character (\\).",                
                " The carriage return is an available characters, that mean that you can write a string in multiple line, the end of the string is the latest non-escape double quotes."
            ],            
            "desc" : "Variable which contains or not characters.",            
            "examples" : [
                " dim my_empty_string = \"\"",                
                " dim email  = \"username@domain.com\"",                
                " dim citation = \"People says: \\\"Bla bla bla\\\"\"",                
                " dim multiline_string = \"Hello world!",                
                " This is",                
                " a multi-line",                
                " string\""
            ],            
            "version" : "5.3.2.0"
        }
    }
}, true);

askiaScript.extend(askiaScript.lexical, {
    "namespaces" : {
        "askialanguage" : {
            "name" : "AskiaLanguage",            
            "ns" : "askialanguage"
        }
    },    
    "versions" : [
        {
            "name" : "5.3.5.0",            
            "ns" : "askialanguage",            
            "desc" : "Include the `Assert` and `Interview` objects and `GoTo` statement"
        },        
        {
            "name" : "5.3.3.0",            
            "ns" : "askialanguage",            
            "desc" : "Include the `Browser` object and additional members mainly for the ADC 2.0"
        },        
        {
            "name" : "5.3.2.0",            
            "ns" : "askialanguage",            
            "desc" : "Initialize version of the AskiaScript 2.0"
        }
    ],    
    "builtin" : [
        {
            "name" : "A",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "deprecated" : true,            
            "prefer" : "Has"
        },        
        {
            "name" : "AAucun",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "deprecated" : true,            
            "prefer" : "HasNone"
        },        
        {
            "name" : "Abs",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "number",                    
                    "type" : "number",                    
                    "desc" : "Object from which to extract the absolute (unsigned) value"
                }
            ],            
            "desc" : "Return the absolute value of a variable. (If the variable value is negative, the number returned will be positive).",            
            "examples" : [
                " Abs ( - 3) ' => Returns 3",                
                " Abs (3) ' => Returns 3"
            ],            
            "alsoSee" : "Number.Abs"
        },        
        {
            "name" : "AEtAucuneAutre",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "deprecated" : true,            
            "prefer" : "HasNoneAndNoOther"
        },        
        {
            "name" : "And",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : [
                " Logical \"And\" between two expressions",                
                " Use this operator to define statements which are based on a specific combination of two or more variables."
            ],            
            "examples" : "(??Q1?? Has {1}) And (??Q2?? Has {1})"
        },        
        {
            "name" : "Annee",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "date1",                    
                    "type" : "date"
                }
            ],            
            "prefer" : "Year"
        },        
        {
            "name" : "AToutes",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "deprecated" : true,            
            "prefer" : "HasAll"
        },        
        {
            "name" : "AToutesEtAucuneAutre",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "deprecated" : true,            
            "prefer" : "HasAllAndNoOther"
        },        
        {
            "name" : "Avg",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "array",                    
                    "type" : "array",                    
                    "desc" : "Array of numbers"
                }
            ],            
            "desc" : "Calculate the numerical average of responses, including DK and NA.",            
            "remarks" : "When used with the responses of question. Encapsulate the responses into the CvDKNa() function to exclude the DK and NA in the calculation.",            
            "examples" : "Avg({5, 8, 11}) ' => 8 ((5 + 8 + 11) / 3)",            
            "alsoSee" : "Array.Avg"
        },        
        {
            "name" : "Break",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "desc" : "Breaks the iteration of the \"For\" loop",            
            "examples" : [
                " ' Loop until a 5 value is found",                
                "",                
                " Dim i",                
                "",                
                " For i = 1 To Q1.Value.Count",                
                " \tIf Q1.Value[i] = 5 Then",                
                " \t\tBreak",                
                " \tEndIf",                
                " Next",                
                "",                
                " ' Here the variable i contains the index of the value 5"
            ],            
            "version" : "5.3.2.0"
        },        
        {
            "name" : "CDate",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "date",            
            "args" : [
                {
                    "name" : "string",                    
                    "type" : "string",                    
                    "desc" : "String to convert to a date"
                }
            ],            
            "desc" : "Use this function to convert the string passed as a parameter.",            
            "remarks" : "This function uses the locale settings of the computer on which the script is running.",            
            "examples" : "CDate(”01/02/2005”) ' => Return 1st of Feb 2005.",            
            "alsoSee" : "String.ToDate"
        },        
        {
            "name" : "CvDkNa",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "number",                    
                    "type" : "number",                    
                    "desc" : "Value to clean"
                },                
                {
                    "name" : "DefaultValue",                    
                    "type" : "number",                    
                    "desc" : "indicate which value to replace it by if not 0",                    
                    "opt" : true
                }
            ],            
            "desc" : [
                " Use this function to convert a numeric question's Askia system codes for \"Don't know\" and \"Not Asked\" into 0 or a specifief default value.",                
                "",                
                " CvDkNa(??Q1??)",                
                " ",                
                "",                
                " You can further define the function to convert all responses, along with the system DKs and NAs, to a binary format 0 or 1.",                
                " The function will convert those values you specify to 1, and all other values to 0."
            ],            
            "examples" : [
                " CvDkNa(??Q1??) = 55",                
                "",                
                " DKs, NAs and any answer except 55 will be coded into: 0.",                
                " The value 55 will be coded into: 1.",                
                "",                
                " CvDkNa(??Q1??,-1)",                
                " will return -1 if Q1 is DK or NA",                
                "",                
                " CvDkNa(??Q1??) Has {5 To 10}",                
                "",                
                " The following values will be coded into 1: 5, 6, 7, 8, 9 and 10.",                
                " The following values will be coded into 0: all other values."
            ]
        },        
        {
            "name" : "CvNrNi",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "number1",                    
                    "type" : "number"
                }
            ],            
            "prefer" : "CvDKNA"
        },        
        {
            "name" : "Date",            
            "ns" : "askialanguage",            
            "base" : "const",            
            "type" : "date",            
            "desc" : [
                " Retrieve the systems current date and time",                
                " Use this function to qualify another askiaScript function, such as:",                
                "",                
                " Hour(Date)",                
                " Day(Date)",                
                " etc…",                
                "",                
                " Furthermore, the function can be used on its own, in which case it will retrieve the system’s current date and time."
            ],            
            "examples" : [
                " Date",                
                "",                
                " if it is January 1st 2004 and the time is 4:30pm, the function will return 01/01/2004 4:30:00 PM."
            ],            
            "alsoSee" : "Now"
        },        
        {
            "name" : "Day",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "date",                    
                    "type" : "date",                    
                    "desc" : "Date to evaluate"
                }
            ],            
            "desc" : [
                " Returns the day of the specified date",                
                " Use this function to retrieve the system's current day as a numerical value."
            ],            
            "remarks" : [
                " By system, we mean the Operating System's Time and Calendar.",                
                " That is, depending on the type of fieldwork undertaken:",                
                "",                
                " Askiavoice: it will be the askiafield CCA's Operating System.",                
                " Askiaweb: it will be the Askia Webprod's Server’s Operating System."
            ],            
            "examples" : [
                " Day(Now)",                
                "",                
                " if the day is the 1st of January the function will return 1."
            ],            
            "alsoSee" : "Date.Day"
        },        
        {
            "name" : "Dim",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "declare" : true,            
            "creation" : [
                " Use the <strong>dim</strong> keyword to declare a variable in AskiaScript (VB-like syntax) followed by the name of the variable.",                
                " The name of the variable:<br />- has to begin with a letter or underscore ( _ )<br />- can only contain alphanumeric characters and underscores ( _ )<br />- can't contain any spaces<br />- isn't already used in the same scope<br />- is not a reserved keyword or question shortcut<br />",                
                " Unlike a question variable, there is no work around for the above rules (^my variable^ is not allowed).",                
                " <h3>Assignment:</h3>",                
                " You can assign a value to a declarative variable using the equal sign (=)<br />It's possible to assign a value after or during the declaration of the variable."
            ],            
            "desc" : [
                " Declare a local variable",                
                " A local variable is a custom variable created in the AskiaScript to store and manipulate temporary data.",                
                " A local variable is on the local scope, that means that it's only available during the execution of the condition/action or in the context (label) of the inline script"
            ],            
            "remarks" : [
                " The first assignment of the variable determines it's final type; the type of the variable can't be changed during the AskiaScript execution",                
                " For the declarative variable, if you want to compare value, you also use the sign = but you encapsulate the condition with brackets:",                
                "",                
                " my_variable = 12 ‘=> Assignment",                
                " (my_variable = 12) ‘=> Comparison",                
                "",                
                " The Boolean value is internally a number when zero means false and all others values are interpreted as true.",                
                " So it's possible to use all properties / methods and operators available for the numbers."
            ],            
            "examples" : [
                " dim my_variable",                
                " my_variable = 1",                
                " ' OR",                
                " dim my_variable = 1",                
                "",                
                " Summary:",                
                " Dim my_variable = 0 ‘=> define my_variable as number",                
                " Dim my_variable = \"\" ‘=> define my_variable as string",                
                " Dim my_variable = {} ‘=> define my_variable as array",                
                " Dim my_variable = #25/03/2011# ‘=> define my_variable as date",                
                " Dim my_variable = #16:32:00# ‘=> define my_variable as time",                
                " Dim my_variable = #25/03/2011 16:32:00# ‘=> define my_variable as date and time",                
                " Dim my_variable = true ‘=> define my_variable as Boolean"
            ],            
            "version" : "5.3.2.0"
        },        
        {
            "name" : "DK",            
            "ns" : "askialanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : [
                " Use this operator to refer to the system \"Don't know\" response.",                
                "",                
                " DK can be used only with the following variable types:",                
                " Numerical question",                
                " Closed question",                
                " Loops",                
                " Internally it is stored as -999999.99"
            ],            
            "remarks" : [
                " To refer to an Open question's Don't Know response, use the following syntax:",                
                "",                
                " ??Q1??=\"\"",                
                "",                
                " to refer to a multiple, use the following syntax:",                
                " ??Q1?? = {}"
            ],            
            "examples" : "??Q1?? = DK"
        },        
        {
            "name" : "Else",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "open" : "If",            
            "close" : "EndIf",            
            "desc" : "Part of the If / Then / Else statement. Evaluate the code between \"Else\" and \"EndIf\" when the condition of the \"If\" (or \"ElseIf\")statement is false",            
            "remarks" : "The ElseIf and Else clauses are both optional. You can have as many ElseIf clauses as you want in an If...Then...Else statement, but no ElseIf clause can appear after an Else clause. If...Then...Else statements can be nested within each other.",            
            "examples" : [
                " If [Condition] Then",                
                "   …",                
                " EndIf",                
                "",                
                "",                
                " If [Condition] Then",                
                "   …",                
                " Else",                
                "   …",                
                " EndIf",                
                "",                
                "",                
                " If [Condition] Then",                
                "   …",                
                " ElseIf [Condition] Then",                
                "   …",                
                " Else",                
                "   …",                
                " EndIf"
            ],            
            "version" : "5.3.2.0"
        },        
        {
            "name" : "ElseIf",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "open" : "If",            
            "close" : "EndIf",            
            "desc" : "Part of the If / Then / Else statement. Evaluate the code between \"ElseIf\" and \"EndIf\" (or \"Else\") when the condition of the \"If\" statement (or preceding \"ElseIf\") is false and when the condition of the \"ElseIf\" is true",            
            "remarks" : "The ElseIf and Else clauses are both optional. You can have as many ElseIf clauses as you want in an If...Then...Else statement, but no ElseIf clause can appear after an Else clause. If...Then...Else statements can be nested within each other.",            
            "examples" : [
                " If [Condition] Then",                
                "   …",                
                " EndIf",                
                "",                
                "",                
                " If [Condition] Then",                
                "   …",                
                " Else",                
                "   …",                
                " EndIf",                
                "",                
                "",                
                " If [Condition] Then",                
                "   …",                
                " ElseIf [Condition] Then",                
                "   …",                
                " Else",                
                "   …",                
                " EndIf"
            ],            
            "version" : "5.3.2.0"
        },        
        {
            "name" : "End",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "open" : "If",            
            "remarks" : "The ElseIf and Else clauses are both optional. You can have as many ElseIf clauses as you want in an If...Then...Else statement, but no ElseIf clause can appear after an Else clause. If...Then...Else statements can be nested within each other.",            
            "examples" : [
                " If [Condition] Then",                
                "   …",                
                " End If",                
                "",                
                "",                
                " If [Condition] Then",                
                "   …",                
                " Else",                
                "   …",                
                " End If",                
                "",                
                "",                
                " If [Condition] Then",                
                "   …",                
                " ElseIf [Condition] Then",                
                "   …",                
                " Else",                
                "   …",                
                " EndIf"
            ],            
            "prefer" : "EndIf",            
            "version" : "5.3.2.0"
        },        
        {
            "name" : "EndIf",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "open" : "If",            
            "desc" : "Part of the If / Then / Else statement. Indicates the end of the \"If\" statement",            
            "remarks" : "The ElseIf and Else clauses are both optional. You can have as many ElseIf clauses as you want in an If...Then...Else statement, but no ElseIf clause can appear after an Else clause. If...Then...Else statements can be nested within each other.",            
            "examples" : [
                " If [Condition] Then",                
                "   …",                
                " EndIf",                
                "",                
                "",                
                " If [Condition] Then",                
                "   …",                
                " Else",                
                "   …",                
                " EndIf",                
                "",                
                "",                
                " If [Condition] Then",                
                "   …",                
                " ElseIf [Condition] Then",                
                "   …",                
                " Else",                
                "   …",                
                " EndIf"
            ],            
            "version" : "5.3.2.0"
        },        
        {
            "name" : "Entier",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "number1",                    
                    "type" : "number"
                }
            ],            
            "prefer" : "Int"
        },        
        {
            "name" : "EstInclusDans",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "deprecated" : true,            
            "prefer" : "IsIncludedIn"
        },        
        {
            "name" : "Et",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "deprecated" : true,            
            "prefer" : "And"
        },        
        {
            "name" : "Exit",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "desc" : "Breaks the iteration of the \"For\" loop",            
            "examples" : [
                " ' Loop until a 5 value is found",                
                "",                
                " Dim i",                
                "",                
                " For i = 1 To Q1.Value.Count",                
                " \tIf Q1.Value[i] = 5 Then",                
                " \t\tExit For",                
                " \tEndIf",                
                " Next",                
                "",                
                " ' Here the variable i contains the index of the value 5"
            ],            
            "version" : "5.3.2.0"
        },        
        {
            "name" : "False",            
            "ns" : "askialanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : "Use this operator to qualify a statement, thereby enabling you to save time and increase clarity when defining conditions.",            
            "examples" : [
                " The two following statements are equivalent, but the use of false simplifies the first one:",                
                "",                
                " Negative statement: (??Q1??=2 And ??Q2??=5)=False",                
                "",                
                " Positive statement: (??Q1??=1 Or ??Q1??=3 Or ??Q1??=4 Or ??Q1??=5) And (??Q2??=1 Or ??Q2??=2 Or ??Q2??=3 Or ??Q2??=4)"
            ]
        },        
        {
            "name" : "Faux",            
            "ns" : "askialanguage",            
            "base" : "const",            
            "type" : "number",            
            "deprecated" : true,            
            "prefer" : "False"
        },        
        {
            "name" : "FindIndexIn",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "array",                    
                    "type" : "array",                    
                    "desc" : "Array where the search will be performed"
                },                
                {
                    "name" : "value",                    
                    "type" : "number",                    
                    "desc" : "Value to find in the array"
                }
            ],            
            "desc" : [
                " Search for and return the first index position of a value in the specified array",                
                "",                
                " FindIndexIn(set, value)",                
                "",                
                " This keyword returns the position of a specific value in the specified set."
            ],            
            "examples" : [
                " FindIndexIn ( { 1; 5; 3} , 5 ) will return 2.",                
                "",                
                " This is useful to when transforming a question using entry codes into index."
            ],            
            "alsoSee" : "Array.IndexOf"
        },        
        {
            "name" : "For",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "close" : "Next",            
            "desc" : [
                " Creates a programmatic loop for each number between the start and the end specify number",                
                " In most programming language the loop for is use to repeat the expression nth times according to the StartIndex and EndIndex (in AskiaScript the step is always 1).",                
                " The loop iteration end when the EndIndex is higher than the specify value or when his body expression reached a break or return statement.",                
                "",                
                " Syntax:",                
                " For [StartIndex] To [EndIndex]",                
                "   [Body]",                
                " Next",                
                "",                
                " - The [StartIndex] expression initialize a counter variable which will be incremented (+ 1) after the Next statement.",                
                " - The [EndIndex] expression indicates when the loop should finish",                
                " - The [Body] is any legal AskiaScript expression to repeat"
            ],            
            "examples" : [
                " ' Creates an array with all answers greater than 5",                
                " Dim IllegibleBrands = {}  '  Array with answers greater than 5",                
                "",                
                " For i = 1 To brands.Values.Count",                
                "",                
                "   If brands.Values[i] > 5 Then",                
                "     IllegibleBrands.Insert( brands.Values[i] )",                
                "   EndIf",                
                "",                
                " Next i"
            ],            
            "version" : "5.3.2.0"
        },        
        {
            "name" : "Format",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "value",                    
                    "type" : "number",                    
                    "desc" : "Number to format"
                },                
                {
                    "name" : "decimals",                    
                    "type" : "number",                    
                    "desc" : "Number of decimals value"
                }
            ],            
            "desc" : "Format a numeric value with the specified number of decimals",            
            "remarks" : "It returns a string so if you would like to use it in a numerical variable, use val(Format(??Q1??,2))",            
            "examples" : [
                " Format(3.14159265, 2) ' => 3.14",                
                " Format(4 / 3, 5) ' => 1.33333"
            ],            
            "alsoSee" : "Number.Format"
        },        
        {
            "name" : "ForMax",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "variant",            
            "args" : [
                {
                    "name" : "counter",                    
                    "type" : "string",                    
                    "desc" : "Counter of iteration"
                },                
                {
                    "name" : "upperBound",                    
                    "type" : "number",                    
                    "desc" : "Indicates the max number of iteration to do"
                },                
                {
                    "name" : "expression",                    
                    "type" : "variant",                    
                    "desc" : "Expression to evaluate and used by the maximum comparison"
                }
            ],            
            "desc" : "Shorthand to perform a for-loop and to return the maximum value found during iterations",            
            "remarks" : [
                " The ForSum, ForSet, ForMin, ForMax was introduced before the for-loop syntax.<br/>Thoses form of loop is more concise but less readable than his equivalent for-loop syntax.",                
                " Even if the for-loop syntax is more verbose, we recommend you to use that syntax instead."
            ],            
            "examples" : [
                " ForMax(\"i\", 3, i + 1) ' => 4",                
                "",                
                " ' Similar than:",                
                " ' Dim i",                
                " ' Dim maxValue = 0'",                
                " ' Dim currentValue = 0",                
                " ' For i = 1 To 3",                
                " '     currentValue = (i + 1)",                
                " '     If currentValue > maxValue Then",                
                " '         maxValue = currentValue",                
                " '     EndIf",                
                " ' Next",                
                " ' Return maxValue"
            ],            
            "alsoSee" : "For"
        },        
        {
            "name" : "ForMin",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "args" : [
                {
                    "name" : "counter",                    
                    "type" : "string",                    
                    "desc" : "Counter of iteration"
                },                
                {
                    "name" : "upperBound",                    
                    "type" : "number",                    
                    "desc" : "Indicates the max number of iteration to do"
                },                
                {
                    "name" : "expression",                    
                    "type" : "variant",                    
                    "desc" : "Expression to evaluate and used by the minimum comparison"
                }
            ],            
            "desc" : "Shorthand to perform a for-loop and to return the minimum value found during iterations",            
            "remarks" : [
                " The ForSum, ForSet, ForMin, ForMax was introduced before the for-loop syntax.<br/>Thoses form of loop is more concise but less readable than his equivalent for-loop syntax.",                
                " Even if the for-loop syntax is more verbose, we recommend you to use that syntax instead."
            ],            
            "examples" : [
                " ForMin(\"i\", 3, i + 1) ' => 2",                
                "",                
                " ' Similar than:",                
                " ' Dim i",                
                " ' Dim minValue = 999999 ' Start with a big value for the initial comparison",                
                " ' Dim currentValue = 0",                
                " ' For i = 1 To 3",                
                " '     currentValue = (i + 1)",                
                " '     If currentValue < minValue Then",                
                " '         minValue = currentValue",                
                " '     EndIf",                
                " ' Next",                
                " ' Return minValue"
            ],            
            "alsoSee" : "For"
        },        
        {
            "name" : "ForSet",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "variant",            
            "args" : [
                {
                    "name" : "counter",                    
                    "type" : "string",                    
                    "desc" : "Counter of iteration"
                },                
                {
                    "name" : "upperBound",                    
                    "type" : "number",                    
                    "desc" : "Indicates the max number of iteration to do"
                },                
                {
                    "name" : "expression",                    
                    "type" : "variant",                    
                    "desc" : "Expression to evaluate and append in the result array"
                }
            ],            
            "desc" : "Shorthand to perform a for-loop and to append the value of the expression, during the iteration, into an array",            
            "remarks" : [
                " The ForSum, ForSet, ForMin, ForMax was introduced before the for-loop syntax.<br/>Thoses form of loop is more concise but less readable than his equivalent for-loop syntax.",                
                " Even if the for-loop syntax is more verbose, we recommend you to use that syntax instead."
            ],            
            "examples" : [
                " ForSet(\"i\", 3, i + 1) ' => {2; 3; 4} ({1 + 1; 2 + 1; 3 + 1})",                
                "",                
                " ' Similar than:",                
                " ' Dim i",                
                " ' Dim dataSet = {}'",                
                " ' For i = 1 To 3",                
                " '     dataSet.Insert((i + 1))",                
                " ' Next",                
                " ' Return dataSet"
            ],            
            "alsoSee" : "For"
        },        
        {
            "name" : "ForSum",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "variant",            
            "args" : [
                {
                    "name" : "counter",                    
                    "type" : "string",                    
                    "desc" : "Counter of iteration"
                },                
                {
                    "name" : "upperBound",                    
                    "type" : "number",                    
                    "desc" : "Indicates the max number of iteration to do"
                },                
                {
                    "name" : "expression",                    
                    "type" : "variant",                    
                    "desc" : "Expression to evaluate and used in the addition"
                }
            ],            
            "desc" : "Shorthand to perform a for-loop and to sum the result of each iteration",            
            "remarks" : [
                " The ForSum, ForSet, ForMin, ForMax was introduced before the for-loop syntax.<br/>Thoses form of loop is more concise but less readable than his equivalent for-loop syntax.",                
                " Even if the for-loop syntax is more verbose, we recommend you to use that syntax instead."
            ],            
            "examples" : [
                " ForSum(\"i\", 3, i + 1) ' => 9 (2 + 3 + 4)",                
                "",                
                " ' Similar than:",                
                " ' Dim i",                
                " ' Dim sumValue = 0",                
                " ' For i = 1 To 3",                
                " '     sumValue = sumValue + (i + 1)",                
                " ' Next",                
                " ' Return sumValue",                
                "",                
                "",                
                " ForSum(\"i\", 2, ??Q1??[i]) ' => ??Q1??[1] + ??Q1??[2]"
            ],            
            "alsoSee" : "For"
        },        
        {
            "name" : "GetParameter",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "parameters",                    
                    "type" : "string",                    
                    "desc" : "Full list of parameters"
                },                
                {
                    "name" : "index",                    
                    "type" : "number",                    
                    "desc" : "Index of the parameter to extract"
                },                
                {
                    "name" : "separator",                    
                    "type" : "string",                    
                    "desc" : "Separator used to split parameters (comma by default)",                    
                    "opt" : true
                }
            ],            
            "desc" : [
                " Use this function to retrieve a parameter or value from a string of characters.",                
                " In other words, the function will scan the specified string of characters and retrieve a parameter according to the specified position.",                
                " The function distinguishes parameters, and therefore their position, via the , separator."
            ],            
            "remarks" : "The function return a number so the parameters should be numbers",            
            "examples" : [
                " GetParameter(\"11,22,33,44\", 3)",                
                "",                
                " In this case the function will return 33.",                
                "",                
                " GetParameter(\"11,22,33,44\", ??Q1??)",                
                "",                
                " if Q1 = 1, the function will return 11.",                
                "",                
                " It is also possible to use a specific separator:",                
                "",                
                " GetParameter(\"11;22;33;44\", 3, \";\")",                
                "",                
                " In this case the function will return 33."
            ],            
            "alsoSee" : [
                "String.Split",                
                "String.SplitToNumbers"
            ]
        },        
        {
            "name" : "GoTo",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "useLabel" : true,            
            "desc" : [
                " The GoTo statement give you a way to explicitly tell to the process the next line to execute.",                
                " After the GoTo statement, the process will ignore all next lines until it found the label associated with the GoTo",                
                "",                
                " It could be very useful to share some part of code between multiple If / Else condition or to simply avoid the execution of certains code."
            ],            
            "remarks" : "<strong>GoTo</strong> can only move forward, you can't use <strong>GoTo</strong> to go back in the code",            
            "examples" : [
                " dim something = \"\"",                
                "",                
                " If q1 Has {1} Then",                
                "    something = \"Q1\"",                
                "    GoTo SomethingHas1",                
                " Else If q2 Has {1} Then",                
                "    something = \"Q2\"",                
                "    GoTo SomethingHas1",                
                " EndIf",                
                "",                
                " ' This part of code is not executed if some questions has {1}",                
                " If q1 Has {2} Then",                
                "    something = \"Q1\"",                
                "    GoTo SomethingHas2",                
                " Else If q2 Has {2} Then",                
                "    something = \"Q2\"",                
                "    GoTo SomethingHas2",                
                " EndIf",                
                "",                
                " ' This part of code is not executed if q1 and q2 has not 1 and 2",                
                " something = \"Not found\"",                
                " GoTo Result",                
                "",                
                " ' This part of code is executed only when q1 or q2 has {1}",                
                " SomethingHas1:",                
                " something = something + \" HAS {1}\"",                
                " GoTo Result",                
                "",                
                " ' This part of code is executed only when q1 or q2 has {2} and not has {1}",                
                " SomethingHas2:",                
                " something = something + \" HAS {2}\"",                
                " GoTo Result",                
                "",                
                " ' This part of code is always executed",                
                " Result:",                
                " Return \"The result is '\" + something + \"'\"",                
                "",                
                "",                
                " ' The previous code will produce the following output:",                
                "",                
                " '    \"The result is 'Q1 HAS {1}'\" when Q1 has {1}",                
                " '    otherwise: \"The result is 'Q2 HAS {1}'\" when q2 Has {1}",                
                " '    otherwise: \"The result is 'Q1 HAS {2}'\" when q1 Has {2}",                
                " '    otherwise: \"The result is 'Q2 HAS {2}'\" when q2 Has {2}",                
                " '    otherwise: \"The result is 'Not found'\""
            ],            
            "version" : "5.3.5.0"
        },        
        {
            "name" : "Has",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : "This function checks that at least one of the referenced response items was selected. If this is the case, the function returns 1; otherwise, it returns 0.",            
            "examples" : [
                " For example:",                
                "",                
                " Q1 Has {2;3}",                
                "",                
                " will return 1 if either the second or third response were selected."
            ]
        },        
        {
            "name" : "HasAll",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : "This function checks that all of the referenced response items were selected. Note that other responses may be selected as well and the function will still return 1.",            
            "examples" : [
                " For example:",                
                "",                
                " Q1 HasAll {2;3}",                
                "",                
                " will return 1 if the respondent answered 1, 2 and 3."
            ]
        },        
        {
            "name" : "HasAllAndNoOther",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : "This is similar to “HasAll”, but it returns 0 if the respondent selected any responses other than those in the list. In other words, the selected response must match the list exactly.",            
            "examples" : [
                " For example:",                
                "",                
                " Q1 HasAllAndNoOther {2;3}  ‘=>equivalent to Q1 = {2;3}",                
                "",                
                " will return 1 if the respondent answered 2 and 3, but 0 if she answered 1, 2 and 3 (because 1 is not in the list of qualified values)."
            ]
        },        
        {
            "name" : "HasAndNoOther",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : "This function checks that at least one of the specified responses was selected by the respondent. However, if any responses not in the list were selected, then the function returns 0.",            
            "examples" : [
                " For example:",                
                "",                
                " Q1 HasAndNoOther {2;3}",                
                "",                
                " will return 1 if the respondent selected response 2. If he selected responses 1 and 2, the function will return 0 (because 1 is not in the list)."
            ]
        },        
        {
            "name" : "HasNone",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : "This is the opposite of “has”. It returns 1 if none of the specified response items were selected by the respondent.",            
            "examples" : [
                " For example:",                
                "",                
                " Q1 HasNone {2;3}",                
                "",                
                " will return 1 if the second and third response were not selected."
            ]
        },        
        {
            "name" : "Heure",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "date1",                    
                    "type" : "date"
                }
            ],            
            "prefer" : [
                "Hour",                
                "Date.Hour"
            ]
        },        
        {
            "name" : "Hour",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "date",                    
                    "type" : "date",                    
                    "desc" : "Date to evaluate"
                }
            ],            
            "desc" : "Use this function to retrieve the system's current hour as a numerical value.",            
            "remarks" : [
                " By system, we mean the Operating System's Time and Calendar.",                
                " That is, depending on the type of fieldwork undertaken:",                
                "",                
                " Askiavoice: it will be the askiafield CCA's Operating System.",                
                " Askiaweb: it will be the Askia Webprod's Server's Operating System."
            ],            
            "examples" : [
                " Hour(Now)",                
                "",                
                " if the time is the 10:35 p.m. the function will return 10."
            ],            
            "alsoSee" : "Date.Hour"
        },        
        {
            "name" : "If",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "close" : "EndIf",            
            "desc" : "Part of the If / Then / Else statement. Evaluate the code between \"If\" and \"EndIf\" (or \"Else\" or \"ElseIf\") when the condition is true",            
            "remarks" : "The ElseIf and Else clauses are both optional. You can have as many ElseIf clauses as you want in an If...Then...Else statement, but no ElseIf clause can appear after an Else clause. If...Then...Else statements can be nested within each other.",            
            "examples" : [
                " If [Condition] Then",                
                "   …",                
                " EndIf",                
                "",                
                "",                
                " If [Condition] Then",                
                "   …",                
                " Else",                
                "   …",                
                " EndIf",                
                "",                
                "",                
                " If [Condition] Then",                
                "   …",                
                " ElseIf [Condition] Then",                
                "   …",                
                " Else",                
                "   …",                
                " EndIf"
            ],            
            "version" : "5.3.2.0"
        },        
        {
            "name" : "In",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : "Test if at least one value is included in the expression on left of the keyword. Same as \"IsIncludedIn\" keyword",            
            "examples" : [
                " dim i = {1;2}",                
                " i In {1} ' => False",                
                " i In {1;2} ' => True",                
                " i In {2;1} ' => True",                
                " i In {1;2;3} ' => True",                
                " i In {4} ' => False"
            ],            
            "alsoSee" : "IsIncludedIn"
        },        
        {
            "name" : "IndexOfMax",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "data",                    
                    "type" : "array",                    
                    "desc" : "Data from where the search will be performed"
                },                
                {
                    "name" : "nthHighest",                    
                    "type" : "number",                    
                    "desc" : "nth highest index to obtain. (1st by default)",                    
                    "opt" : true
                }
            ],            
            "desc" : [
                " Use this function to return the index of the nth biggest value in a set. The ”NTh” parameter is optional and is defaulted to 1.",                
                " Return DK if out of bounds"
            ],            
            "examples" : [
                " IndexOfMax ( {10; 20; 3; 1} )  returns 2",                
                " IndexOfMax ( {10; 20; 3; 1} ,2 )  returns 1"
            ],            
            "alsoSee" : "Array.IndexOfMax"
        },        
        {
            "name" : "IndexOfMin",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "data",                    
                    "type" : "array",                    
                    "desc" : "Data from where the search will be performed"
                },                
                {
                    "name" : "nthLowest",                    
                    "type" : "number",                    
                    "desc" : "nth lowest index to obtain. (1st by default)",                    
                    "opt" : true
                }
            ],            
            "desc" : [
                " Use this function to return the index of the nth smallest value in a set. The ”NTh” parameter is optional and defaults to 1.",                
                " Return DK if out of bounds"
            ],            
            "examples" : [
                " IndexOfMin ( {10; 20; 3; 1} )  returns 4",                
                " IndexOfMin ( {10; 20; 3; 1} ,2 )  returns 3"
            ],            
            "alsoSee" : "Array.IndexOfMin"
        },        
        {
            "name" : "InStr",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "find",                    
                    "type" : "string",                    
                    "desc" : "Text to find in the string"
                },                
                {
                    "name" : "text",                    
                    "type" : "string",                    
                    "desc" : "String in which to perform the search"
                }
            ],            
            "desc" : [
                " Use this function to scan the response given to an open question, searching for a specific word or string of characters.",                
                " If the specified string of characters is found, the function will return its position, from 1 onwards, and if not, the function will return 0."
            ],            
            "remarks" : [
                " This function is not case sensitive",                
                " It will return only one value, regardless of whether or not the response contains the specified string of characters more than once."
            ],            
            "examples" : [
                " InStr(\"CDE\", ??Q1??)",                
                "",                
                " if, during data collection Q1=”ABCDEFGHIJKLMNOPQRSTUVWXYZ”",                
                " the function returns the value 3."
            ],            
            "alsoSee" : "String.IndexOf"
        },        
        {
            "name" : "Int",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "number",                    
                    "type" : "number",                    
                    "desc" : "Number to truncate"
                }
            ],            
            "desc" : [
                " Abbreviation for Integer.",                
                " Calculates the integer value of a numeric value containing decimals."
            ],            
            "remarks" : "this function truncates decimal values, so Int(2.879) will return 2.",            
            "examples" : [
                " Int(??Q1??)",                
                "",                
                " if Q1=3.27 the function will return 3."
            ],            
            "alsoSee" : [
                "Number.ToInt",                
                "Number.Round",                
                "Number.Floor",                
                "Number.Ceil"
            ]
        },        
        {
            "name" : "Intersection",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : [
                " This function retrieves the common values of two sets.",                
                " Comparing the selected responses to two questions, and discovers which were selected in both:"
            ],            
            "remarks" : [
                " The order which is kept is the one of the left set:",                
                "",                
                " If Q7={13;4;2;11}:",                
                "",                
                " {1 to 10} intersection Q7 ‘=>the function will return {2;4}",                
                " Q7 intersection {1 to 10} ‘=>the function will return {4;2}"
            ],            
            "examples" : [
                " Q4 Intersection Q5",                
                "",                
                " If Q4={2;4} (i.e. responses 2 and 4 were selected) and Q5={3;4;7} (responses 3, 4 and 7 were selected), the function will return {4}.",                
                "",                
                " Q6 Intersection {3;5;9}",                
                "",                
                " If Q6={2;4}, the function will return nothing."
            ]
        },        
        {
            "name" : "IsDate",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "string",                    
                    "type" : "string",                    
                    "desc" : "String to evaluate"
                },                
                {
                    "name" : "format",                    
                    "type" : "string",                    
                    "desc" : "Format of the date using dd MM yyyy",                    
                    "opt" : true
                }
            ],            
            "desc" : "Use this function to verify that one or more responses conforms to the date format (dd/mm/yy or dd/mm/yyyy).",            
            "examples" : [
                " IsDate(??Q1??)",                
                " IsDate(??Day??+\"/\"+??Month??+\"/\"+??Year??)"
            ],            
            "alsoSee" : "String.IsDate"
        },        
        {
            "name" : "IsEmail",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "string",                    
                    "type" : "string",                    
                    "desc" : "String to evaluate"
                }
            ],            
            "desc" : [
                " Use this function to verify that a response conforms to a valid email address format, i.e. x@x.xxx",                
                " It checks for the following characters; if any are present, the function returns false:",                
                " àâäãçéèêëìîïòôöõùûüñ &*?!:;,\t#~\"^¨%$£?²¤§%()[]{}|\\/`'<> and space .. and ... and @@"
            ],            
            "examples" : "IsEmail(??Q1??)",            
            "alsoSee" : "String.IsEmail"
        },        
        {
            "name" : "IsIncludedIn",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : "Test if at least one value is included in the expression on left of the keyword. Same as \"In\" keyword",            
            "examples" : [
                " dim i = {1;2}",                
                " i IsIncludedIn {1} ' => False",                
                " i IsIncludedIn {1;2} ' => True",                
                " i IsIncludedIn {2;1} ' => True",                
                " i IsIncludedIn {1;2;3} ' => True",                
                " i IsIncludedIn {4} ' => False"
            ],            
            "alsoSee" : "In"
        },        
        {
            "name" : "IsUKPostcode",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "string0",                    
                    "type" : "string"
                }
            ],            
            "desc" : "This keyword tests whether the specified item is a valid UK Postcode, and returns true or false as appropriate.",            
            "examples" : "IsUKPostCode(\"L1 4AB\")"
        },        
        {
            "name" : "Jour",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "date1",                    
                    "type" : "date"
                }
            ],            
            "prefer" : [
                "Day",                
                "Date.Day"
            ]
        },        
        {
            "name" : "Khi2",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "sigma",                    
                    "type" : "number",                    
                    "desc" : "Sigma"
                },                
                {
                    "name" : "degreesOfFreedom",                    
                    "type" : "number",                    
                    "desc" : "Degrees of freedom"
                }
            ],            
            "desc" : "Calculate the Chi2"
        },        
        {
            "name" : "LCase",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "string",                    
                    "type" : "string",                    
                    "desc" : "String to convert"
                }
            ],            
            "desc" : "Use this function to return the specified string converted to lowercase.",            
            "examples" : "LCase(\"ABC\") returns \"abc\"",            
            "alsoSee" : "String.ToLowerCase"
        },        
        {
            "name" : "Len",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "string",                    
                    "type" : "string",                    
                    "desc" : "String to evaluate"
                }
            ],            
            "desc" : "Use this function to calculate the length of a string of characters and retrieve that length as a numerical value.",            
            "remarks" : "The function includes spaces when measuring the length of a string of characters, so that if Q1=\"A B\" the function would return 3.",            
            "examples" : [
                " Len(??Q1??)",                
                "",                
                " if Q1=\"ABCDEFGHIJKLMNOPQRSTUVWXYZ\", the function will return: 26."
            ],            
            "alsoSee" : "String.Length"
        },        
        {
            "name" : "Max",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "data",                    
                    "type" : "array",                    
                    "desc" : "Data set"
                }
            ],            
            "desc" : "Returns the highest value of a data set",            
            "examples" : "Max({2; 3; 10; 5; 8}) ' => 10",            
            "alsoSee" : "Array.Max"
        },        
        {
            "name" : "Mid",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "string",                    
                    "type" : "string",                    
                    "desc" : "String from which to extract the sub-string"
                },                
                {
                    "name" : "start",                    
                    "type" : "number",                    
                    "desc" : "Index of character from which to start the extraction"
                },                
                {
                    "name" : "length",                    
                    "type" : "number",                    
                    "desc" : "Length of the sub-string to extract",                    
                    "opt" : true
                }
            ],            
            "desc" : [
                " Use this function to extract a sub-string from a given position within the specified string.",                
                " The first parameter is the string from which you want to extract the sub-string.",                
                " The second parameter is the starting position of the sub-string.",                
                " The third is the length of the sub-string."
            ],            
            "examples" : [
                " Mid(??Q1??, 5, 10)",                
                "",                
                " if Q1=\"ABCDEFGHIJKLMNOPQRSTUVWXYZ\", the function will return: EFGHIJKLMN",                
                " (i.e. starting at position 5 in Q1, and comprising the next 10 characters)."
            ],            
            "alsoSee" : "String.Substring"
        },        
        {
            "name" : "Min",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "data",                    
                    "type" : "array",                    
                    "desc" : "Data set"
                }
            ],            
            "desc" : "Returns the lowest value of a data set",            
            "examples" : "Min({2; 3; 10; 5; 8}) ' => 2",            
            "alsoSee" : "Array.Min"
        },        
        {
            "name" : "Minute",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "date",                    
                    "type" : "date",                    
                    "desc" : "Date to evaluate"
                }
            ],            
            "desc" : "Use this function to retrieve the system's current minute as a numerical value.",            
            "remarks" : [
                " By system, we mean the Operating System's Time and Calendar.",                
                " That is, depending on the type of fieldwork undertaken:",                
                "",                
                " Askiavoice: it will be the askiafield CCA's Operating System.",                
                " Askiaweb: it will be the Askia Webprod's Server’s Operating System."
            ],            
            "examples" : [
                " Minute(Now)",                
                "",                
                " if the time is the 10:35 p.m. the function will return 35."
            ],            
            "alsoSee" : "Date.Minute"
        },        
        {
            "name" : "Mod",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : "Modulo operator. Returns the remainder of the division",            
            "examples" : [
                " Q1 Mod Q2",                
                "",                
                " If Q1=15, and Q2=2, the function will return 1."
            ]
        },        
        {
            "name" : "Mois",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "date1",                    
                    "type" : "date"
                }
            ],            
            "prefer" : [
                "Month",                
                "Date.Month"
            ]
        },        
        {
            "name" : "Month",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "date",                    
                    "type" : "date",                    
                    "desc" : "Date to evaluate"
                }
            ],            
            "desc" : "Use this function to retrieve the system's current month as a numerical value.",            
            "remarks" : [
                " By system, we mean the Operating System's Time and Calendar.",                
                " That is, depending on the type of fieldwork undertaken:",                
                "",                
                " Askiavoice: it will be the askiafield CCA's Operating System.",                
                " Askiaweb: it will be the Askia Webprod's Server's Operating System."
            ],            
            "examples" : [
                " Month(Now)",                
                "",                
                " if the date is January 1st, the function will return 1."
            ],            
            "alsoSee" : "Date.Month"
        },        
        {
            "name" : "MonthAsString",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "date",                    
                    "type" : "date",                    
                    "desc" : "Date from where to extract the month"
                }
            ],            
            "desc" : "Use this function to retrieve the system's current month as a string of characters.",            
            "remarks" : [
                " This function is not multi-lingual, so it will not return a string value according to the languages defined in a multi-lingual questionnaire.",                
                " The function will systematically return the string values in English.",                
                " By system, we mean the Operating System's Time and Calendar.",                
                " That is, depending on the type of fieldwork undertaken:",                
                "",                
                " Askiavoice: it will be the askiafield CCA's Operating System.",                
                " Askiaweb: it will be the Askia Webprod's Server's Operating System."
            ],            
            "examples" : [
                " MonthAsString(Now)",                
                "",                
                " if the date is January 1st, the function will return January."
            ]
        },        
        {
            "name" : "Moy",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "array1",                    
                    "type" : "array"
                }
            ],            
            "prefer" : [
                "Avg",                
                "Array.Avg"
            ]
        },        
        {
            "name" : "Next",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "open" : "For",            
            "desc" : [
                " Indicates the end of the loop and the start of the next iteration",                
                " Creates a programmatic loop for each number between the start and the end specify number",                
                " In most programming language the loop for is use to repeat the expression nth times according to the StartIndex and EndIndex (in AskiaScript the step is always 1).",                
                " The loop iteration end when the EndIndex is higher than the specify value or when his body expression reached a break or return statement.",                
                "",                
                " Syntax:",                
                " For [StartIndex] To [EndIndex]",                
                "   [Body]",                
                " Next",                
                "",                
                " - The [StartIndex] expression initialize a counter variable which will be incremented (+ 1) after the Next statement.",                
                " - The [EndIndex] expression indicates when the loop should finish",                
                " - The [Body] is any legal AskiaScript expression to repeat"
            ],            
            "examples" : [
                " ' Creates an array with all answers greater than 5",                
                " Dim IllegibleBrands = {}  '  Array with answers greater than 5",                
                "",                
                " For i = 1 To brands.Values.Count",                
                "",                
                "   If brands.Values[i] > 5 Then",                
                "     IllegibleBrands.Insert( brands.Values[i] )",                
                "   EndIf",                
                "",                
                " Next i"
            ]
        },        
        {
            "name" : "Non",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "number1",                    
                    "type" : "number"
                }
            ],            
            "prefer" : "Not"
        },        
        {
            "name" : "Normal",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "sigma",                    
                    "type" : "number",                    
                    "desc" : "Sigma"
                }
            ],            
            "desc" : "Calculate the standard deviation of a normal (Gaussian) distribution"
        },        
        {
            "name" : "NormalInv",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "proba",                    
                    "type" : "number",                    
                    "desc" : "Probability"
                }
            ],            
            "desc" : "Calculate the inverse of the Gauss Law"
        },        
        {
            "name" : "Not",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "expression",                    
                    "type" : "number",                    
                    "desc" : "Expression to negate"
                }
            ],            
            "desc" : [
                " Use this function to negate a statement.",                
                "",                
                " This function follows the same logic as statements qualified with the operator False."
            ],            
            "examples" : "Not(??Q1?? Has {1}) is the equivalent of writing: (??Q1?? Has {1})=False"
        },        
        {
            "name" : "Now",            
            "ns" : "askialanguage",            
            "base" : "const",            
            "type" : "date",            
            "desc" : [
                " Retrieve the systems current date and time",                
                " Use this function to qualify another askiaScript function, such as:",                
                "",                
                " Hour(Now)",                
                " Day(Now)",                
                " etc…",                
                "",                
                " Furthermore, the function can be used on its own, in which case it will retrieve the system’s current date and time."
            ],            
            "examples" : [
                " Now",                
                "",                
                " if it is January 1st 2004 and the time is 4:30pm, the function will return 01/01/2004 4:30:00 PM."
            ],            
            "alsoSee" : "Date"
        },        
        {
            "name" : "NR",            
            "ns" : "askialanguage",            
            "base" : "const",            
            "type" : "number",            
            "deprecated" : true,            
            "prefer" : "DK"
        },        
        {
            "name" : "On",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "variant",            
            "args" : [
                {
                    "name" : "expression",                    
                    "type" : "number",                    
                    "desc" : "Expression evaluate as number, which specified which value to select."
                },                
                {
                    "name" : "value",                    
                    "type" : "variant",                    
                    "desc" : "Value that could be selected according the expression. The latest value is the default fallback.",                    
                    "repeatable" : true
                }
            ],            
            "desc" : [
                " Choose a value according to the value of the first expression and return his result.",                
                " If value of the expression is 1, it returns the first value, if it's 2 it return the second value and so on.",                
                " Return the last specified value as a default fallback.",                
                " Because the value True is interpreted as 1 it will use the first value if the expression is true,<br />otherwize it will fallback on the default value when the expression is false"
            ],            
            "examples" : [
                " dim n = 1",                
                " On(n, 10, 20, 30) ' => 10",                
                "",                
                " dim n = 2",                
                " On(n, 10, 20, 30) ' => 20",                
                "",                
                " dim n = 3",                
                " On(n, 10, 20, 30) ' => 30",                
                "",                
                " dim n = 4",                
                " On(n, 10, 20, 30) ' => 30 (because it fallback to the last value)",                
                " ' Similar than:",                
                " ' If n = 1 Then",                
                " '     Return 10",                
                " ' ElseIf n = 2 Then",                
                " '     Return 20",                
                " ' Else",                
                " '     Return 30",                
                " ' EndIf",                
                "",                
                " dim n = true",                
                " On(n, 10, 20)  ' => 10 (because true is equal to 1)",                
                "",                
                " dim n = false",                
                " On(n, 10, 20) ' => 20 (false is equal to 0 so it fallback to the last value)",                
                " ' Similar than:",                
                " ' If n = True Then",                
                " '    Return 10",                
                " ' Else",                
                " '    Return 20",                
                " ' EndIf"
            ]
        },        
        {
            "name" : "Or",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : [
                " Logical \"Or\" between two expressions",                
                " Use this operator to define a condition based on two or more interchangeable/equivalent statements."
            ],            
            "examples" : "(??Q1?? Has {1}) Or (??Q2?? Has {5})"
        },        
        {
            "name" : "Ou",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "deprecated" : true,            
            "prefer" : "Or"
        },        
        {
            "name" : "Pow",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "value",                    
                    "type" : "number",                    
                    "desc" : "Value"
                },                
                {
                    "name" : "power",                    
                    "type" : "number",                    
                    "desc" : "Power"
                }
            ],            
            "desc" : "Raises a variable to a power (exponent) such as 2 (square), 3 (cube) etc.",            
            "examples" : [
                " Pow(2,3) returns 2 * 2 * 2 = 8",                
                " Pow(144, 1 / 2 )  returns 12"
            ],            
            "alsoSee" : "Number.Pow"
        },        
        {
            "name" : "Range",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "array",            
            "args" : [
                {
                    "name" : "lowerBound",                    
                    "type" : "number",                    
                    "desc" : "Lower bound of the range to create"
                },                
                {
                    "name" : "upperBound",                    
                    "type" : "number",                    
                    "desc" : "Upper bound of the range to create"
                }
            ],            
            "desc" : [
                " Range(LowerBoud,UpperBound)",                
                " Use this function to span across a set's values, thereby enabling you to save time, and improving the legibility of your Askia scripts."
            ],            
            "examples" : [
                " Range(5,15)",                
                "",                
                " refers to the same set as: {5; 6; 7; 8; 9; 10; 11; 12; 13; 14; 15}."
            ]
        },        
        {
            "name" : "Replace",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "Result",                    
                    "type" : "string"
                },                
                {
                    "name" : "Search",                    
                    "type" : "string"
                },                
                {
                    "name" : "ReplaceBy",                    
                    "type" : "string"
                }
            ],            
            "desc" : [
                " Replace(String,Search,ReplaceBy)",                
                " Use this function to Replace the specified portion of a string with another string."
            ],            
            "examples" : "Replace(\"The cat is white\",\"cat\",\"dog\") returns \"The dog is white\"",            
            "alsoSee" : "String.Replace"
        },        
        {
            "name" : "Return",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "desc" : [
                " Breaks the current script evaluation and returns the associated value",                
                " The evaluation of routing condition is done on the latest expression or on the expression return with the return statement.",                
                " When a return expression is reached, it immediately break the script flow",                
                " (all remain following lines are ignored) and return the expression associated."
            ],            
            "examples" : [
                " ' Selection using Gender x Age ...",                
                " If ((Gender Has {1}) And (Age Has {1})) Then",                
                "  return True  ' Immediately return True",                
                " ElseIf ((Gender Has {1}) And (Age Has {2})) Then",                
                "  return False ' Immediately return False",                
                " EndIf",                
                "",                
                " '... otherwize selection using profession",                
                " If (Profession Has {3}) Then",                
                "  return True",                
                " EndIf",                
                "",                
                " '... all other cases return Undefined (so treat as False)"
            ],            
            "version" : "5.3.2.0"
        },        
        {
            "name" : "Second",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "date",                    
                    "type" : "date",                    
                    "desc" : "Date to evaluate"
                }
            ],            
            "desc" : "Use this function to retrieve the numeric value of seconds based on the system's current time.",            
            "remarks" : [
                " By system, we mean the Operating System's Time and Calendar.",                
                " That is, depending on the type of fieldwork undertaken:",                
                "",                
                " Askiavoice: it will be the askiafield CCA's Operating System.",                
                " Askiaweb: it will be the Askia Webprod's Server’s Operating System."
            ],            
            "examples" : [
                " Second(Now)",                
                "",                
                " if the system’s time is 7:58:32 pm, the function will return 32."
            ],            
            "alsoSee" : "Date.Second"
        },        
        {
            "name" : "Seconde",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "date1",                    
                    "type" : "date"
                }
            ],            
            "prefer" : [
                "Second",                
                "Date.Second"
            ]
        },        
        {
            "name" : "Shuffle",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "array",            
            "args" : [
                {
                    "name" : "data",                    
                    "type" : "array",                    
                    "desc" : "Data to sort randomly"
                }
            ],            
            "desc" : "Returns the specified data set, sort randomly",            
            "examples" : [
                " Shuffle({1 to 5}) ' => {4; 5; 3; 2; 1}",                
                " Shuffle(??Q1??) The function will return the answers to the variable with shortcut Q1 in a random order."
            ],            
            "alsoSee" : "Array.Shuffle"
        },        
        {
            "name" : "Size",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "data",                    
                    "type" : "array",                    
                    "desc" : "Data to evaluate"
                }
            ],            
            "desc" : [
                " Return the size of a specified array",                
                " Use this function to retrieve the number of values contained in a set.",                
                " It enables you to determine the mean number of answers given to a multi-coded closed question."
            ],            
            "examples" : [
                " if Q1 is a multi-coded closed question containing 10 response items:",                
                "",                
                " Size(??Q1??)",                
                "",                
                " if the respondent selects three response items, the function will return 3."
            ],            
            "alsoSee" : "Array.Count"
        },        
        {
            "name" : "Somme",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "array1",                    
                    "type" : "array"
                }
            ],            
            "prefer" : [
                "Sum",                
                "Array.Sum"
            ]
        },        
        {
            "name" : "Student",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "sigma",                    
                    "type" : "number",                    
                    "desc" : "Double number (positif or negatif)"
                },                
                {
                    "name" : "degreesOfFreedom",                    
                    "type" : "number",                    
                    "desc" : "Degrees of freedom"
                }
            ],            
            "desc" : "Return the probability of a student test with <cite>n</cite> degrees of freedom"
        },        
        {
            "name" : "Sum",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "data",                    
                    "type" : "array",                    
                    "desc" : "Array of number"
                }
            ],            
            "desc" : "Use this function to calculate the sum of a loop's Numeric sub-questions, including the system DK and NA values.",            
            "examples" : "Sum(??Q1??)",            
            "alsoSee" : "Array.Sum"
        },        
        {
            "name" : "Taille",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "array1",                    
                    "type" : "array"
                }
            ],            
            "prefer" : [
                "Size",                
                "Array.Count"
            ]
        },        
        {
            "name" : "Then",            
            "ns" : "askialanguage",            
            "base" : "statement",            
            "desc" : "Part of the If / Then / Else statement. Indicates the start of an \"If\" or \"ElseIf\" loop",            
            "remarks" : "The ElseIf and Else clauses are both optional. You can have as many ElseIf clauses as you want in an If...Then...Else statement, but no ElseIf clause can appear after an Else clause. If...Then...Else statements can be nested within each other.",            
            "examples" : [
                " If [Condition] Then",                
                "   …",                
                " EndIf",                
                "",                
                "",                
                " If [Condition] Then",                
                "   …",                
                " Else",                
                "   …",                
                " EndIf",                
                "",                
                "",                
                " If [Condition] Then",                
                "   …",                
                " ElseIf [Condition] Then",                
                "   …",                
                " Else",                
                "   …",                
                " EndIf"
            ],            
            "version" : "5.3.2.0"
        },        
        {
            "name" : "To",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : [
                " Use this function to specify a range of values without listing every individual value within the range,",                
                " thereby saving time and improving the legibility of your Askia scripts."
            ],            
            "examples" : [
                " {5 To 15}",                
                "",                
                " refers to the same set as: {5; 6; 7; 8; 9; 10; 11; 12; 13; 14; 15}."
            ]
        },        
        {
            "name" : "True",            
            "ns" : "askialanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : [
                " Boolean true value (1)",                
                " Use this operator to qualify a statement."
            ],            
            "remarks" : [
                " The main use of the True operator is when used as a stand-alone condition.",                
                " In this case, it ensures that the routing will only be executed if the respondent has been asked,",                
                " or has seen, the Start variable's screen."
            ],            
            "examples" : [
                " (??Q1?? Has {2} And ??Q2?? Has {5}) = True",                
                "",                
                " However, a condition is True by default,",                
                " so qualifying this proposition with =True is redundant.",                
                "",                
                " (??Q1?? Has {2} And ??Q2?? Has {5}) <> True",                
                "",                
                " would be the same as:",                
                "",                
                " (??Q1?? Has {2} And ??Q2?? Has {5}) = False"
            ]
        },        
        {
            "name" : "UCase",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "string",                    
                    "type" : "string",                    
                    "desc" : "String to convert"
                }
            ],            
            "desc" : "Use this function to return the string converted to uppercase.",            
            "examples" : "UCase(\"abc\") returns \"ABC\"",            
            "alsoSee" : "String.ToUpperCase"
        },        
        {
            "name" : "Union",            
            "ns" : "askialanguage",            
            "base" : "operator",            
            "desc" : [
                " Return the concatenation of two groups without duplicates (those values which occur in either or both group)",                
                " Use this function to merge the values contained in two different sets."
            ],            
            "remarks" : "You can also use the operator +, such as {} + ??Q1?? + ??Q2??.",            
            "examples" : [
                " {} + ??Q1?? Union ??Q2??",                
                "",                
                " if Q1={2;4} and Q2={3;7}, the function will return: {2;4;3;7}.",                
                "",                
                " {} + ??Q1?? Union {5;10}",                
                "",                
                " if Q1={2;4}, the function will return: {2;4;5;10}."
            ]
        },        
        {
            "name" : "Val",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "string",                    
                    "type" : "string",                    
                    "desc" : "String to convert"
                }
            ],            
            "desc" : [
                " Use this function to retrieve a numeric value which was originally entered as a string value,",                
                " thereby enabling you to treat this value as if it came from a numeric question."
            ],            
            "remarks" : [
                " As it is not able to recognize numeric characters contained in an alphanumeric string,",                
                " if Q1=\"text 123 text\", the function will therefore return the value: 0."
            ],            
            "examples" : [
                " Val(??Q1??)",                
                "",                
                " if Q1=\"123\", the function will return the numeric value: 123."
            ],            
            "alsoSee" : "String.ToNumber"
        },        
        {
            "name" : "Vrai",            
            "ns" : "askialanguage",            
            "base" : "const",            
            "type" : "number",            
            "deprecated" : true,            
            "prefer" : "True"
        },        
        {
            "name" : "WeekDay",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "date",                    
                    "type" : "date",                    
                    "desc" : "Date from where to extract the day"
                }
            ],            
            "desc" : [
                " Use this function to retrieve the system's current weekday as a numerical value,",                
                " from 1 for Sunday to 7 for Saturday."
            ],            
            "remarks" : [
                " By system, we mean the Operating System's Time and Calendar.",                
                " That is, depending on the type of fieldwork undertaken:",                
                "",                
                " Askiavoice: it will be the askiafield CCA's Operating System.",                
                " Askiaweb: it will be the Askia Webprod's Server's Operating System."
            ],            
            "examples" : [
                " WeekDay(Now)",                
                "",                
                " If the day is Sunday, the function will return 1;",                
                " if the day is Monday, the function will return 2, and so on."
            ],            
            "alsoSee" : "Date.DayOfWeek"
        },        
        {
            "name" : "WeekDayAsString",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "date",                    
                    "type" : "date",                    
                    "desc" : "Date from where to extract the day"
                }
            ],            
            "desc" : "Use this function to retrieve the system's current weekday as a string of characters.",            
            "remarks" : [
                " This function is not multi-lingual,",                
                " so it will not return a string value according to the languages defined in a multi-lingual questionnaire.",                
                " The function will systematically return the string values in English.",                
                "",                
                " By system, we mean the Operating System's Time and Calendar.",                
                " That is, depending on the type of fieldwork undertaken:",                
                "",                
                " Askiavoice: it will be the askiafield CCA's Operating System.",                
                " Askiaweb: it will be the Askia Webprod's Server’s Operating System."
            ],            
            "examples" : [
                " WeekDayAsString(Now)",                
                "",                
                " if the day is Monday the function will return Monday."
            ]
        },        
        {
            "name" : "Year",            
            "ns" : "askialanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "date0",                    
                    "type" : "date"
                }
            ],            
            "desc" : "Use this function to retrieve the system's current year as a numerical value.",            
            "remarks" : [
                " By system, we mean the Operating System's Time and Calendar.",                
                " That is, depending on the type of fieldwork undertaken:",                
                "",                
                " Askiavoice: it will be the askiafield CCA's Operating System.",                
                " Askiaweb: it will be the Askia Webprod's Server’s Operating System."
            ],            
            "examples" : [
                " Year(Now)",                
                "",                
                " if the year is 2004 the function will return 2004."
            ],            
            "alsoSee" : "Date.Year"
        }
    ],    
    "members" : {
        "date" : [
            {
                "name" : "Day",                
                "ns" : "askialanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the day of the date as number",                
                "examples" : [
                    " dim dt = #25/03/2011#",                    
                    " dt.Day ' => 25"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "DayOfWeek",                
                "ns" : "askialanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Returns the day of week (1-7) of the specified date.",                    
                    " eg.",                    
                    " if the day is Sunday, the property will return 1.",                    
                    " if the day is Monday, the property will return 2.",                    
                    " if the day is Saturday, the property will return 7, and so on."
                ],                
                "examples" : [
                    " dim dt = #25/03/2011#",                    
                    " dt.DayOfWeek ' => 6"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "DayOfYear",                
                "ns" : "askialanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Returns the day of year (1-366) of the specified date.",                    
                    " eg.",                    
                    " if the date is 01/01/2012, the property will return 1.",                    
                    " if the date is 31/12/2012, the property will return 365, and so on."
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Format",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "format",                        
                        "type" : "string",                        
                        "desc" : "Format of the date to obtain (case sensitive)"
                    },                    
                    {
                        "name" : "string2",                        
                        "type" : "string",                        
                        "opt" : true
                    },                    
                    {
                        "name" : "string3",                        
                        "type" : "string",                        
                        "opt" : true
                    }
                ],                
                "desc" : "Format a date to string using the format parameter",                
                "examples" : [
                    " dim dt= #02/03/2011 16:32:07# ' March 2nd, 2011",                    
                    " dt.Format(\"dd/MM/yyyy\") ' => \"02/03/2011\"",                    
                    " dt.Format(\"yyyy-MM-dd\") ' => \"2011-03-02\"",                    
                    " dt.Format(\"MM/dd/yyyy\") ' => \"03/02/2011\"",                    
                    " dt.Format(\"dd MMM yyyy\") ' => \"02 Mar 2011\"",                    
                    " dt.Format(\"dd MMMM yyyy\") ' => \"02 March 2011\"",                    
                    " dt.Format(\"MMMM dd, ddd.  yyyy\") ' => \"March 02, Wed. 2011\"",                    
                    " dt.Format(\"MMMM dd, dddd yyyy\") ' => \"March 02, Wednesday 2011\"",                    
                    " dt.Format(\"d-M-yy\") ' => \"2-3-11\"",                    
                    " dt.Format(\"dd/MM/yyyy HH:mm\") ' => \"02/03/2011 16:32\"",                    
                    " dt.Format(\"dd/MM/yyyy hh:mm\") ' => \"02/03/2011 04:32\"",                    
                    " dt.Format(\"dd/MM/yyyy hh:mmampm\") ' => \"02/03/2011 04:32pm\"",                    
                    " dt.Format(\"dd/MM/yyyy hh:mm:ssAMPM\") ' => \"02/03/2011 04:32:07PM\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Hour",                
                "ns" : "askialanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the hour of the time as number",                
                "examples" : [
                    " dim tm = #16:32:07#",                    
                    " tm.Hour ' => 16"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Minute",                
                "ns" : "askialanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the minute of the time as number",                
                "examples" : [
                    " dim tm = #16:32:07#",                    
                    " tm.Minute ' => 32"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Month",                
                "ns" : "askialanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the month of the date as number",                
                "examples" : [
                    " dim dt = #25/03/2011#",                    
                    " dt.Month ' => 3"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Second",                
                "ns" : "askialanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the second of the time as number",                
                "examples" : [
                    " dim tm = #16:32:07#",                    
                    " tm.Second ' => 7"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToNumber",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : "Try to convert the date to a number.",                
                "examples" : [
                    " dim dt= #25/03/2011 16:32:07#",                    
                    " dt.ToNumber() ' => 40627.688969907409"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToString",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : [
                    " Convert a date to a string using the regional settings context",                    
                    " (from the language of respondent or the current machine)",                    
                    " Prefer the usage of \"Format\" methods if you want to enforce/fixed the format"
                ],                
                "examples" : [
                    " dim dt= #25/03/2011 16:32:07#",                    
                    " dt.ToString() ' => \"25/03/2011 16:32:07\" or \"3/25/2011 04:32:07 PM\"",                    
                    " ' depending on the regional settings"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "TypeOf",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns the type of the current object / variable",                
                "examples" : [
                    " dim dt= #12/01/2009#",                    
                    " dt.TypeOf() ' => \"date\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Year",                
                "ns" : "askialanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the year of the date as number",                
                "examples" : [
                    " dim dt = #25/03/2011#",                    
                    " dt.Year ' => 2011"
                ],                
                "version" : "5.3.2.0"
            }
        ],        
        "number" : [
            {
                "name" : "Abs",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : "Returns the absolute part of a number. (Positive value)",                
                "examples" : [
                    " dim counter = -3",                    
                    " counter.Abs() ' => 3",                    
                    " '",                    
                    " dim i = -1.5",                    
                    " i.Abs() ' => 1.5"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Ceil",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "decimals",                        
                        "type" : "number",                        
                        "desc" : "Number of decimal to keep. If not specified, no decimal will be get (same as 0)",                        
                        "opt" : true
                    }
                ],                
                "desc" : "Returns the next highest value by rounding up value .",                
                "examples" : [
                    " dim counter = 1.2",                    
                    " counter.Ceil() ' => 2",                    
                    " '",                    
                    " dim i = -3.14",                    
                    " i.Ceil() ' => -3",                    
                    " '",                    
                    " dim j = 1.5222",                    
                    " j.Ceil(2) ' => 1.53"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Floor",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "decimals",                        
                        "type" : "number",                        
                        "desc" : "Number of decimal to keep. If not specified, no decimal will be get (same as 0)",                        
                        "opt" : true
                    }
                ],                
                "desc" : "Returns the next lowest value by rounding down value .",                
                "examples" : [
                    " dim counter = 1.7",                    
                    " counter.Floor() ' => 1",                    
                    " '",                    
                    " dim i = -3.84",                    
                    " i.Floor() ' => -4",                    
                    " '",                    
                    " dim j = 1.5777",                    
                    " j.Floor(2) ' => 1.57"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Format",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "format",                        
                        "type" : "string",                        
                        "desc" : "Representation of the desire format"
                    },                    
                    {
                        "name" : "decimalSep",                        
                        "type" : "string",                        
                        "desc" : "Decimal separator",                        
                        "opt" : true
                    },                    
                    {
                        "name" : "thousandSep",                        
                        "type" : "string",                        
                        "desc" : "Thousand separator",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Format a number to string using the format parameter",                    
                    " When the separators are omitted, the system will use the separators from the regional settings context",                    
                    " (language of the respondent or the regional settings of the current machine)"
                ],                
                "examples" : [
                    " dim i = 3456.7",                    
                    " i.Format(\"00000.00\")",                    
                    " ' => \"03456.70\" or \"03456,70\"",                    
                    " ' depending on the regional settings",                    
                    " '",                    
                    " i.Format(\"#.##\")",                    
                    " ' =>\"3456.7\" or \"3456,7\"",                    
                    " ' depending on the regional settings",                    
                    " '",                    
                    " i.Format(\"#,##0.00\")",                    
                    " '=>  \"3,456.70\" or \"3 456,70\" or \"3.456,70\"",                    
                    " '  depending on the regional settings",                    
                    " '",                    
                    " i.Format(\"$#,##0.00\")",                    
                    " '=> \"$3,456.70\" or \"$3 456,70\" or \"$3.456,70\"",                    
                    " ' depending on the regional settings",                    
                    " '",                    
                    " '",                    
                    " i = 0.1",                    
                    " i.Format(\"#.##\") ' => \".1\" or \",1\"",                    
                    " ' depending on the regional settings",                    
                    " '",                    
                    " i.Format(\"0.##\") ' => \"0.1\" or \"0,1\"",                    
                    " ' depending on the regional settings",                    
                    " '",                    
                    " i.Format(\"0.00\") ' => \"0.10\" or \"0,10\"",                    
                    " ' depending on the regional settings",                    
                    " '",                    
                    " '",                    
                    " i = 123456.78",                    
                    " i.Format(\"#,##0.00\", \",\", \".\") ' => \"123.456,78\"",                    
                    " i.Format(\"#,##0.00\", \".\", \",\") ' => \"123,456.78\"",                    
                    " i.Format(\"#,##0.00\", \"#\", \"@\") ' => \"123@456#78\"",                    
                    " i.Format(\"#.##\", \",\") ' => \"123456,78\"",                    
                    " i.Format(\"#.##\", \".\") ' => \"123456.78\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Pow",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "power",                        
                        "type" : "number",                        
                        "desc" : "Power value"
                    }
                ],                
                "desc" : "Return the power of a value",                
                "examples" : [
                    " dim counter = 2",                    
                    " counter.Pow(3) ' => 8",                    
                    " 'Same as (2 * 2 * 2)"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Round",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "decimal",                        
                        "type" : "number",                        
                        "desc" : "Number of decimal to keep. If not specified, no decimal will be get (same as 0)",                        
                        "opt" : true
                    }
                ],                
                "desc" : "Round a number.",                
                "examples" : [
                    " dim counter = 1.2",                    
                    " counter.Round() ' => 1",                    
                    " '",                    
                    " dim i = 1.5",                    
                    " i.Round() ' => 2",                    
                    " '",                    
                    " dim j = 1.55555",                    
                    " j.Round(2) ' => 1.56",                    
                    " '",                    
                    " dim k = 1",                    
                    " k.Round(2) ' => 1"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToDays",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : "Converts the specified number of days to days: (number)",                
                "examples" : [
                    " dim i = 2",                    
                    " i.ToDays() ' => 2",                    
                    " (Date1 - Date2).ToDays() ' => The number of days"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToHours",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : "Converts the specified number of days to hours: (number * (24) )",                
                "examples" : [
                    " dim i = 2",                    
                    " i.ToHours() ' => 48",                    
                    " (Date1 - Date2).ToHours()",                    
                    " ' => (Date1 - Date2) * (24)"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToInt",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : "Converts a number (double) to integer. This method will not round the number.",                
                "examples" : [
                    " dim counter = 1.2",                    
                    " counter.ToInt() ' => 1",                    
                    " '",                    
                    " dim i = 1.5",                    
                    " i.ToInt() ' => 1"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToMinutes",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : "Converts the specified number of days to minutes: (number * (24 * 60) )",                
                "examples" : [
                    " dim i = 2",                    
                    " i.ToMinutes() ' => 2880",                    
                    " (Date1 - Date2).ToMinutes()",                    
                    " ' => (Date1 - Date2) * (24 * 60)"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToSeconds",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : "Converts the specified number of days to seconds: (number * (24 * 3600) )",                
                "examples" : [
                    " dim i = 2",                    
                    " i.ToSeconds() ' => 172800",                    
                    " (Date1 - Date2).ToSeconds()",                    
                    " ' => (Date1 - Date2) * (24 * 3600)"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToString",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : [
                    " Converts a number to string using the regional settings context",                    
                    " (from the language of respondent or the current machine) to determine the decimal separator",                    
                    " Prefer the usage of \"Format\" methods if you want to enforce/fixed the decimal separator"
                ],                
                "examples" : [
                    " dim counter = 1.9",                    
                    " counter.ToString() ' => \"1.9\" or \"1,9\"",                    
                    " ' depending on the regional settings"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "TypeOf",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns the type of the current object / variable",                
                "examples" : [
                    " dim i = 2",                    
                    " i.TypeOf() ' => \"number\""
                ],                
                "version" : "5.3.2.0"
            }
        ],        
        "string" : [
            {
                "name" : "IndexOf",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "Text",                        
                        "type" : "string",                        
                        "desc" : "String to search"
                    },                    
                    {
                        "name" : "CaseSensitive",                        
                        "type" : "number",                        
                        "desc" : "When true indicates if the search must be case sensitive",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Search the text in the string and returns his position (based 1)",                    
                    " Returns DK if the text is not found",                    
                    " By default, the text search is not case sensitive."
                ],                
                "examples" : [
                    " dim s = \"abcdefghijk\"",                    
                    " s.IndexOf(\"cde\") ' => 3",                    
                    " s.IndexOf(\"BcD\") ' => 2",                    
                    " s.IndexOf(\"lmn\") ' => DK (not found)",                    
                    " '",                    
                    " s.IndexOf(\"CDE\", true) ' => DK (not found with the case sensitive flag)"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "IsDate",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "format",                        
                        "type" : "string",                        
                        "desc" : "Indicates the date format to use for the validation",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Verify the format of the string as a valid date format",                    
                    " using the regional settings associated with the current interview",                    
                    " or using the optional format parameter you can enforce a specify format."
                ],                
                "examples" : [
                    " dim s = \"22/03/2011\"",                    
                    " s.IsDate() ' => True",                    
                    " '",                    
                    " s = \"22##03##2011\"",                    
                    " s.IsDate() ' => False",                    
                    " s.IsDate(\"dd##MM##yyyy\") ' => True"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "IsEmail",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : "Verify the format of the string as a valid email format (x@x.xxx)",                
                "examples" : [
                    " dim s = \"askia@askia.com\"",                    
                    " s.IsEmail() ' => True",                    
                    " '",                    
                    " dim s1 = \"askia#askia.com\"",                    
                    " s1.IsEmail() ' => False"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "IsMatch",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "regexp",                        
                        "type" : "string",                        
                        "desc" : "Regular expression as string"
                    }
                ],                
                "desc" : "Verify the format of the string as a valid format using regular expression",                
                "examples" : [
                    " dim email = \"askia@askia.com\"",                    
                    " email.IsMatch(\"w+@w+.[a-z]+\")",                    
                    " '",                    
                    " ' Regular expression to valid",                    
                    " ' that a string contains the uk phone number pattern",                    
                    " ' +(##) ### ### #### or 00## ### ### ####",                    
                    " dim rgUkPhone = \"(+|00)s*d{2}(s?d{3}){2}s?d{4}\"",                    
                    " '",                    
                    " (\"0044 207 689 5492\").IsMatch(rgUkPhone) ' => true",                    
                    " (\"00442076895492\").IsMatch(rgUkPhone) ' => true",                    
                    " (\"+44 207 689 5492\").IsMatch(rgUkPhone) ' => true",                    
                    " (\"+442076895492\").IsMatch(rgUkPhone) ' => true",                    
                    " (\"207 689 5492\").IsMatch(rgUkPhone) ' => false",                    
                    " (\"44 207 689 5492\").IsMatch(rgUkPhone) ' => false",                    
                    " (\"442076895492\").IsMatch(rgUkPhone) ' => false",                    
                    " (\"Before it was 00 44 204 689 5492 and now it's 00 44 207 689 5492\").IsMatch(rgUkPhone)",                    
                    " ' => true",                    
                    " (\"My contact numbers are:",                    
                    " +44 207 689 5492",                    
                    " or",                    
                    " 0044 207 123 4567\").IsMatch(rgUkPhone) ' => true",                    
                    " '",                    
                    " ' Same regular expression than above",                    
                    " ' but test if the string ONLY contains",                    
                    " ' the uk phone number and nothing else",                    
                    " dim rgOnlyUkPhone = \"^(+|00)s*d{2}(s?d{3}){2}s?d{4}$\"",                    
                    " '",                    
                    " (\"+44 207 689 5492\").IsMatch(rgOnlyUkPhone) ' => true",                    
                    " (\"0044 207 689 5492\").IsMatch(rgOnlyUkPhone) ' => true",                    
                    " (\"Before it was 00 44 204 689 5492",                    
                    " and now it's 00 44 207 689 5492\").IsMatch(rgOnlyUkPhone)",                    
                    " ' => false"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "IsNumber",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : "Verify the format of the string as a valid number format",                
                "examples" : [
                    " dim s = \"abcde\"",                    
                    " s.IsNumber() ' => 0",                    
                    " Dim s = \"123.99\"",                    
                    " s.IsNumber() ' => True",                    
                    " Dim s = \"123,99\"",                    
                    " s.IsNumber() ' => True",                    
                    " Dim s = \"123,999.32\"",                    
                    " s.IsNumber() ' => False thousand separators not supported"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "IsUKPostcode",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : "Verify the format of the string as a valid UK Postcode format",                
                "examples" : [
                    " dim s = \"L1 4AB\"",                    
                    " s.IsUKPostCode() ' => True",                    
                    " '",                    
                    " s = \"L4B1C12\"",                    
                    " s.IsUKPostCode() ' => False"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Left",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "length",                        
                        "type" : "number",                        
                        "desc" : "Positive number which indicates the length of the sub-string to extract"
                    }
                ],                
                "desc" : [
                    " Extract a left part of the string.",                    
                    " If the specify length is higher than the length of the string,",                    
                    " it returns the entire string"
                ],                
                "examples" : [
                    " dim s = \"abcde\"",                    
                    " s.Left(3) ' => \"abc\"",                    
                    " s.Left(10) ' => \"abcde\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Length",                
                "ns" : "askialanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the length of the string (number of characters)",                
                "examples" : [
                    " dim my_string = \"abcd\"",                    
                    " my_string.length  ' => 4",                    
                    " dim my_empty_string = \"\"",                    
                    " my_empty_string.length ' => 0"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Replace",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "pattern",                        
                        "type" : "string",                        
                        "desc" : "String to replace"
                    },                    
                    {
                        "name" : "replacement",                        
                        "type" : "string",                        
                        "desc" : "Replacement string"
                    },                    
                    {
                        "name" : "caseSensitive",                        
                        "type" : "boolean",                        
                        "desc" : "When true indicates if the replacement must be case sensitive",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Returns a new string and replace the specify pattern by the specify replacement.",                    
                    " (by default the text replacement is not case sensitive)"
                ],                
                "examples" : [
                    " dim s = \"Hello world!\"",                    
                    " s = s.Replace(\"Hello\", \"Hi\")",                    
                    " ' => \"Hi world!\"",                    
                    " '",                    
                    " dim abc = \"abc\"",                    
                    " abc = abc.Replace(\"A\", \"X\")",                    
                    " ' => \"Xbc\"",                    
                    " '",                    
                    " dim case = \"Sensitive\"",                    
                    " case.Replace(\"sensitive\", \"Insensitive\", true)",                    
                    " ' => \"Sensitive\" Doesn't change",                    
                    " '",                    
                    " case.Replace(\"sensitive\", \"Insensitive\",false)",                    
                    " ' => \"Insensitive\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Right",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "length",                        
                        "type" : "number",                        
                        "desc" : "Positive number which indicates the length of the sub-string to extract"
                    }
                ],                
                "desc" : [
                    " Extract a right part of the string.",                    
                    " If the specify length is higher than the length of the string,",                    
                    " it returns the entire the string"
                ],                
                "examples" : [
                    " dim s = \"abcde\"",                    
                    " s.Right(3) ' => \"cde\"",                    
                    " s.Right(10) ' => \"abcde\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Split",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "separator",                        
                        "type" : "string",                        
                        "desc" : "Separator string (coma by default)",                        
                        "opt" : true
                    }
                ],                
                "desc" : "Split a given string into an array of strings.",                
                "examples" : [
                    " dim s = \"1,3,5,7,9\"",                    
                    " s.Split()",                    
                    " ' => {\"1\"; \"3\"; \"5\"; \"7\"; \"9\"}",                    
                    " '",                    
                    " s = \"a|b|c|d|e\"",                    
                    " s.Split(\"|\")",                    
                    " ' => {\"a\"; \"b\"; \"c\"; \"d\"; \"e\"}",                    
                    " '",                    
                    " s = \"a|b|c|d|e\"",                    
                    " s.Split(\"|\")[2]",                    
                    " ' => \"b\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "SplitToNumbers",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "separator",                        
                        "type" : "string",                        
                        "desc" : "Separator string (coma by default)",                        
                        "opt" : true
                    }
                ],                
                "desc" : "Split a given string into an array of numbers.",                
                "examples" : [
                    " dim s = \"1,3,5,7,9\"",                    
                    " s.SplitToNumbers()",                    
                    " ' => {1; 3; 5; 7; 9}",                    
                    " '",                    
                    " s = \"1|3|5|7|9\"",                    
                    " s.SplitToNumbers(\"|\")",                    
                    " ' => {1; 3; 5; 7; 9}",                    
                    " '",                    
                    " s = \"1|3|5|7|9\"",                    
                    " s.SplitToNumbers(\"|\")[2]",                    
                    " ' => 3",                    
                    " '",                    
                    " s = \"1|3|toto|7|tata|12\"",                    
                    " s.SplitToNumbers(\"|\")",                    
                    " ' => {1; 3; DK; 7; DK; 12}"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "SubString",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "start",                        
                        "type" : "number",                        
                        "desc" : "Positive number which indicates the start of the sub-string"
                    },                    
                    {
                        "name" : "length",                        
                        "type" : "number",                        
                        "desc" : "Positive number which indicates the length of the sub-string to obtain. If it is not set, it returns the rest of the string",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Extract a sub-string using starting at the specify index (based 1) with a given length",                    
                    " If the specify length is higher than the length of the string, it returns the end of the string",                    
                    " If the start position is higher than the length of the string, it returns an empty string"
                ],                
                "examples" : [
                    " dim s = \"abcde\"",                    
                    " s.Substring(2, 3) ' => \"bcd\"",                    
                    " s.Substring(2) ' => \"bcde\"",                    
                    " s.Substring(3, 10) ' => \"cde\"",                    
                    " s.Substring(10, 2) ' => \"\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToDate",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "date",                
                "args" : [
                    {
                        "name" : "format",                        
                        "type" : "string",                        
                        "desc" : "Indicates the date format of the string",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Use this function to convert the string as a date using the regional settings",                    
                    " associated with the current interview or",                    
                    " using the optional format parameter you can enforce a specify format.",                    
                    " Returns DK when the string could not be converted to a date."
                ],                
                "examples" : [
                    " dim s = \"22/03/2011\"",                    
                    " s.ToDate() ' => #22/03/2011#",                    
                    " '",                    
                    " dim t = \"2011-03-22\"",                    
                    " t.ToDate(\"yyyy-MM-dd\") ' => #22/03/2011#",                    
                    " '",                    
                    " dim invalidDate = \"Hello world!\"",                    
                    " invalidDate.ToDate() ' => DK (Invalid date)"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToHexa",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Try to convert the string which represent a color (hexa, rgb or rgba) to it's Hexadecimal equivalent string.<br />Drop the \"alpha\" value when the string represent an RGBA color.<br />Returns an empty string when fail to convert.<br />Trailing whitespaces will be striped before the conversion.",                
                "examples" : [
                    " dim hexa_red_color = \"#ff0000\"",                    
                    " hexa_red_color.ToHexa() '=> \"#ff0000\"",                    
                    "",                    
                    " dim rgba_green_color = \"0,255,0,0.5\"",                    
                    " rgba_green_color.ToHexa() '=> \"#00ff00\"",                    
                    "",                    
                    " dim rgb_blue_color = \"0,0,255\"",                    
                    " rgb_blue_color.ToHexa() '=> \"#0000ff\"",                    
                    "",                    
                    " dim not_a_color = \"not a color\"",                    
                    " not_a_color.ToHexa() '=> \"\"",                    
                    "",                    
                    " dim named_color = \"red\"",                    
                    " named_color.ToHexa() '=> \"\" (not interpreted)"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ToLowerCase",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns a new string in lowercase.",                
                "examples" : [
                    " dim s = \"Hello World!\"",                    
                    " s = s.ToLowerCase()",                    
                    " ' => \"hello world!\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToNumber",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : [
                    " Try to convert the string to a number.",                    
                    " Returns DK when the string could not be converted to number.",                    
                    " Be careful, the thousand separator could make an exception during the conversion.",                    
                    " Because french people use the coma as a decimal separator",                    
                    " when american use it for the thousand separator:",                    
                    " \"123,456\" is a 123.456 for french but 123456 for american.",                    
                    " To avoid confusion the thousand separator is not allowed in the conversion."
                ],                
                "examples" : [
                    " dim s = \"abcde\"",                    
                    " s.ToNumber() ' => DK (not a valid number)",                    
                    " '",                    
                    " s = \"123\"",                    
                    " s.ToNumber() ' => 123",                    
                    " '",                    
                    " s = \"123.99\"",                    
                    " s.ToNumber() ' => 123.99",                    
                    " '",                    
                    " s = \"123,456\"",                    
                    " s.ToNumber() ' => 123.456",                    
                    " '",                    
                    " s = \"123,456.789\"",                    
                    " s.ToNumber() ' => DK (not a valid number)",                    
                    " ' The thousand separator generate an exception"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToRGB",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Try to convert the string which represent a color (hexa, rgb or rgba) to it's RGB equivalent string.<br />Drop the \"alpha\" value when the string represent an RGBA color.<br />Returns an empty string when fail to convert.<br />Trailing whitespaces will be striped before the conversion.",                
                "examples" : [
                    " dim hexa_red_color = \"#ff0000\"",                    
                    " hexa_red_color.ToRGB() '=> \"255,0,0\"",                    
                    "",                    
                    " dim rgba_green_color = \"0,255,0,0.5\"",                    
                    " rgba_green_color.ToRGB() '=> \"0,255,0\"",                    
                    "",                    
                    " dim rgb_blue_color = \"0,0,255\"",                    
                    " rgb_blue_color.ToRGB() '=> \"0,0,255\"",                    
                    "",                    
                    " dim not_a_color = \"not a color\"",                    
                    " not_a_color.ToRGB() '=> \"\"",                    
                    "",                    
                    " dim named_color = \"red\"",                    
                    " named_color.ToRGB() '=> \"\" (not interpreted)"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ToRGBA",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Try to convert the string which represent a color (hexa, rgb or rgba) to it's RGBA equivalent string.<br />Always make the color fully opaque when the opacity is not part of the color representation.<br />Returns an empty string when fail to convert.<br />Trailing whitespaces will be striped before the conversion.",                
                "examples" : [
                    " dim hexa_red_color = \"#ff0000\"",                    
                    " hexa_red_color.ToRGBA() '=> \"255,0,0,1\"",                    
                    "",                    
                    " dim rgba_green_color = \"0,255,0,0.5\"",                    
                    " rgba_green_color.ToRGBA() '=> \"0,255,0,0.5\"",                    
                    "",                    
                    " dim rgb_blue_color = \"0,0,255\"",                    
                    " rgb_blue_color.ToRGBA() '=> \"0,0,255,1\"",                    
                    "",                    
                    " dim not_a_color = \"not a color\"",                    
                    " not_a_color.ToRGBA() '=> \"\"",                    
                    "",                    
                    " dim named_color = \"red\"",                    
                    " named_color.ToRGBA() '=> \"\" (not interpreted)"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ToString",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns the string representation of the object / variable",                
                "examples" : [
                    " dim s = \"Hello world!\"",                    
                    " s.ToString() ' => \"Hello world!\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToUpperCase",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns a new string in uppercase.",                
                "examples" : [
                    " dim s = \"Hello world!\"",                    
                    " s = s.ToUpperCase()",                    
                    " ' => \"HELLO WORLD!\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Trim",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns a new string without the trailing spaces before and after the string.",                
                "examples" : [
                    " dim s = \"  spaces before/after   \"",                    
                    " s = s.Trim()",                    
                    " ' => \"spaces before/after\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "TypeOf",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns the type of the current object / variable",                
                "examples" : [
                    " dim s = \"abc\"",                    
                    " s.TypeOf() ' => \"string\""
                ],                
                "version" : "5.3.2.0"
            }
        ],        
        "array" : [
            {
                "ns" : "askialanguage",                
                "accessor" : "variant"
            },            
            {
                "name" : "Avg",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : [
                    " Calculate the average of numerical data. Return 0 if the array is empty",                    
                    " Only available for an array of numbers.",                    
                    " This is askiascript's abbreviation for average.",                    
                    " Use this function to calculate the numerical average of numerical data.",                    
                    " Returns 0 when the array is empty"
                ],                
                "examples" : [
                    " dim arr = {2;4}",                    
                    " arr.Avg() ' => 3",                    
                    "",                    
                    " dim emptyArray = {1;2}",                    
                    " emptyArray.Remove({1;2})",                    
                    " emptyArray.Avg() ' => 0"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Count",                
                "ns" : "askialanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Return the number of items in the array",                
                "examples" : [
                    " dim my_array = {3;4}",                    
                    " my_array.Count ' => 2"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "IndexOf",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "List",                        
                        "type" : "array"
                    },                    
                    {
                        "name" : "value",                        
                        "type" : "variant",                        
                        "desc" : "Value to search"
                    }
                ],                
                "desc" : [
                    " Search the data in the array and returns his position (based 1)",                    
                    " Returns DK if the data is not found",                    
                    " Parameters",                    
                    " - data [Require] Any basic types to search",                    
                    " - caseSensitive [optinal] Boolean Only available for an array of strings.",                    
                    " When true indicates if the search must be case sensitive",                    
                    " (by default the search is not case sensitive)"
                ],                
                "examples" : [
                    " dim arr= {2;4;5;1;3}",                    
                    " arr.IndexOf(4) ' => 2",                    
                    " arr.IndexOf(10) ' => DK (not found)",                    
                    " '",                    
                    " dim arr2 = {\"b\";\"a\";\"c\"}",                    
                    " arr2.IndexOf(\"a\") ' => 2",                    
                    " '",                    
                    " dim arr3 = {\"abc\"; \"ABC\"}",                    
                    " arr3.IndexOf(\"aBc\", true) ' => DK (not found)",                    
                    " arr3.IndexOf(\"ABC\", true) '=> 2"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "IndexOfMax",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "nthHigher",                        
                        "type" : "number",                        
                        "desc" : "nth highest index to obtain. (1st by default)",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Use this function to return the index of the nth highest value of data.",                    
                    " Returns DK when the 'nth highest value' is out of bound."
                ],                
                "examples" : [
                    " dim arr = {10;20;3;1}",                    
                    " arr.IndexOfMax() ' => 2",                    
                    " arr.IndexOfMax(2) ' => 1",                    
                    " arr.IndexOfMax(5) ' => DK (Out of bound)"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "IndexOfMin",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "nthLowest",                        
                        "type" : "number",                        
                        "desc" : "nth lowest index to obtain. (1st by default)",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Use this function to return the index of the nth smallest value of data.",                    
                    " Returns DK when the 'nth lowest value' is out of bound."
                ],                
                "examples" : [
                    " dim arr = {10;20;3;1}",                    
                    " arr.IndexOfMin() ' => 4",                    
                    " arr.IndexOfMin(2) ' => 3",                    
                    " arr.IndexOfMin(5) ' => DK (Out of bound)"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Insert",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "value",                        
                        "type" : "variant",                        
                        "desc" : "Value to add"
                    }
                ],                
                "desc" : [
                    " Those methods modify the object in place.",                    
                    " Use it to add a set of values/data allowing repetition (with duplicates) at the end of the array",                    
                    " The usage of the calls chains must be done in a single line (no carriage return),",                    
                    " if you want to execute multiple operations in multiple lines,",                    
                    " write a complete operations sentence on each line",                    
                    " (see 'Chains calls examples')"
                ],                
                "examples" : [
                    " dim arr = {2;4}",                    
                    " arr.Insert({1;4}) ' => arr",                    
                    " return arr ' => {2;4;1;4}",                    
                    "",                    
                    " dim arr = {\"b\";\"a\"}",                    
                    " arr.Insert({\"c\";\"a\"}) ' => arr",                    
                    " return arr ' => {\"b\";\"a\";\"c\";\"a\"}",                    
                    "",                    
                    " dim arr = {2;4}",                    
                    " arr.Insert(5) ' => arr",                    
                    " return arr ' => {2;4;5}",                    
                    "",                    
                    " Chains calls examples:",                    
                    "",                    
                    " ' Legal syntaxes in single line:",                    
                    " dim my_array = {1; 2}",                    
                    " my_array.Insert(3) + {4}",                    
                    " ' => my_array with values {1; 2; 3; 4}",                    
                    " my_array.Insert(5).Insert(6)",                    
                    " ' => my_array with values {1; 2; 3; 4; 5; 6}",                    
                    "",                    
                    " ' Illegal syntaxes in multiline:",                    
                    " dim my_array = {1; 2}",                    
                    " my_array.Insert(3)",                    
                    " +",                    
                    " {4}  ' => Compilation error",                    
                    "",                    
                    " dim my_array = {1;2}",                    
                    " my_array.Insert(5)",                    
                    " .Insert(6) ' => Compilation error",                    
                    "",                    
                    " ' Legal syntaxes in multiline:",                    
                    " dim my_array = {1; 2}",                    
                    " my_array.Insert(3)",                    
                    " my_array = my_array + {4}",                    
                    " ' =>  my_array with values {1;2;3;4}",                    
                    " my_array.Insert(5)",                    
                    " my_array.Insert(6)",                    
                    " ' => my_array with values {1;2;3;4;5;6}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "InsertAt",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "index",                        
                        "type" : "number",                        
                        "desc" : "Position in the array where the data should be inserted (base 1)"
                    },                    
                    {
                        "name" : "value",                        
                        "type" : "variant",                        
                        "desc" : "Value to add"
                    }
                ],                
                "desc" : [
                    " This method modify the object in place.",                    
                    " Use it to add a set of values/data allowing repetition (with duplicates) at the specify index",                    
                    " The usage of the calls chains must be done in a single line (no carriage return),",                    
                    " if you want to execute multiple operations in multiple lines,",                    
                    " write a complete operations sentence on each line",                    
                    " (see 'Chains calls examples')"
                ],                
                "examples" : [
                    " dim arr = {2;4}",                    
                    " arr.InsertAt(2, {1; 3}) ' => arr",                    
                    " return arr  ' => {2;1;3;4}",                    
                    "",                    
                    " dim arr = {\"b\";\"a\"}",                    
                    " arr.InsertAt(1, {\"c\";\"a\"}) ' => arr",                    
                    " return arr ' => {\"c\";\"a\";\"b\";\"a\"}",                    
                    "",                    
                    " Chains calls examples:",                    
                    "",                    
                    " ' Legal syntaxes in single line:",                    
                    " dim my_array = {5; 6}",                    
                    " my_array.InsertAt(1, {3; 4}) + {7}",                    
                    " ' => my_array with values {3; 4; 5; 6; 7}",                    
                    " my_array.InsertAt(1, {2}).InsertAt(1, {1})",                    
                    " ' => my_array with values {1; 2; 3; 4; 5; 6; 7}",                    
                    "",                    
                    " ' Illegal syntaxes in multiline:",                    
                    " dim my_array = {1; 2}",                    
                    " my_array.InsertAt(1, {3; 4})",                    
                    " +",                    
                    " {7}  ' => Compilation error",                    
                    "",                    
                    " dim my_array.Insert(1, {2})",                    
                    " .Insert(1, {1}) ' => Compilation error",                    
                    "",                    
                    " ' Legal syntaxes in multiline:",                    
                    " dim my_array = {5; 6}",                    
                    " my_array.InsertAt(1, {3; 4})",                    
                    " my_array = my_array + {7}",                    
                    " ' =>  my_array with values {3;4;5;6;7}",                    
                    " my_array.InsertAt(1, {2})",                    
                    " my_array.InsertAt(1, {1})",                    
                    " ' => my_array with values {1;2;3;4;5;6;7}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Join",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "separator",                        
                        "type" : "string",                        
                        "desc" : "Separator string between values of the array (semi-colon by default)",                        
                        "opt" : true
                    }
                ],                
                "desc" : "Convert an array to string using the specified separator.",                
                "examples" : [
                    " dim arr_num = {1;2;3}",                    
                    " arr_num.Join(\"|\") ' => \"1|2|3\"",                    
                    "",                    
                    " dim arr_bool = {true;false;true}",                    
                    " arr_bool.Join(\"@\") ' => \"1@0@1\"",                    
                    "",                    
                    " dim arr_string = {\"a\";\"b\";\"c\"}",                    
                    " arr_string.Join() ' => \"a;b;c\"",                    
                    "",                    
                    " dim arr_date = {#21/03/2009#;#23/07/2010#;#26/12/2011#}",                    
                    " arr_date.Join(\" and \")",                    
                    " ' => \"21/03/2009 and 23/07/2010 and 26/12/2011\""
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Max",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "nthHigher",                        
                        "type" : "number",                        
                        "desc" : "nth highest value to obtain. (1st by default)",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Use this function to return the nth highest value of data.",                    
                    " Returns DK when the 'nth highest value' is out of bound."
                ],                
                "examples" : [
                    " dim arr = {3;4;1}",                    
                    " arr.Max() ' => 4",                    
                    " arr.Max(2) ' => 3",                    
                    " arr.Max(4) ' => DK (Out of bound)"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Merge",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "data",                        
                        "type" : "array",                        
                        "desc" : "Array or number to add"
                    }
                ],                
                "desc" : [
                    " Those methods modify the object in place.",                    
                    " Use it to merge the current array with the data without repetition",                    
                    " Equivalent to CurrentArray = CurrentArray + data",                    
                    " Or to CurrentArray = CurrentArray Union data",                    
                    " The usage of the calls chains must be done in a single line (no carriage return),",                    
                    " if you want to execute multiple operations in multiple lines,",                    
                    " write a complete operations sentence on each line",                    
                    " (see 'Chains calls examples')"
                ],                
                "examples" : [
                    " dim arr = {2;4}",                    
                    " arr.Merge({4;5;6;}) ' => arr",                    
                    " return arr '=> {2;4;5;6}",                    
                    "",                    
                    " dim arr = {\"b\";\"a\"}",                    
                    " arr.Merge({\"c\";\"a\"}) ' => arr",                    
                    " return arr ' => {\"b\";\"a\";\"c\"}",                    
                    "",                    
                    " Chains calls examples:",                    
                    "",                    
                    " ' Legal syntaxes in single line:",                    
                    " dim my_array = {1; 2}",                    
                    " my_array.Merge({2; 3}) + {4}",                    
                    " ' => my_array with values {1; 2; 3; 4}",                    
                    " my_array.Merge(2).Merge(3).Merge(4)",                    
                    " ' => my_array with values {1; 2; 3; 4}",                    
                    "",                    
                    " ' Illegal syntaxes in multiline:",                    
                    " dim my_array = {1; 2}",                    
                    " my_array.Merge(3)",                    
                    " +",                    
                    " {4}  ' => Compilation error",                    
                    " dim my_array = {1;2}",                    
                    " my_array.Merge(5)",                    
                    " .Merge(6) ' => Compilation error",                    
                    "",                    
                    " ' Legal syntaxes in multiline:",                    
                    " dim my_array = {1; 2}",                    
                    " my_array.Merge(3)",                    
                    " my_array = my_array + {4}",                    
                    " ' =>  my_array with values {1;2;3;4}",                    
                    " my_array.Merge(5)",                    
                    " my_array.Merge(6)",                    
                    " ' => my_array with values {1;2;3;4;5;6}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Min",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "nthLowest",                        
                        "type" : "number",                        
                        "desc" : "nth lowest value to obtain. (1st by default)",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Use this function to return the nth smallest value of data.",                    
                    " Returns DK when the 'nth lowest value' is out of bound."
                ],                
                "examples" : [
                    " dim arr = {3;4;1}",                    
                    " arr.Min() ' => 1",                    
                    " arr.Min(2) ' => 3",                    
                    " arr.Min(4) ' => DK (Out of bound)"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Push",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "value",                        
                        "type" : "variant",                        
                        "desc" : "Value to add"
                    }
                ],                
                "desc" : [
                    " Those methods modify the object in place.",                    
                    " Use it to add a set of values/data allowing repetition (with duplicates) at the end of the array. This is a synonym of Insert",                    
                    " The usage of the calls chains must be done in a single line (no carriage return),",                    
                    " if you want to execute multiple operations in multiple lines,",                    
                    " write a complete operations sentence on each line",                    
                    " (see 'Chains calls examples')"
                ],                
                "examples" : [
                    " dim arr = {2;4}",                    
                    " arr.Push({1;4}) ' => arr",                    
                    " return arr ' => {2;4;1;4}",                    
                    "",                    
                    " dim arr = {\"b\";\"a\"}",                    
                    " arr.Push({\"c\";\"a\"}) ' => arr",                    
                    " return arr ' => {\"b\";\"a\";\"c\";\"a\"}",                    
                    "",                    
                    " dim arr = {2;4}",                    
                    " arr.Push(5) ' => arr",                    
                    " return arr ' => {2;4;5}",                    
                    "",                    
                    " Chains calls examples:",                    
                    "",                    
                    " ' Legal syntaxes in single line:",                    
                    " dim my_array = {1; 2}",                    
                    " my_array.Push(3) + {4}",                    
                    " ' => my_array with values {1; 2; 3; 4}",                    
                    " my_array.Push(5).Insert(6)",                    
                    " ' => my_array with values {1; 2; 3; 4; 5; 6}",                    
                    "",                    
                    " ' Illegal syntaxes in multiline:",                    
                    " dim my_array = {1; 2}",                    
                    " my_array.Push(3)",                    
                    " +",                    
                    " {4}  ' => Compilation error",                    
                    "",                    
                    " dim my_array = {1;2}",                    
                    " my_array.Push(5)",                    
                    " .Insert(6) ' => Compilation error",                    
                    "",                    
                    " ' Legal syntaxes in multiline:",                    
                    " dim my_array = {1; 2}",                    
                    " my_array.Push(3)",                    
                    " my_array = my_array + {4}",                    
                    " ' =>  my_array with values {1;2;3;4}",                    
                    " my_array.Push(5)",                    
                    " my_array.Push(6)",                    
                    " ' => my_array with values {1;2;3;4;5;6}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Remove",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "value",                        
                        "type" : "variant",                        
                        "desc" : "Value to remove"
                    }
                ],                
                "desc" : [
                    " This method modify the object in place.",                    
                    " It removes all elements which matches the data",                    
                    " The usage of the calls chains must be done in a single line (no carriage return),",                    
                    " if you want to execute multiple operations in multiple lines,",                    
                    " write a complete operations sentence on each line",                    
                    " (see 'Chains calls examples' in the .Insert and .InsertAt methods)"
                ],                
                "examples" : [
                    " dim arr = {2;4;5;4;6}",                    
                    " arr.Remove(4) ' => arr ' ({2;5;6})",                    
                    " arr.Remove({2; 6}) ' => arr",                    
                    " return arr ' => {5}",                    
                    "",                    
                    " dim arr = {\"b\";\"a\";\"c\";\"b\"}",                    
                    " arr.Remove(\"b\") ' => arr",                    
                    " return arr ' => {\"a\";\"c\"}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "RemoveAt",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "index",                        
                        "type" : "number",                        
                        "desc" : "Index of data to remove (based 1)"
                    }
                ],                
                "desc" : [
                    " This method modify the object in place.",                    
                    " It removes the element at the specify index",                    
                    " The usage of the calls chains must be done in a single line (no carriage return),",                    
                    " if you want to execute multiple operations in multiple lines,",                    
                    " write a complete operations sentence on each line",                    
                    " (see 'Chains calls examples' in the .Insert and .InsertAt methods)"
                ],                
                "examples" : [
                    " dim arr = {2;4;5;4;6}",                    
                    " arr.RemoveAt(2) ' => arr",                    
                    " return arr ' => {2;5;4;6}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "SelectRandom",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "Number1",                        
                        "type" : "number",                        
                        "opt" : true
                    }
                ],                
                "desc" : "Use this function to randomly select a specified number of values from an existing array.",                
                "examples" : [
                    " dim arr = {2;4;5;1;3}",                    
                    " arr.SelectRandom() ' => {4}",                    
                    " arr.SelectRandom(2) ' => {2;5}",                    
                    " '",                    
                    " arr = {\"b\";\"a\";\"c\"}",                    
                    " arr.SelectRandom(2) ' => {\"b\";\"c\"}",                    
                    " '",                    
                    " dim emptyArray = {}",                    
                    " emptyArray.SelectRandom() ' => {}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "SetAt",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "index",                        
                        "type" : "number",                        
                        "desc" : "Position of the array where the data should be set (base 1)"
                    },                    
                    {
                        "name" : "data",                        
                        "type" : "variant",                        
                        "desc" : "Data to set at the specified index"
                    }
                ],                
                "desc" : "Set the data at the specify index<br />This method modify the object in place. <br/>If the specified index is out of range, superior than the size of the array, the data will then be inserted at the end of the array",                
                "examples" : [
                    " dim arr = {2;4}",                    
                    " arr.SetAt(2, 3) ' => arr",                    
                    " return arr  ' => {2;3}",                    
                    "",                    
                    " dim arr = {\"b\";\"a\"}",                    
                    " arr.SetAt(1, \"z\") ' => arr",                    
                    " return arr ' => {\"z\";\"a\"}",                    
                    "",                    
                    " dim arr = {1; 2}",                    
                    " arr.SetAt(4, 5) ' => arr",                    
                    " return arr ' => {1;2;5}",                    
                    "",                    
                    " dim arr = {2;4;5}",                    
                    " arr.SetAt(2, {3;4} ) ' => arr",                    
                    " return arr  ' => {2;3;4}"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Shuffle",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "Number1",                        
                        "type" : "number",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " This method modify the object in place.",                    
                    " Use this function to sort a list of data from an array into a random order.",                    
                    " Parameters",                    
                    " - seed [Optional] Any number to reapply the same order for another Shuffle in the same interview scope"
                ],                
                "examples" : [
                    " dim arr = {1;2;3;4;5}",                    
                    " arr.Shuffle( ) ' => arr",                    
                    " return arr ' => {2;4;5;1;3}",                    
                    "",                    
                    " dim arr1 = {1;2;3;4;5}",                    
                    " arr1.Shuffle( 17 ) ' => arr1 ({3;1;2;5;4})",                    
                    " '",                    
                    " dim arr2 = {11;22;33;44;55}",                    
                    " arr2.Shuffle( 17 ) ' => arr2 ({33;11;22;55;44})"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Sort",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "desc" : [
                    " This method modify the object in place.",                    
                    " Use this function to sort a list of data from an array into a ascending order."
                ],                
                "examples" : [
                    " dim arr = {2;4;5;1;3}",                    
                    " arr.Sort() ' => arr",                    
                    " return arr '=> {1;2;3;4;5}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "SortDesc",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "array",                
                "desc" : [
                    " This method modify the object in place.",                    
                    " Use this function to sort a list of data from an array into a descending order."
                ],                
                "examples" : [
                    " dim arr = {2;4;5;1;3}",                    
                    " arr.SortDesc() ' => arr",                    
                    " return arr ' => {5;4;3;2;1}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "StdDev",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : [
                    " Only available for an array of numbers.",                    
                    " This is askiascript's abbreviation for standard deviation.",                    
                    " Use this function to calculated the numerical standard deviation of numerical data where the variance is obtained by dividing by N",                    
                    " To obtain the standard deviation estimatore (variance devided by N-1), use StdDevEst",                    
                    " Returns 0 when the array is empty."
                ],                
                "examples" : [
                    " dim arr = {10;20;50;75;88}",                    
                    " arr.StdDev() ' => 30.19668856017163",                    
                    "",                    
                    " dim emptyArray = {1;2}",                    
                    " emptyArray.Remove({1;2})",                    
                    " emptyArray.StdDev() ' => 0"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "StdDevEst",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : [
                    " Only available for an array of numbers.",                    
                    " This is askiascript's abbreviation for standard deviation estimator.",                    
                    " Use this function to calculated the numerical standard deviation of numerical data where the variance is obtained by dividing by N-1",                    
                    " To obtain the normal standard deviation, use StdDev",                    
                    " Returns 0 when the array is empty."
                ],                
                "examples" : [
                    " dim arr = {10;20;50;75;88}",                    
                    " arr.StdDevEst() ' => 33.76092415796701",                    
                    "",                    
                    " dim emptyArray = {1;2}",                    
                    " emptyArray.Remove({1;2})",                    
                    " emptyArray.StdDevEst() ' => 0"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Sum",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "number",                
                "desc" : [
                    " Only available for an array of numbers.",                    
                    " Use this function to calculate the numerical sum of numerical data.",                    
                    " Returns 0 when the array is empty."
                ],                
                "examples" : [
                    " dim arr = {2;4}",                    
                    " arr.Sum() ' => 6",                    
                    "",                    
                    " dim emptyArray = {1;2}",                    
                    " emptyArray.Remove({1;2})",                    
                    " emptyArray.Sum() ' => 0"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToString",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Convert an array to string",                
                "examples" : [
                    " dim arr_num = {1;2;3}",                    
                    " arr_num.ToString() ' => \"1;2;3\"",                    
                    " '",                    
                    " dim arr_bool = {true;false;true}",                    
                    " arr_bool.ToString() ' => \"1;0;1\"",                    
                    " '",                    
                    " dim arr_string = {\"a\";\"b\";\"c\"}",                    
                    " arr_string.ToString() ' => \"a;b;c\"",                    
                    " '",                    
                    " dim arr_date = {#21/03/2009#;#23/07/2010#;#26/12/2011#}",                    
                    " arr_date.ToString() ' => \"21/03/2009;23/07/2010;26/12/2011\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "TypeOf",                
                "ns" : "askialanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns the type of the current object / variable",                
                "examples" : [
                    " dim arr = {2;3}",                    
                    " arr.TypeOf() ' => \"array\""
                ],                
                "version" : "5.3.2.0"
            }
        ]
    },    
    "snippets" : [
        {
            "name" : "elif",            
            "ns" : "askialanguage",            
            "snippet" : "ElseIf _condition_ Then"
        },        
        {
            "name" : "for",            
            "ns" : "askialanguage",            
            "snippet" : [
                " For _initialValue_ To _endValue_",                
                "",                
                " Next"
            ]
        },        
        {
            "name" : "fori",            
            "ns" : "askialanguage",            
            "snippet" : [
                " Dim i",                
                " For i = 1 To _endValue_",                
                "",                
                " Next"
            ]
        },        
        {
            "name" : "if",            
            "ns" : "askialanguage",            
            "snippet" : [
                " If _condition_ Then",                
                "",                
                " EndIf"
            ]
        },        
        {
            "name" : "ifel",            
            "ns" : "askialanguage",            
            "snippet" : [
                " If _condition_ Then",                
                "",                
                " Else",                
                "",                
                " EndIf"
            ]
        }
    ]
}, true);

});
