// ParticleEffectDefault.js
import * as THREE from 'three';

export default class ParticleEffectDefault {
    constructor(particleManager) {
        this.particleManager = particleManager;
    }

    // Create an outward explosion effect
    createExplosion(center, count = 100, lifetime = 2.0, speed = 10.0, color = new THREE.Color(1, 0, 0)) {
        for (let i = 0; i < count; i++) {
            // Random direction in 3D space
            const direction = new THREE.Vector3(
                (Math.random() - 0.5) * 2, // Random x
                (Math.random() - 0.5) * 2, // Random y
                (Math.random() - 0.5) * 2  // Random z
            ).normalize();

            // Random speed
            const velocity = direction.multiplyScalar(Math.random() * speed);

            // Add particle to the manager
            this.particleManager.addParticle(center.clone(), velocity, lifetime, color);
        }
    }
}
