import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROJECTS } from '../data/portfolioData';
import type { ProjectItem } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

interface CurvedShowcaseProps {
  onSelectProject: (project: ProjectItem) => void;
}

// The 5 flagship Brand, Visual Direction & Show Promo campaigns (Folders 1, 2, 4, 7, 9)
const FEATURED_IDS = [
  'promo-maimoon-spacetoon',
  'visual-kingdom-eloquence',
  'brand-maqam-sixth-year',
  'promo-behind-every-art',
  'brand-maqam-project-vision',
];

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

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

    // Wide flat central viewing corridor (60% stays razor-flat for 3:4 artwork)
    float deadzone = 0.60;
    float edge = max(0.0, abs(nx) - deadzone);

    // Smooth asymptotic side-edge S-curve
    float t = clamp(edge / 0.48, 0.0, 1.35);
    float sCurve = ((t * t) / (1.0 + 0.68 * t)) * sign(nx);

    float activeCurve = sCurve * uIntro;
    vCurve = activeCurve;

    pos.y += activeCurve * uBendStrength;
    pos.y += sin(uv.x * 3.14159265) * clamp(uVelocity, -1.0, 1.0) * 0.075;
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
    float shift = (abs(vCurve) * 0.008) + (abs(uVelocity) * 0.005);
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

function drawPortraitPlate(
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

    // Subtle museum gold hairline framing on real 3:4 artwork
    ctx.strokeStyle = 'rgba(200, 168, 107, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    return;
  }

  // Fallback vintage 3:4 playbill plate while image loads
  const grad = ctx.createRadialGradient(w * 0.3, h * 0.25, 40, w * 0.5, h * 0.5, h * 0.72);
  grad.addColorStop(0, '#7F1C1A');
  grad.addColorStop(0.55, '#480B0D');
  grad.addColorStop(1, '#220405');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(200, 168, 107, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(22, 22, w - 44, h - 44);

  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#D5B577';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`PLATE ${roman}`, 56, 56);

  ctx.font = '400 54px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#F5ECE0';
  const lines = wrapCanvasText(ctx, project.title, w - 112).slice(0, 4);
  lines.forEach((line, i) => {
    ctx.fillText(line, 56, h * 0.42 + i * 62);
  });
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export const CurvedShowcase: React.FC<CurvedShowcaseProps> = ({
  onSelectProject,
}) => {
  const featuredProjects = useMemo(() => {
    const picked = FEATURED_IDS.map((id) =>
      PROJECTS.find((p) => p.id === id)
    ).filter((p): p is ProjectItem => Boolean(p));
    return picked.length > 0 ? picked : PROJECTS.slice(0, 10);
  }, []);

  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const onSelectRef = useRef(onSelectProject);
  onSelectRef.current = onSelectProject;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const section = sectionRef.current;
    const host = canvasHostRef.current;
    if (!section || !host) return;

    let disposed = false;
    let rafId = 0;
    let isVisible = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    // Capping DPR at 1.5 cuts GPU fragment fill-rate by ~44% with razor-sharp visuals
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const canvases: HTMLCanvasElement[] = [];
    const textures: THREE.CanvasTexture[] = [];
    const loadedImages: (HTMLImageElement | null)[] = featuredProjects.map(() => null);
    const meshes: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = [];

    // 3:4 Portrait segmented mesh for silky vertex curvature
    const baseGeom = new THREE.PlaneGeometry(1, 1, 36, 28);

    featuredProjects.forEach((project, idx) => {
      const c = document.createElement('canvas');
      c.width = 720;
      c.height = 960; // Exact 3:4 Portrait ratio
      drawPortraitPlate(c, project, ROMAN_NUMERALS[idx] ?? String(idx + 1), null);
      canvases.push(c);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      textures.push(tex);

      const coverSrc = project.coverImage || project.gallery?.[0];
      if (coverSrc) {
        const img = new Image();
        img.decoding = 'async';
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (disposed) return;
          loadedImages[idx] = img;
          drawPortraitPlate(c, project, ROMAN_NUMERALS[idx] ?? String(idx + 1), img);
          tex.needsUpdate = true;
          if (!isVisible) renderer.render(scene, camera);
        };
        img.src = coverSrc;
      }

      const mat = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        uniforms: {
          uTexture: { value: tex },
          uViewportHalfWidth: { value: 6 },
          uBendStrength: { value: 1.45 },
          uDepthStrength: { value: 0.6 },
          uVelocity: { value: 0 },
          uIntro: { value: 0.6 },
          uOpacity: { value: 1 },
        },
      });

      const mesh = new THREE.Mesh(baseGeom, mat);
      mesh.userData = { index: idx };
      scene.add(mesh);
      meshes.push(mesh);
    });

    let viewWidth = 10;
    let viewHeight = 6;
    let cardWidth = 3.2;
    let cardHeight = 4.26;
    let step = 3.52;
    let cachedVh = window.innerHeight || 800;

    const handleResize = () => {
      const w = host.clientWidth || window.innerWidth;
      const h = host.clientHeight || window.innerHeight * 0.64;
      cachedVh = window.innerHeight || 800;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const vFov = (camera.fov * Math.PI) / 180;
      viewHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
      viewWidth = viewHeight * camera.aspect;

      // Exact 3:4 Portrait card sizing filling ~78% of stage height cleanly
      cardHeight = Math.min(viewHeight * 0.78, viewWidth * 0.42);
      cardWidth = cardHeight * 0.75;
      step = cardWidth * 1.14;

      meshes.forEach((m) => {
        m.material.uniforms.uViewportHalfWidth.value = viewWidth * 0.5;
        m.material.uniforms.uBendStrength.value = viewHeight * 0.24;
        m.material.uniforms.uDepthStrength.value = 0.6;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Pre-compile GLSL shaders & upload initial GPU textures NOW during preloader -> ZERO transition hitch!
    renderer.compile(scene, camera);
    renderer.render(scene, camera);

    const pixelsPerCard = 290;
    const maxIndex = Math.max(1, featuredProjects.length - 1);
    const pinDistance = maxIndex * pixelsPerCard;

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
      smoothCardFloat: -0.65,
      velocity: 0,
      lastReportedIndex: 0,
      initialized: false,
    };

    const animate = () => {
      if (disposed || !isVisible) {
        rafId = 0;
        return;
      }

      const leadInPx = cachedVh * 0.45;
      const leadOutPx = cachedVh * 0.65;
      const relScroll = window.scrollY - st.start;

      let targetCardFloat = 0;
      if (relScroll < 0) {
        const preT = Math.max(0, Math.min(1, (relScroll + leadInPx) / leadInPx));
        const easedPre = preT * preT * (3 - 2 * preT);
        targetCardFloat = -0.68 * (1 - easedPre);
      } else if (relScroll <= pinDistance) {
        targetCardFloat = relScroll / pixelsPerCard;
      } else {
        const postT = Math.max(0, Math.min(1, (relScroll - pinDistance) / leadOutPx));
        const easedPost = 1 - Math.pow(1 - postT, 2.2);
        targetCardFloat = maxIndex + easedPost * 0.95;
      }

      if (!state.initialized) {
        state.smoothCardFloat = targetCardFloat;
        state.initialized = true;
      }

      const prevFloat = state.smoothCardFloat;
      state.smoothCardFloat += (targetCardFloat - state.smoothCardFloat) * 0.1;
      const rawVel = (state.smoothCardFloat - prevFloat) * 14;
      state.velocity += (rawVel - state.velocity) * 0.15;

      const introT = smoothstep(-0.68, 0.05, state.smoothCardFloat);
      const exitFade =
        1 - smoothstep(maxIndex + 0.35, maxIndex + 0.95, state.smoothCardFloat) * 0.32;

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

        // Cull far off-screen cards to save vertex shading
        mesh.visible = distFromCenter < viewWidth * 1.15;
        if (!mesh.visible) return;

        const scaleLift = 0.95 + introT * 0.05;
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !rafId && !disposed) {
          rafId = requestAnimationFrame(animate);
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(section);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 140);

    return () => {
      disposed = true;
      window.clearTimeout(refreshTimer);
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
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
  }, [featuredProjects, isMobile]);

  const activeProject = featuredProjects[activeIndex] ?? featuredProjects[0];

  // Dedicated silky 3:4 Portrait Swipe Gallery on Mobile (< 768px)
  if (isMobile) {
    return (
      <section
        id="showcase"
        className="bg-crimson-canvas relative w-full py-20 overflow-hidden border-t border-[#C8A86B]/20"
      >
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.24em] uppercase text-[#C8A86B] mb-2">
            <span>02 / FEATURED CAMPAIGNS</span>
            <span className="w-6 h-[1px] bg-[#C8A86B]/50" />
            <span className="text-[#EFE5D1]/65">SWIPE →</span>
          </div>
          <h2 className="font-serif-editorial text-4xl leading-none font-light text-[#EFE5D1]">
            Brand &amp; <span className="italic text-[#C8A86B]">Visual</span> Campaigns
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredProjects.map((project, idx) => {
            const cover = project.coverImage || project.gallery?.[0];
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project)}
                className="snap-center shrink-0 w-[76vw] max-w-[300px] text-left bg-[#220405] border border-[#C8A86B]/40 overflow-hidden"
              >
                <div className="aspect-[3/4] w-full relative overflow-hidden bg-[#2A0608]">
                  {cover ? (
                    <img
                      src={cover}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full p-5 flex flex-col justify-between">
                      <span className="text-[10px] tracking-[0.2em] text-[#C8A86B]">
                        PLATE {ROMAN_NUMERALS[idx] ?? idx + 1}
                      </span>
                      <span className="font-serif-editorial text-2xl text-[#EFE5D1]">
                        {project.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-[#C8A86B]/20">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#C8A86B] mb-1">
                    {project.subTag}
                  </p>
                  <p className="font-serif-editorial text-xl text-[#EFE5D1] leading-snug">
                    {project.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section
      id="showcase"
      ref={sectionRef}
      className="bg-crimson-canvas relative w-full h-screen flex flex-col justify-between pt-24 pb-8 overflow-hidden border-t border-[#C8A86B]/20"
    >
      {/* Pre-baked lightweight Tapestry Weave Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.11]"
        style={{
          backgroundImage: "url('/media/bg-tapestry.webp'), url('/media/bg-tapestry.jpg')",
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
            <span>02 / FEATURED CAMPAIGNS</span>
            <span className="w-8 h-[1px] bg-[#C8A86B]/50" />
            <span className="text-[#EFE5D1]/65">SCROLL TO NAVIGATE</span>
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl md:text-5xl leading-none font-light text-[#EFE5D1]">
            Brand &amp; <span className="italic text-[#C8A86B]">Visual</span> Campaigns
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-[#EFE5D1]/65">
          <span>CLICK ANY PLATE TO INSPECT</span>
        </div>
      </div>

      {/* Full-Width WebGL 3:4 Portrait Curved Ribbon Stage */}
      <div
        ref={canvasHostRef}
        data-cursor={isHoveringCard ? 'view' : undefined}
        className="relative flex-1 w-full min-h-[360px] z-10"
      />

      {/* Bottom Active Project Caption */}
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