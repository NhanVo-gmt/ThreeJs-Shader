import * as THREE from "three"

export function LightLoader(lightName, position, parent, target, scene)
{
    const light = new THREE.SpotLight(new THREE.Color('#f5d862'));

    light.intensity = 0.5;
    light.distance = 100;
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 10;
    light.shadow.camera.fov = 5;

    scene.add(light);

    if (parent != null)
    {
        light.position.set(position.x, position.y, position.z);
        light.target = target;
        light.parent = parent;

    }


    return light;
}