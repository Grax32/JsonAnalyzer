
import { JsonDataType, JsonDataTypeClass, JsonVisitorCollection, JsonVisitorCollectionKeys, getJsonDataType, getJsonDataTypeClass, visitJsonNode } from './json-analyzer-module';

document.addEventListener("DOMContentLoaded", function () {

    var json = document.getElementById("sample-json")!.innerHTML;
    var obj = JSON.parse(json);

    // function visitObject(path: string, value: any) {
    //     console.log(path + ": " + value);
    // }

    function visitArray(path: string, value: any) {
        console.log('visiting array', path, value);

        const arrayValues: any[] = value.filter((v: any) => v);

        const arrayPropertyTypeClasses = arrayValues
            .map((v: any) => (v, getJsonDataTypeClass(v)));

        const itemType = arrayPropertyTypeClasses[0];

        if (!arrayPropertyTypeClasses.every((v: JsonDataTypeClass) => v === itemType)) {
            console.log('Not all item types are the same.  Not a good source for table data');
            return;
        }

        if (itemType !== JsonDataTypeClass.object) {
            console.log('Array items are not objects.  Not a good source for table data');
            return;
        }

        const allKeys: { [key: string]: JsonDataType[] } = {};

        function getPropertyNames(path: string, obj: any) {
            for (let [key, objectValue] of Object.entries(obj)) {
                const dataType = getJsonDataType(objectValue);
                const propertyPath = path + '.' + key;

                if (dataType !== JsonDataType.null) {
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


        function mapToClassification(dataTypes: JsonDataType[]): JsonVisitorCollectionKeys {

            if (dataTypes.length === 1) {
                return dataTypes[0]!;
            }

            if (dataTypes.includes(JsonDataType.array) || dataTypes.includes(JsonDataType.object)) {
                return "any";
            }

            return "value";
        }

        function reduceTypes(previous: { [key: string]: JsonVisitorCollectionKeys }, current: [string, JsonDataType[]], index: number) {
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
    visitJsonNode(obj, "", visitors);
    console.log('done visiting');
});

