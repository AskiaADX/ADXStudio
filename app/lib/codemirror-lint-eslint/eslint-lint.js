// CodeMirror Lint addon to use ESLint, copyright (c) by Angelo ZERR and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Depends on eslint.js from https://github.com/eslint/eslint

// Modified by Mamadou Sy

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

  var defaultConfig = {
    "ecmaFeatures": {},
    "env": {
        "node" : true,
      	"browser": true,
	  	"commonjs" : true,
      	"amd": true,
		"jquery":true,
        "jasmine":true
    },
    "rules": {
    	"indent" : [2, 4, {SwitchCase: 1}],
    	"block-spacing": 2,
    	"brace-style" : [2, "1tbs"],
    	"camelcase": [2, { properties: "never" }],
    	"callback-return" : [2, ["cb", "callback", "next"]],
    	"comma-spacing": 2,
    	"comma-style": [2, "last"],
    	"consistent-return": 2,
    	"curly": [2, "all"],
    	"default-case": 2,
    	"dot-notation" : [2, { allowKeywords: true }],
    	"eol-last": 2,
    	"eqeqeq": 2,
    	"func-style": [2, "declaration"],
    	"guard-for-in": 2,
    	"key-spacing": 0,
    	"new-cap": 2,
    	"new-parens": 2,
    	"no-array-constructor": 1,
    	"no-caller": 2,
    	"no-console": 0,
    	"no-delete-var": 2,
	    "no-empty-label": 2,
    	"no-eval": 2,
    	"no-extend-native": 2,
    	"no-extra-bind": 2,
    	"no-fallthrough": 2,
    	"no-floating-decimal": 2,
    	"no-implied-eval": 2,
    	"no-invalid-this": 1,
    	"no-iterator": 2,
    	"no-label-var": 2,
    	"no-labels": 2,
    	"no-lone-blocks": 2,
    	"no-loop-func": 2,
    	"no-mixed-spaces-and-tabs": [2, false],
    	"no-multi-spaces": 0,
    	"no-multi-str": 2,
    	"no-native-reassign": 2,
    	"no-nested-ternary": 2,
    	"no-new": 2,
        "no-new-func": 2,
        "no-new-object": 2,
        "no-new-wrappers": 2,
        "no-octal": 2,
        "no-octal-escape": 2,
        "no-process-exit": 2,
        "no-proto": 2,
        "no-redeclare": 2,
        "no-return-assign": 2,
        "no-script-url": 2,
        "no-sequences": 2,
        "no-shadow": 2,
        "no-shadow-restricted-names": 2,
        "no-spaced-func": 2,
        "no-trailing-spaces": 0,
        "no-undef": 2,
        "no-undef-init": 2,
        "no-undefined": 0,
        "no-underscore-dangle": 0,
        "no-unused-expressions": 1,
        "no-unused-vars": [1, {vars: "all", args: "after-used"}],
        "no-use-before-define": 0,
        "no-useless-concat": 2,
        "no-with": 2,
        "quotes":0,
        "radix": 2,
        "semi": 2,
        "semi-spacing": [2, {before: false, after: true}],
        "space-after-keywords": [2, "always"],
        "space-before-blocks": 2,
        "space-before-function-paren": 0,
        "space-infix-ops": 2,
        "space-return-throw-case": 2,
        "space-unary-ops": [2, {words: true, nonwords: false}],
        "spaced-comment": [2, "always", { exceptions: ["-"]}],
        "strict": 0,
        "valid-jsdoc": 0,
        "wrap-iife": 2,
        "yoda": [2, "never"]
    }
  };
    
  function validator(text, options) {
	var result = [], config = defaultConfig;
	var errors = eslint.verify(text, config);
	for (var i = 0; i < errors.length; i++) {
	  var error = errors[i];
	  result.push({message: error.message,
		           severity: getSeverity(error),
		           from: getPos(error, true),
	               to: getPos(error, false)});	
	}
	return result;	  
  }

  CodeMirror.registerHelper("lint", "javascript", validator);

  function getPos(error, from) {
    var line = error.line-1, ch = from ? error.column : error.column+1;
    if (error.node && error.node.loc) {
      line = from ? error.node.loc.start.line -1 : error.node.loc.end.line -1;
      ch = from ? error.node.loc.start.column : error.node.loc.end.column;
    }
    return CodeMirror.Pos(line, ch);
  }
  
  function getSeverity(error) {
	switch(error.severity) {
	  case 1:
	    return "warning";
	  case 2:
		return "error";	    
	  default:
		return "error";
	}    
  }
  
});
