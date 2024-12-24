import * as THREE from 'three';
import { FBXLoader } from '/node_modules/three/examples/jsm/loaders/FBXLoader';

/**
 * A utility class for loading FBX 3D models into a Three.js scene.
 */
class ModelLoader {
    /**
     * Creates an instance of ModelLoader.
     * @param {THREE.Scene} scene - The Three.js scene where the loaded model will be added.
     */
    constructor(scene) {
        /**
         * @type {THREE.Scene}
         * The Three.js scene used to add the loaded model.
         */
        this.scene = scene;

        /**
         * @type {FBXLoader}
         * The FBXLoader instance used for loading models.
         */
        this.loader = new FBXLoader();
    }

    /**
     * Loads an FBX model and adds it to the scene.
     * @param {Object} options - Configuration options for loading the model.
     * @param {string} options.path - The file path to the FBX model. (Required)
     * @param {number} [options.scale=0.1] - The scale to apply to the loaded model.
     * @param {{x: number, y: number, z: number}} [options.position={x: 0, y: 0, z: 0}] - The initial position of the model.
     * @param {boolean} [options.isAnimated=false] - Whether the model includes animations. If `true`, an `AnimationMixer` will be attached to the model.
     * @param {boolean} [options.useShadows=true] - Whether the model should cast and receive shadows.
     * @returns {Promise<THREE.Object3D>} A promise that resolves to the loaded `THREE.Object3D` model.
     */
    loadModel({ path, scale = 0.1, position = { x: 0, y: 0, z: 0 }, isAnimated = false, useShadows = true }) {
        return new Promise((resolve, reject) => {
            if (!path) {
                reject(new Error('The "path" parameter is required.'));
                return;
            }

            this.loader.load(
                path,
                (object) => {
                    this.configureModel(object, { scale, position, useShadows });
                    if (isAnimated) this.attachAnimationMixer(object);
                    this.scene.add(object);
                    resolve(object);
                },
                (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
                (error) => reject(error)
            );
        });
    }

    /**
     * Configures the properties of a loaded model.
     * @param {THREE.Object3D} object - The loaded model object.
     * @param {Object} options - Configuration options for the model.
     * @param {number} options.scale - The scale to apply to the model.
     * @param {{x: number, y: number, z: number}} options.position - The position of the model.
     * @param {boolean} options.useShadows - Whether the model should cast and receive shadows.
     */
    configureModel(object, { scale, position, useShadows }) {
        object.scale.set(scale, scale, scale);
        object.position.set(position.x, position.y, position.z);

        object.traverse((node) => {
            if (node.isMesh) {
                node.material = new THREE.MeshStandardMaterial({ vertexColors: true });
                node.castShadow = useShadows;
                node.receiveShadow = useShadows;
            }
        });
    }

    /**
     * Attaches an AnimationMixer to a model for animation support.
     * @param {THREE.Object3D} object - The loaded model object.
     */
    attachAnimationMixer(object) {
        const mixer = new THREE.AnimationMixer(object);
        object.mixer = mixer;
    }
}

export default ModelLoader;
