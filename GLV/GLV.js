"use strict";

// Global variable for the WebGL context
var gl;

// Class GLV: The main static class of the WebGL viewer.
var GLV = {
    
    DEBUG : false,
    X_AXIS : [1, 0, 0],
    Y_AXIS : [0, 1, 0],
    Z_AXIS : [0, 0, 1],
    INIT_CAM_POS : [0.0, 100.0, 500.0],
    
    // Variables
    fps : 0,
    lastTime : 0,
    canvas : undefined,
    scene : undefined,
    camera : undefined,
    clearColor : [0.0, 0.0, 0.0, 1.0],
    
    // UI variables
    uiSelectedShader : 0,
    uiSelectedMoveMode : 0,
    MOVEMODE_CAMERA : 0,
    MOVEMODE_SCENE : 1,
    MOVEMODE_EYES : 2
};



// UI functions
GLV.updateViewport = function(width, height){
    GLV.canvas.width = width;
    GLV.canvas.height = height;
    gl.viewport(0, 0, width, height);
    GLV.camera.aspect = width / height;
    GLV.camera.updatePerspective();
};

GLV.updateFontSize = function(vw, vh){
    var sizeW = 1.2*vw/100.0;
    var sizeH = 2.4*vh/100.0;
    if (sizeW < sizeH) document.body.style.fontSize = ""+sizeW+"px";
    else document.body.style.fontSize = ""+sizeH+"px";
};

GLV.onWindowResize = function onWindowResize() {
    GLV.updateViewport(GLV.canvas.offsetWidth, GLV.canvas.offsetHeight);
    GLV.updateFontSize(window.innerWidth, window.innerHeight);
};

GLV.updateFPS = function(){
    document.getElementById("TextFPS").innerHTML = GLV.fps + " fps";
    GLV.fps = 0;
};

GLV.uiToggleHelp = function(){
    if (document.getElementById("helpBox").style.visibility === "hidden")
        document.getElementById("helpBox").style.visibility = "visible";
    else document.getElementById("helpBox").style.visibility = "hidden";
};

GLV.uiSelectedMoveModeChanged = function(value){
    GLV.uiSelectedMoveMode = value;
};

GLV.placeCameraAt = function(v){
    if (v instanceof Vec3)
        GLV.camera.placeAt(new Vec4(v.x, v.y, v.z, 1.0));
    else
        GLV.camera.placeAt(new Vec4(v[0], v[1], v[2], 1.0));
};



GLV.initFileLoader = function(){
    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.
        
        // Separate files in .obj and .mtl and discard other format
        
        var objFiles = {}; // Dictionary to store the objects by name
        var totalFiles = 0;
        
        for (var i = 0, f; f = files[i]; ++i){
            var name = files[i].name.substring(0, files[i].name.length-4);
            var format = files[i].name.substring(files[i].name.length-4, files[i].name.length);
            
            if (format === '.obj'){
                if (objFiles[name] === undefined) objFiles[name] = { objFile : files[i], mtlFile : undefined };
                else objFiles[name].objFile = files[i];
                ++totalFiles;
            }
            else if (format === '.mtl'){
                if (objFiles[name] === undefined) objFiles[name] = { objFile : undefined, mtlFile : files[i] };
                else objFiles[name].mtlFile = files[i];
                ++totalFiles;
            }
        }
        
        var count = 0;
        var onLoadFile = function(){
            if (this.fileType === 0) objFiles[this.name].objStr = this.result;
            else objFiles[this.name].mtlStr = this.result;
            ++count;
            if (count === totalFiles){
                for (f in objFiles){
                    if (objFiles[f].objStr === undefined) continue;
                    GLV.scene.loadObj(objFiles[f].objStr, objFiles[f].mtlStr);
                }
            }
        };
        for (f in objFiles){
        
            if (objFiles[f].objFile === undefined) continue;
            var readerObj = new FileReader();
            readerObj.name = f;
            readerObj.onload = onLoadFile;
            readerObj.fileType = 0;
            readerObj.readAsText(objFiles[f].objFile);
            
            if (objFiles[f].mtlFile === undefined) continue;
            var readerMtl = new FileReader();
            readerMtl.name = f;
            readerMtl.onload = onLoadFile;
            readerMtl.fileType = 1;
            readerMtl.readAsText(objFiles[f].mtlFile);
        }
    }

    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    // Setup the dnd listeners.
    var dropZone = document.getElementById('dropObjZone');
    dropZone.width = window.innerWidth;
    dropZone.height = window.innerHeight*0.2;
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
};

GLV.initGL = function(){
    try {
        GLV.canvas = document.getElementById("mainCanvas");;
        gl = GLV.canvas.getContext("experimental-webgl");
        
        // Init extensions
        gl.extDepthTex = gl.getExtension("WEBKIT_WEBGL_depth_texture");
        if (!gl.extDepthTex){
            gl.extDepthTex = gl.getExtension("WEBGL_depth_texture");
            if (!gl.extDepthTex){
                alert("This explorer cannot use the depth texture extension.");
                //return false;
            }
        }
        
        // Init WebGL
        GLV.ShaderManager.init();
        GLV.updateViewport(GLV.canvas.offsetWidth, GLV.canvas.offsetHeight);
        gl.clearColor(GLV.clearColor[0], GLV.clearColor[1], GLV.clearColor[2], GLV.clearColor[3]);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
    }
    catch (e){
        alert("Could not initialise WebGL, sorry :-(");
        return false;
    }
    return true;
};

GLV.mainLoop = function(){
    window.requestAnimFrame(GLV.mainLoop);
    GLV.Input.processInput();
    
    GLV.ShaderManager.setActiveShader(GLV.uiSelectedShader);
    CAVE.draw();
    
    ++GLV.fps;
};

GLV.webGLStart = function(){

    // Check if browser supports file readers
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }

    GLV.camera = new GLV.Camera();
    GLV.scene = new GLV.Scene();
    
    if (!GLV.initGL()) return;
    GLV.initFileLoader();
    GLV.Input.init(document);
    GLV.camera.activateInputCallbacks();
    GLV.scene.init();
    CAVE.init();
    
    // Init UI
    window.addEventListener("resize", GLV.onWindowResize, false);
    document.getElementById("helpBox").style.visibility = "hidden";

    // Start main program
    window.setInterval(GLV.updateFPS, 1000);
    GLV.mainLoop();
};
