import * as THREE from 'three';
import Stats from '/node_modules/three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import ModelLoader from '/src/utils/ModelLoader.js';
import ParticleSnow from '/src/ParticleSystems/ParticleSnow.js'
import ParticleExplosion from '/src/ParticleSystems/ParticleExplosion';

/**
 * This 'class' is used to wrap most of the scene base components for the game / card.
 * I should really start cleaning up and reformatting code to be styled the same way...
 * I regret not having cleaned up sooner, i shall now just try to 'finish' the job...
 */
class SceneManager {
    constructor(rendererContainer) {
        this.rendererContainer = rendererContainer;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.clock = new THREE.Clock();
        this.camera = null;
        this.controls = null;
        this.hemiLight = null;
        this.pointLightBack = null;
        this.pointLightFront = null;
        this.stats = null;
        this.snowSystem = null;
        this.explosions = [];
        this.environment = null;
        this.initialize();
    }

    initialize() {
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupControls();
        this.setupStats();
        this.setupSnowSystem();
        this.setupEnvironment();
    }

    setupRenderer() {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize(this.rendererContainer.clientWidth, this.rendererContainer.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x101010);
        this.rendererContainer.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        const frustumSize = 500;
        const aspect = this.rendererContainer.clientWidth / this.rendererContainer.clientHeight;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2, 
            frustumSize * aspect / 2, 
            frustumSize / 2, 
            frustumSize / -2, 
            1, 
            1000
        );
        this.camera.position.set(-33, 33, -66);
    }

    setupLights() {
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.6);
        this.hemiLight.position.set(0, 10, 0);
        this.scene.add(this.hemiLight);

        this.pointLightBack = new THREE.PointLight(0x98BCFF, 120, 100, 0.85);
        this.pointLightBack.position.set(60, 20, 60);
        this.pointLightBack.castShadow = true;
        this.pointLightBack.shadow.mapSize.width = 1024;
        this.pointLightBack.shadow.mapSize.height = 1024;
        this.scene.add(this.pointLightBack);

        this.pointLightFront = new THREE.PointLight(0xFFF4CA, 150, 100, 0.85);
        this.pointLightFront.position.set(-50, 50, -50);
        this.pointLightFront.castShadow = true;
        this.pointLightFront.shadow.mapSize.width = 1024;
        this.pointLightFront.shadow.mapSize.height = 1024;
        this.scene.add(this.pointLightFront);

        // Debug
        // this.pointLightHelperFront = new THREE.PointLightHelper(this.pointLightFront, 1);
        // this.scene.add(this.pointLightHelperFront);
        // this.pointLightHelperBack = new THREE.PointLightHelper(this.pointLightBack, 1);
        // this.scene.add(this.pointLightHelperBack);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target = new THREE.Vector3(0, 10, 0);
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.maxPolarAngle = (Math.PI / 2) + 0.1;
        this.controls.minPolarAngle = 0.8;
        this.controls.enabled = true;
        this.controls.minZoom = 4;
        this.controls.maxZoom = 10;
        this.controls.zoomSpeed = 2;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = -0.69;
        this.controls.rotateSpeed = 0.3;
        this.controls.mouseButtons = {
            LEFT: null,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.ROTATE
        };
        this.cameraInitialPosition = this.camera.position;
        this.cameraInitialRotation = this.camera.rotation;
        this.controls.update();
    }

    setupStats() {
        this.stats = new Stats();
        this.stats.dom.style = '';
        this.stats.dom.classList.add('renderStats','hidden');
        this.rendererContainer.appendChild(this.stats.dom);
    }

    setupSnowSystem() {
        this.snowSystem = new ParticleSnow(this.scene, {
            cubeSize: 230,
            particleCount: 750,
            particleSize: 2.5,
            swayAmplitude: 3,
            fallSpeed: 10,
            fadeSpeed: 3,
            color: 0xffffff,
        });
    }

    async setupEnvironment() {
        const loader = new ModelLoader(this.scene);
        this.environment = await loader.loadModel({
            path: './3d/environment.fbx',
            scale: 0.1,
            isAnimated: false, // using simple shape key for this 'mole game', no real animations to mix.
            useShadows: true
        });
    }

    resetCamera() {
        this.controls.reset();
    }

    createExplosion(location, color) {
        const explosion = new ParticleExplosion(this.scene, location, color, {
            particleCount: 150,
            particleSize: 2,
            explosionSpeed: 35.0,
            lifetime: 1
        });
        this.explosions.push(explosion);
    }

    createHit(location, color) {
        const explosion = new ParticleExplosion(this.scene, location, color, {
            particleCount: 120,
            particleSize: 1.8,
            explosionSpeed: 69.0,
            lifetime: .3
        });
        this.explosions.push(explosion);
    }

    createShot(location, color) {
        const explosion = new ParticleExplosion(this.scene, location, color, {
            particleCount: 75,
            particleSize: 1.5,
            explosionSpeed: 150.0,
            lifetime: .1
        });
        this.explosions.push(explosion);
    }

    animate() {
        // Start measuring stats
        this.stats.begin();
    
        // Would you look at the time...
        // We'll use this for smooth updates on stuff later
        const deltaTime = this.clock.getDelta();
    
        // Update all the things, sometimes with time
        this.controls.update();
        this.camera.updateMatrixWorld();

        this.snowSystem.update(deltaTime);        

        this.explosions = this.explosions.filter(explosion => {
            explosion.update(deltaTime);
            return explosion.active;
        });
    
        // Render the frame
        this.renderer.render(this.scene, this.camera);
    
        // End measuring and update stats
        this.stats.end();
    }
}

export default SceneManager;
