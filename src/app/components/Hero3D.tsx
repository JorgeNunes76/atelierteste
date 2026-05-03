import { useEffect, useRef } from "react";
import * as THREE from "three";

// Hero painting image
const PAINTING_SRC =
  "https://images.unsplash.com/photo-1587538034041-4b37c2c863cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlnaHQlMjB3aGl0ZSUyMGFydCUyMHN0dWRpbyUyMGF0ZWxpZXIlMjBuYXR1cmFsJTIwbGlnaHQlMjBwYWludGluZyUyMGVhc2VsfGVufDF8fHx8MTc3MjUzODM0N3ww&ixlib=rb-4.1.0&q=80&w=1080";

export function Hero3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = window.innerWidth < 768;
    let W = mount.clientWidth;
    let H = mount.clientHeight;

    // ── Renderer ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // Fade in once texture loads
    renderer.domElement.style.opacity = "0";
    renderer.domElement.style.transition = "opacity 1.8s ease";
    mount.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0906);
    scene.fog = new THREE.FogExp2(0x0b0906, 0.028);

    // ── Camera ────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 0, 7.2);
    camera.lookAt(0, 0, 0);

    // ── Lights ────────────────────────────────────────────────────────
    // Ambient — warm dim base
    const ambient = new THREE.AmbientLight(0xfff5e0, 0.35);
    scene.add(ambient);

    // Key spotlight — gallery ceiling lamp
    const keyLight = new THREE.SpotLight(0xfff8ec, 4.5);
    keyLight.position.set(1.5, 7, 6);
    keyLight.angle = Math.PI / 9;
    keyLight.penumbra = 0.55;
    keyLight.decay = 1.4;
    keyLight.distance = 28;
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);
    scene.add(keyLight.target); // target at origin

    // Fill — cool blue-purple from opposite side
    const fillLight = new THREE.PointLight(0x3050c8, 0.6, 14);
    fillLight.position.set(-5, -3, 4);
    scene.add(fillLight);

    // Rim — warm orange from behind/below
    const rimLight = new THREE.PointLight(0xd4804a, 0.8, 12);
    rimLight.position.set(0, -4, -1.5);
    scene.add(rimLight);

    // Gold bounce — subtle warm light on frame
    const bounceLight = new THREE.PointLight(0xc4956a, 0.5, 6);
    bounceLight.position.set(0, 0, 3.5);
    scene.add(bounceLight);

    // ── Painting Dimensions ───────────────────────────────────────────
    const PW = isMobile ? 2.0 : 2.7;
    const PH = isMobile ? 2.6 : 3.5;
    const PD = 0.09; // canvas depth (shows stretched canvas edges)

    // ── Materials ─────────────────────────────────────────────────────
    // Canvas edge — stretched white linen
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0xf0ebe3,
      roughness: 0.96,
      metalness: 0,
    });
    // Canvas back
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x16110b,
      roughness: 1,
    });

    // ── Load painting texture ─────────────────────────────────────────
    const loader = new THREE.TextureLoader();
    const paintingTex = loader.load(PAINTING_SRC, () => {
      // Texture loaded → fade in canvas
      requestAnimationFrame(() => {
        renderer.domElement.style.opacity = "1";
      });
    });
    paintingTex.colorSpace = THREE.SRGBColorSpace;

    const frontMat = new THREE.MeshStandardMaterial({
      map: paintingTex,
      roughness: 0.78,
      metalness: 0.02,
    });

    // BoxGeometry material order: +x, -x, +y, -y, +z (front), -z (back)
    const canvasMaterials = [
      edgeMat, edgeMat, // sides
      edgeMat, edgeMat, // top/bottom
      frontMat,          // front face (painting)
      backMat,           // back face
    ];

    const paintingGeo = new THREE.BoxGeometry(PW, PH, PD, 1, 1, 1);
    const paintingMesh = new THREE.Mesh(paintingGeo, canvasMaterials);
    paintingMesh.castShadow = true;

    // ── Gold Ornate Frame ─────────────────────────────────────────────
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xc4956a,
      metalness: 0.88,
      roughness: 0.18,
    });
    const darkGoldMat = new THREE.MeshStandardMaterial({
      color: 0x7a5230,
      metalness: 0.75,
      roughness: 0.35,
    });

    const FT = isMobile ? 0.09 : 0.11; // frame bar thickness
    const FD = 0.16;                     // frame depth
    const FZ = PD * 0.5 + FD * 0.5 - 0.03; // z: slightly proud of painting face

    // Outer frame bars
    const fTopGeo    = new THREE.BoxGeometry(PW + FT * 2, FT, FD);
    const fSideGeo   = new THREE.BoxGeometry(FT, PH, FD);

    const frameTop    = new THREE.Mesh(fTopGeo,  goldMat);
    const frameBottom = new THREE.Mesh(fTopGeo,  goldMat);
    const frameLeft   = new THREE.Mesh(fSideGeo, goldMat);
    const frameRight  = new THREE.Mesh(fSideGeo, goldMat);

    frameTop.position.set(0,  PH / 2 + FT / 2, FZ);
    frameBottom.position.set(0, -(PH / 2 + FT / 2), FZ);
    frameLeft.position.set(-(PW / 2 + FT / 2), 0, FZ);
    frameRight.position.set(  PW / 2 + FT / 2,  0, FZ);

    [frameTop, frameBottom, frameLeft, frameRight].forEach((m) => {
      m.castShadow = true;
    });

    // Inner bevel — thin dark-gold liner
    const BV = 0.025;
    const bTopGeo  = new THREE.BoxGeometry(PW + FT * 2, BV, FD * 0.6);
    const bSideGeo = new THREE.BoxGeometry(BV, PH, FD * 0.6);
    const bevelFZ  = FZ + FD * 0.15;

    const bTop    = new THREE.Mesh(bTopGeo,  darkGoldMat);
    const bBottom = new THREE.Mesh(bTopGeo,  darkGoldMat);
    const bLeft   = new THREE.Mesh(bSideGeo, darkGoldMat);
    const bRight  = new THREE.Mesh(bSideGeo, darkGoldMat);

    bTop.position.set(0,  PH / 2, bevelFZ);
    bBottom.position.set(0, -PH / 2, bevelFZ);
    bLeft.position.set(-PW / 2, 0, bevelFZ);
    bRight.position.set( PW / 2, 0, bevelFZ);

    // ── Artwork Group ─────────────────────────────────────────────────
    const artGroup = new THREE.Group();
    artGroup.add(
      paintingMesh,
      frameTop, frameBottom, frameLeft, frameRight,
      bTop, bBottom, bLeft, bRight
    );
    scene.add(artGroup);

    // ── Background wall ───────────────────────────────────────────────
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0e0b08, roughness: 1 });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), wallMat);
    wall.position.z = -5;
    wall.receiveShadow = true;
    scene.add(wall);

    // ── Subtle floor plane (reflection) ───────────────────────────────
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0806,
      roughness: 0.3,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -PH / 2 - FT - 1.8;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Gold Dust Particles ───────────────────────────────────────────
    const PC = isMobile ? 200 : 400;
    const pPos   = new Float32Array(PC * 3);
    const pSpeed = new Float32Array(PC);
    const pPhase = new Float32Array(PC);

    for (let i = 0; i < PC; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 20;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1;
      pSpeed[i] = 0.0015 + Math.random() * 0.003;
      pPhase[i] = Math.random() * Math.PI * 2;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xc4956a,
      size: 0.014,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    const dustParticles = new THREE.Points(pGeo, pMat);
    scene.add(dustParticles);

    // ── Mouse / Touch Tracking ────────────────────────────────────────
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    const MAX_ROT = isMobile ? 0.1 : 0.22;

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRotY =  nx * MAX_ROT;
      targetRotX = -ny * MAX_ROT * 0.65;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const nx = (t.clientX / window.innerWidth  - 0.5) * 2;
      const ny = (t.clientY / window.innerHeight - 0.5) * 2;
      targetRotY =  nx * MAX_ROT;
      targetRotX = -ny * MAX_ROT * 0.65;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // ── Animation Loop ────────────────────────────────────────────────
    let clock = 0;
    let raf: number;

    const pPosAttr = pGeo.attributes.position as THREE.BufferAttribute;
    const pArray = pPosAttr.array as Float32Array;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      clock += 0.008;

      // Smooth rotation lerp
      const lerp = 0.042;
      currentRotX += (targetRotX - currentRotX) * lerp;
      currentRotY += (targetRotY - currentRotY) * lerp;
      artGroup.rotation.x = currentRotX;
      artGroup.rotation.y = currentRotY;

      // Subtle floating / breathing
      artGroup.position.y = Math.sin(clock * 0.65) * 0.045;
      artGroup.position.x = Math.sin(clock * 0.42) * 0.012;

      // Spotlight gentle sway (gallery effect)
      keyLight.position.x = 1.5 + Math.sin(clock * 0.28) * 0.6;
      keyLight.position.y = 7   + Math.cos(clock * 0.19) * 0.4;

      // Particle drift (upward + horizontal sway)
      for (let i = 0; i < PC; i++) {
        pArray[i * 3 + 1] += pSpeed[i];
        pArray[i * 3]     += Math.sin(clock + pPhase[i]) * 0.0005;
        if (pArray[i * 3 + 1] > 7) pArray[i * 3 + 1] = -7;
      }
      pPosAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ────────────────────────────────────────────────────────
    const handleResize = () => {
      W = mount.clientWidth;
      H = mount.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", handleResize);

    // ── Cleanup ───────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      paintingTex.dispose();
      pGeo.dispose();
      pMat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}