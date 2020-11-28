var player;
var player1;
var player2;

window.onload = () => {
    'use strict';

    player = document.getElementById('audio');
    player.loop = false;
    player.load();

    player1 = document.getElementById('audio1');
    player1.load();

    player2 = document.getElementById('audio2');
    player2.load();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./sw.js');
    }
    camStart();
}


// Override the function with all the posibilities
navigator.getUserMedia ||
    (navigator.getUserMedia = navigator.mozGetUserMedia ||
        navigator.webkitGetUserMedia || navigator.msGetUserMedia);
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var recIndex = 0;

var audioContext;
var audioInput = null,
    realAudioInput = null,
    inputPoint = null;
var rafID = null;
var smoothMax = 0;
var scaleMax = 0;
var XBoxVolume = 0.;
var gl;
var canvas;
var Param1 = 1.0; // volume
var Param2 = 2.; // brightness control
var Param3 = 1.0;
var Param4 = 1.0;
var Sound1 = 1.0;
var Sound2 = 1.0;
var Sound3 = 1.0;
var Sound4 = 1.0;
var mouseX = 0.5;
var mouseY = 0.5;
var keyState1 = 0;
var keyState2 = 0;
var keyState3 = 0;
var keyState4 = 0;
var keyStatel = 0;
var keyStater = 0;
var firstTime = false;
var fricative = false;
var settings;
var panel;
var panelvisible = false;
var progress;
var vol1;
var vol2;
var inMenu = true;
var menuItem = 0;
var drawContext = null;
var setNo = 1;
var activityNo = 1;
var sketch;
var prticles;
var balls = [];
var COLOURS = ['#8080FF', '#FFFF00', '#00FF80', '#FF8000', '#FF0000', '#FF00FF', '#8080FF', '#808000', '#00FF80', '#FF8000', '#FF0000', '#FF00FF'];
var snakeColours = ['#000000', '#FFFF00', '#00FF80', '#FF0000', '#000000', '#FFFF00', '#00FF80', '#FF0000', '#000000', '#FFFF00', '#00FF80', '#FF0000', '#000000', '#FFFF00', '#00FF80', '#FF0000', '#000000', '#FFFF00', '#00FF80', '#FF0000'];
var snakeX = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1);
var snakeY = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1);
var snakeW = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
var colorStart = 0;
var colorCount = 0;
var centreX;
var centreY

var particles = [];
var maxP = 200;
var clearColor = "rgba(0,0,0,.1)";
var hue = 0;
var contn;

function DoSnake() {
    if (snakeX[0] < 0) { // initialise
        for (i = 0; i < 20; i++) {
            snakeX[i] = sketch.mouse.x + i;
            snakeY[i] = sketch.mouse.y + i;
        }
        centreX = snakeX[0];
        centreY = snakeY[0];
        return;
    }
    var l = Math.hypot(sketch.mouse.x - centreX, sketch.mouse.y - centreY);
    if (l > 10) {
        for (i = 19; i > 0; i--) { // move along
            snakeX[i] = snakeX[i - 1];
            snakeY[i] = snakeY[i - 1];
            snakeW[i] = snakeW[i - 1];
        }
        if (activityNo == 2) {
            if (Math.abs(snakeX[0] - sketch.mouse.x) > Math.abs(snakeY[0] - sketch.mouse.y)) {
                snakeX[0] = sketch.mouse.x;
            } else {
                snakeY[0] = sketch.mouse.y;
            }
        } else {
            snakeX[0] = sketch.mouse.x;
            snakeY[0] = sketch.mouse.y;
        }
        if (activityNo == 4)
            snakeW[0] = l;
    }

    for (i = 18; i >= 0; i--) {
        if (snakeX[i] <= 0 || snakeX[i + 1] <= 0)
            continue;
        sketch.beginPath();
        sketch.moveTo(snakeX[i], snakeY[i]);
        sketch.globalAlpha = 0.8;
        sketch.lineCap = "round";
        var c = snakeColours[i];
        sketch.strokeStyle = c;
        if (activityNo < 3) {
            sketch.lineWidth = 30;
            sketch.lineCap = "round";
        } else {
            if (activityNo == 3)
                sketch.lineWidth = 200;
            else {
                sketch.lineWidth = snakeW[i + 1] * 5;
                sketch.lineWidth = snakeW[i + 1] * 5;
            }
            sketch.lineCap = "butt";

            sketch.moveTo((snakeX[i + 1] * 7 + snakeX[i]) / 8, (snakeY[i + 1] * 7 + snakeY[i]) / 8);
        }
        sketch.lineTo((snakeX[i + 1] + snakeX[i]) / 2, (snakeY[i + 1] + snakeY[i]) / 2);
        sketch.stroke();
    }
    centreX = snakeX[0];
    centreY = snakeY[0];
}

function drawStar(centerX, centerY, points, outer, inner, fill, stroke, line) {
    // define the star
    sketch.beginPath();
    sketch.moveTo(centerX, centerY + outer);
    for (var i = 0; i < 2 * points + 1; i++) {
        var r = (i % 2 == 0) ? outer : inner;
        var a = Math.PI * i / points;
        sketch.lineTo(centerX + r * Math.sin(a), centerY + r * Math.cos(a));
    };
    sketch.closePath();
    // draw
    sketch.fillStyle = fill;
    sketch.fill();
    sketch.strokeStyle = stroke;
    sketch.lineWidth = line;
    sketch.stroke()
}

function DoShapes(event) {
    var startCol = colorStart;
    var dx = Math.abs(sketch.mouse.x - centreX) / 6.;
    var dy = Math.abs(sketch.mouse.y - centreY) / 6.;
    /*   if (dx > dy)
           dy = dx;
       else
           dx = dy; */
    switch (activityNo) {
        case 1:
            for (i = 6; i > 0; i--) {
                sketch.beginPath();
                sketch.globalAlpha = 0.8;
                var c = COLOURS[startCol++];
                sketch.strokeStyle = c;
                sketch.lineWidth = 5;
                sketch.ellipse(centreX, centreY, dx * i, dy * i, 0, 0, 2 * Math.PI);
                sketch.fillStyle = c;
                sketch.fill();
                sketch.stroke();
            }
            break;
        case 2:
            if (centreX > sketch.mouse.x)
                dx = -dx;
            if (centreY > sketch.mouse.y)
                dy = -dy;
            dx /= 2;
            dy /= 2;
            var width = centreX - sketch.mouse.x;
            var height = centreY - sketch.mouse.y;
            for (i = 0; i < 6; i++) {
                sketch.beginPath();
                sketch.globalAlpha = 0.6;
                var c = COLOURS[startCol++];
                sketch.strokeStyle = c;
                sketch.lineWidth = 0;
                sketch.rect(centreX + i * dx, centreY + i * dy, 2 * (6 - i) * dx, 2 * (6 - i) * dy, 0, 0, 2 * Math.PI);
                sketch.fillStyle = c;
                sketch.fill();
                sketch.stroke();
            }
            break;
        case 3:
            var l = Math.hypot(sketch.mouse.x - centreX, sketch.mouse.y - centreY);
            var l1 = l / 6;
            for (i = l; i > 0; i -= l1) {
                var c = COLOURS[startCol++];
                drawStar(centreX, centreY, 6, i, i / 2, c, c, 0);
            }
            break;
        case 4:
            dy = (sketch.height - sketch.mouse.y) / 6;
            for (i = 0; i <= 6; i++) {
                sketch.beginPath();
                sketch.globalAlpha = 0.8;
                sketch.moveTo(0, sketch.height);
                var c = COLOURS[startCol++];
                sketch.strokeStyle = c;
                sketch.lineWidth = 1;
                sketch.lineTo(sketch.mouse.x, sketch.mouse.y + (dy * i));
                sketch.lineTo(sketch.width, sketch.height);
                sketch.lineTo(0, sketch.height);
                sketch.fillStyle = c;
                sketch.fill();
                sketch.stroke();
            }
            break;
    }
    if (colorCount > 50) {
        colorStart++;
        colorCount = 0;
    }
    colorCount++;
    if (colorStart > 5)
        colorStart = 0;
}

function Ball(x, y, r) {
    this.init(x, y, r);
};
var gravityMode = false;
var text = "none";

function ColorLuminance(hex, lum) {
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    var rgb = "#",
        c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }
    return rgb;
}

function rad(degree) {
    return (degree * (PI / 180));
}

function degrees(angle) {
    return angle * (180 / Math.PI);
}

function angle(one, two) {
    var x = sketch.mouse.x - one.x;
    var y = sketch.mouse.y - one.y;
    var theta = degrees(Math.atan2(x, y));
    return theta;
}

Ball.prototype = {
    init: function (x, y, r) {
        this.x = x || 0.0;
        this.y = y || 0.0;
        this.r = r || 30;
        this.angle = random(0, 360);
        this.vx = 0;
        this.vy = 0;
        this.speed = 30 / (this.r + 2);
        if (activityNo == 3)
            this.speed *= 2;
        if (activityNo == 4)
            this.speed = (22 - this.r);
        this.mod = Math.floor(random(10, 20));
        this.mul = 0;
        this.cycles = 0;
        switch (activityNo) {
            case 1:
            case 3:
                this.color = COLOURS[Math.floor(Math.random() * 7)];
                break;
            case 2:
                this.color = "rgb(" + random(128, 255) + "," + random(128, 255) + "," + random(128, 255) + ")";
                break;
        }
        //this.color = "rgb(" + random(128, 255) + "," + random(128, 255) + "," + random(128, 255) + ")";
        this.height = y;
    },
    draw: function (ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        if (activityNo > 1) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 25; //this.r * 2;
        }
        var c = this.color;
        if (activityNo == 1) {
            ctx.fillStyle = ctx.strokeStyle;
        } else if (activityNo == 3) {
            ctx.fillStyle = ctx.strokeStyle;
        } else if (activityNo != 3) {
            c = ColorLuminance(ctx.strokeStyle, -.3);
            ctx.fillStyle = c;
        }
        if (activityNo == 4)
            drawStar(this.x, this.y, 6, this.r * 1.5, this.r, ctx.strokeStyle, ColorLuminance(ctx.strokeStyle, -.3), 3);
        else
            ctx.arc(this.x, this.y, this.r, 0, TWO_PI);
        if (activityNo == 1) {
            ctx.fillStyle = ctx.strokeStyle;
        }
        ctx.fill();
        ctx.stroke();
    },

    handleCollisions: function () {
        if (this.y < this.r) {
            this.angle = 180 - this.angle;
            this.y += this.r + 1;
        } else if (this.y > (sketch.height - this.r)) {
            this.angle = 180 - this.angle;
            this.y -= this.r - 1;
        }
        if (this.x < this.r) {
            this.angle = -this.angle;
            this.x = this.r + 1;
        } else if (this.x > (sketch.width - this.r)) {
            this.angle = -this.angle;
            this.x = sketch.width - this.r - 1;
        }
    },
    setAngle: function (target) {
        var xy = {
            x: this.x,
            y: this.y
        };
        this.angle = angle(xy, target);
    },
    stickAround: function () {
        if (this.cycles % this.mod == 0)
            this.angle += random(-50, 50);
    },

    spinTo: function (ang) {
        if (this.angle > (ang - 10) && this.angle < (ang + 10))
            this.angle = ang;
        else
            this.angle *= 0.9;
    },

    bounce: function () {
        this.height = this.y;
        if (this.y < sketch.height - this.r - 1) {
            this.mul = -1;
            this.height = this.height / 2;
        } else if (this.y == this.height) {
            this.mul = 1;
        }
        this.y += this.mul * cos(this.cycles * PI);
    },

    update: function (event) {
        if (!gravityMode) {
            this.handleCollisions();
            var target = event || -1;
            if (target != -1) {
                this.setAngle(target);
            } else {
                //this.stickAround();
            }

            this.x += sin(rad(this.angle)) * this.speed;
            this.y += cos(rad(this.angle)) * this.speed;

            if (this.cycles > 20)
                this.cycles = 0;
        } else {
            /*      if (this.angle != 0)
                  {
                    this.spinTo(0);
                    this.x += sin(rad(this.angle)) * this.speed;
                    this.y += cos(rad(this.angle)) * this.speed;
                  }
                  else if (this.y < (sketch.height - this.r))
                    this.y+=10-this.speed;*/
            this.bounce();
        }
        if (this.angle > 360)
            this.angle -= 360;
        this.cycles++;
    }
};

function convertToMono(input) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 0, 1);
    return merger;
}

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame(rafID);
    rafID = null;
}

var volumeList = [];
var count = 0;

function updateAnalysers(time) {
    var gotNoise = false;
    var noiseCount = 0;
    count++;

    var max = 0;
    var rX = 0;
    var rY = 0;
    var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

    // first get volume into max;
    var previous = 0;
    var changeCount = 0;
    analyserNode.getByteTimeDomainData(freqByteData);
    for (var i = 0; i < freqByteData.length / 2; ++i) {
        if (freqByteData[i] > max)
            max = freqByteData[i];
        if (freqByteData[i] < 127 && previous > 127)
            changeCount++;
        previous = freqByteData[i];
        // calculate if got noise here
    }
    if (changeCount > 6) { // randomise position for fricative
        if (count > 2)
            count = 1;
        fricative = true;
        //    Param2 = 1.;
    } else {
        fricative = false;
        //    Param2 = 0.;
    }
    max = max - 127;
    //  if (vol1.value < 50)
    //    vol2.value++;
    //  else
    //    vol1.value--;
    smoothMax = (max + 7 * smoothMax) / 8;
    var vol1 = 0;
    var vol2 = 100;
    scaleMax = Math.max((max - Math.min(vol1, vol2)) * 100 / Math.abs(vol2 - vol1), 1);
    if (scaleMax > 100)
        scaleMax = 100;
    progress.value = smoothMax;
    smoothMax = (scaleMax + 7 * smoothMax) / 8;
    Param1 = Math.max(XBoxVolume, smoothMax / 100.);
    var v = smoothMax * 3;
    contn.style.filter = "hue-rotate(" + v + "deg)";
    //console.log(max.toString());
    rafID = window.requestAnimationFrame(updateAnalysers);
}


function gotStream(stream) {

    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

    //    audioInput = convertToMono( input );

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 1024; //2048;
    inputPoint.connect(analyserNode);

    //    audioRecorder = new Recorder( inputPoint );

    //    zeroGain = audioContext.createGain();
    //    zeroGain.gain.value = 0.0;
    //    inputPoint.connect( zeroGain );
    //    zeroGain.connect( audioContext.destination );
    updateAnalysers();
}

function initAudio() {
    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!navigator.cancelAnimationFrame)
        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia({
        audio: true
    }, gotStream, function (e) {
        alert('Error getting audio');
        console.log(e);
    });

}

function startAudio() {
    if (audioContext == null) {
        audioContext = new AudioContext();
        initAudio();
    }
}

function initGL() {
    try {
        gl = canvas.getContext("experimental-webgl", {
            antialias: true
        });
        //            gl = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
    } catch (e) { }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "f") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "v") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

var programsArray = new Array();
var current_program;
var index = 0;

function initShaders() {
    programsArray.push(createProgram("shader-vs", "shader-1-fs"));
    current_program = programsArray[0];
}

function createProgram(vertexShaderId, fragmentShaderId) {
    var shaderProgram;
    var fragmentShader = getShader(gl, fragmentShaderId);
    var vertexShader = getShader(gl, vertexShaderId);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    //       gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.resolutionUniform = gl.getUniformLocation(shaderProgram, "resolution");
    shaderProgram.mouse = gl.getUniformLocation(shaderProgram, "mouse");
    shaderProgram.time = gl.getUniformLocation(shaderProgram, "time");
    shaderProgram.Param1 = gl.getUniformLocation(shaderProgram, "Param1");
    shaderProgram.Param2 = gl.getUniformLocation(shaderProgram, "Param2"); // volume
    shaderProgram.Param3 = gl.getUniformLocation(shaderProgram, "Param3");
    shaderProgram.Param4 = gl.getUniformLocation(shaderProgram, "Param4");
    shaderProgram.Sound1 = gl.getUniformLocation(shaderProgram, "Sound1");
    shaderProgram.Sound2 = gl.getUniformLocation(shaderProgram, "Sound2");
    shaderProgram.Sound3 = gl.getUniformLocation(shaderProgram, "Sound3");
    shaderProgram.Sound4 = gl.getUniformLocation(shaderProgram, "Sound4");
    return shaderProgram;
}

var webcam;
var texture;

function initTexture() {
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

var ix = 0.0;
var end;
var st = new Date().getTime();

function setUniforms() {
    end = new Date().getTime();
    gl.uniformMatrix4fv(current_program.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(current_program.mvMatrixUniform, false, mvMatrix);
    gl.uniform2f(current_program.resolutionUniform, canvas.width, canvas.height);
    gl.uniform2f(current_program.mouse, mouseX, mouseY);
    gl.uniform1f(current_program.time, ((end - st) % 1000000) / 1000.0);
    gl.uniform1f(current_program.Param1, Param1);
    gl.uniform1f(current_program.Param2, Param2);
    gl.uniform1f(current_program.Param3, Param3);
    gl.uniform1f(current_program.Param4, Param4);
}

var cubeVertexPositionBuffer;
var cubeVertexTextureCoordBuffer;
var cubeVertexIndexBuffer;

function initBuffers() {
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    vertices = [-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 2;
    cubeVertexPositionBuffer.numItems = 4;

    cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    var textureCoords = [0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer.itemSize = 2;
    cubeVertexTextureCoordBuffer.numItems = 4;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    var cubeVertexIndices = [0, 1, 2, 0, 2, 3];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 6;
}

function drawScene() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);

    mat4.ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0, pMatrix);

    gl.useProgram(current_program);
    mat4.identity(mvMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(current_program.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    //        gl.vertexAttribPointer(current_program.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, webcam);
    gl.uniform1i(current_program.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    setUniforms();
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
}

var colorList = [];
var doingRainbow = "1";;

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    if (doingRainbow == "1") {
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
    } else
        color = fcol.style.backgroundColor;
    return color;
}

function MakeColorList() {
    for (var i = 0; i < 20; i++)
        colorList[i] = getRandomColor();
}

function tick() {
    requestAnimFrame(tick);
    drawScene();
}

function webGLStart() {
    canvas = document.getElementById("webgl-canvas");
    if (screen.width > 1500 || screen.height > 1500) {
        canvas.width = 1024;
        canvas.height = 1024;
    } else {
        canvas.width = 512;
        canvas.height = 512;
    }
    //canvas.width = 2096;  for screen capture or use 4k resolution with old firefox, i.e. 3840x2160
    //canvas.height =2096;
    initGL();
    initShaders();
    initBuffers();
    initTexture();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    tick();
}

var player;
var player1;
var player2;

function PlaySound(i) {
    switch (i) {
        case 1:
            player.play();
            break;
        case 2:
            player1.play();
            break;
        case 3:
            player2.play();
            break;
    }
}

function Action(i) {
    switch (i) {
        /*       case 1: // Volume so not used here
                   Param1 = Param1 + 1;
                   if (Param1 > 4)
                       Param1 = 1;
                   PlaySound(2);
                   break;
               case 2: // frication so not used here
                   Param2 = Param2 + 1;
                   if (Param2 > 4)
                       Param2 = 1;
                   PlaySound(1);
                   break; */
        case 3: // colour
            Param3 = Param3 + 1;
            if (Param3 > 7)
                Param3 = 1;
            PlaySound(1);
            break;
        case 4: // background
            Param4 = Param4 + 1;
            if (Param4 > 6)
                Param4 = 1;
            PlaySound(3);
            break;
        case 5: // left
            activityNo = activityNo - 1;
            if (activityNo < 0) activityNo = 3;
            Go(activityNo);
            break;
        case 6: // right
            activityNo = activityNo + 1;
            if (activityNo > 4) activityNo = 1;
            Go(activityNo)
            break;
        case 7: // toggle buttons
            toggleButtons();
            break;
    }
}

function toggleButtons() {
    ibutton.hidden = !ibutton.hidden;
    ibutton1.hidden = !ibutton1.hidden;
    ibuttonl.hidden = !ibuttonl.hidden;
    ibuttonr.hidden = !ibuttonr.hidden;
}

function MonitorKeyDown(e) { // stop autorepeat of keys with KeyState1-4 flags
    if (!e) e = window.event;
    if (e.keyCode == 32 || e.keyCode == 49) {
        if (keyState1 == 0)
            Action(4);
    } else if (e.keyCode == 50) {
        if (keyState2 == 0)
            Action(3);
        keyState2 = 1;
    } else if (e.keyCode == 51 || e.keyCode == 13) {
        if (keyState3 == 0)
            Action(1);
        keyState3 = 1;
    } else if (e.keyCode == 52) {
        if (keyState4 == 0)
            Action(2);
        keyState4 = 1;
    } else if (e.keyCode == 53) {
        toggleButtons();
    } else if (e.keyCode == 189) { // +
        if (keyStatel == 0)
            Action(5); //buttonl
    } else if (e.keyCode == 187) { // -
        if (keyStater == 0)
            Action(6);
        else if (e.keycode == 27) {
            showMenu();
        }
    }
    return false;
}

function MonitorKeyUp(e) {
    if (!e) e = window.event;
    if (e.keyCode == 32 || e.keyCode == 49) {
        keyState1 = 0;
    } else if (e.keyCode == 50) {
        keyState2 = 0;
    } else if (e.keyCode == 51 || e.keyCode == 13) {
        keyState3 = 0;
    } else if (e.keyCode == 52) {
        keyState4 = 0;
    } else if (e.keyCode == 189) {
        keyStatel = 0;
    } else if (e.keyCode == 187) {
        keyStater = 0;
    }
    return false;
}

var mouseState = 0;

function MonitorMouseDown(e) {
    if (!e) e = window.event;
    if (e.button == 0) {
        mouseState = 1;
        mouseX = e.clientX / canvas.scrollWidth;
        mouseY = 1.0 - e.clientY / canvas.scrollHeight;
    }
    var c = document.getElementById("container");
    c.style.filter = "sepia(1) hue-rotate(230deg) saturate(2)";
    toggleButtons();
    return false;
}

function MonitorMouseUp(e) {
    if (!e) e = window.event;
    if (e.button == 0) {
        mouseState = 0;
    }
    var c = document.getElementById("container");
    c.style.filter = "grayscale(0)";
    return false;
}

var splash;
var button;
var button1;
var button2;
var button3;
var button4;
var button5;
var button6;
var button7;
var ibutton;
var ibutton1;
var ibuttonl;
var ibuttonr;

function hideMenu() {
    splash.hidden = true;
    button.hidden = true;
    button1.hidden = true;
    button2.hidden = true;
    button3.hidden = true;
    button4.hidden = true;
    button5.hidden = true;
    button6.hidden = true;
    button6.hidden = true;
    button7.hidden = true;
    settings.hidden = true;
    panel.hidden = true;
    ibutton.hidden = false;
    ibutton1.hidden = false;
    ibuttonl.hidden = false;
    ibuttonr.hidden = false;
    inMenu = false;
}

function showMenu() {
    splash.hidden = false;
    button.hidden = false;
    button1.hidden = false;
    button2.hidden = false;
    button3.hidden = false;
    button4.hidden = false;
    button5.hidden = false;
    button6.hidden = false;
    button6.hidden = false;
    button7.hidden = false;
    settings.hidden = false;
    panel.hidden = false;
    ibutton.hidden = true;
    ibutton1.hidden = true;
    ibuttonl.hidden = true;
    ibuttonr.hidden = true;
    inMenu = true;
}

function Highlight() {
    button.style.opacity = .7;
    button1.style.opacity = .7;
    button2.style.opacity = .7;
    button3.style.opacity = .7;
    button4.style.opacity = .7;
    button5.style.opacity = .7;
    button6.style.opacity = .7;
    button7.style.opacity = .7;
    switch (menuItem) {
        case 0:
            button.style.opacity = 1.;
            break;
        case 1:
            button1.style.opacity = 1.;
            break;
        case 2:
            button2.style.opacity = 1.;
            break;
        case 3:
            button3.style.opacity = 1.;
            break;
        case 4:
            button4.style.opacity = 1.;
            break;
        case 5:
            button5.style.opacity = 1.;
            break;
        case 6:
            button6.style.opacity = 1.;
            break;
        case 7:
            button7.style.opacity = 1.;
            break;
    }
}

function ballVisibility(value) {
    for (i = 0; i < balls.length; i++) {
        balls[i].visibility = value;
    }
}

function ChooseSet(i) {
    button4.style.backgroundImage = "url(images/" + i + "1.png)";
    button5.style.backgroundImage = "url(images/" + i + "2.png)";
    button6.style.backgroundImage = "url(images/" + i + "3.png)";
    button7.style.backgroundImage = "url(images/" + i + "4.png)";
    setNo = i;
    button.style.border = "none";
    button.style.borderRadius = "0px";
    button1.style.border = "none";
    button1.style.borderRadius = "0px";
    button2.style.border = "none";
    button2.style.borderRadius = "0px";
    button3.style.border = "none";
    button3.style.borderRadius = "0px";
    switch (setNo) {
        case 1:
            ballVisibility(false);
            button.style.border = "2px solid #FFFFFF";
            button.style.borderRadius = "5vw";
            break;
        case 2:
            ballVisibility(false);
            button1.style.border = "2px solid #FFFFFF";
            button1.style.borderRadius = "5vw";
            break;
        case 3:
            ballVisibility(true);
            button2.style.border = "2px solid #FFFFFF";
            button2.style.borderRadius = "5vw";
            break;
        case 4:
            ballVisibility(true);
            button3.style.border = "2px solid #FFFFFF";
            button3.style.borderRadius = "5vw";
            break;
    }
}

function Go(i) {
    index = i - 1;
    activityNo = i
    current_program = programsArray[0];
    if (firstTime) {
        firstTime = false;
        if (document.body.requestFullscreen) {
            document.body.requestFullscreen();
        } else if (document.body.msRequestFullscreen) {
            document.body.msRequestFullscreen();
        } else if (document.body.mozRequestFullScreen) {
            document.body.mozRequestFullScreen();
        } else if (document.body.webkitRequestFullscreen) {
            document.body.webkitRequestFullscreen();
        }
    }
    for (j = 0; j < 20; j++) { // initialise snake variables
        snakeX[j] = -1;
        snakeY[j] = -1;
        snakeW[j] = 0;
    }
    startAudio();
    hideMenu();
    if (typeof sketch !== 'undefined')
        sketch.destroy();
    if (setNo <= 3) {
        sketch = Sketch.create({
            container: prticles
        });

        sketch.setup = function () {
            var i, ball;
            var tmp = balls.length;
            centreX = sketch.width / 2;
            centreY = sketch.height / 2;
            if (setNo < 3) return;
            for (i = 0; i < tmp; i++)
                balls.pop();
            var bcount = 100;
            for (i = 0; i < bcount; i++) {
                if (activityNo == 1)
                    ball = new Ball(random(20, sketch.width), random(20, sketch.height), (110 - i) / 3);
                else if (activityNo == 4)
                    ball = new Ball(random(20, sketch.width), random(20, sketch.height), (i + 10) / 3);
                ball = new Ball(random(20, sketch.width), random(20, sketch.height), random(5, 20));
                /*       if (activityNo % 2 == 1)
                           ball.color = ColorLuminance(ball.color, 1.5);
                       else */
                ball.color = COLOURS[i % 10];
                if (activityNo == 2)
                    i += 2;
                balls.push(ball);
            }
        };

        sketch.update = function () {
            if (setNo > 2) {
                for (i = 0; i < balls.length; i++) {
                    balls[i].update();
                }
            }
        };

        sketch.draw = function () {
            var i;
            if (inMenu)
                return;
            if (setNo == 1) {
                DoShapes(event);
            } else if (setNo == 2) {
                DoSnake();
            } else if (setNo > 2) {
                sketch.clear();
                for (i = 0; i < balls.length; i++) {
                    balls[i].draw(sketch);

                    /*                this.beginPath();
                        this.moveTo(balls[i].x, balls[i].y);
                        this.lineTo(balls[i].x + 100* sin(rad(balls[i].angle)), balls[i].y + 100* cos(rad(balls[i].angle)));
                        this.stroke();
                        this.strokeText(balls[i].angle, 10,30);*/
                }
            }
        };

        sketch.click = function (event) {
            for (i = 0; i < balls.length; i++) {
                balls[i].speed = -balls[i].speed;
            }
        };

        //        sketch.touchstart = function (event) {
        //            gravityMode = !gravityMode;
        //            centreX = sketch.mouse.x;
        //            centreY = sketch.mouse.y;
        //        };

        sketch.touchmove = function (event) {
            var i;
            if (setNo == 1) {
                if (sketch.touches.length > 1) { }
                //    centreX = (sketch.touches[0].x + sketch.touches[1].x) / 2;
                //    centreY = (sketch.touches[0].y + sketch.touches[1].y) / 2;
            } else if (setNo == 2) { } else if (setNo > 2) {
                gravityMode = false;
                for (i = 0; i < balls.length; i++) {
                    balls[i].speed = Math.abs(balls[i].speed);
                    balls[i].update(event);
                }
            }
        };
    } else if (setNo == 4) {
        sketch = Sketch.create({
            container: prticles,
        });

        var lastX = sketch.width / 2;
        var lastY = sketch.height / 2;

        function P() { }

        P.prototype = {
            constructor: P,
            init: function () {
                this.r = random(15) + 10;
                this.v = this.r / 3;

                this.vx = random(-1 * this.v, this.v);
                this.vy = random(-1 * this.v, this.v);
                this.dv = .96;
                //this.color = "hsla(" + hue + ", 100%, 50%, 1)";
                this.color = 'hsl(' + random(0, 360) + ', ' + random(30, 95) + '%,  ' + random(30, 80) + '%)';
                this.life = 0;
                this.maxLife = random(200);
                this.x = (lastX + sketch.mouse.x) / 2;
                this.y = (lastY + sketch.mouse.y) / 2;
                lastX = this.x;
                lastY = this.y;
            },
            draw: function () {
                if (activityNo > 2) {
                    sketch.globalCompositeOperation = "source-over";
                    sketch.opacity = 0.8;
                } else
                    sketch.globalCompositeOperation = "lighter";
                sketch.beginPath();
                sketch.strokeStyle = this.color;
                var c = ColorLuminance(sketch.strokeStyle, .5);
                sketch.lineWidth = 2;
                if (activityNo == 1)
                    sketch.fillStyle = c;
                else
                    sketch.fillstyle = sketch.strokeStyle;
                sketch.shadowColor = c;
                sketch.shadowBlur = 20;
                if (activityNo == 3) {
                    sketch.fillStyle = clearColor;
                    sketch.lineWidth = 4;
                    //                s.strokeStyle = ColorLuminance(s.strokeStyle, 2.);
                    drawStar(this.x, this.y, 6, this.r * 1.5, this.r, sketch.strokeStyle, ColorLuminance(sketch.strokeStyle, -.3), 3);
                } else
                    sketch.arc(this.x, this.y, this.r, 0, TWO_PI);
                //               c = ColorLuminance(s.strokeStyle, -.2);
                //                s.fillStyle = c;
                //                     s.shadowColor = c;

                sketch.fill();
                sketch.stroke();
                this.update();
            },

            update: function () {
                this.x += this.vx;
                this.y += this.vy;
                this.r *= this.dv;
                this.vx *= this.dv;
                this.vy *= this.dv;
                this.life++;
                if (this.life >= this.maxLife || this.r <= 1.2) {
                    this.init();
                }
            }
        };

        sketch.setup = function () {
            var tmp = particles.length;
            for (i = 0; i < tmp; i++)
                particles.pop();
            var divisor = 1;
            if (activityNo == 3)
                divisor = 2;
            for (var i = 0; i < maxP / divisor; i++) {
                setTimeout(function () {
                    var p = new P();
                    p.init();
                    particles.push(p)
                }, i * 10);
            }
        };

        sketch.update = function () {
            //           s.globalCompositeOperation = "screen";
            //           s.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
            // s.fillStyle = clearColor;
            //   s.shadowColor = 'blue';
            //   s.shadowBlur = 30;
            //            s.fillRect(0, 0, s.width, s.height);
            //           s.fill();
            hue += .3;
        };

        sketch.draw = function () {
            for (var i in particles) {
                particles[i].draw();
            }
        };

        /*    s.mouseout = s.touchend = function () {
                s.mouse.x = null;
                s.mouse.y = null;
            };*/
    }
}


function slideTo(el, left) {
    var steps = 10;
    var timer = 25;
    var elLeft = parseInt(el.style.left) || 0;
    var diff = left - elLeft;
    var stepSize = diff / steps;
    console.log(stepSize, ", ", steps);

    function step() {
        elLeft += stepSize;
        el.style.left = elLeft + "vw";
        if (--steps) {
            setTimeout(step, timer);
        }
    }
    step();
}


StoreValue = function (key, value) {
    if (window.localStorage) {
        window.localStorage.setItem(key, value);
    }
};

RetrieveValue = function (key, defaultValue) {
    var got;
    try {
        if (window.localStorage) {
            got = window.localStorage.getItem(key);
            if (got == 0) {
                return got;
            }
            if (got == "") {
                return got;
            }
            if (got) {
                return got;
            }
            return defaultValue;
        }
        return defaultValue;
    } catch (e) {
        return defaultValue;
    }
};


var c = document.getElementById("body");

function camStart() {
    contn = document.getElementById("container");
    prticles = document.querySelector('particles');
    panel = document.querySelector('panel');
    settings = document.querySelector('settings');
    splash = document.querySelector('splash');
    button = document.querySelector('button');
    button1 = document.querySelector('button1');
    button2 = document.querySelector('button2');
    button3 = document.querySelector('button3');
    button4 = document.querySelector('button4');
    button5 = document.querySelector('button5');
    button6 = document.querySelector('button6');
    button7 = document.querySelector('button7');
    ibutton = document.querySelector('ibutton');
    ibutton1 = document.querySelector('ibutton1');
    ibuttonl = document.querySelector('ibuttonl');
    ibuttonr = document.querySelector('ibuttonr');
    webcam = document.createElement('canvas'); //getElementById('webcam');
    keyState1 = 0;
    keyState2 = 0;
    keyState3 = 0;
    keyState4 = 0;

    progress = document.getElementById('progress');
    panel.style.left = "130vw";
    slideTo(panel, 130);
    settings.style.left = "89vw";
    var chromeOS = false; // this checks for Chrome Operating system /(CrOS)/.test(navigator.userAgent);

    progress.style.position = "absolute";
    progress.style.height = "1vh";
    progress.style.width = "12vw";
    progress.style.left = "6.5vw";
    progress.style.top = "18vh";

    vol1 = document.createElement("INPUT");
    vol1.setAttribute("type", "range");
    vol1.style.position = "absolute";
    vol1.style.height = "8vh";
    vol1.style.width = "12vw";
    vol1.style.left = "6.5vw";
    vol1.style.top = "10vh";
    vol1.value = 25;
    vol1.min = 1;

    vol2 = document.createElement("INPUT");
    vol2.setAttribute("type", "range");
    vol2.style.position = "absolute";
    vol2.style.height = "8vh";
    vol2.style.width = "12vw";
    vol2.style.left = "6.5vw";
    vol2.style.top = "19vh";
    vol2.value = 75;
    vol2.min = 1;

    // colPick.value ="#FF8040";
    // colPick.style.position = "absolute";
    // colPick.style.height = "3vh";
    // colPick.style.width = "3vw";
    // colPick.style.left = "11vw";
    // colPick.style.top = "33vh";

    panel.appendChild(vol1);
    panel.appendChild(vol2);
    //  panel.appendChild(colPick);
    panel.appendChild(progress);
    //  panel.appendChild(foreground);
    //  panel.appendChild(rainbow);
    //  panel.appendChild(bground);
    //  panel.appendChild(fcol);
    //  panel.appendChild(bcol);

    if (chromeOS) {
        chrome.storage.local.get(null, function (result) { // recover stored value
            if (result.vol1 == undefined) { // initial set up after first loaded
                vol1.value = 1;
                vol2.value = 50;
                bcol.style.backgroundColor = '#000000';
                fcol.style.backgroundColor = '#00FFFF';
                fcol.style.backgroundImage = "url(images/rainbow.png)";
            } else {
                vol1.value = Math.abs(result.vol1);
                // if (result.vol1 < 0) {
                //   fcol.style.backgroundImage="url(images/rainbow.png)";
                // }
                // else
                //   doingRainbow = "0";
                vol2.value = result.vol2;
                // fcol.style.backgroundColor = result.foreground;
                // bcol.style.backgroundColor = result.background;
            }
        });
    } else {
        vol1.value = RetrieveValue("vol1", 0);
        vol2.value = RetrieveValue("vol2", 50);
        // doingRainbow = RetrieveValue("doingRainbow", "1");
        // bcol.style.backgroundColor = RetrieveValue("back", 0);
        // fcol.style.backgroundColor = RetrieveValue("fore", "rgb(255,255,0)");
        // if (doingRainbow == "1")
        //     fcol.style.backgroundImage="url(images/rainbow.png)";
        // else
        //     fcol.style.backgroundImage=null;
    }

    settings.onclick = function (e) {
        startAudio();
        if (panelvisible) { // save stored values
            slideTo(panel, 130);
            slideTo(settings, 89);
            if (chromeOS) {
                if (vol1.value < 1)
                    vol1 = 1;
                // if (doingRainbow == "1")
                //   chrome.storage.local.set({'vol1': -vol1.value});
                // else
                chrome.storage.local.set({
                    'vol1': vol1.value
                });
                chrome.storage.local.set({
                    'vol2': vol2.value
                });
                // chrome.storage.local.set({'foreground': fcol.style.backgroundColor});
                // chrome.storage.local.set({'background': bcol.style.backgroundColor});
            } else {
                // document.cookie="vol1="+vol1.value;
                // checkCookie();
                StoreValue("vol1", vol1.value);
                StoreValue("vol2", vol2.value);
                // StoreValue("doingRainbow", doingRainbow);
                // StoreValue("back", bcol.style.backgroundColor);
                // StoreValue("fore", fcol.style.backgroundColor);
            }

        } else {
            slideTo(panel, 75);
            slideTo(settings, 78);
        }
        // colPick.color.hidePicker();
        panelvisible = !panelvisible;

    }

    /*  splash.onclick = function (e) {
          if (document.body.requestFullscreen) {
              document.body.requestFullscreen();
          } else if (document.body.msRequestFullscreen) {
              document.body.msRequestFullscreen();
          } else if (document.body.mozRequestFullScreen) {
              document.body.mozRequestFullScreen();
          } else if (document.body.webkitRequestFullscreen) {
              document.body.webkitRequestFullscreen();
          }
          startAudio();
          hideMenu();
      }*/
    /*       window.setTimeout(function() {
           if (document.body.requestFullscreen) {
             document.body.requestFullscreen();
           } else if (document.body.msRequestFullscreen) {
             document.body.msRequestFullscreen();
           } else if (document.body.mozRequestFullScreen) {
             document.body.mozRequestFullScreen();
           } else if (document.body.webkitRequestFullscreen) {
             document.body.webkitRequestFullscreen();
           }
        
            splash.hidden = true;
        }, 5000); // hide Splash screen after 2.5 seconds
*/
    webGLStart();

    document.onkeydown = MonitorKeyDown;
    document.onkeyup = MonitorKeyUp;

    canvas.onmousedown = MonitorMouseDown;
    canvas.onmouseup = MonitorMouseUp;
    canvas.onmousemove = function (e) {
        e = e || window.event;
        if (mouseState == 1) {
            mouseX = (mouseX + 7.0 * e.clientX / canvas.scrollWidth) / 8.0;
            mouseY = (mouseY + 7.0 * (1.0 - e.clientY / canvas.scrollHeight)) / 8.0;
        }
    }
    canvas.ontouchstart = function (e) {
        e.preventDefault();
        toggleButtons();
        var touchs = e.changedTouches;
        mouseX = touchs[0].clientX / canvas.scrollWidth;
        mouseY = 1.0 - touchs[0].clientY / canvas.scrollHeight;
        c.style.filter = "sepia(1) hue-rotate(230deg) saturate(2)";
    };
    canvas.ontouchend = function (e) {

        e.preventDefault();
        c.style.filter = "grayscale(0)";
    };
    canvas.ontouchmove = function (e) {
        e.preventDefault();
        var touches = e.changedTouches;
        mouseX = touches[0].clientX / canvas.scrollWidth; //] (mouseX + 7.0*touches/canvas.scrollWidth)/8.0;
        mouseY = 1.0 - touches[0].clientY / canvas.scrollHeight; //(mouseY + 7.0*(1.0 - e.clientY/canvas.scrollHeight))/8.0;
    };
    ibutton.onmousedown = function (e) {
        Action(4);
    }

    ibutton1.onmousedown = function (e) {
        Action(3);
    }
    ibuttonl.onmousedown = function (e) {
        showMenu(); //Action(5);
    }
    ibuttonr.onmousedown = function (e) {
        Action(6);
    }

    button.onmousedown = function (e) {
        ChooseSet(1);
    }
    button1.onmousedown = function (e) {
        ChooseSet(2);
    }
    button2.onmousedown = function (e) {
        ChooseSet(3);
    }
    button3.onmousedown = function (e) {
        ChooseSet(4);
    }
    button4.onmousedown = function (e) {
        Go(1);
    }
    button5.onmousedown = function (e) {
        Go(2);
    }
    button6.onmousedown = function (e) {
        Go(3);
    }
    button7.onmousedown = function (e) {
        Go(4);
    }

    ibutton.ontouchstart = function (e) {
        e.preventDefault();
        Action(4);
    }

    ibutton1.ontouchstart = function (e) {
        e.preventDefault();
        Action(3);
    }
    ibuttonl.ontouchstart = function (e) {
        showMenu();
        //Action(5);
    }
    ibuttonr.ontouchstart = function (e) {
        e.preventDefault();
        Action(6);
    }

    button.ontouchstart = function (e) {
        ChooseSet(1);
    }
    button1.ontouchstart = function (e) {
        ChooseSet(2);
    }
    button2.ontouchstart = function (e) {
        ChooseSet(3);
    }
    button3.ontouchstart = function (e) {
        ChooseSet(4);
    }
    button4.ontouchstart = function (e) {
        Go(1);
    }
    button5.ontouchstart = function (e) {
        Go(2);
    }
    button6.ontouchstart = function (e) {
        Go(3);
    }
    button7.ontouchstart = function (e) {
        Go(4);
    }

    function MoveMouse(xm, ym) {
        var xy = {
            x: this.x,
            y: this.y
        };
        xy.x = sketch.mouse.x + xm;
        xy.y = sketch.mouse.y + ym;
        if (xy.x < 10)
            xy.x = 10;
        if (xy.y < 10)
            xy.y = 10;
        if (xy.x >= sketch.width - 10)
            xy.x = sketch.width - 10;
        if (xy.y >= sketch.height - 10)
            xy.y = sketch.height - 10;
        sketch.mouse.x = xy.x;
        sketch.mouse.y = xy.y;
        for (i = 0; i < balls.length; i++) {
            balls[i].update(xy);
        }
        console.log('MoveTo: ', xy.x, xy.y)

    }

    function JoystickMoveTo(jy, jx) {
        if (Math.abs(jx) < .1 && Math.abs(jy) < .1) {
            try {
                if (gpad.getButton(14).value > 0) // dpad left
                    MoveMouse(-20, 0);
                if (gpad.getButton(12).value > 0) // dup
                    MoveMouse(0, -15);
                if (gpad.getButton(13).value > 0) // ddown
                    MoveMouse(0, 15);
                if (gpad.getButton(15).value > 0) // dright
                    MoveMouse(20, 0);
            } catch (e) { }
            return;
        }
        MoveMouse(jx * 30, jy * 20);

    }

    function showPressedButton(index) {
        console.log("Press: ", index);
        if (inMenu) {
            switch (index) {
                case 0: // A
                case 1: // B
                case 2: // X
                case 3: // Y
                    if (menuItem < 4)
                        ChooseSet(menuItem + 1)
                    else
                        Go(menuItem - 3);
                    break;
                case 12: // dup
                    if (menuItem > 3)
                        menuItem -= 4;
                    Highlight();
                    break;
                case 13: // ddown
                    if (menuItem < 4)
                        menuItem += 4;
                    Highlight();
                    break;
                case 14: // dleft
                    if (menuItem > 0)
                        menuItem--;
                    Highlight();
                    break;
                case 15: // dright
                    if (menuItem < 7)
                        menuItem++;
                    Highlight();
                    break;
            }
            console.log("Menu: ", menuItem);
        } else switch (index) {
            case 0: // A
            case 7://right trigger
            case 11:
            case 16:
                Action(3);
                break;
            case 1: // B
            case 6:// Left trigger
                Action(4);
                break;
            case 2: // X
            case 8:
                Action(7);
                break;
            case 4: // LT
            case 9:
                Action(5);
                break;
            case 3: // Y
            case 5: // RB    
                Action(6);
                break;
            case 10: // XBox
                showMenu();
                break;
            default:
        }
    }

    function removePressedButton(index) {
        console.log("Releasd: ", index);
    }

    function moveJoystick(values, isLeft) {
        if (!inMenu)
            JoystickMoveTo(values[1], values[0]);
    }

    var gpad;

    function getAxes() {
        //       console.log('Axis', gpad.getAxis(0), gpad.getAxis(1), gpad.getButton(14).value);

        if (!inMenu)
            JoystickMoveTo(gpad.getAxis(1), gpad.getAxis(0));
        setTimeout(function () {
            getAxes();
        }, 50);
    }

    gamepads.addEventListener('connect', e => {
        console.log('Gamepad connected:');
        console.log(e.gamepad);
        ChooseSet(1)
        Highlight()
        gpad = e.gamepad;
        e.gamepad.addEventListener('buttonpress', e => showPressedButton(e.index));
        e.gamepad.addEventListener('buttonrelease', e => removePressedButton(e.index));
        //       e.gamepad.addEventListener('joystickmove', e => moveJoystick(e.values, true),
        //            StandardMapping.Axis.JOYSTICK_LEFT);
        //        e.gamepad.addEventListener('joystickmove', e => moveJoystick(e.values, false),
        //            StandardMapping.Axis.JOYSTICK_RIGHT);
        setTimeout(function () {
            getAxes();
        }, 50);
    });

    gamepads.addEventListener('disconnect', e => {
        console.log('Gamepad disconnected:');
        console.log(e.gamepad);
    });

    gamepads.start();

    ChooseSet(1);

}
/*block B button on XBox Controller closing app via back command on XBox*/
var systemNavigationManager = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
var systemNavigation = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
systemNavigationManager.addEventListener("backrequested", handleSystemNavigationEvent.bind(this));

function handleSystemNavigationEvent(args) {
    args.handled = true;
    history.back()

}
//© 2020 Sensory App House Ltd www.sensoryapphouse.com