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

const sphereRadius = 3;
const geometry = new THREE.SphereGeometry(
  sphereRadius,
  50,
  50,
  0,
  Math.PI * 2,
  0,
  Math.PI * 2
);

// const earthMaterial = new THREE.MeshNormalMaterial({ wireframe: true });
const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
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
const spotLight = new THREE.SpotLight(0xffffff, 2.0);
spotLight.position.x = -6;
spotLight.position.y = -3;
spotLight.position.z = 5;
// Allow for eclipse
spotLight.castShadow = true;
// Add a little sphere to visualize spotLight position
const lightSphere = getSphere(0.3, 24, 24);
spotLight.add(lightSphere);
scene.add(spotLight);

scene.add(spotLight);
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const controls = new OrbitControls(camera, renderer.domElement);

// Spaceship
const coneHeight = 0.5;
const coneRadius = 0.2;
const coneGeometry = new THREE.ConeGeometry( coneRadius, coneHeight, 10 );
const coneMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000} );
const spaceship = new THREE.Mesh( coneGeometry, coneMaterial );
const spaceShipSpeed = 0.1;
var allowExplosion = false;

// spaceship.lookAt(spotLight.position);
// spaceship.rotateZ(Math.PI/2);
// Initial speed is tangential to the earth
// spaceship.rotateX(Math.PI/2);
// Or equivalently: rotate (0, 1, 0) to (0, 0, 1)
var initQuat = new THREE.Quaternion();
initQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
spaceship.setRotationFromQuaternion(initQuat);
spaceship.position.x = -20;

scene.add(spaceship);

var options = {
  allowExplosion: false
};

// dat.gui
const gui = new dat.GUI();
var axesGUI = gui.addFolder('Axes');
axesGUI.add(axesHelper, 'visible');
axesGUI.open();

var spotLightGUI = gui.addFolder('SpotLight');
spotLightGUI.add(spotLight, "intensity", 0, 10);
spotLightGUI.add(spotLight.position, "x", -5, 5);
spotLightGUI.add(spotLight.position, "y", -5, 5);
spotLightGUI.add(spotLight.position, "z", -10, 10);
spotLightGUI.open();
// gui button for outputing satellite's position
var satelliteGUI = gui.addFolder('Satellite');
const positionButton = {
  relativePosition: function() {
    var relativePosition = new THREE.Vector3();
    satellite.getWorldPosition(relativePosition);
    earth.worldToLocal(relativePosition);
    console.log(relativePosition);
  }
};
satelliteGUI.add(positionButton, "relativePosition");
satelliteGUI.open();

var spaceshipGUI = gui.addFolder('SpaceShip');
spaceshipGUI.add(options, 'allowExplosion');
spaceshipGUI.open();

camera.position.z = 15;
function render() {
  requestAnimationFrame(render);

  earth.rotation.y += 0.005;
  moon.rotation.z += 0.02;

  udateSpaceship();
  renderer.render(scene, camera);
}

function udateSpaceship() {
  udpateSpaceShipRotation();
  spaceship.translateY(spaceShipSpeed);
  const dist2earth = spaceship.position.distanceTo(earth.position);
  const dist2moon = spaceship.position.distanceTo(moon.position);
  // Collision detection
  if (options.allowExplosion &&
      dist2earth < (sphereRadius*earth.scale.x + coneHeight*spaceship.scale.x) || 
      (dist2moon < (sphereRadius*moon.scale.x + coneHeight*spaceship.scale.x))) {
    spaceship.visible = false;
    console.log("Crashed!");
  }
  // avoidCollision();
  // Just so it dosn't wander to infinity
  if (dist2earth > 15) {
    spaceship.position.set(1, 0, 0);
  }
}

function udpateSpaceShipRotation() {
  let spaceshipPosition = new THREE.Vector3();
  spaceship.getWorldPosition(spaceshipPosition);

  let spaceship2earth = new THREE.Vector3();
  earth.getWorldPosition(spaceship2earth);
  spaceship2earth.sub(spaceshipPosition);

  let spaceship2moon = new THREE.Vector3();
  moon.getWorldPosition(spaceship2moon);
  spaceship2moon.sub(spaceshipPosition);

  let forceDir = new THREE.Vector3();
  forceDir.addScaledVector(spaceship2earth, 0.003);
  forceDir.addScaledVector(spaceship2moon, 0.03);
  forceDir.normalize();

  // local (0, 1, 0) --> world vec
  let spaceshipWorldDir = new THREE.Vector3(0, 1, 0);
  spaceship.localToWorld(spaceshipWorldDir);
  spaceshipWorldDir.normalize();
  let quat = new THREE.Quaternion();
  quat.setFromUnitVectors(spaceshipWorldDir, forceDir);

  spaceship.quaternion.slerp(quat, 0.1);
}

function avoidCollision() {
  const seeAhead = 5;
  let worldDir = new THREE.Vector3(0, 1, 0);
  spaceship.localToWorld(worldDir);
  let scaledWorldDir = new THREE.Vector3();
  scaledWorldDir.addScaledVector(worldDir, seeAhead);

  let ahead = new THREE.Vector3();
  ahead.addVectors(spaceship.position, scaledWorldDir);

  const aheadDist2earth = ahead.distanceTo(earth.position);
  const aheadDist2moon = ahead.distanceTo(moon.position);

  const forceScale = 100;
  let unitForce = new THREE.Vector3();
  if (aheadDist2earth < aheadDist2moon) {
    if (aheadDist2earth < (sphereRadius*earth.scale.x + coneHeight*spaceship.scale.x)) {
      unitForce.setX(ahead.x - earth.position.x);
      unitForce.setY(ahead.y - earth.position.y);
      unitForce.setZ(ahead.z - earth.position.z);
      unitForce.normalize();
    }
  }
  else {
      if (aheadDist2moon < (sphereRadius*moon.scale.x + coneHeight*spaceship.scale.x)) {
        unitForce.setX(ahead.x - moon.position.x);
        unitForce.setY(ahead.y - moon.position.y);
        unitForce.setZ(ahead.z - moon.position.z);
        unitForce.normalize();
    }
  }

  let spaceshipWorldDir = new THREE.Vector3(0, 1, 0);
  spaceship.localToWorld(spaceshipWorldDir);
  spaceshipWorldDir.normalize();
  let quat = new THREE.Quaternion();
  quat.setFromUnitVectors(spaceshipWorldDir, unitForce);
  spaceship.quaternion.slerp(quat, 1);
}

function getSphere(radius: number, wSegs: number, hSegs: number) {
  const geometry = new THREE.SphereGeometry(radius, wSegs, hSegs);
  const material = new THREE.MeshBasicMaterial({
    color: "rgb(255, 255, 0)"
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

render();
