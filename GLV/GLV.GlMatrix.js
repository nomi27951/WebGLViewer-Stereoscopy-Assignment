// Library for Vec3, Vec4 and Mat4.

/*########################################
#                                        #
#                  VEC 3                 #
#                                        #
########################################*/

function Vec3(x, y, z){
    if (x instanceof Array){
        this.x = x[0] || 0.0;
        this.y = x[1] || 0.0;
        this.z = x[2] || 0.0;
    }
    else{
        this.x = x || 0.0;
        this.y = y || 0.0;
        this.z = z || 0.0;
    }
};

Vec3.prototype.copy = function(){
    return new Vec3(this.x, this.y, this.z);
};

Vec3.prototype.toVec4 = function(lastCoord){
    return new Vec4(this.x, this.y, this.z, lastCoord);
};

Vec3.prototype.toArray = function(){
    return [this.x, this.y, this.z];
};

Vec3.prototype.norm = function(){
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
};

Vec3.prototype.normalize = function(){
    var n = this.norm();
    this.x /= n;
    this.y /= n;
    this.z /= n;
    return this;
};

Vec3.prototype.negate = function(){
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
};

Vec3.prototype.add = function(v){
    if (v instanceof Vec3){
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
    }
    else if (v.length === 3){
        this.x += v[0];
        this.y += v[1];
        this.z += v[2];
    }
    return this;
};

Vec3.prototype.mult = function(num){
    this.x = num*this.x;
    this.y = num*this.y;
    this.z = num*this.z;
    return this;
};

// Projects v over this vector
Vec3.prototype.project = function(v){
    var n = this.norm();
    return this.copy().mult( Vec3.dot(this, v)/(n*n) );
};

// Static methods
Vec3.add = function(){
    var res = new Vec3();
    for (var i = 0; i < arguments.length; ++i){
        res.x += arguments[i].x;
        res.y += arguments[i].y;
        res.z += arguments[i].z;
    }
    return res;
};

Vec3.subtract = function(v1, v2){
    return new Vec3(v1.x-v2.x, v1.y-v2.y, v1.z-v2.z);
};

Vec3.negate = function(v){
    return new Vec3(-v.x, -v.y, -v.z);
};

Vec3.dot = function(v1, v2){
    return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
};

Vec3.cross = function(v1, v2){
    return new Vec3(
        v1.y*v2.z - v1.z*v2.y, 
        v1.z*v2.x - v1.x*v2.z,
        v1.x*v2.y - v1.y*v2.x);
};

/*########################################
#                                        #
#                  VEC 4                 #
#                                        #
########################################*/

function Vec4(x, y, z, w){
    if (x instanceof Array){
        this.x = x[0] || 0.0;
        this.y = x[1] || 0.0;
        this.z = x[2] || 0.0;
        this.w = x[3] || 0.0;
    }
    else{
        this.x = x || 0.0;
        this.y = y || 0.0;
        this.z = z || 0.0;
        this.w = w || 0.0;
    }
};

Vec4.prototype.toArray = function(){
    return [this.x, this.y, this.z, this.w];
};

Vec4.prototype.toVec3 = function(){
    return new Vec3(this.x, this.y, this.z);
};

Vec4.prototype.norm = function(){
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w);
};

Vec4.prototype.normalize = function(){
    var n = this.norm();
    this.x /= n;
    this.y /= n;
    this.z /= n;
    this.w /= n;
};

Vec4.prototype.verticalAngle = function(){
    return Math.asin(this.y/this.norm())*180.0/Math.PI;
};

Vec4.prototype.horizontalAngle = function(){
    return Math.atan2(this.z, this.x)*180.0/Math.PI;
};

Vec4.prototype.add = function(v){
    if (v instanceof Vec4){
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        this.w += v.w;
    }
    else if (v.length === 4){
        this.x += v[0];
        this.y += v[1];
        this.z += v[2];
        this.w += v[3];
    }
};

Vec4.prototype.mult = function(num){
    this.x = num*this.x;
    this.y = num*this.y;
    this.z = num*this.z;
    this.w = num*this.w;
};

Vec4.dot = function(v1, v2){
    return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z + v1.w*v2.w;
};

Vec4.cross = function(v1, v2){
    return new Vec4(
        v1.y*v2.z - v1.z*v2.y, 
        v1.z*v2.x - v1.x*v2.z,
        v1.x*v2.y - v1.y*v2.x,
        0);
};

// Static methods
Vec4.add = function(v1, v2){
    return new Vec4(v1.x+v2.x, v1.y+v2.y, v1.z+v2.z, v1.w+v2.w);
};

Vec4.subtract = function(v1, v2){
    return new Vec4(v1.x-v2.x, v1.y-v2.y, v1.z-v2.z, v1.w-v2.w);
};

/*########################################
#                                        #
#                  MAT 4                 #
#                                        #
########################################*/

// NOTE: Remember that GLSL reads matrices by columns not by rows. Thus, the general
//       matrix is (r = rotation terms, t = translation terms):
//          (r r r 0)
//          (r r r 0)
//          (r r r 0)
//          (t t t 1)

function Mat4(){
    this._ = new Float32Array(16);
};

// Class methods

Mat4.prototype.toArray = function(){
    return this._;
};

Mat4.prototype.toString = function(){
    var a = this._;
    return  " "+a[0]+" "+a[1]+" "+a[2]+" "+a[3]+"\n"+
            " "+a[4]+" "+a[5]+" "+a[6]+" "+a[7]+"\n"+
            " "+a[8]+" "+a[9]+" "+a[10]+" "+a[11]+"\n"+
            " "+a[12]+" "+a[13]+" "+a[14]+" "+a[15];
};

Mat4.prototype.loadZeros = function(){
    var a = this._;
    a[0] = a[1] = a[2] = a[3] = a[4] = a[5] = a[6] = a[7] = a[8] = a[9] = a[10] = a[11] = a[12] = a[13] = a[14] = a[15] = 0;
};

Mat4.prototype.loadIdentity = function(){
    var a = this._;
    a[0] = a[5] = a[10] = a[15] = 1;
    a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = a[12] = a[13] = a[14] = 0;
};

Mat4.prototype.copy = function(){
    var res = new Mat4();
    var a = this._, b = res._;
    b[0] = a[0];   b[1] = a[1];   b[2] = a[2];   b[3] = a[3];
    b[4] = a[4];   b[5] = a[5];   b[6] = a[6];   b[7] = a[7];
    b[8] = a[8];   b[9] = a[9];   b[10] = a[10]; b[11] = a[11];
    b[12] = a[12]; b[13] = a[13]; b[14] = a[14]; b[15] = a[15];
    return res;
};

Mat4.prototype.set = function(mat){
    var b = mat;
    if (mat instanceof Mat4) b = mat._;
    else if (mat.length != 16) return;
    var a = this._;
    a[0] = b[0];   a[1] = b[1];   a[2] = b[2];   a[3] = b[3];
    a[4] = b[4];   a[5] = b[5];   a[6] = b[6];   a[7] = b[7];
    a[8] = b[8];   a[9] = b[9];   a[10] = b[10]; a[11] = b[11];
    a[12] = b[12]; a[13] = b[13]; a[14] = b[14]; a[15] = b[15];
};

Mat4.prototype.add = function(m){
    var a = this._, b = m._;
    a[0] = a[0] + b[0];
    a[1] = a[1] + b[1];
    a[2] = a[2] + b[2];
    a[3] = a[3] + b[3];
    a[4] = a[4] + b[4];
    a[5] = a[5] + b[5];
    a[6] = a[6] + b[6];
    a[7] = a[7] + b[7];
    a[8] = a[8] + b[8];
    a[9] = a[9] + b[9];
    a[10] = a[10] + b[10];
    a[11] = a[11] + b[11];
    a[12] = a[12] + b[12];
    a[13] = a[13] + b[13];
    a[14] = a[14] + b[14];
    a[15] = a[15] + b[15];
};

Mat4.prototype.subtract = function(m){
    var a = this._, b = m._;
    a[0] = a[0] - b[0];
    a[1] = a[1] - b[1];
    a[2] = a[2] - b[2];
    a[3] = a[3] - b[3];
    a[4] = a[4] - b[4];
    a[5] = a[5] - b[5];
    a[6] = a[6] - b[6];
    a[7] = a[7] - b[7];
    a[8] = a[8] - b[8];
    a[9] = a[9] - b[9];
    a[10] = a[10] - b[10];
    a[11] = a[11] - b[11];
    a[12] = a[12] - b[12];
    a[13] = a[13] - b[13];
    a[14] = a[14] - b[14];
    a[15] = a[15] - b[15];
};

// Forward multiplication: this._ * elem
Mat4.prototype.mult = function(elem){
    var a = this._;
    if (!isNaN(elem)){
        a[0] *= elem;  a[1] *= elem;  a[2] *= elem;  a[3] *= elem;
        a[4] *= elem;  a[5] *= elem;  a[6] *= elem;  a[7] *= elem;
        a[8] *= elem;  a[9] *= elem;  a[10] *= elem; a[11] *= elem;
        a[12] *= elem; a[13] *= elem; a[14] *= elem; a[15] *= elem;
    }
    else if (elem instanceof Mat4){
        var b = elem._;
        var b00 = b[0],  b01 = b[1],  b02 = b[2],  b03 = b[3],
            b10 = b[4],  b11 = b[5],  b12 = b[6],  b13 = b[7],
            b20 = b[8],  b21 = b[9],  b22 = b[10], b23 = b[11],
            b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
        a[0]  = a0*b00 + a1*b10 + a2*b20 + a3*b30;
        a[1]  = a0*b01 + a1*b11 + a2*b21 + a3*b31;
        a[2]  = a0*b02 + a1*b12 + a2*b22 + a3*b32;
        a[3]  = a0*b03 + a1*b13 + a2*b23 + a3*b33;
        a0 = a[4], a1 = a[5], a2 = a[6], a3 = a[7];
        a[4]  = a0*b00 + a1*b10 + a2*b20 + a3*b30;
        a[5]  = a0*b01 + a1*b11 + a2*b21 + a3*b31;
        a[6]  = a0*b02 + a1*b12 + a2*b22 + a3*b32;
        a[7]  = a0*b03 + a1*b13 + a2*b23 + a3*b33;
        a0 = a[8], a1 = a[9], a2 = a[10], a3 = a[11];
        a[8]  = a0*b00 + a1*b10 + a2*b20 + a3*b30;
        a[9]  = a0*b01 + a1*b11 + a2*b21 + a3*b31;
        a[10] = a0*b02 + a1*b12 + a2*b22 + a3*b32;
        a[11] = a0*b03 + a1*b13 + a2*b23 + a3*b33;
        a0 = a[12], a1 = a[13], a2 = a[14], a3 = a[15];
        a[12] = a0*b00 + a1*b10 + a2*b20 + a3*b30;
        a[13] = a0*b01 + a1*b11 + a2*b21 + a3*b31;
        a[14] = a0*b02 + a1*b12 + a2*b22 + a3*b32;
        a[15] = a0*b03 + a1*b13 + a2*b23 + a3*b33;
    }
    else if (elem instanceof Vec4){
        var res = new Vec4();
        res.x = a[0]*elem.x + a[4]*elem.y + a[8]*elem.z + a[12]*elem.w;
        res.y = a[1]*elem.x + a[5]*elem.y + a[9]*elem.z + a[13]*elem.w;
        res.z = a[2]*elem.x + a[6]*elem.y + a[10]*elem.z + a[14]*elem.w;
        res.w = elem.w;
        return res;
    }
    else{
        GLV.err("Invalid parameter in Mat4.mult() method.");
        return undefined;
    }
};

Mat4.prototype.determinant = function(){
    var a = this._;
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    var b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

Mat4.prototype.invert = function() {
    var a = this._;
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    var b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;
        
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    
    if (isNaN(det)) return null;
    det = 1.0 / det;

    a[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    a[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    a[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    a[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    a[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    a[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    a[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    a[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    a[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    a[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    a[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    a[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    a[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    a[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    a[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    a[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
};

Mat4.prototype.transpose = function(){
    var a = this._;
    var a01 = a[1], a02 = a[2], a03 = a[3], a12 = a[6], a13 = a[7], a23 = a[11];
    a[1] = a[4];
    a[2] = a[8];
    a[3] = a[12];
    a[6] = a[9];
    a[7] = a[13];
    a[11] = a[14];
    a[4] = a01;
    a[8] = a02;
    a[9] = a12;
    a[12] = a03;
    a[13] = a13;
    a[14] = a23;
}

Mat4.prototype.translate = function(v){
    var a = this._;
    a[12] += a[0]*v.x + a[4]*v.y + a[8]*v.z;
    a[13] += a[1]*v.x + a[5]*v.y + a[9]*v.z;
    a[14] += a[2]*v.x + a[6]*v.y + a[10]*v.z;
};

Mat4.prototype.scale = function(v){
    var a = this._;
    a[0] *= v[0]; a[1] *= v[0]; a[2] *= v[0]; a[3] *= v[0];
    a[4] *= v[1]; a[5] *= v[1]; a[6] *= v[1]; a[7] *= v[1];
    a[8] *= v[2]; a[9] *= v[2]; a[10] *= v[2]; a[11] *= v[2];
};

Mat4.prototype.rotate = function(alfa, axis){
    var a = this._;
    var x = axis[0], y = axis[1], z = axis[2];
    var len = Math.sqrt(x*x + y*y + z*z);

    if (Math.abs(len) < 0.000001) return;
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    var a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;
    
    var sin = Math.sin(alfa),
        cos = Math.cos(alfa),
        cos1 = 1 - cos;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = cos + x*x*cos1;   b01 = x*y*cos1 + z*sin; b02 = x*z*cos1 - y*sin;
    b10 = x*y*cos1 - z*sin; b11 = cos + y*y*cos1;   b12 = y*z*cos1 + x*sin;
    b20 = x*z*cos1 + y*sin; b21 = y*z*cos1 - x*sin; b22 = cos + z*z*cos1;

    // Perform rotation-specific matrix multiplication
    a[0] = a00 * b00 + a10 * b01 + a20 * b02;
    a[1] = a01 * b00 + a11 * b01 + a21 * b02;
    a[2] = a02 * b00 + a12 * b01 + a22 * b02;
    a[3] = a03 * b00 + a13 * b01 + a23 * b02;
    a[4] = a00 * b10 + a10 * b11 + a20 * b12;
    a[5] = a01 * b10 + a11 * b11 + a21 * b12;
    a[6] = a02 * b10 + a12 * b11 + a22 * b12;
    a[7] = a03 * b10 + a13 * b11 + a23 * b12;
    a[8] = a00 * b20 + a10 * b21 + a20 * b22;
    a[9] = a01 * b20 + a11 * b21 + a21 * b22;
    a[10] = a02 * b20 + a12 * b21 + a22 * b22;
    a[11] = a03 * b20 + a13 * b21 + a23 * b22;
};

Mat4.prototype.perspective = function (fovy, aspect, near, far) {
    var a = this._;
    var top = near*Math.tan(fovy*Math.PI/360),
        bottom = -top,
        right = top*aspect,
        left = -right;
    this.frustum(left, right, bottom, top, near, far);
};

Mat4.prototype.frustum = function(left, right, bottom, top, near, far){
    var a = this._;
    var n2 = 2.0*near,
        diffX = right - left,
        diffY = top - bottom,
        diffZ = far - near;
    a[0] = n2/diffX;
    a[1] = 0;
    a[2] = 0;
    a[3] = 0;
    
    a[4] = 0;
    a[5] = n2/diffY;
    a[6] = 0;
    a[7] = 0;
    
    a[8] = (right + left) / diffX;
    a[9] = (top + bottom) / diffY;
    a[10] = -(far + near) / diffZ;
    a[11] = -1.0;
    
    a[12] = 0.0;
    a[13] = 0.0;
    a[14] = -(n2 * far) / diffZ;
    a[15] = 0.0;
};

Mat4.prototype.lookAt = function(eyePos, vrp, up){
    var a = this._;
    var forward = Vec3.subtract(vrp, eyePos);
    forward.normalize();
    var side = Vec3.cross(forward, up);
    if (side.norm() < 0.001){
        // Avoid degenerate case when forward and up are proportionals
        side = Vec3.cross(forward, new Vec3(up.x, up.z, -up.y));
    }
    side.normalize();
    up = Vec3.cross(side, forward);
    
    a[0] = side.x;
    a[4] = side.y;
    a[8] = side.z;
    a[12] = 0.0;
    
    a[1] = up.x;
    a[5] = up.y;
    a[9] = up.z;
    a[13] = 0.0;
    
    a[2] = -forward.x;
    a[6] = -forward.y;
    a[10] = -forward.z;
    a[14] = 0.0;
    
    a[3] = a[7] = a[11] = 0.0;
    a[15] = 1.0;
    this.translate(Vec3.negate(eyePos));
};


// Class static functions

Mat4.identity = function(){
    var res = new Mat4();
    res.loadIdentity();
    return res;
};
