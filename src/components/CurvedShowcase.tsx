import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROJECTS } from '../data/portfolioData';
import type { ProjectItem } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

interface CurvedShowcaseProps {
  onSelectProject: (project: ProjectItem) => void;
}

const FEATURED_IDS = [
  'on-his-footsteps',
  'maqam-growth-strategy',
  'labeeb-almarai',
  'damascus-book-fair',
  'educational-carousels',
  'sherlock-musical',
  'syrian-summer-citadel',
  'visual-photography-design',
  'cartoon-promo-campaigns',
  'seasonal-cultural-campaigns',
];

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const TONE_BG: Record<NonNullable<ProjectItem['accentTone']>, string> = {
  crimson:
    'radial-gradient(circle at 30% 20%, #7D1B1A 0%, #480B0D 56%, #220405 100%)',
  terracotta:
    'radial-gradient(circle at 30% 22%, #963C21 0%, #52180D 56%, #240705 100%)',
  gold:
    'radial-gradient(circle at 30% 20%, #826230 0%, #452913 56%, #200D06 100%)',
  oxblood:
    'radial-gradient(circle at 30% 22%, #631220 0%, #360710 56%, #1B0307 100%)',
};

const VERTEX_SHADER = `
  uniform float uViewportHalfWidth;
  uniform float uBendStrength;
  uniform float uDepthStrength;
  uniform float uVelocity;
  uniform float uIntro;

  varying vec2 vUv;
  varying float vCurve;

  void main() {
    vUv = uv;
    vec3 pos = position;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    float nx = worldPos.x / max(uViewportHalfWidth, 0.001);

    // Wide flat central viewing corridor (62% of viewport stays razor-flat)
    float deadzone = 0.62;
    float edge = max(0.0, abs(nx) - deadzone);

    // Smooth asymptotic side-edge S-curve
    float t = clamp(edge / 0.45, 0.0, 1.35);
    float sCurve = ((t * t) / (1.0 + 0.65 * t)) * sign(nx);

    float activeCurve = sCurve * uIntro;
    vCurve = activeCurve;

    pos.y += activeCurve * uBendStrength;
    pos.y += sin(uv.x * 3.14159265) * clamp(uVelocity, -1.1, 1.1) * 0.085;
    pos.z -= abs(activeCurve) * uDepthStrength;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uVelocity;
  uniform float uOpacity;

  varying vec2 vUv;
  varying float vCurve;

  void main() {
    float shift = (abs(vCurve) * 0.009) + (abs(uVelocity) * 0.0055);
    vec2 rUv = clamp(vUv + vec2(shift, 0.0), 0.002, 0.998);
    vec2 gUv = clamp(vUv, 0.002, 0.998);
    vec2 bUv = clamp(vUv - vec2(shift, 0.0), 0.002, 0.998);

    float r = texture2D(uTexture, rUv).r;
    float g = texture2D(uTexture, gUv).g;
    float b = texture2D(uTexture, bUv).b;
    float a = texture2D(uTexture, gUv).a;

    float focus = 1.0 - clamp(abs(vCurve) * 0.14, 0.0, 0.24);
    gl_FragColor = vec4(vec3(r, g, b) * focus, a * uOpacity);
  }
`;

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawManuscriptCard(
  canvas: HTMLCanvasElement,
  project: ProjectItem,
  roman: string,
  loadedImage?: HTMLImageElement | null
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (loadedImage) {
    const imgRatio = loadedImage.naturalWidth / loadedImage.naturalHeight;
    const canvasRatio = w / h;
    let drawW = w;
    let drawH = h;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawW = h * imgRatio;
      offsetX = -(drawW - w) / 2;
    } else {
      drawH = w / imgRatio;
      offsetY = -(drawH - h) / 2;
    }

    ctx.drawImage(loadedImage, offsetX, offsetY, drawW, drawH);

    const vig = ctx.createLinearGradient(0, h * 0.58, 0, h);
    vig.addColorStop(0, 'rgba(22, 4, 5, 0)');
    vig.addColorStop(1, 'rgba(22, 4, 5, 0.68)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(200, 168, 107, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, w - 40, h - 40);
    return;
  }

  const palettes: Record<
    NonNullable<ProjectItem['accentTone']>,
    [string, string, string]
  > = {
    crimson: ['#7F1C1A', '#4A0C0E', '#240506'],
    terracotta: ['#9A3E22', '#57190E', '#260806'],
    gold: ['#846431', '#482B14', '#220E06'],
    oxblood: ['#661321', '#380811', '#1D0408'],
  };

  const [c0, c1, c2] = palettes[project.accentTone ?? 'crimson'];
  const grad = ctx.createRadialGradient(w * 0.28, h * 0.22, 50, w * 0.5, h * 0.5, w * 0.85);
  grad.addColorStop(0, c0);
  grad.addColorStop(0.55, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(200, 168, 107, 0.52)';
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, w - 52, h - 52);

  ctx.strokeStyle = 'rgba(200, 168, 107, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 40, w - 80, h - 80);

  ctx.save();
  ctx.font = 'italic 300 320px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(239, 229, 209, 0.07)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(roman, w - 55, h * 0.54);
  ctx.restore();

  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#D5B577';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`ARCHIVE  ${roman}`, 76, 72);

  ctx.textAlign = 'right';
  ctx.fillText(project.videoUrl ? '▶  FILM REEL' : 'EDITORIAL PLATE', w - 76, 72);

  ctx.fillStyle = 'rgba(200, 168, 107, 0.72)';
  ctx.fillRect(76, h * 0.34, 72, 2);

  ctx.font = '500 21px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(239, 229, 209, 0.76)';
  ctx.textAlign = 'left';
  ctx.fillText(project.client.toUpperCase(), 76, h * 0.38);

  ctx.font = '400 72px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#F5ECE0';
  const titleLines = wrapCanvasText(ctx, project.title, w - 190).slice(0, 3);
  titleLines.forEach((line, idx) => {
    ctx.fillText(line, 76, h * 0.45 + idx * 80);
  });

  ctx.strokeStyle = 'rgba(200, 168, 107, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(76, h - 118);
  ctx.lineTo(w - 76, h - 118);
  ctx.stroke();

  ctx.font = '400 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(239, 229, 209, 0.78)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(project.subTag.toUpperCase(), 76, h - 68);

  if (project.metrics) {
    ctx.font = 'italic 400 32px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = '#D5B577';
    ctx.textAlign = 'right';
    ctx.fillText(project.metrics, w - 76, h - 64);
  }
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Mobile-only editorial plate. Native snap scrolling replaces the WebGL ribbon
 * on phones so low-end devices never allocate a GPU context or pin the page.
 */
const MobileShowcasePlate: React.FC<{
  project: ProjectItem;
  roman: string;
  onSelect: () => void;
}> = ({ project, roman, onSelect }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(project.coverImage) && !imgFailed;

  return (
    <button
      type="button"
      onClick={onSelect}
      data-cursor="view"
      aria-label={`Inspect ${project.title}`}
      className="group shrink-0 snap-center w-[78vw] max-w-[340px] text-left"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-crimson-canvas border border-[#C8A86B]/40">
        {showImage ? (
          <>
            <img
              src={project.coverImage}
              alt={project.title}
              draggable={false}
              onError={() => setImgFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#160304] via-[#160304]/30 to-[#160304]/45" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: TONE_BG[project.accentTone ?? 'crimson'] }}
          >
            <div className="absolute inset-3 border border-[#C8A86B]/25" />
            <div className="absolute inset-5 border border-[#C8A86B]/10" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-serif-editorial italic text-[120px] leading-none text-[#EFE5D1]/[0.07]">
              {roman}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 text-[9px] tracking-[0.24em] uppercase text-[#C8A86B]">
          <span>PLATE {roman}</span>
          <span className="truncate text-[#EFE5D1]/60">{project.subTag}</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#C8A86B]">
            {project.client}
          </p>
          <h3 className="mt-1.5 font-serif-editorial text-2xl leading-tight text-[#EFE5D1]">
            {project.title}
          </h3>
          <div className="mt-4 flex items-center justify-between border-t border-[#C8A86B]/25 pt-3 text-[9px] tracking-[0.2em] uppercase text-[#C8A86B]">
            <span>TAP TO INSPECT</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export const CurvedShowcase: React.FC<CurvedShowcaseProps> = ({
  onSelectProject,
}) => {
  const featuredProjects = FEATURED_IDS.map((id) =>
    PROJECTS.find((p) => p.id === id)
  ).filter((p): p is ProjectItem => Boolean(p));

  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  // Phones get a native touch gallery; tablets & laptops keep the WebGL ribbon.
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const onSelectRef = useRef(onSelectProject);
  onSelectRef.current = onSelectProject;

  useEffect(() => {
    if (isMobile) return;
    const section = sectionRef.current;
    const host = canvasHostRef.current;
    if (!section || !host) return;

    let disposed = false;
    let rafId = 0;
    let running = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const canvases: HTMLCanvasElement[] = [];
    const textures: THREE.CanvasTexture[] = [];
    const loadedImages: (HTMLImageElement | null)[] = featuredProjects.map(() => null);
    const meshes: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = [];

    const baseGeom = new THREE.PlaneGeometry(1, 1, 52, 28);

    featuredProjects.forEach((project, idx) => {
      const c = document.createElement('canvas');
      c.width = 1280;
      c.height = 820;
      drawManuscriptCard(c, project, ROMAN_NUMERALS[idx] ?? String(idx + 1), null);
      canvases.push(c);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      textures.push(tex);

      if (project.coverImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (disposed) return;
          loadedImages[idx] = img;
          drawManuscriptCard(c, project, ROMAN_NUMERALS[idx] ?? String(idx + 1), img);
          tex.needsUpdate = true;
        };
        img.src = project.coverImage;
      }

      const mat = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        uniforms: {
          uTexture: { value: tex },
          uViewportHalfWidth: { value: 6 },
          uBendStrength: { value: 1.4 },
          uDepthStrength: { value: 0.65 },
          uVelocity: { value: 0 },
          uIntro: { value: 0.5 },
          uOpacity: { value: 1 },
        },
      });

      const mesh = new THREE.Mesh(baseGeom, mat);
      mesh.userData = { index: idx };
      scene.add(mesh);
      meshes.push(mesh);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (disposed) return;
        featuredProjects.forEach((project, idx) => {
          drawManuscriptCard(
            canvases[idx],
            project,
            ROMAN_NUMERALS[idx] ?? String(idx + 1),
            loadedImages[idx]
          );
          textures[idx].needsUpdate = true;
        });
      });
    }

    let viewWidth = 10;
    let viewHeight = 6;
    let cardWidth = 4.5;
    let cardHeight = 2.88;
    let step = 4.78;

    const handleResize = () => {
      const w = host.clientWidth || window.innerWidth;
      const h = host.clientHeight || window.innerHeight * 0.65;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const vFov = (camera.fov * Math.PI) / 180;
      viewHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
      viewWidth = viewHeight * camera.aspect;

      const isMobile = w < 768;
      cardWidth = isMobile
        ? Math.min(viewWidth * 0.78, 4.3)
        : Math.min(viewWidth * 0.44, viewHeight * 0.84 * 1.56);
      cardHeight = cardWidth / 1.56;
      step = cardWidth * (isMobile ? 1.08 : 1.06);

      meshes.forEach((m) => {
        m.material.uniforms.uViewportHalfWidth.value = viewWidth * 0.5;
        m.material.uniforms.uBendStrength.value = isMobile
          ? viewHeight * 0.19
          : viewHeight * 0.27;
        m.material.uniforms.uDepthStrength.value = isMobile ? 0.35 : 0.65;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const pixelsPerCard = 340;
    const maxIndex = Math.max(1, featuredProjects.length - 1);
    const pinDistance = maxIndex * pixelsPerCard;

    // Pin ONLY for the core gallery transit; motion itself runs across a wider continuous envelope
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${pinDistance}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2(-10, -10);

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(meshes, false);
      setIsHoveringCard(hits.length > 0);
    };

    const onPointerLeave = () => setIsHoveringCard(false);

    const onClick = (e: MouseEvent) => {
      updatePointer(e.clientX, e.clientY);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(meshes, false);
      if (hits.length > 0) {
        const idx = hits[0].object.userData.index as number;
        const proj = featuredProjects[idx];
        if (proj) onSelectRef.current(proj);
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('click', onClick);

    const state = {
      smoothCardFloat: -0.75,
      velocity: 0,
      lastReportedIndex: 0,
      initialized: false,
    };

    const animate = () => {
      if (disposed || !running) return;

      const vh = window.innerHeight || 800;
      const leadInPx = vh * 0.48; // Starts gliding BEFORE section fills the full screen
      const leadOutPx = vh * 0.68; // Continues gliding smoothly AFTER unpin while scrolling down

      const relScroll = window.scrollY - st.start;

      // Compute continuous target card position across Lead-In -> Pinned -> Lead-Out
      let targetCardFloat = 0;
      if (relScroll < 0) {
        // Pre-pin smooth approach: card 1 glides in from slightly right as section rises
        const preT = Math.max(0, Math.min(1, (relScroll + leadInPx) / leadInPx));
        const easedPre = preT * preT * (3 - 2 * preT);
        targetCardFloat = -0.78 * (1 - easedPre);
      } else if (relScroll <= pinDistance) {
        // Pinned core: silky 1:1 progression across all cards
        targetCardFloat = relScroll / pixelsPerCard;
      } else {
        // Post-pin smooth exit: ribbon keeps gliding & curving gently left as next section rises
        const postT = Math.max(0, Math.min(1, (relScroll - pinDistance) / leadOutPx));
        const easedPost = 1 - Math.pow(1 - postT, 2.2);
        targetCardFloat = maxIndex + easedPost * 0.95;
      }

      if (!state.initialized) {
        state.smoothCardFloat = targetCardFloat;
        state.initialized = true;
      }

      const prevFloat = state.smoothCardFloat;
      state.smoothCardFloat += (targetCardFloat - state.smoothCardFloat) * 0.095;
      const rawVel = (state.smoothCardFloat - prevFloat) * 16;
      state.velocity += (rawVel - state.velocity) * 0.14;

      // Intro ribbon bend ramps up smoothly during lead-in so it's fully alive on arrival
      const introT = smoothstep(-0.75, 0.05, state.smoothCardFloat);
      // Soft exit opacity fade only at the very end of the post-pin scroll
      const exitFade = 1 - smoothstep(maxIndex + 0.35, maxIndex + 0.95, state.smoothCardFloat) * 0.35;

      const trackX = -state.smoothCardFloat * step;

      let closestIdx = 0;
      let closestDist = Infinity;

      meshes.forEach((mesh, idx) => {
        const x = idx * step + trackX;
        const distFromCenter = Math.abs(x);
        if (distFromCenter < closestDist) {
          closestDist = distFromCenter;
          closestIdx = idx;
        }

        const scaleLift = 0.94 + introT * 0.06;
        mesh.position.set(x, 0, 0);
        mesh.scale.set(cardWidth * scaleLift, cardHeight * scaleLift, 1);

        mesh.material.uniforms.uIntro.value = 0.45 + introT * 0.55;
        mesh.material.uniforms.uVelocity.value = state.velocity;
        mesh.material.uniforms.uOpacity.value = exitFade;
      });

      if (closestIdx !== state.lastReportedIndex) {
        state.lastReportedIndex = closestIdx;
        setActiveIndex(closestIdx);
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    // GPU discipline: only run the ribbon when the stage is near the viewport.
    const startLoop = () => {
      if (disposed || running) return;
      running = true;
      rafId = requestAnimationFrame(animate);
    };

    const stopLoop = () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const visibility = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) startLoop();
        else stopLoop();
      },
      { rootMargin: '350px 0px' }
    );
    visibility.observe(section);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 140);

    return () => {
      disposed = true;
      window.clearTimeout(refreshTimer);
      visibility.disconnect();
      stopLoop();
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('click', onClick);
      st.kill();
      baseGeom.dispose();
      meshes.forEach((m) => m.material.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [featuredProjects.length, isMobile]);

  const activeProject = featuredProjects[activeIndex] ?? featuredProjects[0];

  /* ---------------------------------- MOBILE ---------------------------------- */
  /* No WebGL context, no pin, no RAF: a native velvet snap-gallery instead.      */
  if (isMobile) {
    return (
      <section
        id="showcase"
        ref={sectionRef}
        className="bg-crimson-canvas relative w-full pt-24 pb-14 border-t border-[#C8A86B]/20 overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.12] mix-blend-normal"
          style={{
            backgroundImage: "url('/media/bg-tapestry.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 42%, transparent 22%, rgba(22, 3, 4, 0.88) 100%)',
          }}
        />

        <div className="relative z-10 px-6">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.24em] uppercase text-[#C8A86B] mb-2">
            <span>02 / FEATURED SHOWCASE</span>
            <span className="w-6 h-[1px] bg-[#C8A86B]/50" />
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl leading-none font-light text-[#EFE5D1]">
            Curated <span className="italic text-[#C8A86B]">Visual</span> Archive
          </h2>

          <div className="mt-6 flex items-center justify-between text-[9px] tracking-[0.24em] uppercase text-[#EFE5D1]/60">
            <span className="text-[#C8A86B]">SWIPE →</span>
            <span>{String(featuredProjects.length).padStart(2, '0')} PLATES</span>
          </div>
        </div>

        <div className="scrollbar-hide relative z-10 mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4">
          {featuredProjects.map((project, idx) => (
            <MobileShowcasePlate
              key={project.id}
              project={project}
              roman={ROMAN_NUMERALS[idx] ?? String(idx + 1)}
              onSelect={() => onSelectProject(project)}
            />
          ))}
        </div>

        <div className="relative z-10 mt-4 px-6 text-[9px] tracking-[0.22em] uppercase text-[#EFE5D1]/45">
          TAP ANY PLATE TO OPEN THE DOSSIER
        </div>
      </section>
    );
  }

  /* ---------------------------------- DESKTOP --------------------------------- */
  return (
    <section
      id="showcase"
      ref={sectionRef}
      className="bg-crimson-canvas relative w-full h-screen flex flex-col justify-between pt-24 pb-8 overflow-hidden border-t border-[#C8A86B]/20"
    >
      {/* Classical Crimson Tapestry Weave Layer — pre-graded, normal blend on mobile */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.12] mix-blend-normal md:mix-blend-soft-light"
        style={{
          backgroundImage: "url('/media/bg-tapestry.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 50%, transparent 25%, rgba(22, 3, 4, 0.85) 100%)',
        }}
      />

      {/* Top Editorial Header */}
      <div className="max-w-[1440px] w-full mx-auto px-6 md:px-14 flex items-end justify-between relative z-20 pointer-events-none">
        <div>
          <div className="flex items-center gap-3 text-[10px] md:text-[11px] tracking-[0.24em] uppercase text-[#C8A86B] mb-2">
            <span>02 / FEATURED SHOWCASE</span>
            <span className="w-8 h-[1px] bg-[#C8A86B]/50" />
            <span className="text-[#EFE5D1]/65">SCROLL TO NAVIGATE</span>
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl md:text-5xl leading-none font-light text-[#EFE5D1]">
            Curated <span className="italic text-[#C8A86B]">Visual</span> Archive
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-[#EFE5D1]/65">
          <span>CLICK ANY PLATE TO INSPECT</span>
        </div>
      </div>

      {/* Full-Width WebGL Curved Ribbon Stage */}
      <div
        ref={canvasHostRef}
        data-cursor={isHoveringCard ? 'view' : undefined}
        className="relative flex-1 w-full min-h-[340px] z-10"
      />

      {/* Bottom Centered Active Project Caption */}
      {activeProject && (
        <div className="max-w-[1440px] w-full mx-auto px-6 md:px-14 relative z-20">
          <div className="border-t border-[#C8A86B]/20 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[10px] tracking-[0.24em] uppercase text-[#C8A86B] mb-1">
                {activeProject.client} — {activeProject.subTag}
              </p>
              <h3 className="font-serif-editorial text-2xl md:text-3xl text-[#EFE5D1] font-light leading-tight">
                {activeProject.title}
              </h3>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-[11px] tracking-[0.24em] uppercase text-[#EFE5D1]/70 font-mono">
                <span className="text-[#C8A86B]">
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>{' '}
                / {String(featuredProjects.length).padStart(2, '0')}
              </div>

              <button
                type="button"
                onClick={() => onSelectProject(activeProject)}
                className="px-5 py-2.5 border border-[#C8A86B]/50 text-[10px] tracking-[0.22em] uppercase text-[#EFE5D1] hover:bg-[#EFE5D1] hover:text-[#1E0707] transition-colors duration-300"
              >
                INSPECT PROJECT
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};