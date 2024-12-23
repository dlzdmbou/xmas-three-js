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
     * 
     * @example
     * const loader = new ModelLoader(scene);
     * const model = await loader.loadModel({ 
     *   path: './models/environment.fbx',
     *   scale: 0.2, 
     *   position: { x: 10, y: 0, z: -5 }, 
     *   isAnimated: true, 
     *   useShadows: false 
     * });
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
                    // Set scale and position
                    object.scale.set(scale, scale, scale);
                    object.position.set(position.x, position.y, position.z);

                    // Traverse and configure meshes
                    object.traverse((node) => {
                        if (node.isMesh) {
                            node.material = new THREE.MeshStandardMaterial({ vertexColors: true });

                            // Apply shadow settings
                            node.castShadow = useShadows;
                            node.receiveShadow = useShadows;
                        }
                    });

                    // Add animation mixer if the model is animated
                    if (isAnimated) {
                        const mixer = new THREE.AnimationMixer(object);
                        object.mixer = mixer; // Attach mixer to object for external use
                    }

                    // Add the model to the scene
                    this.scene.add(object);

                    console.log('FBX model loaded:', object);
                    resolve(object);
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
                },
                (error) => {
                    console.error('An error occurred while loading the FBX model:', error);
                    reject(error);
                }
            );
        });
    }
}

export default ModelLoader;