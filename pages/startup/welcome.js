const { ipcRenderer } = require('electron');
particlesJS.load('particles-js', './particles.json', function() {
    console.log('callback - particles.js config loaded');
});

// Some data that will be sent to the main process
let Data = {
    project: "none"
};

ipcRenderer.send("native-get-version", undefined);
ipcRenderer.send("native-get-version-rustc", undefined);

document.getElementById("electron-version").innerHTML = "Electron " + process.versions.electron + "";

ipcRenderer.on('native-get-version-response', (event, arg) => {
    document.getElementById("native-version").innerHTML = "Backend " + arg + "";
});

ipcRenderer.on('native-get-version-rustc-response', (event, arg) => {
    document.getElementById("native-version-rustc").innerHTML = "Rust Compiler " + arg + "";
});

document.getElementById("open-project").addEventListener("click", function(){
    ipcRenderer.send('open-project', Data);
});