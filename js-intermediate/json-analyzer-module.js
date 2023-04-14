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
