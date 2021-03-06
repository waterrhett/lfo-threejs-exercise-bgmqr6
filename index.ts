import * as THREE from "three";
import * as dat from 'dat.gui';

const width = 700;
const height = 500;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(
  3,
  50,
  50,
  0,
  Math.PI * 2,
  0,
  Math.PI * 2
);

// const earthMaterial = new THREE.MeshNormalMaterial({ wireframe: true });
const earthMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});
const earth = new THREE.Mesh(geometry, earthMaterial);
earth.position.x = 5;
earth.rotation.x = (23.4 / 180) * Math.PI;

const moonMaterial = new THREE.MeshBasicMaterial();
const moon = new THREE.Mesh(geometry, moonMaterial);
moon.scale.set(0.2, 0.2, 0.2);
moon.position.x = 10;

earth.add(moon);
scene.add(earth);

// Spot light
const spotLight = new THREE.SpotLight(0xffffff, 1.0);
spotLight.position.x = -3;
spotLight.position.y = 3;
spotLight.position.z = 3;
spotLight.castShadow = true;
// Add a little sphere to visualize spotLight position
const lightSphere = getSphere(0.3, 24, 24);
spotLight.add(lightSphere);
scene.add(spotLight);

// dat.gui for ease of control
const gui = new dat.GUI();

gui.add(spotLight, 'intensity', 0, 10);
gui.add(spotLight.position, 'x', -3, 3);
gui.add(spotLight.position, 'y', -3, 3);
gui.add(spotLight.position, 'z', -3, 3);

camera.position.z = 15;
function render() {
  requestAnimationFrame(render);

  earth.rotation.y += 0.005;

  renderer.render(scene, camera);
}

function getSphere(radius: number, wSegs: number, hSegs: number) {
  const geometry = new THREE.SphereGeometry(radius, wSegs, hSegs);
  const material = new THREE.MeshBasicMaterial({
    color: 'rgb(255, 255, 0)'
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

render();
