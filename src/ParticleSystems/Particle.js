// src/ParticleSystem/Particle.js
import * as THREE from 'three';

export class Particle {
    constructor(position, velocity, lifetime) {
        this.position = position || new THREE.Vector3();
        this.velocity = velocity || new THREE.Vector3();
        this.lifetime = lifetime || 5; // Default 5 seconds
    }

    update(deltaTime) {
        // Update position based on velocity
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        // Reduce lifetime
        this.lifetime -= deltaTime;
    }
}
