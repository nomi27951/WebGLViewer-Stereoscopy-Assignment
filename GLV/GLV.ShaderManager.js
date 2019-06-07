// Class ShaderManager: manager for the shaders of the program.
GLV.ShaderManager = {
    
    // Constants
    PHONG : 0,
    LIGHT : 1,
    CAVE_DISPLAY_SURFACE : 2,
    
    // Variables
    shaderPrograms : [],
    selectedShader : 0,
    
    // Private methods
    
    getShader : function(type, shaderStr){
        var shader = gl.createShader(type);
        gl.shaderSource(shader, shaderStr);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    },
    
    createShaderProgram : function(strVS, strFS){
        var vertexShader = this.getShader(gl.VERTEX_SHADER, strVS);
        var fragmentShader = this.getShader(gl.FRAGMENT_SHADER, strFS);
        var prog = gl.createProgram();
        gl.attachShader(prog, vertexShader);
        gl.attachShader(prog, fragmentShader);
        gl.linkProgram(prog);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            alert("Could not initialise shaders.");
            return null;
        }
        
        // Init shader variables
        prog.aVertexPosition   = gl.getAttribLocation(prog, "aVertexPosition");
        prog.aVertexColor      = gl.getAttribLocation(prog, "aVertexColor");
        prog.aVertexNormal     = gl.getAttribLocation(prog, "aVertexNormal");
        prog.aTexCoord         = gl.getAttribLocation(prog, "aTexCoord");
        prog.uPMatrix          = gl.getUniformLocation(prog, "uPMatrix");
        prog.uMVMatrix         = gl.getUniformLocation(prog, "uMVMatrix");
        prog.uNMatrix          = gl.getUniformLocation(prog, "uNMatrix");
        prog.uMaterialAmbient  = gl.getUniformLocation(prog, "uMaterialAmbient");
        prog.uMaterialDiffuse  = gl.getUniformLocation(prog, "uMaterialDiffuse");
        prog.uMaterialSpecular = gl.getUniformLocation(prog, "uMaterialSpecular");
        prog.uShininess        = gl.getUniformLocation(prog, "uShininess");
        prog.uLightAmbient     = gl.getUniformLocation(prog, "uLightAmbient");
        prog.uLightDiffuse     = gl.getUniformLocation(prog, "uLightDiffuse");
        prog.uLightSpecular    = gl.getUniformLocation(prog, "uLightSpecular");
        prog.uLightPosition    = gl.getUniformLocation(prog, "uLightPosition");
        
        return prog;
    },
    
    // Public methods
    init : function(){
        this.shaderPrograms[this.PHONG] = this.createShaderProgram(vs_phong, fs_phong);
        this.shaderPrograms[this.LIGHT] = this.createShaderProgram(vs_light, fs_light);
        this.shaderPrograms[this.CAVE_DISPLAY_SURFACE] = this.createShaderProgram(vs_cave_dispsurface, fs_cave_dispsurface);
    },
    
    getActiveShader : function(){
        return this.shaderPrograms[this.selectedShader];
    },
    
    setActiveShader : function(shaderIdx){
        if (shaderIdx >= 0 && shaderIdx < this.shaderPrograms.length){
            this.selectedShader = shaderIdx;
        }
        else{
            GLV.err("Error setting the active shader");
            return;
        }
        gl.useProgram(this.shaderPrograms[this.selectedShader]);
    },
};
