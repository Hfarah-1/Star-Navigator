let scene, camera, renderer, controls;
let stars = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const infoBox = document.getElementById("infoBox");

let isFlying = false;
let isSettling = false;
let settleStartQuat, settleEndQuat;
let settleProgress = 0;
let currentTargetPos = null;

// --- helpers ---

function spectralLetter(typeStr) {
  if (!typeStr || typeof typeStr !== "string") return "G"; // safe default
  const up = typeStr.toUpperCase();

  // Handle common “white dwarf” variants if you add them later
  if (up.includes("WHITE DWARF") || up.startsWith("WD") || up.startsWith("DA") || up.startsWith("DB")) {
    return "WD";
  }
  // Standard OBAFGKM
  const letter = up[0];
  return "OBAFGKM".includes(letter) ? letter : "G";
}

function spectralToImage(typeStr) {
  // Map spectral letter to a local PNG in /star_images
  const letter = spectralLetter(typeStr);
  // Your prepared files should include: O.png, B.png, A.png, F.png, G.png, K.png, M.png
  // (Optional) If you added WD.png for white dwarfs, it will be used automatically.
  return `star_images/${letter}.png`;
}

// --- scene ---

scene = new THREE.Scene();
const starLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(starLight);

function addBackgroundStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.8,
    transparent: true,
    opacity: 0.8
  });

  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);
}
addBackgroundStars();

// camera
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 8);

// renderer
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// controls
controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 0.5;
controls.maxDistance = 500;
controls.target.set(0, 0, 0);
controls.update();

// Load stars
fetch("stars.json")
  .then(res => res.json())
  .then(data => {
    data.forEach(star => {
      const scale = 30;
      const starPos = new THREE.Vector3(star.x * scale, star.y * scale, star.z * scale);

      // size by class
      let size = 0.5;
      if (star.type?.startsWith?.("M")) size = 0.4;
      if (star.type?.startsWith?.("K")) size = 0.6;
      if (star.type?.startsWith?.("G")) size = 0.8;
      if (star.type?.startsWith?.("F")) size = 1.0;
      if (star.type?.startsWith?.("A")) size = 1.3;
      if (star.type?.startsWith?.("B")) size = 1.7;
      if (star.type?.startsWith?.("O")) size = 2.4;
      if (star.type?.toUpperCase?.().includes("WHITE DWARF") || star.type?.toUpperCase?.().startsWith("WD")) size = 0.25;

      const starGeo = new THREE.SphereGeometry(size, 18, 18);

      // color by class
      let color = 0xffffff;
      if (star.type?.startsWith?.("M")) color = 0xff7b7b;
      if (star.type?.startsWith?.("K")) color = 0xffb380;
      if (star.type?.startsWith?.("G")) color = 0xfff3b0;
      if (star.type?.startsWith?.("F")) color = 0xf6fff8;
      if (star.type?.startsWith?.("A")) color = 0xcfe6ff;
      if (star.type?.startsWith?.("B")) color = 0xa3c6ff;
      if (star.type?.startsWith?.("O")) color = 0x8bb3ff;

      const starMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
        roughness: 1.0,
        metalness: 0.0
      });

      const starMesh = new THREE.Mesh(starGeo, starMat);
      starMesh.position.copy(starPos);
      starMesh.userData = star;
      scene.add(starMesh);
      stars.push(starMesh);

      // glow halo
      const glowTexture = new THREE.TextureLoader().load(
        "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r152/examples/textures/sprites/glow.png"
      );
      const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: color,
        transparent: true,
        opacity: 3.3,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false
      });
      const glowSprite = new THREE.Sprite(glowMaterial);
      glowSprite.scale.set(size * 12, size * 12, 1);
      glowSprite.position.copy(starPos);
      glowSprite.renderOrder = 9999;
      scene.add(glowSprite);
    });
  })
  .catch(err => console.error("Failed to load stars.json", err));

// click
window.addEventListener("click", (event) => {
  if (isFlying || isSettling) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(stars, false);
  if (hit.length > 0) {
    const starMesh = hit[0].object;
    flyToStar(starMesh);
  }
});

// popup
function showInfo(star) {
  infoBox.classList.add("show");

  const portraitPath = spectralToImage(star.type);

  const imgHtml =
    `<img src="${portraitPath}"
           class="star-portrait"
           onload="this.classList.add('loaded')"
           onerror="this.onerror=null; this.src='star_images/G.png'; this.classList.add('loaded');" />`;

  infoBox.innerHTML = `
    <b>${star.name}</b><br>
    ${imgHtml}
    <div style="margin-bottom: 8px;">
      <i>${star.type}</i> • ${Number(star.dist).toFixed(2)} ly away
    </div>

    <b>Stellar Data</b><br>
    Temp: ${star.temperature} K<br>
    Radius: ${star.radius} R☉<br>
    Luminosity: ${star.luminosity} L☉<br>
    Mass: ${star.mass} M☉<br>
    ${Array.isArray(star.exoplanets) && star.exoplanets.length
      ? `<br><b>Exoplanets:</b> ${star.exoplanets.join(", ")}`
      : ""}

    ${star.description
      ? `<br><br><b>About:</b><br><span style="opacity: .9; line-height: 1.35;">${star.description}</span>`
      : ""}
  `;
}

// fly animation
function flyToStar(starMesh) {
  isFlying = true;
  controls.enabled = false;

  const startPos = camera.position.clone();
  const endPos = starMesh.position.clone();
  currentTargetPos = endPos.clone();

  const stopDistance = 2.2;
  const dir = endPos.clone().sub(startPos).normalize();
  const stopPos = endPos.clone().sub(dir.multiplyScalar(stopDistance));

  const midPoint = startPos.clone().add(stopPos).multiplyScalar(0.5).add(new THREE.Vector3(0, 2.0, 0));
  const curve = new THREE.CatmullRomCurve3([startPos, midPoint, stopPos]);
  const curvePoints = curve.getPoints(150);
  const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
  const curveLine = new THREE.Line(
    curveGeometry,
    new THREE.LineBasicMaterial({ color: 0xff11ff, transparent: true, opacity: 0.6 })
  );
  scene.add(curveLine);

  let t = 0;
  const speed = 0.004;
  const easeOutQuint = x => 1 - Math.pow(1 - x, 5);

  function step() {
    t += speed;
    const u = t < 1 ? easeOutQuint(t) : 1;
    camera.position.copy(curve.getPointAt(u));
    if (u > 0.6) controls.target.lerp(currentTargetPos, 0.05);

    if (u < 1) return requestAnimationFrame(step);

    scene.remove(curveLine);

    settleStartQuat = camera.quaternion.clone();
    camera.lookAt(endPos);
    settleEndQuat = camera.quaternion.clone();
    camera.quaternion.copy(settleStartQuat);

    settleProgress = 0;
    isSettling = true;
    isFlying = false;

    showInfo(starMesh.userData);
  }
  step();
}

// loop
function animate() {
  requestAnimationFrame(animate);

  if (isSettling) {
    settleProgress += 0.02;
    camera.quaternion.slerp(settleEndQuat, settleProgress);
    controls.target.lerp(currentTargetPos, 0.05);
    if (settleProgress >= 1) {
      isSettling = false;
      controls.enabled = true;
    }
  } else if (!isFlying) {
    controls.update();
  }

  // distance-based emissive “twinkle”
  for (let star of stars) {
    const dist = camera.position.distanceTo(star.position);
    const glow = Math.max(0.4, Math.min(3.0, 12 / dist));
    star.material.emissiveIntensity = glow;
  }

  renderer.render(scene, camera);
}
animate();

// resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});