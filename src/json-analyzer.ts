
import { JsonDataType, JsonDataTypeClass, JsonVisitorCollectionKeys, getJsonDataType, getJsonDataTypeClass, visitJsonNode } from './json-analyzer-module';
import { default as dataDotJson } from './data.json';


function getSampleJson() {
    const jsonSampleSource = JSON.stringify(dataDotJson, null, 2);
    return jsonSampleSource;
}

function analyze() {
    const textArea = document.getElementById("json") as HTMLTextAreaElement;
    const json = textArea.value;

    visitJsonDocument(json);
}

async function demo(): Promise<void> {
    const sampleJson = getSampleJson();
    const jsonSampleSource = JSON.stringify(JSON.parse(sampleJson), null, 2);

    const textArea = document.getElementById("json") as HTMLTextAreaElement;
    textArea.value = jsonSampleSource;

    analyze();
}

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("analyzeButton")!.addEventListener("click", analyze);
    document.getElementById("demoButton")!.addEventListener("click", demo);
});

function visitJsonDocument(json: string) {
    var obj = JSON.parse(json);
    const allResults: { path: string; results: { [key: string]: JsonVisitorCollectionKeys; }; }[] = [];

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
        const resultObj = { path, results };
        allResults.push(resultObj);
    }

    const visitors = { "array": visitArray };

    console.log('prepare to visit');
    visitJsonNode(obj, "", visitors);

    const mergedResults = allResults.reduce((previous, current) => {
        const { path, results } = current;
        if (previous[path]) {
            const left = previous[path]!;
            const right = results!;

            for (let key of Object.keys(left)) {
                if (!right[key]) {
                    right[key] = left[key]!;
                }

                if (left[key] !== right[key]) {
                    left[key] = "any";
                }
            }

            for (let key of Object.keys(right)) {
                if (!left[key]) {
                    left[key] = right[key]!;
                }

                if (left[key] !== right[key]) {
                    left[key] = "any";
                }
            }

        } else {
            previous[path] = results;
        }
        return previous;
    }, {} as { [key: string]: { [key: string]: JsonVisitorCollectionKeys; }; });

    document.getElementById("result")!.innerHTML = JSON.stringify(mergedResults, null, 2);
    console.log('done visiting');
}
