// ExplosionEmitter.js
import * as THREE from 'three';
import ParticleEmitter from './ParticleEmitter';

export default class ExplosionEmitter extends ParticleEmitter {
    constructor(scene, maxParticles, textureURL, options = {}) {
        super(scene, maxParticles, textureURL, options);
        this.lifetimes = [];  // Array to track particle lifetimes
    }

    spawnExplosion(position) {
        // Generate random velocities and lifetimes for explosion particles
        for (let i = 0; i < this.maxParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.random() * 5 + 2,  // Add vertical velocity for explosion
                Math.sin(angle) * speed
            );
            const lifetime = Math.random() * 2 + 1;  // Random lifetime for explosion

            this.spawnParticle(position, velocity, lifetime);
            this.lifetimes.push(lifetime);  // Store the lifetime of each particle
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        const positions = this.geometry.attributes.position.array;
        const velocities = this.geometry.attributes.velocity.array;
        const lifetimes = this.lifetimes;  // Access stored lifetimes

        // Track the particles and remove expired ones
        let aliveParticles = 0;
        for (let i = 0; i < this.maxParticles; i++) {
            lifetimes[i] -= deltaTime;  // Decrease lifetime based on deltaTime

            if (lifetimes[i] > 0) {
                // Update position and velocity if the particle is still alive
                positions[i * 3] += velocities[i * 3] * deltaTime;
                positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
                positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;

                // The particle is alive, so keep track of it
                aliveParticles++;
            } else {
                // Set the particle to an invalid position (outside the domain)
                positions[i * 3] = -1000;
                positions[i * 3 + 1] = -1000;
                positions[i * 3 + 2] = -1000;
            }
        }

        // Mark the geometry for update only if there are still particles alive
        if (aliveParticles > 0) {
            this.geometry.attributes.position.needsUpdate = true;
        }
    }
}
