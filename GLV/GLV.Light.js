// Class Light: a class for WebGL lights.
GLV.Light = function(){ // Lighting

    this.pos = new Vec4(0.0, 200.0, 200.0, 1.0);
    this.ambient  = [0.3, 0.3, 0.3, 1.0];
    this.diffuse  = [0.7, 0.7, 0.7, 1.0]; 
    this.specular = [1.0, 1.0, 1.0, 1.0];
    
    
    this.obj = new GLV.Object("Sphere");
    this.obj.pos = this.pos.toVec3();
    this.obj.scale = new Vec3(5.0, 5.0, 5.0);
};

GLV.Light.prototype.draw = function(mvm, pm){
    this.obj.draw(mvm, pm);
};

GLV.Light.prototype.setUniforms = function(shaderProg, mvm){
    var lightPos = mvm.mult(this.pos);
    gl.uniform3fv(shaderProg.uLightPosition, lightPos.toVec3().toArray());
    gl.uniform4fv(shaderProg.uLightAmbient, this.ambient);
    gl.uniform4fv(shaderProg.uLightDiffuse, this.diffuse);
    gl.uniform4fv(shaderProg.uLightSpecular, this.specular);
};
