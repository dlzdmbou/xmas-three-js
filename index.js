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
import soundFileSpawn from '/audio/molePopup.wav';
import soundFileHit from '/audio/moleHurt.wav';
import soundFileSizzle from '/audio/sizzle.wav';
import soundFileBigboom from '/audio/explosion.wav';

// Music from: https://www.silvermansound.com/free-music/festv-frlix
// FeSTV FRLiX © 2021 by Shane Ivers is licensed under CC BY 4.0
// Music: FeSTV FRLiX by Shane Ivers - https://www.silvermansound.com
import musicFileBackground from '/audio/festv-frlix.mp3';

// @TODO: create audio manager
// Setup audio files for playback.
const soundSpawn = new Audio(soundFileHit);
const soundHit = new Audio(soundFileHit);
const soundSizzle = new Audio(soundFileSizzle);
const soundBigboom = new Audio(soundFileBigboom);
soundSpawn.volume = 0.05;
soundSpawn.playbackRate = 0.5;
soundSizzle.volume = 0.05;
soundSizzle.playbackRate = 1;
soundHit.volume = 0.3;
soundHit.playbackRate = 1;
soundBigboom.volume = 0.4;
soundBigboom.playbackRate = 4;

const musicBackground = new Audio(musicFileBackground);
musicBackground.volume = 0.03;

// @TODO: create DOM manager
// 🔥 Bind the DOM element for renderer
const rendererContainer = document.getElementById("App");
// Bind some more DOM elements
const startButton = document.getElementById("GameStart");
const restartButton = document.getElementById("GameRestart");
const gameUI = document.getElementById("GameUI");
const gameSplash = document.getElementById("GameSplash");
const gameHudScore = document.getElementsByClassName("GameScore");
const gameHudTime = document.getElementById("GameTime");
startButton.addEventListener('click', onClickStart, false);
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
    { x: -35, y: -16, z: -14 }
];

for (const position of moleInitialPositions) {
    const mole = new Mole(scene, { position });
    await mole.load();
    mole.setHitState(false); // Initial state
    intersectGroup.add(mole); // Add the Mole instance directly
}
scene.add(intersectGroup);

function gameStart() {
    musicBackground.play();
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

    gameActive = true;
    gameClock();
    gameLoop();
}

function gameClock() {
    gameTime--;
    if (gameTime > 0) {
        setTimeout(function () {
            gameClock();
        }, 1000);
    } else {
        gameEnd();
    }
}

function gameLoop() {
    // this should be tied to the scene render loop, but i'm trying to rush this out by now
    if (gameActive) {

        // grab a random mole and enable it if it wasn't already
        const randomInt = getRandomIntInclusive(0, 8);
        const randomIntActiveTime = getRandomIntInclusive(200+gameSpeed, 3000+gameSpeed);
        if (!intersectGroup.children[randomInt].isEnabled && !intersectGroup.children[randomInt].isHit) {
            soundSpawn.pause();
            soundSpawn.currentTime = 0;
            soundSpawn.play();
            intersectGroup.children[randomInt].setEnabled(randomIntActiveTime);
        }

        updateGameHUD();

        const speedModifier = gameScore / 10;

        setTimeout(() => {
            gameLoop();
        }, gameSpeed - speedModifier);
    }
}

function gameEnd() {
    updateGameHUD();
    gameActive = false;

    gameUI.classList.remove('hidden', 'fade');
    sceneSetup.controls.autoRotate = true;

    intersectGroup.children.forEach((object, index) => {
        if (object instanceof Mole) {
            const initPosition = moleInitialPositions[index];
            object.model.position.set(initPosition.x, -16, initPosition.z);
        }
    });

    setTimeout(() => {
        restartButton.disabled = false;
    },2000)
    
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

function onClickStart() {
    sceneSetup.controls.autoRotate = false;
    sceneSetup.resetCamera();
    gameSplash.classList.add('fade');
    setTimeout(() => {
        gameSplash.classList.add('hidden');
        gameStart();
    },2000);
}

function onClickRestart() {
    restartButton.disabled = true;
    sceneSetup.controls.autoRotate = false;
    sceneSetup.resetCamera();
    gameUI.classList.add('fade');
    setTimeout(() => {
        gameUI.classList.add('hidden');
        gameStart();
    },2000);
}

// The onClick event handler
function onClick(event) {
    // Focus on the actual canvas element for click handling in the game space
    if (event.target === rendererContainer.querySelector('canvas')) {
        // Normalize mouse coordinates to [-1, 1] range (for Raycaster)
        // Set a ray from camera based on normalized coordinates.
        const rect = rendererContainer.getBoundingClientRect();
        mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
        mouse.y = - (event.clientY - rect.top) / rect.height * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections of the ray with objects in the scene/group
        checkIntersection();
    }

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
        if (gameActive) {
            // style points for fireworks
            gameScore += 10;
        }
        const missPoint = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(200));
        handleSkyClick(missPoint);
        if (debugView === true) {
            updateRayLine(raycaster.ray);
        }
    }

    updateGameHUD();
}

function handleObjectClick(object) {
    const mole = findParentMole(object);
    if (mole) {
        if (mole.isEnabled === true && gameActive) {
            mole.isEnabled = false;
            gameScore += 100;
            gameSpeed -= 5;
        } else if (gameActive) {
            gameScore += 1;
        }
        soundHit.pause();
        soundHit.currentTime = 0;
        soundHit.play();
        soundSizzle.pause();
        soundSizzle.currentTime = 0;
        soundSizzle.play();
        mole.setHitState(true);
    }
}

function handleWorldClick(intersectPoint) {
    if (gameActive) {
        gameScore += 1;
    }
    soundSizzle.pause();
    soundSizzle.currentTime = 0;
    soundSizzle.play();
    sceneSetup.createShot(intersectPoint, new THREE.Color(0xFFFF00));
}

function handleSkyClick(targetPoint) {
    soundBigboom.pause();
    soundBigboom.currentTime = 0;
    soundBigboom.play()
    sceneSetup.createExplosion(targetPoint, new THREE.Color(0x0099FF));
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

function updateGameHUD() {
    gameHudTime.innerHTML = gameTime;

    for (let i = 0; i < gameHudScore.length; i++) {
        gameHudScore[i].innerHTML = gameScore;
    }
}

function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    // The maximum is inclusive and the minimum is inclusive
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}


