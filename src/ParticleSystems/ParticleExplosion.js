import * as THREE from 'three';

export default class ParticleExplosion {
    constructor(scene, location, color = 0xff0000, options = {}) {
        this.scene = scene;

        // Explosion settings with defaults
        const {
            particleCount = 100,
            particleSize = 3,
            explosionSpeed = 1.0,
            explosionDomain = 1.0, // Domain size, controls initial spread
            lifetime = 1, // in seconds
        } = options;

        this.particleCount = particleCount;
        this.explosionSpeed = explosionSpeed;
        this.explosionDomain = explosionDomain;
        this.lifetime = lifetime;
        this.elapsedTime = 0;

        // Create particle geometry and material
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(particleCount * 3);
        this.velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Randomize initial positions within the explosion domain
            this.positions[i * 3] = location.x + (Math.random() - 0.5) * explosionDomain;
            this.positions[i * 3 + 1] = location.y + (Math.random() - 0.5) * explosionDomain;
            this.positions[i * 3 + 2] = location.z + (Math.random() - 0.5) * explosionDomain;

            // Random velocities for explosion effect, scaled by explosion speed
            this.velocities[i * 3] = (Math.random() - 0.5) * explosionSpeed;
            this.velocities[i * 3 + 1] = (Math.random() - 0.5) * explosionSpeed;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * explosionSpeed;
        }

        this.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(this.positions, 3)
        );

        this.material = new THREE.PointsMaterial({
            size: particleSize,
            transparent: true,
            depthWrite: false,
            color,
        });

        // Create the particle system
        this.particleSystem = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particleSystem);

        // Flag to indicate if the explosion is still active
        this.active = true;
    }

    update(deltaTime) {
        if (!this.active) return;

        this.elapsedTime += deltaTime;

        const positions = this.geometry.attributes.position.array;

        for (let i = 0; i < this.particleCount; i++) {
            const index = i * 3;

            // Update positions based on velocity
            positions[index] += this.velocities[index] * deltaTime;
            positions[index + 1] += this.velocities[index + 1] * deltaTime;
            positions[index + 2] += this.velocities[index + 2] * deltaTime;
        }

        this.geometry.attributes.position.needsUpdate = true;

        // Check if the explosion's lifetime has expired
        if (this.elapsedTime >= this.lifetime) {
            this.cleanup();
        }
    }

    cleanup() {
        // Remove particle system from the scene and dispose of resources
        this.scene.remove(this.particleSystem);
        this.geometry.dispose();
        this.material.dispose();
        this.active = false;
    }
}