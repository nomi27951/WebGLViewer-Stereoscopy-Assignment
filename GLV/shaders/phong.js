var vs_phong = `
    attribute vec3 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec3 aVertexNormal;
     
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform mat4 uNMatrix;
    uniform vec3 uLightPosition;
     
    varying vec3 vNormal;
    varying vec3 vEyeVec;
    varying vec3 lightDirection;
    varying vec4 vColor;

    void main(void) {
        vec4 vertex = uMVMatrix * vec4(aVertexPosition, 1.0);
        
        vNormal = vec3(uNMatrix * vec4(aVertexNormal, 0.0));
        vEyeVec = -vec3(vertex.xyz);
        lightDirection = uLightPosition-vertex.xyz;
        
        vColor = aVertexColor;
        
        //Final vertex position
        gl_Position = uPMatrix * vertex;
    }
`;

var fs_phong = `
    precision highp float;
    
    uniform vec4 uLightAmbient;
    uniform vec4 uLightDiffuse;
    uniform vec4 uLightSpecular;
    
    uniform float uShininess;
    uniform vec4 uMaterialAmbient;
    uniform vec4 uMaterialDiffuse;
    uniform vec4 uMaterialSpecular;
    
    varying vec3 vNormal;
    varying vec3 vEyeVec;
    varying vec3 lightDirection;
    varying vec4 vColor;
    
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
        gl_FragColor = (phong(vNormal, vEyeVec, lightDirection) + vec4(0.3, 0.3, 0.3, 1.0)) * vColor;
    }
`;