"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_analyzer_module_1 = require("./json-analyzer-module");
const data_json_1 = __importDefault(require("./data.json"));
const json_analyzer_reporting_1 = require("./json-analyzer-reporting");
const json_collection_finder_1 = require("./json-collection-finder");
const merge_results_1 = require("./merge-results");
function getSampleJson() {
    const jsonSampleSource = JSON.stringify(data_json_1.default, null, 2);
    return jsonSampleSource;
}
function analyze() {
    const textArea = document.getElementById("json");
    const json = textArea.value;
    document.getElementById("result").innerHTML = 'Analyzing...';
    try {
        visitJsonDocument(json);
    }
    catch (e) {
        document.getElementById("result").innerHTML = 'Analyze failed with Error: ' + e;
    }
}
async function getSampleData() {
    const sampleJson = getSampleJson();
    const jsonSampleSource = JSON.stringify(JSON.parse(sampleJson), null, 2);
    const textArea = document.getElementById("json");
    textArea.value = jsonSampleSource;
    analyze();
}
function readFile() {
    const fileInput = document.getElementById("fileUpload");
    return new Promise((resolve, reject) => {
        const files = fileInput.files;
        if (!files) {
            resolve("");
        }
        const file = files[0];
        if (!file) {
            resolve("");
        }
        const reader = new FileReader();
        reader.onload = function () {
            const contents = reader.result;
            resolve(contents);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}
async function loadFile() {
    const json = await readFile();
    const textArea = document.getElementById("json");
    textArea.value = json;
    analyze();
}
function clearJson() {
    const textArea = document.getElementById("json");
    textArea.value = "";
    document.getElementById("result").innerHTML = "";
}
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("analyzeButton").addEventListener("click", analyze);
    document.getElementById("demoButton").addEventListener("click", getSampleData);
    document.getElementById("fileUpload").addEventListener("change", loadFile);
    document.getElementById("clearButton").addEventListener("click", clearJson);
});
function visitJsonDocument(json) {
    var obj = JSON.parse(json);
    console.log('prepare to visit json document');
    // clear the results from the previous visit
    (0, json_collection_finder_1.clearResults)();
    (0, json_analyzer_module_1.visitJsonNode)(obj, "", { "array": json_collection_finder_1.visitArray });
    const arrayOfObjectsResults = (0, merge_results_1.mergeResults)((0, json_collection_finder_1.getResults)());
    // clear the results from the previous visit
    (0, json_collection_finder_1.clearResults)();
    (0, json_analyzer_module_1.visitJsonNode)(obj, "", { "object": json_collection_finder_1.visitObject });
    const objectOfObjectsResults = (0, merge_results_1.mergeResults)((0, json_collection_finder_1.getResults)());
    let outputText = "";
    outputText += '<h2>Collections - <span class="h2-detail">Arrays of Objects</span></h2>';
    outputText += (0, json_analyzer_reporting_1.createCollectionReport)(arrayOfObjectsResults);
    outputText += '<h2>Keyed Objects - <span class="h2-detail">Objects with a unique key</span></h2>';
    outputText += (0, json_analyzer_reporting_1.createCollectionReport)(objectOfObjectsResults);
    document.getElementById("result").innerHTML = outputText;
    console.log('done visiting');
}
