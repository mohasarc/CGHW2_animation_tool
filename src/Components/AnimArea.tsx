import { Card, CardContent, Button } from '@mui/material';
import { useEffect } from "react";
import * as MV from '../Common/MV';
import * as INIT from '../Common/initShaders';
import * as UTILS from '../Common/webgl-utils';

import { animShaders } from '../shaders';
import { StateManager } from "../util/StateManager";

import importedModel from './model.json';

// Global variables
const MODEL: HierarchicalModel = importedModel;
const INTERPOLATED_MODEL : HierarchicalModel = JSON.parse(JSON.stringify(MODEL));
let ANIM_CANVAS: any;
let ANIM_CANVAS_GL: WebGLRenderingContext;
let WEBGL_PROGRAM: any;
const NumVertices = 36; //(6 faces)(2 trianANIM_CANVAS_GLes/face)(3 vertices/trianANIM_CANVAS_GLe)
const points: any[] = [];
const colors: any[] = [];
const stack: any[] = [];
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

var bodyPart: string = '';
let MODEL_VIEW_MATRIX: any;
let PROJECTION_MATRIX: any;
let modelViewMatrixLoc: any;
let vBuffer, cBuffer: WebGLBuffer|null;

StateManager.getInstance().setState('currentFrame', 0);
StateManager.getInstance().setState('frameCount', 1);
StateManager.getInstance().setState('play', false);

export interface HierarchicalModel {
    name: string,
    values: {
        anim: boolean,
        rx: number[], // relative to parent - values between 0 - 1
        ry: number[],
        rz: number[],
        anchorX: number[],
        anchorY: number[],
        anchorZ: number[],
        w: number[], // along x 
        h: number[], // along y
        l: number[], // along z
        thetaX: number[],
        thetaY: number[],
        thetaZ: number[],
        color: number[][],
        limits?: {
            thetaX?: {min: number, max: number},
            thetaY?: {min: number, max: number},
            thetaZ?: {min: number, max: number},
        }
    },
    children?: HierarchicalModel[],
}

StateManager.getInstance().setState('model', INTERPOLATED_MODEL);

export default function AnimArea() {
    useEffect(initAnimCanvas);

    return (
        <Card>
            <CardContent style={{ backgroundColor: '#3b4245' }}>
                <Button onClick = {() => {
                    const QUALIFYING_CHANGE = 5;
                    let frameCount = StateManager.getInstance().getState('frameCount');
                    addFrame(MODEL);

                    const interpolationFramesCount = Math.round(
                        calculateLongestInterval(StateManager.getInstance().getState('model')) / QUALIFYING_CHANGE
                    );
                    interpolate(StateManager.getInstance().getState('model'), interpolationFramesCount);
                    addFrame(StateManager.getInstance().getState('model'));
                    frameCount = frameCount + interpolationFramesCount + 1;
                    StateManager.getInstance().setState('frameCount', frameCount);
                    }
                } >add Frame</Button>
                <Button onClick = {() => {StateManager.getInstance().setState('play', true)}} >play </Button>
                <Button onClick = {() => {StateManager.getInstance().setState('play', false)}}>stop</Button>
                <br/>
                <canvas id={'macanvas'} width={'520'} height={'550'} />
            </CardContent>
        </Card>
    );
}

function addFrame(model: HierarchicalModel) {
    model.values.thetaX.push(model.values.thetaX[model.values.thetaX.length - 1]);
    model.values.thetaY.push(model.values.thetaY[model.values.thetaY.length - 1]);
    model.values.thetaZ.push(model.values.thetaZ[model.values.thetaZ.length - 1]);
    
    model.children?.forEach((child) => {
        addFrame(child);
    });
}

function calculateLongestInterval(model: HierarchicalModel) {
    const thetaX1 = model.values.thetaX[model.values.thetaX.length - 1];
    const thetaX2 = model.values.thetaX[model.values.thetaX.length - 2];
    const thetaY1 = model.values.thetaY[model.values.thetaY.length - 1];
    const thetaY2 = model.values.thetaY[model.values.thetaY.length - 2];
    const thetaZ1 = model.values.thetaZ[model.values.thetaZ.length - 1];
    const thetaZ2 = model.values.thetaZ[model.values.thetaZ.length - 2];

    let interval =  Math.abs(thetaX1 - (thetaX2 !== undefined ? thetaX2 : thetaX1));
    interval =  Math.max(Math.abs( thetaY1 - (thetaY2 !== undefined ? thetaY2 : thetaY1)), interval);
    interval =  Math.max(Math.abs( thetaZ1 - (thetaZ2 !== undefined ? thetaZ2 : thetaZ1)), interval);

    model.children?.forEach((child) => {
        interval = Math.max(interval, calculateLongestInterval(child));        
    });

    return interval;
}

function interpolate(model: HierarchicalModel, interpolationFrameCount: number) {
    if (interpolationFrameCount < 1) return;

    const thetaX1 = model.values.thetaX[model.values.thetaX.length - 1];
    const thetaX2 = model.values.thetaX[model.values.thetaX.length - 2];
    const thetaY1 = model.values.thetaY[model.values.thetaY.length - 1];
    const thetaY2 = model.values.thetaY[model.values.thetaY.length - 2];
    const thetaZ1 = model.values.thetaZ[model.values.thetaZ.length - 1];
    const thetaZ2 = model.values.thetaZ[model.values.thetaZ.length - 2];

    const intervalX =  thetaX1 - (thetaX2 !== undefined ? thetaX2 : thetaX1);
    const intervalY =  thetaY1 - (thetaY2 !== undefined ? thetaY2 : thetaY1);
    const intervalZ =  thetaZ1 - (thetaZ2 !== undefined ? thetaZ2 : thetaZ1);
    
    const thetaChangeX = intervalX / interpolationFrameCount;
    const thetaChangeY = intervalY / interpolationFrameCount;
    const thetaChangeZ = intervalZ / interpolationFrameCount;

    const lastFrameThetaX = model.values.thetaX.pop();
    const lastFrameThetaY = model.values.thetaY.pop();
    const lastFrameThetaZ = model.values.thetaZ.pop();

    for (let i = 0; i < interpolationFrameCount; i++ ) {
        model.values.thetaX.push(model.values.thetaX[model.values.thetaX.length-1] + thetaChangeX);
        model.values.thetaY.push(model.values.thetaY[model.values.thetaY.length-1] + thetaChangeY);
        model.values.thetaZ.push(model.values.thetaZ[model.values.thetaZ.length-1] + thetaChangeZ);
    }

    if (lastFrameThetaX !== undefined && lastFrameThetaY !== undefined && lastFrameThetaZ !== undefined ) {
        model.values.thetaX.push(lastFrameThetaX);
        model.values.thetaY.push(lastFrameThetaY);
        model.values.thetaZ.push(lastFrameThetaZ);
    }

    model.children?.forEach((child) => {
        interpolate(child, interpolationFrameCount);
    });  
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
    ANIM_CANVAS_GL.clearColor(0.4, 0.4, 0.4, 1.0);
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
    });

    StateManager.getInstance().subscribe('slider-2', () => {
        const newTheta = StateManager.getInstance().getState('slider-2');
        changeThetaX(StateManager.getInstance().getState('model'), newTheta, bodyPart);
    });

    StateManager.getInstance().subscribe('slider-3', () => {
        const newTheta = StateManager.getInstance().getState('slider-3');
        changeThetaY(StateManager.getInstance().getState('model'), newTheta, bodyPart);
    });

    StateManager.getInstance().subscribe('slider-4', () => {
        const newTheta = StateManager.getInstance().getState('slider-4');
        changeThetaZ(StateManager.getInstance().getState('model'), newTheta, bodyPart);
    });

    function changeThetaX(model: HierarchicalModel, newTheta: number, name: string) {
        if (model.name === name) {
            const minThetaX = model.values?.limits?.thetaX?.min;
            const maxThetaX = model.values?.limits?.thetaX?.max;

            if ( (maxThetaX === undefined && minThetaX === undefined) || (maxThetaX !== undefined && maxThetaX >= newTheta) && (minThetaX !== undefined && minThetaX <= newTheta)) {
                model.values.thetaX[model.values.thetaX.length - 1] = newTheta;
            }
            return true;
        }

        if (model.children) {            
            for(let child of model.children) {
                if (changeThetaX(child, newTheta, name)) {
                    return true;
                }
            }
        }

        return false;
    }

    function changeThetaY(model: HierarchicalModel, newTheta: number, name: string) {
        if (model.name === name) {
            const minThetaY = model.values?.limits?.thetaY?.min;
            const maxThetaY = model.values?.limits?.thetaY?.max;

            if ( (maxThetaY === undefined && minThetaY === undefined) || (maxThetaY !== undefined && maxThetaY >= newTheta) && (minThetaY !== undefined && minThetaY <= newTheta)) {
                model.values.thetaY[model.values.thetaY.length - 1] = newTheta;
            }
            return true;
        }

        if (model.children) {            
            for(let child of model.children) {
                if (changeThetaY(child, newTheta, name)) {
                    return true;
                }
            }
        }

        return false;
    }

    function changeThetaZ(model: HierarchicalModel, newTheta: number, name: string) {
        if (model.name === name) {
            const minThetaZ = model.values?.limits?.thetaZ?.min;
            const maxThetaZ = model.values?.limits?.thetaZ?.max;

            if ( (maxThetaZ === undefined && minThetaZ === undefined) || (maxThetaZ !== undefined && maxThetaZ >= newTheta) && (minThetaZ !== undefined && minThetaZ <= newTheta)) {
                model.values.thetaZ[model.values.thetaZ.length - 1] = newTheta;
            }
            return true;
        }

        if (model.children) {            
            for(let child of model.children) {
                if (changeThetaZ(child, newTheta, name)) {
                    return true;
                }
            }
        }

        return false;
    }

    StateManager.getInstance().subscribe('buttons', () => {
        bodyPart = StateManager.getInstance().getState('buttons');
    });

    let a = 15;
    let camRotX = 0;
    let camRotY = 0;
    let camRotZ = 0;

    ANIM_CANVAS.addEventListener("wheel", function (event: WheelEvent) {
        event.preventDefault();        
        if (event.shiftKey) {
            if (event.deltaY > 0) camRotX ++;
            else camRotX --;
        } else if (event.altKey) {
            if (event.deltaY > 0) camRotY ++;
            else camRotY --;
        } else if (event.ctrlKey) {
            if (event.deltaY > 0) camRotZ ++;
            else camRotZ --;
        } else {
            if (event.deltaY > 0) a++;
            else a--;
        }

        PROJECTION_MATRIX = MV.ortho(-a, a, -a, a, -1000, 1000);
        PROJECTION_MATRIX = MV.mult(PROJECTION_MATRIX, MV.rotate(camRotX, 1, 0, 0));
        PROJECTION_MATRIX = MV.mult(PROJECTION_MATRIX, MV.rotate(camRotY, 0, 1, 0));
        PROJECTION_MATRIX = MV.mult(PROJECTION_MATRIX, MV.rotate(camRotZ, 0, 0, 1));
        ANIM_CANVAS_GL.uniformMatrix4fv(ANIM_CANVAS_GL.getUniformLocation(WEBGL_PROGRAM, "projectionMatrix"), false, MV.flatten(PROJECTION_MATRIX));        
    });

    ANIM_CANVAS.addEventListener("mousedown", function (event: MouseEvent) {
    });

    modelViewMatrixLoc = ANIM_CANVAS_GL.getUniformLocation(WEBGL_PROGRAM, "modelViewMatrix");
    PROJECTION_MATRIX = MV.ortho(-15, 15, -15, 15, -1000, 1000);
    ANIM_CANVAS_GL.uniformMatrix4fv( ANIM_CANVAS_GL.getUniformLocation(WEBGL_PROGRAM, "projectionMatrix"),  false, MV.flatten(PROJECTION_MATRIX) );
    console.log(points);
    render();
}

/**
 * This function will be called on every fram to calculate what to draw to the frame buffer
 */
function render() {
    setTimeout(() => {
        ANIM_CANVAS_GL.clear(ANIM_CANVAS_GL.COLOR_BUFFER_BIT | ANIM_CANVAS_GL.DEPTH_BUFFER_BIT);
        MODEL_VIEW_MATRIX = MV.rotate(0, 1, 0, 0);
        const frameCount = StateManager.getInstance().getState('frameCount');
        const play = StateManager.getInstance().getState('play');
        let currentFrame = StateManager.getInstance().getState('currentFrame');
        if (!play) currentFrame = frameCount - 1;
        else currentFrame = (currentFrame + 1) % frameCount;

        StateManager.getInstance().setState('currentFrame', currentFrame);

        drawHierarchy(StateManager.getInstance().getState('model'));
        requestAnimationFrame(render);
    }, 10);
}

function drawHierarchy(hierarchy: HierarchicalModel) {
    const upperBodyColor = [];
    const currentFrame = StateManager.getInstance().getState('currentFrame');
    const rotX = hierarchy.values.thetaX[currentFrame];
    const rotY = hierarchy.values.thetaY[currentFrame];
    const rotZ = hierarchy.values.thetaZ[currentFrame];
    const tx = hierarchy.values.rx[0];
    const ty = hierarchy.values.ry[0];
    const tz = hierarchy.values.rz[0];
    const w = hierarchy.values.w[0];
    const h = hierarchy.values.h[0];
    const l = hierarchy.values.l[0];
    const anchorW = hierarchy.values.anchorX[0];
    const anchorH = hierarchy.values.anchorY[0];
    const anchorL = hierarchy.values.anchorZ[0];
    const color = hierarchy.values.color[0];

    MODEL_VIEW_MATRIX = MV.mult(MODEL_VIEW_MATRIX, MV.translate(tx, ty, tz));
    MODEL_VIEW_MATRIX = MV.mult(MODEL_VIEW_MATRIX, MV.rotate(rotX, 1, 0, 0));
    MODEL_VIEW_MATRIX = MV.mult(MODEL_VIEW_MATRIX, MV.rotate(rotY, 0, 1, 0));
    MODEL_VIEW_MATRIX = MV.mult(MODEL_VIEW_MATRIX, MV.rotate(rotZ, 0, 0, 1));

    const s = scale4(w, h, l);
    // Specifying the anchor around which rotation will happen. we can have choices for x,y,z as ay,bx,cz so we set a,b,c values
    const instanceMatrix = MV.mult(MV.translate(anchorW * w, anchorH * h, anchorL * l), s); // scale around the center for x, z, but scale upwards for y
    const t = MV.mult(MODEL_VIEW_MATRIX, instanceMatrix);

    ANIM_CANVAS_GL.uniformMatrix4fv(modelViewMatrixLoc, false, MV.flatten(t));
    ANIM_CANVAS_GL.bindBuffer(ANIM_CANVAS_GL.ARRAY_BUFFER, cBuffer);

    for (let i = 0; i < 36; i++)
        upperBodyColor.push(color);

    ANIM_CANVAS_GL.bufferData(ANIM_CANVAS_GL.ARRAY_BUFFER, MV.flatten(upperBodyColor), ANIM_CANVAS_GL.STATIC_DRAW);
    
    ANIM_CANVAS_GL.drawArrays(ANIM_CANVAS_GL.TRIANGLES, 0, NumVertices);

    stack.push(MODEL_VIEW_MATRIX);

    if (hierarchy.children !== undefined) {
        hierarchy.children.forEach((child: HierarchicalModel) => {
            if (hierarchy.children) {
                drawHierarchy(child);
                MODEL_VIEW_MATRIX = stack.pop();
                stack.push(MODEL_VIEW_MATRIX);
            }
        });
    }

    stack.pop();
}

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