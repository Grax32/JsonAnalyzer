
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
export type JsonColumnDataType = keyof typeof JsonDataType | keyof typeof JsonDataTypeClass | "any";
export type JsonVisitorCollection = { [key in JsonColumnDataType]?: JsonNodeVisitor; };
export type JsonVisitorResults = { [key: string]: { [key: string]: JsonColumnDataType; }; };

export type PropertyDetails = { [key: string]: JsonColumnDataType; };
export type ResultCollectionItem = { path: string; properties: PropertyDetails; };

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
