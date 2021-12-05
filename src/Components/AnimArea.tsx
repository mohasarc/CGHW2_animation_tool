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

var stack: any[] = [];
var headPoints: any[] = [];

var sliderInfo = 0;


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
    
    MV.vec4(0.0, 0.0, 0.0, 1.0),  // black
    MV.vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    MV.vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    MV.vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    MV.vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    MV.vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    MV.vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    MV.vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan

];

var bodyPart = 0;


//Body part id's
var upperBodyId = 1;
var lowerBodyId = 0;
var headId = 2;
var head1Id = 1;
var head2Id = 14;

//Neck
var neckHeight = 0.5;
var neckWidth = 1.0;

//Shoulder
var shoulderHeight = 1.0;
var shoulderWidth = 1.0;

//Arms
var rightUpperArmId = 3;
var rightLowerArmId = 4;
var leftUpperArmId = 5;
var leftLowerArmId = 6;

//Front legs
var leftFrontUpperLegId = 7;
var leftFrontLowerLegId = 8;
var rightFrontUpperLegId = 9;
var rightFrontLowerLegId = 10;

//back legs
var leftBackUpperLegId = 11;
var leftBackLowerLegId = 12;
var rightBackUpperLegId = 13;
var rightBackLowerLegId = 14;


//Measurements
var upperBodyHeight = 4.0;
var upperBodyWidth = 5.0;

var lowerBodyHeight = 5.0;
var lowerBodyWidth = 12.0;

var headHeight = 2.0;
var headWidth = 2.0;


//Arms
var upperArmHeight = 2.0;
var upperArmWidth = 1.0;
var lowerArmHeight = 2.0;
var lowerArmWidth = 1.0;


//Front legs
var upperLegHeight = 2.0;
var upperLegWitdh = 1.0;
var lowerLegHeight = 3.0;
var lowerLegWidth = 3.0;

//Face mesaurements
var eye = 0.25;
var noseHeight = 0.5;
var noseWidth = 0.25;


// Parameters controlling the size of the Robot's arm
var BASE_HEIGHT      = 2.0;
var BASE_WIDTH       = 5.0;
var LOWER_ARM_HEIGHT = 3.0;
var LOWER_ARM_WIDTH  = 0.5;
var UPPER_ARM_HEIGHT = 5.0;
var UPPER_ARM_WIDTH = 0.5;
var UPPER_ARM2_HEIGHT = 5.0;
var UPPER_ARM2_WIDTH  = 0.5;

// Shader transformation matrices
var modelViewMatrix: any, projectionMatrix;

// Array of rotation anANIM_CANVAS_GLes (in degrees) for each rotation axis
var Base = 0;
var LowerArm = 1;
var UpperArm = 2;
var UpperArm2 = 3;


var theta = [45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var thetaX = [0, 50, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var thetaY = [0, 50, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var thetaZ = [0, 0, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var anANIM_CANVAS_GLe = 0;

var modelViewMatrixLoc: any;

var vBuffer, cBuffer: WebGLBuffer|null;


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
        sliderInfo = 0;
    });

    StateManager.getInstance().subscribe('slider-2', () => {
        thetaX[bodyPart] = StateManager.getInstance().getState('slider-2');
        sliderInfo = 1;

    });

    StateManager.getInstance().subscribe('slider-3', () => {
        thetaY[bodyPart] = StateManager.getInstance().getState('slider-3');
        sliderInfo = 2;

    });
    StateManager.getInstance().subscribe('slider-4', () => {
        thetaZ[bodyPart] = StateManager.getInstance().getState('slider-4');
        sliderInfo = 3;

    });
    StateManager.getInstance().subscribe('buttons', () => {
        bodyPart = StateManager.getInstance().getState('buttons');
        //console.log(bodyPart);

    });
    ANIM_CANVAS.addEventListener("mousedown", function (event: MouseEvent) {
      
    });


    modelViewMatrixLoc = ANIM_CANVAS_GL.getUniformLocation(WEBGL_PROGRAM, "modelViewMatrix");
    projectionMatrix = MV.ortho(-10, 10, -10, 10, -10, 10);
    ANIM_CANVAS_GL.uniformMatrix4fv( ANIM_CANVAS_GL.getUniformLocation(WEBGL_PROGRAM, "projectionMatrix"),  false, MV.flatten(projectionMatrix) );
    console.log(points);
    render();
}

/**
 * This function will be called on every fram to calculate what to draw to the frame buffer
 */
function render() {

    ANIM_CANVAS_GL.clear(ANIM_CANVAS_GL.COLOR_BUFFER_BIT | ANIM_CANVAS_GL.DEPTH_BUFFER_BIT);

    modelViewMatrix = MV.rotate(20, 1, 0, 0);
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(theta[lowerBodyId], 0, 1, 0));

    lowerBody();

    stack.push(modelViewMatrix);
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(-lowerBodyWidth / 2 + 1.5, -lowerBodyHeight/2 + 0.65 * lowerBodyHeight, 0.0));
    let upperBodyXRotation = 90 * thetaX[upperBodyId] / 100;
    let upperBodyYRotation = 90 * thetaY[upperBodyId] / 100;
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(upperBodyXRotation-45, 1, 0, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(upperBodyYRotation -45, 0, 1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaZ[upperBodyId], 0, 0, 1));
    upperBody();

    stack.push(modelViewMatrix);
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, upperBodyHeight, 0.0));
    neck();

    modelViewMatrix = stack.pop();
    stack.push(modelViewMatrix);
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, upperBodyHeight + neckHeight, 0.0));
    let headXRotation = 180 * thetaX[headId] / 100;
    let headYRotation = 180 * thetaY[headId] / 100;
    let headZRotation = 100 * thetaZ[headId] / 100;
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(headXRotation-90, 1, 0, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(headYRotation - 90, 0, 1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(headZRotation - 45, 0, 0, 1));
    head();

    stack.push(modelViewMatrix);
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(-headWidth/2, headHeight/2 + 0.2, 0.5));
    rightEye();

    modelViewMatrix = stack.pop();
    stack.push(modelViewMatrix);
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(-headWidth / 2, headHeight / 2 + 0.2, -0.5));
    leftEye();

    modelViewMatrix = stack.pop();
    stack.push(modelViewMatrix);
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(-headWidth / 2, headHeight / 2 , 0.0));
    nose();

    modelViewMatrix = stack.pop();
    modelViewMatrix = stack.pop();
    stack.push(modelViewMatrix);
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, upperBodyHeight - shoulderHeight, upperBodyWidth / 2 + upperArmWidth / 2));
    shoulder();

    let rightUpperArmXRotation = 180 * thetaX[rightUpperArmId] / 100;
    let rightUpperArmZRotation = 180 * thetaZ[rightUpperArmId] / 100;
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, shoulderWidth/2, 0.0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(rightUpperArmXRotation, -1, 0, 0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaY[rightUpperArmId], 0, -1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(rightUpperArmZRotation, 0, 0, -1));
    rightUpperArm();

    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, -upperArmHeight+0.5, 0.0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaX[rightLowerArmId], -1, 0, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaY[rightLowerArmId], 0, -1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaZ[rightLowerArmId], 0, 0, -1));
    rightLowerArm();

    //modelViewMatrix = stack.pop();
    modelViewMatrix = stack.pop();
    stack.push(modelViewMatrix);
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, upperBodyHeight - shoulderHeight, -upperBodyWidth / 2 - upperArmWidth / 2));
    shoulder();

    let leftUpperArmXRotation = 180 * thetaX[leftUpperArmId] / 100;
    let leftUpperArmZRotation = 180 * thetaZ[leftUpperArmId] / 100;
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, shoulderWidth / 2, 0.0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(leftUpperArmXRotation, 1, 0, 0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(-thetaY[leftUpperArmId], 0, 1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(-leftUpperArmZRotation, 0, 0, 1));
    leftUpperArm();

    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, -upperArmHeight + 0.5, 0.0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaX[leftLowerArmId], 1, 0, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaY[leftLowerArmId], 0, -1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaZ[leftLowerArmId], 0, 0, -1));
    leftLowerArm();


    modelViewMatrix = stack.pop();
    modelViewMatrix = stack.pop();
    stack.push(modelViewMatrix);
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(-lowerBodyWidth / 2 + upperLegWitdh * 3, -lowerBodyHeight + 0.5 * lowerBodyHeight, lowerBodyHeight / 2 - upperLegWitdh / 2));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaX[leftFrontUpperLegId], 1, 0, 0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaY[leftFrontUpperLegId], 0, 1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaZ[leftFrontUpperLegId], 0, 0, 1));
    leftFrontUpperLeg();

    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, -lowerLegHeight, 0.0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaX[leftFrontLowerLegId], 1, 0, 0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaY[leftFrontLowerLegId], 0, 1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaZ[leftFrontLowerLegId], 0, 0, 1));
    leftFrontLowerLeg();

    modelViewMatrix = stack.pop();
    stack.push(modelViewMatrix);

    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(-lowerBodyWidth / 2 + upperLegWitdh * 3, -lowerBodyHeight + 0.5 * lowerBodyHeight, -lowerBodyHeight / 2 + upperLegWitdh / 2));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaX[rightFrontUpperLegId], 1, 0, 0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaY[rightFrontUpperLegId], 0, 1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaZ[rightFrontUpperLegId], 0, 0, 1));
    rightFrontUpperLeg();

    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, -lowerLegHeight, 0.0));
   // modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaX[rightFrontLowerLegId], 1, 0, 0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaY[rightFrontLowerLegId], 0, 1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaZ[rightFrontLowerLegId], 0, 0, 1));
    rightFrontLowerLeg();

    modelViewMatrix = stack.pop();
    stack.push(modelViewMatrix);
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(lowerBodyWidth / 2 - upperLegWitdh * 3, -lowerBodyHeight + 0.5 * lowerBodyHeight, lowerBodyHeight / 2 - upperLegWitdh / 2));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaX[leftBackUpperLegId], 1, 0, 0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaY[leftBackUpperLegId], 0, 1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaZ[leftBackUpperLegId], 0, 0, 1));
    leftBackUpperLeg();

    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, -lowerLegHeight, 0.0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaX[leftBackLowerLegId], 1, 0, 0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaY[leftBackLowerLegId], 0, 1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaZ[leftBackLowerLegId], 0, 0, 1));
    leftBackLowerLeg();
    
    modelViewMatrix = stack.pop();
    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(lowerBodyWidth / 2 - upperLegWitdh * 3, -lowerBodyHeight + 0.5 * lowerBodyHeight, -lowerBodyHeight / 2 + upperLegWitdh / 2));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaX[rightBackUpperLegId], 1, 0, 0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaY[rightBackUpperLegId], 0, 1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaZ[rightBackUpperLegId], 0, 0, 1));
    rightBackUpperLeg();

    modelViewMatrix = MV.mult(modelViewMatrix, MV.translate(0.0, -lowerLegHeight, 0.0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaX[rightBackLowerLegId], 1, 0, 0));
    //modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaY[rightBackLowerLegId], 0, 1, 0));
    modelViewMatrix = MV.mult(modelViewMatrix, MV.rotate(thetaZ[rightBackLowerLegId], 0, 0, 1));
    rightBackLowerLeg();
    
    requestAnimationFrame(render);
}


function lowerBody() {
    var lowerColor = [];

    var s = scale4(lowerBodyWidth, lowerBodyHeight, lowerBodyHeight);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.33* lowerBodyHeight, 0.0), s);
    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));
    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        lowerColor.push(MV.vec4(0.31, 0.16, 0.04, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(lowerColor), ANIM_CANVAS_GL.STATIC_DRAW);
    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);

}


function neck() {

    var headColor = [];
    var s = scale4(neckWidth, neckHeight, neckWidth);
    var instanceMatrix = MV.mult(MV.translate(0.0, 0.5 * neckHeight, 0.0), s);
    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));
    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        headColor.push(MV.vec4(0.8, 0.67, 0.55, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(headColor), ANIM_CANVAS_GL.STATIC_DRAW);
    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}
function shoulder() {

    var headColor = [];
    var s = scale4(shoulderWidth, shoulderHeight, shoulderWidth);
    var instanceMatrix = MV.mult(MV.translate(0.0, 0.5 * shoulderHeight, 0.0), s);
    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));
    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        headColor.push(MV.vec4(0.8, 0.67, 0.55, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(headColor), ANIM_CANVAS_GL.STATIC_DRAW);
    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function head() {

    var headColor = [];
    var s = scale4(headWidth, headHeight, headWidth);
    var instanceMatrix = MV.mult(MV.translate(0.0, 0.5 * headHeight, 0.0), s);
    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));
    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36;i++)
        headColor.push(MV.vec4(0.8, 0.67, 0.55, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(headColor), ANIM_CANVAS_GL.STATIC_DRAW);
    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function rightEye() {

    var eyeColor = [];
    var s = scale4(eye, eye, eye);
    var instanceMatrix = MV.mult(MV.translate(0.0, 0.5 * eye, 0.0), s);
    var t = MV.mult(modelViewMatrix, instanceMatrix);

    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));
    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        eyeColor.push(MV.vec4(0.0, 0.0, 1.0, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(eyeColor), ANIM_CANVAS_GL.STATIC_DRAW);
    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}
function leftEye() {

    var eyeColor = [];
    var s = scale4(eye, eye, eye);
    var instanceMatrix = MV.mult(MV.translate(0.0, 0.5 * eye, 0.0), s);
    var t = MV.mult(modelViewMatrix, instanceMatrix);

    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));
    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        eyeColor.push(MV.vec4(0.0, 0.0, 1.0, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(eyeColor), ANIM_CANVAS_GL.STATIC_DRAW);
    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function nose() {

    var noseColor = [];
    var s = scale4(noseWidth, noseHeight, noseWidth);
    var instanceMatrix = MV.mult(MV.translate(0.0, 0.5 * noseHeight, 0.0), s);
    var t = MV.mult(modelViewMatrix, instanceMatrix);

    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));

    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        noseColor.push(MV.vec4(0.8, 0.8, 0.55, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(noseColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function leftFrontUpperLeg() {
    var legColor = [];

    var s = scale4(upperLegWitdh, upperLegHeight, upperLegWitdh);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.5 * lowerBodyHeight, 0.0), s);

    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));

    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        legColor.push(MV.vec4(0.31, 0.16, 0.04, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(legColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function leftFrontLowerLeg() {
    var legColor = [];

    var s = scale4(upperLegWitdh, upperLegHeight, upperLegWitdh);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.5 * upperLegHeight, 0.0), s);

    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));

    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        legColor.push(MV.vec4(0.31, 0.16, 0.04, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(legColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function rightFrontUpperLeg() {
    var legColor = [];

    var s = scale4(upperLegWitdh, upperLegHeight, upperLegWitdh);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.5 * lowerBodyHeight, 0.0), s);

    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));

    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        legColor.push(MV.vec4(0.31, 0.16, 0.04, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(legColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function rightFrontLowerLeg() {
    var legColor = [];

    var s = scale4(upperLegWitdh, upperLegHeight, upperLegWitdh);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.5 * upperLegHeight, 0.0), s);

    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));

    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        legColor.push(MV.vec4(0.31, 0.16, 0.04, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(legColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}


function leftBackUpperLeg() {
    var legColor = [];

    var s = scale4(upperLegWitdh, upperLegHeight, upperLegWitdh);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.5 * lowerBodyHeight, 0.0), s);

    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));

    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        legColor.push(MV.vec4(0.31, 0.16, 0.04, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(legColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function leftBackLowerLeg() {
    var legColor = [];

    var s = scale4(upperLegWitdh, upperLegHeight, upperLegWitdh);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.5 * upperLegHeight, 0.0), s);

    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));

    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        legColor.push(MV.vec4(0.31, 0.16, 0.04, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(legColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function rightBackUpperLeg() {
    var legColor = [];

    var s = scale4(upperLegWitdh, upperLegHeight, upperLegWitdh);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.5 * lowerBodyHeight, 0.0), s);

    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));

    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        legColor.push(MV.vec4(0.31, 0.16, 0.04, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(legColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function rightBackLowerLeg() {
    var legColor = [];

    var s = scale4(upperLegWitdh, upperLegHeight, upperLegWitdh);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.5 * upperLegHeight, 0.0), s);

    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));

    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        legColor.push(MV.vec4(0.31, 0.16, 0.04, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(legColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function rightUpperArm() {
    var armColor = [];

    var s = scale4(upperArmWidth, upperArmHeight, upperArmWidth);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.5 * upperArmHeight, 0.0), s);
    //instanceMatrix = MV.mult(MV.rotate(180,0,0,1), s);

    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));

    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        armColor.push(MV.vec4(0.8, 0.61, 0.55, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(armColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function rightLowerArm() {
    var armColor = [];

    var s = scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.5 * lowerArmHeight, 0.0), s);
    //instanceMatrix = MV.mult(MV.rotate(180, 0, 0, 1), s);

    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));


    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        armColor.push(MV.vec4(0.8, 0.61, 0.55, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(armColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function leftUpperArm() {
    var armColor = [];

    var s = scale4(upperArmWidth, upperArmHeight, upperArmWidth);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.5 * upperArmHeight, 0.0), s);
    //instanceMatrix = MV.mult(MV.rotate(180, 0, 0, 1), s);

    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));


    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        armColor.push(MV.vec4(0.8, 0.61, 0.55, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(armColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}

function leftLowerArm() {
    var armColor = [];

    var s = scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth);
    var instanceMatrix = MV.mult(MV.translate(0.0, -0.5 * lowerArmHeight, 0.0), s);
    //instanceMatrix = MV.mult(MV.rotate(180, 0, 0, 1), s);

    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));


    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        armColor.push(MV.vec4(0.8, 0.61, 0.55, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(armColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);

}

function upperBody() {
    var upperBodyColor = [];
    var s = scale4(3.0, upperBodyHeight, upperBodyWidth);
    var instanceMatrix = MV.mult(MV.translate(0.0, 0.5 * upperBodyHeight, 0.0), s);
    var t = MV.mult(modelViewMatrix, instanceMatrix);
    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));

    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);
    for (let i = 0; i < 36; i++)
        upperBodyColor.push(MV.vec4(0.8, 0.65, 0.55, 1.0));

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(upperBodyColor), ANIM_CANVAS_GL.STATIC_DRAW);

    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);
}
