// Основные переменные
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls (FPS-like movement)
const controls = new THREE.PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.addEventListener('click', () => {
    controls.lock();
});

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// World generation (simple flat world with some blocks)
const blockSize = 1;
const worldSize = 20; // Размер мира в блоках по осям
const blocks = new Map(); // Хранение блоков по координатам

function addBlock(x, y, z, color = 0x00ff00) {
    const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    const material = new THREE.MeshLambertMaterial({ color });
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x * blockSize, y * blockSize, z * blockSize);
    scene.add(block);
    blocks.set(\( {x}, \){y},${z}, block);
}

function removeBlock(x, y, z) {
    const key = \( {x}, \){y},${z};
    if (blocks.has(key)) {
        scene.remove(blocks.get(key));
        blocks.delete(key);
    }
}

// Generate ground
for (let x = -worldSize; x < worldSize; x++) {
    for (let z = -worldSize; z < worldSize; z++) {
        addBlock(x, 0, z, 0x228B22); // Grass
        if (Math.random() < 0.1) addBlock(x, 1, z, 0x8B4513); // Random dirt blocks
    }
}

// Camera position
camera.position.y = 2;
camera.position.z = 5;

// Movement
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': moveForward = true; break;
        case 's': moveBackward = true; break;
        case 'a': moveLeft = true; break;
        case 'd': moveRight = true; break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w': moveForward = false; break;
        case 's': moveBackward = false; break;
        case 'a': moveLeft = false; break;
        case 'd': moveRight = false; break;
    }
});

// Raycaster for block interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0, 0);

document.addEventListener('mousedown', (event) => {
    if (controls.isLocked) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            const intersect = intersects[0];
            const pos = intersect.object.position;
            const x = Math.round(pos.x / blockSize);
            const y = Math.round(pos.y / blockSize);
            const z = Math.round(pos.z / blockSize);
            if (event.button === 0) { // Left click - remove
                removeBlock(x, y, z);
            } else if (event.button === 2) { // Right click - add
                const normal = intersect.face.normal;
                addBlock(x + normal.x, y + normal.y, z + normal.z);
            }
        }
    }
});

// Animate
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        velocity.x -= velocity.x * 0.1;
        velocity.z -= velocity.z * 0.1;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveLeft) - Number(moveRight);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 0.05;
        if (moveLeft || moveRight) velocity.x -= direction.x * 0.05;

        controls.moveRight(-velocity.x);
        controls.moveForward(-velocity.z);
    }

    renderer.render(scene, camera);
}
animate();
// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
