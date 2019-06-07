var vs_cave_dispsurface = `
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTexCoord;
    
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform mat4 uNMatrix;
    uniform vec3 uLightPosition;
    
    varying vec2 vTexCoord;
    varying vec3 vNormal;
    varying vec3 vEyeVec;
    varying vec3 lightDirection;

    void main(void) {
        vec4 vertex = uMVMatrix * vec4(aVertexPosition, 1.0);
        
        vTexCoord = aTexCoord;
        vNormal = vec3(uNMatrix * vec4(aVertexNormal, 0.0));
        vEyeVec = -vec3(vertex.xyz);
        lightDirection = uLightPosition-vertex.xyz;
        
        //Final vertex position
        gl_Position = uPMatrix * vertex;
    }
`;

var fs_cave_dispsurface = `
    precision mediump float;
    
    uniform vec4 uLightAmbient;
    uniform vec4 uLightDiffuse;
    uniform vec4 uLightSpecular;
    
    uniform float uShininess;
    uniform vec4 uMaterialAmbient;
    uniform vec4 uMaterialDiffuse;
    uniform vec4 uMaterialSpecular;
    
    uniform sampler2D textures[4]; // Front, left, right and bottom CAVE walls
    uniform int texIdx;
    
    varying vec2 vTexCoord;
    varying vec3 vNormal;
    varying vec3 vEyeVec;
    varying vec3 lightDirection;
    
    vec4 phong(vec3 N, vec3 V, vec3 L){
        N=normalize(N); V=normalize(V); L=normalize(L);
        vec3 R = normalize( 2.0*dot(N,L)*N-L );
        float NdotL = max( 0.0, dot( N,L ) );
        float RdotV = max( 0.0, dot( R,V ) );
        float Idiff = NdotL;
        float Ispec = pow( RdotV, uShininess );
        return
            uMaterialAmbient * uLightAmbient +
            uMaterialDiffuse * uLightDiffuse * Idiff+
            uMaterialSpecular * uLightSpecular * Ispec;
    }
    
    void main(void) {
        gl_FragColor = 0.5*phong(vNormal, vEyeVec, lightDirection);
        if (texIdx == 0) gl_FragColor += texture2D(textures[0], vec2(vTexCoord.s, vTexCoord.t));
        else if (texIdx == 1) gl_FragColor += texture2D(textures[1], vec2(vTexCoord.s, vTexCoord.t));
        else if (texIdx == 2) gl_FragColor += texture2D(textures[2], vec2(vTexCoord.s, vTexCoord.t));
        else if (texIdx == 3) gl_FragColor += texture2D(textures[3], vec2(vTexCoord.s, vTexCoord.t));
    }
`;
