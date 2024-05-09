import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'dat.gui'
import { AddLight } from "./components/globalLight";
import { Reflector } from 'three/examples/jsm/objects/Reflector'

// Create scene and background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000424);

// Create camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
// camera.position.set(20, 20, 20);
camera.position.set(-17, 31, 33);
var cameralight = new THREE.PointLight( new THREE.Color(1,1,1), 1 );
camera.add( cameralight );
scene.add(camera);

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



// Create control
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

// SHADER
// Toon Shader
let outlineObjects = [];
let outlineVar = {
  thickness: 0.05,
  color: new THREE.Vector3(0, 0, 0),
}

const solidify = (mesh) => 
{
  const geometry = mesh.geometry
  const material = new THREE.ShaderMaterial({
    uniforms: {
      thickness: { value: outlineVar.thickness},
      color: {value: outlineVar.color}
    },
    vertexShader: /* glsl */ `
      uniform float thickness;
      void main() 
      {
        vec3 newPosition = position + normal * thickness;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 color;
      void main() 
      {
        gl_FragColor = vec4(color,1);
      }
    `,
    side: THREE.BackSide
  })

  let outline = new THREE.Mesh(geometry, material);
  scene.add(outline)
  outline.position.set(mesh.position.x, mesh.position.y, mesh.position.z)
  
  let outlineObject = 
  {
    mesh: mesh,
    outline: outline,
  }

  outlineObjects.push(outlineObject)
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


// Adding sphere
let sphere;
const addSphere = async() => {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshLambertMaterial({
    color: '#ffffff'
  })

  
  sphere = new THREE.Mesh(geometry, material);
  sphere.position.x = 5;

  solidify(sphere);

  scene.add(sphere);
}

addSphere();

// Reflection
let groundMirror;
const setReflector = () =>
{
  let geometry = new THREE.CircleGeometry(40, 64);  
  let customShader = Reflector.ReflectorShader;
  
  customShader = {

    name: 'ReflectorShader',
  
    uniforms: {
  
      'color': {
        value: null
      },
  
      'tDiffuse': {
        value: null
      },
  
      'textureMatrix': {
        value: null
      }
  
    },
  
    vertexShader: /* glsl */`
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    
    #include <common>
    #include <logdepthbuf_pars_vertex>
    
    void main() 
    {
        vUv = textureMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
    }
    
    `,
  
    fragmentShader: /* glsl */`
      uniform vec3 color;
      uniform sampler2D tDiffuse;
      uniform sampler2D tDudv;
      uniform float time;
      varying vec4 vUv;

      #include <logdepthbuf_pars_fragment>
      
      void main() 
      {
          #include <logdepthbuf_fragment>
      
          float waveStrength = 0.5;
          float waveSpeed = 0.03;
      
          // simple distortion
          // horizontal distortion
          vec2 distortedUv = texture2D(tDudv, vec2(vUv.x * time * waveSpeed, vUv.y)).rb * waveStrength;
          // vertical distortion
          distortedUv = vUv.xy * vec2(distortedUv.x, distortedUv.y * time * waveSpeed);
          vec2 distortion = (texture2D(tDudv, distortedUv).rb *2.0 - 1.0) * waveStrength;
      
          // new uv coords
          vec4 uv = vec4(vUv);
          uv.xy += distortion;
      
          // merge color
          vec4 base = texture2DProj(tDiffuse, uv);
          gl_FragColor = vec4(mix(base.rgb, color, 0.3), 1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
      }
      `
  };

  const dudvMap = new THREE.TextureLoader().load('../assets/waterdudv.jpg');
  dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;
  customShader.uniforms.tDudv = {value: dudvMap}
  customShader.uniforms.time = {value: 0}
  
  groundMirror = new Reflector(geometry, {
    shader: customShader,
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x889999
  })
  groundMirror.position.y = -2;
  groundMirror.rotateX(-Math.PI / 2)
  scene.add(groundMirror);
}

setReflector();


// Create Gui
const gui = new GUI();
const torusFolder = gui.addFolder("Torus");
torusFolder.add(torus.position, 'y', 0, 10);

const outlineShader = gui.addFolder("Outline")
outlineShader.add(outlineVar, 'thickness', 0.05, 0.5);
outlineShader.add(outlineVar.color, 'x', 0, 1).name("Red");
outlineShader.add(outlineVar.color, 'y', 0, 1).name("Green");
outlineShader.add(outlineVar.color, 'z', 0, 1).name("Blue");

// MAIN
(async function () {


  renderer.setAnimationLoop(() => {
    controls.update();
    UpdateOutLineShader();
    groundMirror.material.uniforms.time.value += 0.1;

    renderer.render(scene, camera);
  });
})();

const UpdateOutLineShader = () => {
  
  outlineObjects.forEach(outlineObject => {
    outlineObject.outline.position.set(outlineObject.mesh.position.x, outlineObject.mesh.position.y, outlineObject.mesh.position.z),
    outlineObject.outline.material.uniforms.color.value = outlineVar.color;
    outlineObject.outline.material.uniforms.thickness.value = outlineVar.thickness;
  });
}


	//this fucntion is called when the window is resized
	var MyResize = function ( )
  	{
    	var width = window.innerWidth;
    	var height = window.innerHeight;
    	renderer.setSize(width,height);
    	camera.aspect = width/height;
    	camera.updateProjectionMatrix();
    	renderer.render(scene,camera);
  	};

  	//link the resize of the window to the update of the camera
  	window.addEventListener( 'resize', MyResize);


