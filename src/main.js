import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'dat.gui'
import { Reflector } from 'three/examples/jsm/objects/Reflector'
import { Sky } from 'three/examples/jsm/objects/Sky';
import waveVertexShader from './shaders/waveShaderVert.glsl?raw'
import waveFragmentShader from './shaders/waveShaderFrag.glsl?raw'

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

// Skybox

const sky = new Sky();
sky.scale.setScalar( 10000 );
scene.add( sky );

const skyUniforms = sky.material.uniforms;

skyUniforms[ 'turbidity' ].value = 10;
skyUniforms[ 'rayleigh' ].value = 2;
skyUniforms[ 'mieCoefficient' ].value = 0.005;
skyUniforms[ 'mieDirectionalG' ].value = 0.8;

let sun = new THREE.Vector3();
const parameters = {
  elevation: 2,
  azimuth: 180
};
let renderTarget;
const pmremGenerator = new THREE.PMREMGenerator( renderer );
const sceneEnv = new THREE.Scene();

function updateSun() {

  const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
  const theta = THREE.MathUtils.degToRad( parameters.azimuth );

  sun.setFromSphericalCoords( 1, phi, theta );

  sky.material.uniforms[ 'sunPosition' ].value.copy( sun );

  if ( renderTarget !== undefined ) renderTarget.dispose();

  sceneEnv.add( sky );
  renderTarget = pmremGenerator.fromScene( sceneEnv );
  scene.add( sky );

  scene.environment = renderTarget.texture;

}

updateSun();


// Create control
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

// SHADER
////////////////// TOON SHADER //////////////////////


let outlineObjects = [];
let outlineShaderVar = {
  thickness: 0.05,
  color: '#000000',
}

const solidify = (mesh) => 
{
  const geometry = mesh.geometry
  const material = new THREE.ShaderMaterial({
    uniforms: {
      thickness: { value: outlineShaderVar.thickness},
      color: {value: new THREE.Color(outlineShaderVar.color)}
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

///////////////////////////////////////////////////////////////////

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

////////////////// WATER SHADER //////////////////////

let groundMirror;

let waterShaderVar = {
  waveSpeed: 0.03,
  waveStrength: 0.5,
  color: "#000000"
}

const setReflector = () =>
{
  let geometry = new THREE.CircleGeometry(40, 64);  
  let customShader = Reflector.ReflectorShader;
  
  customShader = {

    name: 'ReflectorShader',
  
    uniforms: {
  
      'color': {
        value: waterShaderVar.color
      },
  
      'tDiffuse': {
        value: null
      },
  
      'textureMatrix': {
        value: null
      },
      
      'waveSpeed': {
        value: waterShaderVar.waveSpeed
      },

      'waveStrength' : {
        value: waterShaderVar.waveStrength
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
      uniform float waveStrength;
      uniform float waveSpeed;
      varying vec4 vUv;

      #include <logdepthbuf_pars_fragment>
      
      void main() 
      {
          #include <logdepthbuf_fragment>
      
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

///////////////////////////////////////////////////////////////////

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

// setReflector();


////////////////// WAVE SHADER //////////////////////

const setWaveShader = () => {
  const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512);
  const waterMaterial = new THREE.ShaderMaterial(
    {
      vertexShader: waveVertexShader,
      fragmentShader: waveFragmentShader,
      uniforms: 
      {
        uTime: { value: 0 },
        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5)},
        uBigWavesSpeed: { value: 0.75 },
        uDepthColor: { value: new THREE.Color("#186691")},
        uSurfaceColor: { value: new THREE.Color("#9bd8ff")},
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 5},

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3},
        uSmallWavesSpeed: { value: 0.2 },
        uSmallWavesIterations: { value: 1 },
      },
    },
  )
}

setWaveShader();

///////////////////////////////////////////////////////////////////




// Create Gui
const gui = new GUI();
const torusFolder = gui.addFolder("Torus");
torusFolder.add(torus.position, 'y', 0, 10);

const outlineShader = gui.addFolder("Outline")
outlineShader.add(outlineShaderVar, 'thickness', 0.05, 0.5);
outlineShader.addColor(outlineShaderVar, 'color').name("Color");

const waterShader = gui.addFolder("Water");
waterShader.add(waterShaderVar, 'waveSpeed', 0, 0.3);
waterShader.add(waterShaderVar, 'waveStrength', 0, 1);
waterShader.addColor(waterShaderVar, 'color').name("Color");

// MAIN
(async function () {


  renderer.setAnimationLoop(() => {
    controls.update();
    UpdateOutLineShader();
    // UpdateWaterShader();

    renderer.render(scene, camera);
  });
})();

const UpdateOutLineShader = () => {
  
  outlineObjects.forEach(outlineObject => {
    outlineObject.outline.position.set(outlineObject.mesh.position.x, outlineObject.mesh.position.y, outlineObject.mesh.position.z),
    outlineObject.outline.material.uniforms.color.value = new THREE.Color(outlineShaderVar.color);
    outlineObject.outline.material.uniforms.thickness.value = outlineShaderVar.thickness;
  });
}

const UpdateWaterShader = () => {
  groundMirror.material.uniforms.time.value += 0.1;
  groundMirror.material.uniforms.waveSpeed.value = waterShaderVar.waveSpeed;
  groundMirror.material.uniforms.waveStrength.value = waterShaderVar.waveStrength;
  groundMirror.material.uniforms.color.value = new THREE.Color(waterShaderVar.color);
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


