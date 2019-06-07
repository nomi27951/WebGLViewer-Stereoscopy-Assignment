var vs_light = `
    attribute vec3 aVertexPosition;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    void main(void) {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    }
`;

var fs_light = `
    void main(void) {
        gl_FragColor = vec4(0.9, 0.9, 0.9, 1.0);
    }
`;