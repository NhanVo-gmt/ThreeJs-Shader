import * as THREE from "three"

export function AddLight(scene)
{
    const light = new THREE.DirectionalLight(new THREE.Color('#FFFFFF'), 0.5);
    light.position.set(0, 1, 0);
    scene.add(light);

    const amLight = new THREE.AmbientLight(0x55555);
    scene.add(amLight);

    return light;
}