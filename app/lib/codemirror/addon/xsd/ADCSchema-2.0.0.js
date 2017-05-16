/*
* This code is automatically generated by the schemaGenerator.js
* Please avoid to modify it manually, instead use the gulp task
* stored in AskiaScriptEditor project
*/
CodeMirror.xsdSchemas = CodeMirror.xsdSchemas || {};
CodeMirror.xsdSchemas["http://www.askia.com/2.0.0/ADCSchema"] = {
  schema : {
    "root": "control",
    "tags": [
        {
            "name": "control",
            "children": [
                "info",
                "outputs",
                "properties"
            ],
            "desc": "Root node of the ADC definition.",
            "attrs": [
                {
                    "name": "version",
                    "desc": "Version number of the ADC format definition.\r\n            (Not the version of the control but the version of the ADC format)",
                    "values": [
                        {
                            "name": "2.0.0",
                            "desc": "Based version of the ADC."
                        }
                    ]
                },
                {
                    "name": "askiaCompat",
                    "desc": "Compatibility version with Askia product."
                }
            ]
        },
        {
            "name": "info",
            "children": [
                "guid",
                "name",
                "version",
                "date",
                "categories",
                "description",
                "author",
                "company",
                "site",
                "helpURL",
                "style",
                "constraints"
            ],
            "desc": "Meta-data of the ADC."
        },
        {
            "name": "guid",
            "children": [],
            "desc": "Unique identifier of the ADC control.\r\n              Should be share accross version of the same ADC."
        },
        {
            "name": "name",
            "children": [],
            "desc": "User friendly name of the ADC."
        },
        {
            "name": "version",
            "children": [],
            "desc": "Version of the ADC.\r\n              This version must contains at least one digit and maximum 3 digits separates with a dot period (ex: 1, 1.0, 1.0.1).\r\n              It could also contains an extra version information such as 'alpha', 'beta' or 'rc' optionally follow by a number (ex: 1.alpha2, 1.0.beta10, 1.0.1.rc3)."
        },
        {
            "name": "date",
            "children": [],
            "desc": "Release date of the ADC."
        },
        {
            "name": "categories",
            "children": [
                "category"
            ],
            "desc": "List the categories of the ADC."
        },
        {
            "name": "category",
            "children": [],
            "desc": "Freeform text which indicates the category of the ADC (ex: Sliders, Flash ...)."
        },
        {
            "name": "description",
            "children": [],
            "desc": "Describes the ADC."
        },
        {
            "name": "author",
            "children": [],
            "desc": "Name of the ADC author(s)."
        },
        {
            "name": "company",
            "children": [],
            "desc": "Name of the company who provide the ADC."
        },
        {
            "name": "site",
            "children": [],
            "desc": "URL to the author/company web site."
        },
        {
            "name": "helpURL",
            "children": [],
            "desc": "URL to the help file of the ADC."
        },
        {
            "name": "style",
            "children": [],
            "desc": "Default size of the ADC, mostly use for the ADC-Flash.",
            "attrs": [
                {
                    "name": "width",
                    "desc": "Width of control in pixel."
                },
                {
                    "name": "height",
                    "desc": "Height of control in pixel."
                }
            ]
        },
        {
            "name": "constraints",
            "children": [
                "constraint"
            ],
            "desc": "Constraints to indicates the allowed context of the ADC."
        },
        {
            "name": "constraint",
            "children": [],
            "desc": "Define the constraint on a given context such as questions, responses or controls.",
            "attrs": [
                {
                    "name": "on",
                    "desc": "Indicate the type of the constraint.",
                    "values": [
                        {
                            "name": "questions",
                            "desc": "Use to indicate the constraint on questions,\r\n                  such as the type of allowed questions."
                        },
                        {
                            "name": "responses",
                            "desc": "Use to indicate the constraint on responses,\r\n                  such as the min and max allowed responses."
                        },
                        {
                            "name": "controls",
                            "desc": "Use to indicate the constraint on controls,\r\n                  such as the type of allowed controls."
                        }
                    ]
                },
                {
                    "name": "chapter",
                    "desc": "Use for the constraint on questions, indicates the if the ADC is allowed on chapter."
                },
                {
                    "name": "single",
                    "desc": "Use for the constraint on questions, indicates the if the ADC is allowed on single closed questions."
                },
                {
                    "name": "multiple",
                    "desc": "Use for the constraint on questions, indicates the if the ADC is allowed on multi-coded question."
                },
                {
                    "name": "numeric",
                    "desc": "Use for the constraint on questions, indicates the if the ADC is allowed on numeric questions."
                },
                {
                    "name": "open",
                    "desc": "Use for the constraint on questions, indicates the if the ADC is allowed on open-ended questions."
                },
                {
                    "name": "date",
                    "desc": "Use for the constraint on questions, indicates the if the ADC is allowed on date questions."
                },
                {
                    "name": "requireParentLoop",
                    "desc": "Use for the constraint on questions, indicates the question require a parent loop."
                },
                {
                    "name": "min",
                    "desc": "Use for the constraint on responses, indicates the minimum of allowed responses."
                },
                {
                    "name": "max",
                    "desc": "Use for the constraint on responses, indicates the maximum of allowed responses."
                },
                {
                    "name": "label",
                    "desc": "Use for the constraint on controls, indicates if the ADC is allowed on label controls."
                },
                {
                    "name": "textbox",
                    "desc": "Use for the constraint on controls, indicates if the ADC is allowed on text box controls."
                },
                {
                    "name": "listbox",
                    "desc": "Use for the constraint on controls, indicates if the ADC is allowed on list box controls (combobox and list)."
                },
                {
                    "name": "checkbox",
                    "desc": "Use for the constraint on controls, indicates if the ADC is allowed on checkbox controls."
                },
                {
                    "name": "radiobutton",
                    "desc": "Use for the constraint on controls, indicates if the ADC is allowed on radio button controls."
                },
                {
                    "name": "responseblock",
                    "desc": "Use for the constraint on controls, indicates if the ADC is allowed on response block."
                }
            ]
        },
        {
            "name": "outputs",
            "children": [
                "output"
            ],
            "desc": "List all possible ADC's outputs.\r\n        A condition could be specify for each outputs to make it alternative.",
            "attrs": [
                {
                    "name": "defaultOutput",
                    "desc": "Indicates the id of default output to use when none of the output conditions matches.\r\n            It is require as the latest output fallback."
                }
            ]
        },
        {
            "name": "output",
            "children": [
                "description",
                "condition",
                "content"
            ],
            "desc": "Output of the ADC.",
            "attrs": [
                {
                    "name": "id",
                    "desc": "Unique identifier of the output.\r\n            It use on the defaultOutput attribute of the outputs element."
                },
                {
                    "name": "defaultGeneration",
                    "desc": "Indicates if the system must generate or not the default controls."
                },
                {
                    "name": "maxIterations",
                    "desc": "Only for question(s) inside a loop.\r\n            Indicates the maximum of iterations that could be handle by the ADC.\r\n            If a bound value is set:\r\n            - On the first or middle iterations, the engine will not generate remain merge controls on the page\r\n            - On the last iteration, the engine will generate the remain merge controls on the page"
                }
            ]
        },
        {
            "name": "description",
            "children": [],
            "desc": "Describes the element"
        },
        {
            "name": "condition",
            "children": [],
            "desc": "AskiaScript condition to use the current element."
        },
        {
            "name": "content",
            "children": [
                "yield",
                "attribute"
            ],
            "desc": "Content of the specify output.",
            "attrs": [
                {
                    "name": "fileName",
                    "desc": "File use to generate the content."
                },
                {
                    "name": "type",
                    "desc": "Indicates the type of content.\r\n            According to this type, the system will automatically generate\r\n            the proper HTML fragment unless the &lt;yield&gt; is specify.",
                    "values": [
                        {
                            "name": "flash",
                            "desc": "Flash content. Will be inserted using &lt;object /&gt; tag.\r\n                  The content must be static or share."
                        },
                        {
                            "name": "css",
                            "desc": "CSS content. Will be inserted using &lt;link href /&gt; tag when static or share\r\n                  or using the &lt;style&gt;&lt;/style&gt; tag when dynamic."
                        },
                        {
                            "name": "html",
                            "desc": "HTML content.\r\n                  Will be inserted as it is or interpreted when it's dynamic."
                        },
                        {
                            "name": "javascript",
                            "desc": "Javascript content. Will be inserted using the &lt;script src /&gt; tag when static or share\r\n                  or using &lt;script&gt;&lt;/script&gt; tag when dynamic."
                        },
                        {
                            "name": "image",
                            "desc": "Image content. Will be inserted using the &lt;img src /&gt; tag.\r\n                  The content must be static or share."
                        },
                        {
                            "name": "video",
                            "desc": "Video content. Will be inserted using the &lt;video src /&gt; tag.\r\n                  The content must be static or share."
                        },
                        {
                            "name": "audio",
                            "desc": "Audio content. Will be inserted using the &lt;audio src /&gt; tag.\r\n                  The content must be static or share."
                        },
                        {
                            "name": "binary",
                            "desc": "Arbitrary binary file.\r\n                  Will be inserted according to the specify &lt;yield&gt; tag.\r\n                  The &lt;yield&gt; should be specified using a binary content otherwize the system will not create an output."
                        },
                        {
                            "name": "text",
                            "desc": "Text-based file.\r\n                  Will be inserted as it is or interpreted when it's dynamic."
                        }
                    ]
                },
                {
                    "name": "mode",
                    "desc": "Indicate how the content will be treat and where the system should find the content file.",
                    "values": [
                        {
                            "name": "share",
                            "desc": "The share content is always associated with a file and must be place in the /Resources/Share/ folder of the ADC.\r\n                  The share content will be extract in the resources folder of the survey /Resources/SurveyName/.\r\n                  This kind of content, could be share accross ADCs and will not be overrides when it already exist in the folder."
                        },
                        {
                            "name": "static",
                            "desc": "The static content is always associated with a file and must be place in the /Resources/Static/ folder of the ADC.\r\n                  The static content will be extract in the resources folder of the ADC /Resources/SurveyName/ADCname/."
                        },
                        {
                            "name": "dynamic",
                            "desc": "The dynamic content could be file (text based) or in-line code define in the definition of the content.\r\n                  It could embed AskiaScript to execute.\r\n                  When the content is a file, it must be place in the /Resources/Dynamic folder of the ADC.\r\n                  The dynamic content will not be extract but load in memory."
                        }
                    ]
                },
                {
                    "name": "position",
                    "desc": "Indicates how and where the system must render the current content.",
                    "values": [
                        {
                            "name": "none",
                            "desc": "The resource will not be rendered.\r\n                  But it's still available through HTTP request."
                        },
                        {
                            "name": "head",
                            "desc": "The resource will be inserted in the head section of the HTML document.\r\n                  Mostly use for CSS stylesheet."
                        },
                        {
                            "name": "placeholder",
                            "desc": "The resource will be inserted at the position of the ADC control.\r\n                  Mostly use for the HTML injection."
                        },
                        {
                            "name": "foot",
                            "desc": "The resource will be inserted at the end of the document, just before the end of the closed body tag.\r\n                  Mostly use for javascript insertion."
                        }
                    ]
                }
            ]
        },
        {
            "name": "attribute",
            "children": [
                "value"
            ],
            "desc": "Additional attribute to add or to overwrite in the auto-generated tag.\r\n        When &lt;yield&gt; is present the attribute is not take in account.",
            "attrs": [
                {
                    "name": "name",
                    "desc": "Name of the attribute."
                }
            ]
        },
        {
            "name": "value",
            "children": [],
            "desc": "Value of the attribute.\r\n        This value could be dynamic, embed AskiaScript code."
        },
        {
            "name": "yield",
            "children": [],
            "desc": "Dynamic string which indicates how the content must be rendered.\r\n        It override the built-in HTML render by the system.\r\n        Must be use for the non-manageed file, such as binary or text"
        },
        {
            "name": "properties",
            "children": [
                "category",
                "property"
            ],
            "desc": "List of properties accessible through the user interface."
        },
        {
            "name": "category",
            "children": [
                "property"
            ],
            "desc": "Category of the properties.",
            "attrs": [
                {
                    "name": "id",
                    "desc": "Unique id of the category."
                },
                {
                    "name": "name",
                    "desc": "User friendly name of the category to show on the interface."
                },
                {
                    "name": "collapsed",
                    "desc": "Indicates if the category should be collapsed by default."
                }
            ]
        },
        {
            "name": "property",
            "children": [
                "description",
                "value",
                "options"
            ],
            "desc": "Property accessible through the user interface.",
            "attrs": [
                {
                    "name": "id",
                    "desc": "Unique id of the property to access on it using the AskiaScript.\r\n              This id should not be a reserved id.\r\n              See &lt;globalproperty&gt;"
                },
                {
                    "name": "name",
                    "desc": "User friendly name of the property to show on the interface."
                },
                {
                    "name": "type",
                    "desc": "Type of the property.",
                    "values": [
                        {
                            "name": "string",
                            "desc": "Property as string.\r\n                    The string could be validate against a regular expression using the pattern attribute."
                        },
                        {
                            "name": "number",
                            "desc": "Property as number.\r\n                    The number could be restricted using the min/max/decimal attribute."
                        },
                        {
                            "name": "boolean",
                            "desc": "Property as boolean.\r\n                    The value must be true or false."
                        },
                        {
                            "name": "color",
                            "desc": "Property as color.\r\n                    The format of the color could be specify using the colorFormat attribute."
                        },
                        {
                            "name": "file",
                            "desc": "Property as string.\r\n                    Indicate the name of a resource file already register.\r\n                    This file must be on the survey and accessible through the url ../Resources/[Survey name]/"
                        },
                        {
                            "name": "question",
                            "desc": "Property as question.\r\n                    Indicate question that could be used in the current ADC."
                        }
                    ]
                },
                {
                    "name": "mode",
                    "desc": "Indicate if the value of the property could or not embed AskiaScript code.",
                    "values": [
                        {
                            "name": "static",
                            "desc": "The static value is use as it is."
                        },
                        {
                            "name": "dynamic",
                            "desc": "The dynamic value will be evaluated before his usage.\r\n                    If the value return by the evaluation doesn't produce an expected value\r\n                    according to the min, max, decimal, pattern, fileExtension...\r\n                    then the default value will be used."
                        }
                    ]
                },
                {
                    "name": "require",
                    "desc": "Indicate if a value is require for this property."
                },
                {
                    "name": "pattern",
                    "desc": "Use with the type string, the regular expression pattern will be use to validate the value entered."
                },
                {
                    "name": "min",
                    "desc": "Use with the type number. Indicates the minimum allowed value."
                },
                {
                    "name": "max",
                    "desc": "Use with the type number. Indicate the maximum allowed value."
                },
                {
                    "name": "decimal",
                    "desc": "Use with the type number. Indicate the maximum number of decimal digits allowed."
                },
                {
                    "name": "colorFormat",
                    "desc": "Use with the type color. Indicate the format of the color.",
                    "values": [
                        {
                            "name": "rgb",
                            "desc": "Color in RGB format (Red, Green, Blue)\r\n                    (RR,GG,BB)"
                        },
                        {
                            "name": "rgba",
                            "desc": "Color in RGBA format (Red, Green, Blue, Alpha)\r\n                    (RR,GG,BB,AA)"
                        },
                        {
                            "name": "hexa",
                            "desc": "Color in Hexadecimal format\r\n                    (#rrggbb)"
                        }
                    ]
                },
                {
                    "name": "fileExtension",
                    "desc": "Use with the type file. Indicate the allowed extension of the file."
                }
            ]
        },
        {
            "name": "property",
            "children": [
                "description",
                "value",
                "options"
            ],
            "desc": "Property accessible through the user interface.",
            "attrs": [
                {
                    "name": "id",
                    "desc": "Unique id of the property to access on it using the AskiaScript.\r\n              This id should not be a reserved id.\r\n              See &lt;globalproperty&gt;"
                },
                {
                    "name": "name",
                    "desc": "User friendly name of the property to show on the interface."
                },
                {
                    "name": "type",
                    "desc": "Type of the property.",
                    "values": [
                        {
                            "name": "string",
                            "desc": "Property as string.\r\n                    The string could be validate against a regular expression using the pattern attribute."
                        },
                        {
                            "name": "number",
                            "desc": "Property as number.\r\n                    The number could be restricted using the min/max/decimal attribute."
                        },
                        {
                            "name": "boolean",
                            "desc": "Property as boolean.\r\n                    The value must be true or false."
                        },
                        {
                            "name": "color",
                            "desc": "Property as color.\r\n                    The format of the color could be specify using the colorFormat attribute."
                        },
                        {
                            "name": "file",
                            "desc": "Property as string.\r\n                    Indicate the name of a resource file already register.\r\n                    This file must be on the survey and accessible through the url ../Resources/[Survey name]/"
                        },
                        {
                            "name": "question",
                            "desc": "Property as question.\r\n                    Indicate question that could be used in the current ADC."
                        }
                    ]
                },
                {
                    "name": "mode",
                    "desc": "Indicate if the value of the property could or not embed AskiaScript code.",
                    "values": [
                        {
                            "name": "static",
                            "desc": "The static value is use as it is."
                        },
                        {
                            "name": "dynamic",
                            "desc": "The dynamic value will be evaluated before his usage.\r\n                    If the value return by the evaluation doesn't produce an expected value\r\n                    according to the min, max, decimal, pattern, fileExtension...\r\n                    then the default value will be used."
                        }
                    ]
                },
                {
                    "name": "require",
                    "desc": "Indicate if a value is require for this property."
                },
                {
                    "name": "pattern",
                    "desc": "Use with the type string, the regular expression pattern will be use to validate the value entered."
                },
                {
                    "name": "min",
                    "desc": "Use with the type number. Indicates the minimum allowed value."
                },
                {
                    "name": "max",
                    "desc": "Use with the type number. Indicate the maximum allowed value."
                },
                {
                    "name": "decimal",
                    "desc": "Use with the type number. Indicate the maximum number of decimal digits allowed."
                },
                {
                    "name": "colorFormat",
                    "desc": "Use with the type color. Indicate the format of the color.",
                    "values": [
                        {
                            "name": "rgb",
                            "desc": "Color in RGB format (Red, Green, Blue)\r\n                    (RR,GG,BB)"
                        },
                        {
                            "name": "rgba",
                            "desc": "Color in RGBA format (Red, Green, Blue, Alpha)\r\n                    (RR,GG,BB,AA)"
                        },
                        {
                            "name": "hexa",
                            "desc": "Color in Hexadecimal format\r\n                    (#rrggbb)"
                        }
                    ]
                },
                {
                    "name": "fileExtension",
                    "desc": "Use with the type file. Indicate the allowed extension of the file."
                }
            ]
        },
        {
            "name": "description",
            "children": [],
            "desc": "Describes the aim of the property."
        },
        {
            "name": "value",
            "children": [],
            "desc": "Default value of the property."
        },
        {
            "name": "value",
            "children": [],
            "desc": "Default value of the property."
        },
        {
            "name": "options",
            "children": [
                "option"
            ],
            "desc": "Enumerates all allowed values."
        },
        {
            "name": "option",
            "children": [],
            "desc": "Allowed choice.",
            "attrs": [
                {
                    "name": "value",
                    "desc": "Value of the option."
                },
                {
                    "name": "text",
                    "desc": "User friendly text of the option."
                }
            ]
        }
    ]
},
  hintSchemaInfo : {
    "!top": [
        "control"
    ],
    "control": {
        "children": [
            "info",
            "outputs",
            "properties"
        ],
        "attrs": {
            "version": [
                "2.0.0"
            ],
            "askiaCompat": null
        }
    },
    "info": {
        "children": [
            "guid",
            "name",
            "version",
            "date",
            "categories",
            "description",
            "author",
            "company",
            "site",
            "helpURL",
            "style",
            "constraints"
        ]
    },
    "guid": {
        "children": []
    },
    "name": {
        "children": []
    },
    "version": {
        "children": []
    },
    "date": {
        "children": []
    },
    "categories": {
        "children": [
            "category"
        ]
    },
    "category": {
        "children": [
            "property"
        ],
        "attrs": {
            "id": null,
            "name": null,
            "collapsed": null
        }
    },
    "description": {
        "children": []
    },
    "author": {
        "children": []
    },
    "company": {
        "children": []
    },
    "site": {
        "children": []
    },
    "helpURL": {
        "children": []
    },
    "style": {
        "children": [],
        "attrs": {
            "width": null,
            "height": null
        }
    },
    "constraints": {
        "children": [
            "constraint"
        ]
    },
    "constraint": {
        "children": [],
        "attrs": {
            "on": [
                "questions",
                "responses",
                "controls"
            ],
            "chapter": null,
            "single": null,
            "multiple": null,
            "numeric": null,
            "open": null,
            "date": null,
            "requireParentLoop": null,
            "min": null,
            "max": null,
            "label": null,
            "textbox": null,
            "listbox": null,
            "checkbox": null,
            "radiobutton": null,
            "responseblock": null
        }
    },
    "outputs": {
        "children": [
            "output"
        ],
        "attrs": {
            "defaultOutput": null
        }
    },
    "output": {
        "children": [
            "description",
            "condition",
            "content"
        ],
        "attrs": {
            "id": null,
            "defaultGeneration": null,
            "maxIterations": null
        }
    },
    "condition": {
        "children": []
    },
    "content": {
        "children": [
            "yield",
            "attribute"
        ],
        "attrs": {
            "fileName": null,
            "type": [
                "flash",
                "css",
                "html",
                "javascript",
                "image",
                "video",
                "audio",
                "binary",
                "text"
            ],
            "mode": [
                "share",
                "static",
                "dynamic"
            ],
            "position": [
                "none",
                "head",
                "placeholder",
                "foot"
            ]
        }
    },
    "attribute": {
        "children": [
            "value"
        ],
        "attrs": {
            "name": null
        }
    },
    "value": {
        "children": []
    },
    "yield": {
        "children": []
    },
    "properties": {
        "children": [
            "category",
            "property"
        ]
    },
    "property": {
        "children": [
            "description",
            "value",
            "options"
        ],
        "attrs": {
            "id": null,
            "name": null,
            "type": [
                "string",
                "number",
                "boolean",
                "color",
                "file",
                "question"
            ],
            "mode": [
                "static",
                "dynamic"
            ],
            "require": null,
            "pattern": null,
            "min": null,
            "max": null,
            "decimal": null,
            "colorFormat": [
                "rgb",
                "rgba",
                "hexa"
            ],
            "fileExtension": null
        }
    },
    "options": {
        "children": [
            "option"
        ]
    },
    "option": {
        "children": [],
        "attrs": {
            "value": null,
            "text": null
        }
    }
}
};