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
