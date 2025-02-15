import * as THREE from 'three';
import * as GASP from 'gsap';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import Vortex from "./vortex.js"
import Cube from "./cube.js";
import Noise from "./noise.js"

let camera;
let composer, renderer, clock;
const scene = new THREE.Scene();

let vortex1, vortex2, vortex3;
let cubes = [];
let noise;

let swingStartPosition;
let swingEndPosition;
let swingStartRotation;
let swingEndRotation;

let cameraLookTarget = new THREE.Vector3();
let isInitialized = false;

const easePingPong = "power4.inOut";
const pingPongDuration = 15;
const transitionDuration = 2;

const container = document.getElementById( 'container-galaxy' );

const paramsPP = {
    threshold: 1,
    strength: 0.75,
    radius: 0.5,
    exposure: 1
};

function setupGalaxy() {
    const initFnc = init();
    initFnc.then(() => vortexDefault())
    initController();
}

async function init() {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    noise = new Noise();

    clock = new THREE.Clock();

    const fov = isMobile ? 90 : 40;

    camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 100 );
    camera.position.set( - 5, 2.5, 100 );
    scene.add( camera );
    scene.background = new THREE.Color(0x000a1b); // Black

    const ambientLight = new THREE.AmbientLight( 0xffffff )
    scene.add( ambientLight );

    const dirLight =  new THREE.DirectionalLight( 0xffffff );
    scene.add( dirLight );

    const targetObject = new THREE.Object3D();
    targetObject.position.set(1,1,1)
    scene.add(targetObject);

    dirLight.target = targetObject;

    vortex1 = new Vortex(new THREE.Vector3( 0, 0, 10 ) , 25, new THREE.Vector3( 0, 0, 1 ), 0xff9913);
    scene.add( vortex1.mesh );
    scene.add( vortex1.pointLight);

    vortex2 = new Vortex(new THREE.Vector3(15,5,0), 200, new THREE.Vector3( 0, 1, 0), 0xff8813)
    scene.add( vortex2.mesh );
    scene.add( vortex2.pointLight);

    vortex3 = new Vortex(new THREE.Vector3( -10, 5, 0 ), 50, new THREE.Vector3( 0, 1, 1 ), 0xee7713)
    scene.add( vortex3.mesh );
    scene.add( vortex3.pointLight);

    const cubesCount = isMobile ? 250 : 500;

    for (let i = 0; i < cubesCount; i++) {
        const newPos = randomPointInSphere(50);
        const cube = new Cube(newPos);
        scene.add( cube.mesh );
        cubes.push(cube);
    }

    //renderer = new THREE.WebGLRenderer({ powerPreference: "high-performance", alpha: false, antialias: true });
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Avoid excessive resolution
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    renderer.toneMapping = THREE.ReinhardToneMapping;
    container.appendChild( renderer.domElement );

    //

    const renderScene = new RenderPass( scene, camera );

    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2), 1.5, 0.4, 0.85 );
    bloomPass.threshold = paramsPP.threshold;
    bloomPass.strength = paramsPP.strength;
    bloomPass.radius = paramsPP.radius;

    const outputPass = new OutputPass();

    composer = new EffectComposer( renderer );
    composer.addPass( renderScene );
    composer.addPass( bloomPass );
    composer.addPass( outputPass );
    isInitialized = true;

    renderer.shadowMap.enabled = false; // Disable shadows if unnecessary
}

function setCameraPos(pos,target){
    camera.position.copy(pos);
    cameraLookTarget.copy(target);
}

let tweenCamPosition = null, tweenCamTarget = null;

function translateCamera(targetPosition, targetRotation, swingPosition, swingRotation, duration = 2) {
    if(tweenCamPosition !== null)
        tweenCamPosition.kill();

    if(tweenCamTarget !== null)
        tweenCamTarget.kill();

    let tempPosition = camera.position.clone();
    let tempTarget = cameraLookTarget.clone();

    tweenCamPosition = GASP.gsap.to(tempPosition, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: duration,
        ease: "power2.inOut",
        onUpdate: () => setCameraPos(tempPosition,tempTarget),
    });

    tweenCamTarget = GASP.gsap.to(tempTarget, {
        x: targetRotation.x,
        y: targetRotation.y,
        z: targetRotation.z,
        duration: duration,
        ease: "power2.inOut",
        onUpdate: () => setCameraPos(tempPosition,tempTarget),
        onComplete: () => { cameraSwingInit(targetPosition.clone(), targetRotation.clone(), swingPosition.clone(), swingRotation.clone()); },
    });
}

function cameraSwingInit(targetPosition, targetRotation, swingPosition, swingRotation){
    swingStartPosition = targetPosition.clone();
    swingEndPosition = swingPosition.clone();

    swingStartRotation = targetRotation.clone();
    swingEndRotation = swingRotation.clone();
    swingCameraPing(pingPongDuration);
}

function swingCameraPing(duration){
    if(tweenCamPosition !== null)
        tweenCamPosition.kill();

    if(tweenCamTarget !== null)
        tweenCamTarget.kill();

    let tempPosition = camera.position.clone();
    let tempTarget = cameraLookTarget.clone();

    tweenCamPosition = GASP.gsap.to(tempPosition, {
        x: swingEndPosition.x,
        y: swingEndPosition.y,
        z: swingEndPosition.z,
        duration: duration,
        ease: easePingPong,
        onUpdate: () => setCameraPos(tempPosition,tempTarget),
    });

    tweenCamTarget = GASP.gsap.to(tempTarget, {
        x: swingEndRotation.x,
        y: swingEndRotation.y,
        z: swingEndRotation.z,
        duration: duration,
        ease: easePingPong,
        onUpdate: () => setCameraPos(tempPosition,tempTarget),
        onComplete: () => { swingCameraPong(duration); },
    });
}

function swingCameraPong(duration){
    if(tweenCamPosition !== null)
        tweenCamPosition.kill();

    if(tweenCamTarget !== null)
        tweenCamTarget.kill();

    let tempPosition = camera.position.clone();
    let tempTarget = cameraLookTarget.clone();

    tweenCamPosition = GASP.gsap.to(tempPosition, {
        x: swingStartPosition.x,
        y: swingStartPosition.y,
        z: swingStartPosition.z,
        duration: duration,
        ease: easePingPong,
        onUpdate: () => setCameraPos(tempPosition,tempTarget),
    });

    tweenCamTarget = GASP.gsap.to(tempTarget, {
        x: swingStartRotation.x,
        y: swingStartRotation.y,
        z: swingStartRotation.z,
        duration: duration,
        ease: easePingPong,
        onUpdate: () => setCameraPos(tempPosition,tempTarget),
        onComplete: () => { swingCameraPing(duration); },
    });
}

const startPositionCamera_Default = new THREE.Vector3( 36.786637666711016, 14.52445965012614, 32.635694814166875);
const startRotationCamera_Default = new THREE.Vector3( 12, 0, -1);
const endPositionCamera_Default = new THREE.Vector3( -24.48049321994352, 13.680578882448138, 19.286460215837767 );
const endRotationCamera_Default = new THREE.Vector3( 21,0,-7 );

const startPositionCamera_TECH = new THREE.Vector3( 48.544992862018965, 7.725426120818187, -13.26609706641631);
const startRotationCamera_TECH = new THREE.Vector3( -1, -2, 1 );
const endPositionCamera_TECH = new THREE.Vector3( 9.500893035264756, -11.259173900398487, -43.33418295172556);
const endRotationCamera_TECH = new THREE.Vector3( -1, -2, 1 );

const startPositionCamera_ART = new THREE.Vector3( 48.84513101700288, 22.904541649327587, -27.537388412386413);
const startRotationCamera_ART = new THREE.Vector3( -8, -8, 0);
const endPositionCamera_ART = new THREE.Vector3( 35.00449730379304, -33.34320598895556, 31.038477943244317);
const endRotationCamera_ART = new THREE.Vector3( 1, -2, 0);

const startPositionCamera_UI = new THREE.Vector3( -6.338875016879288, -16.714874837349324, -38.17942989620783);
const startRotationCamera_UI = new THREE.Vector3( 8, 0, 0);
const endPositionCamera_UI = new THREE.Vector3( 0.790969668418786, 15.39389589364723, 42.03745093428379);
const endRotationCamera_UI = new THREE.Vector3( 2, 0, 0);

function vortexDefault(){
    setRadioValue("default");
    vortex1.updateVortex(new THREE.Vector3( 0, 0, 10 ), 0xff9913, 25,  new THREE.Vector3( 0, 0, 1 ),transitionDuration);
    vortex2.updateVortex(new THREE.Vector3( 15, 5, 0 ), 0xff8813, 200,  new THREE.Vector3( 0, 1, 0 ),transitionDuration);
    vortex3.updateVortex(new THREE.Vector3( -10, 5, 0 ), 0xee7713, 50,  new THREE.Vector3( 0, 1, 1 ),transitionDuration);
    translateCamera(startPositionCamera_Default, startRotationCamera_Default,endPositionCamera_Default,endRotationCamera_Default,transitionDuration);
}

function vortexTech() {
    setRadioValue("tech");
    vortex1.updateVortex(new THREE.Vector3( 10, 0, 10 ),0x00e1ff, 250,  new THREE.Vector3( 1, 0, 0 ),transitionDuration);
    vortex2.updateVortex(new THREE.Vector3( 5, -5, -10 ),0x00d5ff, 100,  new THREE.Vector3( 0, 1, 0 ),transitionDuration);
    vortex3.updateVortex(new THREE.Vector3( -10, 0, 0 ),0x00f5ee, 150,  new THREE.Vector3( 0, 1, 0 ),transitionDuration);
    translateCamera(startPositionCamera_TECH, startRotationCamera_TECH,endPositionCamera_TECH,endRotationCamera_TECH,transitionDuration);
}

function vortexArt() {
    setRadioValue("art");
    vortex1.updateVortex(new THREE.Vector3( 0, -5, -20 ),0xe838ff, 150,  new THREE.Vector3( 0, 1, 0 ),transitionDuration);
    vortex2.updateVortex(new THREE.Vector3( -5, 5, 20 ),0xd938ee, 150,  new THREE.Vector3( 0, 1, 0 ),transitionDuration);
    vortex3.updateVortex(new THREE.Vector3( -5, 0, 0 ),0xf998dd, 200,  new THREE.Vector3( 1, 1, 0 ),transitionDuration);
    translateCamera(startPositionCamera_ART, startRotationCamera_ART,endPositionCamera_ART,endRotationCamera_ART,transitionDuration);
}

function vortexUI() {
    setRadioValue("ui");
    vortex1.updateVortex(new THREE.Vector3( 10, 0, -5 ),0xff0017, 100,  new THREE.Vector3( 0, 0, 1 ),transitionDuration);
    vortex2.updateVortex(new THREE.Vector3( 0, 0, 15 ),0xff3a17, 100,  new THREE.Vector3( 0, 1, 0 ),transitionDuration);
    vortex3.updateVortex(new THREE.Vector3( -10, 0, -5 ),0xff3a77, 100,  new THREE.Vector3( 1, 0, 0 ),transitionDuration);
    translateCamera(startPositionCamera_UI, startRotationCamera_UI,endPositionCamera_UI,endRotationCamera_UI,transitionDuration);
}

function randomPointInSphere(radius) {
    const point = new THREE.Vector3();
    point.setFromSphericalCoords(
        Math.cbrt(Math.random()) * radius,           // Random radius (cube root for uniform distribution)
        Math.acos(2 * Math.random() - 1),       // Random polar angle (theta)
        Math.random() * 2 * Math.PI             // Random azimuthal angle (phi)
    );
    return point;
}

function animate() {
    cubes.forEach((cube) => {
        cube.process(vortex1, noise);
        cube.process(vortex2, noise);
        cube.process(vortex3, noise);
    })

    camera.lookAt(cameraLookTarget);
    camera.updateMatrixWorld();

    composer.render();
}

function initController(){
    document.querySelectorAll('input[name="galaxy"]').forEach((radio) => {
        radio.addEventListener("change", () => {
            if(radio.checked === true) {
                if (radio.value === "default") {
                    vortexDefault();
                } else if (radio.value === "tech") {
                    vortexTech();
                } else if (radio.value === "art") {
                    vortexArt();
                } else if (radio.value === "ui") {
                    vortexUI();
                }
            }
        });
    });
}

function setRadioValue(value) {
    const radio = document.querySelector(`input[name="galaxy"][value="${value}"]`);
    if (radio && radio.checked === false) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change")); // Notify listeners
    }
}

function resizeCanvas(){
    if(isInitialized) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        container.width = window.innerWidth;
        container.height = window.innerHeight;
    }
}

window.ResizeThreeJSCanvas = () => resizeCanvas();
window.InitGalaxy = () => setupGalaxy();
window.DefaultGalaxy = () => vortexDefault();
window.TechGalaxy = () => vortexTech();
window.ArtGalaxy = () => vortexArt();
window.UiGalaxy = () => vortexUI();