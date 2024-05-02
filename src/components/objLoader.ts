import * as THREE from 'three'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';


export function ObjLoader(land, scene)
{
    var mtlLoader = new MTLLoader();
    mtlLoader.load(land.tex, function(materials)
    {
        console.log(materials);
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(land.path, function(object)
        {    
            scene.add( object );
        });
    });
}