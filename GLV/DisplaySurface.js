// Class DisplaySurface: walls of a projection-based system

DisplaySurface = function(orig, uvector, vvector){ 
    this.origin = orig; // Vec3 - Origin of the display
    this.u = uvector;   // Vec3 - Horizontal vector
    this.v = vvector;   // Vec3 - Vertical vector

    this.plane = GLV.Utils.createPlane(Vec3.cross(this.u, this.v), orig); 
};

// Functions

DisplaySurface.prototype.viewingMatrix = function(eye){
	mat = new Mat4();
    mat.loadIdentity();

    var vrp = Vec3.add(eye, this.plane.toVec3().negate());
    var up = new Vec3(0.0, 100.0, 0.0);
    mat.lookAt(eye, vrp, up)	
	return mat;
};

DisplaySurface.prototype.projectionMatrix = function (eye, znear, zfar) {
    mat = new Mat4();
    mat.loadIdentity();

    var eyeToBL = Vec3.subtract(this.origin, eye);
    var eyeToTR = Vec3.subtract(Vec3.add(this.origin, this.u, this.v), eye);
    var d = GLV.Utils.distancePlanePoint(this.plane, eye);

    var L;
    var vecLonS = this.u.project(eyeToBL);
    if (Vec3.dot(vecLonS, this.u) > 0) {
        L = vecLonS.norm();
    } else {
        L = -vecLonS.norm();
    }
    var R;
    var vecRonS = this.u.project(eyeToTR);
    if (Vec3.dot(vecRonS, this.u) > 0) {
        R = vecRonS.norm();
    } else {
        R = -vecRonS.norm();
    }

    var B;
    var vecBonS = this.v.project(eyeToBL);
    if (Vec3.dot(vecBonS, this.v) > 0) {
        B = vecBonS.norm();
    } else {
        B = -vecBonS.norm();
    }

    var T;
    var vecTonS = this.v.project(eyeToTR);
    if (Vec3.dot(vecTonS, this.v) > 0) {
        T = vecTonS.norm();
    } else {
        T = -vecTonS.norm();
    }

    L *= znear / d;
    R *= znear / d;
    B *= znear / d;
    T *= znear / d;

    mat.frustum(L, R, B, T, znear, zfar);
	return mat;
};