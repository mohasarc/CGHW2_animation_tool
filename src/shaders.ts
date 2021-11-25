export const animShaders = {
    vertexShader: `
        attribute  vec4 vPosition;
        attribute  vec4 vColor;
        varying vec4 fColor;
        
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        
        void main() 
        {
            fColor = vColor;
            gl_Position = projectionMatrix * modelViewMatrix * vPosition;
        }
    `,
    fragmentShader: `
        precision mediump float;

        varying  vec4 fColor;
        
        void main() 
        { 
            gl_FragColor = fColor;
        }
    `,
}