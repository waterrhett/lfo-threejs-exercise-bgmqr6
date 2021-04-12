import * as THREE from "three";
import * as dat from "dat.gui";
import OrbitControls from "three-orbitcontrols";

const width = 700;
const height = 500;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
// Enable shadow map
renderer.shadowMap.enabled = true;
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
earth.receiveShadow = true;

const moonMaterial = new THREE.MeshBasicMaterial();
const moon = new THREE.Mesh(geometry, moonMaterial);
moon.scale.set(0.2, 0.2, 0.2);
moon.position.x = 10;
moon.castShadow = true;

// Add satellite that revolves around the moon
const satelliteMaterial = new THREE.MeshBasicMaterial();
const satellite = new THREE.Mesh(geometry, satelliteMaterial);
satellite.scale.set(0.4, 0.4, 0.4);
satellite.position.x = 10;
satellite.castShadow = true;

earth.add(moon);
moon.add(satellite);
scene.add(earth);

// Spot light
const spotLightGroup = new THREE.Group();

const spotLight = new THREE.SpotLight(0xffffff, 1.0);
// spotLight.position.x = -5;
// spotLight.position.y = 5;
// spotLight.position.z = 5;
spotLight.castShadow = true;
// Add a little sphere to visualize spotLight position
const lightSphere = getSphere(0.3, 24, 24);
spotLight.add(lightSphere);
scene.add(spotLight);

// Occluding sphere for eclipse
const occludingSphere = getSphere(0.25, 24, 24,);
occludingSphere.castShadow = true;
occludingSphere.material.color.setHex( 0x000000 );

const ray = new THREE.Vector3();
ray.subVectors(earth.position, spotLight.position);
ray.normalize();
occludingSphere.position.set(
  spotLight.position.x + 0.1, 
  spotLight.position.y,
  spotLight.position.z);
// occludingSphere.position.addScaledVector(ray, 0.1);

spotLightGroup.add(spotLight);
spotLightGroup.add(occludingSphere);
spotLightGroup.position.x = -6;
spotLightGroup.position.y = -3;
spotLightGroup.position.z = 5;
spotLightGroup.position.addScaledVector(ray, 0.1);

scene.add(spotLightGroup);
const axesHelper = new THREE.AxesHelper( 5 );
scene.add(axesHelper);
const controls = new OrbitControls(camera, renderer.domElement);

// dat.gui for ease of control
const gui = new dat.GUI();

gui.add(spotLight, 'intensity', 0, 10);
gui.add(spotLightGroup.position, 'x', -5, 5);
gui.add(spotLightGroup.position, 'y', -5, 5);
gui.add(spotLightGroup.position, 'z', -10, 10);
// gui.add(spotLight.position, 'x', -5, 5);
// gui.add(spotLight.position, 'y', -5, 5);
// gui.add(spotLight.position, 'z', -10, 10);
// gui button for outputing satellite's position
const positionButton = { relativePosition:function(){ 
  var relativePosition = new THREE.Vector3();
  satellite.getWorldPosition(relativePosition);
  earth.worldToLocal(relativePosition);
  console.log(relativePosition);
}};
gui.add(positionButton,'relativePosition');


camera.position.z = 15;
function render() {
  requestAnimationFrame(render);

  earth.rotation.y += 0.005;
  moon.rotation.z += 0.02;

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
