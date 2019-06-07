// Class Mesh: it represents a 3D mesh with a set of vertices and a set of faces.
GLV.Mesh = function(){
    this.vertexArray = [];
    this.colorArray = [];
    this.indexArray = [];
    this.normalsArray = [];
    this.texCoordsArray = [];
    
    this.vertexGLBuffer = gl.createBuffer();
    this.colorGLBuffer = gl.createBuffer();
    this.indexGLBuffer = gl.createBuffer();
    this.normalsGLBuffer = gl.createBuffer();
    this.texCoordsGLBuffer = gl.createBuffer();
    
    this.useLight = false;
    this.parts = [];
};

GLV.Mesh.Part = function(type, len, ini, mtl){
    this.glType = (type === undefined)? gl.TRIANGLES : type;
    this.length = (len === undefined)? 0 : len;
    this.ini = (ini === undefined)? 0 : ini;
    this.mtl = (mtl === undefined)? new GLV.Material() : mtl;
};

GLV.Mesh.prototype.draw = function draw(){
    var shaderProg = GLV.ShaderManager.getActiveShader();
    gl.enableVertexAttribArray(shaderProg.aVertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexGLBuffer);
    gl.vertexAttribPointer(shaderProg.aVertexPosition, this.vertexGLBuffer.itemSize, gl.FLOAT, false, 0, 0);

    if (shaderProg.aVertexColor >= 0){
        gl.enableVertexAttribArray(shaderProg.aVertexColor);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorGLBuffer);
        gl.vertexAttribPointer(shaderProg.aVertexColor, this.colorGLBuffer.itemSize, gl.FLOAT, false, 0, 0);
    }
    if (shaderProg.aVertexNormal >= 0){
        gl.enableVertexAttribArray(shaderProg.aVertexNormal);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsGLBuffer);
        gl.vertexAttribPointer(shaderProg.aVertexNormal, this.normalsGLBuffer.itemSize, gl.FLOAT, false, 0, 0);
    }
    if (shaderProg.aTexCoord >= 0 && this.texCoordsArray.length > 0){
        gl.enableVertexAttribArray(shaderProg.aTexCoord);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsGLBuffer);
        gl.vertexAttribPointer(shaderProg.aTexCoord, this.texCoordsGLBuffer.itemSize, gl.FLOAT, false, 0, 0);
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexGLBuffer);
    for (var i = 0; i < this.parts.length; ++i){
        gl.uniform4fv(shaderProg.uMaterialAmbient, this.parts[i].mtl.ambient);
        gl.uniform4fv(shaderProg.uMaterialDiffuse, this.parts[i].mtl.diffuse);
        gl.uniform4fv(shaderProg.uMaterialSpecular, this.parts[i].mtl.specular);
        gl.uniform1f(shaderProg.uShininess, this.parts[i].mtl.shininess);
        // Multiply the last parameter by 2 because the indices are UNSIGNED_SHORT -> 2 bytes
        gl.drawElements(this.parts[i].glType, this.parts[i].length, gl.UNSIGNED_SHORT, this.parts[i].ini*2);
    }
    
    // Unbind the GL buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

GLV.Mesh.prototype.bindBuffers = function(){
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexGLBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorGLBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colorArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsGLBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalsArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsGLBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoordsArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexGLBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    this.vertexGLBuffer.itemSize = 3;
    this.vertexGLBuffer.numItems = this.vertexArray.length / 3;
    this.colorGLBuffer.itemSize = 4;
    this.colorGLBuffer.numItems = this.colorArray.length / 4;
    this.normalsGLBuffer.itemSize = 3;
    this.normalsGLBuffer.numItems = this.normalsArray.length / 3;
    this.texCoordsGLBuffer.itemSize = 2;
    this.texCoordsGLBuffer.numItems = this.texCoordsArray.length / 2;
};

GLV.Mesh.loadObj = function(objStr, mtlStr){
    var mesh = new GLV.Mesh();
    var parser = new GLV.OBJParser();
    parser.load(objStr, mtlStr);
    parser.normalize();
    mesh.vertexArray = parser.v;
    mesh.normalsArray = parser.n;
    mesh.indexArray = parser.indices;
    mesh.colorArray = [];
    var iCol = 0;
    for (var i = 0; i < mesh.vertexArray.length; i += 3){
        mesh.colorArray[iCol] = 0.5;
        mesh.colorArray[iCol+1] = 0.5;
        mesh.colorArray[iCol+2] = 0.5;
        mesh.colorArray[iCol+3] = 1.0;
        iCol += 4;
    }
    mesh.useLight = true;
    mesh.parts = parser.parts;
    mesh.bindBuffers();
    mesh.mtls = parser.mtls;
    return mesh;
};


// Procedural 3D geometry

GLV.Mesh.createCube = function(color){
    var mesh = new GLV.Mesh();
    mesh.vertexArray = [
        // Front face
        -0.5, -0.5,  0.5,
         0.5, -0.5,  0.5,
        -0.5,  0.5,  0.5,
         0.5,  0.5,  0.5,
        // Right face
         0.5, -0.5,  0.5,
         0.5, -0.5, -0.5,
         0.5,  0.5,  0.5,
         0.5,  0.5, -0.5,
        // Back face
        -0.5, -0.5, -0.5,
         0.5, -0.5, -0.5,
        -0.5,  0.5, -0.5,
         0.5,  0.5, -0.5,
        // Left face
        -0.5, -0.5,  0.5,
        -0.5, -0.5, -0.5,
        -0.5,  0.5,  0.5,
        -0.5,  0.5, -0.5,
        // Bottom face
        -0.5, -0.5,  0.5,
         0.5, -0.5,  0.5,
        -0.5, -0.5, -0.5,
         0.5, -0.5, -0.5,
        // Up face
        -0.5,  0.5,  0.5,
         0.5,  0.5,  0.5,
        -0.5,  0.5, -0.5,
         0.5,  0.5, -0.5
    ];
    mesh.normalsArray = [
        // Front face
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
        // Right face
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
        // Back face
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
        // Left face
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        // Bottom face
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
        // Up face
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0
    ];
    mesh.colorArray = [];
    for (var i = 0; i < 24*4; i += 4){
        mesh.colorArray[i] = color[0];
        mesh.colorArray[i+1] = color[1];
        mesh.colorArray[i+2] = color[2];
        mesh.colorArray[i+3] = color[3];
    }
    mesh.indexArray = [
         0,  1,  2,    1,  2,  3, // Front face
         4,  5,  6,    5,  6,  7, // Right face
         8,  9, 10,    9, 10, 11, // Back face
        12, 13, 14,   13, 14, 15, // Left face
        16, 17, 18,   17, 18, 19, // Bottom face
        20, 21, 22,   21, 22, 23  // Up face
    ];
    mesh.texCoordsArray = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        // Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0
    ];
    mesh.bindBuffers();
    mesh.parts = [new GLV.Mesh.Part(gl.TRIANGLES, mesh.indexArray.length)];
    return mesh;
};

GLV.Mesh.createPlane = function(){
    var mesh = new GLV.Mesh();
    mesh.vertexArray = [
        // Front face
        -0.5, -0.5,  0.0,
         0.5, -0.5,  0.0,
        -0.5,  0.5,  0.0,
         0.5,  0.5,  0.0
    ];
    mesh.normalsArray = [
        // Front face
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0
    ];
    mesh.colorArray = [
        // Front face
        0.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
    ];
    mesh.indexArray = [
         0,  1,  2,    1,  2,  3, // Front face
    ];
    mesh.texCoordsArray = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];
    mesh.bindBuffers();
    mesh.parts = [new GLV.Mesh.Part(gl.TRIANGLES, mesh.indexArray.length)];
    return mesh;
};

GLV.Mesh.createSphere = function(vSlices, hSlices, color){
    if (vSlices === undefined || hSlices === undefined || vSlices < 2 || hSlices < 2){
        GLV.err("Invalid parameter in GLV.Mesh.createSphere() method.");
        return null;
    }
    var obj = new GLV.Mesh();
    var vIncr = Math.PI/vSlices, hIncr = 2*Math.PI/hSlices;
    var iVer = 0, iCol = 0, iInd = 0;
    
    var pushVertex = function(v){
        obj.vertexArray[iVer] = v[0];
        obj.vertexArray[iVer+1] = v[1];
        obj.vertexArray[iVer+2] = v[2];
        obj.normalsArray[iVer] = v[0];
        obj.normalsArray[iVer+1] = v[1];
        obj.normalsArray[iVer+2] = v[2];
        obj.colorArray[iCol] = color[0];
        obj.colorArray[iCol+1] = color[1];
        obj.colorArray[iCol+2] = color[2];
        obj.colorArray[iCol+3] = 1.0;
        iVer += 3;
        iCol += 4;
    };
    
    var pushIndex = function(ind){
        obj.indexArray[iInd] = ind;
        ++iInd;
    };
    
    pushVertex([0.0, -1.0, 0.0]);
    for (var i = 1, theta = -Math.PI/2+vIncr; i < vSlices; ++i, theta += vIncr){
        for (var j = 0, phi = 0.0; j < hSlices; ++j, phi += hIncr){
            pushVertex([Math.cos(theta)*Math.cos(phi),
                        Math.sin(theta),
                        Math.cos(theta)*Math.sin(phi)]);
        }
    }
    pushVertex([0.0, 1.0, 0.0]);
    var lastVert = iVer/3-1;
    
    // Create the index array
    var createTriangleFan = function(iMain, iStrip){
        var startInd = obj.indexArray.length;
        pushIndex(iMain);
        for (var i = iStrip; i < iStrip+hSlices; ++i) pushIndex(i);
        pushIndex(iStrip);
        return new GLV.Mesh.Part(gl.TRIANGLE_FAN, hSlices+2, startInd);
    };

    var CreateTriangleStrip = function(iIniDown){
        var startInd = obj.indexArray.length;
        var iIniUp = iIniDown+hSlices;
        for (var i = 0; i < hSlices; ++i){
            pushIndex(iIniDown+i);
            pushIndex(iIniUp+i);
        }
        pushIndex(iIniDown);
        pushIndex(iIniUp);
        return new GLV.Mesh.Part(gl.TRIANGLE_STRIP, 2*hSlices+2, startInd);
    };
    
    // Below pole of the sphere -> TRIANGLE_FAN
    obj.parts.push(createTriangleFan(0, 1));
    
    // Body of the sphere -> TRIANGLE_STRIP
    for (var i = 0; i < vSlices-2; ++i)
        obj.parts.push(CreateTriangleStrip(1+i*hSlices));
    
    // Above pole of the sphere -> TRIANGLE_FAN
    obj.parts.push(createTriangleFan(lastVert, lastVert-hSlices));
    
    obj.bindBuffers();
    return obj;
};
