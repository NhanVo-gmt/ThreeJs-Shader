import * as THREE from 'three'
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { LightLoader } from './lightLoader';

export function FbxLoader(name, path, texPath, scene, position, rotation, scale = 0.01, light = "")
{
    const loader = new FBXLoader();
    // loader.load(path, (object) => {
    //     object.scale.set(scale, scale, scale);
    //     object.position.set(positionx, positiony, positionz);
    //     scene.add(object);
    // });
    loader.load(path, function(object) {
        object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                child.name = name;
                if ((child as THREE.Mesh).material) {
                    
                    if (texPath !== "")
                    {
                        const texture = new THREE.TextureLoader().load(texPath);
                        child.material.map = texture;
                    }
                }
            }
        })
        
        object.scale.set(scale, scale, scale);
        if (light !== "")
        {
            let target = new THREE.Object3D(0, 0, 0);
            target.parent = object;
            object.children.push(target);
            target.position.set(-100, 0, 0);

            object.children.push(LightLoader("hello", new THREE.Vector3(0,10,0), object, target, scene));
            console.log(object.children);
        }

        object.position.set(position.x, position.y, position.z);
        object.rotation.set(rotation.x, rotation.y, rotation.z);
        scene.add(object);
    })
}

