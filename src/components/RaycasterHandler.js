import * as THREE from 'three';
import ObjectInteractionHandler from './ObjectInteractionHandler.js';

class RaycasterHandler {
    constructor(camera, scene) {
        this.raycaster = new THREE.Raycaster();
        this.camera = camera;
        this.scene = scene;
        this.rayLineHelper = null;
        this.intersectGroup = new THREE.Group();
        this.objectInteractionHandler = new ObjectInteractionHandler();
    }

    // Function to check for intersection with objects in the scene
    checkIntersection(mouse) {
        // Set ray from camera based on normalized mouse coordinates
        this.raycaster.setFromCamera(mouse, this.camera);
    
        // Cast the ray and check for intersections
        const intersects = this.raycaster.intersectObjects(this.scene.children);
    
        if (!this.rayLineHelper) {
            this.createRayLine();
        }
    
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            
            // Check if the object has the layers property before continuing
            if (intersectedObject && intersectedObject.layers) {
                if (this.groupContains(this.intersectGroup, intersectedObject)) {
                    console.log(`Intersect object found:`, intersectedObject);
                    this.objectInteractionHandler.handleObjectClick(intersectedObject);
                }
                this.updateRayLine(this.raycaster.ray, intersects[0].point);
            } else {
                console.log('Intersect object has no layers property');
                this.updateRayLine(this.raycaster.ray);
            }
        } else {
            console.log('No intersect objects found');
            this.updateRayLine(this.raycaster.ray);
        }
    }
    

    // Function to create the ray visualization line
    createRayLine() {
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color for the ray
        const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
        this.rayLineHelper = new THREE.Line(geometry, material);
        this.scene.add(this.rayLineHelper);
    }

    // Function to update the ray line
    updateRayLine(ray, point) {
        let endPoint;
        if (point) {
            // Ray endpoint is collision point
            endPoint = point;
        } else {
            // Ray endpoint is 200 units from the origin
            endPoint = ray.origin.clone().add(ray.direction.clone().multiplyScalar(200));
        }
        // Update line points
        this.rayLineHelper.geometry.setFromPoints([ray.origin, endPoint]);
    }

    // Function to check if an object is part of the intersection group
    groupContains(group, object) {
        let found = false;
        group.traverse((child) => {
            if (child === object) {
                found = true;
            }
        });
        return found;
    }
}

export default RaycasterHandler;
