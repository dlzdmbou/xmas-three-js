// FireworksEffect.js
import * as THREE from 'three';

export class FireworksEffect extends THREE.Group {
    constructor(position = new THREE.Vector3(), color = new THREE.Color(1, 1, 1), particleCount = 1) {
        super();
        
        this.position.set(position.x, position.y, position.z);
        this.color = color;
        this.particleCount = particleCount; // Number of particles
        this.particles = [];
        this.duration = 2; // Lifetime of the particles in seconds
        this.fadeOutSpeed = 1 / this.duration;
        this.elapsedTime = 0;

        // Initialize the particles
        this.initParticles();
    }

    initParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            // Create particles (small cubes)
            const particleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 1
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);

            // Randomize initial position within a small radius
            particle.position.set(
                this.position.x + (Math.random() - 0.5) * 2,
                this.position.y + (Math.random() - 0.5) * 2,
                this.position.z + (Math.random() - 0.5) * 2
            );

            // Randomize velocity for scatter effect
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.005,
                (Math.random() - 0.5) * 0.005,
                (Math.random() - 0.5) * 0.005
            );

            this.add(particle); // Add particle to the group
            this.particles.push(particle);
        }
    }

    update(deltaTime) {
        this.elapsedTime += deltaTime;
        console.log(this.elapsedTime);
    
        // If particles exceed their lifetime, remove the particle group from the scene
        if (this.elapsedTime >= this.duration) {
            // Only remove if the parent exists (is added to the scene)
            if (this.parent) {
                this.parent.remove(this);  // Remove the particle group from its parent (scene or other group)
            }
            return;
        }
    
        // Update the particles' behavior
        this.particles.forEach(particle => {
            // Update position based on velocity
            particle.position.add(particle.userData.velocity);
    
            // Fade out the particles over time
            particle.material.opacity = Math.max(1 - this.elapsedTime * this.fadeOutSpeed, 0);
        });
    }
    
}