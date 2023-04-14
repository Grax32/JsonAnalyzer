"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollectionReport = void 0;
function createCollectionReport(details) {
    const detailsEntries = Object.entries(details);
    if (detailsEntries.length === 0) {
        return "No items found";
    }
    return detailsEntries
        .reduce((previous, current) => {
        const [collectionName, properties] = current;
        const resultText = '<table>' + Object.entries(properties).reduce((previous, current) => {
            const [key, value] = current;
            const prettyKey = key.replace(collectionName + '.', '');
            return previous + `<tr><td>&nbsp;&nbsp;</td><td>${prettyKey}</td><td>${value}</td></tr>\n`;
        }, "") + '</table>';
        return previous + '<div class="collectionname">' + collectionName + '</div>\n' + resultText;
    }, "");
}
exports.createCollectionReport = createCollectionReport;
