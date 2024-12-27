import * as THREE from 'three';
import ModelLoader from '/src/utils/ModelLoader';

/**
 * Represents a Mole character in the scene.
 * Handles loading, animations, and morph targets.
 */
class Mole extends THREE.Object3D {
    /**
     * Creates an instance of Mole.
     * @param {THREE.Scene} scene - The Three.js scene where the Mole will be added.
     * @param {Object} options - Configuration options for the Mole.
     * @param {string} options.path - The file path to the Mole FBX model.
     * @param {{x: number, y: number, z: number}} options.position - The initial position of the Mole.
     * @param {number} [options.scale=0.1] - The scale to apply to the Mole model.
     */
    constructor(scene, { path, position, scale = 0.1 }) {
        super();

        /**
         * @type {THREE.Scene}
         * The Three.js scene where the Mole is added.
         */
        this.scene = scene;

        /**
         * @type {string}
         * The file path to the Mole FBX model.
         */
        this.path = path;

        /**
         * @type {{x: number, y: number, z: number}}
         * The initial position of the Mole.
         */
        this.initialPosition = { ...position }; // Avoid direct mutation of input objects

        /**
         * @type {number}
         * The initial scale of the Mole model.
         */
        this.initialScale = scale; // Avoid direct mutation of input objects

        /**
         * @type {THREE.Object3D|null}
         * The loaded Mole model.
         */
        this.model = null;

        /**
         * @type {Object}
         * Dictionary of morph targets for the Mole model.
         */
        this.morphTargets = {};

        /**
         * @type {boolean}
         * Whether the Mole is in a "hit" state.
         */
        this.isHit = false;
    }

    /**
     * Loads the Mole model and adds it to the scene.
     * @returns {Promise<void>} A promise that resolves when the Mole is loaded.
     */
    async load() {
        const loader = new ModelLoader(this.scene);
        this.model = await loader.loadModel({
            path: './3d/mole.fbx',
            scale: this.initialScale,
            position: this.initialPosition,
            isAnimated: false, // using simple shape key for this 'mole game', no real animations to mix.
            useShadows: true
        });

        // Extract morph targets after the model is loaded
        this.extractMorphTargets();

        // Explicitly set position and scale after loading (to ensure correctness)
        this.model.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
        this.model.scale.set(this.initialScale, this.initialScale, this.initialScale);

        // Add the model to this Mole instance
        this.add(this.model);
    }

    /**
     * Extracts morph targets from the loaded Mole model.
     */
    extractMorphTargets() {
        this.model.traverse((node) => {
            if (node.isMesh && node.morphTargetDictionary) {
                this.morphTargets = node.morphTargetDictionary;
            }
        });
    }

    /**
     * Sets the "hit" state of the Mole.
     * @param {boolean} isHit - Whether the Mole is in a "hit" state.
     */
    setHitState(isHit) {
        this.isHit = isHit;

        this.model.traverse((node) => {
            if (node.isMesh && this.morphTargets['hit'] !== undefined) {
                node.morphTargetInfluences[this.morphTargets['hit']] = isHit ? 1 : 0;
            }
        });
    }
}

export default Mole;