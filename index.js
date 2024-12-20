import * as THREE from 'three';

import { FireworksEffect } from './src/ParticleSystems/FireworksEffect';

// 🔥 Bind the DOM element for renderer
const rendererContainer = document.getElementById("App");

// Use ResizeObserver to monitor container size changes
const rendererResizeObserver = new ResizeObserver(onResize);
rendererResizeObserver.observe(rendererContainer);

// Setup the scene, this is the 3d space
const scene = new THREE.Scene();

// Setup the camera, this is what looks at the scene
const camera = new THREE.PerspectiveCamera(75, rendererContainer.clientWidth, rendererContainer.clientHeight, 0.1, 1000);
camera.position.z = 50;

// Setup the renderer, WebGLRenderer is GPU powered
const renderer = new THREE.WebGLRenderer();
renderer.setSize(rendererContainer.clientWidth, rendererContainer.clientHeight);
rendererContainer.appendChild(renderer.domElement);

// Use THREE.Clock for frame-rate independent updates
const clock = new THREE.Clock();

// Fireworks particle system
const firework = new FireworksEffect(new THREE.Vector3(0, 0, 0), new THREE.Color(1, 0, 0), 150);
scene.add(firework);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const cube = new THREE.Mesh( geometry, material );
//scene.add(cube);


// 🔥 Start the renderer animation loop
renderer.setAnimationLoop(animate);
function animate() {
    // Returns the time in seconds since the last call
    const deltaTime = clock.getDelta(); 

    firework.update(deltaTime);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
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

