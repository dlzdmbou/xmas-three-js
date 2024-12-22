// SnowEmitter.js
import * as THREE from 'three';  // Ensure Three.js is imported

import ParticleEmitter from './ParticleEmitter';

export default class SnowEmitter extends ParticleEmitter {
    constructor(scene, maxParticles, textureURL, domain, options = {}) {
        super(scene, maxParticles, textureURL, options);
        this.domain = domain;  // Domain: { width, height, depth }
        this.gravity = -0.5;  // Constant downward velocity (gravity)
    }

    spawnSnow() {
        for (let i = 0; i < this.maxParticles; i++) {
            const x = Math.random() * this.domain.width - this.domain.width / 2;
            const y = Math.random() * this.domain.height;
            const z = Math.random() * this.domain.depth - this.domain.depth / 2;

            const position = new THREE.Vector3(x, y, z);
            const velocity = new THREE.Vector3(0, this.gravity, 0);  // Snow falls with constant velocity
            const lifetime = Math.random() * 5 + 5;  // Random lifetime for snowflakes

            this.spawnParticle(position, velocity, lifetime);
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        const positions = this.geometry.attributes.position.array;
        const velocities = this.geometry.attributes.velocity.array;
        const lifetimes = this.geometry.attributes.lifetime.array;

        for (let i = 0; i < this.maxParticles; i++) {
            const yPos = positions[i * 3 + 1];

            // Update particle position based on constant velocity (gravity)
            velocities[i * 3 + 1] = this.gravity;  // Ensure snow continues to fall at the same speed

            // Apply deltaTime to the position update for frame rate independence
            positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;  // Use deltaTime to update position

            // Check if particle is below the domain (snow reaches the bottom of the scene)
            if (yPos < -this.domain.height / 2) {
                // Reset particle position to the top of the domain
                const x = Math.random() * this.domain.width - this.domain.width / 2;
                const z = Math.random() * this.domain.depth - this.domain.depth / 2;
                positions[i * 3] = x;
                positions[i * 3 + 1] = this.domain.height / 2;  // Reset y position to the top
                positions[i * 3 + 2] = z;

                // Reset velocity for continuous falling effect
                velocities[i * 3 + 1] = this.gravity;  // Ensure gravity (downward) is constant
            }
        }

        // Mark the geometry for update
        this.geometry.attributes.position.needsUpdate = true;
    }
}
