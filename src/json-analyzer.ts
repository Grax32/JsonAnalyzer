
import { visitJsonNode } from './json-analyzer-module';
import { default as dataDotJson } from './data.json';
import { createCollectionReport } from './json-analyzer-reporting';
import { clearResults, getResults, visitArray, visitObject } from './json-collection-finder';
import { mergeResults } from './merge-results';
import { jsonCloser } from './json-closer';

function setResult(result: string) {
    document.getElementById("result")!.innerHTML = result;
}

function setJsonValue(json: string) {
    const textArea = document.getElementById("json") as HTMLTextAreaElement;
    textArea.value = json;
}

function getJsonValue() {
    const textArea = document.getElementById("json") as HTMLTextAreaElement;
    return textArea.value;
}

function formatJsonValue() {
    const json = getJsonValue();
    const formattedJson = JSON.stringify(JSON.parse(json), null, 2);
    setJsonValue(formattedJson);
}

function getSampleJson() {
    const jsonSampleSource = JSON.stringify(dataDotJson, null, 2);
    return jsonSampleSource;
}

function analyze() {
    const json = getJsonValue();
    const fixedJson = jsonCloser(json);

    if (fixedJson !== json) {
        setJsonValue(fixedJson);
        formatJsonValue();
    }

    setResult('Analyzing...');

    try {
        visitJsonDocument(fixedJson);
    } catch (e) {
        setResult('Analyze failed with Error: ' + e);
    }
}

async function getSampleData(): Promise<void> {
    const sampleJson = getSampleJson();

    setJsonValue(sampleJson);
    formatJsonValue();

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
    setJsonValue(json);
    analyze();
}

function clearJson() {
    setJsonValue("");
    setResult("");
}

async function fetchUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();
    return text;
}

async function analyzeSpecifiedUrl() {
    const urlLoadButton = document.getElementById("urlLoadButton")!
    const buttonText = urlLoadButton.innerHTML;
    urlLoadButton.innerHTML = "Loading...";
    const url = document.getElementById("url") as HTMLInputElement;
    const result = await fetchUrl(url.value);
    setJsonValue(result);
    analyze();

    localStorage.setItem("url", url.value);
    urlLoadButton.innerHTML = buttonText;
}

function switchUrlInputDisplay() {
    const urlInput = document.getElementById("urlInput") as HTMLDivElement;

    if (urlInput.style.display === "none") {
        urlInput.style.display = "block";
    } else {
        urlInput.style.display = "none";
    }
}

export function initializeDocument() {
    document.addEventListener("DOMContentLoaded", function () {

        (document.getElementById("url")! as HTMLInputElement).value = localStorage.getItem("url") || "";
        document.getElementById("analyzeButton")!.addEventListener("click", analyze);
        document.getElementById("demoButton")!.addEventListener("click", getSampleData);
        document.getElementById("fileUpload")!.addEventListener("change", loadFile);
        document.getElementById("clearButton")!.addEventListener("click", clearJson);
        document.getElementById("urlButton")!.addEventListener("click", switchUrlInputDisplay);
        document.getElementById("urlLoadButton")!.addEventListener("click", analyzeSpecifiedUrl);
    });
}

function visitJsonDocument(json: string) {
    const obj = JSON.parse(json);

    console.log('prepare to visit json document');

    // clear the results from the previous visit
    clearResults();
    visitJsonNode(obj, "", { "array": visitArray });
    const arrayOfObjectsResults = mergeResults(getResults());

    // clear the results from the previous visit
    clearResults();
    visitJsonNode(obj, "", { "object": visitObject });
    const objectOfObjectsResults = mergeResults(getResults());

    let outputText = "";

    outputText += '<h2>Collections - <span class="h2-detail">Arrays of Objects</span></h2>';
    outputText += createCollectionReport(arrayOfObjectsResults);
    outputText += '<h2>Keyed Objects - <span class="h2-detail">Objects with a unique key</span></h2>';
    outputText += createCollectionReport(objectOfObjectsResults);

    document.getElementById("result")!.innerHTML = outputText;
    console.log('done visiting');
}
