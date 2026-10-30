const canvas = document.getElementById("renderCanvas");

const engine = new BABYLON.Engine(
    canvas,
    true,
    {
        preserveDrawingBuffer: true,
        stencil: true,
        antialias: true
    }
);

const scene = new BABYLON.Scene(engine);

scene.clearColor = new BABYLON.Color4(
    0.53, 0.76, 0.91, 1
);

scene.collisionsEnabled = true;

// CÂMERA

const camera = new BABYLON.FreeCamera(
    "camera",
    new BABYLON.Vector3(0, 5, -10),
    scene
);

camera.minZ = 0.1;
camera.fov = 0.9;

camera.inputs.clear();

// ILUMINAÇÃO

const sunlight = new BABYLON.HemisphericLight(
    "sun",
    new BABYLON.Vector3(0, 1, 0),
    scene
);

sunlight.intensity = 0.95;

const directional = new BABYLON.DirectionalLight(
    "directional",
    new BABYLON.Vector3(-0.5, -1, 0.5),
    scene
);

directional.intensity = 0.6;

// MATERIAIS

function material(name, color) {
    const mat = new BABYLON.StandardMaterial(name, scene);
    mat.diffuseColor = BABYLON.Color3.FromHexString(color);
    return mat;
}

const roadMat = material("road", "#34383d");
const sidewalkMat = material("sidewalk", "#a9a9a9");
const grassMat = material("grass", "#5c9a55");
const whiteMat = material("white", "#eeeeee");
const glassMat = material("glass", "#78a9c4");
const playerMat = material("player", "#3b70e8");
const skinMat = material("skin", "#d7a47c");
const palmMat = material("palm", "#795333");
const leafMat = material("leaves", "#237b43");

// CHÃO

const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    {
        width: 500,
        height: 500
    },
    scene
);

ground.position.y = -0.15;
ground.material = grassMat;

// ESTRADAS

function createRoad(x, z, width, depth) {
    const road = BABYLON.MeshBuilder.CreateBox(
        "road",
        {
            width,
            height: 0.12,
            depth
        },
        scene
    );

    road.position.set(x, 0, z);
    road.material = roadMat;
    return road;
}

createRoad(0, 0, 500, 18);
createRoad(0, 0, 18, 500);
createRoad(0, 75, 500, 14);
createRoad(75, 0, 14, 500);
createRoad(0, -75, 500, 14);
createRoad(-75, 0, 14, 500);

// PRÉDIOS

function createBuilding(x, z, width, depth, height, color) {
    const building = BABYLON.MeshBuilder.CreateBox(
        "building",
        {
            width,
            depth,
            height
        },
        scene
    );

    building.position.set(
        x,
        height / 2,
        z
    );

    building.material = material(
        "building_" + x + "_" + z,
        color
    );

    building.checkCollisions = true;

    // Janelas na fachada frontal
    const rows = Math.max(1, Math.floor(height / 4));
    const cols = Math.max(1, Math.floor(width / 4));

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {

            const windowMesh = BABYLON.MeshBuilder.CreateBox(
                "window",
                {
                    width: 1.4,
                    height: 1.5,
                    depth: 0.08
                },
                scene
            );

            windowMesh.position.set(
                x - width / 2 + 2 + col * 4,
                2.5 + row * 4,
                z - depth / 2 - 0.06
            );

            windowMesh.material = glassMat;
        }
    }

    return building;
}

// QUADRAS DA CIDADE

const colors = [
    "#b9b8b4",
    "#8e9ca7",
    "#d2c3ae",
    "#777e8a",
    "#c8d0d5",
    "#b6a59c"
];

for (let x = -180; x <= 180; x += 45) {
    for (let z = -180; z <= 180; z += 45) {

        if (
            Math.abs(x) < 25 ||
            Math.abs(z) < 25
        ) continue;

        const color = colors[
            Math.floor(Math.random() * colors.length)
        ];

        const height = 12 + Math.random() * 45;

        createBuilding(
            x,
            z,
            25 + Math.random() * 8,
            25 + Math.random() * 8,
            height,
            color
        );
    }
}

// PALMEIRAS

function createPalm(x, z) {
    const trunk = BABYLON.MeshBuilder.CreateCylinder(
        "palmTrunk",
        {
            height: 7,
            diameterTop: 0.25,
            diameterBottom: 0.5
        },
        scene
    );

    trunk.position.set(x, 3.5, z);
    trunk.material = palmMat;

    for (let i = 0; i < 7; i++) {

        const angle = i * Math.PI * 2 / 7;

        const leaf = BABYLON.MeshBuilder.CreateBox(
            "palmLeaf",
            {
                width: 0.5,
                height: 0.12,
                depth: 5
            },
            scene
        );

        leaf.position.set(
            x + Math.sin(angle) * 1.8,
            7,
            z + Math.cos(angle) * 1.8
        );

        leaf.rotation.y = angle;
        leaf.rotation.x = -0.25;
        leaf.material = leafMat;
    }
}

for (let i = -200; i <= 200; i += 30) {
    createPalm(i, 12);
    createPalm(i, -12);
}

// PERSONAGEM

const player = new BABYLON.TransformNode(
    "player",
    scene
);

const body = BABYLON.MeshBuilder.CreateCapsule(
    "body",
    {
        height: 1.8,
        radius: 0.35
    },
    scene
);

body.position.y = 0.95;
body.material = playerMat;
body.parent = player;
body.checkCollisions = true;

const head = BABYLON.MeshBuilder.CreateSphere(
    "head",
    {
        diameter: 0.55
    },
    scene
);

head.position.y = 2;
head.material = skinMat;
head.parent = player;

player.position.set(0, 0, -10);

// CONTROLES

const input = {
    x: 0,
    y: 0,
    sprint: false,
    jump: false
};

let cameraYaw = 0;
let cameraPitch = 0.25;
let verticalVelocity = 0;
let grounded = true;

const speed = 0.12;
const sprintSpeed = 0.22;

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("visible");

    setTimeout(() => {
        toast.classList.remove("visible");
    }, 1800);
}

// JOYSTICK

const joystick = document.getElementById("joystick");
const knob = document.getElementById("joystickKnob");

let joystickPointer = null;

function updateJoystick(event) {
    const rect = joystick.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const max = 38;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > max) {
        dx = dx / distance * max;
        dy = dy / distance * max;
    }

    input.x = dx / max;
    input.y = dy / max;

    knob.style.transform =
        `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
}

joystick.addEventListener("pointerdown", event => {
    joystickPointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    updateJoystick(event);
});

joystick.addEventListener("pointermove", event => {
    if (event.pointerId === joystickPointer) {
        updateJoystick(event);
    }
});

function releaseJoystick(event) {
    if (event.pointerId !== joystickPointer) return;

    joystickPointer = null;
    input.x = 0;
    input.y = 0;

    knob.style.transform = "translate(-50%, -50%)";
}

joystick.addEventListener("pointerup", releaseJoystick);
joystick.addEventListener("pointercancel", releaseJoystick);

// CÂMERA PELO TOQUE

const lookArea = document.getElementById("lookArea");

let lookPointer = null;
let lastX = 0;
let lastY = 0;

lookArea.addEventListener("pointerdown", event => {
    lookPointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    lookArea.setPointerCapture(event.pointerId);
});

lookArea.addEventListener("pointermove", event => {
    if (event.pointerId !== lookPointer) return;

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;

    cameraYaw += dx * 0.005;
    cameraPitch += dy * 0.003;

    cameraPitch = Math.max(
        -0.15,
        Math.min(0.8, cameraPitch)
    );

    lastX = event.clientX;
    lastY = event.clientY;
});

function releaseLook(event) {
    if (event.pointerId === lookPointer) {
        lookPointer = null;
    }
}

lookArea.addEventListener("pointerup", releaseLook);
lookArea.addEventListener("pointercancel", releaseLook);

// BOTÕES

const sprintButton = document.getElementById("sprintButton");

sprintButton.addEventListener("pointerdown", () => {
    input.sprint = true;
    sprintButton.classList.add("active");
});

function stopSprint() {
    input.sprint = false;
    sprintButton.classList.remove("active");
}

sprintButton.addEventListener("pointerup", stopSprint);
sprintButton.addEventListener("pointercancel", stopSprint);
sprintButton.addEventListener("pointerleave", stopSprint);

document.getElementById("jumpButton").addEventListener(
    "pointerdown",
    () => {
        if (grounded) {
            verticalVelocity = 0.22;
            grounded = false;
        }
    }
);

document.getElementById("interactButton").addEventListener(
    "pointerdown",
    () => {
        showToast("Nenhuma interação próxima.");
    }
);

// MOVIMENTAÇÃO E CÂMERA

function updatePlayer() {

    const moving = Math.abs(input.x) + Math.abs(input.y) > 0.05;

    if (moving) {

        const currentSpeed = input.sprint
            ? sprintSpeed
            : speed;

        const forward = new BABYLON.Vector3(
            Math.sin(cameraYaw),
            0,
            Math.cos(cameraYaw)
        );

        const right = new BABYLON.Vector3(
            Math.cos(cameraYaw),
            0,
            -Math.sin(cameraYaw)
        );

        const movement = forward.scale(-input.y)
            .add(right.scale(input.x));

        movement.normalize();

        player.position.addInPlace(
            movement.scale(currentSpeed)
        );

        player.rotation.y = Math.atan2(
            movement.x,
            movement.z
        );
    }

    // SALTO E GRAVIDADE

    verticalVelocity -= 0.009;
    player.position.y += verticalVelocity;

    if (player.position.y <= 0) {
        player.position.y = 0;
        verticalVelocity = 0;
        grounded = true;
    }

    // LIMITES DA CIDADE

    player.position.x = Math.max(
        -240,
        Math.min(240, player.position.x)
    );

    player.position.z = Math.max(
        -240,
        Math.min(240, player.position.z)
    );

    // CÂMERA TERCEIRA PESSOA

    const distance = 8;

    const target = new BABYLON.Vector3(
        player.position.x,
        player.position.y + 1.4,
        player.position.z
    );

    const offset = new BABYLON.Vector3(
        Math.sin(cameraYaw) * distance,
        3 + cameraPitch * 5,
        Math.cos(cameraYaw) * distance
    );

    camera.position.copyFrom(
        target.subtract(offset)
    );

    camera.setTarget(target);

    document.getElementById("speed").textContent =
        moving ? (input.sprint ? "18" : "8") : "0";
}

// MINIMAPA

const mapCanvas = document.getElementById("mapCanvas");
const mapCtx = mapCanvas.getContext("2d");

function drawMap() {
    mapCtx.fillStyle = "#303b40";
    mapCtx.fillRect(0, 0, 160, 160);

    mapCtx.strokeStyle = "#a5a5a5";
    mapCtx.lineWidth = 8;

    for (let i = 20; i < 160; i += 40) {
        mapCtx.beginPath();
        mapCtx.moveTo(i, 0);
        mapCtx.lineTo(i, 160);
        mapCtx.stroke();

        mapCtx.beginPath();
        mapCtx.moveTo(0, i);
        mapCtx.lineTo(160, i);
        mapCtx.stroke();
    }

    const px = 80 + player.position.x * 0.25;
    const py = 80 + player.position.z * 0.25;

    mapCtx.fillStyle = "#43ff89";
    mapCtx.beginPath();
    mapCtx.arc(px, py, 5, 0, Math.PI * 2);
    mapCtx.fill();
}

// LOOP DO JOGO

engine.runRenderLoop(() => {
    updatePlayer();
    drawMap();
    scene.render();
});

// REDIMENSIONAMENTO

window.addEventListener("resize", () => {
    engine.resize();
});

showToast("Bem-vindo a Los Angeles!");
