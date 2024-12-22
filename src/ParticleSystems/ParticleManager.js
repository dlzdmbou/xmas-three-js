// ParticleManager.js
import Particle from './Particle';
import * as THREE from 'three';

export default class ParticleManager {
    constructor() {
        this.particles = [];  // Store particles
        this.geometry = new THREE.BufferGeometry();  // Particle geometry
        this.material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });  // Particle material
        this.particleSystem = new THREE.Points(this.geometry, this.material);  // The particle system itself
    }

    // Add a new particle
    addParticle(position, velocity, lifetime, color) {
        const particle = new Particle(position, velocity, lifetime, color);
        this.particles.push(particle);
        this.updateParticleSystem();
    }

    // Update all particles
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (particle.isAlive()) {
                particle.update(deltaTime);  // Update position and age
            } else {
                this.particles.splice(i, 1);  // Remove expired particles
            }
        }

        this.updateParticleSystem();  // Update geometry to reflect particle changes
    }

    // Update particle system geometry
    updateParticleSystem() {
        const positions = [];
        const colors = [];

        this.particles.forEach(particle => {
            positions.push(particle.position.x, particle.position.y, particle.position.z);
            const color = particle.getColor();
            colors.push(color.r, color.g, color.b);
        });

        // Update geometry with new positions and colors
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }

    // Return the particle system (to be added to the scene)
    getSystem() {
        return this.particleSystem;
    }
}
