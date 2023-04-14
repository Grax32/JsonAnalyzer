
import { visitJsonNode } from './json-analyzer-module';
import { default as dataDotJson } from './data.json';
import { createCollectionReport } from './json-analyzer-reporting';
import { clearResults, getResults, visitArray, visitObject } from './json-collection-finder';
import { mergeResults } from './merge-results';

function getSampleJson() {
    const jsonSampleSource = JSON.stringify(dataDotJson, null, 2);
    return jsonSampleSource;
}

function analyze() {
    const textArea = document.getElementById("json") as HTMLTextAreaElement;
    const json = textArea.value;

    document.getElementById("result")!.innerHTML = 'Analyzing...';

    try {
        visitJsonDocument(json);
    } catch (e) {
        document.getElementById("result")!.innerHTML = 'Analyze failed with Error: ' + e;
    }
}

async function getSampleData(): Promise<void> {
    const sampleJson = getSampleJson();
    const jsonSampleSource = JSON.stringify(JSON.parse(sampleJson), null, 2);

    const textArea = document.getElementById("json") as HTMLTextAreaElement;
    textArea.value = jsonSampleSource;

    analyze();
}

function readFile(): Promise<string> {
    const fileInput = document.getElementById("fileUpload")! as HTMLInputElement;

    return new Promise((resolve, reject) => {
        const files = fileInput.files;
        if (!files) { resolve(""); }

        const file = files![0];
        if (!file) { resolve(""); }

        const reader = new FileReader();
        reader.onload = function () {
            const contents = reader.result as string;
            resolve(contents);
        }
        reader.onerror = reject;
        reader.readAsText(file!);
    });
}

async function loadFile() {
    const json = await readFile();
    const textArea = document.getElementById("json") as HTMLTextAreaElement;
    textArea.value = json;
    analyze();
}

function clearJson() {
    const textArea = document.getElementById("json") as HTMLTextAreaElement;
    textArea.value = "";
    document.getElementById("result")!.innerHTML = "";
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("analyzeButton")!.addEventListener("click", analyze);
    document.getElementById("demoButton")!.addEventListener("click", getSampleData);
    document.getElementById("fileUpload")!.addEventListener("change", loadFile);
    document.getElementById("clearButton")!.addEventListener("click", clearJson);
});

function visitJsonDocument(json: string) {
    var obj = JSON.parse(json);

    console.log('prepare to visit json document');

    // clear the results from the previous visit
    clearResults();
    visitJsonNode(obj, "", { "array": visitArray });
    const arrayOfObjectsResults = mergeResults(getResults());

    // clear the results from the previous visit
    clearResults();
    visitJsonNode(obj, "", { "object": visitObject   });
    const objectOfObjectsResults = mergeResults(getResults());

    let outputText = "";

    outputText += '<h2>Collections - <span class="h2-detail">Arrays of Objects</span></h2>';
    outputText += createCollectionReport(arrayOfObjectsResults);
    outputText += '<h2>Keyed Objects - <span class="h2-detail">Objects with a unique key</span></h2>';
    outputText += createCollectionReport(objectOfObjectsResults);

    document.getElementById("result")!.innerHTML = outputText;
    console.log('done visiting');
}
