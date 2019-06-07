// Class Object: instance of the given mesh.
GLV.Object = function(meshName){
    this.pos = new Vec3(0, 0, 0);
    this.phi = 0; // Vertical angle
    this.theta = 0; // Horizontal angle
    this.scale = new Vec3(1.0, 1.0, 1.0);
    this.mesh = meshName; // Index to the corresponding mesh
};

GLV.Object.prototype.draw = function(mvm_, pm_){
    var shaderProg = GLV.ShaderManager.getActiveShader();
    
	mvm = mvm_.copy();
	pm= pm_.copy()
	
    mvm.translate(this.pos);
    mvm.rotate(GLV.Utils.degToRad(this.phi), GLV.X_AXIS);
    mvm.rotate(GLV.Utils.degToRad(this.theta), GLV.Y_AXIS);
    mvm.scale(this.scale.toArray());
    
    var nm = Mat4.identity();
    nm.set(mvm);
    nm.invert();
    nm.transpose();
    
    // Set matrices
    gl.uniformMatrix4fv(shaderProg.uPMatrix, false, pm.toArray());
    gl.uniformMatrix4fv(shaderProg.uMVMatrix, false, mvm.toArray());
    gl.uniformMatrix4fv(shaderProg.uNMatrix, false, nm.toArray());
    
    // Draw the mesh
    GLV.scene.meshes[this.mesh].draw();
};
