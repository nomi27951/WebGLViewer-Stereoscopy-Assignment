// Class Utils: contains some util functions.
GLV.Utils = new function(){};

GLV.log = function(text1, text2){
    if (GLV.DEBUG){
        if (text2 == null){
            console.log(GLV.log.caller.name+"          "+text1);
        }
        else{
            console.log(text1+"          "+text2)
        }
    }
};

GLV.err = function(errMsg){
    console.error(errMsg);
};

GLV.Utils.degToRad = function(degrees){
    return degrees * Math.PI / 180;
};

GLV.Utils.createPlane = function(n, point){
    n.normalize();
    return new Vec4(n.x, n.y, n.z, -Vec3.dot(n, point));
};

GLV.Utils.distancePlanePoint = function(plane, point){ // ( plane = Vec4, point = Vec3)
    return Math.abs(Vec4.dot(plane, point.toVec4(1.0)))/(plane.toVec3().norm())
};
