import * as THREE from "three";

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

const earthMaterial = new THREE.MeshNormalMaterial({ wireframe: true });
//const earthMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});
const earth = new THREE.Mesh(geometry, earthMaterial);
earth.position.x = 5;
earth.rotation.x = (23.4 / 180) * Math.PI;

const moonMaterial = new THREE.MeshBasicMaterial();
const moon = new THREE.Mesh(geometry, moonMaterial);
moon.scale.set(0.2, 0.2, 0.2);
moon.position.x = 10;

earth.add(moon);
scene.add(earth);

camera.position.z = 15;
function render() {
  requestAnimationFrame(render);

  earth.rotation.y += 0.005;

  renderer.render(scene, camera);
}

render();
