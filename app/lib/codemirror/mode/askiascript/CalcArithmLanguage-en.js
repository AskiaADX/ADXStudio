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
    "CELL" : "cell",    
    "PROFILEITEM" : "profileitem",    
    "TABLE" : "table"
});

askiaScript.extend(askiaScript.i18n, {
    "types" : {
        "cell" : "Cell",        
        "profileitem" : "ProfileItem",        
        "table" : "Table"
    },    
    "core" : {
        "cell" : {
            "ns" : "calcarithmlanguage",            
            "desc" : "Object used to get (and sometimes set) information about the cell of a cross-tab when using calculation arithmetics or cleaning scripts",            
            "version" : "5.3.5.0"
        },        
        "profileitem" : {
            "ns" : "calcarithmlanguage",            
            "desc" : "Object used to define a question and a response: a cell is usually associated to a row a column and edges which each correspond to a ProfileItem",            
            "version" : "5.3.5.0"
        },        
        "table" : {
            "ns" : "calcarithmlanguage",            
            "desc" : "Object used to get (and sometimes set) information about the result of a cross-tab when using calculation arithmetics or cleaning scripts",            
            "version" : "5.3.5.0"
        }
    }
}, true);

askiaScript.extend(askiaScript.lexical, {
    "namespaces" : {
        "calcarithmlanguage" : {
            "name" : "CalcArithmLanguage",            
            "ns" : "calcarithmlanguage",            
            "dependencies" : [
                "aggregatedlanguage"
            ]
        }
    },    
    "builtin" : [
        {
            "name" : "Calc",            
            "ns" : "calcarithmlanguage",            
            "base" : "function",            
            "type" : "number",            
            "args" : [
                {
                    "name" : "inidcates",                    
                    "type" : "number",                    
                    "desc" : "the index of the calculation"
                }
            ],            
            "desc" : "This allows to access easily all other calculations related to this cell - note that you cannot refer to another arithmetic calculation placed after as the calculation has not been made when you are evaluating this",            
            "examples" : [
                "\tCalc(1) / 100 * 55000000 ' bring the percentage to 55 000 000",                
                "\t  "
            ]
        },        
        {
            "name" : "CalcStr",            
            "ns" : "calcarithmlanguage",            
            "base" : "function",            
            "type" : "string",            
            "args" : [
                {
                    "name" : "inidcates",                    
                    "type" : "number",                    
                    "desc" : "the index of the calculation"
                }
            ],            
            "desc" : [
                "\tThis allows to access easily all other calculations related to this cell - note that you cannot refer to another arithmetic calculation placed after as the calculation has not been made when you are evaluating this",                
                "\tThe return value is a string"
            ],            
            "examples" : "\tCalcStr(1) / 100 * 55000000 ' bring the percentage to 55 000 000"
        },        
        {
            "name" : "CurrentCell",            
            "ns" : "calcarithmlanguage",            
            "base" : "const",            
            "type" : "cell",            
            "desc" : "Method called to obtain information about the current cell when using calculation arithmetics",            
            "remarks" : "Not available in cleaning scripts",            
            "examples" : [
                " CurrentCell.X ' => position of the cell in the table",                
                " CurrentCell.Text ' => \"Title\""
            ],            
            "version" : "5.3.5.0"
        },        
        {
            "name" : "CurrentTable",            
            "ns" : "calcarithmlanguage",            
            "base" : "const",            
            "type" : "table",            
            "desc" : "Method called to obtain information about the current table when using calculation arithmetics",            
            "examples" : [
                " CurrentTable.MaxX ' => 20",                
                " CurrentTable.GetCell(1,1).Text ' => \"Title\""
            ],            
            "version" : "5.3.5.0"
        },        
        {
            "name" : "GetTable",            
            "ns" : "calcarithmlanguage",            
            "base" : "function",            
            "type" : "table",            
            "args" : [
                {
                    "name" : "Name",                    
                    "type" : "string",                    
                    "desc" : "indcates the name of the portfolio item in the same portfolio"
                },                
                {
                    "name" : "Page",                    
                    "type" : "string",                    
                    "desc" : "indcates the optional page (1 by default)",                    
                    "opt" : true
                }
            ],            
            "desc" : "This allows to access a table which is placed in the same portfolio",            
            "remarks" : [
                "This is not available in Vista yet",                
                "\t  "
            ],            
            "examples" : "\tGetTable(\"MyOtherTable\",3).GetCell(10,10)",            
            "version" : "5.3.5.0"
        }
    ],    
    "members" : {
        "profileitem" : [
            {
                "name" : "Caption",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "returns the caption associated to the response",                
                "remarks" : [
                    "\treturns \"\" if the ProfileItem is not valid",                    
                    "\t  "
                ],                
                "examples" : "\tCurrentCell.Column.Caption ' => Returns \"Male\" if gender is the question placed in columns"
            },            
            {
                "name" : "Index",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " allows you to know which response you are placed on (in rows, columns or edges) whatever the row/col suppression or sorting did",                    
                    " 0 if the index does not link to a response (a total for instance)",                    
                    " "
                ],                
                "examples" : "\tDim AdvertsingSpend= On ( CurrentCell.Column.Index, 1000,1100,1234,1560,1400)",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "Question",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "question",                
                "desc" : [
                    " returns the question object associated to a current profile item",                    
                    " ",                    
                    " "
                ],                
                "examples" : "\tCurrentCell.Row.Question.Data.Mean()",                
                "version" : "5.3.5.0"
            }
        ],        
        "table" : [
            {
                "name" : "GetCell",                
                "ns" : "calcarithmlanguage",                
                "base" : "method",                
                "type" : "cell",                
                "args" : [
                    {
                        "name" : "X",                        
                        "type" : "number",                        
                        "desc" : "indicating which column (1-based) you want to use"
                    },                    
                    {
                        "name" : "Y",                        
                        "type" : "number",                        
                        "desc" : "indicating which row (1-based) you want to use"
                    }
                ],                
                "desc" : "allows you to access the relevant cell to read or modify its content when possible",                
                "examples" : "\tDim strTitle = CurrentTable.GetCell(1,1,).Text",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "GetColSigLetter",                
                "ns" : "calcarithmlanguage",                
                "base" : "method",                
                "type" : "string",                
                "args" : [
                    {
                        "name" : "X",                        
                        "type" : "number",                        
                        "desc" : "indicating which column (1-based) you want to use"
                    },                    
                    {
                        "name" : "Strength",                        
                        "type" : "number",                        
                        "desc" : "indicating how you want the col-sig letter to appear (2 is the default)",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " allows you to associate a column to a letter so you can display col-sig letter calculated by hand, you lucky askia users!",                    
                    "  Strength Output",                    
                    "\t-1\t-a",                    
                    "\t-2\t-A",                    
                    "\t-3\t-A+",                    
                    "\t1\ta",                    
                    "\t2\tA",                    
                    "\t3\tA+",                    
                    " "
                ],                
                "examples" : [
                    "\tDim strThisCol = CurrentTable.GetColSigLetter( CurrentCell.X )",                    
                    "\tDim strThisColVerySig = CurrentTable.GetColSigLetter( CurrentCell.X,3 )"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "MaxX",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " indicates the last column number in your table (the width)",                    
                    " "
                ],                
                "examples" : [
                    "\tDim i",                    
                    "\tFor i = 1 to CurrentTable.MaxX ",                    
                    "\tNext i"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "MaxY",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " indicates the last row number in your table (the height)",                    
                    " "
                ],                
                "examples" : [
                    "\tDim j",                    
                    "\tFor j = 1 to CurrentTable.MaxY",                    
                    "\tNext j"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "StartX",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " indicates the first column after the title",                    
                    " "
                ],                
                "examples" : [
                    "\tDim i",                    
                    "\tFor i = CurrentTable.StartX to CurrentTable.MaxX ",                    
                    "\tNext i"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "StartY",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " indicates the first row number after the title",                    
                    " "
                ],                
                "examples" : [
                    "\tDim j",                    
                    "\tFor j = CurrentTable.StartY to CurrentTable.MaxY",                    
                    "\tNext j"
                ],                
                "version" : "5.3.5.0"
            }
        ],        
        "cell" : [
            {
                "name" : "Column",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "profileitem",                
                "desc" : "returns the ProfileItem associated with the cell",                
                "examples" : "\tCurrentCell.Column.Caption ' => Returns \"Male\" if gender is the question placed in columns",                
                "alsoSee" : [
                    "Row",                    
                    "Edges"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "Edges",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "profileitemarray",                
                "desc" : "returns the ProfileItems associated with the cells - note that because you can have nested edges, you can have more than one Edge for a cell whereas you only have one row and one column",                
                "examples" : "\tCurrentCell.Edges[1].Caption ' => Returns \"Male\" if gender is the question placed in edges",                
                "alsoSee" : [
                    "Row",                    
                    "Column"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "Row",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "profileitem",                
                "desc" : "returns the ProfileItem associated with the cell in the row",                
                "examples" : "\tCurrentCell.Row.Caption ' => Returns \"Male\" if gender is the question placed in rows",                
                "alsoSee" : [
                    "Column",                    
                    "Edges"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "Text",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " returns the text or the formatted value of a cell",                    
                    " "
                ],                
                "examples" : "\tDim strText = CurrentCell.Text",                
                "alsoSee" : "Value",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "Value",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " returns the numeric value of a cell",                    
                    " if you ask for the value of a capttion (question, response, ...) you will get a nuber indicate the intera;l number of the string",                    
                    " "
                ],                
                "examples" : "\tDim dCounts = CurrentCell.Value",                
                "alsoSee" : "Text",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "X",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " returns the X position of a cell (that is its column) (1-based starting at the top left cell title)",                    
                    " "
                ],                
                "examples" : "\tOn(CurrentCell.X, 10, 20,30, 40)",                
                "alsoSee" : "Y",                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "Y",                
                "ns" : "calcarithmlanguage",                
                "base" : "property",                
                "type" : "number",                
                "desc" : [
                    " returns the Y position of a cell (that is its row) (1-based starting at the top left cell title)",                    
                    " "
                ],                
                "examples" : "\tOn(CurrentCell.Y, 10, 20,30, 40)",                
                "alsoSee" : "X",                
                "version" : "5.3.5.0"
            }
        ],        
        "data" : [
            {
                "name" : "FilterByColumn",                
                "ns" : "calcarithmlanguage",                
                "base" : "method",                
                "type" : "data",                
                "args" : [
                    {
                        "name" : "X",                        
                        "type" : "number",                        
                        "desc" : "optional parameter indicating which column (1-based) you want to use - or the current column if unspecified",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " allows you to filter the data by which response is in the column",                    
                    " the relevant weighting, sub-population and universe are applied"
                ],                
                "examples" : [
                    "\tCurrentCell.Row.Question.Data.FilterByColumn().Size ' => Returns the number of males if we are in the relevant column",                    
                    "\tCurrentCell.Row.Question.Data.FilterByColumn(CurrentTable.StartX + 1).Size ' => Returns the number of males if we are in the relevant column"
                ],                
                "alsoSee" : [
                    "FilterByEdge",                    
                    "FilterByXY",                    
                    "FilterByX",                    
                    "FilterByX"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "FilterByEdge",                
                "ns" : "calcarithmlanguage",                
                "base" : "method",                
                "type" : "data",                
                "args" : [
                    {
                        "name" : "X",                        
                        "type" : "number",                        
                        "desc" : "optional parameter indicating which column (1-based) you want to use - or the current column if unspecified",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " allows you to filter the data by which response is in the edge",                    
                    " the relevant weighting, sub-population and universe are applied"
                ],                
                "examples" : [
                    "\tCurrentCell.Row.Question.Data.FilterByEdge().Size ' => Returns the edge total for the current column",                    
                    "\tCurrentCell.Row.Question.Data.FilterByEdge(5).Size ' => Returns the edge total for 5th column"
                ],                
                "alsoSee" : [
                    "FilterByRow",                    
                    "FilterByXY",                    
                    "FilterByX",                    
                    "FilterByX"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "FilterByX",                
                "ns" : "calcarithmlanguage",                
                "base" : "method",                
                "type" : "data",                
                "args" : [
                    {
                        "name" : "X",                        
                        "type" : "number",                        
                        "desc" : "optional parameter indicating which column (1-based) you want to use - or the current column if unspecified",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " allows you to filter the data by the relevant column and edge item - in other words give you the base for that column",                    
                    " the relevant weighting, sub-population and universe are applied"
                ],                
                "examples" : [
                    "\tCurrentCell.Row.Question.Data.FilterByX().Size ' => Returns the overall total for the current column",                    
                    "\tCurrentCell.Row.Question.Data.FilterByX(5).Size ' => Returns the overall total for 5th column"
                ],                
                "alsoSee" : [
                    "FilterByRow",                    
                    "FilterByEdge",                    
                    "FilterByXY",                    
                    "FilterByY"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "FilterByXY",                
                "ns" : "calcarithmlanguage",                
                "base" : "method",                
                "type" : "data",                
                "args" : [
                    {
                        "name" : "X",                        
                        "type" : "number",                        
                        "desc" : "optional parameter indicating which column (1-based) you want to use - or the current column if unspecified",                        
                        "opt" : true
                    },                    
                    {
                        "name" : "Y",                        
                        "type" : "number",                        
                        "desc" : "optional parameter indicating which row (1-based) you want to use - or the current row if unspecified",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " allows you to filter the data by the relevant row, column and edge item - in other words give you the counts for that cell",                    
                    " the relevant weighting, sub-population and universe are applied"
                ],                
                "examples" : [
                    "\tCurrentCell.Row.Question.Data.FilterByXY().Size ' => Returns the overall total for the current cell",                    
                    "\tCurrentCell.Row.Question.Data.FilterByXY(5,8).Size ' => Returns the overall total for cell 5 to the right, 8 down"
                ],                
                "alsoSee" : [
                    "FilterByRow",                    
                    "FilterByEdge",                    
                    "FilterByX",                    
                    "FilterByY"
                ],                
                "version" : "5.3.5.0"
            },            
            {
                "name" : "FilterByY",                
                "ns" : "calcarithmlanguage",                
                "base" : "method",                
                "type" : "data",                
                "args" : [
                    {
                        "name" : "Y",                        
                        "type" : "number",                        
                        "desc" : "optional parameter indicating which row (1-based) you want to use - or the current row if unspecified",                        
                        "opt" : true
                    }
                ],                
                "desc" : [
                    " allows you to filter the data by the relevant row item - in other words give you the base for that row",                    
                    " the relevant weighting, sub-population and universe are applied"
                ],                
                "examples" : [
                    "\tCurrentCell.Row.Question.Data.FilterByY().Size ' => Returns the overall total for the current row",                    
                    "\tCurrentCell.Row.Question.Data.FilterByY(5).Size ' => Returns the overall total for 5th row"
                ],                
                "alsoSee" : [
                    "FilterByRow",                    
                    "FilterByEdge",                    
                    "FilterByXY",                    
                    "FilterByX"
                ],                
                "version" : "5.3.5.0"
            }
        ]
    }
}, true);

});
