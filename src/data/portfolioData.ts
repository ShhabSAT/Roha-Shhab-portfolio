export interface ProjectItem {
  id: string;
  title: string;
  client: string;
  category: 'screenwriting' | 'theatre-historical' | 'social-brand' | 'field-reels';
  subTag: string;
  year?: string;
  summary: string;
  fullStory: string;
  metrics?: string;
  /** Paths inside /public/media/ — easy to swap with real 56 files later */
  coverImage?: string;
  gallery?: string[];
  videoUrl?: string;
  instagramUrl?: string;
  /** Used for manuscript-style editorial covers when no photo exists */
  accentTone?: 'crimson' | 'terracotta' | 'gold' | 'oxblood';
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
}

export interface CertificationItem {
  id: string;
  year: string;
  title: string;
  institution: string;
  details: string;
  highlight?: string;
}

export const SITE_INFO = {
  nameEn: 'Roha Shhab',
  roles: [
    'SCREENWRITER & PLAYWRIGHT',
    'CREATIVE PRODUCER',
    'VISUAL STORYTELLER',
  ],
  tagline:
    'Crafting narrative worlds across broadcast animation, live theatre, spatial historical experiences, and high-impact digital campaigns.',
  email: '11roha11roha@gmail.com',
  phoneDisplay: '+963 982 466 109',
  whatsappUrl: 'https://wa.me/963982466109',
  socials: {
    instagram: 'https://www.instagram.com/rohaa0.0',
    linkedin: 'https://www.linkedin.com/in/roha-shhab-5a43773a9',
    facebook: 'https://www.facebook.com/share/1P33pgQmQx/',
  },
  trustedBy: [
    'SPACETOON',
    'ALMARAI',
    'SADAFCO',
    'ISLAMWEB — QATAR',
    'MAQAM STUDIO',
    'QATAR TOY FESTIVAL',
    'ARIJ',
  ],
  stats: [
    { value: '15+', label: 'Broadcast & Stage Productions' },
    { value: '600 → 4.6K', label: 'Organic Community Growth' },
    { value: '7', label: 'Specialized Film & Narrative Certifications' },
  ],
};

export const PROJECTS: ProjectItem[] = [
  // ================= 1. SCREENWRITING & CARTOONS =================
  {
    id: 'saud-sketches',
    title: "Saud's Educational Sketches",
    client: 'Sadafco (Saudi Milk) • Spacetoon',
    category: 'screenwriting',
    subTag: 'Educational Animation',
    summary:
      'Educational sketches tackling ADHD, coping with failure, and apology culture—broadcasted on Spacetoon.',
    fullStory:
      'Authored educational sketches centered around a core valuable fact that serves as the key to each episode. Tackled essential life topics like ADHD, coping with failure, the culture of apology, and the International Day of Families. Marked as my very first successful project broadcasted on Spacetoon.',
    accentTone: 'crimson',
  },
  {
    id: 'baneen-banat',
    title: 'Baneen & Banat Cartoon',
    client: 'IslamWeb (Ministry of Endowments of Qatar)',
    category: 'screenwriting',
    subTag: 'Science & Health Series',
    summary:
      '12 research-backed cartoon episodes across Science and Health planets for young audiences.',
    fullStory:
      'Contributed to a web-based cartoon project organized into thematic "planets." Wrote the cartoon episodes for both the Science and Health planets (6 episodes each, totaling 12 episodes). Deep-dived into rigorous research across physics, chemistry, biology, and medical concepts to craft engaging, non-preachy, and scientifically accurate content tailored for children.',
    metrics: '12 Episodes',
    accentTone: 'oxblood',
  },
  {
    id: 'labeeb-almarai',
    title: 'Labeeb Drink Milk — New Season',
    client: 'Almarai',
    category: 'screenwriting',
    subTag: 'Visual Identity & Screenwriting',
    summary:
      'Co-shaped the new visual style guide and authored cartoon episodes for Almarai’s iconic character.',
    fullStory:
      'Participated in shaping the new visual identity and style guide for Labeeb’s brand-new season, and contributed to writing the cartoon episodes for this major production with Almarai, bringing a beloved character into an exciting new era.',
    accentTone: 'terracotta',
  },
  {
    id: 'tales-we-love',
    title: 'Tales We Love (Hikayat Ma Ahlaha)',
    client: 'Spacetoon',
    category: 'screenwriting',
    subTag: 'Narrative Podcast',
    summary:
      'Reimagined classic international tales blended with iconic Spacetoon characters.',
    fullStory:
      'Transformed classic international stories into fresh, immersive narratives by blending them with beloved Spacetoon characters within a delightful podcast experience.',
    accentTone: 'gold',
  },
  {
    id: 'detective-28',
    title: 'Detective 28 Podcast',
    client: 'Audio Storytelling Production',
    category: 'screenwriting',
    subTag: 'Investigative Podcast',
    summary:
      'Dialogue scripts and curated trivia exploring the world of Detective Conan.',
    fullStory:
      'Wrote dialogue scripts and curated research elements for a podcast exploring the iconic world and trivia of Detective Conan, offering a unique investigative narrative experience.',
    accentTone: 'oxblood',
  },
  {
    id: 'kudo-modu',
    title: 'Kudo & Modu Adventures',
    client: 'Spacetoon',
    category: 'screenwriting',
    subTag: 'Series Co-Creation',
    summary:
      'Co-created a brand-new season with fresh character arcs for beloved Spacetoon characters.',
    fullStory:
      'Co-created a brand-new season for these beloved Spacetoon characters. Developed fresh character arcs and new additions, treating them with deep creative dedication throughout the writing journey.',
    accentTone: 'crimson',
  },
  {
    id: 'adventure-palace',
    title: 'Adventure Palace Silent Cartoon',
    client: 'Sadafco (Saudi Milk) • Spacetoon',
    category: 'screenwriting',
    subTag: 'Silent Visual Comedy',
    summary:
      'Seasonal silent cartoon sketches crafted for Back to School, Hajj, Eid, and Saudi National Day.',
    fullStory:
      'Crafted short silent cartoon sketches for various occasions, including Back to School, Hajj season, Eid al-Adha, Saudi National Day, and summer themes, successfully broadcasted on Spacetoon.',
    accentTone: 'terracotta',
  },
  {
    id: 'falfoul-falafeel',
    title: "Falfoul's 'Falafeel' Sketches",
    client: 'Spacetoon IP',
    category: 'screenwriting',
    subTag: 'Ramadan Comedy Sketches',
    summary:
      'Comedic Ramadan sketches and the Season 1 premiere pitch for Falfoul’s official Spacetoon launch.',
    fullStory:
      'Wrote comedic sketches for Spacetoon’s beloved character "Falfoul the Glutton" during Ramadan. Authored multiple sketches and proudly pitched the first-season premiere concept for Falfoul’s official launch on Spacetoon.',
    accentTone: 'gold',
  },
  {
    id: 'moda-mody',
    title: 'Moda Mody Family',
    client: 'Spacetoon',
    category: 'screenwriting',
    subTag: 'Series & Studio Bumpers',
    summary:
      'Season episodes and talk-show style audience bumpers prepared for broadcast on Spacetoon.',
    fullStory:
      'Co-wrote the season episodes and created engaging bumpers/interstitials featuring characters directly addressing the audience like a studio talk show, prepared for upcoming broadcast on Spacetoon.',
    accentTone: 'crimson',
  },

  // ================= 2. THEATRE & HISTORICAL =================
  {
    id: 'on-his-footsteps',
    title: 'On His Footsteps (Ala Khotah)',
    client: 'Maqam Studio',
    category: 'theatre-historical',
    subTag: 'Spatial Audio & Live Experience',
    summary:
      'Interactive historical storytelling chronicling the Prophet’s migration through spatial audio and live design.',
    fullStory:
      'A deeply personal and extraordinary milestone project. Collaborated on writing interactive on-ground experiences chronicling the Prophet’s migration. Conducted extensive, rigorous research into Arabian history, camel culture, and historical milestones, transforming biographical events into engaging, masterfully crafted storytelling scripts tailored for spatial audio immersion and live experiences.',
    metrics: 'Milestone Project',
    accentTone: 'gold',
  },
  {
    id: 'sherlock-musical',
    title: 'Sherlock Holmes Musical Play',
    client: 'Maqam Studio • Qatar Toy Festival',
    category: 'theatre-historical',
    subTag: 'Stage Musical',
    summary:
      'Co-written musical adaptation staged to overwhelming acclaim at the Qatar Toy Festival.',
    fullStory:
      'Co-written with the Maqam team, this musical adaptation was successfully staged at the Qatar Toy Festival, receiving overwhelming acclaim from families and young audiences.',
    accentTone: 'crimson',
  },
  {
    id: 'falfoul-theatre',
    title: "Falfoul's Theatre Play",
    client: 'Maqam Studio',
    category: 'theatre-historical',
    subTag: 'Original Stage Play',
    summary:
      'Debut theatrical script blending live mascot performance with human stage characters.',
    fullStory:
      'My debut theatrical work with Maqam, building an original play from scratch featuring a vibrant mix of mascot and human characters.',
    accentTone: 'terracotta',
  },
  {
    id: 'flintstones-play',
    title: 'The Flintstones Friendship Play',
    client: 'Live Theatre Production',
    category: 'theatre-historical',
    subTag: 'Interactive Theatre',
    summary:
      'Original stage play centered on friendship, engineered for high audience interaction.',
    fullStory:
      'Authored an original stage play centered on friendship, uniquely designed to spark high interaction and captivate both young and adult audiences.',
    accentTone: 'oxblood',
  },

  // ================= 3. SOCIAL MEDIA & BRAND CAMPAIGNS (READY FOR THE 56 ASSETS) =================
  {
    id: 'maqam-growth-strategy',
    title: 'Maqam Studio — Brand Identity & Growth',
    client: 'Maqam Studio',
    category: 'social-brand',
    subTag: 'Brand & Social Strategy',
    summary:
      'Full-year creative direction, visual branding, and content strategy growing Maqam from 600 to 4,600+ active followers.',
    fullStory:
      'Directed social media strategies for a full year. Handled monthly content briefs, graphic design, on-ground photography, videography, and post-production editing. Successfully grew Maqam’s digital community from 600 followers to over 4,600 active followers with continuous upward growth.',
    metrics: '600 → 4,600+ Followers',
    coverImage: '/media/brand/project-1-cover.jpg',
    gallery: [],
    accentTone: 'crimson',
  },
  {
    id: 'visual-photography-design',
    title: 'Visual Design & Editorial Photography',
    client: 'Maqam Studio',
    category: 'social-brand',
    subTag: 'Visual Direction',
    summary:
      'Curated visual campaigns blending art direction, stage photography, and typography.',
    fullStory:
      'Two dedicated visual campaigns combining on-ground photography and structured editorial graphic design tailored for cultural and theatrical branding.',
    coverImage: '/media/visual/project-1-cover.jpg',
    gallery: [],
    accentTone: 'terracotta',
  },
  {
    id: 'educational-carousels',
    title: 'Educational & Narrative Carousels',
    client: 'Maqam Studio',
    category: 'social-brand',
    subTag: 'Educational Carousels (4 Series)',
    summary:
      'Informational carousel series covering theatre arts, reading habits, writing craft, and podcast storytelling.',
    fullStory:
      'Authored and designed four multi-slide educational carousels breaking down child development through theatre, how to choose books for kids, handwriting cognitive benefits, and audio storytelling retention.',
    coverImage: '/media/carousels/project-1-cover.jpg',
    gallery: [],
    accentTone: 'gold',
  },
  {
    id: 'cartoon-promo-campaigns',
    title: 'Cartoon & Show Promotional Campaigns',
    client: 'Spacetoon & Maqam',
    category: 'social-brand',
    subTag: 'Show Promotions',
    summary:
      'Launch visuals and character teaser campaigns for broadcast cartoons and stage productions.',
    fullStory:
      'Conceptualized and designed promotional visual suites announcing new cartoon episodes, character launches, and theatrical tours across digital platforms.',
    coverImage: '/media/promos/project-1-cover.jpg',
    gallery: [],
    accentTone: 'oxblood',
  },
  {
    id: 'seasonal-cultural-campaigns',
    title: 'Seasonal & Cultural Occasion Campaigns',
    client: 'Maqam Studio',
    category: 'social-brand',
    subTag: 'Occasion Campaigns',
    summary:
      'Bespoke visual storytelling for Ramadan, Hijri New Year, Mother’s Day, and cultural milestones.',
    fullStory:
      'Crafted warm, culturally resonant visual greetings and campaign series celebrating key seasonal moments while preserving brand identity.',
    coverImage: '/media/occasions/project-1-cover.jpg',
    gallery: [],
    accentTone: 'crimson',
  },

  // ================= 4. FIELD PRODUCTION & REELS =================
  {
    id: 'damascus-book-fair',
    title: 'Damascus International Book Fair',
    client: 'Maqam Studio',
    category: 'field-reels',
    subTag: 'Field Production & Film',
    summary:
      'End-to-end media documentation from behind-the-scenes rehearsals to live stage performances.',
    fullStory:
      'Managed the full media lifecycle for Maqam’s participation—documenting everything from behind-the-scenes rehearsals to live stage performances through field photography and professional videography, followed by advanced video editing and post-production to publish engaging cultural content.',
    coverImage: '/media/reels/reel-1-cover.jpg',
    videoUrl: '/media/reels/reel-1.mp4',
    accentTone: 'crimson',
  },
  {
    id: 'syrian-summer-citadel',
    title: 'Syrian Summer Festival — Damascus Citadel',
    client: 'Maqam Studio',
    category: 'field-reels',
    subTag: 'On-Ground Coverage & Reel',
    summary:
      'Cinematic field documentation of live performances at the historic Damascus Citadel.',
    fullStory:
      'Handled comprehensive visual documentation and field videography for Maqam’s events at the historical Citadel. Covered the entire journey from initial stage preparations and rehearsals to live performances, concluding with editing and publishing dynamic promotional media.',
    coverImage: '/media/reels/reel-2-cover.jpg',
    videoUrl: '/media/reels/reel-2.mp4',
    accentTone: 'terracotta',
  },
  {
    id: 'childrens-cultural-festival',
    title: "Children's Cultural Festival",
    client: 'Maqam Studio',
    category: 'field-reels',
    subTag: 'Comprehensive Media Production',
    summary:
      'Vibrant rehearsal-to-stage videography and polished social media broadcast edits.',
    fullStory:
      'Documented Maqam’s special children’s performances and theatrical activities from the rehearsal rooms to the main stage. Captured vibrant on-ground photography and videography, then edited and produced polished visual content ready for digital broadcast and social media publication.',
    coverImage: '/media/reels/reel-3-cover.jpg',
    videoUrl: '/media/reels/reel-3.mp4',
    accentTone: 'gold',
  },
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'creative-writing',
    number: '01',
    title: 'Creative Writing & Screenwriting',
    subtitle: 'Narrative architecture for screen, stage, and audio.',
    description:
      'From broadcast animation series and comedic sketches to interactive theatre and spatial audio narratives—crafted with emotional resonance and structural rigor.',
    deliverables: [
      'Cartoon & Animation Screenwriting',
      'Theatre & Playwright Scripts',
      'Content Strategy & Story Development',
    ],
  },
  {
    id: 'journalism-research',
    number: '02',
    title: 'Journalism & Deep Research',
    subtitle: 'Evidence-driven storytelling grounded in fact.',
    description:
      'Applying investigative journalism standards and rigorous historical/scientific verification to elevate documentaries, educational scripts, and editorial features.',
    deliverables: [
      'Investigative Reports & Feature Articles',
      'Deep Fact-Checking & Historical Research',
      'Scientific & Cultural Script Verification',
    ],
  },
  {
    id: 'visual-production',
    number: '03',
    title: 'Visual Production & Social Media',
    subtitle: 'Field coverage, cinematic editing, and community growth.',
    description:
      'End-to-end visual storytelling from camera framing on location to rhythmic post-production and cohesive social brand campaigns.',
    deliverables: [
      'On-Ground Videography & Photography',
      'Cinematic Video Editing & Promos',
      'Social Media Direction & Brand Campaigns',
    ],
  },
  {
    id: 'ai-services',
    number: '04',
    title: 'Advanced & AI-Assisted Workflows',
    subtitle: 'Ethical, high-leverage creative acceleration.',
    description:
      'Integrating modern AI tools responsibly into pre-production, pitch decks, visual concepting, and narrative ideation without sacrificing human craft.',
    deliverables: [
      'AI-Powered Proposals & Pitch Presentations',
      'Responsible AI Media Integration',
      'Smart Prompt Engineering & Concept Art Direction',
    ],
  },
];

export const TOOLKIT = [
  {
    group: 'Design & Illustration',
    tools: ['Adobe Illustrator', 'Adobe Lightroom', 'Canva', 'Infinite Painter'],
  },
  {
    group: 'Video Editing & Production',
    tools: ['Adobe Premiere Pro', 'CapCut Pro', 'VN Editor'],
  },
  {
    group: 'AI & Workflow Integration',
    tools: [
      'Responsible AI Integration',
      'AI-Assisted Visual Concepting',
      'Smart Prompt Engineering',
      'Proposal & Pitch Development',
    ],
  },
];

export const CERTIFICATIONS: CertificationItem[] = [
  {
    id: 'cinearts-directing',
    year: '2026',
    title: 'Film Directing Professional Training',
    institution: 'CineArts Academy',
    details:
      'Cinematic storytelling, camera movements, framing, scene blocking, and directing pacing for visual narratives.',
  },
  {
    id: 'cinearts-editing',
    year: '2026',
    title: 'Cinematic Editing',
    institution: 'CineArts Academy',
    details:
      'Advanced editing for cinematic scenes, feature cuts, and dynamic promotional trailers with precise narrative pacing.',
  },
  {
    id: 'arij-investigative',
    year: '2026',
    title: 'Investigative Journalism Certification',
    institution: 'ARIJ (Arab Reporters for Investigative Journalism)',
    details:
      'Deep investigative research, fact-checking methodologies, and uncovering structural stories.',
  },
  {
    id: 'arij-ai-media',
    year: '2026',
    title: 'AI in Media & Responsible Integration',
    institution: 'ARIJ & Women Won the War (Led by Mays Qat)',
    details:
      'Interactive training on leveraging artificial intelligence ethically and effectively in modern media workflows.',
  },
  {
    id: 'pixar-in-a-box',
    year: '2025',
    title: 'The Art of Storytelling & Cartoon Production',
    institution: 'Pixar in a Box (Pixar Animation Studios & Khan Academy)',
    details:
      'Character development, story structure, visual language, and the animation pipeline used by Pixar.',
  },
  {
    id: 'adobe-illustrator',
    year: '2024',
    title: 'Adobe Illustrator Certification',
    institution: 'Emeysa Academy, Homs',
    highlight: 'Grade: 90%',
    details:
      'Advanced training in vector graphics, digital illustration, and visual branding design.',
  },
  {
    id: 'ebla-story-writing',
    year: 'Workshop',
    title: 'Story Writing & Narrative Workshop',
    institution: 'Ebla Publishing House (Led by Author Jaber Bakr)',
    details:
      'Intensive training in character development, dramatic narrative structures, and creative storytelling techniques.',
  },
];