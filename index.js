/**
 * We start by importing the Three js lib for everything 3d and rendering on our GPU.
 * 
 * After that we import other modules we need for our project.
 * 
 * Vite (dev):
 * We don't have to worry about all these different files here, that's why we use Vite!
 * Vite will bundle our code when we build our project. But you might have to double check 
 * if you're using the right paths. So don't forget to run npm build to see if the 
 * references are correctly picked up on by Vite.
 */
import * as THREE from 'three';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';

// Custom classes
import ModelLoader from './src/utils/ModelLoader.js';

// Textures
import imageTexture from './public/images/image.png';

// 🔥 Bind the DOM element for renderer
const rendererContainer = document.getElementById("App");
// Handle mouse click events
rendererContainer.addEventListener('click', onClick, false);

// Use ResizeObserver to monitor container size changes
const rendererResizeObserver = new ResizeObserver(onResize);
rendererResizeObserver.observe(rendererContainer);

// Setup the renderer, WebGLRenderer is GPU powered
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(rendererContainer.clientWidth, rendererContainer.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x111111);
rendererContainer.appendChild(renderer.domElement);

// Setup the scene, this is the 3d space where everything will live.
const scene = new THREE.Scene();

// Setup the camera, this is what we use to look at the scene, our eyes.
const frustumSize = 500;
const aspect = rendererContainer.clientWidth / rendererContainer.clientHeight;
const camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000);
camera.position.set(- 33, 33, - 66);

// Make it so we can control the camera and orbit around a target
const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 10, 0);
controls.enablePan = false;
controls.enableDamping = true;
controls.maxPolarAngle = (Math.PI / 2) + 0.1;
controls.minPolarAngle = 0.8;
controls.enabled = true;
controls.minZoom = 4;
controls.maxZoom = 10;
controls.zoomSpeed = 2;
controls.autoRotate = false;
controls.rotateSpeed = 0.3;
controls.mouseButtons = {
    LEFT: null,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE
};
controls.update();

// Create a Raycaster and a Vector2 to store mouse coordinates
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let rayLine;

// Use THREE.Clock for frame-rate independent updates
const clock = new THREE.Clock();

// Performance graphs
const stats = new Stats();
stats.dom.style = '';
stats.dom.classList.add('renderStats');
rendererContainer.appendChild(stats.dom);

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, .6);
hemiLight.position.set(0, 10, 0);
scene.add(hemiLight);

const pointLightBack = new THREE.PointLight(0x98BCFF, 120, 100, .85);
pointLightBack.position.set(60, 20, 60);
pointLightBack.castShadow = true;
pointLightBack.shadow.mapSize.width = 1024;
pointLightBack.shadow.mapSize.height = 1024;
pointLightBack.shadow.camera.near = 0.1;
pointLightBack.shadow.camera.far = 100;
scene.add(pointLightBack);
// const pointLightHelperBack = new THREE.PointLightHelper(pointLightBack, 1);
// scene.add(pointLightHelperBack);

const pointLightFront = new THREE.PointLight(0xFFF4CA, 150, 100, .85);
pointLightFront.position.set(-50, 50, -50);
pointLightFront.castShadow = true;
pointLightFront.shadow.mapSize.width = 1024;
pointLightFront.shadow.mapSize.height = 1024;
pointLightFront.shadow.camera.near = 0.1;
pointLightFront.shadow.camera.far = 100;
scene.add(pointLightFront);
// const pointLightHelperFront = new THREE.PointLightHelper(pointLightFront, 1);
// scene.add(pointLightHelperFront);

// Setup 3d model loader (FBX)
const modelLoader = new ModelLoader(scene);
// Intersect group for raycast targets.
const intersectGroup = new THREE.Group();
// Load the environment model (and add it into the scene)
await modelLoader.loadModel({
    path: './3d/environment2.fbx',
    useShadows: true,
    position: { x: 0, y: 0, z: 0 }
});

// Create mole objects for intersectGroup

/*
positions for 9 moles in this map: (use y -16 to 'hide' moles)
1: { x: 28, y: 0, z: 1.5 }
2: { x: 13, y: 0, z: -9 }
3: { x: -1, y: 0, z: -6 }
4: { x: -23, y: 0, z: 3 }
5: { x: 23, y: 0, z: -18 }
6: { x: 9.5, y: 0, z: -27.5 }
7: { x: -2.75, y: 0, z: -19.25 }
8: position: { x: -19, y: 0, z: -23 }
9: { x: -35, y: 0, z: -14 }
*/

const mole = await modelLoader.loadModel({
    path: './3d/mole2.fbx',
    useShadows: true,
    isAnimated: true,
    position: { x:28, y: -3, z: 1.5 }
});

mole.traverse((node) => {
    if (node.isMesh) {
        // Check if the morph target dictionary exists and contains the shape key "hit"
        const hitIndex = node.morphTargetDictionary["hit"];

        if (hitIndex !== undefined) {
            console.log(`Found shape key "hit" at index ${hitIndex}`);

            // Set the influence of the "hit" shape key to 1 (full influence)
            node.morphTargetInfluences[hitIndex] = 0;
        } else {
            console.warn('No "hit" shape key found in the model.');
        }
    }
});

intersectGroup.add(mole);

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
    if (!rayLine) {
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
    rayLine = new THREE.Line(geometry, material);
    scene.add(rayLine);
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
    rayLine.geometry.setFromPoints([ray.origin, endPoint]);
}
