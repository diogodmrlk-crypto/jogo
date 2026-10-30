"use strict";

const canvas = document.getElementById("renderCanvas");
const loadingScreen = document.getElementById("loadingScreen");

const progressBar = document.getElementById("loadingProgress");
const progressText = document.getElementById("loadingPercent");
const loadingStatus = document.getElementById("loadingStatus");

function setLoading(value, message) {
    const percent = Math.max(0, Math.min(100, Math.round(value)));
    if (progressBar) progressBar.style.width = percent + "%";
    if (progressText) progressText.textContent = percent + "%";
    if (loadingStatus) loadingStatus.textContent = message;
}

function finishLoading() {
    setLoading(100, "CIDADE PRONTA!");
    if (loadingScreen) {
        setTimeout(() => loadingScreen.classList.add("hidden"), 500);
    }
}

if (!canvas) {
    throw new Error("Elemento #renderCanvas não encontrado.");
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

// ==========================================
// CÂMERA
// ==========================================

const camera = new BABYLON.FreeCamera(
    "thirdPersonCamera",
    new BABYLON.Vector3(0, 5, -10),
    scene
);

camera.minZ = 0.1;
camera.fov = 0.85;
camera.inputs.clear();

// ==========================================
// LUZES
// ==========================================

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

// ==========================================
// MATERIAIS
// ==========================================

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
    leaves: makeMaterial("leavesMat", "#287343")
};

const buildingColors = [
    "#B7AEA1", "#929CA5", "#D0C1AE", "#777F89",
    "#C3C8C7", "#A69A91", "#B8B9B1"
];

// ==========================================
// CHÃO
// ==========================================

const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 500, height: 500 },
    scene
);
ground.position.y = -0.12;
ground.material = materials.ground;

// ==========================================
// ESTRADAS E ELEMENTOS
// ==========================================

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

// Faixas das ruas
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

// Calçadas
for (let x = -225; x <= 225; x += 45) {
    box("sidewalk", 35, 0.3, 3, x, 0.05, 13, materials.sidewalk);
    box("sidewalk", 35, 0.3, 3, x, 0.05, -13, materials.sidewalk);
    box("sidewalk", 3, 0.3, 35, 13, 0.05, x, materials.sidewalk);
    box("sidewalk", 3, 0.3, 35, -13, 0.05, x, materials.sidewalk);
}

// ==========================================
// PRÉDIOS
// ==========================================

function createBuilding(x, z, width, depth, height, color) {
    const mat = makeMaterial("building_" + x + "_" + z, color);

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

// ==========================================
// PALMEIRAS
// ==========================================

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
            { width: 0.45, height: 0.12, depth: 4.5 },
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

// ==========================================
// PERSONAGEM GLB MIXAMO
// ==========================================

setLoading(50, "PREPARANDO PERSONAGEM...");

const player = new BABYLON.TransformNode("player", scene);
player.position.set(0, 0, -25);

let characterModel = null;
let characterSkeletons = [];
let characterBones = [];
let characterReady = false;
let animationTime = 0;
let currentAnimation = "idle";

const shadow = BABYLON.MeshBuilder.CreateDisc(
    "playerShadow",
    { radius: 0.65, tessellation: 32 },
    scene
);
shadow.parent = player;
shadow.rotation.x = Math.PI / 2;
shadow.position.y = 0.025;

const shadowMat = new BABYLON.StandardMaterial("shadowMat", scene);
shadowMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
shadowMat.alpha = 0.25;
shadowMat.disableLighting = true;
shadow.material = shadowMat;

// Normaliza nomes para aceitar Mixamo com e sem ":" ou "_".
function normalizeBoneName(name) {
    return String(name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

function findBoneEntry(suffix) {
    const wanted = normalizeBoneName(suffix);
    return characterBones.find(item =>
        normalizeBoneName(item.name).endsWith(wanted)
    );
}

function prepareCharacterBones() {
    characterBones = [];

    for (const skeleton of characterSkeletons) {
        for (const bone of skeleton.bones) {
            let baseRotation = null;

            try {
                baseRotation = bone.getRotationQuaternion(BABYLON.Space.LOCAL);
            } catch (_) {}

            if (!baseRotation) {
                try {
                    const euler = bone.getRotation(BABYLON.Space.LOCAL);
                    if (euler) baseRotation = euler.toQuaternion();
                } catch (_) {}
            }

            characterBones.push({
                bone,
                name: bone.name,
                baseRotation: baseRotation
                    ? baseRotation.clone()
                    : BABYLON.Quaternion.Identity()
            });
        }
    }

    console.log("Ossos encontrados:", characterBones.map(item => item.name));
}

function rotateCharacterBone(suffix, pitch, yaw = 0, roll = 0) {
    const item = findBoneEntry(suffix);
    if (!item) return;

    const offset = BABYLON.Quaternion.RotationYawPitchRoll(
        yaw,
        pitch,
        roll
    );

    const rotation = item.baseRotation.multiply(offset);

    item.bone.setRotationQuaternion(
        rotation,
        BABYLON.Space.LOCAL
    );
}

async function loadHumanCharacter() {
    try {
        if (!BABYLON.SceneLoader) {
            throw new Error("SceneLoader indisponível. Verifique o Babylon.js GLTF loader.");
        }

        setLoading(58, "CARREGANDO MODELO HUMANO...");

        const result = await BABYLON.SceneLoader.ImportMeshAsync(
            "",
            "models/",
            "player.glb",
            scene
        );

        characterSkeletons = result.skeletons || [];

        // Usa as raízes de malha importadas. O parent é preservado
        // para manter a hierarquia e o esqueleto do arquivo GLB.
        const roots = result.meshes.filter(mesh => !mesh.parent);

        if (!roots.length) {
            throw new Error("Nenhuma malha raiz foi encontrada no GLB.");
        }

        characterModel = new BABYLON.TransformNode("HumanCharacter", scene);

        for (const root of roots) {
            root.parent = characterModel;
        }

        characterModel.parent = player;
        characterModel.position.set(0, 0, 0);
        characterModel.rotation.set(0, 0, 0);

        // Calcula os limites do modelo depois de atualizar as matrizes.
        scene.render();

        let minY = Infinity;
        let maxY = -Infinity;

        for (const mesh of result.meshes) {
            if (!mesh.getBoundingInfo || mesh.getTotalVertices() === 0) continue;

            mesh.computeWorldMatrix(true);
            const bounds = mesh.getBoundingInfo().boundingBox;

            minY = Math.min(minY, bounds.minimumWorld.y);
            maxY = Math.max(maxY, bounds.maximumWorld.y);
        }

        const modelHeight = maxY - minY;

        if (Number.isFinite(modelHeight) && modelHeight > 0.01) {
            const scale = 1.8 / modelHeight;
            characterModel.scaling.set(scale, scale, scale);
            characterModel.position.y = -minY * scale;
        }

        prepareCharacterBones();

        if (characterBones.length === 0) {
            console.warn("O GLB não forneceu ossos animáveis.");
        }

        characterReady = true;

        console.log(
            "Personagem GLB carregado.",
            "Esqueletos:", characterSkeletons.length,
            "Ossos:", characterBones.length
        );

        setLoading(76, "PERSONAGEM CARREGADO!");
        return true;

    } catch (error) {
        console.error("Falha ao carregar models/player.glb:", error);
        showToast("Erro ao carregar player.glb");
        setLoading(78, "MODELO NÃO ENCONTRADO - VERIFIQUE models/player.glb");
        return false;
    }
}

const characterLoading = loadHumanCharacter();

// ==========================================
// ANIMAÇÕES PROCEDURAIS
// ==========================================

function animateCharacter(delta, moving, sprinting) {
    if (!characterReady) return;

    const targetAnimation = !moving
        ? "idle"
        : sprinting
            ? "run"
            : "walk";

    currentAnimation = targetAnimation;

    const speed = targetAnimation === "run"
        ? 0.24
        : targetAnimation === "walk"
            ? 0.14
            : 0.045;

    animationTime += delta * speed;

    const phase = animationTime;

    let legSwing = 0;
    let armSwing = 0;
    let kneeBend = 0;
    let torsoLean = 0;
    let bodyBounce = 0;

    if (targetAnimation === "walk") {
        legSwing = Math.sin(phase) * 0.48;
        armSwing = Math.sin(phase) * 0.30;
        kneeBend = Math.max(0, Math.sin(phase)) * 0.18;
        torsoLean = 0.025;
        bodyBounce = Math.abs(Math.sin(phase * 2)) * 0.018;
    } else if (targetAnimation === "run") {
        legSwing = Math.sin(phase) * 0.78;
        armSwing = Math.sin(phase) * 0.58;
        kneeBend = Math.max(0, Math.sin(phase)) * 0.38;
        torsoLean = 0.14;
        bodyBounce = Math.abs(Math.sin(phase * 2)) * 0.045;
    }

    const breathing = Math.sin(phase) * 0.018;

    // Coxas e pernas inferiores
    rotateCharacterBone("LeftUpLeg", legSwing);
    rotateCharacterBone("RightUpLeg", -legSwing);
    rotateCharacterBone("LeftLeg", kneeBend);
    rotateCharacterBone("RightLeg", kneeBend);

    // Braços em oposição às pernas
    rotateCharacterBone("LeftArm", -armSwing);
    rotateCharacterBone("RightArm", armSwing);

    // Cotovelos ligeiramente flexionados
    const elbow = targetAnimation === "run" ? -0.42 :
        targetAnimation === "walk" ? -0.12 : -0.04;

    rotateCharacterBone("LeftForeArm", elbow);
    rotateCharacterBone("RightForeArm", elbow);

    // Coluna e respiração
    rotateCharacterBone("Spine", torsoLean);
    rotateCharacterBone("Spine2", breathing);

    if (characterModel) {
        characterModel.position.y +=
            (bodyBounce - characterModel.position.y) *
            Math.min(1, delta * 0.35);
    }
}

// ==========================================
// CONTROLES
// ==========================================

const input = {
    x: 0,
    y: 0,
    sprint: false
};

let cameraYaw = 0;
let cameraPitch = 0.18;
let verticalVelocity = 0;
let grounded = true;

const normalSpeed = 0.13;
const runSpeed = 0.23;

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("visible");

    setTimeout(() => toast.classList.remove("visible"), 1800);
}

// ==========================================
// JOYSTICK
// ==========================================

const joystick = document.getElementById("joystick");
const knob = document.getElementById("joystickKnob");

let joystickPointer = null;

function updateJoystick(event) {
    if (!joystick || !knob) return;

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

if (joystick) {
    joystick.addEventListener("pointerdown", event => {
        joystickPointer = event.pointerId;
        joystick.setPointerCapture(event.pointerId);
        updateJoystick(event);
    });

    joystick.addEventListener("pointermove", event => {
        if (event.pointerId === joystickPointer) updateJoystick(event);
    });

    function releaseJoystick(event) {
        if (event.pointerId !== joystickPointer) return;

        joystickPointer = null;
        input.x = 0;
        input.y = 0;

        if (knob) knob.style.transform = "translate(-50%, -50%)";
    }

    joystick.addEventListener("pointerup", releaseJoystick);
    joystick.addEventListener("pointercancel", releaseJoystick);
}

// ==========================================
// CÂMERA PELO DEDO
// ==========================================

const lookArea = document.getElementById("lookArea");

let lookPointer = null;
let lastX = 0;
let lastY = 0;

if (lookArea) {
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
        cameraPitch = Math.max(-0.05, Math.min(0.65, cameraPitch));

        lastX = event.clientX;
        lastY = event.clientY;
    });

    function releaseLook(event) {
        if (event.pointerId === lookPointer) lookPointer = null;
    }

    lookArea.addEventListener("pointerup", releaseLook);
    lookArea.addEventListener("pointercancel", releaseLook);
}

// ==========================================
// BOTÕES
// ==========================================

const sprintButton = document.getElementById("sprintButton");

if (sprintButton) {
    sprintButton.addEventListener("pointerdown", event => {
        event.preventDefault();
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
}

const jumpButton = document.getElementById("jumpButton");

if (jumpButton) {
    jumpButton.addEventListener("pointerdown", () => {
        if (grounded) {
            verticalVelocity = 0.20;
            grounded = false;
        }
    });
}

const interactButton = document.getElementById("interactButton");

if (interactButton) {
    interactButton.addEventListener("pointerdown", () => {
        showToast("Nenhuma interação próxima.");
    });
}

// ==========================================
// MOVIMENTO DO JOGADOR
// ==========================================

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

        const velocity = input.sprint ? runSpeed : normalSpeed;

        player.position.addInPlace(
            direction.scale(velocity * delta)
        );

        player.rotation.y = Math.atan2(direction.x, direction.z);
    }

    animateCharacter(delta, moving, input.sprint);

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

    // Câmera terceira pessoa
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

    const speedElement = document.getElementById("speed");
    if (speedElement) {
        speedElement.textContent =
            moving ? (input.sprint ? "18" : "8") : "0";
    }
}

// ==========================================
// MINIMAPA
// ==========================================

const mapCanvas = document.getElementById("mapCanvas");
const mapCtx = mapCanvas ? mapCanvas.getContext("2d") : null;

function drawMap() {
    if (!mapCtx || !mapCanvas) return;

    const width = mapCanvas.width;
    const height = mapCanvas.height;

    mapCtx.fillStyle = "#26343b";
    mapCtx.fillRect(0, 0, width, height);

    mapCtx.strokeStyle = "#a8a8a8";
    mapCtx.lineWidth = 7;

    for (let i = 20; i < width; i += 40) {
        mapCtx.beginPath();
        mapCtx.moveTo(i, 0);
        mapCtx.lineTo(i, height);
        mapCtx.stroke();

        mapCtx.beginPath();
        mapCtx.moveTo(0, i);
        mapCtx.lineTo(width, i);
        mapCtx.stroke();
    }

    const px = width / 2 + player.position.x * 0.2;
    const py = height / 2 + player.position.z * 0.2;

    mapCtx.fillStyle = "#42ff91";
    mapCtx.beginPath();
    mapCtx.arc(px, py, 5, 0, Math.PI * 2);
    mapCtx.fill();
}

// ==========================================
// REDIMENSIONAMENTO E LOOP
// ==========================================

window.addEventListener("resize", () => engine.resize());

let lastFrame = performance.now();

engine.runRenderLoop(() => {
    const now = performance.now();
    const delta = Math.min((now - lastFrame) / 16.67, 2);
    lastFrame = now;

    updatePlayer(delta);
    drawMap();
    scene.render();
});

// ==========================================
// CARREGAMENTO FINAL
// ==========================================

async function startGame() {
    setLoading(82, "CARREGANDO CENÁRIO...");

    await characterLoading;

    await scene.whenReadyAsync();

    setLoading(95, "PREPARANDO SUA ENTRADA...");
    finishLoading();
}

startGame();
