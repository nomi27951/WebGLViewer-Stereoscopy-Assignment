

// Class CAVE: Simulates a Cave Automatic Virtual Environment.
// The used metric is cm. 1 unit in world space = 1 centimeter.
var CAVE = {
	EYEL : 0, // index of left eye in array 
	EYER : 1, // index of right eye in array
    // Variables
    leftEye : new Vec3(-3.0, 20.0, 100.0),
    rightEye : new Vec3(3.0, 20.0, 100.0),
    near : 1.0,
    far : 10000.0,
    TEX_SIZE : 1024, // recommended: 1024
    
    front : new DisplaySurface(new Vec3(-150.0, -150.0, -150.0), new Vec3(300.0, 0.0,    0.0), new Vec3(0.0, 300.0,    0.0)),
    left  : new DisplaySurface(new Vec3(-150.0, -150.0,  150.0), new Vec3(  0.0, 0.0, -300.0), new Vec3(0.0, 300.0,    0.0)),
    right : new DisplaySurface(new Vec3( 150.0, -150.0, -150.0), new Vec3(  0.0, 0.0,  300.0), new Vec3(0.0, 300.0,    0.0)),
    floor : new DisplaySurface(new Vec3(-150.0, -150.0,  150.0), new Vec3(300.0, 0.0,    0.0), new Vec3(0.0,   0.0, -300.0)),


    // Functions
    
    init : function(){
        // Define CAVE 3D objects: CAVE walls (front, left, right, bottom) and spheres representing L/R eyes)

		// Let's start with spheres representing L/R eyes
        var objs = [
            // [MODEL_TYPE, POSITION = [X, Y, Z], SCALE = [X, Y, Z]]
			[ "EyeL", [this.leftEye.x, this.leftEye.y, this.leftEye.z], [2.0, 2.0, 2.0]    ], // Left eye
            [ "EyeR", [this.rightEye.x, this.rightEye.y, this.rightEye.z], [2.0, 2.0, 2.0] ]  // Right eye
        ];
		
		// Convert the data above into GLV.Object's
        this.eyes = [];
        for (var i = 0; i < objs.length; ++i){
            var obj = objs[i];
            this.eyes[i] = new GLV.Object(obj[0]);
            this.eyes[i].pos   = new Vec3(obj[1]);
            this.eyes[i].scale = new Vec3(obj[2]);
        }

		// Now quads representing CAVE walls
        var objs = [
            // [MODEL_TYPE,POSITION = [X, Y, Z], SCALE = [X, Y, Z],   ROTATION = [theta_deg, phi_deg]]
			// The modeling transform will be: T(pos)*Rx(phi)*Ry(theta)*S(scale)	
            [ "Plane", [   0.0,     0.0, -150.0], [300.0, 300.0, 1.0], [  0.0,   0.0]], // Front plane
            ["Plane",  [ -150.0,    0.0,    0.0], [300.0, 300.0, 1.0], [ 90.0,   0.0]], // Left plane
            ["Plane",  [  150.0,    0.0,    0.0], [300.0, 300.0, 1.0], [-90.0,   0.0]], // Right plane
            ["Plane",  [    0.0, -150.0,    0.0], [300.0, 300.0, 1.0], [  0.0, -90.0]], // Bottom plane
        ];
		
		// Convert the data above into GLV.Object's
		this.objects = [];
        for (var i = 0; i < objs.length; ++i){
            var objData = objs[i];
            this.objects[i]       = new GLV.Object(objData[0]);
            this.objects[i].pos   = new Vec3(objData[1]);
            this.objects[i].scale = new Vec3(objData[2]);
            this.objects[i].theta = objData[3][0];
            this.objects[i].phi   = objData[3][1];
        }

        // Init textures for each display surface
        GLV.TextureManager.createTextureAndFBO("front", this.TEX_SIZE, this.TEX_SIZE);
		// TBC: remaining textures
        GLV.TextureManager.createTextureAndFBO("left", this.TEX_SIZE, this.TEX_SIZE, true);
        GLV.TextureManager.createTextureAndFBO("right", this.TEX_SIZE, this.TEX_SIZE, true);
        GLV.TextureManager.createTextureAndFBO("floor", this.TEX_SIZE, this.TEX_SIZE, true);
        
        // Init keyboard callbacks
        var checkMoveScene = function(){ return GLV.uiSelectedMoveMode === GLV.MOVEMODE_SCENE; };
        var checkMoveEyes = function(){ return GLV.uiSelectedMoveMode === GLV.MOVEMODE_EYES; };
        var callbacks = [
            // Each element: callback = [ KEY | BOOL_FUNC | [KEY|BOOL_FUNC], FUNCTION() | [elem]]
            [ checkMoveScene, [  [GLV.Input.D, function(){ GLV.scene.pos.add(new Vec3( 5.0,  0.0,  0.0)); } ],
                                 [GLV.Input.A, function(){ GLV.scene.pos.add(new Vec3(-5.0,  0.0,  0.0)); }],
                                 [GLV.Input.E, function(){ GLV.scene.pos.add(new Vec3( 0.0,  5.0,  0.0)); } ],
                                 [GLV.Input.Q, function(){ GLV.scene.pos.add(new Vec3( 0.0, -5.0,  0.0)); } ],
                                 [GLV.Input.S, function(){ GLV.scene.pos.add(new Vec3( 0.0,  0.0,  5.0)); } ],
                                 [GLV.Input.W, function(){ GLV.scene.pos.add(new Vec3( 0.0,  0.0, -5.0)); } ] ]
            ],
            [ checkMoveEyes, [   [GLV.Input.D, function(){ CAVE.moveEyes(new Vec3( 2.5,  0.0,  0.0)); } ],
                                 [GLV.Input.A, function(){ CAVE.moveEyes(new Vec3(-2.5,  0.0,  0.0)); }],
                                 [GLV.Input.E, function(){ CAVE.moveEyes(new Vec3( 0.0,  2.5,  0.0)); } ],
                                 [GLV.Input.Q, function(){ CAVE.moveEyes(new Vec3( 0.0, -2.5,  0.0)); } ],
                                 [GLV.Input.S, function(){ CAVE.moveEyes(new Vec3( 0.0,  0.0,  2.5)); } ],
                                 [GLV.Input.W, function(){ CAVE.moveEyes(new Vec3( 0.0,  0.0, -2.5)); } ] ]
            ]
        ];
        GLV.Input.addCallbacks(callbacks);
        
        // Scene scaling callbacks
        GLV.Input.scrollPositiveCallbacks.push(
            function(){
                if (GLV.uiSelectedMoveMode === GLV.MOVEMODE_SCENE) GLV.scene.incrScale(new Vec3(0.1, 0.1, 0.1));
            }
        );
        GLV.Input.scrollNegativeCallbacks.push(
            function(){
                if (GLV.uiSelectedMoveMode === GLV.MOVEMODE_SCENE) GLV.scene.incrScale(new Vec3(-0.1, -0.1, -0.1));
            }
        );
        
        // Change interocular distance callbacks
        GLV.Input.scrollPositiveCallbacks.push(
            function(){
                if (GLV.uiSelectedMoveMode === GLV.MOVEMODE_EYES) CAVE.increaseEyeSeparation(6.0);
            }
        );
        GLV.Input.scrollNegativeCallbacks.push(
            function(){
                if (GLV.uiSelectedMoveMode === GLV.MOVEMODE_EYES) CAVE.increaseEyeSeparation(-6.0);
            }
        );
    },
    
    moveEyes : function(v){
        this.leftEye.add(v);
        this.rightEye.add(v);
        this.eyes[this.EYEL].pos.add(v);
        this.eyes[this.EYER].pos.add(v);
    },
    
    increaseEyeSeparation : function(dist){
        if (this.leftEye.x - dist/2 > this.rightEye.x + dist/2) dist = this.leftEye.x - this.rightEye.x;
        this.leftEye.x -= dist/2;
        this.rightEye.x += dist/2;
        this.eyes[this.EYEL].pos.x -= dist/2;
        this.eyes[this.EYER].pos.x += dist/2;
    },
    
	drawStereo: function(surface){
		// Left
		gl.colorMask(true, false, false, false);
		viewL = surface.viewingMatrix(this.leftEye);
		projL = surface.projectionMatrix(this.leftEye, this.near, this.far);
		GLV.scene.draw(viewL, projL);
		
		// TBC: the same for right eye
        gl.colorMask(false, true, true, false);
        viewR = surface.viewingMatrix(this.rightEye);
        projR = surface.projectionMatrix(this.rightEye, this.near, this.far);
        GLV.scene.draw(viewR, projR);
		
		// Default
		gl.colorMask(true, true, true, true);
		
	},
	
    draw : function(){
		// ------------------------------------------------------------------
		// 1. Draw the main scene 
		// ------------------------------------------------------------------
        gl.viewport(0, 0, GLV.canvas.width, GLV.canvas.height);
        GLV.scene.draw(GLV.camera.vMat.copy(), GLV.camera.pMat.copy());

		// ------------------------------------------------------------------
		// 2. Draw the scene onto the different display surfaces --> textures
		// ------------------------------------------------------------------
        // Adjust the viewport to the textures
        gl.viewport(0, 0, this.TEX_SIZE, this.TEX_SIZE);
        
        // Draw the scene for each DisplaySurface
        GLV.TextureManager.bindFBO("front");
		this.drawStereo(this.front)
		// TBC: draw on remaining surfaces
        GLV.TextureManager.bindFBO("left");
        this.drawStereo(this.left)

        GLV.TextureManager.bindFBO("right");
        this.drawStereo(this.right)

        GLV.TextureManager.bindFBO("floor");
        this.drawStereo(this.floor)

        // Restore the gl context
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		// ------------------------------------------------------------------
		// 3. Draw the quads representing Display Surfaces (with textures)
		// ------------------------------------------------------------------
		gl.viewport(0, 0, GLV.canvas.width, GLV.canvas.height);
		
        GLV.ShaderManager.setActiveShader(GLV.ShaderManager.CAVE_DISPLAY_SURFACE);
        var shaderProg = GLV.ShaderManager.getActiveShader();
        // Set lighting uniforms
        GLV.scene.light.setUniforms(shaderProg, GLV.camera.vMat.copy());
        // Set DisplaySurfaces textures
        GLV.TextureManager.setUniformTexArray(["front", "left", "right", "floor"], shaderProg, "textures");

        // draw eyes
        this.eyes[0].draw(GLV.camera.vMat, GLV.camera.pMat);
        this.eyes[1].draw(GLV.camera.vMat, GLV.camera.pMat);

        gl.uniform1i(gl.getUniformLocation(shaderProg, "texIdx"), 0);
        this.objects[0].draw(GLV.camera.vMat, GLV.camera.pMat);
        gl.uniform1i(gl.getUniformLocation(shaderProg, "texIdx"), 1);
        this.objects[1].draw(GLV.camera.vMat, GLV.camera.pMat);
        gl.uniform1i(gl.getUniformLocation(shaderProg, "texIdx"), 2);
        this.objects[2].draw(GLV.camera.vMat, GLV.camera.pMat);
        gl.uniform1i(gl.getUniformLocation(shaderProg, "texIdx"), 3);
        this.objects[3].draw(GLV.camera.vMat, GLV.camera.pMat);
		// ------------------------------------------------------------------
		// 4. Draw the spheres representing user's eyes
		// ------------------------------------------------------------------
        
        GLV.ShaderManager.setActiveShader(GLV.ShaderManager.PHONG);
        this.eyes[this.EYEL].draw(GLV.camera.vMat, GLV.camera.pMat);
        this.eyes[this.EYER].draw(GLV.camera.vMat, GLV.camera.pMat);
    }
};
