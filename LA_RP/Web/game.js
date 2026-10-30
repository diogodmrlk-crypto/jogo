"use strict";

const canvas = document.getElementById("renderCanvas");
const loadingScreen = document.getElementById("loadingScreen");

const progressBar = document.getElementById("loadingProgress");
const progressText = document.getElementById("loadingPercent");
const loadingStatus = document.getElementById("loadingStatus");

function setLoading(value, message) {
    const percent = Math.max(0, Math.min(100, Math.round(value)));
    progressBar.style.width = percent + "%";
    progressText.textContent = percent + "%";
    loadingStatus.textContent = message;
}

function finishLoading() {
    setLoading(100, "CIDADE PRONTA!");

    setTimeout(() => {
        loadingScreen.classList.add("hidden");
    }, 500);
}

if (typeof BABYLON === "undefined") {
    setLoading(100, "ERRO AO CARREGAR O MOTOR 3D");
    throw new Error("Babylon.js não foi carregado.");
}

setLoading(8, "INICIANDO MOTOR 3D...");

const engine = new BABYLON.Engine(canvas, true, {
    antialias: true,
    preserveDrawingBuffer: false,
    stencil: true,
    adaptToDeviceRatio: true
});

const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.55, 0.76, 0.91, 1);
scene.collisionsEnabled = true;
scene.skipPointerMovePicking = true;

setLoading(18, "CRIANDO LOS ANGELES...");

// CÂMERA

const camera = new BABYLON.FreeCamera(
    "thirdPersonCamera",
    new BABYLON.Vector3(0, 5, -10),
    scene
);

camera.minZ = 0.1;
camera.fov = 0.85;
camera.inputs.clear();

// LUZES

const skyLight = new BABYLON.HemisphericLight(
    "skyLight",
    new BABYLON.Vector3(0, 1, 0),
    scene
);

skyLight.intensity = 0.9;

const sun = new BABYLON.DirectionalLight(
    "sun",
    new BABYLON.Vector3(-0.5, -1, 0.4),
    scene
);

sun.position = new BABYLON.Vector3(50, 100, -50);
sun.intensity = 0.8;

// MATERIAIS

function makeMaterial(name, color, roughness = 1) {
    const mat = new BABYLON.StandardMaterial(name, scene);
    mat.diffuseColor = BABYLON.Color3.FromHexString(color);
    mat.specularColor = new BABYLON.Color3(0.12, 0.12, 0.12);
    mat.specularPower = 32;
    return mat;
}

const materials = {
    ground: makeMaterial("groundMat", "#82936D"),
    road: makeMaterial("roadMat", "#34383D"),
    sidewalk: makeMaterial("sidewalkMat", "#B7B4AD"),
    line: makeMaterial("roadLineMat", "#E8D99A"),
    glass: makeMaterial("glassMat", "#4C8199"),
    palm: makeMaterial("palmMat", "#795333"),
    leaves: makeMaterial("leavesMat", "#287343"),
    skin: makeMaterial("skinMat", "#C58F6B"),
    shirt: makeMaterial("shirtMat", "#315FD1"),
    pants: makeMaterial("pantsMat", "#252C39"),
    shoes: makeMaterial("shoesMat", "#17191E")
};

const buildingColors = [
    "#B7AEA1",
    "#929CA5",
    "#D0C1AE",
    "#777F89",
    "#C3C8C7",
    "#A69A91",
    "#B8B9B1"
];

// CHÃO

const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 500, height: 500 },
    scene
);

ground.position.y = -0.12;
ground.material = materials.ground;

// ESTRADAS

function box(name, width, height, depth, x, y, z, mat) {
    const mesh = BABYLON.MeshBuilder.CreateBox(
        name,
        { width, height, depth },
        scene
    );

    mesh.position.set(x, y, z);
    mesh.material = mat;
    return mesh;
}

function createRoad(x, z, width, depth) {
    box("road", width, 0.15, depth, x, 0, z, materials.road);
}

createRoad(0, 0, 500, 22);
createRoad(0, 75, 500, 18);
createRoad(0, -75, 500, 18);
createRoad(75, 0, 18, 500);
createRoad(-75, 0, 18, 500);

// FAIXAS DAS RUAS

for (let x = -230; x <= 230; x += 12) {
    box("roadDash", 5, 0.025, 0.18, x, 0.09, 0, materials.line);
    box("roadDash", 5, 0.025, 0.18, x, 0.09, 75, materials.line);
    box("roadDash", 5, 0.025, 0.18, x, 0.09, -75, materials.line);
}

for (let z = -230; z <= 230; z += 12) {
    box("roadDash", 0.18, 0.025, 5, 0, 0.09, z, materials.line);
    box("roadDash", 0.18, 0.025, 5, 75, 0.09, z, materials.line);
    box("roadDash", 0.18, 0.025, 5, -75, 0.09, z, materials.line);
}

// CALÇADAS

for (let x = -225; x <= 225; x += 45) {
    box("sidewalk", 35, 0.3, 3, x, 0.05, 13, materials.sidewalk);
    box("sidewalk", 35, 0.3, 3, x, 0.05, -13, materials.sidewalk);
    box("sidewalk", 3, 0.3, 35, 13, 0.05, x, materials.sidewalk);
    box("sidewalk", 3, 0.3, 35, -13, 0.05, x, materials.sidewalk);
}

// PRÉDIOS

function createBuilding(x, z, width, depth, height, color) {
    const mat = makeMaterial(
        "building_" + x + "_" + z,
        color
    );

    const building = box(
        "building",
        width,
        height,
        depth,
        x,
        height / 2,
        z,
        mat
    );

    // Janelas na frente do prédio
    const rows = Math.max(2, Math.floor(height / 5));
    const cols = Math.max(2, Math.floor(width / 5));

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const wx = x - width / 2 + 2.5 + col * 5;
            const wy = 3 + row * 5;
            const wz = z - depth / 2 - 0.04;

            if (wy > height - 1) continue;

            box(
                "window",
                1.7,
                1.8,
                0.08,
                wx,
                wy,
                wz,
                materials.glass
            );
        }
    }

    return building;
}

setLoading(34, "CONSTRUINDO PRÉDIOS...");

for (let x = -180; x <= 180; x += 45) {
    for (let z = -180; z <= 180; z += 45) {
        if (Math.abs(x) < 25 || Math.abs(z) < 25) continue;

        const height = 14 + Math.random() * 27;
        const color = buildingColors[
            Math.floor(Math.random() * buildingColors.length)
        ];

        createBuilding(
            x,
            z,
            25 + Math.random() * 5,
            25 + Math.random() * 5,
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
            diameterBottom: 0.45
        },
        scene
    );

    trunk.position.set(x, 3.5, z);
    trunk.material = materials.palm;

    for (let i = 0; i < 7; i++) {
        const angle = i * Math.PI * 2 / 7;

        const leaf = BABYLON.MeshBuilder.CreateBox(
            "palmLeaf",
            {
                width: 0.45,
                height: 0.12,
                depth: 4.5
            },
            scene
        );

        leaf.position.set(
            x + Math.sin(angle) * 1.5,
            7,
            z + Math.cos(angle) * 1.5
        );

        leaf.rotation.y = angle;
        leaf.rotation.x = -0.25;
        leaf.material = materials.leaves;
    }
}

for (let i = -210; i <= 210; i += 30) {
    createPalm(i, 16);
    createPalm(i, -16);
}

setLoading(55, "CRIANDO PERSONAGEM...");

// PERSONAGEM HUMANOIDE

const player = new BABYLON.TransformNode("player", scene);
player.position.set(0, 0, -25);

function createLimb(name, parent, x, y, z, length, diameter, mat) {
    const pivot = new BABYLON.TransformNode(name + "Pivot", scene);
    pivot.parent = parent;
    pivot.position.set(x, y, z);

    const mesh = BABYLON.MeshBuilder.CreateCapsule(
        name,
        {
            height: length,
            radius: diameter / 2
        },
        scene
    );

    mesh.parent = pivot;
    mesh.position.y = -length / 2;
    mesh.material = mat;

    return pivot;
}

// Tronco
const torso = BABYLON.MeshBuilder.CreateCapsule(
    "playerTorso",
    { height: 1.05, radius: 0.32 },
    scene
);

torso.parent = player;
torso.position.y = 1.35;
torso.material = materials.shirt;

// Cabeça
const head = BABYLON.MeshBuilder.CreateSphere(
    "playerHead",
    { diameter: 0.48, segments: 12 },
    scene
);

head.parent = player;
head.position.y = 2.12;
head.material = materials.skin;

// Pernas
const leftLeg = createLimb(
    "leftLeg", player, -0.17, 0.92, 0, 0.9, 0.25, materials.pants
);

const rightLeg = createLimb(
    "rightLeg", player, 0.17, 0.92, 0, 0.9, 0.25, materials.pants
);

// Braços
const leftArm = createLimb(
    "leftArm", player, -0.42, 1.65, 0, 0.78, 0.20, materials.shirt
);

const rightArm = createLimb(
    "rightArm", player, 0.42, 1.65, 0, 0.78, 0.20, materials.shirt
);

// Sapatos
const leftShoe = box(
    "leftShoe", 0.25, 0.14, 0.38,
    -0.17, 0.12, 0.08, materials.shoes
);

leftShoe.parent = player;
leftShoe.position.set(-0.17, 0.12, 0.08);

const rightShoe = box(
    "rightShoe", 0.25, 0.14, 0.38,
    0.17, 0.12, 0.08, materials.shoes
);

rightShoe.parent = player;
rightShoe.position.set(0.17, 0.12, 0.08);

// SOMBRA
const shadow = BABYLON.MeshBuilder.CreateDisc(
    "playerShadow",
    { radius: 0.65, tessellation: 24 },
    scene
);

shadow.parent = player;
shadow.rotation.x = Math.PI / 2;
shadow.position.y = 0.03;

const shadowMat = new BABYLON.StandardMaterial("shadowMat", scene);
shadowMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
shadowMat.alpha = 0.25;
shadowMat.disableLighting = true;
shadow.material = shadowMat;

// CONTROLES

const input = {
    x: 0,
    y: 0,
    sprint: false
};

let cameraYaw = 0;
let cameraPitch = 0.18;
let verticalVelocity = 0;
let grounded = true;
let walkTime = 0;

const normalSpeed = 0.13;
const runSpeed = 0.23;

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

    let dx = event.clientX - (rect.left + rect.width / 2);
    let dy = event.clientY - (rect.top + rect.height / 2);

    const max = 38;
    const distance = Math.hypot(dx, dy);

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

// CÂMERA PELO DEDO

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

    cameraYaw += dx * 0.004;
    cameraPitch += dy * 0.002;

    cameraPitch = Math.max(
        -0.05,
        Math.min(0.65, cameraPitch)
    );

    lastX = event.clientX;
    lastY = event.clientY;
});

function releaseLook(event) {
    if (event.pointerId === lookPointer) lookPointer = null;
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
            verticalVelocity = 0.20;
            grounded = false;
        }
    }
);

document.getElementById("interactButton").addEventListener(
    "pointerdown",
    () => showToast("Nenhuma interação próxima.")
);

// MOVIMENTO

function updatePlayer(delta) {
    const moving =
        Math.abs(input.x) + Math.abs(input.y) > 0.08;

    if (moving) {
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

        const direction = forward.scale(-input.y)
            .add(right.scale(input.x));

        direction.normalize();

        const velocity = input.sprint
            ? runSpeed
            : normalSpeed;

        player.position.addInPlace(
            direction.scale(velocity * delta)
        );

        player.rotation.y = Math.atan2(
            direction.x,
            direction.z
        );

        walkTime += delta * (input.sprint ? 0.018 : 0.012);
    }

    // Animação dos braços e pernas
    const swing = moving ? Math.sin(walkTime) * 0.65 : 0;

    leftLeg.rotation.x = swing;
    rightLeg.rotation.x = -swing;
    leftArm.rotation.x = -swing * 0.7;
    rightArm.rotation.x = swing * 0.7;

    torso.position.y = 1.35 + (moving ? Math.abs(swing) * 0.025 : 0);

    // Gravidade e salto
    verticalVelocity -= 0.009 * delta;
    player.position.y += verticalVelocity * delta;

    if (player.position.y <= 0) {
        player.position.y = 0;
        verticalVelocity = 0;
        grounded = true;
    }

    player.position.x = Math.max(-235, Math.min(235, player.position.x));
    player.position.z = Math.max(-235, Math.min(235, player.position.z));

    // Câmera afastada, estilo terceira pessoa
    const target = new BABYLON.Vector3(
        player.position.x,
        player.position.y + 1.35,
        player.position.z
    );

    const distance = 8.5;

    const offset = new BABYLON.Vector3(
        Math.sin(cameraYaw) * distance,
        3.2 + cameraPitch * 4,
        -Math.cos(cameraYaw) * distance
    );

    camera.position.copyFrom(target.add(offset));
    camera.setTarget(target);

    document.getElementById("speed").textContent =
        moving ? (input.sprint ? "18" : "8") : "0";
}

// MINIMAPA

const mapCanvas = document.getElementById("mapCanvas");
const mapCtx = mapCanvas.getContext("2d");

function drawMap() {
    mapCtx.fillStyle = "#26343b";
    mapCtx.fillRect(0, 0, 160, 160);

    mapCtx.strokeStyle = "#a8a8a8";
    mapCtx.lineWidth = 7;

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

    const px = 80 + player.position.x * 0.2;
    const py = 80 + player.position.z * 0.2;

    mapCtx.fillStyle = "#42ff91";
    mapCtx.beginPath();
    mapCtx.arc(px, py, 5, 0, Math.PI * 2);
    mapCtx.fill();
}

// REDIMENSIONAMENTO

window.addEventListener("resize", () => {
    engine.resize();
});

// LOOP

let lastFrame = performance.now();

engine.runRenderLoop(() => {
    const now = performance.now();
    const delta = Math.min((now - lastFrame) / 16.67, 2);
    lastFrame = now;

    updatePlayer(delta);
    drawMap();
    scene.render();
});

// CARREGAMENTO

setLoading(72, "FINALIZANDO CENÁRIO...");

scene.executeWhenReady(() => {
    setLoading(92, "PREPARANDO SUA ENTRADA...");
    finishLoading();
});

setLoading(80, "CARREGANDO TEXTURAS E ILUMINAÇÃO...");
