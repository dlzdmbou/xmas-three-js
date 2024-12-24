import * as THREE from 'three';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';

class SceneManager {
    constructor(rendererContainer) {
        this.rendererContainer = rendererContainer;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.camera = null;
        this.controls = null;
        this.hemiLight = null;
        this.pointLightBack = null;
        this.pointLightFront = null;
        this.initialize();
    }

    initialize() {
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupControls();
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
        this.controls.rotateSpeed = 0.3;
        this.controls.mouseButtons = {
            LEFT: null,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.ROTATE
        };
        this.controls.update();
    }
}

export default SceneManager;
