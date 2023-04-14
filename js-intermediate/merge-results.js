"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeResults = void 0;
/** Merge results for property types
 * @param results The results to merge
 * @returns The merged results
 * @remarks When a property type is consistent, the type is used.
 * (when completed -> ) When a property type is inconsistent, but within the same category, the category is used. i.e. string, number, boolean are all "value" types.
 * Otherwise, the type is set to "any".
 */
function mergeResults(results) {
    return results.reduce((previous, current) => {
        const { path, properties } = current;
        if (previous[path]) {
            const left = previous[path];
            const right = properties;
            for (let key of Object.keys(left)) {
                if (!right[key]) {
                    right[key] = left[key];
                }
                if (left[key] !== right[key]) {
                    left[key] = "any";
                }
            }
            for (let key of Object.keys(right)) {
                if (!left[key]) {
                    left[key] = right[key];
                }
                if (left[key] !== right[key]) {
                    left[key] = "any";
                }
            }
        }
        else {
            previous[path] = properties;
        }
        return previous;
    }, {});
}
exports.mergeResults = mergeResults;
