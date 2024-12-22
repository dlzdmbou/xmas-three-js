// ParticleEmitter.js
import * as THREE from 'three';

export default class ParticleEmitter {
    constructor(scene, maxParticles, textureURL, options = {}) {
        this.scene = scene;
        this.maxParticles = maxParticles;
        this.textureURL = textureURL;
        this.options = options;

        this.particles = [];
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.05,
            map: new THREE.TextureLoader().load(this.textureURL),
            transparent: true,
            opacity: 0.8,
            color: new THREE.Color(0xffffff),
        });

        // Initialize particle positions, velocities, and other attributes
        this.positions = new Float32Array(this.maxParticles * 3);
        this.velocities = new Float32Array(this.maxParticles * 3);
        this.lifetimes = new Float32Array(this.maxParticles);
        this.startTimes = new Float32Array(this.maxParticles);

        // Add buffer attributes to the geometry
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('velocity', new THREE.BufferAttribute(this.velocities, 3));
        this.geometry.setAttribute('startTime', new THREE.BufferAttribute(this.startTimes, 1));
        this.geometry.setAttribute('lifetime', new THREE.BufferAttribute(this.lifetimes, 1));

        this.particleSystem = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particleSystem);

        this.time = 0;
    }

    update(deltaTime) {
        // Update time for particle system
        this.time += deltaTime;

        // Loop over all particles and update their positions
        const positions = this.geometry.attributes.position.array;
        const velocities = this.geometry.attributes.velocity.array;
        const lifetimes = this.geometry.attributes.lifetime.array;
        const startTimes = this.geometry.attributes.startTime.array;

        for (let i = 0; i < this.maxParticles; i++) {
            const timeAlive = this.time - startTimes[i];

            if (timeAlive < lifetimes[i]) {
                // Update particle position based on its velocity
                positions[i * 3] += velocities[i * 3] * deltaTime;
                positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
                positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;
            }
        }

        // Mark the geometry for update
        this.geometry.attributes.position.needsUpdate = true;
    }

    spawnParticle(position, velocity, lifetime = 2.0) {
        const index = this.findFreeParticleIndex();

        if (index !== -1) {
            this.geometry.attributes.position.array[index * 3] = position.x;
            this.geometry.attributes.position.array[index * 3 + 1] = position.y;
            this.geometry.attributes.position.array[index * 3 + 2] = position.z;

            this.geometry.attributes.velocity.array[index * 3] = velocity.x;
            this.geometry.attributes.velocity.array[index * 3 + 1] = velocity.y;
            this.geometry.attributes.velocity.array[index * 3 + 2] = velocity.z;

            this.geometry.attributes.lifetime.array[index] = lifetime;
            this.geometry.attributes.startTime.array[index] = this.time;
        }
    }

    findFreeParticleIndex() {
        const positions = this.geometry.attributes.position.array;
        for (let i = 0; i < this.maxParticles; i++) {
            if (positions[i * 3] === 0 && positions[i * 3 + 1] === 0 && positions[i * 3 + 2] === 0) {
                return i;
            }
        }
        return -1;  // No free particle slot found
    }
}
