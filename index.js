/**
 * We start by importing the Three js lib for everything 3d and rendering on our GPU.
 * 
 * After that we import other modules we need for our project.
 * 
 * Vite (dev):
 * We don't have to worry about all these different files here, that's why we use Vite!
 * Vite will bundle our code when we build our project. But you might have to double check 
 * if you're using the right paths. So don't forget to run npm build to see if the 
 * references are correctly picked up on by Vite, preferably before you commit your changes...
 */
import * as THREE from 'three';

// Custom classes
import Mole from './src/components/Mole.js';
import SceneManager from './src/components/SceneManager.js';

// Audio Assets
import soundFileHit from '/audio/hitHurt.wav';
import soundFileSizzle from '/audio/sizzle.wav';
import soundFileBigboom from '/audio/explosion.wav';

// @TODO: create audio manager
// Setup audio files for playback.
const soundHit = new Audio(soundFileHit);
const soundSizzle = new Audio(soundFileSizzle);
const soundBigboom = new Audio(soundFileBigboom);
soundSizzle.volume = 0.12;
soundSizzle.playbackRate = 6;
soundHit.volume = 0.3;
soundHit.playbackRate = 1;
soundBigboom.volume = 0.4;
soundBigboom.playbackRate = 4;

// @TODO: create DOM manager
// 🔥 Bind the DOM element for renderer
const rendererContainer = document.getElementById("App");
// Bind some more DOM elements
const restartButton = document.getElementById("GameRestart");
const gameUI = document.getElementById("GameUI");
const gameHudScore = document.getElementById("GameScore");
const gameHudTime = document.getElementById("GameTime");
restartButton.addEventListener('click', onClickRestart, false);

// @TODO create game manager to track this. 
// Some global game stats
let gameActive = false;
let gameTime;
let gameSpeed;
let gameScore;

// Pulling in required three elements from scene my 'wrapper class' to hide the spaghet.
// Should actually move stuff from index.js to the sceneManager and clean that up / document it...
const sceneSetup = new SceneManager(rendererContainer);
const renderer = sceneSetup.renderer;
const scene = sceneSetup.scene;
const camera = sceneSetup.camera;

// 🔥 Start the renderer animation loop
renderer.setAnimationLoop(() => sceneSetup.animate());

// Handle mouse click events for the render container
rendererContainer.addEventListener('click', onClick, false);

// Use ResizeObserver to monitor container size changes
const rendererResizeObserver = new ResizeObserver(onResize);
rendererResizeObserver.observe(rendererContainer);

// Create a Vector2 to store mouse coordinates
const mouse = new THREE.Vector2();

// Create a Raycaster to shoot lazers through space, and maybe hit things
const raycaster = new THREE.Raycaster();
// A sloppy debug view toggle for the raycaster
let debugView = false;
let rayLineHelper;

// Intersect group for raycast targets.
const intersectGroup = new THREE.Group();

// Create mole objects for intersectGroup 
// Model reference: left to righ 2 rows [1,2,3,4] [5,6,7,8,9]
// y: 0 fully extended. -16: fully hidden.
const moleInitialPositions = [
    { x: 28, y: -16, z: 1.5 },
    { x: 13, y: -16, z: -9 },
    { x: -1, y: -16, z: -6 },
    { x: -23, y: -16, z: 3 },
    { x: 23, y: -16, z: -18 },
    { x: 9.5, y: -16, z: -27.5 },
    { x: -2.75, y: -16, z: -19.25 },
    { x: -19, y: -16, z: -23 },
    { x: -35, y: 0, z: -14 }
];

for (const position of moleInitialPositions) {
    const mole = new Mole(scene, { position });
    await mole.load();
    mole.setHitState(false); // Initial state
    intersectGroup.add(mole); // Add the Mole instance directly
}
scene.add(intersectGroup);

gameStart();

function gameStart() {
    gameActive = true;
    sceneSetup.resetCamera()
    sceneSetup.controls.autoRotate = false;    

    gameTime = 30;
    gameSpeed = 1000;
    gameScore = 0;

    // reset moles to initial positions
    intersectGroup.children.forEach((object, index) => {
        if (object instanceof Mole) {
            const initPosition = moleInitialPositions[index];
            object.model.position.set(initPosition.x, initPosition.y, initPosition.z);
            object.setHitState(false);
        }
    });

    gameClock();
}

function gameClock() {
    gameTime--;
    gameHudTime.innerHTML = gameTime;
    if (gameTime > 0) {
        setTimeout(function () {
            gameClock();
        }, 1000);
    } else {
        gameEnd();
    }
}

function gameLoop() {
    // this should be tied to the render loop, but i'm trying to rush this out
    const randomInt = getRandomIntInclusive(0,8);

    setTimeout(function () {

    }, 1000)
}

function gameEnd() {
    gameActive = false;
    gameHudScore.innerHTML = gameScore;
    gameUI.classList.remove('hidden');    
    sceneSetup.controls.autoRotate = true;

    intersectGroup.children.forEach((object, index) => {
        if (object instanceof Mole) {
            const initPosition = moleInitialPositions[index];
            object.model.position.set(initPosition.x, -16, initPosition.z);
        }
    });
}

// Adjust renderer and camera on container size change
function onResize(entries) {
    entries.forEach(entry => {
        // Ensure we're working with the correct container
        if (entry.target === rendererContainer) {
            // Update renderer size and camera aspect ratio
            renderer.setSize(rendererContainer.clientWidth, rendererContainer.clientHeight);
            camera.aspect = rendererContainer.clientWidth / rendererContainer.clientHeight;
            camera.updateProjectionMatrix();
        }
    });
}

function onClickRestart() {
    sceneSetup.controls.autoRotate = false;
    gameUI.classList.add('hidden');
    gameStart();
}

// The onClick event handler
function onClick(event) {
    // Normalize mouse coordinates to [-1, 1] range (for Raycaster)
    // Set a ray from camera based on normalized coordinates.
    const rect = rendererContainer.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
    mouse.y = - (event.clientY - rect.top) / rect.height * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections of the ray with objects in the scene/group
    checkIntersection();
}

// Function to check for intersection with objects in the scene
function checkIntersection() {
    // Cast the ray to check against all objects in the scene
    const intersects = raycaster.intersectObjects(scene.children);

    // Create the raycaster helper line for debug visualization
    if (!rayLineHelper && debugView === true) {
        createRayLine();
    }

    // Check intersections of the raycaster and handle different intersections differently.
    if (intersects.length > 0) {
        if (groupContains(intersectGroup, intersects[0].object)) {
            handleObjectClick(intersects[0].object);
            sceneSetup.createHit(intersects[0].point, new THREE.Color(0xFF0000));
        } else {
            handleWorldClick(intersects[0].point);
        }
        if (debugView === true) {
            updateRayLine(raycaster.ray, intersects[0].point);
        }
    } else {
        const missPoint = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(200));
        soundBigboom.pause();
        soundBigboom.currentTime = 0;
        soundBigboom.play()
        sceneSetup.createExplosion(missPoint, new THREE.Color(0x0099FF));
        if (debugView === true) {
            updateRayLine(raycaster.ray);
        }
    }
}

function handleObjectClick(object) {
    const mole = findParentMole(object);
    if (mole) {
        soundHit.pause();
        soundHit.currentTime = 0;
        soundHit.play();
        mole.setHitState(true);
        //mole.setActiveState(false);
    }
}

function handleWorldClick(intersectPoint) {
    soundSizzle.pause();
    soundSizzle.currentTime = 0;
    soundSizzle.play();
    sceneSetup.createShot(intersectPoint, new THREE.Color(0xFFFF00));
}

function findParentMole(object) {
    // traverse upward to find the actual mole class object, 
    // not the 3d mesh we had our raycaster intersect with.
    for (let current = object; current; current = current.parent) {
        if (current instanceof Mole) {
            return current;
        }
    }
    return null;
}

function groupContains(group, object) {
    let found = false;
    group.traverse((child) => {
        if (child === object) {
            found = true;
        }
    });
    return found;
}

function createRayLine() {
    // Create debug visualization
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);

    // Create the line and add it to the scene
    rayLineHelper = new THREE.Line(geometry, material);
    scene.add(rayLineHelper);
}

// Function to update the ray line
function updateRayLine(ray, point) {
    let endPoint;
    if (point) {
        // Ray endpoint is collission point
        endPoint = point;
    } else {
        // Ray endpoint is 200 units
        endPoint = ray.origin.clone().add(ray.direction.clone().multiplyScalar(200));
    }
    // Update line points
    rayLineHelper.geometry.setFromPoints([ray.origin, endPoint]);
}

function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    // The maximum is inclusive and the minimum is inclusive
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); 
}


