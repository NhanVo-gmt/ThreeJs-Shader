import { FbxLoader } from "./fbxLoader";
import { FloorMeshLoader } from "./floorLoader";
import { WallMeshLoader } from "./wallLoader";
import * as THREE from "three"


export class Room
{
    floor: any; walls: any; scene: any
    possibleLocation: Array<THREE.Vector3> = []; yPos = -15;

    public roomVar = {
        width: 30,
        length: 30,
        height: 30,
    }
      
    roomConstant = {
        width: 30,
        length: 30,
    }

    objectVar = [
        {name: "table", model: "../assets/table/table.fbx", tex: "../assets/table/texture.jpg", scale: 0.01, light: ""},
        {name: "table1", model: "../assets/table1/table1.fbx", tex: "../assets/table1/texture.jpg", scale: 0.06, light: ""},
        {name: "lamp", model: "../assets/lamp/lamp.fbx", tex: "", scale: 0.1, light: "spot"},
        {name: "sofa", model: "../assets/sofa/sofa.fbx", tex: "../assets/sofa/texture.jpg", scale: 0.1, light: ""},
        {name: "ball", model: "../assets/ball/ball.fbx", tex: "../assets/ball/texture.jpg", scale: 0.1, light: ""},
    ]

    constructor(scene)
    {
        this.scene = scene;
        this.floor = FloorMeshLoader(this.roomVar.width, this.roomVar.length);
        scene.add(this.floor);

        this.walls = WallMeshLoader(this.roomVar.height);
        this.walls.forEach((item) => {
            scene.add(item);
        })

        this.roomVar.width = 60;
        this.roomVar.length = 60;

        this.populatePossibleLocation();
        this.addObjects();
        this.updateRoom();
    }

    populatePossibleLocation(): void 
    {
        for (var i = -2; i <= 2; i++)
        {
            this.possibleLocation.push(new THREE.Vector3(i * 10, this.yPos, i * 10));
        }
    }

    public addObjects() : void 
    {
        for (var i = 0; i < this.objectVar.length; i++)
        {
            let index = Math.floor(Math.random() * this.possibleLocation.length);
            let position = this.possibleLocation[index];

            let object = this.objectVar[i];
            FbxLoader(object.name, object.model, object.tex, this.scene, position, new THREE.Vector3(0, 0, 0), object.scale, object.light);

            this.possibleLocation.splice(index, 1);
        }
        // FbxLoader("table", "../assets/table/table.fbx", "../assets/table/texture.jpg", this.scene, new THREE.Vector3(-4, -15, -10), new THREE.Vector3(0, 0, 0), 0.01);
        // FbxLoader("lamp", "../assets/lamp/lamp.fbx", "", this.scene, new THREE.Vector3(-4, -15, 10), new THREE.Vector3(0, 0, 0), 0.1, "123");
        // FbxLoader("sofa", "../assets/sofa/sofa.fbx", "../assets/sofa/texture.jpg", this.scene, new THREE.Vector3(10, -15, 0), new THREE.Vector3(0, 4.65, 0), 0.1);
    }

    public updateRoom() : void
    {
        this.floor.scale.x = this.roomVar.length / this.roomConstant.length;
        this.floor.scale.z = this.roomVar.width / this.roomConstant.width;

    
        this.walls[0].position.z = -15 - (this.roomVar.width - this.roomConstant.width) / 2;
        this.walls[0].scale.x = this.floor.scale.x;
        this.walls[1].position.z = 15 + (this.roomVar.width - this.roomConstant.width) / 2;
        this.walls[1].scale.x = this.floor.scale.x;
        this.walls[2].position.x = 15 + (this.roomVar.length - this.roomConstant.length) / 2;
        this.walls[2].scale.z = this.floor.scale.z;
    }
}