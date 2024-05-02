import * as THREE from 'three'
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"

export async function FbxLoader(prefab)
{

    const loader = new FBXLoader();

    const object = await loader.loadAsync(prefab.path);

    object.traverse(function (child) {
        if ((child as THREE.Mesh).isMesh) {
            child.name = name;
            if ((child as THREE.Mesh).material) {
                
                if (prefab.tex !== "")
                {
                    const texture = new THREE.TextureLoader().load(prefab.tex);
                    child.material.map = texture;
                }
            }
        }
    })

    object.scale.set(prefab.scale, prefab.scale, prefab.scale);

    object.position.set(prefab.position.x, prefab.position.y, prefab.position.z);
    return object;
}

