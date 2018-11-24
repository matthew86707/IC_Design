var c = document.getElementById("canvas");
let ctx = c.getContext("2d");
var Mousetrap = require('mousetrap');

const { ipcRenderer } = require('electron');


let tx = 0;
let ty = 0;

let mx = 0;
let my = 0;

let net = [];

//Tools
var NONE = 0;
var PLACE_NET = 1;
var PLACE_TRANSISTOR = 2;

let currentTool = 1;

let isSimulating = false;

let currentLayer = 0;
let maxLayer = 0;

let currentLinkLayer = 1;

Mousetrap.bind('t', function () {
    net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)] = {
        ID: 2,
        rotation: 0
    };
    render();
});

Mousetrap.bind('v', function () {
    net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)] = {
        ID: 3
    };
    render();
});

Mousetrap.bind('i', function () {
    net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)] = {
        ID: 6,
        rotation: 0
    };
    render();
});

Mousetrap.bind('s', function () {
    net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)] = {
        ID: 9,
        rotation: 0,
        state: false
    };
    render();
});

Mousetrap.bind('l', function () {
        net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)] = {
            ID: 10,
            destination: currentLinkLayer,
            source: true
        };
        net[currentLinkLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)] = {
            ID: 10,
            destination: currentLayer,
            source: false
        };
    render();
});

Mousetrap.bind('r', function () {
    var rot = net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)].rotation;
    var newRot = (rot + 1) % 4;
    net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)].rotation = newRot;
    render();
});

Mousetrap.bind('.', function () {
    saveProject();
});

var fs = require('fs');

const {dialog} = require('electron').remote;
Mousetrap.bind('o', function () {

    dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections']
    }, function (files) {
        if (files !== undefined) {
            net = JSON.parse(fs.readFileSync(files[0], 'utf8'));
            currentLayer = 0;
            currentLinkLayer = 0;
            maxLayer = net.length;
            updateLayersPanelProjectOpen();
        }
    });
});

function updateLayersPanelProjectOpen(){
    $("#layersList").empty();
    for(var i = 0; i < net.length; i++){
        var layer = $("<div class=\"d-flex flex-row\"><button class=\"file-name-display lastLayer\" id=\"layer-" + i + "\">Layer" + i + "</button><button id=\"link-layer-" + i + "\" class=\"new-layer-button mr-auto\">L</button></div>");
        $("#layersList").append(layer);
        //ipcRenderer.send("open-new-layer", undefined);
        document.getElementById("layer-" + i).addEventListener("click", (event) => { currentLayer = parseInt(event.target.id.split("-")[1]) });
        document.getElementById("link-layer-" + i).addEventListener("click", (event) => { currentLinkLayer = parseInt(event.target.id.split("-")[2]) });
    }
}

var transistorImg = document.getElementById("transistor");
var inverterImg = document.getElementById("inverter");
var switchImg = document.getElementById("switch");
var layerLinkImg = document.getElementById("layer-link");

fitToContainer(canvas);


var mouseDown = [0, 0, 0, 0, 0, 0, 0, 0, 0],
    mouseDownCount = 0;
document.body.onmousedown = function (evt) {
    ++mouseDown[evt.button];
    ++mouseDownCount;
}
document.body.onmouseup = function (evt) {
    --mouseDown[evt.button];
    --mouseDownCount;
}

function fitToContainer(canvas) {
    // Make it visually fill the positioned parent
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    // ...then set the internal size to match
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

ctx.fillStyle = "#0f0000";
ctx.fillRect(0, 0, c.width, c.height);

var GRID_SIZE_X = parseInt(c.width / 20);
var GRID_SIZE_Y = parseInt(c.height / 20);

//0 = Empty
//1 = Wire
//2 = Transistor
//3 = Searching Wire
//4 = Active Wire
//5 = Active Next Tick Wire
//6 = Inverter
//7 = Searching Wire (OFF)
//1 = Wire (OFF)
//8 = Off next tick wire
//9 = Switch
//10 = Layer link


var layer = new Array(GRID_SIZE_X);
for (var i = 0; i < layer.length; i++) {
    var innerArray = new Array(GRID_SIZE_Y);
    for (var j = 0; j < innerArray.length; j++) {
        innerArray[j] = { ID: 0 };
    }
    layer[i] = innerArray;
}

net.push(layer);

ctx.fillStyle = "#FFFFFF";
ctx.fillRect(0, 0, c.width, c.height);
render();

function drawImage(image, x, y, w, h, radians) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(radians);
    ctx.translate(-x - w / 2, -y - h / 2);
    ctx.drawImage(image, x, y, w, h);
    ctx.restore();
}

ctx.font = "20px Arial";

function render() {
    ctx.fillStyle = "#0f0000";
    ctx.fillRect(0, 0, c.width, c.height);
    for (var x = 0; x < GRID_SIZE_X; x++) {
        for (var y = 0; y < GRID_SIZE_Y; y++) {
            ctx.fillStyle = "#383838";
            ctx.fillRect(x * 20, y * 20, 2, 2);
            if (net[currentLayer][x][y].ID == 2) {
                drawImage(transistorImg, (x - 1) * 20, (y - 1) * 20, 40, 40, (Math.PI / 2) * net[currentLayer][x][y].rotation);
            }
            if (net[currentLayer][x][y].ID == 6) {
                drawImage(inverterImg, (x - 1) * 20, (y - 1) * 20, 40, 40, (Math.PI / 2) * net[currentLayer][x][y].rotation);
            }
            if (net[currentLayer][x][y].ID == 9) {
                drawImage(switchImg, (x - 1) * 20, (y - 1) * 20, 40, 40, (Math.PI / 2) * net[currentLayer][x][y].rotation);
            }
            if (net[currentLayer][x][y].ID == 10) {
                drawImage(layerLinkImg, (x - 1) * 20, (y - 1) * 20, 40, 40, 0);
                if (net[currentLayer][x][y].source) {
                    ctx.fillStyle = "#FFFFFF";
                } else {
                    ctx.fillStyle = "#7c7c7c";
                }
                ctx.fillText(net[currentLayer][x][y].destination, ((x - 1) * 20) + 15, ((y - 1) * 20) + 25);
            }
            if (net[currentLayer][x][y].ID == 1 || net[currentLayer][x][y].ID == 3 || net[currentLayer][x][y].ID == 4) {
                ctx.fillStyle = "#FFFFFF";
                if (net[currentLayer][x][y].ID != 1) {
                    ctx.fillStyle = "#660000";
                }
                if (net[currentLayer][x + 1][y].ID == 1 || net[currentLayer][x + 1][y].ID == 3 || net[currentLayer][x + 1][y].ID == 4) {
                    ctx.fillRect(x * 20, y * 20, 20, 2);
                }
                if (net[currentLayer][x][y + 1].ID == 1 || net[currentLayer][x][y + 1].ID == 3 || net[currentLayer][x][y + 1].ID == 4) {
                    ctx.fillRect(x * 20, y * 20, 2, 20);
                }
            }
        }
    }
}

var simulate = function () {
    for (var layer = 0; layer < net.length; layer++) {
        for (var x = 0; x < GRID_SIZE_X; x++) {
            for (var y = 0; y < GRID_SIZE_Y; y++) {
                if (net[layer][x][y].ID == 3) {
                    if (net[layer][x - 1][y].ID == 1) {
                        net[layer][x - 1][y] = { ID: 5 };
                    }
                    if (net[layer][x + 1][y].ID == 1) {
                        net[layer][x + 1][y] = { ID: 5 };
                    }
                    if (net[layer][x][y - 1].ID == 1) {
                        net[layer][x][y - 1] = { ID: 5 };
                    }
                    if (net[layer][x][y + 1].ID == 1) {
                        net[layer][x][y + 1] = { ID: 5 };
                    }
                    net[layer][x][y] = { ID: 4 };
                } else if (net[layer][x][y].ID == 7) {
                    if (net[layer][x - 1][y].ID == 3 || net[layer][x - 1][y].ID == 4) {
                        net[layer][x - 1][y] = { ID: 8 };
                    }
                    if (net[layer][x + 1][y].ID == 3 || net[layer][x + 1][y].ID == 4) {
                        net[layer][x + 1][y] = { ID: 8 };
                    }
                    if (net[layer][x][y - 1].ID == 3 || net[layer][x][y - 1].ID == 4) {
                        net[layer][x][y - 1] = { ID: 8 };
                    }
                    if (net[layer][x][y + 1].ID == 3 || net[layer][x][y + 1].ID == 4) {
                        net[layer][x][y + 1] = { ID: 8 };
                    }
                    net[layer][x][y] = { ID: 1 };
                }
                if (net[layer][x][y].ID == 2) {
                    var rotation = net[layer][x][y].rotation;
                    var offsetX_Collector = 0;
                    var offsetX_Base = 0;
                    var offsetX_Emitter = 0;
                    var offsetY_Collector = 0;
                    var offsetY_Base = 0;
                    var offsetY_Emitter = 0;
                    if (rotation == 0) {
                        offsetY_Collector = -1;
                        offsetX_Base = -1;
                        offsetY_Emitter = 1;
                    } else if (rotation == 1) {
                        offsetX_Collector = 1;
                        offsetY_Base = -1;
                        offsetX_Emitter = -1;
                    } else if (rotation == 2) {
                        offsetY_Collector = 1;
                        offsetX_Base = 1;
                        offsetY_Emitter = -1;
                    } else if (rotation == 3) {
                        offsetX_Collector = -1;
                        offsetY_Base = 1;
                        offsetX_Emitter = 1;
                    }
                    if (net[layer][x + offsetX_Collector][y + offsetY_Collector].ID == 3 || net[layer][x + offsetX_Collector][y + offsetY_Collector].ID == 4) {
                        if (net[layer][x + offsetX_Base][y + offsetY_Base].ID == 3 || net[layer][x + offsetX_Base][y + offsetY_Base].ID == 4) {
                            net[layer][x + offsetX_Emitter][y + offsetY_Emitter] = { ID: 3 };
                        }
                    }
                    else if (net[layer][x + offsetX_Collector][y + offsetY_Collector].ID == 7 || net[layer][x + offsetX_Collector][y + offsetY_Collector].ID == 1) {
                        net[layer][x + offsetX_Emitter][y + offsetY_Emitter] = { ID: 7 };
                    }
                    if (net[layer][x + offsetX_Base][y + offsetY_Base].ID == 7 || net[layer][x + offsetX_Base][y + offsetY_Base].ID == 1) {
                        net[layer][x + offsetX_Emitter][y + offsetY_Emitter] = { ID: 7 };
                    }
                }

            }
        }
        for (var x = 0; x < GRID_SIZE_X; x++) {
            for (var y = 0; y < GRID_SIZE_Y; y++) {
                if (net[layer][x][y].ID == 5) {
                    net[layer][x][y] = { ID: 3 };
                }
                if (net[layer][x][y].ID == 8) {
                    net[layer][x][y] = { ID: 7 };
                }
                if (net[layer][x][y].ID == 10 && net[layer][x][y].source) {
                    var isPowered = false;
                    if (net[layer][x + 1][y].ID == 3 || net[layer][x - 1][y].ID == 3 || net[layer][x][y + 1].ID == 3 || net[layer][x][y - 1].ID == 3) {
                        if (net[net[layer][x][y].destination][x + 1][y].ID == 1 || net[net[layer][x][y].destination][x + 1][y].ID == 7) {
                            net[net[layer][x][y].destination][x + 1][y].ID = 3;
                        }
                        if (net[net[layer][x][y].destination][x - 1][y].ID == 1 || net[net[layer][x][y].destination][x - 1][y].ID == 7) {
                            net[net[layer][x][y].destination][x - 1][y].ID = 3;
                        }
                        if (net[net[layer][x][y].destination][x][y + 1].ID == 1 || net[net[layer][x][y].destination][x][y + 1].ID == 7) {
                            net[net[layer][x][y].destination][x][y + 1].ID = 3;
                        }
                        if (net[net[layer][x][y].destination][x][y - 1].ID == 1 || net[net[layer][x][y].destination][x][y - 1].ID == 7) {
                            net[net[layer][x][y].destination][x][y - 1].ID = 3;
                        }
                        isPowered = true;
                    }
                    if (!isPowered) {
                        if (net[layer][x + 1][y].ID == 7 || net[layer][x - 1][y].ID == 7 || net[layer][x][y + 1].ID == 7 || net[layer][x][y - 1].ID == 7) {
                            if (net[net[layer][x][y].destination][x + 1][y].ID == 3 || net[net[layer][x][y].destination][x + 1][y].ID == 4) {
                                net[net[layer][x][y].destination][x + 1][y].ID = 7;
                                isPowered = true;
                            }
                            if (net[net[layer][x][y].destination][x - 1][y].ID == 3 || net[net[layer][x][y].destination][x - 1][y].ID == 4) {
                                net[net[layer][x][y].destination][x - 1][y].ID = 7;
                                isPowered = true;
                            }
                            if (net[net[layer][x][y].destination][x][y + 1].ID == 3 || net[net[layer][x][y].destination][x][y + 1].ID == 4) {
                                net[net[layer][x][y].destination][x][y + 1].ID = 7;
                                isPowered = true;
                            }
                            if (net[net[layer][x][y].destination][x][y - 1].ID == 3 || net[net[layer][x][y].destination][x][y - 1].ID == 4) {
                                net[net[layer][x][y].destination][x][y - 1].ID = 7;
                                isPowered = true;
                            }
                        }
                    }
                }
                if (net[layer][x][y].ID == 6) {
                    var input_offsetX = 0;
                    var input_offsetY = 0;
                    var output_offsetX = 0;
                    var output_offsetY = 0;
                    if (net[layer][x][y].rotation == 0) {
                        input_offsetX = -1;
                        output_offsetX = 1;
                    } else if (net[layer][x][y].rotation == 1) {
                        input_offsetY = -1;
                        output_offsetY = 1;
                    } else if (net[layer][x][y].rotation == 2) {
                        input_offsetX = 1;
                        output_offsetX = -1;
                    } else if (net[layer][x][y].rotation == 3) {
                        input_offsetY = 1;
                        output_offsetY = -1;
                    }
                    console.log(net[layer][x][y].rotation + "  " + input_offsetX + ", " + input_offsetY + "  " + output_offsetX + ", " + output_offsetY);
                    if (net[layer][x + input_offsetX][y + input_offsetY].ID == 3) {
                        net[layer][x + output_offsetX][y + output_offsetY] = { ID: 7 };
                    } if (net[layer][x + input_offsetX][y + input_offsetY].ID == 7) {
                        net[layer][x + output_offsetX][y + output_offsetY] = { ID: 3 };
                    }
                }
            }
        }

    }
    render();
}
setInterval(simulate, 50);

var handlePlaceNet = function (evt) {
    var rect = c.getBoundingClientRect();
    mx = evt.clientX - rect.left;
    my = evt.clientY - rect.top;

    if (mouseDown[0]) {
        if (net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)].ID == 9) {
            //Offloaded to handleClick
        } else {
            net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)].ID = 1;
            render();
        }
    } else if (mouseDown[2]) {
        net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)].ID = 0;
        render();
    } else if (mouseDown[3]) {
        net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)].ID = 3;
        render();
    }
}

var handleClick = function (evt) {
    if (net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)].ID == 9) {
        net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)].state = !(net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)].state);
        var broadcastID = 7;
        if (net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20)].state) {
            broadcastID = 3;
        }
        net[currentLayer][parseInt((mx + 10) / 20) + 1][parseInt((my + 10) / 20)] = { ID: broadcastID };
        net[currentLayer][parseInt((mx + 10) / 20) - 1][parseInt((my + 10) / 20)] = { ID: broadcastID };
        net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20) + 1] = { ID: broadcastID };
        net[currentLayer][parseInt((mx + 10) / 20)][parseInt((my + 10) / 20) - 1] = { ID: broadcastID };
    }
}

c.addEventListener('mousemove', handlePlaceNet, false);

c.addEventListener('click', handleClick, false);

var newLayer = function newLayer() {
    var layer = new Array(GRID_SIZE_X);
    for (var i = 0; i < layer.length; i++) {
        var innerArray = new Array(GRID_SIZE_Y);
        for (var j = 0; j < innerArray.length; j++) {
            innerArray[j] = { ID: 0 };
        }
        layer[i] = innerArray;
    }
    net.push(layer);
    maxLayer++;
    var layer = $("<div class=\"d-flex flex-row\"><button class=\"file-name-display lastLayer\" id=\"layer-" + maxLayer + "\">Layer" + maxLayer + "</button><button id=\"link-layer-" + maxLayer + "\" class=\"new-layer-button mr-auto\">L</button></div>");
    $("#layersList").append(layer);
    ipcRenderer.send("open-new-layer", undefined);
    document.getElementById("layer-" + maxLayer).addEventListener("click", (event) => { currentLayer = parseInt(event.target.id.split("-")[1]) });
    document.getElementById("link-layer-" + maxLayer).addEventListener("click", (event) => { currentLinkLayer = parseInt(event.target.id.split("-")[2]) });
}

document.getElementById("link-layer-0").addEventListener("click", (event) => { currentLinkLayer = 0; });

document.getElementById("new-layer").addEventListener("click", newLayer);
var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
arr.forEach((val, index, stuff) => {
    if (document.getElementById("layer-" + index) != undefined) {
        document.getElementById("layer-" + index).addEventListener("click", (index) => { currentLayer = val; });
    }
});


function saveProject(){
    try { fs.writeFileSync('adder.txt', JSON.stringify(net), 'utf-8'); }
    catch(e) { alert('Failed to save the file !'); }
}




require('./layerManager.js');