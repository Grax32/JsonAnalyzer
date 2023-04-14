import { getJsonDataTypeClass, JsonDataTypeClass, JsonDataType, getJsonDataType, JsonColumnDataType, ResultCollectionItem, PropertyDetails } from "./json-analyzer-types";

type AllKeysCollection = { [key: string]: JsonDataType[] };

// basically a static variable.  Beware and be sure to clear between executions
const allResults: ResultCollectionItem[] = [];

export function getResults() { return allResults; }
export function clearResults() { allResults.length = 0; }

export function visitArray(path: string, value: any) {
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

    const allKeys: AllKeysCollection = {};

    for (let arrayValue of arrayValues) {
        getPropertyNames(allKeys, path, arrayValue);
    }

    const properties = Object.entries(allKeys).reduce(reduceTypes, {});
    const resultObj = { path, properties };
    allResults.push(resultObj);
}

export function visitObject(path: string, value: any) {
    console.log('visiting object', path, value);

    const visitedObject: { [key: string]: any } = value;

    const dataTypes = Object.values(visitedObject).map((v: any) => getJsonDataType(v));

    if (!dataTypes.every((v: JsonDataType) => v === JsonDataType.object)) {
        console.log('Not all properties are objects.  Not a good source for table data');
        return;
    }

    const arrayOfObjects = getArrayFromObjectOfObjects(visitedObject);

    const allKeys: AllKeysCollection = {};

    for (let arrayValue of arrayOfObjects) {
        getPropertyNames(allKeys, path, arrayValue);
    }

    const properties = Object.entries(allKeys).reduce(reduceTypes, {});
    const resultObj = { path, properties };
    allResults.push(resultObj);
}

function mapToClassification(dataTypes: JsonDataType[]): JsonColumnDataType {

    if (dataTypes.length === 1) {
        return dataTypes[0]!;
    }

    if (dataTypes.includes(JsonDataType.array) || dataTypes.includes(JsonDataType.object)) {
        return "any";
    }

    return "value";
}

function reduceTypes(previous: { [key: string]: JsonColumnDataType }, current: [string, JsonDataType[]], index: number) {
    const [key, dataTypes] = current;
    previous[key] = mapToClassification(dataTypes);
    return previous;
}

function getArrayFromObjectOfObjects(obj: { [key: string]: {} }) {
    return Object.entries(obj).map(([key, value]) => ({ id: key, ...value }));
}

function getPropertyNames(allKeys: AllKeysCollection, path: string, obj: any) {
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