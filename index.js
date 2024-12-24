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
import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';

// Custom classes
import InputHandler from './src/components/InputHandler.js';
import ModelLoader from './src/utils/ModelLoader.js';
import Mole from './src/components/Mole.js';
import SceneManager from './src/components/SceneManager.js';

// Textures
// import imageTexture from './public/images/image.png';

// 🔥 Bind the DOM element for renderer
const rendererContainer = document.getElementById("App");

// @TODO new implementation w.i.p
const sceneSetup = new SceneManager(rendererContainer);
const renderer = sceneSetup.renderer;
const scene = sceneSetup.scene;
const camera = sceneSetup.camera;
const controls = sceneSetup.controls;

// Handle mouse click events
rendererContainer.addEventListener('click', onClick, false);

// Use ResizeObserver to monitor container size changes
const rendererResizeObserver = new ResizeObserver(onResize);
rendererResizeObserver.observe(rendererContainer);

// Create a Vector2 to store mouse coordinates
const mouse = new THREE.Vector2();

// Use THREE.Clock for frame-rate independent updates
const clock = new THREE.Clock();

// Create a Raycaster to shoot lazers through space, and maybe hit things
const raycaster = new THREE.Raycaster();

// Create a rayLineHelper to visualize the raycaster line
let rayLineHelper;

// Performance graphs
const stats = new Stats();
stats.dom.style = '';
stats.dom.classList.add('renderStats');
rendererContainer.appendChild(stats.dom);

//@TODO w.i.p input refactoring
//const inputHandler = new InputHandler(rendererContainer, camera);

// Setup 3d model loader (FBX)
const modelLoader = new ModelLoader(scene);
// Intersect group for raycast targets.
const intersectGroup = new THREE.Group();

// Load the environment model (and add it into the scene)
await modelLoader.loadModel({
    path: './3d/environment2.fbx',
    useShadows: true
});

// Create mole objects for intersectGroup 
// Model reference: left to righ 2 rows [1,2,3,4] [5,6,7,8,9]
const molePositions = [
    { x: 28, y: 0, z: 1.5 },
    { x: 13, y: 0, z: -9 },
    { x: -1, y: 0, z: -6 },
    { x: -23, y: 0, z: 3 },
    { x: 23, y: 0, z: -18 },
    { x: 9.5, y: 0, z: -27.5 },
    { x: -2.75, y: 0, z: -19.25 },
    { x: -19, y: 0, z: -23 },
    { x: -35, y: 0, z: -14 }
];

for (const position of molePositions) {
    const mole = new Mole(scene, { path: './3d/mole2.fbx', position });
    await mole.load();
    intersectGroup.add(mole);
}

scene.add(intersectGroup);

// 🔥 Start the renderer animation loop
renderer.setAnimationLoop(animate);

function animate() {
    // Start measuring stats
    stats.begin();

    // Would you look at the time...
    const deltaTime = clock.getDelta();

    // Update all the things, sometimes with time
    controls.update();
    camera.updateMatrixWorld();

    // Render the frame
    renderer.render(scene, camera);

    // End measuring and update stats
    stats.end();
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

// The onClick event handler
function onClick(event) {
    // Normalize mouse coordinates to [-1, 1] range (for Raycaster)
    // Set a ray from camera based on normalized coordinates.
    const rect = rendererContainer.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
    mouse.y = - (event.clientY - rect.top) / rect.height * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with all objects in the scene
    checkIntersection();
}

// Function to check for intersection with objects in the scene
function checkIntersection() {
    // Cast the ray to check against all objects in the scene
    const intersects = raycaster.intersectObjects(scene.children);

    // Create the raycaster helper line for debug visualization
    if (!rayLineHelper) {
        createRayLine();
    }

    if (intersects.length > 0) {
        if ( groupContains(intersectGroup, intersects[0].object) ) {
            console.log(`Intersect object found:`, intersects[0].object);
            handleObjectClick(intersects[0].object);
        }
        updateRayLine(raycaster.ray, intersects[0].point);
    } else {
        console.log('No intersect objects found');
        updateRayLine(raycaster.ray);
    }
}

function handleObjectClick(object) {
    object.traverse((node) => {
        if (node.isMesh) {
            // Check if the morph target dictionary exists and contains the shape key "hit"
            const hitIndex = node.morphTargetDictionary["hit"];
            if (hitIndex !== undefined) {
                // Set the influence of the "hit" shape key to 1 (0 none, 1 full)
                node.morphTargetInfluences[hitIndex] = 1;
            }
        }
    });
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
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color for the ray
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
