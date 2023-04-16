
export function jsonCloser(src: string) {

    const openChars: string[] = [];
    let inQuotedString = false;

    for (let i = 0; i < src.length; i++) {
        const thisChar = src[i]!;

        if (inQuotedString) {
            switch (thisChar) {
                case '\\':
                    i++;
                    break;
                case '"':
                    inQuotedString = false;
                    break;
            }
        } else {
            switch (thisChar) {
                case '{':
                case '[':
                    openChars.push(thisChar);
                    break;
                case '}':
                    if (openChars.pop() !== '{') {
                        throw new Error('Invalid JSON');
                    }
                    break;
                case ']':
                    if (openChars.pop() !== '[') {
                        throw new Error('Invalid JSON');
                    }
                    break;

                case '"':
                    inQuotedString = true;
                    break;
            }
        }

    }

    if (inQuotedString) {
        src += '-autoclose"';
    }

    if (openChars[openChars.length - 1] === '{') {

        const startBlock = src.lastIndexOf('{');

        // get segment of string from start of block to end of string, replace escaped quotes with empty string
        const segment = src.substring(startBlock).replace('\\"', '').split('"');

        // if segment has 3 elements, it means there is a key with no value
        if (segment.length === 3) {
            if (segment[2]!.trim() === ':') {
                src += '"auto-property"';
            } else {
                src += ': "auto-property"';
            }
        }
    }

    function popChar() {
        let openChar = openChars.pop();

        if (openChar) {
            const closeChar = openChar === '{' ? '}' : ']';
            src += closeChar;
            return true;
        } else {
            return false;
        }
    }

    while (popChar()) { }

    return src;
}
