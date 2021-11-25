import { Card, CardContent } from '@mui/material';
import { useEffect } from "react";
import * as MV from '../Common/MV';
import * as INIT from '../Common/initShaders';
import * as UTILS from '../Common/webgl-utils';

import { animShaders } from '../shaders';
import { StateManager } from "../util/StateManager";

// Global variables
let ANIM_CANVAS: any;
let ANIM_CANVAS_GL: WebGLRenderingContext;
let WEBGL_PROGRAM: any;

// ))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))
var NumVertices = 36; //(6 faces)(2 trianANIM_CANVAS_GLes/face)(3 vertices/trianANIM_CANVAS_GLe)

var points: any[] = [];
var colors: any[] = [];

var vertices = [
    MV.vec4( -0.5, -0.5,  0.5, 1.0 ),
    MV.vec4( -0.5,  0.5,  0.5, 1.0 ),
    MV.vec4(  0.5,  0.5,  0.5, 1.0 ),
    MV.vec4(  0.5, -0.5,  0.5, 1.0 ),
    MV.vec4( -0.5, -0.5, -0.5, 1.0 ),
    MV.vec4( -0.5,  0.5, -0.5, 1.0 ),
    MV.vec4(  0.5,  0.5, -0.5, 1.0 ),
    MV.vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = [
    MV.vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    MV.vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    MV.vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    MV.vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    MV.vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    MV.vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    MV.vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    MV.vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

// Parameters controlling the size of the Robot's arm
var BASE_HEIGHT      = 2.0;
var BASE_WIDTH       = 5.0;
var LOWER_ARM_HEIGHT = 5.0;
var LOWER_ARM_WIDTH  = 0.5;
var UPPER_ARM_HEIGHT = 5.0;
var UPPER_ARM_WIDTH  = 0.5;

// Shader transformation matrices
var modelViewMatrix: any, projectionMatrix;

// Array of rotation anANIM_CANVAS_GLes (in degrees) for each rotation axis
var Base = 0;
var LowerArm = 1;
var UpperArm = 2;

var theta= [ 0, 0, 0];

var anANIM_CANVAS_GLe = 0;

var modelViewMatrixLoc: any;

var vBuffer, cBuffer;

function quad(a: number, b: number, c: number, d: number) {
    colors.push(vertexColors[a]); 
    points.push(vertices[a]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[b]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[c]);
    colors.push(vertexColors[a]); 
    points.push(vertices[a]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[c]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[d]); 
}

function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

// Remmove when scale in MV.js supports scale matrices
function scale4(a: number, b: number, c: number) {
   var result = MV.mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

// ))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))

export default function AnimArea() {
    useEffect(initAnimCanvas);

    return (
        <Card>
            <CardContent style={{ backgroundColor: '#3b4245' }}>
                <canvas id={'macanvas'} width={'520'} height={'550'} />
            </CardContent>
        </Card>
    );
}

/**
 * Initializes webANIM_CANVAS_GL for the main painiting ANIM_CANVAS
 */
function initAnimCanvas() {
    ANIM_CANVAS = document.getElementById('macanvas');
    if (!ANIM_CANVAS)
        throw new Error('Couldn\'t create the ANIM_CANVAS');

    ANIM_CANVAS_GL = UTILS.WebGLUtils.setupWebGL(ANIM_CANVAS, null);
    if (!ANIM_CANVAS_GL) { alert("WebGL isn't available"); }

    ANIM_CANVAS_GL.viewport(0, 0, ANIM_CANVAS.clientWidth, ANIM_CANVAS.clientHeight);
    ANIM_CANVAS_GL.clearColor(0.8, 0.8, 0.8, 1.0);
    ANIM_CANVAS_GL.enable(ANIM_CANVAS_GL.DEPTH_TEST);

    /*****  Load shaders and initialize attribute buffers *****/
    WEBGL_PROGRAM = INIT.initShaders(ANIM_CANVAS_GL, animShaders.vertexShader, animShaders.fragmentShader);
    ANIM_CANVAS_GL.useProgram(WEBGL_PROGRAM);

    //  Load shaders and initialize attribute buffers
    colorCube();

    // Create and initialize  buffer objects
    vBuffer = ANIM_CANVAS_GL.createBuffer();
    ANIM_CANVAS_GL.bindBuffer( ANIM_CANVAS_GL.ARRAY_BUFFER, vBuffer );
    ANIM_CANVAS_GL.bufferData( ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(points), ANIM_CANVAS_GL.STATIC_DRAW );
    
    var vPosition = ANIM_CANVAS_GL.getAttribLocation( WEBGL_PROGRAM, "vPosition" );
    ANIM_CANVAS_GL.vertexAttribPointer( vPosition, 4, ANIM_CANVAS_GL.FLOAT, false, 0, 0 );
    ANIM_CANVAS_GL.enableVertexAttribArray( vPosition );

    cBuffer = ANIM_CANVAS_GL.createBuffer();
    ANIM_CANVAS_GL.bindBuffer( ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer );
    ANIM_CANVAS_GL.bufferData( ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(colors), ANIM_CANVAS_GL.STATIC_DRAW );

    var vColor = ANIM_CANVAS_GL.getAttribLocation( WEBGL_PROGRAM, "vColor" );
    ANIM_CANVAS_GL.vertexAttribPointer( vColor, 4, ANIM_CANVAS_GL.FLOAT, false, 0, 0 );
    ANIM_CANVAS_GL.enableVertexAttribArray( vColor );

    StateManager.getInstance().subscribe('slider-1', () => {
        theta[0] = StateManager.getInstance().getState('slider-1');
    });

    StateManager.getInstance().subscribe('slider-2', () => {
        theta[1] = StateManager.getInstance().getState('slider-2');
    });

    StateManager.getInstance().subscribe('slider-3', () => {
        theta[2] = StateManager.getInstance().getState('slider-3');
    });

    modelViewMatrixLoc = ANIM_CANVAS_GL.getUniformLocation(WEBGL_PROGRAM, "modelViewMatrix");

    projectionMatrix = MV.ortho(-10, 10, -10, 10, -10, 10);
    ANIM_CANVAS_GL.uniformMatrix4fv( ANIM_CANVAS_GL.getUniformLocation(WEBGL_PROGRAM, "projectionMatrix"),  false, MV.flatten(projectionMatrix) );
    
    render();
}

/**
 * This function will be called on every fram to calculate what to draw to the frame buffer
 */
function render() {
   ANIM_CANVAS_GL.clear( ANIM_CANVAS_GL.COLOR_BUFFER_BIT |ANIM_CANVAS_GL.DEPTH_BUFFER_BIT );

    modelViewMatrix = MV.rotate(theta[Base], 0, 1, 0 );
    base();

    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, BASE_HEIGHT, 0.0)); 
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(theta[LowerArm], 0, 0, 1 ));
    lowerArm();

    modelViewMatrix  = MV.mult(modelViewMatrix, MV.translate(0.0, LOWER_ARM_HEIGHT, 0.0));
    modelViewMatrix  = MV.mult(modelViewMatrix, MV.rotate(theta[UpperArm], 0, 0, 1) );
    upperArm();

    requestAnimationFrame(render);
}

function base() {
    var s = scale4(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = MV.mult( MV.translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ), s);
    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc,  false, MV.flatten(t) );
    ANIM_CANVAS_GL.drawArrays( ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices );
}

function upperArm() {
    var s = scale4(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    var instanceMatrix = MV.mult(MV.translate( 0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ),s);    
    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv( modelViewMatrixLoc,  false, MV.flatten(t) );
    ANIM_CANVAS_GL.drawArrays( ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices );
}

function lowerArm() {
    var s = scale4(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = MV.mult( MV.translate( 0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0 ), s);
    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv( modelViewMatrixLoc,  false, MV.flatten(t) );
    ANIM_CANVAS_GL.drawArrays( ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices );
}
