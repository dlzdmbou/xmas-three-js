// src/ParticleSystem/ParticleSystem.js
import * as THREE from 'three';
import { Particle } from './Particle';

export class ParticleSystem {
    constructor({
        position = new THREE.Vector3(0, 0, 0),
        particleCount = 100,
        lifetime = 5,
        material = null,
        effect = null,
    } = {}) {
        this.position = position;
        this.particles = [];
        this.particleCount = particleCount;
        this.lifetime = lifetime;
        this.effect = effect;
        this.group = new THREE.Group(); // Contains all particle meshes

        // Create a material or use a default
        this.material = material || new THREE.PointsMaterial({
            size: 0.1,
            color: 0xffffff,
        });

        this.initParticles();
    }

    initParticles() {
        // Create particles and add to the group
        for (let i = 0; i < this.particleCount; i++) {
            const particle = new Particle(
                this.position.clone(),
                new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ), // Random velocity
                this.lifetime
            );

            // Apply the custom effect if provided
            if (this.effect) {
                this.effect(particle, this.position);
            }

            this.particles.push(particle);

            // Add a mesh representation of the particle
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(particle.position.toArray(), 3)
            );
            const points = new THREE.Points(geometry, this.material);
            this.group.add(points);
        }
    }

    update(deltaTime) {
        this.particles.forEach((particle, index) => {
            if (particle.lifetime > 0) {
                particle.update(deltaTime);

                // Update the position of the corresponding Points mesh
                const points = this.group.children[index];
                points.geometry.attributes.position.array = particle.position.toArray();
                points.geometry.attributes.position.needsUpdate = true;
            } else {
                // Remove expired particles from the scene
                this.group.remove(this.group.children[index]);
                this.particles.splice(index, 1);
            }
        });
    }

    dispose() {
        this.group.children.forEach((mesh) => mesh.geometry.dispose());
    }
}
