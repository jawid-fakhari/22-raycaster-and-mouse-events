import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

/**********************************
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**********************************
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
object1.position.x = -2;

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
object3.position.x = 2;

//Updating object's coordinate
object1.updateMatrixWorld();
object2.updateMatrixWorld();
object3.updateMatrixWorld();

scene.add(object1, object2, object3);

/**********************************
 * Raycaster
 */
//creare un raycaster
const raycaster = new THREE.Raycaster(); // init raycaster

// const rayOrigin = new THREE.Vector3(-3, 0, 0); // origine del ray
// const rayDirection = new THREE.Vector3(10, 0, 0); // direzione del ray che deve essere sempre normalizzato
// rayDirection.normalize(); //normalize method, converte il vettore in un unità del vettore, per capire puoi fare log prima e dopo di questo metodo
// raycaster.set(rayOrigin, rayDirection); //set origin and direction of ratcast

// //come cast un ray 2 opzione : "intersectObject(...)" , "intersectObjects(...)"
// const intersect = raycaster.intersectObject(object2);
// console.log(intersect);

// const intersects = raycaster.intersectObjects([object1, object2, object3]);
// console.log(intersects);

/**********************************
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/***********************************
 * Mouse
 */
const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / sizes.width) * 2 - 1;
  //Attenzione al Y, y di default è + verso giu e - verso su. quindi dobbiamo invertirlo
  mouse.y = -(e.clientY / sizes.height) * 2 + 1;
});

window.addEventListener("click", () => {
  currentIntersect.object === object1
    ? console.log("click obj 1")
    : currentIntersect.object === object2
    ? console.log("click obj 2")
    : console.log("click obj 3");
});
/**********************************
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**********************************
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**********************************
 * Model
 */
//Raycasting with model
const gltfLoader = new GLTFLoader();

//creare un variabile che viene riempito con gltf.scene, che servirà dopo nel tick per avere accesso
let model = null;

gltfLoader.load("/models/Duck/glTF-Binary/Duck.glb", (gltf) => {
  model = gltf.scene;
  model.position.y = -1.2;
  scene.add(model);
});

/**********************************
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.9);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight("#ffffff", 2.1);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);
/**********************************
 * Animate
 */
const clock = new THREE.Clock();

let currentIntersect = null; //CurrentIntersect variable to handle click event and mouse hover event

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  //Animate objects
  object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5;
  object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
  object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5;

  //Cast a ray
  raycaster.setFromCamera(mouse, camera);

  const objectsToTest = [object1, object2, object3];
  const intersects = raycaster.intersectObjects(objectsToTest);

  //set object's color to red
  for (const object of objectsToTest) {
    object.material.color.set(0xff0000);
  }
  //change color on instersecting object with raycast
  for (const objIntersect of intersects) {
    objIntersect.object.material.color.set(0xff00ee);
  }

  if (intersects.length) {
    if (currentIntersect === null) {
      console.log("enter");
    }
    currentIntersect = intersects[0];
  } else {
    if (currentIntersect) {
      console.log("out");
    }
    currentIntersect = null;
  }

  //Test intersect with model
  if (model) {
    const modelIntersects = raycaster.intersectObject(model);
    if (modelIntersects.length) {
      model.scale.set(1.2, 1.2, 1.2);
    } else {
      model.scale.set(1, 1, 1);
    }
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
