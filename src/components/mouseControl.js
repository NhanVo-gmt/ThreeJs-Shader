import * as THREE from 'three'

export var MouseSelectedObj = null;
var MouseSelectedObjName = "";

export function MouseControl(document, renderer, camera, scene) {
    var raycaster = new THREE.Raycaster();
    // var update = setInterval(UPDATE, 60);

    function onDocumentMouseDown(event)
    {
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0)
        {
            if (intersects[0].object.name !== "floor" && intersects[0].object.name !== "" && MouseSelectedObj == null)
            {
                MouseSelectedObjName = intersects[0].object.name;
                MouseSelectedObj = intersects[0].object.parent;
            }
            else if (MouseSelectedObj != null)
            {
                console.log("Placed!");
                
                MouseSelectedObj = null;
                MouseSelectedObjName = "";
            }
        }
        
    }

    function onDocumentMouseMove(event)
    {
        console.log(MouseSelectedObj)
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0)
        {
            if (MouseSelectedObj != null)
            {
                var curIndex = 0;
                while (intersects[curIndex].object.name == MouseSelectedObjName)
                {
                    curIndex++;
                    if (curIndex >= intersects.length) return;
                }

                var pos = intersects[curIndex].point;
                MouseSelectedObj.position.x = pos.x;
                MouseSelectedObj.position.y = pos.y;
                MouseSelectedObj.position.z = pos.z;
            }
        }
    }

    function onKeyPress(event)
    {
        if (MouseSelectedObj != null)
        {
            switch (event.keyCode) 
            {
                case 97:
                    MouseSelectedObj.rotation.y += Math.PI / 20;
                    return;
                case 100:
                    MouseSelectedObj.rotation.y -= Math.PI / 20;
                    return;
            }
        }
    }

    document.addEventListener("mousemove", onDocumentMouseMove, false);
    document.addEventListener("mousedown", onDocumentMouseDown, false);
    document.addEventListener("keypress", onKeyPress, false);
}