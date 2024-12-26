import * as THREE from 'three';

export default class ParticleSnow {
    constructor(scene, options = {}) {
        this.scene = scene;

        // Options with defaults
        const {
            cubeSize = 50,
            particleCount = 1000,
            particleSize = 0.2,
            swayAmplitude = 0.5,
            fallSpeed = 0.5,
            fadeSpeed = 0.01,
            color = 0xffffff
        } = options;

        this.cubeSize = cubeSize;
        this.particleCount = particleCount;
        this.particleSize = particleSize;
        this.swayAmplitude = swayAmplitude;
        this.fallSpeed = fallSpeed;
        this.fadeSpeed = fadeSpeed;

        this.particles = new THREE.BufferGeometry();
        this.positions = new Float32Array(particleCount * 3);
        this.velocities = new Float32Array(particleCount);
        this.opacities = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            this.positions[i * 3] = (Math.random() - 0.5) * cubeSize;
            this.positions[i * 3 + 1] = Math.random() * cubeSize;
            this.positions[i * 3 + 2] = (Math.random() - 0.5) * cubeSize;
            this.velocities[i] = Math.random() * 0.1 + fallSpeed;
            this.opacities[i] = 1.0;
        }

        this.particles.setAttribute(
            'position',
            new THREE.BufferAttribute(this.positions, 3)
        );
        this.particles.setAttribute(
            'opacity',
            new THREE.BufferAttribute(this.opacities, 1)
        );

        const material = new THREE.PointsMaterial({
            size: particleSize,
            transparent: true,
            depthWrite: false,
            color,
            opacity: 1,
        });

        this.particleSystem = new THREE.Points(this.particles, material);
        this.scene.add(this.particleSystem);
    }

    update(deltaTime) {
        const positions = this.particles.attributes.position.array;
        const opacities = this.particles.attributes.opacity.array;

        for (let i = 0; i < this.particleCount; i++) {
            const index = i * 3;

            // Apply sway using sin() based on particle's Z position
            positions[index] += Math.sin(positions[index + 2] + Date.now() * 0.001) * this.swayAmplitude * deltaTime;

            // Fall movement
            positions[index + 1] -= this.velocities[i] * deltaTime;

            // Fade out when reaching the bottom
            if (positions[index + 1] < -this.cubeSize / 2) {
                opacities[i] -= this.fadeSpeed * deltaTime;

                // Respawn when fully faded
                if (opacities[i] <= 0) {
                    positions[index] = (Math.random() - 0.5) * this.cubeSize;
                    positions[index + 1] = this.cubeSize / 2;
                    positions[index + 2] = (Math.random() - 0.5) * this.cubeSize;
                    opacities[i] = 1.0;
                }
            }
        }

        this.particles.attributes.position.needsUpdate = true;
        this.particles.attributes.opacity.needsUpdate = true;
    }
}