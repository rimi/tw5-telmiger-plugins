/*\
title: $:/plugins/telmiger/lib/rpn.js
type: application/javascript
module-type: macro

Macro to execute simple calculations in reverse Polish notation
Documentation see https://tid.li/tw5/plugins.html
Version 0.6.2
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Information about this macro
*/

exports.name = "rpn";

exports.params = [
	{name: "a"},
	{name: "b"},
        {name: "operation", default: "+"},
        {name: "decimals", default: ""},
        {name: "precision", default: ""},
        {name: "locale", default: "false"},
        {name: "sd", default: "."},
        {name: "st", default: ""}
];

/*
Wikify
*/
function wikifyText(t) {
	var Parser = $tw.wiki.parseText("text/vnd.tiddlywiki",t,{
			parseAsInline: true
		});
	var WidgetNode = $tw.wiki.makeWidget(Parser,{
			document: $tw.fakeDocument
		});
	var Container = $tw.fakeDocument.createElement("div");
	WidgetNode.render(Container,null);
	return Container.textContent;
}

/*
Format decimals and (TODO!) thousands
*/
function formatNumber(value,sd,st) {
	let string = value.toString();
	// string = string; // TODO separator for thousands
	return string.replace(".",sd); // separator for decimals
}

/*
Formatting with locale
*/
function formatLocale(value,decimals,precision,locale) { 
	let result = "NaN";
	if(decimals == "" || decimals >= 0) {
		let minFracDig = (precision == "p" ? decimals : "");
		result = value.toLocaleString(locale, { minimumFractionDigits: minFracDig });
	}
	else {
		result = "invalid decimals";
	}
	return result;
}

/*
Precision for decimals
*/
function addPrecisionDecimals(result,decimals) { 
    let di = parseInt(decimals);
    let rInteger = result.toString().split('.')[0].length;
    let p = rInteger + di;
    if(p > 0 && p < 101) {
	result = result.toPrecision(p);
    }
    else {
        result = "invalid decimals";
    }
    return result;
}

/*
Random numbers including a and b
*/
function randomInteger(a,b) {
	let min = Math.ceil(a);
	let max = Math.floor(b + 1);
	return Math.floor(Math.random() * (max - min)) + min; 
}

/*
Math
*/
function calculate(a,b,operation) {
    let result = "NaN";
    switch(operation) {
        case "-":
            result = a - b;
            break;
        case "*":
            result = a * b;
            break;
        case "/":
            result = a / b;
            break;
        case "%":
            result = a % b;
            break;
        default:
            result = a + b;
    }
    return result;
}

/*
Run the macro
*/
exports.run = function(a,b,operation,decimals,precision,locale,sd,st) {
	let aw = wikifyText(a);
	let bw = wikifyText(b);
	let result = "";
	if(operation == "&") {
		result = wikifyText(a + b);
	}
	else {
		// prepare values
		var af = aw.replace(",",".");
		var bf = bw.replace(",",".");
		af = (af == "pi" ? Math.PI : parseFloat(af));
		bf = (bf == "pi" ? Math.PI : parseFloat(bf));
		// do the math
		result = calculate(af,bf,operation);
		// precision modes
		if(precision == "r") {
			result = randomInteger(af,bf); 
		}
		else if(precision == "p" && locale == "false") {
			result = addPrecisionDecimals(result,decimals);
		}
		else if(precision == "c") {
			result = Math.ceil(result);
		}
		else if(precision == "f") {
			result = Math.floor(result);
		}
		else if(precision != "" && locale == "false") {
		// formatLocale ignores precision values other than p
			result = "invalid precision";
		}
		// if precision is not defined, round based on (max.) decimals
		else if(decimals != "") {
			var di = parseInt(decimals);
			result = Math.round(result * Math.pow(10, di)) / Math.pow(10, di);            
		}
		// format output
		if(locale != "false") {
			result = formatLocale(result,decimals,precision,locale);
		}
		else {
			result = formatNumber(result,sd,st);
		}
	}
	return result;
};

})();
