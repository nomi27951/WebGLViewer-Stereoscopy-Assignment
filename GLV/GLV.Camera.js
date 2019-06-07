// Class Camera: the OpenGL camera to visualize the scene.
GLV.Camera = function(){

    // Matrices
    this.vMat = new Mat4(); // view matrix
    this.nMat = new Mat4(); // normal matrix
    this.pMat = new Mat4(); // projection matrix

    // Viewing params
    this.pos = new Vec4(GLV.INIT_CAM_POS[0], GLV.INIT_CAM_POS[1], GLV.INIT_CAM_POS[2], 1.0);
    this.vrp = new Vec4(0.0, 0.0, 0.0, 1.0);
    this.up  = new Vec4(0.0, 1.0, 0.0, 0.0);
    
    // Perspective params
    this.fovy = 40;
    this.aspect = 1.0;
    this.znear = 5.0;
    this.zfar = 10000.0;
    
    // Initial configuration
    this.updatePerspective();
    this.vMat.loadIdentity();
    this.vMat.lookAt(this.pos, this.vrp, this.up);
};

GLV.Camera.prototype.activateInputCallbacks = function(){
    var This = this;
    var checkMoveCamera = function(){ return GLV.uiSelectedMoveMode === GLV.MOVEMODE_CAMERA; };
    var callbacks = [
        [ checkMoveCamera, [ [GLV.Input.D, function(){ This.move(new Vec4( 2.5,  0.0,  0.0, 0.0)); } ],
                             [GLV.Input.A, function(){ This.move(new Vec4(-2.5,  0.0,  0.0, 0.0)); }],
                             [GLV.Input.W, function(){ This.move(new Vec4( 0.0,  0.0, -2.5, 0.0)); } ],
                             [GLV.Input.S, function(){ This.move(new Vec4( 0.0,  0.0,  2.5, 0.0)); } ],
                             [GLV.Input.E, function(){ This.move(new Vec4( 0.0,  2.5,  0.0, 0.0)); } ],
                             [GLV.Input.Q, function(){ This.move(new Vec4( 0.0, -2.5,  0.0, 0.0)); } ] ]
        ]
    ];
    GLV.Input.addCallbacks(callbacks);
    GLV.Input.scrollPositiveCallbacks.push(
        function(){
            if (GLV.uiSelectedMoveMode === GLV.MOVEMODE_CAMERA && GLV.camera.fovy > 2){
                GLV.camera.fovy -= 1.0;
                GLV.camera.updatePerspective();
            }
        }
    );
    GLV.Input.scrollNegativeCallbacks.push(
        function(){
            if (GLV.uiSelectedMoveMode === GLV.MOVEMODE_CAMERA && GLV.camera.fovy < 178.0){
                GLV.camera.fovy += 1.0;
                GLV.camera.updatePerspective();
            }
        }
    );
};

GLV.Camera.prototype.updatePerspective = function(){
    this.pMat.perspective(this.fovy, this.aspect, this.znear, this.zfar);
};

GLV.Camera.prototype.updateLookAt = function(){
    this.vMat.lookAt(this.pos, this.vrp, this.up);
};

// Amount is float, direction is vec3
GLV.Camera.prototype.move = function(direction){
    //this.vMat.translate(direction);
    var mat = this.vMat.copy();
    mat.transpose();
    var dir = mat.mult(direction);
    this.pos.add(dir);
    this.vrp.add(dir);
    this.updateLookAt();
};

GLV.Camera.prototype.placeAt = function(pos){
    var dir = Vec4.subtract(this.vrp, this.pos);
    this.pos = pos;
    this.vrp = Vec4.add(pos, dir);
    this.updateLookAt();
};
