(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
    "States": {
        "AL": {
            "Name": "Alabama",
            "Capital": "Montgomery"
        },
        "AK": {
            "Name": "Alaska",
            "Capital": "Juneau"
        },
        "AZ": {
            "Name": "Arizona",
            "Capital": "Phoenix"
        },
        "AR": {
            "Name": "Arkansas",
            "Capital": "Little Rock"
        },
        "CA": {
            "Name": "California",
            "Capital": "Sacramento"
        }
    },
    "Actors": [
        null,
        {
            "name": "Tom Cruise",
            "age": 56,
            "Born At": "Syracuse, NY",
            "Birthdate": "July 3, 1962",
            "photo": "https://jsonformatter.org/img/tom-cruise.jpg",
            "wife": null,
            "weight": 67.5,
            "hasChildren": true,
            "hasGreyHair": false,
            "children": [
                {
                    "name": "Connor Cruise",
                    "age": 25,
                    "weight": 75.5
                },
                {
                    "name": "Isabella Cruise",
                    "age": 26
                }
            ]
        },
        {
            "name": "Robert Downey Jr.",
            "age": "fifty-three",
            "Born At": "New York City, NY",
            "Birthdate": "April 4, 1965",
            "photo": "https://jsonformatter.org/img/Robert-Downey-Jr.jpg",
            "wife": "Susan Downey",
            "weight": 77.1,
            "hasChildren": {
                "yes": 1,
                "no": 0
            },
            "hasGreyHair": false,
            "mixedArray": [
                1,
                "two",
                3,
                "four",
                5,
                {},
                []
            ],
            "children": [
                {
                    "name": "Indio Falconer Downey",
                    "age": 23,
                    "eye-color": "brown"
                },
                {
                    "name": "Exton Elias Downey",
                    "age": 8
                }
            ],
            "awards": {
                "Oscar": 2,
                "Golden Globe": 3,
                "BAFTA": 1
            }
        }
    ]
}

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitJsonNode = exports.visitJsonObject = exports.visitJsonArray = void 0;
const json_analyzer_types_1 = require("./json-analyzer-types");
function visitVisitors(dataType, visitors) {
    const dataTypeClass = (0, json_analyzer_types_1.getJsonDataTypeClass)(dataType);
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
        visitJsonNode(arrayValue, path + '[]', visitTypes);
        // visitJsonNode(arrayValue, path + '[' + index + ']', visitTypes);
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
    const dataType = (0, json_analyzer_types_1.getJsonDataType)(obj);
    if (path[0] === ".")
        path = path.slice(1);
    const action = visitVisitors(dataType, visitTypes);
    action(path, obj);
    switch (dataType) {
        case json_analyzer_types_1.JsonDataType.array:
            visitJsonArray(obj, path, visitTypes);
            break;
        case json_analyzer_types_1.JsonDataType.object:
            visitJsonObject(obj, path, visitTypes);
            break;
    }
}
exports.visitJsonNode = visitJsonNode;

},{"./json-analyzer-types":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollectionReport = void 0;
function createCollectionReport(details) {
    const detailsEntries = Object.entries(details);
    if (detailsEntries.length === 0) {
        return "No items found";
    }
    return detailsEntries
        .reduce((previous, current) => {
        const [collectionName, properties] = current;
        const resultText = '<table>' + Object.entries(properties).reduce((previous, current) => {
            const [key, value] = current;
            const prettyKey = key.replace(collectionName + '.', '');
            return previous + `<tr><td>&nbsp;&nbsp;</td><td>${prettyKey}</td><td>${value}</td></tr>\n`;
        }, "") + '</table>';
        return previous + '<div class="collectionname">' + collectionName + '</div>\n' + resultText;
    }, "");
}
exports.createCollectionReport = createCollectionReport;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJsonDataTypeClass = exports.getJsonDataType = exports.JsonDataTypeClass = exports.JsonDataType = void 0;
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

},{}],5:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_analyzer_module_1 = require("./json-analyzer-module");
const data_json_1 = __importDefault(require("./data.json"));
const json_analyzer_reporting_1 = require("./json-analyzer-reporting");
const json_collection_finder_1 = require("./json-collection-finder");
const merge_results_1 = require("./merge-results");
function getSampleJson() {
    const jsonSampleSource = JSON.stringify(data_json_1.default, null, 2);
    return jsonSampleSource;
}
function analyze() {
    const textArea = document.getElementById("json");
    const json = textArea.value;
    document.getElementById("result").innerHTML = 'Analyzing...';
    try {
        visitJsonDocument(json);
    }
    catch (e) {
        document.getElementById("result").innerHTML = 'Analyze failed with Error: ' + e;
    }
}
async function getSampleData() {
    const sampleJson = getSampleJson();
    const jsonSampleSource = JSON.stringify(JSON.parse(sampleJson), null, 2);
    const textArea = document.getElementById("json");
    textArea.value = jsonSampleSource;
    analyze();
}
function readFile() {
    const fileInput = document.getElementById("fileUpload");
    return new Promise((resolve, reject) => {
        const files = fileInput.files;
        if (!files) {
            resolve("");
        }
        const file = files[0];
        if (!file) {
            resolve("");
        }
        const reader = new FileReader();
        reader.onload = function () {
            const contents = reader.result;
            resolve(contents);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}
async function loadFile() {
    const json = await readFile();
    const textArea = document.getElementById("json");
    textArea.value = json;
    analyze();
}
function clearJson() {
    const textArea = document.getElementById("json");
    textArea.value = "";
    document.getElementById("result").innerHTML = "";
}
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("analyzeButton").addEventListener("click", analyze);
    document.getElementById("demoButton").addEventListener("click", getSampleData);
    document.getElementById("fileUpload").addEventListener("change", loadFile);
    document.getElementById("clearButton").addEventListener("click", clearJson);
});
function visitJsonDocument(json) {
    var obj = JSON.parse(json);
    console.log('prepare to visit json document');
    // clear the results from the previous visit
    (0, json_collection_finder_1.clearResults)();
    (0, json_analyzer_module_1.visitJsonNode)(obj, "", { "array": json_collection_finder_1.visitArray });
    const arrayOfObjectsResults = (0, merge_results_1.mergeResults)((0, json_collection_finder_1.getResults)());
    // clear the results from the previous visit
    (0, json_collection_finder_1.clearResults)();
    (0, json_analyzer_module_1.visitJsonNode)(obj, "", { "object": json_collection_finder_1.visitObject });
    const objectOfObjectsResults = (0, merge_results_1.mergeResults)((0, json_collection_finder_1.getResults)());
    let outputText = "";
    outputText += '<h2>Collections - <span class="h2-detail">Arrays of Objects</span></h2>';
    outputText += (0, json_analyzer_reporting_1.createCollectionReport)(arrayOfObjectsResults);
    outputText += '<h2>Keyed Objects - <span class="h2-detail">Objects with a unique key</span></h2>';
    outputText += (0, json_analyzer_reporting_1.createCollectionReport)(objectOfObjectsResults);
    document.getElementById("result").innerHTML = outputText;
    console.log('done visiting');
}

},{"./data.json":1,"./json-analyzer-module":2,"./json-analyzer-reporting":3,"./json-collection-finder":6,"./merge-results":7}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitObject = exports.visitArray = exports.clearResults = exports.getResults = void 0;
const json_analyzer_types_1 = require("./json-analyzer-types");
// basically a static variable.  Beware and be sure to clear between executions
const allResults = [];
function getResults() { return allResults; }
exports.getResults = getResults;
function clearResults() { allResults.length = 0; }
exports.clearResults = clearResults;
function visitArray(path, value) {
    console.log('visiting array', path, value);
    const arrayValues = value.filter((v) => v);
    const arrayPropertyTypeClasses = arrayValues
        .map((v) => (v, (0, json_analyzer_types_1.getJsonDataTypeClass)(v)));
    const itemType = arrayPropertyTypeClasses[0];
    if (!arrayPropertyTypeClasses.every((v) => v === itemType)) {
        console.log('Not all item types are the same.  Not a good source for table data');
        return;
    }
    if (itemType !== json_analyzer_types_1.JsonDataTypeClass.object) {
        console.log('Array items are not objects.  Not a good source for table data');
        return;
    }
    const allKeys = {};
    for (let arrayValue of arrayValues) {
        getPropertyNames(allKeys, path, arrayValue);
    }
    const properties = Object.entries(allKeys).reduce(reduceTypes, {});
    const resultObj = { path, properties };
    allResults.push(resultObj);
}
exports.visitArray = visitArray;
function visitObject(path, value) {
    console.log('visiting object', path, value);
    const visitedObject = value;
    const dataTypes = Object.values(visitedObject).map((v) => (0, json_analyzer_types_1.getJsonDataType)(v));
    if (!dataTypes.every((v) => v === json_analyzer_types_1.JsonDataType.object)) {
        console.log('Not all properties are objects.  Not a good source for table data');
        return;
    }
    const arrayOfObjects = getArrayFromObjectOfObjects(visitedObject);
    const allKeys = {};
    for (let arrayValue of arrayOfObjects) {
        getPropertyNames(allKeys, path, arrayValue);
    }
    const properties = Object.entries(allKeys).reduce(reduceTypes, {});
    const resultObj = { path, properties };
    allResults.push(resultObj);
}
exports.visitObject = visitObject;
function mapToClassification(dataTypes) {
    if (dataTypes.length === 1) {
        return dataTypes[0];
    }
    if (dataTypes.includes(json_analyzer_types_1.JsonDataType.array) || dataTypes.includes(json_analyzer_types_1.JsonDataType.object)) {
        return "any";
    }
    return "value";
}
function reduceTypes(previous, current, index) {
    const [key, dataTypes] = current;
    previous[key] = mapToClassification(dataTypes);
    return previous;
}
function getArrayFromObjectOfObjects(obj) {
    return Object.entries(obj).map(([key, value]) => ({ id: key, ...value }));
}
function getPropertyNames(allKeys, path, obj) {
    for (let [key, objectValue] of Object.entries(obj)) {
        const dataType = (0, json_analyzer_types_1.getJsonDataType)(objectValue);
        const propertyPath = path + '.' + key;
        if (dataType !== json_analyzer_types_1.JsonDataType.null) {
            const value = allKeys[propertyPath] || [];
            if (!value.includes(dataType)) {
                value.push(dataType);
            }
            allKeys[propertyPath] = value;
        }
    }
}

},{"./json-analyzer-types":4}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeResults = void 0;
/** Merge results for property types
 * @param results The results to merge
 * @returns The merged results
 * @remarks When a property type is consistent, the type is used.
 * (when completed -> ) When a property type is inconsistent, but within the same category, the category is used. i.e. string, number, boolean are all "value" types.
 * Otherwise, the type is set to "any".
 */
function mergeResults(results) {
    return results.reduce((previous, current) => {
        const { path, properties } = current;
        if (previous[path]) {
            const left = previous[path];
            const right = properties;
            for (let key of Object.keys(left)) {
                if (!right[key]) {
                    right[key] = left[key];
                }
                if (left[key] !== right[key]) {
                    left[key] = "any";
                }
            }
            for (let key of Object.keys(right)) {
                if (!left[key]) {
                    left[key] = right[key];
                }
                if (left[key] !== right[key]) {
                    left[key] = "any";
                }
            }
        }
        else {
            previous[path] = properties;
        }
        return previous;
    }, {});
}
exports.mergeResults = mergeResults;

},{}],8:[function(require,module,exports){
module.exports={
    "States": {
        "AL": {
            "Name": "Alabama",
            "Capital": "Montgomery"
        },
        "AK": {
            "Name": "Alaska",
            "Capital": "Juneau"
        },
        "AZ": {
            "Name": "Arizona",
            "Capital": "Phoenix"
        },
        "AR": {
            "Name": "Arkansas",
            "Capital": "Little Rock"
        },
        "CA": {
            "Name": "California",
            "Capital": "Sacramento"
        }
    },
    "Actors": [
        null,
        {
            "name": "Tom Cruise",
            "age": 56,
            "Born At": "Syracuse, NY",
            "Birthdate": "July 3, 1962",
            "photo": "https://jsonformatter.org/img/tom-cruise.jpg",
            "wife": null,
            "weight": 67.5,
            "hasChildren": true,
            "hasGreyHair": false,
            "children": [
                {
                    "name": "Connor Cruise",
                    "age": 25,
                    "weight": 75.5
                },
                {
                    "name": "Isabella Cruise",
                    "age": 26
                }
            ]
        },
        {
            "name": "Robert Downey Jr.",
            "age": "fifty-three",
            "Born At": "New York City, NY",
            "Birthdate": "April 4, 1965",
            "photo": "https://jsonformatter.org/img/Robert-Downey-Jr.jpg",
            "wife": "Susan Downey",
            "weight": 77.1,
            "hasChildren": {
                "yes": 1,
                "no": 0
            },
            "hasGreyHair": false,
            "mixedArray": [
                1,
                "two",
                3,
                "four",
                5,
                {},
                []
            ],
            "children": [
                {
                    "name": "Indio Falconer Downey",
                    "age": 23,
                    "eye-color": "brown"
                },
                {
                    "name": "Exton Elias Downey",
                    "age": 8
                }
            ],
            "awards": {
                "Oscar": 2,
                "Golden Globe": 3,
                "BAFTA": 1
            }
        }
    ]
}
},{}]},{},[8,5]);
