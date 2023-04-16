const { exec } = require("child_process");
const { writeFileSync, readFileSync } = require('fs');

function trimEndCrLf(s) {
    return s.replace(/[\r\n]+$/gm, "");
}

function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            if (stderr) {
                reject(stderr);
            }
            resolve(trimEndCrLf(stdout));
        });
    });
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

async function updateVersion() {
    const versionConfig = JSON.parse(readFileSync("version.config.json"));

    const version = (await execCommand("git show --oneline -s"));
    const compileTime = new Date();
    const changeIdentifier = versionConfig.changeIdentifier;

    const compileTimeFormatted = formatDate(compileTime);

    const versionInfo = { changeIdentifier, version, compileTime: compileTimeFormatted };

    const versionInfoString = JSON.stringify(versionInfo, null, 4);
    writeFileSync("dist/version.txt", versionInfoString);

    return "";
}

updateVersion()
    .then(x => console.log(x))
    .catch(x => console.error(x));

