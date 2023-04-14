import { JsonDataType, JsonVisitorCollection, getJsonDataType, getJsonDataTypeClass } from "./json-analyzer-types";


function visitVisitors(dataType: JsonDataType, visitors: JsonVisitorCollection): (path: string, value: any) => void {

    const dataTypeClass = getJsonDataTypeClass(dataType);

    const dataTypeVisitor = visitors[dataType];
    const dataTypeClassVisitor = visitors[dataTypeClass];
    const anyVisitor = visitors["any"];

    // return a function that will call all the visitors
    return function visitAllVisitors(path: string, value: any) {
        if (dataTypeVisitor) dataTypeVisitor(path, value);
        if (dataTypeClassVisitor) dataTypeClassVisitor(path, value);
        if (anyVisitor) anyVisitor(path, value);
    }
}

export function visitJsonArray(array: any[], path: string, visitTypes: { [key: string]: (path: string, value: any) => void }) {
    for (let [index, arrayValue] of array.map((v: any, i: number) => [i, v])) {
        visitJsonNode(arrayValue, path + '[]', visitTypes);
        // visitJsonNode(arrayValue, path + '[' + index + ']', visitTypes);
    }
}

export function visitJsonObject(obj: {}, path: string, visitTypes: { [key: string]: (path: string, value: any) => void }) {
    for (let [key, objectValue] of Object.entries(obj)) {
        visitJsonNode(objectValue, path + '.' + key, visitTypes);
    }
}

export function visitJsonNode(obj: any, path: string, visitTypes: { [key: string]: (path: string, value: any) => void }) {

    const dataType = getJsonDataType(obj);

    if (path[0] === ".") path = path.slice(1);

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
