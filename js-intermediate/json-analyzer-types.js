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
