
export enum JsonDataType {
    string = "string",
    number = "number",
    object = "object",
    array = "array",
    boolean = "boolean",
    null = "null"
}

export enum JsonDataTypeClass {
    value = "value",
    object = "object",
    array = "array"
}

export type JsonNodeVisitor = (path: string, value: any) => void;
export type JsonVisitorCollectionKeys = keyof typeof JsonDataType | keyof typeof JsonDataTypeClass | "any";
export type JsonVisitorCollection = { [key in JsonVisitorCollectionKeys]?: JsonNodeVisitor; };

export function getJsonDataType(value: any) {

    if (value === null) return JsonDataType.null;
    if (typeof value === "string") return JsonDataType.string;
    if (typeof value === "number") return JsonDataType.number;
    if (typeof value === "boolean") return JsonDataType.boolean;

    if (typeof value === "object") {
        return Array.isArray(value) ? JsonDataType.array : JsonDataType.object;
    }

    throw new Error("Unknown JSON data type: " + value);
}

export function getJsonDataTypeClass(value: any): JsonDataTypeClass {
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
        visitJsonNode(arrayValue, path + '[' + index + ']', visitTypes);
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
