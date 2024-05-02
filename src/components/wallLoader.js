import * as THREE from "three"

export function WallMeshLoader(height)
{
    //create the material of the floor (basic material)
    var material_wall = new THREE.MeshPhongMaterial();
    material_wall.shininess = 100;
    material_wall.color = new THREE.Color(0.5,0.4,0.3);

    var normal_map = new THREE.TextureLoader().load('../../assets/wall/wall_normal.jpg');
    normal_map.wrapS = normal_map.wrapT = THREE.RepeatWrapping;
    normal_map.repeat = new THREE.Vector2(4,4);
    material_wall.normalMap = normal_map;

    var ao_map = new THREE.TextureLoader().load('../../assets/wall/wall_ao.jpg');
    material_wall.aoMap = ao_map;

    var geometry_wall = new THREE.BoxGeometry(height,0.5,30);
    var meshWall = new THREE.Mesh( geometry_wall, material_wall );
    meshWall.rotation.x = 1.55;
    meshWall.position.z -= 15;
    meshWall.receiveShadow = true;
    var meshWall1 = new THREE.Mesh( geometry_wall, material_wall );
    meshWall1.rotation.x = -1.55;
    meshWall1.position.z += 15;
    meshWall1.receiveShadow = true;
    var meshWall2 = new THREE.Mesh( geometry_wall, material_wall );
    meshWall2.rotation.z = -1.55;
    meshWall2.position.x += 15;
    meshWall2.receiveShadow = true;



    var meshWalls = [];
    meshWalls.push(meshWall, meshWall1, meshWall2);

    return meshWalls;
}