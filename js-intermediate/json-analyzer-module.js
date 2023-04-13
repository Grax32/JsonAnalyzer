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
