import * as THREE from 'three';
import RaycasterHandler from './RaycasterHandler.js';

class InputHandler {
    constructor(rendererContainer, camera) {
        this.mouse = new THREE.Vector2();
        this.rendererContainer = rendererContainer;
        this.camera = camera;
        this.raycasterHandler = new RaycasterHandler(this.camera, this.rendererContainer);
        
        this.rendererContainer.addEventListener('click', this.onClick.bind(this), false);
    }

    onClick(event) {
        // Normalize mouse coordinates to [-1, 1] range for Raycaster
        const rect = this.rendererContainer.getBoundingClientRect();
        this.mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
        this.mouse.y = - (event.clientY - rect.top) / rect.height * 2 + 1;

        // Use RaycasterHandler to process raycasting
        this.raycasterHandler.checkIntersection(this.mouse);
    }
}

export default InputHandler;
