import { useEffect, useRef } from "react";
import * as THREE from "three";

const PAINTING_SRC =
  "https://images.unsplash.com/photo-1657901030675-050223ddcd41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHBhaW50aW5nJTIwdmlicmFudCUyMGdvbGQlMjBibHVlJTIwc3dpcmwlMjBmbHVpZCUyMGFydHxlbnwxfHx8fDE3NzI2NjczNTh8MA&ixlib=rb-4.1.0&q=80&w=1080";

export function HeroLivingCanvas() {
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
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    renderer.domElement.style.opacity = "0";
    renderer.domElement.style.transition = "opacity 2s ease";
    mount.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080705);
    scene.fog = new THREE.FogExp2(0x080705, 0.022);

    // ── Camera ────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(44, W / H, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    camera.lookAt(0, 0, 0);

    // ── Lights ────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xfff0d8, 0.28);
    scene.add(ambient);

    // Left-top spotlight — warm golden
    const spotA = new THREE.SpotLight(0xffead0, 5);
    spotA.position.set(-3.5, 6, 5);
    spotA.angle = Math.PI / 7;
    spotA.penumbra = 0.5;
    spotA.decay = 1.3;
    spotA.distance = 30;
    spotA.castShadow = true;
    spotA.shadow.mapSize.set(1024, 1024);
    spotA.shadow.bias = -0.001;
    scene.add(spotA);
    scene.add(spotA.target);

    // Right-top spotlight — cooler white
    const spotB = new THREE.SpotLight(0xe8f0ff, 3.5);
    spotB.position.set(4, 5, 6);
    spotB.angle = Math.PI / 8;
    spotB.penumbra = 0.6;
    spotB.decay = 1.4;
    spotB.distance = 25;
    spotB.castShadow = false;
    scene.add(spotB);
    scene.add(spotB.target);

    // Rim from behind — gives canvas a glowing edge
    const rimLight = new THREE.PointLight(0xc4956a, 1.2, 10);
    rimLight.position.set(0, 0, -1.5);
    scene.add(rimLight);

    // Under-fill
    const fillLight = new THREE.PointLight(0x1a2050, 0.7, 12);
    fillLight.position.set(0, -5, 4);
    scene.add(fillLight);

    // ── Canvas Plane (Living / Rippling) ─────────────────────────────
    const GRID_X = isMobile ? 36 : 52;
    const GRID_Y = isMobile ? 44 : 64;
    const CW = isMobile ? 2.4 : 3.2;  // canvas width
    const CH = isMobile ? 3.1 : 4.1;  // canvas height

    const canvasGeo = new THREE.PlaneGeometry(CW, CH, GRID_X, GRID_Y);

    // Store original (flat) x/y positions for wave calculation
    const origPos = new Float32Array(canvasGeo.attributes.position.array);

    const loader = new THREE.TextureLoader();
    const paintTex = loader.load(PAINTING_SRC, () => {
      requestAnimationFrame(() => {
        renderer.domElement.style.opacity = "1";
      });
    });
    paintTex.colorSpace = THREE.SRGBColorSpace;

    const canvasMat = new THREE.MeshStandardMaterial({
      map: paintTex,
      roughness: 0.72,
      metalness: 0.04,
      side: THREE.FrontSide,
    });

    const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
    canvasMesh.castShadow = true;
    canvasMesh.receiveShadow = true;
    scene.add(canvasMesh);

    // ── Canvas Back face (dark linen) ─────────────────────────────────
    const backGeo = new THREE.PlaneGeometry(CW, CH, 1, 1);
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x1c1510,
      roughness: 1,
      side: THREE.BackSide,
    });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.z = -0.01;
    scene.add(backMesh);

    // ── Thin Gold Frame (fixed at z=0) ────────────────────────────────
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xc4956a,
      metalness: 0.9,
      roughness: 0.16,
    });

    const FT = 0.055;   // frame bar thinness — deliberate minimal frame
    const FD = 0.08;
    const FZ = 0.06;    // hovering slightly proud

    const mkBar = (w: number, h: number, x: number, y: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, FD), goldMat);
      m.position.set(x, y, FZ);
      m.castShadow = true;
      return m;
    };

    const frameGroup = new THREE.Group();
    frameGroup.add(
      mkBar(CW + FT * 2, FT, 0,  CH / 2 + FT / 2),   // top
      mkBar(CW + FT * 2, FT, 0, -(CH / 2 + FT / 2)),  // bottom
      mkBar(FT, CH,  -(CW / 2 + FT / 2), 0),           // left
      mkBar(FT, CH,   (CW / 2 + FT / 2), 0),           // right
    );
    scene.add(frameGroup);

    // ── Background wall with subtle texture ───────────────────────────
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0d0b08, roughness: 1 });
    const wallMesh = new THREE.Mesh(new THREE.PlaneGeometry(50, 30), wallMat);
    wallMesh.position.z = -4;
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);

    // ── Gold Dust Particles ───────────────────────────────────────────
    const PC = isMobile ? 180 : 350;
    const pArr  = new Float32Array(PC * 3);
    const pSpd  = new Float32Array(PC);
    const pPhX  = new Float32Array(PC);
    const pPhY  = new Float32Array(PC);

    for (let i = 0; i < PC; i++) {
      pArr[i * 3]     = (Math.random() - 0.5) * 18;
      pArr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pArr[i * 3 + 2] = (Math.random() - 0.5) * 7 - 0.5;
      pSpd[i] = 0.001 + Math.random() * 0.003;
      pPhX[i] = Math.random() * Math.PI * 2;
      pPhY[i] = Math.random() * Math.PI * 2;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pArr, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xd4a870,
      size: 0.013,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });
    const dust = new THREE.Points(pGeo, pMat);
    scene.add(dust);

    // ── Mouse state ───────────────────────────────────────────────────
    // Normalized mouse [-1, 1] in each axis
    let mouseNX = 0;
    let mouseNY = 0;
    // Wave center on canvas local coords
    let waveCX = 0;
    let waveCY = 0;
    let targetWaveCX = 0;
    let targetWaveCY = 0;
    // Camera tilt
    let targetCamX = 0;
    let targetCamY = 0;
    let currentCamX = 0;
    let currentCamY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseNX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseNY = (e.clientY / window.innerHeight - 0.5) * 2;
      // Map to canvas local space
      targetWaveCX =  mouseNX * (CW  * 0.5);
      targetWaveCY = -mouseNY * (CH  * 0.5);
      // Subtle camera tilt
      targetCamX = -mouseNY * 0.06;
      targetCamY =  mouseNX * 0.1;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      mouseNX = (t.clientX / window.innerWidth  - 0.5) * 2;
      mouseNY = (t.clientY / window.innerHeight - 0.5) * 2;
      targetWaveCX =  mouseNX * (CW  * 0.5);
      targetWaveCY = -mouseNY * (CH  * 0.5);
      targetCamX = -mouseNY * 0.06;
      targetCamY =  mouseNX * 0.1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // ── Animation Loop ────────────────────────────────────────────────
    let clock = 0;
    let raf: number;
    const posAttr = canvasGeo.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    const pPosAttr = pGeo.attributes.position as THREE.BufferAttribute;
    const pPosArray = pPosAttr.array as Float32Array;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      clock += 0.007;

      // Lerp wave center toward mouse
      waveCX += (targetWaveCX - waveCX) * 0.04;
      waveCY += (targetWaveCY - waveCY) * 0.04;

      // Lerp camera rotation
      currentCamX += (targetCamX - currentCamX) * 0.035;
      currentCamY += (targetCamY - currentCamY) * 0.035;
      camera.rotation.x = currentCamX;
      camera.rotation.y = currentCamY;

      // ── Vertex ripple ──────────────────────────────────────────────
      const vertCount = posArray.length / 3;
      for (let i = 0; i < vertCount; i++) {
        const ox = origPos[i * 3];
        const oy = origPos[i * 3 + 1];

        // Distance from mouse-driven wave centre
        const dx = ox - waveCX;
        const dy = oy - waveCY;
        const distMouse = Math.sqrt(dx * dx + dy * dy);

        // Base undulation — two crossed sine waves
        const baseWave =
          Math.sin(ox * 1.8 + clock * 0.9) * 0.07 +
          Math.sin(oy * 1.4 - clock * 0.7) * 0.055 +
          Math.sin((ox + oy) * 0.9 + clock * 0.5) * 0.04;

        // Mouse ripple — circular wave expanding from wave centre
        const mouseRipple =
          Math.sin(distMouse * 3.5 - clock * 2.4) *
          0.14 *
          Math.exp(-distMouse * 0.9);

        // Edge curl — slight inward curl at borders
        const edgeDist = Math.min(
          Math.abs(ox - (-CW / 2)),
          Math.abs(ox - ( CW / 2)),
          Math.abs(oy - (-CH / 2)),
          Math.abs(oy - ( CH / 2))
        );
        const edgeCurl = edgeDist < 0.3 ? -Math.pow(0.3 - edgeDist, 2) * 0.6 : 0;

        posArray[i * 3 + 2] = baseWave + mouseRipple + edgeCurl;
      }
      posAttr.needsUpdate = true;
      canvasGeo.computeVertexNormals();

      // Sync backMesh to follow canvas origin
      backMesh.rotation.x = currentCamX;
      backMesh.rotation.y = currentCamY;

      // ── Spotlight sway ─────────────────────────────────────────────
      spotA.position.x = -3.5 + Math.sin(clock * 0.25) * 0.8;
      spotB.position.x =  4   + Math.cos(clock * 0.2)  * 0.6;

      // ── Particle drift ─────────────────────────────────────────────
      for (let i = 0; i < PC; i++) {
        pPosArray[i * 3 + 1] += pSpd[i];
        pPosArray[i * 3]     += Math.sin(clock * 0.6 + pPhX[i]) * 0.0006;
        pPosArray[i * 3 + 2] += Math.cos(clock * 0.4 + pPhY[i]) * 0.0003;
        if (pPosArray[i * 3 + 1] > 6) {
          pPosArray[i * 3 + 1] = -6;
          pPosArray[i * 3]     = (Math.random() - 0.5) * 18;
          pPosArray[i * 3 + 2] = (Math.random() - 0.5) * 7;
        }
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
      paintTex.dispose();
      pGeo.dispose();
      pMat.dispose();
      canvasGeo.dispose();
      canvasMat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
