// Class OBJParser: class for parsing obj and mtl files.
GLV.OBJParser = function(){

    // Variables
    
    var This = this;
    this.v = [];        // 4 positions per element
    this.t = [];        // 3 positions per element
    this.n = [];        // 3 positions per element
    this.indices = [];
    this.parts = [];
    this.mtls = {};
    
    // Functions
    
    this.load = function load(objStr, mtlStr){
        
        var removeComments = function(str){
            var index = str.indexOf("# ");
            if (index >= 0) return str.substring(0, index);
            else return str;
        };
        
        // Parse material
        if (mtlStr !== undefined){
            var lines = mtlStr.split('\n');
            try{
                var mtl = new GLV.Material();
                var name;
                for (var i = 0; i < lines.length; ++i){
                    var line = removeComments(lines[i]);
                    var words = line.match(/\S+/g);
                    if (words === null || words.length < 2) continue;
                    
                    if (words[0] === 'newmtl'){
                        if (name !== undefined) this.mtls[name] = mtl;
                        mtl = new GLV.Material();
                        name = words[1];
                    }
                    else if (words[0] === 'NS') mtl.shininess = parseFloat(words[1]);
                    else if (words[0] === 'Ka') mtl.ambient = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3]), 1.0];
                    else if (words[0] === 'Kd') mtl.diffuse = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3]), 1.0];
                    else if (words[0] === 'Ks') mtl.specular = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3]), 1.0];
                }
                if (name !== undefined) this.mtls[name] = mtl;
            }
            catch (e){
                throw e;
            }
        }
        
        
        
        var Vertex = function(){}
        var dict = {}; // Dictionary: d[neededVertex] = vertexIndex
        var ind = 0;
        
        var getIndex = function(vert){
            var key = ""+vert.x+" "+vert.y+" "+vert.z+" "
                        +vert.t1+" "+vert.t2+" "
                        +vert.nx+" "+vert.ny+" "+vert.nz;
            if (dict[key] === undefined){
                This.v[3*ind]   = vert.x;
                This.v[3*ind+1] = vert.y;
                This.v[3*ind+2] = vert.z;
                This.t[2*ind]   = vert.t1;
                This.t[2*ind+1] = vert.t2;
                This.n[3*ind]   = vert.nx;
                This.n[3*ind+1] = vert.ny;
                This.n[3*ind+2] = vert.nz;
                dict[key] = ind;
                ++ind;
            }
            return dict[key];
        };
        
        var vertices = [];
        var texcoords = [];
        var normals = [];
        var iVer = 0, iTex = 0, iNor = 0;
        
        var parseVertex = function(word1, word2, word3, word4){
            vertices[iVer] = parseFloat(word1);
            vertices[iVer+1] = parseFloat(word2);
            vertices[iVer+2] = parseFloat(word3);
            vertices[iVer+3] = (word4 === undefined)? 1.0 : parseFloat(word4);
            iVer += 4;
        };

        var parseTexCoords = function(word1, word2, word3){
            texcoords[iTex] = parseFloat(word1);
            texcoords[iTex+1] = parseFloat(word2);
            texcoords[iTex+2] = (word3 === undefined)? 0.0 : parseFloat(word3);
            iTex += 3;
        };

        var parseNormal = function(word1, word2, word3){
            normals[iNor] = parseFloat(word1);
            normals[iNor+1] = parseFloat(word2);
            normals[iNor+2] = parseFloat(word3);
            iNor += 3;
        };

        var parseFaceVertex = function(word){
            var parts = word.split('/');
            var faceInd = [];
            faceInd[0] = (parts[0] != undefined)? parseInt(parts[0])-1 : undefined;
            faceInd[1] = (parts[1] != undefined && parts[1] !== "")? parseInt(parts[1])-1 : undefined;
            faceInd[2] = (parts[2] != undefined)? parseInt(parts[2])-1 : undefined;
            return faceInd;
        };

        var parseFace = function(word1, word2, word3){
            var faceInd1 = parseFaceVertex(word1);
            var faceInd2 = parseFaceVertex(word2);
            var faceInd3 = parseFaceVertex(word3);
            
            var v1 = new Vertex(), v2 = new Vertex(), v3 = new Vertex();
            // Get indices
            v1.iV = 4*faceInd1[0]; v1.iT = 3*faceInd1[1]; v1.iN = 3*faceInd1[2];
            v2.iV = 4*faceInd2[0]; v2.iT = 3*faceInd2[1]; v2.iN = 3*faceInd2[2];
            v3.iV = 4*faceInd3[0]; v3.iT = 3*faceInd3[1]; v3.iN = 3*faceInd3[2];
            // Get vertices
            v1.x = vertices[v1.iV]; v1.y = vertices[v1.iV+1]; v1.z = vertices[v1.iV+2];
            v2.x = vertices[v2.iV]; v2.y = vertices[v2.iV+1]; v2.z = vertices[v2.iV+2];
            v3.x = vertices[v3.iV]; v3.y = vertices[v3.iV+1]; v3.z = vertices[v3.iV+2];
            // Get texcoords
            v1.t1 = texcoords[v1.iT]; v1.t2 = texcoords[v1.iT+1];
            v2.t1 = texcoords[v2.iT]; v2.t2 = texcoords[v2.iT+1];
            v3.t1 = texcoords[v3.iT]; v3.t2 = texcoords[v3.iT+1];
            // Get normals
            v1.nx = normals[v1.iN]; v1.ny = normals[v1.iN+1]; v1.nz = normals[v1.iN+2];
            v2.nx = normals[v2.iN]; v2.ny = normals[v2.iN+1]; v2.nz = normals[v2.iN+2];
            v3.nx = normals[v3.iN]; v3.ny = normals[v3.iN+1]; v3.nz = normals[v3.iN+2];
            // Compute normals if not exists
            if (v1.nx === undefined || v1.ny === undefined || v1.nz === undefined ||
                v2.nx === undefined || v2.ny === undefined || v2.nz === undefined ||
                v3.nx === undefined || v3.ny === undefined || v3.nz === undefined){
                var V12 = [v2.x - v1.x, v2.y - v1.y, v2.z - v1.z];
                var V13 = [v3.x - v1.x, v3.y - v1.y, v3.z - v1.z];
                var nx = V12[1]*V13[2]-V12[2]*V13[1];
                var ny = V12[2]*V13[0]-V12[0]*V13[2];
                var nz = V12[0]*V13[1]-V12[1]*V13[0];
                v1.nx = v2.nx = v3.nx = nx;
                v1.ny = v2.ny = v3.ny = ny;
                v1.nz = v2.nz = v3.nz = nz;
                
            }
            // Get the corresponding index
            This.indices.push(getIndex(v1));
            This.indices.push(getIndex(v2));
            This.indices.push(getIndex(v3));
        };
        
        // Parser algorithm
        
        try{
            var lines = objStr.split('\n');
            var currentPart = new GLV.Mesh.Part(undefined, undefined, this.indices.length);
            for (var i = 0; i < lines.length; ++i){
                var line = removeComments(lines[i]);
                var words = line.match(/\S+/g);
                if (words === null || words.length < 2) continue;
                
                if (words[0] === 'v'){
                    if (words.length != 4 && words.length != 5) throw new Error("vertex -> "+line);
                    else parseVertex(words[1], words[2], words[3], words[4]);
                }
                else if (words[0] === 'vt'){
                    if (words.length != 3 && words.length != 4) throw new Error("texcoords -> "+line);
                    else parseTexCoords(words[1], words[2], words[3]);
                }
                else if (words[0] === 'vn'){
                    if (words.length != 4) throw new Error("normal -> "+line);
                    else parseNormal(words[1], words[2], words[3]);
                }
                else if (words[0] === 'f'){
                    if (words.length < 4) throw new Error("face -> "+line);
                    for (var j = 2; j+1 < words.length; ++j){
                        parseFace(words[1], words[j], words[j+1]);
                    }
                }
                else if (words[0] === 'g'){
                    currentPart.length = this.indices.length - currentPart.ini;
                    if (currentPart.length > 0) this.parts.push(currentPart);
                    currentPart = new GLV.Mesh.Part(undefined, undefined, this.indices.length);
                }
                else if (words[0] === 'usemtl'){
                    if (this.mtls[words[1]] !== undefined) currentPart.mtl = this.mtls[words[1]];
                }
            }
            currentPart.length = this.indices.length - currentPart.ini;
            if (currentPart.length > 0) this.parts.push(currentPart);
        }
        catch (e){
            console.error(e.name + ": Invalid " + e.message);
            alert(e.name + ": Invalid " + e.message);
        }
    };
    
    this.normalize = function(){
        if (this.v.length < 3) return;
        var minX, maxX, minY, maxY, minZ, maxZ;
        minX = maxX = this.v[0], minY = maxY = this.v[1], minZ = maxZ = this.v[2];
        for (var i = 3; i < this.v.length; i += 3){
            var x = this.v[i], y = this.v[i+1], z = this.v[i+2];
            if (x < minX) minX = x
            else if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            else if (y > maxY) maxY = y;
            if (z < minZ) minZ = z;
            else if (z > maxZ) maxZ = z;
        }
        var centerX = (maxX + minX)/2,
            centerY = (maxY + minY)/2,
            centerZ = (maxZ + minZ)/2,
            diffX = (maxX - minX)/2,
            diffY = (maxY - minY)/2,
            diffZ = (maxZ - minZ)/2;
        
        // Center the model in (0,0,0)
        for (var i = 0; i < this.v.length; i += 3){
            this.v[i]   -= centerX;
            this.v[i+1] -= centerY;
            this.v[i+2] -= centerZ;
        }
        
        // Scale the model between the cube defined by (-1,-1,-1) and (1,1,1)
        var divVal = Math.max(diffX, diffY, diffZ);
        for (var i = 0; i < this.v.length; i += 3){
            this.v[i]   /= divVal;
            this.v[i+1] /= divVal;
            this.v[i+2] /= divVal;
        }
    };
};
