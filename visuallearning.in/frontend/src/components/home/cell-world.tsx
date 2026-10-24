"use client";

import { useEffect, useId, useRef, useState } from "react";
import type * as Three from "three";
import "@/app/cell-world.css";

type Organelle = "nucleus" | "mitochondria" | "membrane";

const ORGANELLES: Record<Organelle, { name: string; subtitle: string; fact: string; color: string }> = {
  nucleus: {
    name: "Nucleus",
    subtitle: "The instruction centre",
    fact: "Most of a cell’s DNA lives here. These instructions help the cell grow, work and reproduce.",
    color: "#a78bfa",
  },
  mitochondria: {
    name: "Mitochondria",
    subtitle: "Small structures. Big energy.",
    fact: "Mitochondria turn energy from nutrients into ATP — the molecule that powers many of a cell’s activities.",
    color: "#fbbf24",
  },
  membrane: {
    name: "Cell membrane",
    subtitle: "A very clever boundary",
    fact: "This flexible, selectively permeable boundary controls what enters and leaves the cell.",
    color: "#00d4ff",
  },
};

/** An immediate, locally rendered illustration also serves as the WebGL fallback. */
function CellFallback({ id }: { id: string }) {
  return (
    <svg className="cell-world__illustration" viewBox="0 0 760 640" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-body`} cx="40%" cy="35%" r="65%">
          <stop offset="0" stopColor="#588cb9" stopOpacity=".6" />
          <stop offset=".5" stopColor="#235b80" stopOpacity=".45" />
          <stop offset="1" stopColor="#83e5fa" stopOpacity=".65" />
        </radialGradient>
        <radialGradient id={`${id}-nucleus`} cx="33%" cy="24%" r="80%">
          <stop offset="0" stopColor="#ddd0ff" /><stop offset=".55" stopColor="#a78bfa" /><stop offset="1" stopColor="#5b2d96" />
        </radialGradient>
        <linearGradient id={`${id}-mito`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fde6ac" /><stop offset="1" stopColor="#d98a27" />
        </linearGradient>
        <filter id={`${id}-shadow`}><feGaussianBlur stdDeviation="18" /></filter>
      </defs>
      <ellipse cx="414" cy="530" rx="204" ry="26" fill="#020617" opacity=".6" filter={`url(#${id}-shadow)`} />
      <g transform="rotate(-14 405 309)">
        <ellipse cx="405" cy="309" rx="246" ry="211" fill={`url(#${id}-body)`} stroke="#90e8fa" strokeOpacity=".7" strokeWidth="4" />
        <ellipse cx="405" cy="306" rx="235" ry="201" fill="#234d71" fillOpacity=".2" stroke="#38c5eb" strokeOpacity=".28" strokeWidth="9" />
        <path d="M201 279c30-133 145-180 258-150 119 31 179 118 165 226" fill="none" stroke="#d2f7ff" strokeWidth="2" opacity=".65" />
        <g fill="none" strokeLinecap="round" opacity=".85">
          <path d="M293 382c-58-32-19-63-58-89s32-52 8-82m53 188c-46-54 15-56-33-95s37-68 7-94" stroke="#96afd7" strokeWidth="11" />
          <path d="M430 391c49 23 34 38 92 29m-81-47c51 24 35 35 91 29m-79-47c41 21 43 29 83 27m-71-44c30 17 39 26 70 23" stroke="#b993da" strokeWidth="12" />
        </g>
        <ellipse cx="361" cy="280" rx="89" ry="81" fill={`url(#${id}-nucleus)`} stroke="#ddd0ff" strokeOpacity=".7" strokeWidth="2" />
        <ellipse cx="366" cy="279" rx="38" ry="35" fill="#5b2d96" stroke="#b29ae9" strokeWidth="3" />
        <path d="M331 224c-25 8-36 26-39 46" fill="none" stroke="#ede5ff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
        {[[517, 226, -25], [318, 424, 15], [535, 339, -38]].map(([x, y, angle], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`}>
            <path d="M-39-13C-12-35 39-22 43 0S18 29-15 23-57 4-39-13Z" fill={`url(#${id}-mito)`} stroke="#fbd38a" strokeWidth="2" />
            <path d="M-27 2-17-11-8 13 3-10 13 11 23-7 31 3" fill="none" stroke="#99551f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        {Array.from({ length: 30 }, (_, i) => {
          const angle = i * 2.399;
          return <circle key={i} cx={405 + Math.cos(angle) * (105 + (i % 5) * 21)} cy={310 + Math.sin(angle) * (100 + (i % 4) * 20)} r={2 + (i % 3)} fill={i % 3 === 0 ? "#d8b4fe" : "#8fddf4"} opacity=".65" />;
        })}
      </g>
    </svg>
  );
}

export function CellWorld({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hotspotRefs = useRef<Partial<Record<Organelle, HTMLButtonElement | null>>>({});
  const leaderRefs = useRef<Partial<Record<Organelle, SVGPathElement | null>>>({});
  const dotRefs = useRef<Partial<Record<Organelle, SVGCircleElement | null>>>({});
  const overlayRef = useRef<SVGSVGElement>(null);
  const selectedRef = useRef<Organelle>("nucleus");
  const playingRef = useRef(true);
  const repaintRef = useRef<(() => void) | null>(null);
  const [selected, setSelected] = useState<Organelle>("nucleus");
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const id = `cell${useId().replace(/:/g, "")}`;

  function selectOrganelle(key: Organelle) {
    selectedRef.current = key;
    setSelected(key);
    repaintRef.current?.();
  }

  useEffect(() => {
    const host = hostRef.current;
    const mount = canvasRef.current;
    if (!host || !mount) return;

    let disposed = false;
    let stopped = false;
    let cleaned = false;
    let frame = 0;
    let width = Math.max(1, mount.clientWidth);
    let height = Math.max(1, mount.clientHeight);
    const cleanupTasks: Array<() => void> = [];
    const labelEdges: Partial<Record<Organelle, { x: number; y: number }>> = {};
    const keys = Object.keys(ORGANELLES) as Organelle[];

    // Labels stay outside the specimen; only their fine leaders follow its motion.
    function layoutLabels() {
      width = Math.max(1, mount!.clientWidth);
      height = Math.max(1, mount!.clientHeight);
      overlayRef.current?.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const compact = width < 520;
      const bounds = mount!.getBoundingClientRect();
      for (const key of keys) {
        const button = hotspotRefs.current[key];
        if (!button) continue;
        const half = button.offsetWidth / 2;
        const inset = compact ? 10 : 22;
        const leftInset = Math.max(inset, inset - bounds.left);
        const rightInset = Math.max(inset, bounds.right - window.innerWidth + inset);
        const x = key === "nucleus"
          ? Math.max(leftInset + half, width * (compact ? 0.18 : 0.15))
          : width - rightInset - half;
        const y = compact
          ? key === "nucleus" ? 50 : key === "membrane" ? 52 : height * 0.87
          : height * (key === "nucleus" ? 0.205 : key === "membrane" ? 0.19 : 0.72);
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        labelEdges[key] = { x: x + (key === "nucleus" ? half : -half), y };
      }
    }

    function drawLeader(key: Organelle, x: number, y: number) {
      const edge = labelEdges[key];
      if (!edge) return;
      // A short horizontal finish makes the connection to each caption explicit.
      const elbowX = edge.x + (key === "nucleus" ? 18 : -18);
      leaderRefs.current[key]?.setAttribute("d", `M ${x.toFixed(1)} ${y.toFixed(1)} L ${elbowX.toFixed(1)} ${edge.y.toFixed(1)} L ${edge.x.toFixed(1)} ${edge.y.toFixed(1)}`);
      dotRefs.current[key]?.setAttribute("cx", x.toFixed(1));
      dotRefs.current[key]?.setAttribute("cy", y.toFixed(1));
    }

    function drawFallbackLeaders() {
      const scale = Math.min(width / 760, height / 640);
      const left = (width - 760 * scale) / 2;
      const top = (height - 640 * scale) / 2;
      const fallbackAnchors: Record<Organelle, [number, number]> = {
        nucleus: [355, 292], mitochondria: [538, 307], membrane: [612, 183],
      };
      for (const key of keys) drawLeader(key, left + fallbackAnchors[key][0] * scale, top + fallbackAnchors[key][1] * scale);
    }

    function cleanupScene() {
      if (cleaned) return;
      cleaned = true;
      stopped = true;
      repaintRef.current = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      for (const task of cleanupTasks.reverse()) {
        try { task(); } catch { /* Continue releasing the remaining resources. */ }
      }
    }

    layoutLabels();
    drawFallbackLeaders();
    const overlayResize = new ResizeObserver(() => {
      layoutLabels();
      if (stopped || !repaintRef.current) drawFallbackLeaders();
    });
    overlayResize.observe(mount);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    playingRef.current = !motion.matches;
    setPlaying(!motion.matches);

    async function initialize() {
      const T = await import("three");
      if (disposed || !mount || !host) return;

      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      // Register disposal immediately, so any later initialization failure is safe.
      cleanupTasks.push(() => { renderer.dispose(); renderer.domElement.remove(); });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      renderer.domElement.setAttribute("aria-hidden", "true");
      mount.appendChild(renderer.domElement);

      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(39, 1, 0.1, 30);
      camera.position.set(0, 0.1, 8.4);
      camera.lookAt(0, 0, 0);
      scene.add(new T.AmbientLight(0xbdcbed, 2.1));
      const keyLight = new T.DirectionalLight(0xf0f7ff, 4.3);
      keyLight.position.set(-4, 5, 6);
      scene.add(keyLight);
      const rimLight = new T.DirectionalLight(0x63dfff, 3.3);
      rimLight.position.set(4, 2, -3);
      scene.add(rimLight);
      const fillLight = new T.PointLight(0xa78bfa, 12, 12);
      fillLight.position.set(-2, -1, 3);
      scene.add(fillLight);

      const cell = new T.Group();
      cell.rotation.set(-0.08, -0.13, -0.19);
      scene.add(cell);
      const targets: Three.Object3D[] = [];
      const materials: Three.Material[] = [];
      const geometries: Three.BufferGeometry[] = [];
      cleanupTasks.push(() => {
        for (const geometry of new Set(geometries)) geometry.dispose();
        for (const mat of materials) mat.dispose();
      });
      const selectable: Record<Organelle, Three.MeshPhysicalMaterial[]> = { nucleus: [], mitochondria: [], membrane: [] };
      const sphereGeometries = new Map<number, Three.SphereGeometry>();

      function material(color: string, options: Three.MeshPhysicalMaterialParameters = {}, key?: Organelle) {
        const mat = new T.MeshPhysicalMaterial({ color, roughness: 0.39, metalness: 0.06, clearcoat: 0.5, clearcoatRoughness: 0.35, ...options });
        materials.push(mat);
        if (key) selectable[key].push(mat);
        return mat;
      }
      function addMesh(geometry: Three.BufferGeometry, mat: Three.Material, parent: Three.Object3D = cell, key?: Organelle) {
        geometries.push(geometry);
        const mesh = new T.Mesh(geometry, mat);
        parent.add(mesh);
        if (key) { mesh.userData.organelle = key; targets.push(mesh); }
        return mesh;
      }
      function sphere(radius: number, mat: Three.Material, position: [number, number, number], scale: [number, number, number] = [1, 1, 1], parent: Three.Object3D = cell, key?: Organelle) {
        let geometry = sphereGeometries.get(radius);
        if (!geometry) {
          // Tiny ribosomes and vesicles need far fewer vertices than the nucleus.
          geometry = new T.SphereGeometry(radius, radius < 0.08 ? 12 : radius < 0.3 ? 20 : 32, radius < 0.08 ? 8 : radius < 0.3 ? 14 : 24);
          sphereGeometries.set(radius, geometry);
        }
        const mesh = addMesh(geometry, mat, parent, key);
        mesh.position.set(...position);
        mesh.scale.set(...scale);
        return mesh;
      }
      function tube(points: Three.Vector3[], radius: number, mat: Three.Material, parent: Three.Object3D = cell, closed = false, key?: Organelle) {
        const curve = new T.CatmullRomCurve3(points, closed);
        return addMesh(new T.TubeGeometry(curve, Math.max(24, points.length * 4), radius, 7, closed), mat, parent, key);
      }

      // Open hemisphere: the back membrane forms a luminous bowl and leaves the
      // organelles exposed to view, rather than hiding them inside an opaque ball.
      const membraneMat = material("#61dbf5", { transparent: true, opacity: 0.3, side: T.DoubleSide, depthWrite: false, roughness: 0.24, emissive: "#175477", emissiveIntensity: 0.16 }, "membrane");
      const shell = addMesh(new T.SphereGeometry(2.13, 64, 48, Math.PI, Math.PI), membraneMat, cell, "membrane");
      shell.scale.set(1.1, 0.9, 0.75);
      const inside = addMesh(new T.SphereGeometry(2.045, 48, 32, Math.PI, Math.PI), material("#234d71", { transparent: true, opacity: 0.22, side: T.DoubleSide, depthWrite: false }));
      inside.scale.set(1.1, 0.9, 0.75);
      const rimMat = material("#9beeff", { emissive: "#197fa5", emissiveIntensity: 0.25, roughness: 0.3 }, "membrane");
      for (const radius of [2.12, 2.055]) {
        const points = Array.from({ length: 81 }, (_, i) => {
          const a = (i / 80) * Math.PI * 2;
          return new T.Vector3(Math.cos(a) * radius * 1.1, Math.sin(a) * radius * 0.9, 0);
        });
        tube(points, radius === 2.12 ? 0.026 : 0.012, rimMat, cell, true, "membrane");
      }

      const nucleusMat = material("#9170d2", { roughness: 0.25, clearcoat: 0.85, emissive: "#49257b", emissiveIntensity: 0.08 }, "nucleus");
      const nucleus = sphere(0.7, nucleusMat, [-0.42, 0.25, 0.18], [1.06, 1, 0.91], cell, "nucleus");
      const nucleolusMat = material("#5b2d96", { roughness: 0.5 }, "nucleus");
      sphere(0.285, nucleolusMat, [-0.37, 0.24, 0.78], [1.05, 1, 0.62], cell, "nucleus");
      const poreMat = material("#d9c7ff", { roughness: 0.65 });
      for (let i = 0; i < 20; i++) {
        const a = i * 2.399;
        const r = 0.32 + (i % 4) * 0.075;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        sphere(0.018, poreMat, [-0.42 + x, 0.25 + y, 0.18 + Math.sqrt(Math.max(0.02, 0.7 * 0.7 - x * x - y * y)) * 0.93]);
      }

      // Smooth folded sheets around the nucleus suggest the endoplasmic reticulum.
      const erMat = material("#819ac4", { roughness: 0.5, metalness: 0.04 });
      const erRibosomeMat = material("#c4b5fd", { roughness: 0.7 });
      for (let fold = 0; fold < 6; fold++) {
        const points = Array.from({ length: 32 }, (_, j) => {
          const a = 0.8 + (j / 31) * 3.4;
          const r = 0.89 + fold * 0.08 + Math.sin(a * 6 + fold * 0.4) * 0.075;
          return new T.Vector3(-0.42 + Math.cos(a) * r, 0.25 + Math.sin(a) * r * 0.94, -0.12 - fold * 0.032 + Math.sin(a * 5) * 0.085);
        });
        tube(points, 0.035, erMat);
        for (let j = 3; j < points.length; j += 6) {
          const p = points[j];
          sphere(0.026, erRibosomeMat, [p.x, p.y, p.z + 0.042]);
        }
      }

      const mitoMat = material("#f3ae4c", { roughness: 0.45, emissive: "#854916", emissiveIntensity: 0.03 }, "mitochondria");
      const cristaMat = material("#99551f", { roughness: 0.7 }, "mitochondria");
      function mitochondrion(x: number, y: number, z: number, angle: number, size: number) {
        const group = new T.Group();
        group.position.set(x, y, z);
        group.rotation.set(0.05, -0.1, angle);
        group.scale.setScalar(size);
        cell.add(group);
        sphere(0.26, mitoMat, [0, 0, 0], [1.95, 0.9, 0.85], group, "mitochondria");
        const folds = Array.from({ length: 24 }, (_, i) => {
          const x = -0.36 + (i / 23) * 0.72;
          return new T.Vector3(x, Math.sin((i / 23) * Math.PI * 8) * 0.12, 0.185 + Math.sin((i / 23) * Math.PI) * 0.035);
        });
        tube(folds, 0.023, cristaMat, group, false, "mitochondria");
        return group;
      }
      mitochondrion(1.12, 0.81, 0.08, 0.35, 0.92);
      mitochondrion(0.94, -0.81, 0.28, -0.48, 1.02);
      mitochondrion(-0.83, -1.15, 0.1, -0.22, 0.72);
      mitochondrion(-1.62, 0.39, -0.16, 1.1, 0.56);

      const golgiMat = material("#b993da", { roughness: 0.46 });
      for (let layer = 0; layer < 5; layer++) {
        const points = Array.from({ length: 22 }, (_, j) => {
          const x = (j / 21) * 0.96 - 0.48;
          return new T.Vector3(0.58 + x, -0.17 - layer * 0.115 + Math.pow(x * 1.7, 2) * 0.19, -0.11 + Math.sin(j * 0.4) * 0.035);
        });
        const fold = tube(points, 0.058 - layer * 0.003, golgiMat);
        fold.rotation.z = -0.08;
      }

      const vesicleMat = material("#c5a3f3", { roughness: 0.3, transparent: true, opacity: 0.78 });
      const greenVesicleMat = material("#82c9ed", { roughness: 0.35, transparent: true, opacity: 0.7 });
      for (let i = 0; i < 52; i++) {
        const a = i * 2.399963;
        const r = 1.33 + (i % 6) * 0.105;
        sphere(0.025 + (i % 4) * 0.012, i % 3 === 0 ? vesicleMat : greenVesicleMat,
          [Math.cos(a) * r * 1.07, Math.sin(a) * r * 0.84, -0.2 + Math.sin(i * 1.3) * 0.25]);
      }
      sphere(0.13, vesicleMat, [0.45, 1.3, -0.05]);
      sphere(0.105, greenVesicleMat, [-1.2, -0.7, 0.15]);
      sphere(0.09, greenVesicleMat, [1.69, -0.08, -0.06]);

      const dustGeometry = new T.BufferGeometry();
      const dustPositions = new Float32Array(65 * 3);
      for (let i = 0; i < 65; i++) {
        const a = i * 2.399963;
        const r = 2.65 + ((i * 17) % 23) * 0.085;
        dustPositions[i * 3] = Math.cos(a) * r;
        dustPositions[i * 3 + 1] = Math.sin(a) * r * 0.85;
        dustPositions[i * 3 + 2] = -1.5 + (i % 9) * 0.3;
      }
      dustGeometry.setAttribute("position", new T.BufferAttribute(dustPositions, 3));
      const dustMaterial = new T.PointsMaterial({ color: "#9bbbea", size: 0.018, transparent: true, opacity: 0.5, depthWrite: false });
      geometries.push(dustGeometry);
      materials.push(dustMaterial);
      const dust = new T.Points(dustGeometry, dustMaterial);
      scene.add(dust);

      const anchors: Record<Organelle, Three.Vector3> = {
        nucleus: new T.Vector3(-0.65, 0.65, 0.83),
        mitochondria: new T.Vector3(1.16, -0.73, 0.42),
        membrane: new T.Vector3(1.85, 1.15, 0.02),
      };
      const projected = new T.Vector3();
      let visible = true;
      let lastFrame = 0;
      let elapsed = 0;
      let pointerX = 0;
      let pointerY = 0;
      let pointerInside = false;
      const raycaster = new T.Raycaster();
      const pointer = new T.Vector2();

      function render() {
        if (disposed || stopped) return;
        for (const key of Object.keys(selectable) as Organelle[]) {
          for (const mat of selectable[key]) {
            mat.emissiveIntensity = key === selectedRef.current ? 0.28 : key === "membrane" ? 0.13 : 0.04;
          }
        }
        cell.updateMatrixWorld(true);
        camera.updateMatrixWorld();
        for (const key of Object.keys(anchors) as Organelle[]) {
          projected.copy(anchors[key]).applyMatrix4(cell.matrixWorld).project(camera);
          drawLeader(key, (projected.x * 0.5 + 0.5) * width, (-projected.y * 0.5 + 0.5) * height);
        }
        renderer.render(scene, camera);
      }

      function shouldAnimate() {
        return !disposed && !stopped && visible && !document.hidden && playingRef.current;
      }
      function animate(now: number) {
        frame = 0;
        if (!shouldAnimate()) return;
        if (now - lastFrame > 1000 / 40) {
          const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
          lastFrame = now;
          elapsed += delta;
          const targetY = -0.13 + Math.sin(elapsed * 0.2) * 0.15 + (pointerInside ? pointerX * 0.12 : 0);
          const targetX = -0.08 + Math.cos(elapsed * 0.18) * 0.055 + (pointerInside ? pointerY * 0.08 : 0);
          cell.rotation.y += (targetY - cell.rotation.y) * 0.04;
          cell.rotation.x += (targetX - cell.rotation.x) * 0.04;
          cell.position.y = Math.sin(elapsed * 0.5) * 0.035;
          dust.rotation.z = elapsed * 0.006;
          nucleus.rotation.z = Math.sin(elapsed * 0.3) * 0.025;
          render();
        }
        frame = requestAnimationFrame(animate);
      }
      function updateAnimation() {
        if (disposed || stopped) return;
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastFrame = 0;
        if (visible && !document.hidden) render();
        if (shouldAnimate()) frame = requestAnimationFrame(animate);
      }
      repaintRef.current = updateAnimation;

      const resize = new ResizeObserver(([entry]) => {
        if (disposed || stopped) return;
        width = Math.max(1, entry.contentRect.width);
        height = Math.max(1, entry.contentRect.height);
        layoutLabels();
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.z = camera.aspect < 0.95 ? 8.2 / camera.aspect : 8.2;
        camera.updateProjectionMatrix();
        render();
      });
      cleanupTasks.push(() => resize.disconnect());
      resize.observe(mount);
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        updateAnimation();
      }, { rootMargin: "60px" });
      cleanupTasks.push(() => intersection.disconnect());
      intersection.observe(host);

      function handlePointerMove(event: PointerEvent) {
        if (event.pointerType !== "mouse") return;
        const rect = mount!.getBoundingClientRect();
        pointerInside = true;
        pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      }
      function handlePointerLeave() { pointerInside = false; }
      function handleClick(event: MouseEvent) {
        if (stopped) return;
        const rect = mount!.getBoundingClientRect();
        pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(targets, false)[0];
        if (hit?.object.userData.organelle) selectOrganelle(hit.object.userData.organelle as Organelle);
      }
      function handleMotionChange() {
        playingRef.current = !motion.matches;
        setPlaying(!motion.matches);
        updateAnimation();
      }
      function handleContextLoss(event: Event) {
        event.preventDefault();
        cleanupScene();
        drawFallbackLeaders();
        playingRef.current = false;
        setPlaying(false);
        setReady(false);
        setUnavailable(true);
      }

      cleanupTasks.push(() => {
        mount.removeEventListener("pointermove", handlePointerMove);
        mount.removeEventListener("pointerleave", handlePointerLeave);
        mount.removeEventListener("click", handleClick);
        document.removeEventListener("visibilitychange", updateAnimation);
        motion.removeEventListener("change", handleMotionChange);
        renderer.domElement.removeEventListener("webglcontextlost", handleContextLoss);
      });
      mount.addEventListener("pointermove", handlePointerMove);
      mount.addEventListener("pointerleave", handlePointerLeave);
      mount.addEventListener("click", handleClick);
      renderer.domElement.addEventListener("webglcontextlost", handleContextLoss);
      document.addEventListener("visibilitychange", updateAnimation);
      motion.addEventListener("change", handleMotionChange);
      setReady(true);
      updateAnimation();

    }

    initialize().catch(() => {
      if (!disposed) { playingRef.current = false; setPlaying(false); setUnavailable(true); setReady(false); }
      cleanupScene();
      drawFallbackLeaders();
    });
    return () => {
      disposed = true;
      overlayResize.disconnect();
      cleanupScene();
    };
  }, []);

  const fact = ORGANELLES[selected];

  return (
    <div ref={hostRef} role="region" className={`cell-world ${ready ? "cell-world--ready" : ""} ${className}`} aria-label="Interactive animal cell explorer">
      <div className="cell-world__ambient" aria-hidden="true" />
      <div className="cell-world__orbit cell-world__orbit--one" aria-hidden="true" />
      <div className="cell-world__orbit cell-world__orbit--two" aria-hidden="true" />
      <div className="cell-world__fallback"><CellFallback id={id} /></div>
      <div ref={canvasRef} className="cell-world__canvas" />
      <svg ref={overlayRef} className="cell-world__leaders" aria-hidden="true">
        {(Object.keys(ORGANELLES) as Organelle[]).map((key) => <g key={key} className={selected === key ? "is-selected" : ""} style={{ "--organelle-color": ORGANELLES[key].color } as React.CSSProperties}>
          <path ref={(element) => { leaderRefs.current[key] = element; }} />
          <circle ref={(element) => { dotRefs.current[key] = element; }} r="3" />
        </g>)}
      </svg>

      <div className="cell-world__specimen" aria-hidden="true"><span /> BIOLOGY, UP CLOSE <span className="cell-world__specimen-number">01 / 03</span></div>

      {(Object.keys(ORGANELLES) as Organelle[]).map((key, index) => (
        <button
          key={key}
          ref={(element) => { hotspotRefs.current[key] = element; }}
          type="button"
          className={`cell-world__hotspot cell-world__hotspot--${key} ${selected === key ? "is-selected" : ""}`}
          style={{ "--organelle-color": ORGANELLES[key].color } as React.CSSProperties}
          aria-pressed={selected === key}
          aria-controls={`${id}-fact`}
          onClick={() => selectOrganelle(key)}
        >
          <span className="cell-world__hotspot-label"><span className="cell-world__hotspot-number">0{index + 1}</span>{ORGANELLES[key].name}<span className="cell-world__hotspot-plus" aria-hidden="true">+</span></span>
        </button>
      ))}

      <div id={`${id}-fact`} className="cell-world__fact" aria-live="polite" aria-atomic="true" style={{ "--organelle-color": fact.color } as React.CSSProperties}>
        <div className="cell-world__fact-eyebrow"><span /> A LITTLE WONDER</div>
        <h3>{fact.subtitle}</h3>
        <p>{fact.fact}</p>
      </div>

      <div className="cell-world__toolbar">
        <span className="cell-world__hint"><span aria-hidden="true">↗</span> Tap a label. Discover more.</span>
        <button
          type="button"
          className="cell-world__motion"
          disabled={!ready || unavailable}
          aria-label={unavailable ? "Cell illustration; rotation unavailable" : playing ? "Pause cell rotation" : "Resume cell rotation"}
          aria-pressed={!playing}
          onClick={() => {
            playingRef.current = !playingRef.current;
            setPlaying(playingRef.current);
            repaintRef.current?.();
          }}
        >
          {playing ? <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2v8M8 2v8" stroke="currentColor" strokeWidth="1.7" /></svg> : <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m4 2 6 4-6 4Z" fill="currentColor" /></svg>}
          <span>{unavailable ? "Illustration" : playing ? "Pause" : "Rotate"}</span>
        </button>
      </div>
    </div>
  );
}
