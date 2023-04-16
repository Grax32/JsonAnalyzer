
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
        src += '"';
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
