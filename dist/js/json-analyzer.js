(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitJsonNode = exports.visitJsonObject = exports.visitJsonArray = exports.getJsonDataTypeClass = exports.getJsonDataType = exports.JsonDataTypeClass = exports.JsonDataType = void 0;
var JsonDataType;
(function (JsonDataType) {
    JsonDataType["string"] = "string";
    JsonDataType["number"] = "number";
    JsonDataType["object"] = "object";
    JsonDataType["array"] = "array";
    JsonDataType["boolean"] = "boolean";
    JsonDataType["null"] = "null";
})(JsonDataType = exports.JsonDataType || (exports.JsonDataType = {}));
var JsonDataTypeClass;
(function (JsonDataTypeClass) {
    JsonDataTypeClass["value"] = "value";
    JsonDataTypeClass["object"] = "object";
    JsonDataTypeClass["array"] = "array";
})(JsonDataTypeClass = exports.JsonDataTypeClass || (exports.JsonDataTypeClass = {}));
function getJsonDataType(value) {
    if (value === null)
        return JsonDataType.null;
    if (typeof value === "string")
        return JsonDataType.string;
    if (typeof value === "number")
        return JsonDataType.number;
    if (typeof value === "boolean")
        return JsonDataType.boolean;
    if (typeof value === "object") {
        return Array.isArray(value) ? JsonDataType.array : JsonDataType.object;
    }
    throw new Error("Unknown JSON data type: " + value);
}
exports.getJsonDataType = getJsonDataType;
function getJsonDataTypeClass(value) {
    const dataType = getJsonDataType(value);
    switch (dataType) {
        case JsonDataType.array:
            return JsonDataTypeClass.array;
        case JsonDataType.object:
            return JsonDataTypeClass.object;
        case JsonDataType.null:
        case JsonDataType.string:
        case JsonDataType.number:
        case JsonDataType.boolean:
            return JsonDataTypeClass.value;
        default:
            throw new Error("Unknown JSON data type: " + dataType);
    }
}
exports.getJsonDataTypeClass = getJsonDataTypeClass;
function visitVisitors(dataType, visitors) {
    const dataTypeClass = getJsonDataTypeClass(dataType);
    const dataTypeVisitor = visitors[dataType];
    const dataTypeClassVisitor = visitors[dataTypeClass];
    const anyVisitor = visitors["any"];
    // return a function that will call all the visitors
    return function visitAllVisitors(path, value) {
        if (dataTypeVisitor)
            dataTypeVisitor(path, value);
        if (dataTypeClassVisitor)
            dataTypeClassVisitor(path, value);
        if (anyVisitor)
            anyVisitor(path, value);
    };
}
function visitJsonArray(array, path, visitTypes) {
    for (let [index, arrayValue] of array.map((v, i) => [i, v])) {
        visitJsonNode(arrayValue, path + '[' + index + ']', visitTypes);
    }
}
exports.visitJsonArray = visitJsonArray;
function visitJsonObject(obj, path, visitTypes) {
    for (let [key, objectValue] of Object.entries(obj)) {
        visitJsonNode(objectValue, path + '.' + key, visitTypes);
    }
}
exports.visitJsonObject = visitJsonObject;
function visitJsonNode(obj, path, visitTypes) {
    const dataType = getJsonDataType(obj);
    if (path[0] === ".")
        path = path.slice(1);
    const action = visitVisitors(dataType, visitTypes);
    action(path, obj);
    switch (dataType) {
        case JsonDataType.array:
            visitJsonArray(obj, path, visitTypes);
            break;
        case JsonDataType.object:
            visitJsonObject(obj, path, visitTypes);
            break;
    }
}
exports.visitJsonNode = visitJsonNode;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_analyzer_module_1 = require("./json-analyzer-module");
function analyze() {
    const textArea = document.getElementById("json");
    const json = textArea.value;
    visitJsonDocument(json);
}
function demo() {
    const jsonSource = document.getElementById("sample-json").innerHTML;
    const json = JSON.stringify(JSON.parse(jsonSource), null, 2);
    const textArea = document.getElementById("json");
    textArea.value = json;
    analyze();
}
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("analyzeButton").addEventListener("click", analyze);
    document.getElementById("demoButton").addEventListener("click", demo);
});
function visitJsonDocument(json) {
    var obj = JSON.parse(json);
    function visitArray(path, value) {
        console.log('visiting array', path, value);
        const arrayValues = value.filter((v) => v);
        const arrayPropertyTypeClasses = arrayValues
            .map((v) => (v, (0, json_analyzer_module_1.getJsonDataTypeClass)(v)));
        const itemType = arrayPropertyTypeClasses[0];
        if (!arrayPropertyTypeClasses.every((v) => v === itemType)) {
            console.log('Not all item types are the same.  Not a good source for table data');
            return;
        }
        if (itemType !== json_analyzer_module_1.JsonDataTypeClass.object) {
            console.log('Array items are not objects.  Not a good source for table data');
            return;
        }
        const allKeys = {};
        function getPropertyNames(path, obj) {
            for (let [key, objectValue] of Object.entries(obj)) {
                const dataType = (0, json_analyzer_module_1.getJsonDataType)(objectValue);
                const propertyPath = path + '.' + key;
                if (dataType !== json_analyzer_module_1.JsonDataType.null) {
                    const value = allKeys[propertyPath] || [];
                    if (!value.includes(dataType)) {
                        value.push(dataType);
                    }
                    allKeys[propertyPath] = value;
                }
            }
        }
        for (let arrayValue of arrayValues) {
            getPropertyNames(path, arrayValue);
        }
        function mapToClassification(dataTypes) {
            if (dataTypes.length === 1) {
                return dataTypes[0];
            }
            if (dataTypes.includes(json_analyzer_module_1.JsonDataType.array) || dataTypes.includes(json_analyzer_module_1.JsonDataType.object)) {
                return "any";
            }
            return "value";
        }
        function reduceTypes(previous, current, index) {
            const [key, dataTypes] = current;
            previous[key] = mapToClassification(dataTypes);
            return previous;
        }
        const results = Object.entries(allKeys).reduce(reduceTypes, {});
        console.log('allKeys', allKeys);
        console.log('results', results);
    }
    const visitors = { "array": visitArray };
    console.log('prepare to visit');
    (0, json_analyzer_module_1.visitJsonNode)(obj, "", visitors);
    console.log('done visiting');
}

},{"./json-analyzer-module":1}]},{},[2]);
