// Particle.js
import * as THREE from 'three';

export default class Particle {
    constructor(position, velocity, lifetime, color) {
        this.position = position;  // Vector3 position
        this.velocity = velocity;  // Vector3 velocity
        this.lifetime = lifetime;  // Particle lifetime (seconds)
        this.color = color;        // Particle color (as a THREE.Color)
        this.age = 0;              // Current age of the particle
    }

    // Update particle position based on its velocity
    update(deltaTime) {
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.age += deltaTime;
    }

    // Check if the particle is still alive
    isAlive() {
        return this.age < this.lifetime;
    }

    // Get color based on particle age (optional fading effect)
    getColor() {
        const alpha = 1 - this.age / this.lifetime;
        return this.color.clone().multiplyScalar(alpha); // Make particle fade as it ages
    }
}
