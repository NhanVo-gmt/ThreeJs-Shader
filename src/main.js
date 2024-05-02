import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'dat.gui'
import { GlobalLight } from "./components/globalLight";
import { Reflector } from 'three/examples/jsm/objects/Reflector'

// Create scene and background
const scene = new THREE.Scene();
scene.background = new THREE.Color(.5,.5,.5);

// Create camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
// camera.position.set(20, 20, 20);
camera.position.set(-17, 31, 33);

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
// Enable shadow for lighting
renderer.useLegacyLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Light

const light = GlobalLight();
scene.add(light);


// Create control
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;



// SHADER
// Toon Shader
const solidify = (mesh) => 
{
  const THICKNESS = 0.03;
  const geometry = mesh.geometry
  const material = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      void main() 
      {
        vec3 newPosition = position + normal * ${THICKNESS};
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1);
      }
    `,
    fragmentShader: /* glsl */ `
      void main() 
      {
        gl_FragColor = vec4(0,0,0,1);
      }
    `,
    side: THREE.BackSide
  })

  const outline = new THREE.Mesh(geometry,material);
  scene.add(outline)
}

// Adding torus
let torus;
const addTorus = async() => {
  const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 100);
  const material = new THREE.MeshPhysicalMaterial({
    color: '#4e62f9'
  })

  
  torus = new THREE.Mesh(geometry, material);

  solidify(torus);

  scene.add(torus);
}
addTorus();


// Reflection

const setReflector = () =>
{
  let geometry;
  geometry = new THREE.CircleGeometry(40, 64);
  let groundMirror = new Reflector(geometry, {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0xb5b5b5
  })
  groundMirror.position.y = -5;
  groundMirror.rotateX(-Math.PI / 2)
  scene.add(groundMirror);
}

setReflector();


// Create Gui
const gui = new GUI();
const torusFolder = gui.addFolder("Torus");

torusFolder.add(torus.position, 'y', 0, 10);

// MAIN
(async function () {


  renderer.setAnimationLoop(() => {
    controls.update();


    renderer.render(scene, camera);
  });
})();




