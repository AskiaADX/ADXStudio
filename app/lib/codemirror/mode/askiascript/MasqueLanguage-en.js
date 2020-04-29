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
    "ADC" : "adc",    
    "ADCCONTENT" : "adccontent",    
    "ADCPROPERTY" : "adcproperty",    
    "ASSERT" : "assert",    
    "BROWSER" : "browser",    
    "ERROR" : "error",    
    "ERRORS" : "errors",    
    "INTERVIEW" : "interview",    
    "LANGUAGE" : "language",    
    "MESSAGE" : "message",    
    "QUESTION" : "question",    
    "QUESTIONARRAY" : "questionarray",    
    "RESPONSE" : "response",    
    "RESPONSES" : "responses",    
    "SURVEY" : "survey",    
    "THEME" : "theme"
});

askiaScript.extend(askiaScript.i18n, {
    "types" : {
        "adc" : "ADC",        
        "adccontent" : "ADCContent",        
        "adcproperty" : "ADCProperty",        
        "assert" : "Assert",        
        "browser" : "Browser",        
        "error" : "Error",        
        "errors" : "Errors",        
        "interview" : "Interview",        
        "language" : "Language",        
        "message" : "Message",        
        "question" : "Question",        
        "questionarray" : "QuestionArray",        
        "response" : "Response",        
        "responses" : "Responses",        
        "survey" : "Survey",        
        "theme" : "Theme"
    },    
    "core" : {
        "adc" : {
            "ns" : "masquelanguage",            
            "desc" : [
                "\tObject used to obtain information about the ADC (Askia Design Control).<br/>",                
                "\tThis variable is on the ADC scope, so it's only available on the ADC itself.<br />",                
                "",                
                "\tIt is accessible through a local variable named CurrentADC<br />"
            ],            
            "alsoSee" : "CurrentADC",            
            "version" : "5.3.3.0"
        },        
        "adccontent" : {
            "ns" : "masquelanguage",            
            "desc" : [
                "\tThis object represent a content defined in the ADC.",                
                "",                
                "\tObject mainly used in the ADC 2.0 to retrieves the &lt;content&gt; in the current &lt;output&gt;.",                
                "",                
                "\tThis object is accessible through the CurrentADC.Contents[ Index ] property or the CurrentADC.GetContent( Location ) method."
            ],            
            "version" : "5.3.3.0"
        },        
        "adcproperty" : {
            "ns" : "masquelanguage",            
            "desc" : [
                "\tThis object represent a property exposed by the ADC.",                
                "",                
                "\tIt's mainly used in the ADC 2.0 to retrieves information about a <property> defined in the ADC.",                
                "",                
                "\tThis object is accessible through the CurrentADC.Properties[ Index ] property or the CurrentADC.GetProperty( PropertyId ) method."
            ],            
            "version" : "5.3.3.0"
        },        
        "assert" : {
            "ns" : "masquelanguage",            
            "desc" : "Object used to validate the integrity of the interviews data.",            
            "remarks" : "Mainly used in AskiaTools.",            
            "version" : "5.3.5.0"
        },        
        "browser" : {
            "ns" : "masquelanguage",            
            "desc" : "Object use to obtain information about the current browser identity, resolution and capabilities.",            
            "remarks" : [
                " All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                
                " <strong>Credits:</strong>",                
                " <ul><li>Browser detection based on the <a href=\"http://www.quirksmode.org/js/detect.html\" target=\"_blank\">browserDetect from QuirksMode</a></li><li>Plugins detection using <a href=\"http://www.pinlady.net/PluginDetect/All/\" target=\"_blank\">PluginDetect by Eric Gerds</a></li><li>HTML5 / ES5 / CSS3 features detection using the <a href=\"http://modernizr.com/\" target=\"_blank\">Modernizr</a></li></ul>"
            ],            
            "examples" : [
                " Browser.Name ' => \"Firefox\"",                
                "",                
                " Browser.Mobile ' => true",                
                "",                
                " Browser.WindowWidth ' => 1916",                
                " Browser.WindowHeight ' => 895",                
                "",                
                " Browser.Support(\"javascript\") ' => true"
            ],            
            "version" : "5.3.3.0"
        },        
        "error" : {
            "ns" : "masquelanguage",            
            "desc" : [
                " Information about an error occurred during the interview.",                
                "",                
                " This object is accessible via the property Errors of a question",                
                "",                
                " "
            ],            
            "examples" : "CurrentQuestion.Errors[1].Message' => \"A response is expected for question 'q1'\"",            
            "alsoSee" : "CurrentQuestion",            
            "version" : "5.4.1.0"
        },        
        "errors" : {
            "ns" : "masquelanguage",            
            "desc" : "Object which contains a collection of errors",            
            "alsoSee" : [
                "Question.Errors",                
                "Error"
            ],            
            "version" : "5.4.1.0"
        },        
        "interview" : {
            "ns" : "masquelanguage",            
            "desc" : "Object used to obtain information about the current interview.",            
            "remarks" : "This should be used during interview and encapsulates some properties that have been deprecated",            
            "examples" : [
                "Interview.IPAddress ' => \"127.0.0.1\"",                
                "",                
                "Interview.Seed ' => 123"
            ],            
            "version" : "5.3.5.0"
        },        
        "language" : {
            "ns" : "masquelanguage",            
            "desc" : "\tObject used to obtain information about a language in an interview or a questionnaire",            
            "remarks" : "\tThis should be used during interview and encapsulates some properties that have been deprecated",            
            "examples" : "\tInterview.Language.ID ' => 1036",            
            "version" : "5.4.1.0"
        },        
        "message" : {
            "ns" : "masquelanguage",            
            "desc" : "\tObject used to list all the possible hardcoded messages",            
            "remarks" : "\tThis should be used during interview and encapsulates some properties that have been deprecated",            
            "examples" : "\t Interview.Translate(Message.other) ' => \" \"Autre\"",            
            "version" : "5.5.2.0"
        },        
        "question" : {
            "ns" : "masquelanguage",            
            "creation" : "Create a question / chapter or loop in the survey structure.",            
            "desc" : [
                " Variable which contains all information and action to execute on question / chapter / loop.",                
                " The special keyword <strong>CurrentQuestion</strong> provide a useful access to the start question of the routing or the question attached to the inline script context.",                
                " To access the question variable you can use the shortcut of the question, using one of the following syntaxes:",                
                " <h3>??shortcut??</h3>",                
                " This syntax return the value(s) (answers) of the question:<br />- A number for a numeric and single closed question- A string for an open-ended question- An array of numbers for a multi-coded question- A date for a date question",                
                " <h3>%%shorcut%%</h3>",                
                " This syntax returns the entry-code(s) (answers) of the closed question:<br />- A string or number for a single closed question- An Array of string/numbers for the multi-coded question",                
                " <h3>shortcut</h3>",                
                " This syntax returns a question object.<br />This syntax is available if the shortcut:<br />- begins by a letter or underscore- only contains alphanumeric characters and underscores (_).- don't contain any spaces- is not a reserved keyword",                
                " If one of the above conditions is not reached, it's always possible to use the long form syntax by encapsulating the shortcut between hat characters (^):<br />^shortcut with irregular form^",                
                " <h3>CurrentQuestion</h3>",                
                " This syntax returns the start question of the routing or the question associated to the context of the page (label, question caption...)"
            ],            
            "examples" : [
                " ??gender??  ' => 1 for Male",                
                " ??age??     ' => 35",                
                " ??brands??  ' => {3; 5; 7}",                
                "",                
                "\t %%country%%   ' => \"US\"",                
                " %%brands%%    ' => {\"coca\"; \"sprite\"; \"7up\"}",                
                "",                
                " q1",                
                " gender",                
                " gender_of_respondent",                
                " ^1. gender of respondent^",                
                "",                
                " CurrentQuestion.Shortcut ' => \"gender\" if the start question of the routing is gender"
            ],            
            "alsoSee" : "CurrentQuestion",            
            "version" : "5.3.2.0"
        },        
        "questionarray" : {
            "ns" : "masquelanguage",            
            "desc" : "Object which contains a collection of questions. It's like an array of questions.",            
            "alsoSee" : "Range",            
            "version" : "5.4.4.0"
        },        
        "response" : {
            "ns" : "masquelanguage",            
            "desc" : "Variable which contains all information and action to execute on response item.",            
            "alsoSee" : "Core.Responses",            
            "version" : "5.3.2.0"
        },        
        "responses" : {
            "ns" : "masquelanguage",            
            "desc" : "Object which contains a collection of responses. It's like an array of responses.",            
            "alsoSee" : [
                "Question.Responses",                
                "Question.AvailableResponses",                
                "Question.Answers",                
                "Core.Response"
            ],            
            "version" : "5.3.2.0"
        },        
        "survey" : {
            "ns" : "masquelanguage",            
            "desc" : "\tIn AskiaScript, the survey object contains all the available information about the survey itself. It is in the global scope, so is accessible everywhere within AskiaScript.",            
            "examples" : [
                "\tSurvey.Name ' => \"Ex.qex\"",                
                "\tSurvey.Id ' => 123"
            ],            
            "version" : "5.5.0.0"
        },        
        "theme" : {
            "ns" : "masquelanguage",            
            "desc" : "Object used to obtain information about the theme for HTML rendering",            
            "examples" : "Theme.BodyBgColor ' => 1036",            
            "version" : "5.4.2.0"
        }
    }
}, true);

askiaScript.extend(askiaScript.lexical, {
    "namespaces" : {
        "masquelanguage" : {
            "name" : "MasqueLanguage",            
            "ns" : "masquelanguage",            
            "dependencies" : [
                "askialanguage"
            ]
        }
    },    
    "builtin" : [
        {
            "name" : "AgentName",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "string",            
            "desc" : [
                " Retrieves the name of the interviewing Agent during askiavoice fieldwork.",                
                " To store it in an open-ended question, use the following syntax:",                
                "",                
                " AgentName",                
                "",                
                " To display it in a question's long caption or response caption, use the following syntax:",                
                "",                
                " ??AgentName??"
            ],            
            "remarks" : "It is possible to store the name of the agent in an open function."
        },        
        {
            "name" : "Alea",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "anytype",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "bound",                    
                    "type" : "anytype"
                }
            ],            
            "prefer" : "Random"
        },        
        {
            "name" : "Assert",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "assert",            
            "desc" : "Object used to validate the integrity of the interviews data.",            
            "remarks" : "Mainly used in AskiaTools.",            
            "version" : "5.3.5.0"
        },        
        {
            "name" : "AvailableQuota",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "quotaString",                    
                    "type" : "string",                    
                    "desc" : "String to target a quota node"
                }
            ],            
            "desc" : "Use this function to determine the specific responses still available for quotas on a given question. The function returns a set of numbers indicating which responses are still available.",            
            "examples" : [
                " AvailableQuota(\"Gender\")",                
                " ' => Return {1;2} if none of the quotas were closed for gender (i.e. responses 1 and 2 are still available).",                
                "",                
                " AvailableQuota(\"Region:1; Age\")",                
                " ' => Return the list of ages available in region 1.",                
                "",                
                " AvailableQuota(\"Region; Age\")",                
                " ' => Return the list of ages available in the current region."
            ]
        },        
        {
            "name" : "Browser",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "browser",            
            "desc" : "Object use to obtain information about the current browser identity, resolution and capabilities.",            
            "remarks" : [
                " This variable is on the global scope, so it's available everywhere in the AskiaScript.",                
                " All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\"), 0)",                
                " <strong>Credits:</strong>",                
                " <ul><li>Browser detection based on the <a href=\"http://www.quirksmode.org/js/detect.html\" target=\"_blank\">browserDetect from QuirksMode</a></li><li>Plugins detection using <a href=\"http://www.pinlady.net/PluginDetect/All/\" target=\"_blank\">PluginDetect by Eric Gerds</a></li><li>HTML5 / ES5 / CSS3 features detection using the <a href=\"http://modernizr.com/\" target=\"_blank\">Modernizr</a></li></ul>"
            ],            
            "examples" : [
                " Browser.Name ' => \"Firefox\"",                
                "",                
                " Browser.Mobile ' => true",                
                "",                
                " Browser.WindowWidth ' => 1916",                
                " Browser.WindowHeight ' => 895",                
                "",                
                " Browser.Support(\"javascript\") ' => true"
            ],            
            "version" : "5.3.3.0"
        },        
        {
            "name" : "CallCount",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : "Retrieves the number of calls made for the Task running this *.QES file in askiavoice.",            
            "remarks" : "You can only use this keyword with the import functionality, Lister field or Internet Parameter, and put this keyword in the text field.",            
            "examples" : "CallCount"
        },        
        {
            "name" : "CallId",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : "Retrieves the current interview's Lister field's Call ID.",            
            "remarks" : "This function returns a Call ID only during askiavoice and/or askiaface fieldwork. When used in askiaweb, or tested in askiadesign, the function will return the default value 0.",            
            "examples" : "CallId"
        },        
        {
            "name" : "CI",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "loopLevel",                    
                    "type" : "number",                    
                    "desc" : "Parent loop level (1 for the closest loop)"
                }
            ],            
            "desc" : [
                " CI() is a shorter synonym for the CurrentItem() function.",                
                " Use this function to refer dynamically to a loop's iterations.",                
                " In this function, \"CurrentItem\" literally refers to the item which a loop is currently iterating.",                
                " The numerical integer value specified in () indicates which level the function is addressing, that is, which loop it is addressing.",                
                " By default, when creating a loop you create a level.",                
                " Thus, CurrentItem(1) makes reference to the item currently being iterated by the immediately above level.",                
                "",                
                " For example, let's imagine we have a first loop, LoopA, containing the items: A, B and C.",                
                " LoopA has a sub-loop, sub-loopB, containing the items: 1, 2 and 3.",                
                " Finally, sub-loopB has a sub-variable: Q1, which is a closed question, containing the items yes and no.",                
                " This structure is what we call a loop of a loop.",                
                " We have two levels, one for each loop, thus, Q1 will be asked for each item of sub-loopB, which in turn will be iterated a new for each item of LoopA.",                
                " That is, Q1 will be asked a total of nine times (3x3)."
            ],            
            "examples" : [
                " ' Let's say we have a question table loop called Brands, containing the items: A, B and C.",                
                " ' Then we have a sub-question called Q1.",                
                "",                
                " CI(1)=2",                
                " ' Means Brands is currently iterating item B.",                
                "",                
                " ??Q1??[CI(1)] Has {2}",                
                " ' Means when answer 2 is given to Q1, for any of the items iterated by Brands"
            ],            
            "synonyms" : "CurrentItem",            
            "alsoSee" : [
                "Question.CurrentIteration",                
                "Question.IsLastIteration",                
                "Question.Iteration"
            ]
        },        
        {
            "name" : "CurrentADC",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "adc",            
            "desc" : "\tReturn the current running ADC instance.",            
            "examples" : [
                "\tCurrentADC.InstanceId ' => 1",                
                "\tCurrentADC.Name ' => \"my-adc\""
            ],            
            "version" : "5.3.3.0"
        },        
        {
            "name" : "CurrentADP",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "adc",            
            "desc" : "\tReturn the current running ADC instance.",            
            "examples" : [
                "\tCurrentADP.InstanceId ' => 1",                
                "\tCurrentADP.Name ' => \"my-adp\""
            ],            
            "version" : "5.4.2.0"
        },        
        {
            "name" : "CurrentItem",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "loopLevel",                    
                    "type" : "number",                    
                    "desc" : "Parent loop level (1 for the closest loop)"
                }
            ],            
            "desc" : [
                " Use this function to refer dynamically to a loop's iterations.",                
                " In this function, \"CurrentItem\" literally refers to the item which a loop is currently iterating.",                
                " The numerical integer value specified in () indicates which level the function is addressing, that is, which loop it is addressing.",                
                " By default, when creating a loop you create a level.",                
                " Thus, CurrentItem(1) makes reference to the item currently being iterated by the immediately above level.",                
                "",                
                " For example, let's imagine we have a first loop, LoopA, containing the items: A, B and C.",                
                " LoopA has a sub-loop, sub-loopB, containing the items: 1, 2 and 3.",                
                " Finally, sub-loopB has a sub-variable: Q1, which is a closed question, containing the items yes and no.",                
                " This structure is what we call a loop of a loop.",                
                " We have two levels, one for each loop, thus, Q1 will be asked for each item of sub-loopB, which in turn will be iterated a new for each item of LoopA.",                
                " That is, Q1 will be asked a total of nine times (3x3)."
            ],            
            "examples" : [
                " ' Let's say we have a question table loop called Brands, containing the items: A, B and C.",                
                " ' Then we have a sub-question called Q1.",                
                "",                
                " CurrentItem(1)=2",                
                " ' Means Brands is currently iterating item B.",                
                "",                
                " ??Q1??[CurrentItem(1)] Has {2}",                
                " ' Means when answer 2 is given to Q1, for any of the items iterated by Brands"
            ],            
            "synonyms" : "CI",            
            "alsoSee" : [
                "Question.CurrentIteration",                
                "Question.IsLastIteration",                
                "Question.Iteration"
            ]
        },        
        {
            "name" : "CurrentItemOrder",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "loopLevel",                    
                    "type" : "number",                    
                    "desc" : "Parent loop level (1 for the closest loop)"
                }
            ],            
            "desc" : "Indicates the order of the current iteration of the question within a loop. It take in account the rotation and ignored responses.",            
            "examples" : "CurrentItemOrder(1)=2",            
            "alsoSee" : "Question.Iteration"
        },        
        {
            "name" : "CurrentQuestion",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "question",            
            "desc" : "Return the start question of the routing or the question attached to the inline script context.",            
            "examples" : "CurrentQuestion.Shortcut ' => \"gender\" if the start question of the routing is gender",            
            "version" : "5.3.2.0"
        },        
        {
            "name" : "CurrentQuestions",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "questionarray",            
            "desc" : [
                " Return an array of the all the questions available in a screen",                
                " This is only available when rendering a page - not in routings"
            ],            
            "examples" : "CurrentQuestions[1].Shortcut ' => \"gender\" if the first question in the screen is Gender",            
            "version" : "5.4.2.0"
        },        
        {
            "name" : "DebutInterview",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "date",            
            "deprecated" : true,            
            "prefer" : "StartInterview"
        },        
        {
            "name" : "EC",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "number1",                    
                    "type" : "number"
                }
            ],            
            "prefer" : [
                "CI",                
                "CurrentItem",                
                "Question.Iteration"
            ]
        },        
        {
            "name" : "ElementCourant",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "number1",                    
                    "type" : "number"
                }
            ],            
            "prefer" : [
                "CI",                
                "CurrentItem",                
                "Question.Iteration"
            ]
        },        
        {
            "name" : "EndInterview",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "date",            
            "desc" : "Returns date and time of when the current interview was finished as a string. This function is used on its own.",            
            "examples" : [
                " 'The interview was finished on 2 January 2004, at 2:30 pm",                
                " EndInterview ' -> 2/1/2004 2:30:00 PM"
            ],            
            "alsoSee" : "StartInterview"
        },        
        {
            "name" : "EstQuotaAtteint",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "deprecated" : true,            
            "prefer" : "IsQuotaReached"
        },        
        {
            "name" : "EstQuotaPleinPour",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "string1",                    
                    "type" : "string"
                }
            ],            
            "prefer" : "IsQuotaFullFor"
        },        
        {
            "name" : "GUID",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "string",            
            "deprecated" : true,            
            "desc" : "Global Unique Identifier for each respondent",            
            "prefer" : "Interview.GUID"
        },        
        {
            "name" : "HMacSHA1",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "URL",                    
                    "type" : "string"
                },                
                {
                    "name" : "Name",                    
                    "type" : "string",                    
                    "desc" : "of the parameter used to sign the URL"
                },                
                {
                    "name" : "Number",                    
                    "type" : "number",                    
                    "desc" : "of the secret key used (right now only 3 keys have been iplemented - contact us of you want your own let to be hardcoded)"
                }
            ],            
            "desc" : [
                " Use this function to sign URLs with HMAC-Sha1. This will ensure that a URL (and its parameters) has not been tampered by",                
                " "
            ],            
            "examples" : [
                " HmacSha1(\"http://www.askia.com\",\"token\",1)  will return something like this \"http://www.askia.com?token=JySXXKclMEioi4mmzRYmrJZU\"",                
                " HmacSha1(\"http://www.askia.com?ID=3\",\"token\",1)  will return something like this \"http://www.askia.com?ID=3&token=uiTTpopld93ffa\"",                
                "",                
                " If you have imported the full URL in a question called EntryURL (by using the internet parameter fullurl), you can use the following code",                
                " dim strFullQuery = EntryURL.Value",                
                "",                
                " Dim strHttp =\"http://\"",                
                " If strFullQuery.Left(strHttp.Length) <> strHttp Then",                
                "\tstrFullQuery = strHttp + strFullQuery",                
                " Endif",                
                " ",                
                " Dim strQuery = strFullquery",                
                " Dim strTokenParm=\"&token=\"",                
                " Dim nPos =strQuery.IndexOf(strTokenParm,False)",                
                " If nPos > 0 Then",                
                "\tstrQuery = strQuery.Left(nPos-1)",                
                " Else",                
                "\tstrTokenParm = \"?token=\"",                
                "\tnPos = strQuery.IndexOf(strTokenParm,false)",                
                "\tIf nPos > 0 Then",                
                "\t\tstrQuery = strQuery.Left(nPos-1)",                
                "\tEndif",                
                " Endif",                
                " ",                
                " ' Returns 1 if there is a match, 2 if someone tampered with the URL",                
                " On ( HmacSha1( strQuery,\"token\",1) = strFullQuery ,1 , 2)"
            ]
        },        
        {
            "name" : "Interview",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "interview",            
            "desc" : "Object used to get information about the current interview or trigger some routings",            
            "remarks" : "",            
            "version" : "5.3.5.0"
        },        
        {
            "name" : "InterviewTime",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "startQuestion",                    
                    "type" : "string",                    
                    "desc" : "Shortcut of the start question"
                },                
                {
                    "name" : "endQuestion",                    
                    "type" : "string",                    
                    "desc" : "Shortcut of the end question, if omit it uses the startQuestion",                    
                    "opt" : true
                },                
                {
                    "name" : "thisIterationOnly",                    
                    "type" : "number",                    
                    "desc" : "Boolean value (0 or 1) which indicates if the calculation of the time should take in account all iteration. (1 by default)",                    
                    "opt" : true
                }
            ],            
            "desc" : [
                " Use this function to find the time spent on a question or between two questions",                
                "",                
                " InterviewTime(startQuestion, endQuestion, thisIterationOnly)"
            ],            
            "examples" : [
                " InterviewTime(\"Gender\") returns the time spent to answer the question gender.",                
                " InterviewTime(\"Gender\"),\"Age\") returns the time spent to answer the question gender to the question age",                
                " (including both the stated questions, and all questions placed between).",                
                " InterviewTime(\"Gender\"),\"Age\"),1) would return the time spent between gender and age in the current item",                
                " (supposing the questions gender and age are in a loop and that the function call is made within that loop)."
            ]
        },        
        {
            "name" : "IntvwId",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : [
                " Retrieves the numerical ID of the current interview during askiaweb fieldwork.",                
                " This function will return the number that is suffixed to the standard �Intvw� prefix of an Intvw file.",                
                " This function is used on its own"
            ],            
            "remarks" : [
                " This function only returns the current interview ID during askiaweb fieldwork.",                
                " When used in askiavoice, askiaface, or when tested in askiadesign, the function will return the default value of -1."
            ],            
            "examples" : [
                " IntvwId",                
                "",                
                " if askiaweb created Intvw123 to stored the current interview�s data, the function will return 123."
            ]
        },        
        {
            "name" : "IpAddress",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "string",            
            "deprecated" : true,            
            "desc" : "Retrieves the IP Address of interviewers during askiaweb fieldwork.",            
            "examples" : "IpAddress",            
            "prefer" : "Interview.IPAddress"
        },        
        {
            "name" : "IsQuotaFullFor",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "quotaString",                    
                    "type" : "string",                    
                    "desc" : "String to target a quota node"
                }
            ],            
            "desc" : "Use this function to trigger an Action when a specific simple or crossed quota has been reached.",            
            "examples" : [
                " IsQuotaFullFor(\"Q1\")",                
                "",                
                " if any of the quotas defined for Q1 have been reached, the function will return the value True. If none of Q1�s quotas have been reached it will return the value False.",                
                "",                
                " IsQuotaFullFor(\"Q1:\"+1)",                
                "",                
                " if the quota defined for Q1�s response item 1 has been reached, the function will return the value True. If the quota defined for Q1�s response item 1 has not been reached it will return the value False.",                
                "",                
                " IsQuotaFullFor(\"Q1;Q2\")",                
                "",                
                " if any of the crossed quotas defined for Q1 by Q2 have been reached, the function will return the value True. If none of the crossed quotas defined for Q1 by Q2 have been reached it will return the value False.",                
                "",                
                " IsQuotaFullFor(\"Q1;Q2:\"+1)",                
                "",                
                " if the crossed quotas defined for Q1 by Q2's response item 1 has been reached, the function will return the value True. If the crossed quotas defined for Q1 by Q2�s response item 1 has been reached it will return the value False."
            ]
        },        
        {
            "name" : "IsQuotaReached",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : "Indicates if at least one quota is reached",            
            "remarks" : [
                " The usage of this function is only necessary when managing quotas manually.",                
                " We recommend that you manage your quotas either with the semi-automatic or automatic option."
            ]
        },        
        {
            "name" : "LastResult",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : "Indicates the latest result code for the current interview",            
            "examples" : "LastResult"
        },        
        {
            "name" : "LastSubResult",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : "Indicates the latest sub-result code for the current interview",            
            "examples" : "LastSubResult"
        },        
        {
            "name" : "MaxQuotaToDo",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "quotaString",                    
                    "type" : "string",                    
                    "desc" : "String to target a quota node"
                },                
                {
                    "name" : "nthMax",                    
                    "type" : "number",                    
                    "desc" : "Indicates the nth maximum to do. (1 by default)",                    
                    "opt" : true
                }
            ],            
            "desc" : [
                " Use this function to determine which quota to prioritize.",                
                " Some methodologies demand that you use the least filled quota.",                
                " This is complex to achieve using other functions",                
                " (e.g. importing all the QuotaToDo in a loop with numeric questions and using an IndexOfMax).",                
                " MaxQuotaToDo makes this procedure easier."
            ],            
            "remarks" : [
                " When testing the questionnaire in askiadesign, this function will always return the value 1.",                
                " This is because the actual quotas have to be defined in the askiafield CCA."
            ],            
            "examples" : [
                " if we have a closed question called ProductToTest:",                
                "",                
                " MaxQuotaToDo(\"ProductToTest\")",                
                "",                
                " If the question to test is a branch:",                
                "",                
                " MaxQuotaToDo(\"Region:1; ProductToTest\")",                
                "",                
                " The second parameter is 1 by default, but allows you to specify the second (or third...) target.",                
                "",                
                " MaxQuotaToDo(\"Region:1; ProductToTest\"),3)"
            ]
        },        
        {
            "name" : "Message",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "message",            
            "desc" : "Object used to get the list of all hardcoded messages",            
            "examples" : "\t Interview.Translate(Message.other) ' => \" \"Autre\"",            
            "version" : "5.5.2.0"
        },        
        {
            "name" : "Mode",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : "Retrieves the current data collection mode (0=Web, 1=CATI, 2=CAPI) OR mode of current ADC content !QUERY!"
        },        
        {
            "name" : "NomEnqueteur",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "string",            
            "deprecated" : true,            
            "prefer" : "AgentName"
        },        
        {
            "name" : "NowUTC",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "date",            
            "desc" : "Returns date and time in UTC (that is universal time <=> Greenwich Meridian Time)",            
            "version" : "5.3.5.0"
        },        
        {
            "name" : "OrderOf",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "array",            
            "args" : [
                {
                    "name" : "shortcut",                    
                    "type" : "string"
                }
            ],            
            "desc" : "Use this function to retrieve the order in which the responses for a question or a loop were presented, or the order of the sub-questions for a chapter",            
            "examples" : [
                " Q1",                
                " B",                
                " A",                
                " C",                
                "",                
                " OrderOf(\"Q1\") returns {2;1;3}"
            ],            
            "prefer" : "Question.AvailableResponses"
        },        
        {
            "name" : "Password",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "string",            
            "desc" : "Returns the hashcode (encrypted 16-length string) to retrieve an interview on the web. It's mostly used to resume an interview on the web."
        },        
        {
            "name" : "PrctDone",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "deprecated" : true,            
            "desc" : [
                " Use this function to return the percentage value of progress through the questionnaire.",                
                "",                
                " This function enables you to calculate, during data collection, how much of the questionnaire has already been answered by the respondent. For example, if we have a questionnaire made of four questions (Q1, Q2, Q3 and Q4), we may decide to paste the following Askia script in the variables� long captions:",                
                "",                
                " You have completed !!PrctDone!!% of the survey.",                
                "",                
                " When a respondent gets to Q3, the function will return 50. That is to say, when arriving on Q3, the respondent has already answered Q1 and Q2, which represents 50% of the questionnaire."
            ],            
            "prefer" : "Interview.Progress"
        },        
        {
            "name" : "PrctFait",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "deprecated" : true,            
            "prefer" : "PrctDone"
        },        
        {
            "name" : "QuotaToDo",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "quotaString",                    
                    "type" : "string",                    
                    "desc" : "String to target a quota node"
                }
            ],            
            "desc" : "Use this function to retrieve the number of outstanding interviews that need to be conducted for a specific variable's quota to be reached.",            
            "remarks" : [
                " When testing the questionnaire in askiadesign, this function will always return the value 1.",                
                " This is because the actual quotas have to be defined in the askiafield CCA."
            ],            
            "examples" : [
                " If we have a closed question called Q1, containing two response items, Male and Female:",                
                "",                
                " QuotaToDo(\"Q1:1\")",                
                "",                
                " returns the number of Male interviews left to do."
            ]
        },        
        {
            "name" : "Random",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "anytype",            
            "args" : [
                {
                    "name" : "bound",                    
                    "type" : "anytype",                    
                    "desc" : "Number which specified the upper-bound for the random selection. <br/>Or array with 2 numbers <em>n</em> and <em>m</em>: <em>n</em> for the number of values to return, <em>m</em> upper-bound for the random selection"
                }
            ],            
            "desc" : [
                " When the bound is a number, randomly select 1 number between 1 to the specified bound.",                
                " When the bound is an array with 2 number like <em>{n; m}</em>, it randomly select <em>n</em> numbers between 1 and <em>m</em>."
            ],            
            "examples" : [
                " Random(5)  '=> Returns 1 value among: {1; 2; 3; 4; 5}",                
                " Random({5; 10}) ' => Returns 5 values among: {1; 2; 3; 4; 5; 6; 7; 8; 9; 10}"
            ],            
            "alsoSee" : "SelectRandom"
        },        
        {
            "name" : "RC",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "shortcut",                    
                    "type" : "string",                    
                    "desc" : "Shortcut of the question, or the shortcut follow by the index of response (shortcut:index)"
                },                
                {
                    "name" : "responseIndex",                    
                    "type" : "number",                    
                    "desc" : "Index of the response",                    
                    "opt" : true
                }
            ],            
            "desc" : "Returns the entry-code as string of the specified response index of the specified question",            
            "examples" : [
                " Assuming the entry codes for the question \"Gender\" are Male 03 and Female 04:",                
                "",                
                " RC(\"Gender:\"+??Gender??) = \"03\"",                
                "",                
                " will refer to the response item Male."
            ],            
            "synonyms" : "ResponseCode",            
            "alsoSee" : [
                "Response.EntryCodeStr",                
                "Question.IndexToEntryCodeStr",                
                "ResponseCodeN"
            ]
        },        
        {
            "name" : "RCN",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "shortcut",                    
                    "type" : "string",                    
                    "desc" : "Shortcut of the question, or the shortcut follow by the index of response (shortcut:index)"
                },                
                {
                    "name" : "responseIndex",                    
                    "type" : "number",                    
                    "desc" : "Index of the response",                    
                    "opt" : true
                }
            ],            
            "desc" : "Returns the entry-code as number of the specified response index of the specified question",            
            "examples" : [
                " Assuming the entry codes for the question \"Gender\" are Male 03 and Female 04:",                
                "",                
                " RCN(\"Gender:\"+??Gender??) Has {3}",                
                "",                
                " will refer to the response item Male."
            ],            
            "synonyms" : "ResponseCodeN",            
            "alsoSee" : [
                "Response.EntryCode",                
                "Question.IndexToEntryCode",                
                "ResponseCode"
            ]
        },        
        {
            "name" : "ReadBinaryFile",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "filePath",                    
                    "type" : "string",                    
                    "desc" : "Full path of the file to read"
                }
            ],            
            "desc" : "Use this function to return the contents of a binary file and transform it into hexadecimal so it can be stored in an open�ended question.",            
            "examples" : [
                " ReadBinaryFile(\"D:\\Workspace\\int1.txt\")",                
                " ReadBinaryFile(\"D:\\Workspace\\int\" + ??Q1?? + \".txt\")"
            ]
        },        
        {
            "name" : "ReadTextFile",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "filePath",                    
                    "type" : "string",                    
                    "desc" : "Full path of the file to read"
                }
            ],            
            "desc" : "Use this function to return the content of a text file and it can be stored in an open�ended question.",            
            "examples" : [
                " ReadTextFile(\"D:\\Workspace\\int1.txt\")",                
                " ReadTextFile(\"D:\\Workspace\\int\" + ??Q1?? + \".txt\")"
            ]
        },        
        {
            "name" : "ResolutionX",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : "Indicates the width of the CATI window in pixels",            
            "examples" : "ResolutionX"
        },        
        {
            "name" : "ResolutionY",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : "Indicates the height of the CATI window in pixels",            
            "examples" : "ResolutionY"
        },        
        {
            "name" : "ResPath",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "string",            
            "desc" : "Retrieves the Resource Path fieldwork.",            
            "examples" : "ReadTextFile(ResPath + \"normal.css\")"
        },        
        {
            "name" : "ResponseCode",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "shortcut",                    
                    "type" : "string",                    
                    "desc" : "Shortcut of the question, or the shortcut follow by the index of response (shortcut:index)"
                },                
                {
                    "name" : "responseIndex",                    
                    "type" : "number",                    
                    "desc" : "Index of the response",                    
                    "opt" : true
                }
            ],            
            "desc" : "Returns the entry-code as string of the specified response index of the specified question",            
            "examples" : [
                " Assuming the entry codes for the question \"Gender\" are Male 03 and Female 04:",                
                "",                
                " ResponseCode(\"Gender:\"+??Gender??) = \"03\"",                
                "",                
                " will refer to the response item Male."
            ],            
            "synonyms" : "RC",            
            "alsoSee" : [
                "Response.EntryCodeStr",                
                "Question.IndexToEntryCodeStr",                
                "ResponseCodeN"
            ]
        },        
        {
            "name" : "ResponseCodeN",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "shortcut",                    
                    "type" : "string",                    
                    "desc" : "Shortcut of the question, or the shortcut follow by the index of response (shortcut:index)"
                },                
                {
                    "name" : "responseIndex",                    
                    "type" : "number",                    
                    "desc" : "Index of the response",                    
                    "opt" : true
                }
            ],            
            "desc" : "Returns the entry-code as number of the specified response index of the specified question",            
            "examples" : [
                " Assuming the entry codes for the question \"Gender\" are Male 03 and Female 04:",                
                "",                
                " ResponseCodeN(\"Gender:\"+??Gender??) Has {03}",                
                "",                
                " will refer to the response item Male."
            ],            
            "synonyms" : "RCN",            
            "alsoSee" : [
                "Response.EntryCode",                
                "Question.IndexToEntryCode",                
                "ResponseCode"
            ]
        },        
        {
            "name" : "ResponseCount",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "string1",                    
                    "type" : "string"
                }
            ],            
            "desc" : "Use this function to return the number of modalities in the specified question.",            
            "examples" : "ResponseCount(\"Gender\") should return 2",            
            "alsoSee" : "Responses.Count"
        },        
        {
            "name" : "ResponseText",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "string1",                    
                    "type" : "string"
                },                
                {
                    "name" : "number2",                    
                    "type" : "number",                    
                    "opt" : true
                }
            ],            
            "desc" : [
                " The function name may be written as ResponseText or the abbreviation RT.",                
                " Use this function to retrieve the selected response item's text caption, in a closed question."
            ],            
            "examples" : [
                " ResponseText(\"Q1:\" + 2) for the second item in q1",                
                " ResponseText(\"Q1:\" + ??Q1??) for the response selected in q1"
            ],            
            "synonyms" : "RT",            
            "alsoSee" : "Response.Caption"
        },        
        {
            "name" : "RT",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "string1",                    
                    "type" : "string"
                },                
                {
                    "name" : "number2",                    
                    "type" : "number",                    
                    "opt" : true
                }
            ],            
            "desc" : [
                " The function name may be written as RT or ResponseText.",                
                " Use this function to retrieve the selected response item's text caption, in a closed question."
            ],            
            "examples" : [
                " RT(\"Q1:\" + 2) for the second item in q1",                
                " RT(\"Q1:\" + ??Q1??) for the response selected in q1"
            ],            
            "synonyms" : "ResponseText",            
            "alsoSee" : "Response.Caption"
        },        
        {
            "name" : "Seed",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "number",            
            "desc" : "Global seed number use by the random algorithm",            
            "examples" : "Seed"
        },        
        {
            "name" : "SelectAlea",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "array",            
            "deprecated" : true,            
            "args" : [
                {
                    "name" : "bound",                    
                    "type" : "anytype"
                }
            ],            
            "prefer" : [
                "SelectRandom",                
                "Array.SelectRandom"
            ]
        },        
        {
            "name" : "SelectRandom",            
            "ns" : "masquelanguage",            
            "base" : "function",            
            "type" : "array",            
            "args" : [
                {
                    "name" : "data",                    
                    "type" : "array",                    
                    "desc" : "Set of values from where the random selection will be done"
                },                
                {
                    "name" : "count",                    
                    "type" : "number",                    
                    "desc" : "Number of value to select"
                }
            ],            
            "desc" : "Randomly select a specified number of values from an existing set of values.",            
            "examples" : [
                " SelectRandom({5 To 10}, 3) ' => {9, 6, 5} (Randomly select 3 values within the range 5 to 10)",                
                " SelectRandom(??Q1??, 5) the function will randomly select five values among those which have been given by the respondent to Q1."
            ],            
            "alsoSee" : [
                "Array.SelectRandom",                
                "Random"
            ]
        },        
        {
            "name" : "StartInterview",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "date",            
            "desc" : "Returns date and time of when the current interview was started as a string. This function is used on its own.",            
            "examples" : [
                " 'The interview was started on 2 January 2004, at 2:30 pm",                
                " StartInterview ' -> 2/1/2004 2:30:00 PM"
            ],            
            "alsoSee" : "EndInterview"
        },        
        {
            "name" : "Survey",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "survey",            
            "desc" : "Object used to get information about the current Survey",            
            "version" : "5.5.5.0"
        },        
        {
            "name" : "Theme",            
            "ns" : "masquelanguage",            
            "base" : "const",            
            "type" : "theme",            
            "desc" : "\tReturn the current theme",            
            "examples" : "\tTheme.BlackColor ' => returs the color used as balck for the current theme",            
            "version" : "5.4.2.0"
        }
    ],    
    "members" : {
        "errors" : [
            {
                "ns" : "masquelanguage",                
                "accessor" : "error",                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "Count",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "\tReturns the number of items in the collection",                
                "examples" : "\tCurrentQuestions.Errors.Count ' => 2",                
                "version" : "5.4.2.0"
            }
        ],        
        "language" : [
            {
                "name" : "Abbr",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Three-letter abbreviation of a language",                
                "examples" : [
                    " Interview.Language.Abbr ' => \"ENG\" (for English)",                    
                    " Interview.Language.Abbr ' => \"FRA\" (for French)"
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "DateFormat",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Date format for a given language",                
                "examples" : [
                    " Interview.Language.DateFormat ' => \"dd/mm/yyyy\" ' FR",                    
                    " Interview.Language.DateFormat ' => \"mm/dd/yyyy\" ' US"
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "DecimalSeparator",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Decimal separator",                
                "examples" : [
                    " Interview.Language.DecimalSeparator ' => \",\" ' FR",                    
                    " Interview.Language.DecimalSeparator ' => \".\" ' US"
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "ID",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "ID of the language LCID : see https://dev.askia.com/projects/askiadesign/wiki/Askiadesign_askiascript_2_0_specifications_Language#Language-codes-LCID",                
                "examples" : [
                    " Interview.Language.Id ' => 2057 (for English)",                    
                    "  Interview.Language.Id ' => 1036 (for French)"
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "Name",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Full name of a language",                
                "examples" : [
                    " Interview.Language.Name ' => \"English (United Kingdom)\"",                    
                    " Interview.Language.Name ' => \"French (France)\""
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "ThousandSeparator",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Thousand Separator for large numbers 1,000",                
                "examples" : [
                    " Interview.Language.ThousandSeparator ' => \" \" ' FR",                    
                    " Interview.Language.ThousandSeparator ' => \",\" ' US"
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "Translate",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "MessageID",                        
                        "type" : "string",                        
                        "desc" : "Identifier of the message you want to translate - see the list below"
                    }
                ],                
                "desc" : [
                    "Return the translate string for the language",                    
                    "",                    
                    "\"mandatory_question_1\" -> \"A response is expected for question '%1'.\"",                    
                    "\"only_one_response_1\"\t-> You can only give one response to question '%1'.",                    
                    "\"1_must_be_numeric\"\t-> The response to question '%1' must be numeric.",                    
                    "\"1_must_be_between_2_and_3\"\t-> Response to question '%1' must be between %2 and %3.",                    
                    "\"1_must_be_above_2\"\t\t=> Response to question '%1' must be above %2.",                    
                    "\"1_must_be_under_2\"\t\t=> Response to question '%1' must be under %2.",                    
                    "\"only_1_response_2\"\t\t=> You can only give %1 responses to question '%2'.",                    
                    "\"response_1_not_available_2\"\t=>\t\tYou cannot give response '%1' to question '%2'.",                    
                    "\"specify\"\t\t\t\t\t=> Specify",                    
                    "\"ranking_between_one_and_1_for_2\"\t=> Ranking must be between 1 and %1 for question '%2'.",                    
                    "\"ranking_1_missing_for_2\"\t=> Rank %1 is missing for question '%2'.",                    
                    "\"ranking_1_twice_for_2\"\t=> Rank %1 has been given more than once for question '%2'.",                    
                    "\"other\"\t=> Other",                    
                    "\"new\"\t=> New...",                    
                    "\"other_specify\"\t=> Other (specify)",                    
                    "\"dk\"\t=> Don't Know",                    
                    "\"specify_semi_open\"\t=> You must specify a semi-open response",                    
                    "\"1_cannot_be_decimal\"\t=> Response to question '%1' cannot be decimal",                    
                    "\"1_must_be_date\"\t\t=> Please enter a valid date for question '%1'",                    
                    "\"1_must_be_time\"\t\t=> Please enter a valid time for question '%1'",                    
                    "\"quotas_closed_for_1\"\t=>\tThe quotas are closed for <b>%1</b>.",                    
                    "\"at_least_1_responses_for_2\"\t=> Please select at least %1 responses for question '%2'",                    
                    "\"next\"\t=> Next",                    
                    "\"previous\"\t=> Previous",                    
                    "\"1_completed\"\t=> 1% completed"
                ],                
                "examples" : "Interview.Language.Translate(Message.other) ' => \" \"Autre\"",                
                "version" : "5.5.2.0"
            }
        ],        
        "questionarray" : [
            {
                "ns" : "masquelanguage",                
                "accessor" : "question",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "Count",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "\tReturns the number of items in the collection",                
                "examples" : "\tCurrentQuestions.Count ' => 2",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "Errors",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "errors",                
                "desc" : "\tReturns the list of errors during the interview run-time associated with the questions.",                
                "examples" : [
                    "\tCurrentQuestions.Errors.Count ' => 0",                    
                    "",                    
                    "\tCurrentQuestions.Errors[1].Key ' => \"expected_answer\"",                    
                    "",                    
                    "\tCurrentQuestions.Errors[1].Message ' => \"A response is expected for question 'q1'\""
                ],                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "FilterByTag",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "Tag",                        
                        "type" : "string",                        
                        "desc" : "Specifies the tag you want to filter by"
                    }
                ],                
                "desc" : "\tReturns an array of questions who have been tagged with the same parameter",                
                "examples" : "\tSurvey.Questions.FilterByTag(\"Likert\")",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "FilterByTag",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "questionarray",                
                "args" : [
                    {
                        "name" : "TagArray",                        
                        "type" : "stringarrays",                        
                        "desc" : "Specifiss the tags you want to filter by"
                    }
                ],                
                "desc" : "\tReturns an array of questions who have been tagged with one of the parameters",                
                "examples" : "\tSurvey.Questions.FilterByTag({\"Likert\"; {\"Scale\"})",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "FilterUnanswered",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "questionarray",                
                "desc" : "\tReturns an array of questions who are yet to be answered",                
                "examples" : "\tSurvey.Questions.FilterUnanswered() > 0 ' Survey is not complete!",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "FindByShortcut",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "question",                
                "args" : [
                    {
                        "name" : "Shortcut",                        
                        "type" : "string",                        
                        "desc" : "Specifies the shrtcut of the quetsion you want to find"
                    }
                ],                
                "desc" : "\tReturns one question having the specified shortcut - if the question is not found, a dummy question is returned with a questionID = DK",                
                "examples" : "\tSurvey.Questions.FindByshortcut(\"Gender\")",                
                "version" : "5.5.0.0"
            }
        ],        
        "responses" : [
            {
                "ns" : "masquelanguage",                
                "accessor" : "response"
            },            
            {
                "name" : "Caption",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "array",                
                "desc" : "Returns an array with the caption of responses in the collection",                
                "examples" : "gender.Responses.Caption ' => {\"Man\"; \"Woman\"}",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Count",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the number of items in the collection",                
                "examples" : "gender.Responses.Count ' => 2",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "EntryCode",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "array",                
                "desc" : "Returns an array with the entry code of responses in the collection",                
                "examples" : "brands.Responses.EntryCode ' => {1; 2; 3}",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "EntryCodeStr",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "array",                
                "desc" : "Returns an array with the entry code (as string) of responses in the collection",                
                "examples" : [
                    " brands.Responses.EntryCodeStr ' => {\"001\"; \"002\"; \"003\"}",                    
                    " country.Responses.EntryCodeStr ' => {\"US\"; \"UK\"; \"FR\"}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Factor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "\tReturns all the factors of a response collection as they were entered in the value column of the scaled responses",                
                "examples" : [
                    "\tAge.Responses.Factor ' => {10; 20; 30; 50}",                    
                    "\tAge.AvailableResponses.Factor ' => {20; 30; 50}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Index",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "array",                
                "desc" : "Returns an array indexes (based 1) of responses as their was entered in question",                
                "examples" : [
                    " gender.Responses.Index ' => {1; 2}",                    
                    " country.AvailableResponses.Index ' => {2; 3; 1}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ResourceURL",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "array",                
                "desc" : "Returns an array with the URL of resources for the responses in the collection",                
                "examples" : "gender.Responses.ResourceURL  ' => {\"/man.png\"; \"/woman.png\"}",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Roots",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "responses",                
                "desc" : "Returns an array of responses with all the top level responses",                
                "examples" : "Brands.Responses.Roots[1] ' => \"Brand A\"",                
                "version" : "5.5.3.0"
            },            
            {
                "name" : "ToString",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns a string which represent the response collection (express in JSON format)",                
                "examples" : [
                    " ' Output in a single line (it's break here for the readability)",                    
                    " gender.Responses.ToString()",                    
                    " ' => [{",                    
                    " \"index\":1,",                    
                    " \"entryCode\":\"001\",",                    
                    " \"caption\":\"Man\",",                    
                    " \"isExclusive\":true,",                    
                    " \"resourceUrl\":\"./Man.png\"",                    
                    " },{",                    
                    " \"index\" : 2,",                    
                    " \"entryCode\":\"002\",",                    
                    " \"caption\":\"Woman\",",                    
                    " \"isExclusive\":true,",                    
                    " \"resourceUrl\":\"./Woman.png\"",                    
                    " }]"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "TypeOf",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns the type of the current object / variable",                
                "examples" : "gender.Responses.TypeOf() ' => \"responses\"",                
                "version" : "5.3.2.0"
            }
        ],        
        "assert" : [
            {
                "name" : "AddContext",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "assert",                
                "args" : [
                    {
                        "name" : "Question",                        
                        "type" : "question",                        
                        "desc" : "that will be added to the context"
                    },                    
                    {
                        "name" : "Message",                        
                        "type" : "string",                        
                        "desc" : "Message that will be prefix the value of the context",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Adds a question to the context. Whenever an Assert will fail, the content of the question will be added to the output",                    
                    " "
                ],                
                "examples" : [
                    "      Assert.AddContext( Gender ).AddContext( Age ,\"Age=\")",                    
                    "      Assert ( Gender = 1 and Age < 18, \"We do not know allow males under 18)",                    
                    "      Assert.ResetContext()"
                ]
            },            
            {
                "name" : "Check",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "assert",                
                "args" : [
                    {
                        "name" : "expression",                        
                        "type" : "anytype",                        
                        "desc" : "An AskiaScript expression that should be evaluated as true"
                    },                    
                    {
                        "name" : "message",                        
                        "type" : "string",                        
                        "desc" : "An explicit human message that explain the assertion. It will be used in the final report when the assertion failed.  We recommend to use message with 3 parts: <b>context</b>, <b>expectation</b>, <b>actual</b> (context and actual could be optional).  Examples message format: - \"When/If [context], [question(s)/response[s)] should/must be [expectation], but was [actual]\" - \"[question(s)/response(s)] should/must be [expectation], but was [actual]\""
                    }
                ],                
                "desc" : [
                    " Evaluate the expression as a boolean value.",                    
                    " If the value of the expression is true, nothing happens",                    
                    " Otherwise the assert failed and the message is used to give an explanation of the failure.",                    
                    " The Asset object is returned to allow chaining of actions"
                ],                
                "examples" : [
                    " If Country has {1} Then",                    
                    "     Assert.Check(Language has {1}, \"When country is 'UK', 'English' language should be selected, but was {%= Country.Answers[1].Caption%}\")",                    
                    " EndIf",                    
                    " ' Example output:",                    
                    " ' \"When country is 'UK', 'English' language should be selected, but was 'French\"",                    
                    "",                    
                    " If Country has {1} Then",                    
                    "     Assert.Check(Q1.HasNA, \"If 'UK', Q1 must be skipped, but was ask\")",                    
                    " EndIf",                    
                    "",                    
                    " Assert.Check(Q2.Responses[3].IsIgnored, \"The third response of Q2 should be ignored\")",                    
                    "",                    
                    " ' Use the return value of assert",                    
                    " If Gender Has {1} Then",                    
                    "      If Assert.Check(AgeRecod.HasNA, \"AgeRecod must be skipped for 'man'\") Then",                    
                    "         If Age < 26 Then",                    
                    "             Assert.Check(AgeRecord Has {1}, \"AgeRecod must be 'Less than 25' when Age < 25, but was {%= AgeRecord.Answers[1].Caption%}\")",                    
                    "         Else If Age < 46 Then",                    
                    "             Assert.Check(AgeRecord Has {2}, \"AgeRecod must be '25-45' when Age < 46, but was {%= AgeRecord.Answers[1].Caption%}\")",                    
                    "         Else",                    
                    "             Assert.Check(AgeRecord Has {3}, \"AgeRecod must be 'Greater 45' when Age > 45, but was {%= AgeRecord.Answers[1].Caption%}\")",                    
                    "         EndIf",                    
                    "      EndIf",                    
                    " EndIf"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "ResetContext",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "assert",                
                "desc" : [
                    " Resets the context and removes all question reporting",                    
                    " "
                ],                
                "examples" : [
                    "      Assert.AddContext( Gender ).AddContext( Age )",                    
                    "\t  Assert ( Gender = 1 and Age < 18, \"We do not know allow males under 18)",                    
                    "      Assert.ResetContext()"
                ]
            },            
            {
                "name" : "ToString",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns the string representation of the object / variable",                
                "examples" : "Assert.ToString()",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "TypeOf",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns \"assert\"",                
                "examples" : "Assert.TypeOf() ' => \"assert\"",                
                "version" : "5.3.5.0"
            }
        ],        
        "error" : [
            {
                "name" : "Id",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Return the id of the Error",                
                "examples" : "CurrentQuestion.Errors[1].Id  ' => 1001",                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "Message",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Return the message of the error",                
                "examples" : [
                    " CurrentQuestion.Errors[1].Message  ' => \"A response is expected for question 'q1'\"",                    
                    " q2.Errors[1].Message  ' => \"You can only give one response for question 'q2'\""
                ],                
                "version" : "5.4.1.0"
            }
        ],        
        "question" : [
            {
                "name" : "AllIterations",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "array",                
                "desc" : [
                    " Returns all the positions of a question ",                    
                    " "
                ],                
                "examples" : [
                    " Q1 is a single question inside a loop with 3 iterations",                    
                    " Q1.AllIterations.Count ' => 3",                    
                    "",                    
                    " ",                    
                    " Q5 is a single question inside a loop of loop with respectively 3 and 2 iterations",                    
                    " Q5.AllIterations.Count",                    
                    " ' => 6",                    
                    "  "
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "AllValues",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "array",                
                "desc" : [
                    " Returns all values of a question in loop.",                    
                    " The value could be an array of the question value or nested arrays when the question is inside a nested loops.",                    
                    " This property is only available for the question in loop, otherwise it throw an error."
                ],                
                "examples" : [
                    " Q1 is a single question inside a loop with 3 iterations",                    
                    " Q1.AllValues ' => {3; 5; 2}",                    
                    "",                    
                    " Q2 is a multiple question inside a loop with 3 iterations",                    
                    " Q2.AllValues",                    
                    " ' => {{3;1;4}; {2;5;1}; {4;5;2}}",                    
                    "",                    
                    " Q3 is an open-ended question inside a loop with 3 iterations",                    
                    " Q3.AllValues",                    
                    " ' => {\"hello\"; \"hi\"; \"goodbye\"}",                    
                    "",                    
                    " Q4 is a numeric question inside a loop with 3 iterations",                    
                    " Q4.AllValues",                    
                    " ' => {32.5; 47.1; 0}",                    
                    "",                    
                    " Q5 is a single question inside a loop of loop with respectively 3 and 2 iterations",                    
                    " Q5.AllValues",                    
                    " ' => {{5;3}; {3;4}; {1;2}}",                    
                    "",                    
                    " Q6 is a multiple question inside a loop of loop with respectively 3 and 2 iterations",                    
                    " Q6.AllValues",                    
                    " ' => {{{5;3;4};{2;1;4}}; {{1;2};{2;4;3}}; {{3;2;1};{4}}}",                    
                    "",                    
                    " Q7 is an open-ended question inside a loop of loop with respectively 3 and 2 iterations",                    
                    " Q7.AllValues",                    
                    " ' => {{\"hello\";\"world\"};  {\"hi\";\"people\"};  {\"goodbye\";\"folks\"}}",                    
                    "",                    
                    " Q8 is a numeric question inside a loop of loop with respectively 3 and 2 iterations",                    
                    " Q8.AllValues",                    
                    " ' => {{13.5;12}; {0;5}; {8.3;9}}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Answers",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "responses",                
                "desc" : "Returns the list of selected responses in the selected order",                
                "examples" : [
                    " Color.Answers",                    
                    " Design definition: Shortcut: Color, Type: Multiple, Rotation: yes random, LongCaption: Which color do you like?",                    
                    " List of responses:",                    
                    " Red",                    
                    " Blue",                    
                    " Green",                    
                    " Purple",                    
                    "",                    
                    " Screen visible by the respondent",                    
                    " (The Blue response was hidden using a routing ignore responses):",                    
                    " Which color do you like?",                    
                    " Green",                    
                    " Red",                    
                    " Purple",                    
                    "",                    
                    " The responses selected by the respondent are Purple and Red in this order",                    
                    " (the EntryCode of Red is 11, Blue is 12, Green is 13 and Purple is 14)",                    
                    "",                    
                    " Color.Answers.Value will return 4;1",                    
                    " Color.Answers.EntryCode will return 14;11",                    
                    " Color.Answers.Caption will return Purple;Red",                    
                    " Color.Answers[2].Value will return 1 (the second answer given)"
                ],                
                "alsoSee" : [
                    "Question.AvailableResponses",                    
                    "Question.Responses",                    
                    "Core.Responses",                    
                    "Core.Response"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "AvailableAnswers",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "responses",                
                "desc" : [
                    " Returns the list of available responses in the selected order and according to",                    
                    " the MaxVisibleIterations property."
                ],                
                "alsoSee" : [
                    "Question.Answers",                    
                    "Question.MaxVisibleIterations"
                ],                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "AvailableBalancedQuota",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "value",                        
                        "type" : "number",                        
                        "desc" : "Specifies the quota branch for each",                        
                        "repeatable" : true,                        
                        "prefix" : "question"
                    }
                ],                
                "desc" : [
                    " returns the indexes of the responses of the TargetQuestion still available ( to do > 0) and sorted from the max to the min using the following formula ",                    
                    "  Formula: (Target% - Observed%) / Target%"
                ],                
                "examples" : [
                    " Newspapers.AvailableBalancedQuota[1] returns the quota which will make the quota closest to the target percentage",                    
                    " Newspapers.AvailableQuota(Region: 1, age: {1;2} )[1] returns the newspaper which will mae closes to the target % for region 1 and Age 1 or 2",                    
                    " "
                ],                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "AvailableQuota",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "value",                        
                        "type" : "number",                        
                        "desc" : "Specifies the quota branch for each",                        
                        "repeatable" : true,                        
                        "prefix" : "question"
                    }
                ],                
                "desc" : "returns the indexes of the responses of the TargetQuestion still available ( to do > 0) and sorted from the max to do to the min to do using the count for the sort",                
                "examples" : [
                    " Newspapers.AvailableQuota()[1] returns the quota for which there is the biggest number of respondents to fill",                    
                    " Newspapers.AvailableQuota(Region: 1, age: {1;2} )[1] returns the newspaper for which there is the biggest number of respondents to fill for region 1 and Age 1 or 2",                    
                    " ",                    
                    " "
                ],                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "AvailableResponses",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "responses",                
                "desc" : "Returns the list of available responses in the visible order",                
                "examples" : [
                    " Color.AvailableResponses",                    
                    " Design definition: Shortcut: Color, Type: Multiple, Rotation: yes random, LongCaption: Which color do you like?",                    
                    " List of responses:",                    
                    " Red",                    
                    " Blue",                    
                    " Green",                    
                    " Purple",                    
                    "",                    
                    " Screen visible by the respondent",                    
                    " (The Blue response was hidden using a routing ignore responses):",                    
                    " Which color do you like?",                    
                    " Green",                    
                    " Red",                    
                    " Purple",                    
                    "",                    
                    " The responses selected by the respondent are Purple and Red in this order",                    
                    " (the EntryCode of Red is 11, Blue is 12, Green is 13 and Purple is 14)",                    
                    "",                    
                    " Color.AvailableResponses.Value will return 3;1;4",                    
                    " Color.AvailableResponses.EntryCode will return 13;11;14",                    
                    " Color.AvailableResponses.Caption will return Green;Red;Purple",                    
                    " Color.AvailableResponses[2].Value will return 1 (the second answer available)"
                ],                
                "alsoSee" : [
                    "Question.Responses",                    
                    "Question.Answers",                    
                    "Core.Responses",                    
                    "Core.Response"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "BalancedQuotaList",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "value",                        
                        "type" : "number",                        
                        "desc" : "Specifies the quota branch for each",                        
                        "repeatable" : true,                        
                        "prefix" : "question"
                    }
                ],                
                "desc" : [
                    " returns the complete indexes of the responses of the TargetQuestion sorted from the max to the min using the following formula ",                    
                    "  Formula: (Target% - Observed%) "
                ],                
                "examples" : [
                    " Newspapers.BalancedQuotaList[1] returns the quota which will make the quota closest to the target percentage",                    
                    " Newspapers.BalancedQuotaList(Region: 1, age: {1;2} )[1] returns the newspaper which will mae closes to the target % for region 1 and Age 1 or 2",                    
                    " "
                ],                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "ChildQuestions",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "questionarray",                
                "desc" : "\tReturns the lists of questions just below the object question",                
                "examples" : "\tChapter1.ChildQuestions[1].SetValue(\"ABC\")",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "CurrentIteration",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "response",                
                "desc" : [
                    " Returns the loop response on the current iteration.",                    
                    " Only available for a loop, if you try to use this property for another type of element,",                    
                    " the application should raise the following exception:",                    
                    " The property CurrentIteration is only available for a loop.",                    
                    " "
                ],                
                "examples" : [
                    "  ' You can also use it for comparisons",                    
                    " If Loop1.CurrentIteration = 1 Then [...]",                    
                    " or",                    
                    " If Loop1.CurrentIteration.Index = 1 Then [...]",                    
                    " '",                    
                    " If Loop1.CurrentIteration.EntryCode = \"UK\" Then [...]"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Decimals",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "date",                
                "desc" : [
                    " Indicates the number of digits allowed for a decimals value.",                    
                    " Returns 0 when no decimal is allowed."
                ],                
                "examples" : [
                    " age.Decimals  ' => 0",                    
                    " temperature.Decimals ' => 1"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "DKEntry",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Indicates special entry used to specify the \"Don't know\" answer.",                
                "examples" : "age.DKEntry ' => \"999\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "EntryCodeToIndex",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "anytype",                
                "args" : [
                    {
                        "name" : "entryCodes",                        
                        "type" : "anytype",                        
                        "desc" : "Entry-code(s) to convert"
                    }
                ],                
                "desc" : [
                    " Returns the index(es) (based 1) of the specify entry code(s)",                    
                    " Return 0 if the entry code was not found.",                    
                    " If this parameter is an array, the size of the return value will have the same size of the EntryCodes parameter,",                    
                    " even if the entry code was not found"
                ],                
                "examples" : [
                    " country.EntryCodeToIndex(\"US\") ' => 1",                    
                    " country.EntryCodeToIndex({\"US\"; \"DUMMY\"; \"UK\"}) ' => {1; DK; 2}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Errors",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "errors",                
                "desc" : "Returns the list of errors during the interview run-time associated with the question.",                
                "examples" : [
                    " CurrentQuestion.Errors.Count ' => 0",                    
                    "",                    
                    " CurrentQuestion.Errors[1].Key ' => \"expected_answer\"",                    
                    "",                    
                    " CurrentQuestion.Errors[1].Message ' => \"A response is expected for question 'q1'\""
                ],                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "GotoURL",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the URL to be used to reposition the survey at this question",                
                "examples" : "\tgender.GotoURL ' => \"http://localhost/Webprod/AskiaExt.dll?Reposition=3",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "HasAnswered",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "boolean",                
                "desc" : [
                    "\tIndicates whether the question already has an answer (has already been asked)",                    
                    "",                    
                    "\tReturns a Boolean"
                ],                
                "examples" : "\tgender.HasAnswered ' => True",                
                "version" : "5.4.6.0"
            },            
            {
                "name" : "HasDK",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Indicates if the answer of the question is a \"Don't know\" answer",                
                "examples" : "gender.HasDK ' => False",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "HasNA",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Indicates if the question is skipped",                
                "examples" : "gender.HasNA ' => False",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "HasNoData",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates if there is some data in the question (skipped or not skipped)",                    
                    " "
                ],                
                "examples" : "gender.HasNoData ' => False",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "HasParentChapter",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates the question have an ancestry chapter.",                    
                    "",                    
                    " This property look-up to the hierarchy until it reaches a parent chapter."
                ],                
                "examples" : [
                    " TopLevelQuestion.HasParentChapter ' => False",                    
                    " QuestionInDemographics.HasParentChapter '=> True"
                ],                
                "alsoSee" : [
                    "ParentChapter",                    
                    "HasParentLoop"
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "HasParentLoop",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Indicates the question is into a loop.",                
                "examples" : [
                    " Q1.HasParentLoop ' => True",                    
                    " gender.HasParentLoop '=> False"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "HasValidData",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates if the answer of the question is valid for open, numeric and closed question",                    
                    " It checks if there is a value and if that value is compatible with DK settings (for all), min /max number of responses and exclusivity (for multiple), size (for open), range (for numeric and date)"
                ],                
                "examples" : "gender.HasValidData ' => True",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "Id",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Internal unique identifier of the question",                
                "examples" : [
                    " gender.id  ' => 1",                    
                    " age.id ' => 2"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "IndexToEntryCode",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "anytype",                
                "args" : [
                    {
                        "name" : "indexes",                        
                        "type" : "anytype",                        
                        "desc" : "Index(es) to convert (based 1)"
                    }
                ],                
                "desc" : [
                    " Returns the entry code(s) of the response(s) at the specify index(es)",                    
                    " If this parameter is an array, the size of the return value will have the same size of the Indexes parameter,",                    
                    " even if the index is out of range"
                ],                
                "examples" : [
                    " Gender question, Male with entry code 4 and Female with entry code 6",                    
                    " Gender.IndexToEntryCode(1) ' => 4",                    
                    " Color question, Blue with entry code 4, Red with entry code 6 and Green with entry code 8, Green and Blue selected",                    
                    " Color.IndexToEntryCode(Color) ' => 8;4",                    
                    " Color.IndexToEntryCode({3;2}) ' => 8;6"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "IndexToEntryCodeStr",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "anytype",                
                "args" : [
                    {
                        "name" : "indexes",                        
                        "type" : "anytype",                        
                        "desc" : "Index(es) to convert (based 1)"
                    }
                ],                
                "desc" : [
                    " Returns the entry code(s) of the response(s) at the specify index(es)",                    
                    " Return \"\" if the entry code was not found.",                    
                    " If this parameter is an array, the size of the return value will have the same size of the Indexes parameter,",                    
                    " even if the index is out of range"
                ],                
                "examples" : [
                    " country.IndexToEntryCodeStr(1) ' => \"US\"",                    
                    " country.IndexToEntryCodeStr({1; -3; 2}) ' => {\"US\"; \"\"; \"UK\"}"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "InputCode",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "\tIndicates the input code - actually the position of the question in the masque",                
                "examples" : [
                    "\t' Single",                    
                    "\tgender.InputCode ' => 0",                    
                    "",                    
                    "\t' Numeric (if it's the second question)",                    
                    "\tage.InputCode ' => 1",                    
                    "",                    
                    "\t' Loop",                    
                    "\tbrands.iteration(1).InputCode ' => 3",                    
                    "\tbrands.iteration(2).InputCode ' => 5"
                ],                
                "alsoSee" : [
                    "Question.Value",                    
                    "Question.InputValue",                    
                    "Response.InputName"
                ],                
                "version" : "5.4.6.0"
            },            
            {
                "name" : "InputName",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "type",                        
                        "type" : "string",                        
                        "desc" : "Specified the type of the input to obtain",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Indicates the based name of the HTML input for this question.",                    
                    " The `type` parameter is use to precise the input name to obtain, it could be the following:",                    
                    " <ul><li><strong>date</strong>: Obtain the name of the date input for the date-time question</li><li><strong>time</strong>: Obtain the name of the time input for the date-time question</li><li><strong>list</strong>: Obtain the name of the multi-select input for the multi-coded question</li><li><strong>ranking</strong>: Obtain the partial name of the input to set the rank for the multi-coded question</li></ul>"
                ],                
                "examples" : [
                    " ' Single",                    
                    " gender.InputName() ' => \"U0\"",                    
                    "",                    
                    " ' Numeric",                    
                    " age.InputName() ' => \"C1\"",                    
                    "",                    
                    " ' Multiple",                    
                    " brands.InputName() ' => \"M2\"",                    
                    "",                    
                    " ' Open",                    
                    " comment.InputName() ' => \"S3\"",                    
                    "",                    
                    " ' Date only",                    
                    " birthday.InputName() ' => \"D4\"",                    
                    "",                    
                    " ' Time only",                    
                    " meetingHour.InputName() ' => \"T5\"",                    
                    "",                    
                    " ' Date-time",                    
                    " departure.InputName(\"date\") ' => \"D6\"",                    
                    " departure.InputName(\"time\") ' -> \"T6\"",                    
                    "",                    
                    " ' Multiple with ranking",                    
                    " brands.InputName(\"ranking\") ' => \"R2\"",                    
                    "",                    
                    " ' Multiple in list with multi-selection",                    
                    " brands.InputName(\"list\") ' => \"L2\""
                ],                
                "alsoSee" : [
                    "Question.Value",                    
                    "Question.InputValue",                    
                    "Response.InputName",                    
                    "Response.InputValue"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "InputValue",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "type",                        
                        "type" : "string",                        
                        "desc" : "Specified the type of the input value to obtain",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Returns the HTML-escaped version of the question value.<br />It prevent the usage of the special `<`,`>` and all special unicode characters.",                    
                    " The `type` parameter is use to precise the value to obtain, it could be the following:",                    
                    " <ul><li><strong>date</strong>: Obtain the date value of the date-time question</li><li><strong>time</strong>: Obtain the time value of the date-time question</li></ul>"
                ],                
                "examples" : [
                    " ' Single",                    
                    " gender.InputValue() ' => \"256\"",                    
                    "",                    
                    " ' Numeric",                    
                    " age.InputValue() ' => \"33\"",                    
                    "",                    
                    " ' Multiple",                    
                    " brands.InputValue() ' => \"257,258\"",                    
                    "",                    
                    " ' Open",                    
                    " comment.InputValue() ' => \"if &amp;lt; 200 and not &amp;gt; &amp;amp; that &amp;quot;works&amp;quot;\"",                    
                    " ' if &lt; 200 and not &gt; &amp; that \"works\"",                    
                    "",                    
                    " ' Date only",                    
                    " birthday.InputValue() ' => \"01/12/2012\"",                    
                    "",                    
                    " ' Time only",                    
                    " meetingHour.InputValue() ' => \"09:00:00\"",                    
                    "",                    
                    " ' Date-time",                    
                    " departure.InputValue(\"date\") ' => \"24/05/2012\"",                    
                    " departure.InputValue(\"time\") ' -> \"12:05:00\""
                ],                
                "alsoSee" : [
                    "Question.Value",                    
                    "Question.InputName",                    
                    "Response.InputName",                    
                    "Response.InputValue"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "IsAllowDK",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Indicates if the question allow the \"Don't know\" answer.",                
                "examples" : [
                    " gender.IsAllowDK ' => false",                    
                    " age.IsAllowDK ' => true"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "IsAnonymised",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "boolean",                
                "desc" : "Indicates if the question is anonymised",                
                "examples" : [
                    "gender.IsAnonymised ' => false",                    
                    "Email.IsAnonymised ' => true"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "IsDateOnly",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Indicates if the date question accept a date only without the time.",                
                "examples" : [
                    " MyDateWithoutTime.IsDateOnly ' => true",                    
                    " MyDateWithTime.IsDateOnly ' => false"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "IsLastIteration",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Convenient property which indicates if we are on the latest iteration of a loop.",                    
                    " Only available for a loop, if you try to use this property for another type of element,",                    
                    " the application should raise the following exception:",                    
                    " The property IsLastIteration is only available for a loop."
                ],                
                "examples" : "Loop1.IsLastIteration ' => True",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "IsLiveRoutingSource",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "\tIndicates if this question is a trigger for a live touting (or a live caption) indicating that the data must be sent to the server before the end of the form",                
                "examples" : "\tGender.IsLiveRoutingSource ' => True",                
                "version" : "5.4.5.0"
            },            
            {
                "name" : "IsOrdered",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Indicates if a multi-coded question also record the order of response selections.",                
                "examples" : [
                    " rankingBrands.IsOrdered ' => true",                    
                    " knowingBrands.IsOrdered ' => false"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "IsSkipped",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "boolean",                
                "desc" : "\tIndicates if the questions is skipped through routing",                
                "examples" : "\tCurrentQuestion.IsSkipped  ' => true",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "IsTimeOnly",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Indicates if the date question accept a time only without the date.",                
                "examples" : [
                    " MyTimeWithoutDate.IsTimeOnly ' => true",                    
                    " MyTimeWithDate.IsTimeOnly ' => false"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Iteration",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "question",                
                "args" : [
                    {
                        "name" : "loopLevel",                        
                        "type" : "number",                        
                        "desc" : "Loop(s) iteration (from the first immediate to the top)",                        
                        "repeatable" : true,                        
                        "prefix" : "question"
                    }
                ],                
                "desc" : [
                    " Returns a question at a specify loop(s) iteration",                    
                    " Only available for the question in loop.",                    
                    " If you try to use it for the question outside the loop the application should raise the following exception:",                    
                    " The method Iteration is only available for the question in loop.",                    
                    " Parameters",                    
                    " The number parameters of this method are dynamic and his equal to the number of the parent loops.",                    
                    " For example if a question is inside a loop, you will have only 1 parameter.",                    
                    " If a question is inside a loop of loop you will have 2 parameters and so on.",                    
                    " The first parameter refer to the immediate parent loop, the second parameter refer to the next loop above and so on.",                    
                    " - When the script condition is on the current loop flow, parameters are optional.",                    
                    " All omits parameters are, by default, initialized with the current loop iteration.",                    
                    " For readability, you can indicates the loop name and the value of the desired iteration using the following syntax:",                    
                    " Question.Iteration(LoopName1 : Iteration1, LoopName2 : Iteration2).",                    
                    " In this case the order of parameters doesn't matter.",                    
                    " - Be careful: When the script is use outside the loop flow, all parameters are required",                    
                    " - Warning: At least one parameter is expected, otherwise simply use the shortcut of the question to obtain the current iteration."
                ],                
                "examples" : [
                    " Q1 is in a Loop",                    
                    " Q1.Iteration(1)",                    
                    " '=> Q1 in the first iteration",                    
                    " Q1.Iteration(Loop : 2)",                    
                    " ' => Q1 in the second iteration",                    
                    " Q1",                    
                    " '=> Q1 in the current iteration",                    
                    "",                    
                    " Q1 is in the SubLoop loop which is in the TopLoop loop",                    
                    " Q1.Iteration(1)",                    
                    " ' => Q1 in the first iteration of the 'SubLoop' loop",                    
                    " ' and in the current iteration of the 'TopLoop' loop",                    
                    " '",                    
                    " Q1.Iteration(1, 2)",                    
                    " ' => Q1 in the first iteration of the 'SubLoop' loop",                    
                    " ' and in the second iteration of the 'TopLoop' loop",                    
                    " '",                    
                    " Q1.Iteration(TopLoop : 2)",                    
                    " ' => Q1 in the second iteration of the 'TopLoop' loop",                    
                    " ' and in the current iteration of the 'SubLoop' loop",                    
                    " '",                    
                    " Q1.Iteration(TopLoop : 2, SubLoop : 1)",                    
                    " ' => Q1 in the second iteration of the 'TopLoop' loop",                    
                    " ' and in the first iteration of the 'SubLoop' loop"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "LongCaption",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the long caption of the question in the current language",                
                "examples" : "gender.LongCaption ' => \"Are you a:\"",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "MaxDate",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "date",                
                "desc" : [
                    " Indicates the maximum expected for a date question.",                    
                    " When no maximum is expected it return DK"
                ],                
                "examples" : [
                    " ' Date question with maximum date \"31/12/2013\"",                    
                    " MyDate.MaxDate  ' => #31/12/2013#",                    
                    " ' Date question without maximum value",                    
                    " MyDate.MaxDate  ' => DK"
                ],                
                "alsoSee" : [
                    "Question.MinDate",                    
                    "Question.MinValue",                    
                    "Question.MaxValue"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "MaxValue",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates the maximum expected for the question.",                    
                    " It's the maximum number of allowed responses for closed question.",                    
                    " It's the maximum expected value for a numeric question.",                    
                    " It's the maximum expected length for an open-ended question.",                    
                    " When no maximum is expected it return DK"
                ],                
                "examples" : [
                    " ' Multi-coded question with maximum 5 responses",                    
                    " Brands.MaxValue  ' => 5",                    
                    " ' Numeric question with 99 as minimum value",                    
                    " age.MaxValue  ' => 99",                    
                    " ' Open-ended question with 5 maximum characters",                    
                    " postalCode.MaxValue ' => 5",                    
                    " ' Question without maximum value",                    
                    " CurrentQuestion.MaxValue ' => DK"
                ],                
                "alsoSee" : [
                    "Question.MinValue",                    
                    "Question.MinDate",                    
                    "Question.MaxDate"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "MaxVisibleIterations",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Indicates the maximum number of visible iterations per screen.",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "MinDate",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "date",                
                "desc" : [
                    " Indicates the minimum expected for a date question.",                    
                    " When no minimum is expected it return DK"
                ],                
                "examples" : [
                    " ' Date question with minimum date \"01/01/2013\"",                    
                    " MyDate.MinDate  ' => #01/01/2013#",                    
                    " ' Date question without minimum value",                    
                    " MyDate.MinDate  ' => DK"
                ],                
                "alsoSee" : [
                    "Question.MaxDate",                    
                    "Question.MinValue",                    
                    "Question.MaxValue"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "MinValue",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates the minimum expected for the question.",                    
                    " It's the minimum number of allowed responses for closed question.",                    
                    " It's the minimum expected value for a numeric question.",                    
                    " It's the minimum expected length for an open-ended question.",                    
                    " When no minimum is expected it return DK"
                ],                
                "examples" : [
                    " ' Multi-coded question with minimum 3 responses",                    
                    " Brands.MinValue  ' => 3",                    
                    "",                    
                    " ' Numeric question with 18 as minimum value",                    
                    " age.MinValue  ' => 18",                    
                    "",                    
                    " ' Open-ended question with 5 minimum characters",                    
                    " ' This example is currently fictional because the",                    
                    " ' system doesn't have a minimum length value",                    
                    " ' for open-ended question",                    
                    " postalCode.MinValue ' => 5",                    
                    "",                    
                    " ' Question without minimum value",                    
                    " CurrentQuestion.MinValue ' => DK"
                ],                
                "alsoSee" : [
                    "Question.MaxValue",                    
                    "Question.MinDate",                    
                    "Question.MaxDate"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ParentChapter",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "question",                
                "desc" : [
                    " Indicates the question have an ancestry chapter.",                    
                    "",                    
                    " This property look-up to the hierarchy until it reaches a parent chapter."
                ],                
                "examples" : "QuestionInDemographics.ParentChapter.Shortcut '=> \"Demographics\"",                
                "alsoSee" : [
                    "HasParentChapter",                    
                    "ParentLoop"
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "ParentLoop",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "question",                
                "desc" : [
                    " Returns the parent loop question.",                    
                    " This property is only available for the question in loop, otherwise it throw an error."
                ],                
                "examples" : "Q1.ParentLoop.Caption ' => Loop",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ParentQuestion",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "question",                
                "desc" : "\tReturns the parent question in the survey tree",                
                "examples" : "\tGender.ParentQuestion.Shortcut =>\" Demographics chapter\"",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "Questions",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "questionarray",                
                "desc" : "\tReturns the array of all sub-questions - understand that per question we mean each survey data point",                
                "remarks" : [
                    "\t@alsosee",                    
                    "\tChildQuestions"
                ],                
                "examples" : "\tDemographics.Questions[3].Shortcut ' => \"QuestionInLoop\"",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "QuotaList",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "array",                
                "args" : [
                    {
                        "name" : "value",                        
                        "type" : "number",                        
                        "desc" : "Specifies the quota branch for each",                        
                        "repeatable" : true,                        
                        "prefix" : "question"
                    }
                ],                
                "desc" : "returns the complete indexes of the responses of the TargetQuestion sorted from the max to do to the min to do using the count for the sort",                
                "examples" : [
                    " Newspapers.QuotaList()[1] returns the quota for which there is the biggest number of respondents to fill",                    
                    " Newspapers.QuotaList(Region: 1, age: {1;2} )[1] returns the newspaper for which there is the biggest number of respondents to fill for region 1 and Age 1 or 2",                    
                    " ",                    
                    " "
                ],                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "Responses",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "responses",                
                "desc" : "Returns the entire list of responses for a closed question",                
                "examples" : [
                    " Color.Responses",                    
                    " Design definition: Shortcut: Color, Type: Multiple, Rotation: yes random, LongCaption: Which color do you like?",                    
                    " List of responses:",                    
                    " Red",                    
                    " Blue",                    
                    " Green",                    
                    " Purple",                    
                    "",                    
                    " Screen visible by the respondent",                    
                    " (The Blue response was hidden using a routing ignore responses):",                    
                    " Which color do you like?",                    
                    " Green",                    
                    " Red",                    
                    " Purple",                    
                    "",                    
                    " The responses selected by the respondent are Purple and Red in this order",                    
                    " (the EntryCode of Red is 11, Blue is 12, Green is 13 and Purple is 14)",                    
                    "",                    
                    " Color.Responses.Value will return 1;2;3;4",                    
                    " Color.Responses.EntryCode will return 11;12;13;14",                    
                    " Color.Responses.Caption will return Red;Blue;Green;Purple",                    
                    " Color.Responses[2].Value will return 2 (the second answer available)"
                ],                
                "alsoSee" : [
                    "Question.AvailableResponses",                    
                    "Question.Answers",                    
                    "Core.Responses",                    
                    "Core.Response"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ShortCaption",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : [
                    " Returns the short caption of the question in the current language.",                    
                    " If the ShortCaption is empty then it return the LongCaption"
                ],                
                "examples" : "gender.ShortCaption ' => \"Respondent Gender\"",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Shortcut",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the shortcut of the question (name of the variable)",                
                "examples" : [
                    " gender.Shortcut  ' => \"gender\"",                    
                    " ^1. appreciation^.Shortcut   ' => \"1. appreciation\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Tags",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "stringarray",                
                "desc" : [
                    "\tReturns the list of tags associated to a question",                    
                    "\t",                    
                    "\tq1.Tags Has {\"Browsable\"} "
                ],                
                "examples" : "\tq1.Tags Has {\"Browsable\"}  = >True",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "ToEntryCodeStr",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "variant",                
                "desc" : [
                    "\tReturns the response as an entry code for closed question",                    
                    "\tIt returns a string if the question is single, an array of string is the question is multiple",                    
                    "",                    
                    "\tIt's the default property which is added when you compare a question to a string",                    
                    "",                    
                    "\tq1 Has {\"1\"} is transformed into q1.ToEntryCodeStr() Has {\"1\"}",                    
                    "\t"
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
                "version" : "5.3.2.0"
            },            
            {
                "name" : "ToString",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns a string which represent the question object (express in JSON format)",                
                "examples" : [
                    " ' Output in a single line (it's break here for the readability)",                    
                    " gender.ToString()",                    
                    " ' => {",                    
                    " \"shortcut\":\"gender\",",                    
                    " \"shortCaption\":\"Respondent gender\",",                    
                    " \"longCaption\":\"Are you?\",",                    
                    " \"type\":\"single\"",                    
                    " }",                    
                    "",                    
                    " ' Output in a single line (it's break here for the readability)",                    
                    " ' q1 is in loop of loop",                    
                    " q1.ToString()",                    
                    " ' => {",                    
                    " \"shortcut\":\"q1\",",                    
                    " \"shortCaption\":\"Q1\",",                    
                    " \"longCaption\":\"Q1\",",                    
                    " \"type\":\"single\",",                    
                    " \"iterations\":{\"parentLoop\":4,\"subLoop\":2}",                    
                    " }"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Type",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : [
                    " Returns the type of the question as string, the possible types are:",                    
                    " \"chapter\"",                    
                    " \"single\"",                    
                    " \"multiple\"",                    
                    " \"open\"",                    
                    " \"numeric\"",                    
                    " \"datetime\"",                    
                    " \"loop\"",                    
                    " For question table",                    
                    " \"single-loop\"",                    
                    " For loop with selection at each iteration",                    
                    " \"multiple-loop\"",                    
                    " For loop with preliminary selection",                    
                    " \"numeric-loop\"",                    
                    " For loop with iteration count entry"
                ],                
                "examples" : [
                    " gender.Type ' => \"single\"",                    
                    " brands.Type ' => \"multiple\"",                    
                    " age.Type ' => \"numeric\"",                    
                    " comment.Type ' => \"open\"",                    
                    " birth.Type ' => \"datetime\"",                    
                    " gridLoop.Type ' => \"loop\"",                    
                    " iterationSelectionLoop.Type ' => \"single-loop\"",                    
                    " preliminarySelectionLoop.Type ' => \"multiple-loop\"",                    
                    " numericSelectionLoop.Type ' => \"numeric-loop\""
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "TypeOf",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns the type of the current object / variable",                
                "examples" : "gender.TypeOf() ' => \"question\"",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "UserData",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns a string that the user can utilize to store specific values (Key value or anything of his liking)",                
                "examples" : [
                    " If CurrentQuestion.UserData = \"Slider Then.",                    
                    " Endif",                    
                    " Dim Dic As Dictionary",                    
                    " Dic.LoadJSON(CurrentQuestion.UserData)"
                ],                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "Value",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "variant",                
                "desc" : [
                    " Returns the basic value(s) (answers) of the question in the current iteration.",                    
                    " When there is no response the value return is DK,",                    
                    " excepted for the open-ended and multi-coded questions"
                ],                
                "examples" : [
                    " gender.value ' => 1",                    
                    " age.value ' => 33",                    
                    " brands.value ' => {3; 5; 6}",                    
                    " q1_other.value ' => \"bla bla bla\"",                    
                    " birthday.value ' => #14/02/1978#",                    
                    "",                    
                    " ' When no value specified:",                    
                    "",                    
                    " gender.value ' => DK",                    
                    " age.value ' => DK",                    
                    " brands.value ' => {}",                    
                    " q1_other.value ' => \"\"",                    
                    " birthday.value ' => DK"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "VisibleInDataEntry",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "boolean",                
                "desc" : "Returns a boolean that indicates if the question is marked as visible in the data entry (you might have to check its parent to know if the question is really visible",                
                "examples" : [
                    "If CurrentQuestion.VisibleInDataEntry Then.",                    
                    "Endif"
                ],                
                "version" : "5.5.2.0"
            }
        ],        
        "browser" : [
            {
                "name" : "Mobile",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "True if the browser is running on mobile device",                
                "remarks" : [
                    " All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                    
                    " Browser detection based on the <a href=\"http://www.quirksmode.org/js/detect.html\" target='_blank'>browserDetect from QuirksMode</a>"
                ],                
                "examples" : "Browser.Mobile ' => true",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Name",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Name of the browser",                
                "remarks" : [
                    " All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                    
                    " Browser detection based on the <a href=\"http://www.quirksmode.org/js/detect.html\" target='_blank'>browserDetect from QuirksMode</a>"
                ],                
                "examples" : [
                    " Browser.Name ' => \"Explorer\"",                    
                    "",                    
                    " Browser.Name ' => \"Firefox\"",                    
                    "",                    
                    " Browser.Name ' => \"Chrome\"",                    
                    "",                    
                    " Browser.Name ' => \"Safari\"",                    
                    "",                    
                    " Browser.Name ' => \"Opera\"",                    
                    "",                    
                    " Browser.Name ' => \"\"  (unknown)"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "OS",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Short name of the operating system",                
                "remarks" : [
                    " All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                    
                    " Browser detection based on the <a href=\"http://www.quirksmode.org/js/detect.html\" target='_blank'>browserDetect from QuirksMode</a>"
                ],                
                "examples" : [
                    " Browser.OS ' => \"Windows\"",                    
                    "",                    
                    " Browser.OS ' => \"Mac\"",                    
                    "",                    
                    " Browser.OS ' => \"Linux\"",                    
                    "",                    
                    " Browser.OS ' => \"iPhone/iPod\"",                    
                    "",                    
                    " Browser.OS ' => \"\" (unknown)"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "PluginVersion",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "pluginName",                        
                        "type" : "string",                        
                        "desc" : "Name of the plugin.It could be one of the following name:<br /><ul><li>Flash</li><li>Silverlight</li><li>AdobeReader</li><li>PDFReader</li><li>QuickTime</li><li>WindowsMediaPlayer</li><li>RealPlayer</li><li>VLC</li></ul>"
                    }
                ],                
                "desc" : [
                    " Return the version of the specified plugin.",                    
                    " Return an empty string if the plugin is not supported."
                ],                
                "remarks" : [
                    " All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                    
                    " Plugins detection using <a href=\"http://www.pinlady.net/PluginDetect/All/\" target=\"_blank\">PluginDetect by Eric Gerds</a>"
                ],                
                "examples" : [
                    " Browser.PluginVersion(\"Flash\") ' => \"11.2.202.235\"",                    
                    " Browser.PluginVersion(\"Silverlight\") ' => \"4.1.10329.0\"",                    
                    " Browser.PluginVersion(\"QuickTime\") ' => \"\" (not supported)"
                ],                
                "alsoSee" : "Browser.Support",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ScreenAvailHeight",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "<blockquote>� Returns the available height in pixel of the rendering surface of the output device  �<br/>� <a href=\"http://dev.w3.org/csswg/cssom-view/#the-screen-interface\" target=\"_blank\">Source from W3C</a></blockquote>",                
                "remarks" : "All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                
                "examples" : [
                    " Browser.ScreenAvailHeight ' => 1040",                    
                    " Browser.ScreenHeight ' => 1080",                    
                    " Browser.WindowHeight ' => 895",                    
                    "",                    
                    " Browser.ScreenAvailHeight ' => 0 (unknown)"
                ],                
                "alsoSee" : [
                    "Browser.ScreenAvailWidth",                    
                    "Browser.ScreenWidth",                    
                    "Browser.ScreenHeight",                    
                    "Browser.WindowWidth",                    
                    "Browser.WindowHeight"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ScreenAvailWidth",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "<blockquote>� Returns the available width in pixel of the rendering surface of the output device  �<br/>� <a href=\"http://dev.w3.org/csswg/cssom-view/#the-screen-interface\" target=\"_blank\">Source from W3C</a></blockquote>",                
                "remarks" : "All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                
                "examples" : [
                    " Browser.ScreenAvailWidth ' => 1920",                    
                    " Browser.ScreenWidth ' => 1920",                    
                    " Browser.WindowWidth ' => 1916",                    
                    "",                    
                    " Browser.ScreenAvailWidth ' => 0 (unknown)"
                ],                
                "alsoSee" : [
                    "Browser.ScreenAvailHeight",                    
                    "Browser.ScreenWidth",                    
                    "Browser.ScreenHeight",                    
                    "Browser.WindowWidth",                    
                    "Browser.WindowHeight"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ScreenColorDepth",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "<blockquote>� Returns the number of bits allocated to colors (i.e. excluding the alpha channel) in the output device.<br /> If the output device does not support colors these attributes must return zero  �<br/>� <a href=\"http://dev.w3.org/csswg/cssom-view/#the-screen-interface\" target=\"_blank\">Source from W3C</a></blockquote>",                
                "remarks" : "All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                
                "examples" : [
                    " Browser.ScreenColorDepth ' => 32",                    
                    "",                    
                    " Browser.ScreenColorDepth ' => 0 (unknown)"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ScreenHeight",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "<blockquote>� Returns the height in pixel of the output device  �<br/>� <a href=\"http://dev.w3.org/csswg/cssom-view/#the-screen-interface\" target=\"_blank\">Source from W3C</a></blockquote>",                
                "remarks" : "All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                
                "examples" : [
                    " Browser.ScreenHeight ' => 1080",                    
                    " Browser.ScreenAvailHeight ' => 1040",                    
                    " Browser.WindowHeight ' => 895",                    
                    "",                    
                    " Browser.ScreenHeight ' => 0 (unknown)"
                ],                
                "alsoSee" : [
                    "Browser.ScreenWidth",                    
                    "Browser.ScreenAvailWidth",                    
                    "Browser.ScreenAvailHeight",                    
                    "Browser.WindowWidth",                    
                    "Browser.WindowHeight"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ScreenWidth",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "<blockquote>� Returns the width in pixel of the output device  �<br/>� <a href=\"http://dev.w3.org/csswg/cssom-view/#the-screen-interface\" target=\"_blank\">Source from W3C</a></blockquote>",                
                "remarks" : "All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                
                "examples" : [
                    " Browser.ScreenWidth ' => 1920",                    
                    " Browser.ScreenAvailWidth ' => 1920",                    
                    " Browser.WindowWidth ' => 1916",                    
                    "",                    
                    " Browser.ScreenWidth ' => 0 (unknown)"
                ],                
                "alsoSee" : [
                    "Browser.ScreenHeight",                    
                    "Browser.ScreenAvailWidth",                    
                    "Browser.ScreenAvailHeight",                    
                    "Browser.WindowWidth",                    
                    "Browser.WindowHeight"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Support",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "featureKey",                        
                        "type" : "string",                        
                        "desc" : "Feature to check.<br/><a href=\"#feature-keys\">Click here to display the list of feature keys</a>"
                    }
                ],                
                "desc" : "Return a boolean value which indicates if the browser can support the specified feature.",                
                "remarks" : [
                    " All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                    
                    " <ul><li>Plugins detection using <a href=\"http://www.pinlady.net/PluginDetect/All/\" target=\"_blank\">PluginDetect by Eric Gerds</a></li><li>HTML5 / ES5 / CSS3 features detection using the <a href=\"http://modernizr.com/\" target=\"_blank\">Modernizr</a></li></ul>"
                ],                
                "examples" : [
                    " ' Support flash?",                    
                    " Browser.Support(\"flash\") ' => true",                    
                    "",                    
                    " ' Support touch events?",                    
                    " Browser.Support(\"touch\") ' => false",                    
                    "",                    
                    " ' Support cookies?",                    
                    " Browser.Support(\"cookies\") ' => true",                    
                    "",                    
                    " ' Support HTML 5 video tag?",                    
                    " Browser.Support(\"video\") ' => true"
                ],                
                "sections" : [
                    {
                        "name" : "Feature keys:",                        
                        "linkName" : "feature-keys",                        
                        "tagName" : "h2",                        
                        "desc" : "List of all feature keys. All keys are not case-sensitive meaning that \"Flash\" or \"flash\" are equivalent."
                    },                    
                    {
                        "name" : "Plugin keys",                        
                        "linkName" : "plugin-keys",                        
                        "tagName" : "h3",                        
                        "desc" : [
                            " <table>",                            
                            " <thead>",                            
                            " <tr>",                            
                            " <th>Key</th>",                            
                            " <th>Description</th>",                            
                            " </tr>",                            
                            " </thead>",                            
                            " <tbody>",                            
                            " <tr><td>Flash</td><td>Indicates if the browser support the Flash plugin</td></tr>",                            
                            " <tr><td>Silverlight</td><td>Indicates if the browser support the Silverlight plugin</td></tr>",                            
                            " <tr><td>QuickTime</td><td>Indicates if the browser support the QuickTime plugin</td></tr>",                            
                            " <tr><td>WindowsMediaPlayer</td><td>Indicates if the browser support the Windows Media Player plugin</td></tr>",                            
                            " <tr><td>RealPlayer</td><td>Indicates if the browser support the Real Player plugin</td></tr>",                            
                            " <tr><td>VLC</td><td>Indicates if the browser support the VLC plugin</td></tr>",                            
                            " <tr><td>AdobeReader</td><td>Indicates if the browser support the Adobe PDF Reader plugin</td></tr>",                            
                            " <tr><td>PDFReader</td><td>Indicates if the browser support the any other PDF Reader plugin</td></tr>",                            
                            " </tbody></table>"
                        ]
                    },                    
                    {
                        "name" : "HTML 5 and HTML generic keys",                        
                        "linkName" : "html5-generic-keys",                        
                        "tagName" : "h3",                        
                        "desc" : [
                            " <table>",                            
                            " <thead><tr><th>Key</th><th>Description</th></tr></thead>",                            
                            " <tbody>",                            
                            " <tr><td>Javascript</td><td>Indicates if the browser support Javascript</td></tr>",                            
                            " <tr><td>Touch</td><td>Indicates if the browser support the <a href=\"http://www.w3.org/TR/touch-events/\" target=\"_blank\">HTML5 touch events API</a></td></tr>",                            
                            " <tr><td>GeoLocation</td><td>Indicates if the browser support the <a href=\"http://dev.w3.org/geo/api/spec-source.html\" target=\"_blank\">HTML5 Geo Location API</a></td></tr>",                            
                            " <tr><td>GeoLocation</td><td>Indicates if the browser support the <a href=\"https://developer.mozilla.org/en/DOM/window.postMessage\" target=\"_blank\">HTML5 Post Message API</a></td></tr>",                            
                            " <tr><td>HashChange</td><td> Indicates the browser support the  <a href=\"https://developer.mozilla.org/en/DOM/window.onhashchange\" target=\"_blank\">HTML5 HashChange event</a></td></tr>",                            
                            " <tr><td>History</td><td>Indicates the browser support the <a href=\"https://developer.mozilla.org/en/DOM/Manipulating_the_browser_history\" target=\"_blank\">HTML5 History API</a></td></tr>",                            
                            " <tr><td>DragAndDrop</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/2011/WD-html5-20110405/dnd.html\" target=\"_blank\">HTML5 Drag And Drop API</a></td></tr>",                            
                            " <tr><td>FullScreen </td><td> Indicates the browser support the <a href=\"http://dvcs.w3.org/hg/fullscreen/raw-file/tip/Overview.html\" target=\"_blank\">FullScreen API</a> </td></tr>",                            
                            " <tr><td>SpeechInput </td><td> Indicates if the browser support the <a href=\"http://lists.w3.org/Archives/Public/public-xg-htmlspeech/2011Feb/att-0020/api-draft.html\" target=\"_blank\">Speech Input API</a> </td></tr>",                            
                            " <tr><td>Cookies </td><td> Indicates the browser support the <a href=\"http://en.wikipedia.org/wiki/HTTP_cookie\" target=\"_blank\">cookies</a> </td></tr>",                            
                            " <tr><td>Unicode </td><td> Indicates if the browser support the unicode </td></tr>",                            
                            " <tr><td>StrictMode </td><td> Indicates if the browser support the <a href=\"http://dmitrysoshnikov.com/ecmascript/es5-chapter-2-strict-mode/\" target=\"_blank\">EcmaScript5 strict mode</a> </td></tr>",                            
                            " <tr><td>JSON </td><td> Indicates if the browser support the native <a href=\"http://www.json.org/js.html\" target=\"_blank\">JSON API</a> </td></tr>",                            
                            " <tr><td>MathML </td><td> Indicates if the browser support <a href=\"http://www.w3.org/Math/\" target=\"_blank\">MathML</a> </td></tr>",                            
                            " <tr><td>DeviceMotion </td><td> Indicates if the browser support the <a href=\"http://dev.w3.org/geo/api/spec-source-orientation.html#devicemotion\" target=\"_blank\">devicemotion events</a> </td></tr>",                            
                            " <tr><td>DeviceOrientation </td><td> Indicates if the browser suppor the <a href=\"http://dev.w3.org/geo/api/spec-source-orientation.html#deviceorientation\" target=\"_blank\">deviceorientation events</a> </td></tr>",                            
                            " <tr><td> Battery </td><td> Indicates the browser support the  <a href=\"http://www.w3.org/TR/battery-status/\" target=\"_blank\">Battery Status API</a> </td></tr>",                            
                            " <tr><td> FileReader </td><td> Indicates if the browser support the <a href=\"http://www.w3.org/TR/FileAPI/#dfn-filereader\" target=\"_blank\">FileReader API</a> </td></tr>",                            
                            " <tr><td> FileSystem </td><td> Indicates if the browser support the <a href=\"http://www.w3.org/TR/file-system-api/#the-filesystem-interface\" target=\"_blank\">FileSystem API</a> </td></tr>",                            
                            " <tr><td>IE8Compat </td><td> Indicates the  <a href=\"http://blogs.msdn.com/b/askie/archive/2009/03/23/understanding-compatibility-modes-in-internet-explorer-8.aspx\" target=\"_blank\">IE8 compatibility mode</a> is enable on Microsoft Internet Explorer</td></tr>",                            
                            " </tbody>",                            
                            " </table>"
                        ]
                    },                    
                    {
                        "name" : "HTML 5 forms keys (inputs, attributes ...)",                        
                        "linkName" : "html5-forms-keys",                        
                        "tagName" : "h3",                        
                        "desc" : [
                            " <table>",                            
                            " <thead><tr><th>Key</th><th>Description</th></tr></thead>",                            
                            " <tbody>",                            
                            " <tr><th colspan=\"2\">Tags </th></tr>",                            
                            " <tr><td> OutputElem </td><td> Indicates if the browser support the <a href=\"http://www.w3.org/wiki/HTML5_form_additions#New_output_mechanisms\" target=\"_blank\">HTML5 &lt;output&gt; tag</a> </td></tr>",                            
                            " <tr><td> ProgressBar </td><td> Indicates if the browser support the <a href=\"http://www.w3.org/wiki/HTML5_form_additions#.3Cprogress.3E_and_.3Cmeter.3E\" target=\"_blank\">HTML5 &lt;progress&gt; tag</a> </td></tr>",                            
                            " <tr><td> Meter</td><td> Indicates if the browser support the <a href=\"http://www.w3.org/wiki/HTML5_form_additions#.3Cprogress.3E_and_.3Cmeter.3E\" target=\"_blank\">HTML5 &lt;meter&gt; tag</a> </td></tr>",                            
                            " <tr><td> Details </td><td> Indicates if the browser support the <a href=\"http://www.w3.org/wiki/HTML/Elements/details\" target=\"_blank\">HTML5 &lt;details&gt; tag</a> </td></tr>",                            
                            " <tr><td> Ruby </td><td> Indicates if the browser support the <a href=\"http://www.w3.org/TR/ruby/#intro\" target=\"_blank\">HTML5 &lt;ruby&gt; tag</a> </td></tr>",                            
                            " <tr><td> Track </td><td> Indicates if the browser support the <a href=\"http://www.w3.org/wiki/HTML/Elements/track\" target=\"_blank\">HTML5 &lt;track&gt; tag</a> </td></tr>",                            
                            " <tr><th colspan=\"2\">Inputs </th></tr>",                            
                            " <tr><td> Number </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.number.html\" target=\"_blank\">HTML 5 &lt;input type=number&gt;</a> </td></tr>",                            
                            " <tr><td> Range </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.range.html\" target=\"_blank\">HTML 5 &lt;input type=range&gt;</a> </td></tr>",                            
                            " <tr><td> Date </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.date.html\" target=\"_blank\">HTML 5 &lt;input type=date&gt;</a> </td></tr>",                            
                            " <tr><td> DateTime </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.datetime.html\" target=\"_blank\">HTML 5 &lt;input type=datetime&gt;</a> </td></tr>",                            
                            " <tr><td> DateTime-Local </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.datetime-local.html\" target=\"_blank\">HTML 5 &lt;input type=datetime-local&gt;</a> </td></tr>",                            
                            " <tr><td> Month </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.month.html\" target=\"_blank\">HTML 5 &lt;input type=month&gt;</a> </td></tr>",                            
                            " <tr><td> Week </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.week.html\" target=\"_blank\">HTML 5 &lt;input type=week&gt;</a> </td></tr>",                            
                            " <tr><td> Time </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.time.html\" target=\"_blank\">HTML 5 &lt;input type=time&gt;</a> </td></tr>",                            
                            " <tr><td> Tel </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.tel.html\" target=\"_blank\">HTML 5 &lt;input type=tel&gt;</a> </td></tr>",                            
                            " <tr><td> Email </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.email.html\" target=\"_blank\">HTML 5 &lt;input type=email&gt;</a> </td></tr>",                            
                            " <tr><td> URL </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.url.html\" target=\"_blank\">HTML 5 &lt;input type=url&gt;</a> </td></tr>",                            
                            " <tr><td> Color </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.color.html\" target=\"_blank\">HTML 5 &lt;input type=color&gt;</a> </td></tr>",                            
                            " <tr><td> Search </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/html-markup/input.search.html\" target=\"_blank\">HTML 5 &lt;input type=search&gt;</a> </td></tr>",                            
                            " <tr><th colspan=\"2\">Attributes </th></tr>",                            
                            " <tr><td> AutoComplete </td><td> Indicates if the browser support the <a href=\"http://dev.w3.org/html5/spec/common-input-element-attributes.html#attr-input-autocomplete\" target=\"_blank\">HTML5 autocomplete attribute</a> </td></tr>",                            
                            " <tr><td> AutoFocus </td><td> Indicates if the browser support the <a href=\"http://www.w3.org/Submission/web-forms2/#the-autofocus\" target=\"_blank\">HTML5 autofocus attribute</a> </td></tr>",                            
                            " <tr><td> List </td><td> Indicates if the browser support the <a href=\"http://dev.w3.org/html5/spec/common-input-element-attributes.html#attr-input-list\" target=\"_blank\">HTML5 datalist element and list attribute</a> </td></tr>",                            
                            " <tr><td> Placeholder </td><td> Indicates if the browser support the <a href=\"http://dev.w3.org/html5/spec/common-input-element-attributes.html#attr-input-placeholder\" target=\"_blank\">HTML5 placeholder attribute</a> </td></tr>",                            
                            " <tr><td> Min </td><td> Indicates if the browser support the <a href=\"http://dev.w3.org/html5/spec/common-input-element-attributes.html#attr-input-min\" target=\"_blank\">HTML5 min attribute</a> </td></tr>",                            
                            " <tr><td> Max </td><td> Indicates if the browser support the <a href=\"http://dev.w3.org/html5/spec/common-input-element-attributes.html#attr-input-min\" target=\"_blank\">HTML5 max attribute</a> </td></tr>",                            
                            " <tr><td> Step </td><td> Indicates if the browser support the <a href=\"http://dev.w3.org/html5/spec/common-input-element-attributes.html#attr-input-step\" target=\"_blank\">HTML5 step attribute</a> </td></tr>",                            
                            " <tr><td> Multiple </td><td> Indicates if the browser support the <a href=\"http://dev.w3.org/html5/spec/common-input-element-attributes.html#attr-input-multiple\" target=\"_blank\">HTML5 multiple attribute</a> </td></tr>",                            
                            " <tr><td> Pattern </td><td> Indicates if the browser support the <a href=\"http://dev.w3.org/html5/spec/common-input-element-attributes.html#attr-input-pattern\" target=\"_blank\">HTML5 pattern attribute</a> </td></tr>",                            
                            " <tr><td> Required </td><td> Indicates if the browser support the <a href=\"http://dev.w3.org/html5/spec/common-input-element-attributes.html#attr-input-required\" target=\"_blank\">HTML5 required attribute</a> </td></tr>",                            
                            " <tr><td> FormValidation </td><td> Indicates if the browser support the <a href=\"http://www.w3.org/wiki/HTML5_form_additions#Validation\" target=\"_blank\">Form Validation using required and pattern attributes</a> </td></tr>",                            
                            " </tbody>",                            
                            " </table>"
                        ]
                    },                    
                    {
                        "name" : "HTML 5 storage keys",                        
                        "linkName" : "html5-storage-keys",                        
                        "tagName" : "h3",                        
                        "desc" : [
                            " <table>",                            
                            " <thead><tr><th>Key</th><th>Description</th></tr></thead>",                            
                            " <tbody>",                            
                            " <tr><td>IndexedDB</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/IndexedDB/\" target=\"_blank\">HTML5 Indexed Database API</a></td></tr>",                            
                            " <tr><td>LocalStorage</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/2009/WD-webstorage-20091222/#the-localstorage-attribute\" target=\"_blank\">HTML5 Local Storage API</a></td></tr>",                            
                            " <tr><td>SessionStorage</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/2009/WD-webstorage-20091222/#the-sessionstorage-attribute\" target=\"_blank\">HTML5 Session Storage API</a></td></tr>",                            
                            " <tr><td>ApplicationCache </td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/offline-webapps/#offline\" target=\"_blank\">HTML5 Offline Application Cache API</a></td></tr>",                            
                            " </tbody>",                            
                            " </table>"
                        ]
                    },                    
                    {
                        "name" : "HTML 5 communication keys",                        
                        "linkName" : "html5-communication-keys",                        
                        "tagName" : "h3",                        
                        "desc" : [
                            " <table>",                            
                            " <thead><tr><th>Key</th><th>Description</th></tr></thead>",                            
                            " <tbody>",                            
                            " <tr><td>WebSockets</td><td> Indicates the browser support the <a href=\"http://dev.w3.org/html5/websockets/\" target=\"_blank\">HTML5 WebSockets API</a></td></tr>",                            
                            " <tr><td>WebSocketsBinary</td><td> Indicates if the <a href=\"http://dev.w3.org/html5/websockets/\" target=\"_blank\">HTML5 WebSockets API</a> could accept binary data</td></tr>",                            
                            " <tr><td>WebWorkers</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/workers/\" target=\"_blank\">HTML5 WebWorkers API</a></td></tr>",                            
                            " </tbody>",                            
                            " </table>"
                        ]
                    },                    
                    {
                        "name" : "HTML 5 graphic keys",                        
                        "linkName" : "html5-graphic-keys",                        
                        "tagName" : "h3",                        
                        "desc" : [
                            " <table>",                            
                            " <thead><tr><th>Key</th><th>Description</th></tr></thead>",                            
                            " <tbody>",                            
                            " <tr><td>Canvas</td><td> Indicates the browser support the <a href=\"https://developer.mozilla.org/en/HTML/Canvas\" target=\"_blank\">HTML5 Canvas API</a></td></tr>",                            
                            " <tr><td>CanvasText</td><td> Indicates the browser support the <a href=\"http://www.canvastext.com/\" target=\"_blank\">HTML5 Canvas Text API</a></td></tr>",                            
                            " <tr><td>WebGL</td><td> Indicates the browser support the <a href=\"http://www.khronos.org/webgl/wiki/Main_Page\" target=\"_blank\">HTML5 WebGL API</a></td></tr>",                            
                            " <tr><td>SVG</td><td> Indicates the browser support the <a href=\"http://dev.w3.org/SVG/proposals/svg-html/svg-html-proposal.html\" target=\"_blank\">HTML5 SVG API</a></td></tr>",                            
                            " </tbody>",                            
                            " </table>"
                        ]
                    },                    
                    {
                        "name" : "HTML 5 video keys",                        
                        "linkName" : "html5-video-keys",                        
                        "tagName" : "h3",                        
                        "desc" : [
                            " <table>",                            
                            " <thead><tr><th>Key</th><th>Description</th></tr></thead>",                            
                            " <tbody>",                            
                            " <tr><td>Video</td><td>  Indicates the browser support the <a href=\"http://www.w3.org/wiki/HTML/Elements/video\" target=\"_blank\">HTML5 &lt;video&gt; tag</a></td></tr>",                            
                            " <tr><td>Ogg</td><td> Indicates the browser support the <a href=\"http://www.w3.org/wiki/HTML/Elements/video#Formats_and_Codecs\" target=\"_blank\">Ogg codec</a></td></tr>",                            
                            " <tr><td>H264</td><td> Indicates the browser support the <a href=\"http://www.w3.org/wiki/HTML/Elements/video#Formats_and_Codecs\" target=\"_blank\">H264 codec</a></td></tr>",                            
                            " <tr><td>WebM</td><td> Indicates the browser support the <a href=\"http://www.w3.org/wiki/HTML/Elements/video#Formats_and_Codecs\" target=\"_blank\">WebM codec</a></td></tr>",                            
                            " </tbody>",                            
                            " </table>"
                        ]
                    },                    
                    {
                        "name" : "HTML 5 audio keys",                        
                        "linkName" : "html5-audio-keys",                        
                        "tagName" : "h3",                        
                        "desc" : [
                            " <table>",                            
                            " <thead><tr><th>Key</th><th>Description</th></tr></thead>",                            
                            " <tbody>",                            
                            " <tr><td>Audio</td><td>  Indicates the browser support the <a href=\"http://www.w3.org/wiki/HTML/Elements/audio\" target=\"_blank\">HTML5 &lt;audio&gt; tag</a></td></tr>",                            
                            " <tr><td>mp3</td><td> Indicates the browser support the <a href=\"http://www.w3.org/wiki/HTML/Elements/audio#Formats_and_Codecs\" target=\"_blank\">mp3 codec</a></td></tr>",                            
                            " <tr><td>wav</td><td> Indicates the browser support the <a href=\"http://www.w3.org/wiki/HTML/Elements/audio#Formats_and_Codecs\" target=\"_blank\">wav codec</a></td></tr>",                            
                            " <tr><td>m4a</td><td> Indicates the browser support the <a href=\"http://www.w3.org/wiki/HTML/Elements/audio#Formats_and_Codecs\" target=\"_blank\">m4a codec</a></td></tr>",                            
                            " </tbody>",                            
                            " </table>"
                        ]
                    },                    
                    {
                        "name" : "CSS 3 keys",                        
                        "linkName" : "css3-keys",                        
                        "tagName" : "h3",                        
                        "desc" : [
                            " <table>",                            
                            " <thead><tr><th>Key</th><th>Description</th></tr></thead>",                            
                            " <tbody>",                            
                            " <tr><td>MediaQueries</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-mediaqueries/\" target=\"_blank\">CSS3 media queries</a></td></tr>",                            
                            " <tr><td>GeneratedContent</td><td> Indicates the browser support the <a href=\"http://dev.opera.com/articles/view/css-generated-content-techniques/\" target=\"_blank\">CSS2/CSS3 generated content :before / :after / content</a></td></tr>",                            
                            " <tr><td>FontFace</td><td> Indicates the browser support the <a href=\"http://www.css3.info/preview/web-fonts-with-font-face/\" title=\"@font-face\" target=\"_blank\">CSS3 web font</a></td></tr>",                            
                            " <tr><td>Flexbox</td><td> Indicates the browser support the <a href=\"http://www.html5rocks.com/en/tutorials/flexbox/quick/\" target=\"_blank\">CSS3 flexbox</a></td></tr>",                            
                            " <tr><td>RGBa</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-color/#rgba-color\" target=\"_blank\">CSS3 RGB with Alpha</a></td></tr>",                            
                            " <tr><td>HSLa</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-color/#hsla-color\" target=\"_blank\">CSS3 HSLA</a></td></tr>",                            
                            " <tr><td>MultipleBgs</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-background/#layering\" target=\"_blank\">CSS3 multiple background</a></td></tr>",                            
                            " <tr><td>BackgroundSize</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-background/#the-background-size\" target=\"_blank\">CSS3 background size property</a></td></tr>",                            
                            " <tr><td>BorderImage</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-background/#border-images\" target=\"_blank\">CSS3 border image properties</a></td></tr>",                            
                            " <tr><td>BorderRadius</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-background/#corners\" target=\"_blank\">CSS3 border radius properties</a></td></tr>",                            
                            " <tr><td>BoxShadow</td><td> Indicates the browser support the \"CSS3 box shadow property\"</td></tr>",                            
                            " <tr><td>TextShadow</td><td> Indicates the browser support the <a href=\"http://www.w3.org/Style/Examples/007/text-shadow.en.html\" target=\"_blank\">CSS3 text shadow property</a></td></tr>",                            
                            " <tr><td>Opacity</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-color/#opacity\" target=\"_blank\">CSS3 opacity property</a></td></tr>",                            
                            " <tr><td>CSSAnimations</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-animations/#introduction\" target=\"_blank\">CSS3 animations properties</a></td></tr>",                            
                            " <tr><td>CSSColumns</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-multicol/#introduction\" target=\"_blank\">CSS3 multi-columns properties</a></td></tr>",                            
                            " <tr><td>CSSGradients</td><td> Indicates the browser support the <a href=\"http://dev.w3.org/csswg/css3-images/#gradients\" target=\"_blank\">CSS3 linear-gradient, radial-gradients... properties</a></td></tr>",                            
                            " <tr><td>CSSReflections</td><td> Indicates the browser support the <a href=\"http://designshack.net/articles/css/mastering-css-reflections-in-webkit/\" target=\"_blank\">CSS3 reflections properties</a></td></tr>",                            
                            " <tr><td>CSSTransforms</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-transforms/#transform-rendering\" target=\"_blank\">CSS3 transforms properties</a></td></tr>",                            
                            " <tr><td>CSSTransforms3D</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-transforms/#transform-3d-rendering\" target=\"_blank\">CSS3 3D transforms properties</a></td></tr>",                            
                            " <tr><td>CSSTransitions</td><td> Indicates the browser support the <a href=\"http://www.w3.org/TR/css3-transitions/#introduction\" target=\"_blank\">CSS3 transitions properties</a></td></tr>",                            
                            " </tbody>",                            
                            " </table>"
                        ]
                    }
                ],                
                "alsoSee" : "Browser.PluginVersion",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ToString",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns the string representation of the object / variable",                
                "examples" : "Browser.ToString()",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "TypeOf",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns \"browser\"",                
                "examples" : "Browser.TypeOf() ' => \"browser\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "UserAgent",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "User-agent of the browser",                
                "remarks" : "All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                
                "examples" : [
                    " ' Internet Explorer 9.0",                    
                    " Browser.UserAgent ' => \"Mozilla/5.0 (compatible; MSIE 9.0;",                    
                    "  Windows NT 6.1; Trident/5.0)\"",                    
                    "",                    
                    " ' Firefox 25.0",                    
                    " Browser.UserAgent ' => \"Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:25.0)",                    
                    "  Gecko/20100101 Firefox/25.0\"",                    
                    "",                    
                    " ' Safari 6.0",                    
                    " Browser.UserAgent ' => \"Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X)",                    
                    " AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25\""
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Version",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Major version number of the browser",                
                "remarks" : "Browser detection based on the <a href=\"http://www.quirksmode.org/js/detect.html\" target='_blank'>browserDetect from QuirksMode</a>",                
                "examples" : [
                    " Browser.Version ' => 8",                    
                    "",                    
                    " Browser.Version ' => 11.6",                    
                    "",                    
                    " Browser.Version '=> 0 (unknown)"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "WindowHeight",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "<blockquote>� Returns the viewport height in pixel including the size of a rendered scroll bar (if any)  �<br/>� <a href=\"http://dev.w3.org/csswg/cssom-view/#dom-window-innerheight\" target=\"_blank\">Source from W3C</a></blockquote>",                
                "remarks" : "All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                
                "examples" : [
                    " Browser.WindowHeight ' => 895",                    
                    " Browser.ScreenHeight ' => 1080",                    
                    " Browser.ScreenAvailHeight ' => 1040",                    
                    "",                    
                    " Browser.WindowHeight ' => 0 (unknown)"
                ],                
                "alsoSee" : [
                    "Browser.WindowWidth",                    
                    "Browser.ScreenWidth",                    
                    "Browser.ScreenHeight",                    
                    "Browser.ScreenAvailWidth",                    
                    "Browser.ScreenAvailHeight"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "WindowWidth",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "<blockquote>� Returns the viewport width in pixel including the size of a rendered scroll bar (if any)  �<br/>� <a href=\"http://dev.w3.org/csswg/cssom-view/#dom-window-innerwidth\" target=\"_blank\">Source from W3C</a></blockquote>",                
                "remarks" : "All detections are done through Javascript, if Javascript is disable all values fall to default values (false, \"\", 0)",                
                "examples" : [
                    " Browser.WindowWidth ' => 1916",                    
                    " Browser.ScreenWidth ' => 1920",                    
                    " Browser.ScreenAvailWidth ' => 1920",                    
                    "",                    
                    " Browser.WindowWidth ' => 0 (unknown)"
                ],                
                "alsoSee" : [
                    "Browser.WindowHeight",                    
                    "Browser.ScreenWidth",                    
                    "Browser.ScreenHeight",                    
                    "Browser.ScreenAvailWidth",                    
                    "Browser.ScreenAvailHeight"
                ],                
                "version" : "5.3.3.0"
            }
        ],        
        "theme" : [
            {
                "name" : "BaseFS",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the base font size",                
                "examples" : "\tInterview.BaseFS ' => \"12px\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "BlackColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the color used as \"black\" - usually the fore color",                
                "examples" : "\tInterview.Black ' => \"0,0,0\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "BorderRadius",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the border radius",                
                "examples" : "\tInterview.BorderRadius ' => \"5px\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "BorderWidth",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the border width",                
                "examples" : "\tInterview.BorderWidth ' => \"1px\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "ErrorColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the error colour",                
                "examples" : "\tInterview.ErrorColor ' => \"255,255,255\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "FontFamily",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the font family",                
                "examples" : "\tInterview.FontFamily ' => \"Print: Arial, Helvetica, sans-serif\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "HPadding",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the horizontal padding",                
                "examples" : "\tInterview.HPadding ' => \"0.5em\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "LargeFS",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the large font size",                
                "examples" : "\tInterview.LargeFS ' => \"14px\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "LineHeight",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the line height for text",                
                "examples" : "\tInterview.LineHeight ' => \"1.2\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "NeutralColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the neutral colour",                
                "examples" : "\tInterview.NeutralColor ' => \"255,255,255\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "NeutralDarkColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the darker version of the neutral colour",                
                "examples" : "\tInterview.NeutralDarkColor ' => \"255,255,255\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "NeutralLightColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the lighter version of the neutral colour",                
                "examples" : "\tInterview.NeutralLightColor ' => \"255,255,255\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "NormalFS",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the normal font size",                
                "examples" : "\tInterview.NormalFS ' => \"10px\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "PrimaryColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the primary colour",                
                "examples" : "\tInterview.PrimaryColor ' => \"255,255,255\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "PrimaryDarkColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the darker version of the primary colour",                
                "examples" : "\tInterview.PrimaryDarkColor ' => \"255,255,255\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "PrimaryLightColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the lighter version of the primary colour",                
                "examples" : "\tInterview.PrimaryLightColor ' => \"255,255,255\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "PropValue",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "property",                        
                        "type" : "string",                        
                        "desc" : "Name of the property.It could be one of the following name:<br /><ul><li>BlackColor</li><li>WhiteColor</li><li>FontFamily</li><li>BaseFS</li><li>SmallFS</li><li>NormalFS</li><li>LargeFS</li><li>LineHeight</li><li>BorderWidth</li><li>BorderRadius</li><li>HPadding</li><li>VPadding</li><li>PrimaryColor</li><li>PrimaryDarkColor</li><li>PrimaryLightColor</li><li>SecondaryColor</li><li>SecondaryDarkColor</li><li>SecondaryLightColor</li><li>NeutralColor</li><li>NeutralDarkColor</li><li>NeutralLightColor</li><li>ErrorColor</li><li>SuccessColor</li></ul>"
                    }
                ],                
                "desc" : [
                    "\tReturn the value of the theme property.",                    
                    "\tReturn an empty string if the property is not supported."
                ],                
                "examples" : "\tTheme.PropValue(\"PrimaryColor\") ' => \"11.202.235\"",                
                "alsoSee" : "Theme.Var",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "SecondaryColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the secondary colour",                
                "examples" : "\tInterview.SecondaryColor ' => \"255,255,255\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "SecondaryDarkColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the darker version of the secondary colour",                
                "examples" : "\tInterview.SecondaryDarkColor ' => \"255,255,255\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "SecondaryLightColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the lighter version of the secondary colour",                
                "examples" : "\tInterview.SecondaryLightColor ' => \"255,255,255\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "SmallFS",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the small font size",                
                "examples" : "\tInterview.SmallFS ' => \"8px\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "SuccessColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the success colour",                
                "examples" : "\tInterview.SuccessColor ' => \"255,255,255\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "Var",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "variant",                
                "args" : [
                    {
                        "name" : "property",                        
                        "type" : "string",                        
                        "desc" : "Name of the property.It could be one of the following name:<br /><ul><li>BlackColor</li><li>WhiteColor</li><li>FontFamily</li><li>BaseFS</li><li>SmallFS</li><li>NormalFS</li><li>LargeFS</li><li>LineHeight</li><li>BorderWidth</li><li>BorderRadius</li><li>HPadding</li><li>VPadding</li><li>PrimaryColor</li><li>PrimaryDarkColor</li><li>PrimaryLightColor</li><li>SecondaryColor</li><li>SecondaryDarkColor</li><li>SecondaryLightColor</li><li>NeutralColor</li><li>NeutralDarkColor</li><li>NeutralLightColor</li><li>ErrorColor</li><li>SuccessColor></li>"
                    }
                ],                
                "desc" : [
                    "\tReturn the value of the theme property (as a variant).",                    
                    "\tReturn an empty string if the property is not supported."
                ],                
                "examples" : "\tTheme.Var(\"PrimaryColor\") ' => 11.202.235",                
                "alsoSee" : "Theme.PropValue",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "VPadding",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the vertical padding",                
                "examples" : "\tInterview.VPadding ' => \"1.2em\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "WhiteColor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the color used as \"white\" usually the back color",                
                "examples" : "\tInterview.WhiteColor ' => \"255,255,255\"",                
                "version" : "5.4.2.0"
            }
        ],        
        "message" : [
            {
                "name" : "continue_left_off",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the continue_left_off \tContinue where you left off",                
                "examples" : "Interview.Language.Translate(Message.continue_left_off) ' => \" \"Continue where you left off\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "dont_know",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message dont_know",                
                "examples" : "Interview.Language.Translate(Message.dont_know) ' => \" \"Don't know\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_answer",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message \"expected_0_answer\"  \tA response is expected for question '%0'",                
                "examples" : "Interview.Language.Translate(Message.expected_0_answer) ' => \" \"A response is expected for question '%0'\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_answer_multiple",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_0_answer_multiple \tPlease choose all that apply!",                
                "examples" : "Interview.Language.Translate(Message.expected_0_answer_multiple) ' => \" \"Please choose all that apply!\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_answer_multiple_grid_column",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_0_answer_multiple_grid_column \tPlease choose at least one answer per column(vertically)!",                
                "examples" : "Interview.Language.Translate(Message.expected_0_answer_multiple_grid_column) ' => \" \"Please choose at least one answer per column(vertically)!\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_answer_multiple_grid_row",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_0_answer_multiple_grid_row \tPlease choose at least one answer per row(horizontally)!",                
                "examples" : "Interview.Language.Translate(Message.expected_0_answer_multiple_grid_row) ' => \" \"Please choose at least one answer per row(horizontally)!\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_answer_open_ended",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_0_answer_open_ended \tPlease type in your answer!",                
                "examples" : "Interview.Language.Translate(Message.expected_0_answer_open_ended) ' => \" \"Please type in your answer!\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_answer_single",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_0_answer_single \tPlease choose one answer!",                
                "examples" : "Interview.Language.Translate(Message.expected_0_answer_single) ' => \" \"Please choose one answer!\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_answer_single_grid_column",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_0_answer_single_grid_column \tPlease choose one answer per column(vertically)!",                
                "examples" : "Interview.Language.Translate(Message.expected_0_answer_single_grid_column) ' => \" \"Please choose one answer per column(vertically)!\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_answer_single_grid_row",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_0_answer_single_grid_row \tPlease choose one answer per row(horizontally)!",                
                "examples" : "Interview.Language.Translate(Message.expected_0_answer_single_grid_row) ' => \" \"Please choose one answer per row(horizontally)!\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_at_least_1_answer",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message expected_0_at_least_1_answer \tPlease select at least %1 for question '%0'",                
                "examples" : "Interview.Language.Translate(Message.expected_0_at_least_1_answer) ' => \" \"Please select at least %1 for question '%0'\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_between_1_2",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message expected_0_between_1_2 \tResponse to question '%0' must be between % 1 and %2",                
                "examples" : "Interview.Language.Translate(Message.expected_0_between_1_2) ' => \" \"Response to question '%0' must be between % 1 and %2\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_date",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_0_date \tPlease enter a valid date for question '%0'",                
                "examples" : "Interview.Language.Translate(Message.expected_0_date) ' => \" \"Please enter a valid date for question '%0'\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_greather_than_1",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message expected_0_greather_than_1 \tResponse to question '%0' must be above % 1",                
                "examples" : "Interview.Language.Translate(Message.expected_0_greather_than_1) ' => \" \"Response to question '%0' must be between % 1 and %2\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_lower_than_1",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message expected_0_lower_than_1 \tResponse to question '%0' must be under % 1",                
                "examples" : "Interview.Language.Translate(Message.expected_0_lower_than_1) ' => \" \"Response to question '%0' must be under % 1\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_no_decimal",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_0_no_decimal \tResponse to question '%0' cannot be decimal",                
                "examples" : "Interview.Language.Translate(Message.expected_0_no_decimal) ' => \" \"Response to question '%0' cannot be decimal\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_numeric",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message expected_0_numeric\tResponse to question '%0' must be numeric",                
                "examples" : "Interview.Language.Translate(Message.expected_0_numeric) ' => \" \"Response to question '%0' must be numeric\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_only_1_answer",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message expected_0_only_1_answer \tYou can only give %1 responses to '%0'",                
                "examples" : "Interview.Language.Translate(Message.expected_0_only_1_answer) ' => \" \"You can only give one response for question '%0'\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_only_one_answer",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message expected_0_only_one_answer \tYou can only give one response for question '%0'",                
                "examples" : "Interview.Language.Translate(Message.expected_0_only_one_answer) ' => \" \"You can only give one response for question '%0'\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_rank_1",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_0_rank_1 \tRank % 1 is missing for question '%0'",                
                "examples" : "Interview.Language.Translate(Message.expected_0_rank_1) ' => \" \"Rank % 1 is missing for question '%0'\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_rank_1_once",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the 15 \texpected_0_rank_1_once \tRank % 1 has been given more than once for question '%0'",                
                "examples" : "Interview.Language.Translate(Message.expected_0_rank_1_once) ' => \" \"Rank % 1 has been given more than once for question '%0'\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_ranking_between_one_1",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_0_ranking_between_one_1 \tRanking must be between 1 an % 1 for question '%0'",                
                "examples" : "Interview.Language.Translate(Message.expected_0_ranking_between_one_1) ' => \" \"Ranking must be between 1 an % 1 for question '%0'\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_0_time",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_0_time \tPlease enter a valid time for question '%0'",                
                "examples" : "Interview.Language.Translate(Message.expected_0_time) ' => \" \"Please enter a valid time for question '%0'\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_answer_at_least",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_answer_at_least \tOne or more questions have not been answered and require further input.Please carefully review your responses on this page.",                
                "examples" : "Interview.Language.Translate(Message.expected_answer_at_least) ' => \" \"One or more questions have not been answered and require further input.Please carefully review your responses on this page.\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "expected_semi_open",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the expected_semi_open \tYou must specify the semi - open response",                
                "examples" : "Interview.Language.Translate(Message.expected_semi_open) ' => \" \"You must specify the semi-open response\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "interview_0_percent_completed",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the interview_0_completed\t0 % completed",                
                "examples" : "Interview.Language.Translate(Message.interview_0_completed) ' => \" \"0 % completed\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "new",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message new",                
                "examples" : "Interview.Language.Translate(Message.new) ' => \" \"New\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "next",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the next \tNext",                
                "examples" : "Interview.Language.Translate(Message.next) ' => \" \"Next\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "other",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message other",                
                "examples" : "Interview.Language.Translate(Message.other) ' => \" \"Autre\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "other_specify",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message other_specify",                
                "examples" : "Interview.Language.Translate(Message.other_specify) ' => \" \"Other (specify)\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "picture_close",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the picture_close\tPlease click on the picture to close the window!",                
                "examples" : "Interview.Language.Translate(Message.picture_close) ' => \" \"Please click on the picture to close the window!\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "picture_enlarge",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the picture_enlarge\tPlease click on the picture to enlarge!",                
                "examples" : "Interview.Language.Translate(Message.picture_enlarge) ' => \" \"Please click on the picture to enlarge!\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "picture_see",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the picture_see\tPlease click on the link to see the picture!",                
                "examples" : "Interview.Language.Translate(Message.picture_see) ' => \" \"Please click on the link to see the picture!\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "previous",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the next \tNext",                
                "examples" : "Interview.Language.Translate(Message.previous) ' => \" \"Next\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "quota_closed_0",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the quota_closed_0 \tThe quotas are closed for '%1'",                
                "examples" : "Interview.Language.Translate(Message.quota_closed_0) ' => \" \"The quotas are closed for '%1'\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "specify",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message specify",                
                "examples" : "Interview.Language.Translate(Message.specify) ' => \" \"Specify\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "start_survey",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the start_survey \tStart Survey",                
                "examples" : "Interview.Language.Translate(Message.start_survey) ' => \" \"Start Survey\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "submit",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the submit  \tSubmit your answers",                
                "examples" : "Interview.Language.Translate(Message.submit ) ' => \" \"Submit your answers\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "unexpected_0_1_answer",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the identifier for the message unexpected_0_1_answer \tYou cannot give response � % 1� to question � % 0�",                
                "examples" : "Interview.Language.Translate(Message.unexpected_0_1_answer) ' => \" \"You can only give one response for question '%0'\"",                
                "version" : "5.5.2.0"
            }
        ],        
        "adcproperty" : [
            {
                "name" : "Id",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Return the id of the ADC Property",                
                "examples" : "CurrentADC.Properties[1].Id  ' => \"tickColor\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Type",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the type of the property",                
                "examples" : "\tCurrentADC.Properties[1].Type ' => \"string\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Type",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : [
                    " Returns the type of property, available types are:",                    
                    "- \"number\" ",                    
                    "- \"boolean\" ",                    
                    "- \"string\" ",                    
                    "- \"color\" ",                    
                    "- \"file\" ",                    
                    "- \"question\""
                ],                
                "examples" : [
                    " CurrentADC.Properties[1].Type  ' => \"color\" ",                    
                    " CurrentADC.Properties[2].Type  ' => \"string\" ",                    
                    " CurrentADC.Properties[3].Type '  => \"question\""
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Type",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : [
                    " Returns the type of property, available types are:",                    
                    "- \"number\"",                    
                    "- \"boolean\"",                    
                    "- \"string\"",                    
                    "- \"color\"",                    
                    "- \"file\"",                    
                    "- \"question\""
                ],                
                "examples" : [
                    " CurrentADC.Properties[1].Type  ' => \"color\"",                    
                    " CurrentADC.Properties[2].Type  ' => \"string\"",                    
                    " CurrentADC.Properties[3].Type '  => \"question\""
                ],                
                "version" : "5.3.3.0"
            }
        ],        
        "response" : [
            {
                "name" : "Caption",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the caption of the response",                
                "examples" : "gender.Responses[1].Caption ' => \"Man\"",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Children",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "responses",                
                "desc" : "Returns an array of the responses placed below the response",                
                "examples" : "Brands.Responses[1].Children ' => {\"Sub-Brand A\"; \"Sub-Brand B\"; \"Sub-Brand C\"}",                
                "version" : "5.5.3.0"
            },            
            {
                "name" : "EntryCode",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Entry-code of the response",                
                "examples" : "brands.Responses[1].EntryCode ' => 4",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "EntryCodeStr",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Entry-code of the response (as string)",                
                "examples" : "country.Responses[1].EntryCodeStr ' => \"US\"",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Factor",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns a factor as they were entered in the value column of the scaled responses",                
                "examples" : [
                    " gender.Responses[1].Factor ' => 3",                    
                    " country.AvailableResponses[1].Factor ' => 7"
                ],                
                "version" : "5.4.6.0"
            },            
            {
                "name" : "Id",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Internal unique identifier of the response",                
                "examples" : [
                    " CurrentQuestion.AvailableResponses[1].id  ' => 456",                    
                    " CurrentQuestion.AvailableResponses[2].id ' => 455"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Index",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the index of response (based 1) as it was entered",                
                "examples" : [
                    " gender.Responses[1].Index  ' => 1",                    
                    " gender.Responses[2].Index  ' => 2"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "InputName",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "type",                        
                        "type" : "string",                        
                        "desc" : "Specified the type of the input to obtain",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Indicates the full-name of the HTML input for this response.",                    
                    " The `type` parameter is use to precise the input name to obtain, it could be the following:",                    
                    " <ul><li><strong>ranking</strong>: Obtain the full-name of the input to set the rank of this response</li></ul>"
                ],                
                "examples" : [
                    " ' Single",                    
                    " gender.InputName() ' => \"U0\"",                    
                    " gender.Responses[1].InputName() ' => \"U0\"",                    
                    " gender.Responses[2].InputName() ' => \"U0\"",                    
                    "",                    
                    " ' Multiple",                    
                    " brands.InputName() ' => \"M2\"",                    
                    " brands.Responses[1].InputName() ' => \"M2 510\"",                    
                    " brands.Responses[2].InputName() ' => \"M2 511\"",                    
                    " brands.Responses[3].InputName() ' => \"M2 512\"",                    
                    "",                    
                    " ' Multiple with ranking",                    
                    " brands.InputName(\"ranking\") ' => \"R2\"",                    
                    " brands.Responses[1].InputName(\"ranking\") ' => \"R2 510\"",                    
                    " brands.Responses[2].InputName(\"ranking\") ' => \"R2 511\"",                    
                    " brands.Responses[3].InputName(\"ranking\") ' => \"R2 512\""
                ],                
                "alsoSee" : [
                    "Question.InputName",                    
                    "Question.InputValue",                    
                    "Response.InputValue"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "InputValue",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "type",                        
                        "type" : "string",                        
                        "desc" : "Specified the type of the input value to obtain",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Returns the HTML input value attribute for this response.",                    
                    " The `type` parameter is use to precise the value to obtain, it could be the following:",                    
                    " <ul><li><strong>ranking</strong>: Obtain the rank value of the response input</li></ul>"
                ],                
                "examples" : [
                    " ' Single",                    
                    " gender.Responses[1].InputValue() ' => \"256\"",                    
                    " gender.Responses[2].InputValue() ' => \"257\"",                    
                    "",                    
                    " ' Multiple",                    
                    " brands.Responses[1].InputValue() ' => \"510\"",                    
                    " brands.Responses[2].InputValue() ' => \"511\"",                    
                    " brands.Responses[3].InputValue() ' => \"512\"",                    
                    "",                    
                    " ' Multiple with ranking (return the rank)",                    
                    " brands.Responses[1].InputValue(\"ranking\") ' => \"2\"",                    
                    " brands.Responses[2].InputValue(\"ranking\") ' => \"1\"",                    
                    " brands.Responses[3].InputValue(\"ranking\") ' => \"\""
                ],                
                "alsoSee" : [
                    "Question.InputName",                    
                    "Question.InputValue",                    
                    "Response.InputName"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "IsExclusive",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates if the response is considered (flag) as \"Exclusive\" answer.",                    
                    " It returns always True for a single closed question, even if it's linked into a multiple"
                ],                
                "examples" : "gender.Responses[3].IsExclusive ' => True",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "IsHeader",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "boolean",                
                "desc" : "Indicates if a response is a header (not clickable)",                
                "examples" : "Cars.Response[1].IsHeader ' => true",                
                "alsoSee" : "Response.IsOpen",                
                "version" : "5.5.3.0"
            },            
            {
                "name" : "IsIgnored",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Indicates if the response is ignored",                
                "examples" : "brands.Responses[5].IsIgnored ' => False",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "IsOpen",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "boolean",                
                "desc" : "Indicates if a response has an open ended response attached to it",                
                "examples" : "Gender.Response[3].IsOpen ' => true",                
                "alsoSee" : "Response.OpenQuestion",                
                "version" : "5.5.3.0"
            },            
            {
                "name" : "IsSelected",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Indicates if the response was previously selected (included in the Question.Answers collection)",                
                "examples" : [
                    " CurrentQuestion.AvailableResponses[1].IsSelected  ' => true",                    
                    " CurrentQuestion.AvailableResponses[2].IsSelected ' => false",                    
                    " ' Similar than",                    
                    " ' CurrentQuestion.Value Has CurrentQuestion.AvailableResponses[2].Index"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "OpenQuestion",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "question",                
                "desc" : "Indicates the question when a response has an open ended response attached to it",                
                "examples" : "Gender.Response[3].OpenQuestion ' => Please specify",                
                "alsoSee" : "Response.IsOpen",                
                "version" : "5.5.3.0"
            },            
            {
                "name" : "Order",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Returns the order of response (based 1) on display.",                    
                    " Returns DK if the question is skipped or the response was ignored."
                ],                
                "examples" : [
                    " brands.Responses[1].Order  ' => 2",                    
                    " brands.Responses[2].Order  ' => 1"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Parent",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "response",                
                "desc" : "\tReturns the parent response (hence a response as well) if no parent an object is created with DK as an ID",                
                "examples" : "\tBrands.Responses[2].Parent ' => \"Brand A\"",                
                "version" : "5.5.3.0"
            },            
            {
                "name" : "Rank",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates in which order the answer has been selected by the respondent.",                    
                    " Sequence from 0 (when no selection) to the number of answers.<br />If the response has not been selected the value is 0.",                    
                    " For multiple ranking question it returns the order of the selection (based 1)",                    
                    " For classical multiple question, the order of the selection is a sequence (based 1) <br />that may be sort according to how the responses has been displayed."
                ],                
                "examples" : [
                    " CurrentQuestion.AvailableResponses[1].Rank ' => 0 (not selected)",                    
                    " CurrentQuestion.AvailableResponses[2].Rank ' => 3 (third selected)",                    
                    " CurrentQuestion.AvailableResponses[3].Rank ' => 1 (first selected)",                    
                    " CurrentQuestion.AvailableResponses[4].Rank ' => 2 (second selected)"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ResourceURL",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the URL of resource for the response",                
                "examples" : "gender.Responses[1].ResourceURL  ' => \"/man.png\"",                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "Tags",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "stringarray",                
                "desc" : [
                    "Returns the list of tags associated to a response",                    
                    "",                    
                    "q1.Responses[1].Tags Has {\"Browsable\"}"
                ],                
                "examples" : "q1.Responses[1].Tags Has {\"Browsable\"}",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "ToString",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns a string which represent the response (express in JSON format)",                
                "examples" : [
                    " ' Output in a single line (it's break here for the readability)",                    
                    " gender.Responses[1].ToString()",                    
                    " ' => {",                    
                    " \"index\":1,",                    
                    " \"entryCode\":\"001\",",                    
                    " \"caption\":\"Man\",",                    
                    " \"isExclusive\":true,",                    
                    " \"isSelected\":true,",                    
                    " \"resourceUrl\":\"./Man.png\"",                    
                    " }"
                ],                
                "version" : "5.3.2.0"
            },            
            {
                "name" : "TypeOf",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns the type of the current object / variable",                
                "examples" : "gender.Responses[1].TypeOf() ' => \"response\"",                
                "version" : "5.3.2.0"
            }
        ],        
        "adccontent" : [
            {
                "name" : "FileName",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the file name associated with the content",                
                "examples" : "\tCurrentADC.Contents[1].FileName ' => \"IE-gender-with-fx.css\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Mode",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : [
                    "\tReturns the mode of the content.",                    
                    "\tAvailable modes are:",                    
                    "\t- \"share\" ",                    
                    "\t- \"static\" ",                    
                    "\t- \"dynamic\""
                ],                
                "examples" : "\tCurrentADC.Contents[1].Mode' => \"static\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Position",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : [
                    "\tReturns the position of the content.",                    
                    "\tAvailable positions are:",                    
                    "\t- \"none\" ",                    
                    "\t- \"head\" ",                    
                    "\t- \"placeholder\" ",                    
                    "\t- \"foot\""
                ],                
                "examples" : "\tCurrentADC.Contents[1].Position ' => \"head\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ToText",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : [
                    "\tReturns the content of the file associated with the content. ",                    
                    "",                    
                    "\tThis method will evaluate all embedded AskiaScript when the file is dynamic.",                    
                    "\tThis method will returns an empty string if the file is binary (\"binary\", \"video\", \"audio\", \"image\", \"flash\")."
                ],                
                "examples" : "\tCurrentADC.Contents[1].ToText() ' => \".tickColor { background: #ff00ff; }\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "ToURL",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : [
                    "\tReturns the final relative URL path to the content file",                    
                    "",                    
                    "\tThis is a shorthand to the method:",                    
                    "\tCurrentADC.URLTo(CurrentADC.Contents[_index_].Mode + \"/\" + CurrentADC.Contents[_index_].FileName)"
                ],                
                "examples" : [
                    "\tCurrentADC.Contents[1].ToURL() ",                    
                    "\t' => \"../Resources/[Survey]/[ADC]/style.css\" ",                    
                    "",                    
                    "\tCurrentADC.Contents[1].ToURL()",                    
                    "\t' => \"../Resources/[SurveyName]/jquery.js\"",                    
                    "",                    
                    "\tCurrentADC.Contents[1].ToURL()",                    
                    "\t' => \"\" ' Not yet implemented"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Type",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the type of the content.",                
                "examples" : "\tCurrentADC.Contents[1].Type ' => \"JavaScript\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Type",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : [
                    " Returns the type of the content. Available types are:",                    
                    "- \"text\" ",                    
                    "-- \"html\" ",                    
                    "-- \"css\" ",                    
                    "-- \"javascript\" ",                    
                    "- \"binary\" ",                    
                    "-- \"image\" ",                    
                    "-- \"audio\" ",                    
                    "-- \"video\" ",                    
                    "-- \"flash\""
                ],                
                "examples" : "CurrentADC.Contents[1].Type ' => \"image\"",                
                "version" : "5.3.3.0"
            }
        ],        
        "adp" : [
            {
                "name" : "Redirect",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "adp",                
                "args" : [
                    {
                        "name" : "URL",                        
                        "type" : "string",                        
                        "desc" : "to redirect"
                    },                    
                    {
                        "name" : "Seconds",                        
                        "type" : "string",                        
                        "desc" : "to redirect"
                    }
                ],                
                "desc" : "\tSets the ADP property",                
                "examples" : "\tCurrentADP.SetProperty(\"Next\",false).Redirect(\"www.askia.com\",3).ShowMessage(\"theEnd\")",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "SetProperty",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "adp",                
                "args" : [
                    {
                        "name" : "property",                        
                        "type" : "string",                        
                        "desc" : "Id of the Property to set"
                    },                    
                    {
                        "name" : "value",                        
                        "type" : "variant"
                    }
                ],                
                "desc" : "\tSets the ADP property",                
                "examples" : "\tCurrentADP.SetProperty(\"Next\",false).ShowMessage(\"theEnd\")",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "ShowMessage",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "adp",                
                "args" : [
                    {
                        "name" : "message",                        
                        "type" : "string",                        
                        "desc" : "yto be shown where the questions are usually displayed"
                    }
                ],                
                "desc" : "\tUses the ADP engine to generate some HTML with a message",                
                "examples" : "\tCurrentADP.SetProperty(\"Next\",false).ShowMessage(\"theEnd\")",                
                "version" : "5.5.2.0"
            }
        ],        
        "interview" : [
            {
                "name" : "AgentID",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Returns the identifier of the interviewing agent",                    
                    "",                    
                    " Only available with askiaVoice or askiaFace fieldwork, otherwise it returns 0.",                    
                    " Cotrarily to the agent name the agent id is stored in the survey data so can be accessed by verification scripts"
                ],                
                "remarks" : [
                    " @alsosee",                    
                    " AgentName"
                ],                
                "examples" : "Interview.AgentID ' => 35",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "AgentName",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : [
                    " Returns the name of the interviewing agent",                    
                    "",                    
                    " Only available during askiaVoice or askiaFace fieldwork, otherwise it returns an empty string \"\".",                    
                    " The agent name is not persisted in the survey data hence it's not available in verification script. Make sure that if you set a value to a question with it,",                    
                    " you do no lose that information by modifying it in Supervisor or Entry (see IsCATI)"
                ],                
                "remarks" : [
                    " ",                    
                    " @alsosee",                    
                    " IsCATI, AgentID",                    
                    "",                    
                    " "
                ],                
                "examples" : "Interview.AgentName ' => \"John Doe\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "Broker",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the Broker ID as received in askia web",                
                "remarks" : "",                
                "examples" : "Interview.Broker ' => \"SSI\"",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "BrokerPanelID",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the Broker Panel ID as received in askia web  when available",                
                "remarks" : "",                
                "examples" : "Interview.BrokerPanelID ' => \"204ab\"",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "CallID",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Returns a Call ID of the current interview.",                    
                    "",                    
                    " Only available during askiaVoice fieldwork, otherwise it returns 0."
                ],                
                "remarks" : "This is usually only available in AskiaVoice",                
                "examples" : "Interview.CallID ' => 123",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "Duration",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "number",                
                "args" : [
                    {
                        "name" : "startQuestion",                        
                        "type" : "question"
                    },                    
                    {
                        "name" : "endQuestion",                        
                        "type" : "question",                        
                        "opt" : true
                    },                    
                    {
                        "name" : "threshold",                        
                        "type" : "number",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " Returns the time (in seconds) spent on a question or the total time spent between a range of questions. (eg. InterviewTime)",                    
                    " If any question duration is superior to the threshold, that question is not taken in account in the sum",                    
                    "",                    
                    " Parameters",                    
                    "",                    
                    " - startQuestion [Required] {Question} Indicates the question from where the calculation of tiem should start.",                    
                    " - endQuestion [Optional] {Question} Indicates the question to where the calculation of time should stop should stop (included in the calculation). If the omit, the endQuestion is equal to the startQuestion",                    
                    " - threshold [Optional] {Number} any duration superior to the threshold (for a given quetsion) will be ignored"
                ],                
                "examples" : [
                    " Interview.Duration(gender) ' => 2 (seconds)",                    
                    "",                    
                    " Interview.Duration(gender, Age) ' => 5 (seconds)",                    
                    "",                    
                    " ' q1 is inside a loop = only the current iteration is returned",                    
                    " Interview.Duration(q1) <> Interview.Duration(q1.FirstIteration,q1.LastIteration)",                    
                    "  "
                ],                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "EndTime",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "date",                
                "desc" : [
                    " Indicates the finished date/time of the current interview in the current time zone(eg. EndInterview)",                    
                    "",                    
                    " If the current interview is not yet finished it return the time of last screen submit"
                ],                
                "remarks" : "",                
                "examples" : [
                    " Interview.EndTime ' => #10/01/2016 11:01\"",                    
                    "",                    
                    " @alsosee",                    
                    " EndTimeUTC,StartTime"
                ],                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "EndTimeUTC",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "date",                
                "desc" : [
                    " Indicates the finished UTC date/time of the current interview (eg. EndInterview)",                    
                    "",                    
                    " If the current interview is not yet finished it return the time of last screen submit"
                ],                
                "remarks" : [
                    " @alsosee",                    
                    " EndTime,StartTimeUTC"
                ],                
                "examples" : "Interview.EndTimeUTC ' => #10/01/2016 10:01\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "Errors",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "errors",                
                "desc" : "Returns the list of errors during the interview run-time",                
                "examples" : [
                    " Interview.Errors.Count ' => 0",                    
                    "",                    
                    " Interview.Errors[1].Message ' => \"A response is expected for question 'q1'\""
                ],                
                "version" : "5.4.1.0"
            },            
            {
                "name" : "GetFaceOS",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : [
                    " Returns the Operating System (OS) of the AskiaFace device, if the current interviewing mode is AskiaFace.",                    
                    "",                    
                    " Returns an empty string if the interviewing mode is not Face.",                    
                    "",                    
                    " Possible return values are:",                    
                    "",                    
                    " \"windows\"",                    
                    " \"ios\"",                    
                    " \"android\"",                    
                    "",                    
                    " Return a String"
                ],                
                "examples" : [
                    " Interview.GetFaceOS()  ' => \"windows\"",                    
                    "",                    
                    " Interview.GetFaceOS()  ' => \"ios\"",                    
                    "",                    
                    " Interview.GetFaceOS()  ' => \"android\"",                    
                    " "
                ],                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "GUID",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the GUID a global Unique Identifier for each respondent",                
                "remarks" : "",                
                "examples" : "Interview.GUID ' => \"759C5786-C972-4AA8-BBE0-DBBA9DD2ACF2\"",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "ID",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the ID of the interview. The ID is not available during the interview but is in case of a modification in Voice or in the verification scripts",                
                "remarks" : "This is usually only available once the interview has been saved",                
                "examples" : "Interview.Id ' => 123",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "IPAddress",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the IPAddress if available",                
                "remarks" : "This is usually only available in askiaWeb",                
                "examples" : "Interview.IPAddress ' => \"127.0.0.1\"",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "IsFace",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates if the current interviewing mode is AskiaFace (CAPI)",                    
                    "",                    
                    " Return a Boolean"
                ],                
                "remarks" : "This is only available while the interview is being collected, not in verification scripts",                
                "examples" : "Interview.IsFace  ' => True",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "IsFirstPage",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates if you are on the first page",                    
                    "",                    
                    " Return a Boolean"
                ],                
                "remarks" : "This is only available while the interview is being collected, not in verification scripts",                
                "examples" : "Interview.IsFirstPage ' => True",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "IsLastPage",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates if you are on the last page - this might give you the wrong information depending on routings",                    
                    "",                    
                    " Return a Boolean"
                ],                
                "remarks" : "This is only available while the interview is being collected, not in verification scripts",                
                "examples" : "Interview.IsLastPage ' => True",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "IsTest",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates if the current interview was started in Brief mode or Test flag",                    
                    "",                    
                    " Return a Boolean"
                ],                
                "remarks" : "This is only available while the interview is being collected, not in verification scripts",                
                "examples" : "Interview.IsTest  ' => False",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "IsVoice",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates if the current interviewing mode is AskiaVoice (CATI)",                    
                    "",                    
                    " Return a Boolean"
                ],                
                "remarks" : "This is only available while the interview is being collected, not in verification scripts",                
                "examples" : "Interview.IsVoice  ' => True",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "IsWeb",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " Indicates if the current interviewing mode is in AskiaWeb (CAWI)",                    
                    "",                    
                    " Return a Boolean"
                ],                
                "remarks" : "This is only available while the interview is being collected, not in verification scripts",                
                "examples" : "Interview.IsWeb  ' => True",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "Key",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the secure hash key of the current interview (used in URL) (eg. Password)",                
                "remarks" : "",                
                "examples" : "Interview.Key ' => \"QWERTYQWERTYQWER\"",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "Language",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "language",                
                "desc" : "Returns the respondent's current language.",                
                "examples" : [
                    " Interview.Language.Abbr ' => \"FRA\"",                    
                    " Interview.Language.Name ' => \"French (France)\""
                ],                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "LastResultCode",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    "\tReturns the Last result code to the call or web interview - this is only available in a routing at the end of the survey or",                    
                    "\ton an edit routing"
                ],                
                "remarks" : "\tthis was added in 5.4.9 in January 2019",                
                "examples" : "\tInterview.LastResultCode ' => 4 = hang-up",                
                "version" : "5.4.9.0"
            },            
            {
                "name" : "LastSubResultCode",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    "\tReturns the Last sub result code to the call or web interview - this is only available in a routing at the end of the survey or",                    
                    "\ton an edit routing"
                ],                
                "remarks" : "\tthis was added in 5.4.9 in January 2019",                
                "examples" : "\tInterview.LastSubResultCode ' => 3",                
                "version" : "5.4.9.0"
            },            
            {
                "name" : "Latitude",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the Latitude if available (0 otherwise)",                
                "remarks" : "This is usually only available in askiaFace in IOS or Android",                
                "examples" : "Interview.Latitude ' => 1.4",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "ListID",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the identifier of the respondent list",                
                "remarks" : "This is usually only available in askiaVoice",                
                "examples" : "Interview.ListID ' => 22",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "Longitude",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the longitude if available (0 otherwise)",                
                "remarks" : "This is usually only available in askiaFace in IOS or Android",                
                "examples" : "Interview.Longitude ' => 1.4",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "OutOfQuotaQuestions",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "array",                
                "desc" : "\tReturns the question (r the list of questions if the quotas are nested) that triggered the out of quota",                
                "remarks" : "\t",                
                "examples" : [
                    "\tInterview.OutOfQuotaQuestions[1].Shortcut ' => Gender",                    
                    "\tInterview.OutOfQuotaQuestions[1].Value\t' => Male"
                ],                
                "version" : "5.4.9.0"
            },            
            {
                "name" : "PanelID",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the askia Panel ID as received in askia web when available",                
                "remarks" : "",                
                "examples" : "Interview.PanelID ' => \"2356b\"",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "Progress",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns the percentage value of progress through the questionnaire.",                
                "examples" : "Interview.Progress ' => 32",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "Returns",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "offsettoutc",                
                "desc" : [
                    " This returns the shift in hours from the time to the",                    
                    " "
                ],                
                "examples" : "Interview.StartTime - Interview.OffsetToUTC /24 ' => StartTime as UTC time",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "Scenario",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Returns the current respondent scenario (also known in design 5 as version)",                
                "remarks" : "This is number is usually unique in Voice and Web but not in Face",                
                "examples" : "Interview.Scenario ' => \"User\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "Seed",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "Returns a pseudo-unique number for each interview used to generate random numbers in the survey",                
                "remarks" : "This is number is usually unique in Voice and Web but not in Face",                
                "examples" : "Interview.Seed ' => 133",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "StartTime",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "date",                
                "desc" : "Indicates the start date/time of the current interview in the current time zone (eg. StartInterview)",                
                "remarks" : [
                    " @alsosee",                    
                    " StartTimeUTC"
                ],                
                "examples" : "Interview.StartTime ' => #10/01/2016 10:33\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "StartTimeUTC",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "date",                
                "desc" : "Indicates the start UTC date/time of the current interview  (eg. StartInterview)",                
                "remarks" : [
                    " @alsosee",                    
                    " StartTime",                    
                    "",                    
                    " "
                ],                
                "examples" : "Interview.StartTimeUTC ' => #10/01/2016 11:33\"",                
                "version" : "5.4.2.0"
            },            
            {
                "name" : "ToString",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns the string representation of the object / variable",                
                "examples" : "Interview.ToString()",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "TypeOf",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "desc" : "Returns \"interview\"",                
                "examples" : "interview.TypeOf() ' => \"interview\"",                
                "version" : "5.3.5.0"
            }
        ],        
        "survey" : [
            {
                "name" : "ChildQuestions",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "questionarray",                
                "desc" : [
                    "\tReturns the array of questions at the top level of the survey (often chapters)",                    
                    "\t"
                ],                
                "remarks" : [
                    "\t@alsosee",                    
                    "\tQuestions"
                ],                
                "examples" : "\tSurvey.ChildQuestions[1].Shortcut ' => \"Demographics\"",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "FileName",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the file name of the survey",                
                "remarks" : [
                    "\t@alsosee",                    
                    "\tName"
                ],                
                "examples" : "\tSurvey.FileName ' => \"Ex.qex\"",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "ID",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "\tReturns the identifier of the survey (as registered in the CCA), or 0 when not yet registered.",                
                "examples" : "\tSurvey.Id ' => 13",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "Languages",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "languagearray",                
                "desc" : "\tReturns the revision number of the survey file",                
                "examples" : "\tSurvey.Languages[1].Name ' => \"English\"",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "Name",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the name of the survey (as registered in the CCA) or the filename of the survey when not yet registered.",                
                "remarks" : [
                    "\t@alsosee",                    
                    "\tFileName"
                ],                
                "examples" : "\tSurvey.Name ' => \"Ex\"",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "Questions",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "questionarray",                
                "desc" : "\tReturns the array of all questions - understand that per question we mean each survey data point - so a question within a loop will appear many times",                
                "remarks" : [
                    "\t@alsosee",                    
                    "\tChildQuestions"
                ],                
                "examples" : "\tSurvey.Questions[1].Shortcut ' => \"Demographics\"",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "ResourcePath",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the directory where the resources are made available",                
                "examples" : "\tSurvey.ResourcePath => \"C:\\intepub\\webprod\\resource\\1\\Resources\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "ResourceURL",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the URL (often relative) where the resources are made available",                
                "examples" : "\tSurvey.ResourceURL => \"..\\Resources\"",                
                "version" : "5.5.2.0"
            },            
            {
                "name" : "Revision",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : "\tReturns the revision number of the survey file",                
                "examples" : "\tSurvey.Revision ' => 14",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "Scenarios",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "stringarray",                
                "desc" : "\tReturns the list of scenarios in the survey file",                
                "examples" : "\tSurvey.Scenarios[1] ' => \"Debug\"",                
                "version" : "5.5.0.0"
            },            
            {
                "name" : "Tags",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "stringarray",                
                "desc" : "\tReturns the list of possible tags in the survey file",                
                "examples" : "\tSurvey.Tag[1] ' => \"Demographic\"",                
                "version" : "5.5.0.0"
            }
        ],        
        "adc" : [
            {
                "name" : "Contents",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "array",                
                "desc" : "\tList of contents in the current selected output.",                
                "examples" : [
                    "\tCurrentADC.Contents.Count ' => 2",                    
                    "",                    
                    "\tCurrentADC.Contents[1]",                    
                    "\t' => <ADCContent::dynamic:default.html>"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "GetContent",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "adccontent",                
                "args" : [
                    {
                        "name" : "location",                        
                        "type" : "string",                        
                        "desc" : "Location of the content to obtain"
                    }
                ],                
                "desc" : "\tReturns the ADC Content object with the specified location.",                
                "examples" : [
                    "\tCurrentADC.GetContent(\"share/jquery.js\")  ",                    
                    "\t' => <ADCContent::share:jquery.js>",                    
                    "",                    
                    "\tCurrentADC.GetContent(\"static/styles.css\").Type ",                    
                    "\t' => \"css\""
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "GetProperty",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "adcproperty",                
                "args" : [
                    {
                        "name" : "propertyId",                        
                        "type" : "string",                        
                        "desc" : "Id of the Property to obtain"
                    }
                ],                
                "desc" : "\tReturns the ADC Property object with the specified id.",                
                "examples" : [
                    "\tCurrentADC.GetProperty(\"tickColor\")  ",                    
                    "\t' => <ADCProperty::tickColor>",                    
                    "",                    
                    "\tCurrentADC.GetProperty(\"tickColor\").Name ",                    
                    "\t' => \"Tick color\""
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "InstanceId",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    "\tReturns the unique identifier of the ADC instance.",                    
                    "\tThe same ADC could appears several times in the same page and each of it has it's own unique identifier that could be retrieve through this property."
                ],                
                "examples" : [
                    "\tCurrentADC.InstanceId  ",                    
                    "\t' => 1, for the first ADC instance ",                    
                    "\t' available in the current page"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Name",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Name of the ADC",                
                "examples" : [
                    " CurrentADC.Name ' => \"adc-problem\"",                    
                    " "
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "OutputId",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the current output in use.",                
                "examples" : "\tCurrentADC.OutputId ' => \"mobileHTMLOutput\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Properties",                
                "ns" : "masquelanguage",                
                "base" : "property",                
                "type" : "array",                
                "desc" : "\tEntire collection of properties defined in the ADC.",                
                "examples" : [
                    "\tCurrentADC.Properties.Count ' => 2",                    
                    "",                    
                    "\tCurrentADC.Properties[1] ",                    
                    "\t' => <ADCProperty::tickColor>"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "PropQuestion",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "questions",                
                "args" : [
                    {
                        "name" : "propertyId",                        
                        "type" : "string",                        
                        "desc" : "Id of the Property to read"
                    }
                ],                
                "desc" : "\tReturns the value of the property as a questions - use only for ADC properties defined as question",                
                "examples" : [
                    "\tCurrentADC.PropQuestion(\"SideQuestion\")",                    
                    "\tCurrentADC.PropQuestion(\"SideQuestion\").shortcut",                    
                    "\t"
                ],                
                "version" : "5.4.6.0"
            },            
            {
                "name" : "PropValue",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "propertyId",                        
                        "type" : "string",                        
                        "desc" : "Id of the Property to read"
                    }
                ],                
                "desc" : [
                    "\tReturns the value of the property as a string.",                    
                    "\t\t"
                ],                
                "examples" : [
                    "\tCurrentADC.PropValue(\"defaultDisplay\")",                    
                    "\t' => \"FlashEnable\"",                    
                    "",                    
                    "\tCurrentADC.PropValue(\"tickColour\") ' => \"0,255,0\"",                    
                    "",                    
                    "\tCurrentADC.PropValue(\"booleanProp\") ' => \"1\""
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "URLTo",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "location",                        
                        "type" : "string",                        
                        "desc" : "Location of the content to obtain"
                    }
                ],                
                "desc" : [
                    "\tReturns the relative URL path to content file at the specify location.",                    
                    "\tFor dynamic file:",                    
                    "\t- It returns the path to the pre-processor component such as AskiaExt.dll.",                    
                    "\t- It's likely to be use in AJAX query. In that case, you could also post the data of current HTML form to obtain a live output.",                    
                    "\t"
                ],                
                "examples" : [
                    "\tCurrentADC.URLTo(\"static/tick.png\") ",                    
                    "\t' => \"../Resources/[Survey]/[ADC]/tick.png\"",                    
                    "",                    
                    "\tCurrentADC.URLTo(\"shared/jquery.js\") ",                    
                    "\t' => \"../Resources/[Survey]/jquery.js\" ",                    
                    "",                    
                    "\tCurrentADC.URLTo(\"dynamic/default.js\")",                    
                    "\t' => \"\" ' Not yet implemented"
                ],                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Var",                
                "ns" : "masquelanguage",                
                "base" : "method",                
                "type" : "variant",                
                "args" : [
                    {
                        "name" : "propertyId",                        
                        "type" : "string",                        
                        "desc" : "Id of the Property to read"
                    }
                ],                
                "desc" : [
                    "\tReturns the value of the property as a variant.",                    
                    "\t\t"
                ],                
                "examples" : [
                    "\tCurrentADC.PropValue(\"defaultDisplay\")",                    
                    "\t' => \"FlashEnable\"",                    
                    "",                    
                    "\tCurrentADC.Var(\"tickColour\") ' => \"0,255,0\"",                    
                    "",                    
                    "\tCurrentADC.Var(\"booleanProp\") ' => 1"
                ],                
                "version" : "5.4.2.0"
            }
        ]
    }
}, true);

});
