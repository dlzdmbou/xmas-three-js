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

// Use ResizeObserver to monitor container size changes
const rendererResizeObserver = new ResizeObserver(onResize);
rendererResizeObserver.observe(rendererContainer);

// Setup the renderer, WebGLRenderer is GPU powered
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(rendererContainer.clientWidth, rendererContainer.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
rendererContainer.appendChild(renderer.domElement);

// Setup the scene, this is the 3d space
const scene = new THREE.Scene();

// Setup the camera, this is what looks at the scene
const frustumSize = 500;
const aspect = rendererContainer.clientWidth / rendererContainer.clientHeight;
const camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000);
camera.position.set(- 33, 33, - 66);

// Make it so we can control the camera and orbit around our scene 0,0,0
const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 10, 0);
controls.enablePan = true;
controls.enableDamping = true;
//controls.maxPolarAngle = (Math.PI / 2) + 0.1;
//controls.minPolarAngle = 0.8;
// controls.enabled = false;
controls.minZoom = 4;
controls.maxZoom = 10;
controls.zoomSpeed = 2;
// controls.autoRotate = false;
controls.rotateSpeed = 0.3;
controls.mouseButtons = {
    LEFT: null,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE
};
controls.update();

// Use THREE.Clock for frame-rate independent updates
const clock = new THREE.Clock();

// Performance graphs
const stats = new Stats();
rendererContainer.appendChild(stats.dom);

// Visualization (default cube)
// const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
// const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff5533 });
// const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// cube.position.set(40, 10, 10)
// cube.castShadow = true;
// cube.receiveShadow = true;
// scene.add(cube);

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.8);
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
// Load the environment model (and add it into the scene)
await modelLoader.loadModel({ path: './3d/environment.fbx', useShadows: true });

// Create mole object[s]
const moles = new THREE.Group();
const mole = await modelLoader.loadModel({ path: './3d/mole.fbx', useShadows: true, isAnimated: true, position: { x: 10, y: 10, z: -10 } });
moles.add(mole);
scene.add(moles);

mole.traverse((node) => {
    if (node.isMesh) {
        // Check if the morph target dictionary exists and contains the shape key "hit"
        const hitIndex = node.morphTargetDictionary["hit"];

        if (hitIndex !== undefined) {
            console.log(`Found shape key "hit" at index ${hitIndex}`);

            // Set the influence of the "hit" shape key to 1 (full influence)
            node.morphTargetInfluences[hitIndex] = 1;

            console.log('Morph target influence set to 1 for "hit"');
        } else {
            console.warn('No "hit" shape key found in the model.');
        }
    }
});

// 🔥 Start the renderer animation loop
renderer.setAnimationLoop(animate);

function animate() {
    // Start measuring stats
    stats.begin();

    // Would you look at the time...
    const deltaTime = clock.getDelta();

    controls.update();
    camera.updateMatrixWorld();

    // Update all mixers (for all animated objects)
    // if (mole.mixer) {
    //     mole.mixer.update(deltaTime);  // Adjust delta time as needed
    // }

    //camera.position.y = Math.sin(deltaTime);
    //camera.position.y = cameraStartY + 4 * Math.sin(1 * clock.elapsedTime);

    // Render the frame with the updated fireworks, boom boom
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


// Create a Raycaster and a Vector2 to store mouse coordinates
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let rayLine;
let INTERSECTED;

// Handle mouse click events
window.addEventListener('click', onClick, false);

// The onClick event handler
function onClick(event) {
    camera.matrixWorldNeedsUpdate
    // Normalize mouse coordinates to [-1, 1] range (for Raycaster)
    const rect = rendererContainer.getBoundingClientRect(); // Get the bounds of the container
    mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;  // Normalize X
    mouse.y = - (event.clientY - rect.top) / rect.height * 2 + 1; // Normalize Y

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, false);
    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xff0000);

        }

    } else {

        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

        INTERSECTED = null;

    }

    // Update the ray line for visualization
    if (!rayLine) {
        createRayLine();
    }
    updateRayLine(raycaster.ray);

    // Check for intersections with all objects in the scene
    checkForMoleIntersection();
}

// Function to check for intersection with the mole
function checkForMoleIntersection() {
    // Cast the ray to check against all objects in the scene
    const intersects = raycaster.intersectObjects(moles.children);

    if (intersects.length > 0) {
        // Log which object was clicked
        console.log('Object clicked:', intersects[0].object);
        // Handle the object click
        handleObjectClick(intersects[0].object);
    } else {
        console.log('No intersection with any object');
    }
}

// Function to handle what happens when the mole is clicked
function handleMoleClick() {
    console.log('Mole has been hit!');
    // Trigger shape key animation or other logic here
}

// Handle clicks on other objects
function handleObjectClick(clickedObject) {
    if (clickedObject === mole) {
        console.log('Mole clicked!');
        // You can trigger animations or other actions on the mole
        handleMoleClick();
    } else {
        console.log('Another object clicked:', clickedObject);
    }
}

// Function to create the ray line for visualization
function createRayLine() {
    // Create a geometry for the ray (1 line segment)
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color for the ray
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);

    // Create the line and add it to the scene
    rayLine = new THREE.Line(geometry, material);
    scene.add(rayLine);
}

// Function to update the ray line
function updateRayLine(ray) {
    // Update the ray line to match the current ray's origin and direction
    const endPoint = ray.origin.clone().add(ray.direction.clone().multiplyScalar(200)); // 100 units long
    rayLine.geometry.setFromPoints([ray.origin, endPoint]); // Update line points
}
