import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'dat.gui'
import { MouseControl, MouseSelectedObj } from "./components/mouseControl";
import { GlobalLight } from "./components/globalLight";

// Create scene and background
const scene = new THREE.Scene();
scene.background = new THREE.Color(1,1,1);

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

const light = GlobalLight();
scene.add(light);

// Create Gui
const gui = new GUI();


// Create control
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

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

const addTorus = async() => {
  const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 100);
  const material = new THREE.MeshPhysicalMaterial({
    color: '#4e62f9'
  })

  
  const torus = new THREE.Mesh(geometry, material);

  const outline = solidify(torus);

  scene.add(torus);
}

addTorus();

(function () {
  // MOUSE CONTROL
  MouseControl(document, renderer, camera, scene);

  renderer.setAnimationLoop(() => {
    controls.update();


    renderer.render(scene, camera);
  });
})();




