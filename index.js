/**
 * We start by importing the Three js lib for everything 3d and rendering on our GPU.
 * After that we import other modules we need for our project.
 * We don't have to worry about all these different files here, that's why we use Vite!
 * Vite will bundle our code when we build our project.
 */
import * as THREE from 'three';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';

// Custom classes
import ExplosionEmitter from './src/ParticleSystems/ExplosionEmitter';
import SnowEmitter from './src/ParticleSystems/SnowEmitter';

// Textures
import imageTexture from './public/images/image.png';

// Models
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader';
import { VertexNormalsHelper } from './node_modules/three/examples/jsm/helpers/VertexNormalsHelper.js';
//import environmentModel from './src/assets/models/xmass-env.glb';

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
rendererContainer.appendChild(renderer.domElement);

// Setup the scene, this is the 3d space
const scene = new THREE.Scene();

// Setup the camera, this is what looks at the scene
//const camera = new THREE.PerspectiveCamera(45, rendererContainer.clientWidth, rendererContainer.clientHeight, 0.1, 1000);
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
controls.update();

// Use THREE.Clock for frame-rate independent updates
const clock = new THREE.Clock();

// Performance graphs
const stats = new Stats();
rendererContainer.appendChild(stats.dom);

// Visualization
// const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
// const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff5533 });
// const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// cube.position.set(40, 10, 10)
// cube.castShadow = true;
// cube.receiveShadow = true;
// scene.add(cube);

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.8);
hemiLight.position.set(0, 20, 0);
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

const loader = new FBXLoader();
let environment;

loader.load(
    // Path to the FBX file
    './3d/environment.fbx',

    // Called when the model is successfully loaded
    function (object) {
        object.scale.set(0.1, 0.1, 0.1);
        object.position.set(0, 0, 0);
        object.castShadow = true;


        object.traverse((node) => {
            if (node.isMesh) {
                node.material = new THREE.MeshStandardMaterial({ vertexColors: true });
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        // Add the loaded object to the scene
        environment = object;
        scene.add(environment);

        console.log('FBX model loaded:', object);
    },

    // Called while loading is in progress
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },

    // Called when loading has errors
    function (error) {
        console.error('An error occurred while loading the FBX model:', error);
    }
);
console.log(environment)



// 🔥 Start the renderer animation loop
renderer.setAnimationLoop(animate);

function animate() {
    // Start measuring stats
    stats.begin();

    // Would you look at the time...
    const deltaTime = clock.getDelta();

    controls.update();

    if (environment) {
        //environment.rotateY(0.001);
        //camera.lookAt(environment.position);
    }

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
            // Update the renderer size based on the container's size
            renderer.setSize(rendererContainer.clientWidth, rendererContainer.clientHeight);

            // Update the camera's aspect ratio and projection matrix
            camera.aspect = rendererContainer.clientWidth / rendererContainer.clientHeight;
            camera.updateProjectionMatrix();
        }
    });
}

window.addEventListener('click', () => {

});
