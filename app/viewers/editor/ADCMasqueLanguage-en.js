(function defineLexical() {
  "use strict";

var askiaScript = CodeMirror.askiaScript;

askiaScript.extend(askiaScript.types, {
    "ADC" : "adc",    
    "ADCCONTENT" : "adccontent",    
    "ADCPROPERTY" : "adcproperty"
});

askiaScript.extend(askiaScript.i18n, {
    "types" : {
        "adc" : "ADC",        
        "adccontent" : "ADCContent",        
        "adcproperty" : "ADCProperty"
    },    
    "core" : {
        "adc" : {
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
            "desc" : [
                "\tThis object represent a property exposed by the ADC.",                
                "",                
                "\tIt's mainly used in the ADC 2.0 to retrieves information about a <property> defined in the ADC.",                
                "",                
                "\tThis object is accessible through the CurrentADC.Properties[ Index ] property or the CurrentADC.GetProperty( PropertyId ) method."
            ],            
            "version" : "5.3.3.0"
        }
    }
}, true);

askiaScript.extend(askiaScript.lexical, {
    "builtin" : [
        {
            "name" : "CurrentADC",            
            "base" : "const",            
            "type" : "adc",            
            "desc" : "\tReturn the current running ADC instance.",            
            "examples" : [
                "\tCurrentADC.InstanceId ' => 1",                
                "\tCurrentADC.Name ' => \"my-adc\""
            ],            
            "version" : "5.3.3.0"
        }
    ],    
    "members" : {
        "adcproperty" : [
            {
                "name" : "Id",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "Return the id of the ADC Property",                
                "examples" : "CurrentADC.Properties[1].Id  ' => \"tickColor\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Type",                
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
            }
        ],
        "adc" : [
            {
                "name" : "Contents",                
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
                "name" : "OutputId",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the current output in use.",                
                "examples" : "\tCurrentADC.OutputId ' => \"mobileHTMLOutput\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Properties",                
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
                "name" : "PropValue",                
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
                    "\tIf the value of the variable is an object (like a question), the system calls his ToString() method.",                    
                    "\tIf you want to access the question object associated with the variable use the PropQuestion method instead.",                    
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
            }
        ],
        "adccontent" : [
            {
                "name" : "GetContent",                
                "base" : "property",                
                "type" : "string",                
                "desc" : "\tReturns the file name associated with the content",                
                "examples" : "\tCurrentADC.Contents[1].FileName ' => \"IE-gender-with-fx.css\"",                
                "version" : "5.3.3.0"
            },            
            {
                "name" : "Mode",                
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
        ]
    }
}, true);

}());
