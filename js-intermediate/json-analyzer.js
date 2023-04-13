"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_analyzer_module_1 = require("./json-analyzer-module");
document.addEventListener("DOMContentLoaded", function () {
    var json = document.getElementById("sample-json").innerHTML;
    var obj = JSON.parse(json);
    // function visitObject(path: string, value: any) {
    //     console.log(path + ": " + value);
    // }
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
    // function visitValues(path: string, value: any) {
    //     console.log(path + ": " + value);
    // }
    // function visitAny(path: string, _value: any) {
    //     console.log("any: " + path);
    // }
    // const visitors = {
    //     "object": visitObject,
    //     "array": visitArray,
    //     "values": visitValues,
    //     "any": visitAny
    // };
    const visitors = {
        // "object": visitObject,
        "array": visitArray
    };
    console.log('prepare to visit');
    (0, json_analyzer_module_1.visitJsonNode)(obj, "", visitors);
    console.log('done visiting');
});
function every(arrayPropertyTypeClasses, arg1) {
    throw new Error('Function not implemented.');
}
