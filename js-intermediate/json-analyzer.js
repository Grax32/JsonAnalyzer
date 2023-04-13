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
