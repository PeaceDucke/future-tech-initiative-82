import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Ультра-реалистичный 3D-мозг из светящихся неоновых линий (wireframe).
 * Бело-бежевая неоновая палитра. Две полусферы с извилинами,
 * нейронные узлы и бегущие по связям импульсы.
 */
export default function NeuralBrain() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = () => mount.clientWidth || 1;
    const H = () => mount.clientHeight || 1;

    /* ── scene / camera / renderer ─────────────────────────── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W() / H(), 0.1, 100);
    camera.position.set(2.6, 1.9, 6.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    /* palette */
    const C_LINE = new THREE.Color(0xf3ead6); // warm beige-white
    const C_NODE = new THREE.Color(0xfff6e3);
    const C_PULSE = new THREE.Color(0xfff1cf);

    const brain = new THREE.Group();
    scene.add(brain);

    /* ── procedural brain surface ──────────────────────────────
       Deform a sphere into a brain-like shape with two hemispheres,
       a central fissure and pseudo-gyri (folds) via layered noise.   */
    // ── anatomically-styled brain displacement ────────────────
    // Coordinate convention on the unit sphere p:
    //   x = left/right (mediolateral),  y = up/down,  z = front/back
    const shapeVertex = (v: THREE.Vector3) => {
      const p = v.clone().normalize();
      let r = 1.0;

      // 1) Gyri (folds): ridges that mostly run front-to-back & wrap around,
      //    giving the characteristic walnut/worm-like convolutions.
      const gyri =
        Math.sin(p.z * 11.0 + p.y * 6.0) *
          Math.cos(p.x * 7.0) * 0.045 +
        Math.sin(p.y * 13.0 + p.x * 5.0) * 0.03 +
        Math.cos(p.z * 17.0 + p.x * 9.0) * 0.018;
      r += gyri;

      // 2) Deep longitudinal fissure splitting the two hemispheres,
      //    strongest on the TOP, fading toward the bottom.
      const topMask = THREE.MathUtils.clamp(p.y * 1.4 + 0.25, 0, 1);
      const fissure =
        Math.exp(-Math.pow(p.x / 0.14, 2)) * 0.22 * topMask;
      r -= fissure;

      // 3) A few major sulci (lateral / central grooves) for realism.
      const lateral = Math.exp(-Math.pow((p.y + 0.05) / 0.18, 2)) * 0.05;
      r -= lateral * (0.5 + 0.5 * Math.cos(p.z * 3.0));

      // 4) Flatten the underside (brains are rounded on top, flatter below).
      if (p.y < 0) r += p.y * 0.10;

      const out = p.multiplyScalar(r);

      // 5) Overall proportions: a bit wider than tall, clearly elongated
      //    front-to-back (the egg/ovoid silhouette of a real brain).
      out.x *= 1.14; // width
      out.y *= 0.80; // height (lower → not a ball)
      out.z *= 1.42; // length front-back

      // 6) Frontal lobe slightly narrower & lifted, occipital tapered.
      const front = THREE.MathUtils.smoothstep(p.z, 0.2, 1.0);
      out.x *= 1.0 - front * 0.10;
      out.y += front * 0.05;

      return out;
    };

    const baseGeo = new THREE.IcosahedronGeometry(1.45, 24);
    const pos = baseGeo.attributes.position as THREE.BufferAttribute;
    const tmp = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      tmp.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      const s = shapeVertex(tmp).multiplyScalar(1.45);
      pos.setXYZ(i, s.x, s.y, s.z);
    }
    baseGeo.computeVertexNormals();

    /* wireframe neon mesh */
    const wireGeo = new THREE.WireframeGeometry(baseGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: C_LINE,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    brain.add(wire);

    /* a brighter sparse contour wireframe for definition */
    const contourGeo = new THREE.WireframeGeometry(
      new THREE.IcosahedronGeometry(1.45, 14)
    );
    const cPos = contourGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cPos.count; i++) {
      tmp.set(cPos.getX(i), cPos.getY(i), cPos.getZ(i)).divideScalar(1.45);
      const s = shapeVertex(tmp).multiplyScalar(1.45);
      cPos.setXYZ(i, s.x, s.y, s.z);
    }
    const contourMat = new THREE.LineBasicMaterial({
      color: C_LINE,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const contour = new THREE.LineSegments(contourGeo, contourMat);
    brain.add(contour);

    /* ── neuron nodes on the surface ───────────────────────── */
    const NODE_COUNT = 260;
    const nodePositions: THREE.Vector3[] = [];
    const nodeArr = new Float32Array(NODE_COUNT * 3);
    for (let i = 0; i < NODE_COUNT; i++) {
      // fibonacci sphere → even distribution, then shape it
      const t = i / NODE_COUNT;
      const inc = Math.acos(1 - 2 * t);
      const az = Math.PI * (1 + Math.sqrt(5)) * i;
      tmp.set(
        Math.sin(inc) * Math.cos(az),
        Math.sin(inc) * Math.sin(az),
        Math.cos(inc)
      );
      const s = shapeVertex(tmp).multiplyScalar(1.45 * 1.005);
      nodePositions.push(s.clone());
      nodeArr.set([s.x, s.y, s.z], i * 3);
    }
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodeArr, 3));

    const nodeSprite = makeGlowTexture();
    const nodeMat = new THREE.PointsMaterial({
      size: 0.12,
      map: nodeSprite,
      color: C_NODE,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const nodes = new THREE.Points(nodeGeo, nodeMat);
    brain.add(nodes);

    /* ── synaptic connections (neon links) ─────────────────── */
    type Link = { a: THREE.Vector3; b: THREE.Vector3 };
    const links: Link[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const a = nodePositions[i];
      // connect to a few nearest neighbours
      const dists: { j: number; d: number }[] = [];
      for (let j = 0; j < NODE_COUNT; j++) {
        if (j === i) continue;
        dists.push({ j, d: a.distanceToSquared(nodePositions[j]) });
      }
      dists.sort((p, q) => p.d - q.d);
      const k = 2 + (i % 2);
      for (let n = 0; n < k; n++) {
        const b = nodePositions[dists[n].j];
        if (i < dists[n].j) links.push({ a, b });
      }
    }
    const linkArr = new Float32Array(links.length * 6);
    links.forEach((l, i) => {
      linkArr.set([l.a.x, l.a.y, l.a.z, l.b.x, l.b.y, l.b.z], i * 6);
    });
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute("position", new THREE.BufferAttribute(linkArr, 3));
    const linkMat = new THREE.LineBasicMaterial({
      color: C_LINE,
      transparent: true,
      opacity: 0.13,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const linkLines = new THREE.LineSegments(linkGeo, linkMat);
    brain.add(linkLines);

    /* ── travelling impulses along links ───────────────────── */
    const PULSE_COUNT = 36;
    const pulseArr = new Float32Array(PULSE_COUNT * 3);
    const pulses = Array.from({ length: PULSE_COUNT }, () => ({
      link: Math.floor(Math.random() * links.length),
      t: Math.random(),
      speed: 0.25 + Math.random() * 0.55,
    }));
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulseArr, 3));
    const pulseMat = new THREE.PointsMaterial({
      size: 0.17,
      map: nodeSprite,
      color: C_PULSE,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const pulsePoints = new THREE.Points(pulseGeo, pulseMat);
    brain.add(pulsePoints);

    /* ── inner glow core ───────────────────────────────────── */
    const coreMat = new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      color: 0xfff0d8,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const core = new THREE.Sprite(coreMat);
    core.scale.set(4.2, 4.2, 1);
    brain.add(core);

    /* subtle lighting just affects nothing (lines unlit) but keep ambient for sprites */
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    /* ── interaction: gentle parallax on pointer ───────────── */
    let targetRX = 0;
    let targetRY = 0;
    const onMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetRY = nx * 0.6;
      targetRX = ny * 0.4;
    };
    mount.addEventListener("pointermove", onMove);

    /* ── visibility pause ──────────────────────────────────── */
    let visible = true;
    const io = new IntersectionObserver(
      ([en]) => (visible = en.isIntersecting),
      { threshold: 0.01 }
    );
    io.observe(mount);

    /* ── resize ────────────────────────────────────────────── */
    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    /* ── animation loop ────────────────────────────────────── */
    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // static brain - only subtle pointer parallax (no auto-spin)
      brain.rotation.x += (targetRX - brain.rotation.x) * 0.05;
      brain.rotation.y += (targetRY - brain.rotation.y) * 0.05;

      // breathing glow
      core.material.opacity = 0.4 + Math.sin(t * 1.6) * 0.12;
      nodeMat.opacity = 0.7 + Math.sin(t * 2.0) * 0.2;

      // move impulses
      for (let i = 0; i < PULSE_COUNT; i++) {
        const p = pulses[i];
        p.t += dt * p.speed;
        if (p.t >= 1) {
          p.t = 0;
          p.link = Math.floor(Math.random() * links.length);
          p.speed = 0.25 + Math.random() * 0.55;
        }
        const l = links[p.link];
        const x = l.a.x + (l.b.x - l.a.x) * p.t;
        const y = l.a.y + (l.b.y - l.a.y) * p.t;
        const z = l.a.z + (l.b.z - l.a.z) * p.t;
        pulseArr.set([x, y, z], i * 3);
      }
      pulseGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    tick();

    /* ── cleanup ───────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mount.removeEventListener("pointermove", onMove);
      renderer.dispose();
      baseGeo.dispose();
      wireGeo.dispose();
      contourGeo.dispose();
      nodeGeo.dispose();
      linkGeo.dispose();
      pulseGeo.dispose();
      wireMat.dispose();
      contourMat.dispose();
      nodeMat.dispose();
      linkMat.dispose();
      pulseMat.dispose();
      coreMat.dispose();
      nodeSprite.dispose();
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "480px",
        position: "relative",
        cursor: "grab",
      }}
    />
  );
}

/* radial glow sprite for nodes / core */
function makeGlowTexture() {
  const size = 64;
  const cnv = document.createElement("canvas");
  cnv.width = cnv.height = size;
  const ctx = cnv.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  g.addColorStop(0, "rgba(255,250,235,1)");
  g.addColorStop(0.25, "rgba(255,240,210,0.85)");
  g.addColorStop(0.55, "rgba(240,225,195,0.35)");
  g.addColorStop(1, "rgba(240,225,195,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(cnv);
  tex.needsUpdate = true;
  return tex;
}