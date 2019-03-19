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
    "DATA" : "data",
    "DEBUG" : "debug",
    "QUESTION" : "question",
    "QUESTIONS" : "questions",
    "RESPONSE" : "response",
    "RESPONSES" : "responses"
});

askiaScript.extend(askiaScript.i18n, {
    "types" : {
        "data" : "Data",
        "debug" : "Debug",
        "question" : "Question",
        "questions" : "Questions",
        "response" : "Response",
        "responses" : "Responses"
    },
    "core" : {
        "data" : {
            "ns" : "aggregatedlanguage",
            "desc" : [
                " Object that lets you access data for a question - get counts, means, etc...",
                " "
            ],
            "examples" : [
                " ",
                " gender.Data.Size()",
                " gender.Data.Mean()",
                " "
            ],
            "version" : "5.3.5.0"
        },
        "debug" : {
            "ns" : "aggregatedlanguage",
            "desc" : "Object used to output debug information while running scripts. The information is added to a file called DebugTracte.txt. Nothing is done in in Vista",
            "version" : "5.3.5.0"
        },
        "question" : {
            "ns" : "aggregatedlanguage",
            "desc" : [
                " Variable which contains all information and action to get information on a question, its metadata and its data ",
                " "
            ],
            "examples" : [
                " ",
                " gender.Shortcut",
                " gender.Responses[1].Caption",
                " gender.Data",
                " "
            ],
            "version" : "5.3.5.0"
        },
        "questions" : {
            "ns" : "aggregatedlanguage",
            "desc" : [
                " Describe an array of questions",
                " "
            ],
            "examples" : [
                " ",
                " gender.ChildQuestions",
                " "
            ],
            "version" : "5.3.5.0"
        },
        "response" : {
            "ns" : "aggregatedlanguage",
            "desc" : [
                " Object that lets you access information for a response",
                " "
            ],
            "examples" : [
                " ",
                " gender.Responses[1].Caption",
                " Income.Responses[3].Factor",
                " "
            ],
            "version" : "5.3.5.0"
        },
        "responses" : {
            "ns" : "aggregatedlanguage",
            "desc" : "Object which contains a collection of responses. It's like an array of responses.",
            "alsoSee" : "Question.Responses",
            "version" : "5.3.4.0"
        }
    }
}, true);

askiaScript.extend(askiaScript.lexical, {
    "namespaces" : {
        "aggregatedlanguage" : {
            "name" : "AggregatedLanguage",
            "ns" : "aggregatedlanguage",
            "dependencies" : [
                "askialanguage"
            ]
        }
    },
    "builtin" : [
        {
            "name" : "Debug",
            "ns" : "aggregatedlanguage",
            "base" : "const",
            "type" : "debug",
            "desc" : "Object used to output debug information while running scripts .",
            "examples" : [
                " Debug.Trace(\"I am here!\")",
                "",
                " "
            ],
            "version" : "5.3.5.0"
        }
    ],
    "members" : {
        "question" : [
            {
                "name" : "Children",
                "ns" : "aggregatedlanguage",
                "base" : "property",
                "type" : "array",
                "desc" : "Returns all the sub-questions associated to a question - that is all the questions placed within the sub-tree defined by a question",
                "examples" : "\t Dim arrSubQuestions = BrandEvaluation.Children",
                "version" : "5.3.5.0"
            },
            {
                "name" : "Data",
                "ns" : "aggregatedlanguage",
                "base" : "property",
                "type" : "data",
                "desc" : "Returns the data for a given question - could be numeric, closed or open",
                "examples" : "gender.Data.Counts()[1] ' => Counts for first response",
                "version" : "5.3.5.0"
            },
            {
                "name" : "LongCaption",
                "ns" : "aggregatedlanguage",
                "base" : "property",
                "type" : "string",
                "desc" : "Returns the long caption of the question in the current language",
                "examples" : "gender.LongCaption ' => \"Are you a:\"",
                "version" : "5.3.5.0"
            },
            {
                "name" : "MaxDate",
                "ns" : "aggregatedlanguage",
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
                "version" : "5.3.5.0"
            },
            {
                "name" : "MaxValue",
                "ns" : "aggregatedlanguage",
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
                "version" : "5.3.5.0"
            },
            {
                "name" : "MinDate",
                "ns" : "aggregatedlanguage",
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
                "ns" : "aggregatedlanguage",
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
                "name" : "NextQuestion",
                "ns" : "aggregatedlanguage",
                "base" : "property",
                "type" : "question",
                "desc" : "Returns the next question in the tree (below or after)",
                "examples" : "\t Dim NextQuetsion = BrandEvaluation.NextQuestion",
                "version" : "5.3.5.0"
            },
            {
                "name" : "Parent",
                "ns" : "aggregatedlanguage",
                "base" : "property",
                "type" : "question",
                "desc" : "Returns the parent question in the survey tree in analyse/vista",
                "examples" : "\t Dim LoopQuestion = BrandEvaluation.Parent",
                "version" : "5.3.5.0"
            },
            {
                "name" : "PreviousQuestion",
                "ns" : "aggregatedlanguage",
                "base" : "property",
                "type" : "question",
                "desc" : "Returns the previous question in the tree (before or above)",
                "examples" : "\t Dim BeforeQuetsion = BrandEvaluation.PreviousQuestion",
                "version" : "5.3.5.0"
            },
            {
                "name" : "Responses",
                "ns" : "aggregatedlanguage",
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
                    "Question.AvailableAnswers",                    
                    "Core.Responses",
                    "Core.Response"
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "ShortCaption",
                "ns" : "aggregatedlanguage",
                "base" : "property",
                "type" : "string",
                "desc" : [
                    " Returns the short caption of the question in the current language.",
                    " If the ShortCaption is empty then it return the LongCaption"
                ],
                "examples" : "gender.ShortCaption ' => \"Respondent Gender\"",
                "version" : "5.3.5.0"
            },
            {
                "name" : "Shortcut",
                "ns" : "aggregatedlanguage",
                "base" : "property",
                "type" : "string",
                "desc" : "Returns the shortcut of the question (name of the variable)",
                "examples" : [
                    " gender.Shortcut  ' => \"gender\"",
                    " ^1. appreciation^.Shortcut   ' => \"1. appreciation\""
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "ToString",
                "ns" : "aggregatedlanguage",
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
                "version" : "5.3.5.0"
            },
            {
                "name" : "Type",
                "ns" : "aggregatedlanguage",
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
                    " "
                ],
                "examples" : [
                    " gender.Type ' => \"single\"",
                    " brands.Type ' => \"multiple\"",
                    " age.Type ' => \"numeric\"",
                    " comment.Type ' => \"open\"",
                    " birth.Type ' => \"datetime\"",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "TypeOf",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "string",
                "desc" : "Returns the type of the current object / variable",
                "examples" : "gender.TypeOf() ' => \"question\"",
                "version" : "5.3.5.0"
            }
        ],
        "data" : [
            {
                "name" : "Counts",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "array",
                "desc" : [
                    " Returns an array of counts for the question... in one call you have the flat counts for a whole question",
                    " You have the possibility of creating groups of responses (which would be usefull for mutliple responses)"
                ],
                "examples" : [
                    " gender.Data.Counts()[1] ' => 159 males",
                    " Brands.Data.Counts({1;5}, {2;4;6})[2] ' => Returns the number of indiciduals who have selected brands 2,4 or 6",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "Filter",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "ddata",
                "args" : [
                    {
                        "name" : "Sub",
                        "type" : "string"
                    }
                ],
                "desc" : "Filters some data with a sub-population",
                "examples" : [
                    " gender.Data.Filter(\"Males\").Counts()[2] ' => 0 females",
                    "",
                    " Dim myVar = gender.Data",
                    " myVar.Filter(\"Males\") ' This will change the sub-population in the variable",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "MakeNumeric",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "data",
                "args" : [
                    {
                        "name" : "Value",
                        "type" : "number",
                        "repeatable" : true
                    }
                ],
                "desc" : [
                    " Transforms closed data into numeric by providing a factor for each closed response",
                    " If the factors are not provided, the factors defined in design are used"
                ],
                "examples" : [
                    " gender.Data.MakeNumeric(1,2,0,0).Mean()",
                    " Income.Data.MakeNumeric().Mean()",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "Max",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "number",
                "desc" : "Returns the maximum of all responses to a numeric question",
                "examples" : [
                    " Age.Data.Max() ' => Max",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "Mean",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "number",
                "desc" : "Returns the mean of a numeric question",
                "examples" : [
                    " Age.Data.Mean() ' => average age",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "Median",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "number",
                "args" : [
                    {
                        "name" : "Use",
                        "type" : "number",
                        "desc" : "interpollation to calculate the mean"
                    }
                ],
                "desc" : "Returns the Median of a numeric question",
                "examples" : [
                    " Age.Data.Median(true) ' => median age using interpollation if the number of interviews is even",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "Min",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "number",
                "desc" : "Returns the minimum of all responses to a numeric question",
                "examples" : [
                    " Age.Data.Min() ' => Min",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "Size",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "number",
                "desc" : "Returns the weighted number of interviews in a Data Object",
                "examples" : [
                    " Age.Data.Size() ' => Number of interviews",
                    " Age.Data.Weight(\"UKPopulation\").Ffilter(\"Males\")\"Size() ' => Returns the weighted number of males in the UK",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "StdDev",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "number",
                "desc" : "Returns the standard deviation of a numeric question",
                "examples" : [
                    " Age.Data.StdDev() ' => Standard deviation of age",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "StdDevEst",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "number",
                "desc" : "Returns the standard deviation (estimator) of a numeric question - in other words the denominator of the variance is N-1",
                "examples" : [
                    " Age.Data.StdDevEst() ' => Standard deviation of age",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "Sum",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "number",
                "desc" : "Returns the sum of all responses to a numeric question",
                "examples" : [
                    " Age.Data.Sum() ' => Sum",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "Weight",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "data",
                "args" : [
                    {
                        "name" : "Weighting",
                        "type" : "string",
                        "desc" : "name to use"
                    }
                ],
                "desc" : "Adds weighting to a data container",
                "examples" : [
                    " Age.Data.Weight(\"UKPop\").Mean() => Returns the weighted mean",
                    " Age.Data.Weight(\"UKPop\").Filter(\"Males\").Mean() => Returns the weighted mean for males",
                    "",
                    " Dim myVar = Age.Weight",
                    " myVar.Weight(\"UKPop\") ' This will change the weighting in the variable",
                    "",
                    " "
                ],
                "version" : "5.3.5.0"
            }
        ],
        "response" : [
            {
                "name" : "Caption",
                "ns" : "aggregatedlanguage",
                "base" : "property",
                "type" : "string",
                "desc" : "Returns the caption of the response",
                "examples" : "gender.Responses[1].Caption ' => \"Man\"",
                "version" : "5.3.5.0"
            },
            {
                "name" : "Factor",
                "ns" : "aggregatedlanguage",
                "base" : "property",
                "type" : "number",
                "desc" : "Returns a factor as their was entered in the value column of the scale responses",
                "examples" : [
                    " gender.Responses[1].Factor ' => 3",
                    " "
                ],
                "version" : "5.3.5.0"
            },
            {
                "name" : "ToString",
                "ns" : "aggregatedlanguage",
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
                "version" : "5.3.5.0"
            },
            {
                "name" : "TypeOf",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "string",
                "desc" : "Returns the type of the current object / variable",
                "examples" : "gender.Responses[1].TypeOf() ' => \"response\"",
                "version" : "5.3.5.0"
            }
        ],
        "debug" : [
            {
                "name" : "Trace",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "debug",
                "args" : [
                    {
                        "name" : "message",
                        "type" : "string"
                    }
                ],
                "desc" : "Outputs a string to the debug file to understand while your script is not (yet) doing what you want it to do",
                "examples" : [
                    "\t Dim dValue = CurrentCell.Row.Question.Data.FilterByX().Size",
                    "     Debug.Trace(\"*** \" + CurrentCell.X )",
                    "\t Debug.Trace(\"My sig is \" + dValue )"
                ],
                "version" : "5.3.5.0"
            }
        ],
        "responses" : [
            {
                "ns" : "aggregatedlanguage",
                "accessor" : "response"
            },
            {
                "name" : "Caption",
                "ns" : "aggregatedlanguage",
                "base" : "property",
                "type" : "array",
                "desc" : "Returns an array with the caption of responses in the collection",
                "examples" : "gender.Responses.Caption ' => {\"Man\"; \"Woman\"}",
                "version" : "5.3.5.0"
            },
            {
                "name" : "ToString",
                "ns" : "aggregatedlanguage",
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
                "version" : "5.3.5.0"
            },
            {
                "name" : "TypeOf",
                "ns" : "aggregatedlanguage",
                "base" : "method",
                "type" : "string",
                "desc" : "Returns the type of the current object / variable",
                "examples" : "gender.Responses.TypeOf() ' => \"responses\"",
                "version" : "5.3.5.0"
            }
        ],
        "questions" : [
            {
                "ns" : "aggregatedlanguage",
                "accessor" : "question"
            }
        ]
    }
}, true);

});
