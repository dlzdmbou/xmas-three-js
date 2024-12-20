import * as THREE from 'three';

const container = document.getElementById("App");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.innerWidth, container.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.innerWidth, container.innerHeight);
container.appendChild(renderer.domElement);
