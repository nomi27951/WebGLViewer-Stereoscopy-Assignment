// Class Input: manager for the keyboard and the mouse.
GLV.Input = {
    
    isFF : false, // Is firefox
    
    // Keyboard variables
    A : 65, B : 66, C : 67, D : 68, E : 69, F : 70, G : 71, H : 72, I : 73, J : 74,
    K : 75, L : 76, M : 77, N : 78, O : 79, P : 80, Q : 81, R : 82, S : 83, T : 84,
    U : 85, V : 86, W : 87, X : 88, Y : 89, Z : 90,
    N0 : 48, N1 : 49, N2 : 50,  N3 : 51, N4 : 52, N5 : 53, N6 : 54, N7 : 55, N8 : 56, N9 : 57,
    BACKSPACE : 8,
    TAB : 9,
    RETURN : 13,
    SHIFT : 16,
    CTRL : 17,
    ALT : 18,
    ESC : 27,
    SPACE : 32,
    LEFT : 37,
    UP : 38,
    RIGHT : 39,
    DOWN : 40,
    SUPER : 91,
    keyState : [
        false, false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false, false,
        false, false],
    keyCallbacks : [], // Each row: callback = [ KEY | BOOL_FUNC | [KEY|BOOL_FUNC], FUNCTION() | [elem]]
    
    // Mouse variables
    leftPressed : false,
    middlePressed : false,
    rightPressed : false,
    xAnt : 0,
    xEnd : 0,
    yAnt : 0,
    yEnd : 0,
    phiIni : 0,
    thetaIni : 0,
    scrollPositiveCallbacks : [],
    scrollNegativeCallbacks : [],
    
    // Keyboard functions
    
    init : function init(domElement){
        // Register mouse and keyboard events
        domElement.addEventListener("keydown", this.onKeyDown, false);
        domElement.addEventListener("keyup", this.onKeyUp, false);
        GLV.canvas.addEventListener('mousemove', GLV.Input.onDocumentMouseMove, false);
        GLV.canvas.addEventListener('mousedown', GLV.Input.onDocumentMouseDown, false);
        GLV.canvas.addEventListener('mouseup', GLV.Input.onDocumentMouseUp, false);
        GLV.canvas.addEventListener('mousewheel', GLV.Input.onDocumentMouseScroll, false);
        
        this.isFF = (/Firefox/i.test(navigator.userAgent));
        if (document.attachEvent){ //if IE (and Opera depending on user setting)
            document.attachEvent("onmousewheel", GLV.Input.onDocumentMouseScroll);
        }
        else if (document.addEventListener){ //WC3 browsers
            if (this.isFF) document.addEventListener("DOMMouseScroll", GLV.Input.onDocumentMouseScrollFF, false);
            else document.addEventListener("mousewheel", GLV.Input.onDocumentMouseScroll, false);
        }
    },
    
    addCallbacks : function addCallbacks(funcs){
        for (var i = 0; i < funcs.length; ++i){
            GLV.Input.keyCallbacks.push(funcs[i]);
        }
    },
    
    resetKeyStates : function resetKeyStates(){
        for (var i = 0; i < GLV.Input.keyState.length; ++i) GLV.Input.keyState[i] = false;
    },
    
    onKeyDown : function onKeyDown(event){
        var keyCode = event.which;
        GLV.Input.keyState[keyCode] = true;
    },

    onKeyUp : function onKeyUp(event){
        var keyCode = event.which;
        GLV.Input.keyState[keyCode] = false;
    },
    
    processCallback : function(callback){
        var first = callback[0];
        // Check the conditions of the callback are true
        if (typeof(first) === "number"){
            if (!this.keyState[first]) return;
        }
        if (typeof(first) === "function"){
            if (!first()) return;
        }
        else{ // if (first instanceof Array){
            for (var i = 0; i < first.length; ++i){
                if (typeof(first[i]) === "number"){
                    if (!this.keyState[first[i]]) return;
                }
                else if (!first()) return;
            }
        }
        // If second part is array -> recursive call. Otherwise, call func.
        if (callback[1] instanceof Array){
            var callbacks = callback[1];
            for (var i = 0; i < callbacks.length; ++i)
                this.processCallback(callbacks[i]);
        }
        else callback[1]();
    },
    
    processInput : function processInput(){
        for (var i = 0; i < this.keyCallbacks.length; ++i)
            this.processCallback(this.keyCallbacks[i]);
    },
    
    
    
    // Mouse functions
    
    onDocumentMouseDown : function(event){
        GLV.Input.xAnt = GLV.Input.xEnd = event.clientX;
        GLV.Input.yAnt = GLV.Input.yEnd = event.clientY;
        if (event.button === 0) GLV.Input.leftPressed = true;
        else if (event.button === 1) GLV.Input.middlePressed = true;
        else if (event.button === 2) GLV.Input.rightPressed = true;
    },
    
    onDocumentMouseUp : function(event){
        if (event.button === 0) GLV.Input.leftPressed = false;
        else if (event.button === 1) GLV.Input.middlePressed = false;
        else if (event.button === 2) GLV.Input.rightPressed = false;
        GLV.Input.xIni = GLV.Input.xEnd = GLV.Input.yIni = GLV.Input.yEnd = GLV.Input.phiIni = GLV.Input.thetaIni = 0;
    },
    
    onDocumentMouseMove : function(event){
        if (GLV.Input.leftPressed){
            var x = event.clientX;
            var y = event.clientY;
            var thetaIncr = (x - GLV.Input.xAnt)/200;
            var phiIncr = (y - GLV.Input.yAnt)/200;
            
            var vec = Vec4.subtract(GLV.camera.vrp, GLV.camera.pos);
            var rot = Mat4.identity();
            rot.rotate(-thetaIncr, GLV.Y_AXIS);
            if (vec.z > 0) rot.rotate(phiIncr, GLV.X_AXIS);
            else rot.rotate(-phiIncr, GLV.X_AXIS);
            vec = rot.mult(vec);
            var phi = vec.verticalAngle();
            
            if (phi < 30 && phi > -30){
                GLV.camera.vrp = Vec4.add(GLV.camera.pos, vec);
                GLV.camera.updateLookAt();
            }
            
            GLV.Input.xAnt = x;
            GLV.Input.yAnt = y;
        }
    },
    
    onDocumentMouseScroll : function(event){
        if (event.wheelDelta > 0){
            for (var i = 0; i < GLV.Input.scrollPositiveCallbacks.length; ++i)
                GLV.Input.scrollPositiveCallbacks[i]();
        }
        else if (event.wheelDelta < 0){
            for (var i = 0; i < GLV.Input.scrollNegativeCallbacks.length; ++i)
                GLV.Input.scrollNegativeCallbacks[i]();
        }
    },
    
    onDocumentMouseScrollFF : function(event){
        if (event.detail < 0){
            for (var i = 0; i < GLV.Input.scrollPositiveCallbacks.length; ++i)
                GLV.Input.scrollPositiveCallbacks[i]();
        }
        else if (event.detail > 0){
            for (var i = 0; i < GLV.Input.scrollNegativeCallbacks.length; ++i)
                GLV.Input.scrollNegativeCallbacks[i]();
        }
    }
}
