import { TeamMember, TagCategory, Task, UserAccount } from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-admin-priyanka',
    name: 'Priyanka Paliwal',
    email: 'admin@flickacosmetics.com',
    password: 'admin',
    role: 'admin',
    roleTitle: 'Creative Director & Admin',
    department: 'Creative Strategy & Performance',
    status: 'approved',
    isAdmin: true,
    initials: 'PP',
    avatarBg: 'bg-purple-600',
    avatarText: 'text-white',
    createdAt: '2026-08-01T09:00:00Z',
    approvedAt: '2026-08-01T09:00:00Z',
    approvedBy: 'System Root',
  },
  {
    id: 'user-aarav',
    name: 'Aarav',
    email: 'aarav.video@flickacosmetics.com',
    password: 'aarav',
    role: 'video_editor',
    roleTitle: 'Video Editor & Animator',
    department: 'Video Production',
    status: 'approved',
    isAdmin: false,
    initials: 'AA',
    avatarBg: 'bg-amber-600',
    avatarText: 'text-white',
    createdAt: '2026-08-05T10:00:00Z',
    approvedAt: '2026-08-05T10:30:00Z',
    approvedBy: 'Priyanka Paliwal',
  },
  {
    id: 'user-meera',
    name: 'Meera',
    email: 'meera.design@flickacosmetics.com',
    password: 'meera',
    role: 'graphic_designer',
    roleTitle: 'Graphic & Visual Designer',
    department: 'Brand Design',
    status: 'approved',
    isAdmin: false,
    initials: 'ME',
    avatarBg: 'bg-teal-600',
    avatarText: 'text-white',
    createdAt: '2026-08-06T11:00:00Z',
    approvedAt: '2026-08-06T11:15:00Z',
    approvedBy: 'Priyanka Paliwal',
  },
  {
    id: 'user-rohan',
    name: 'Rohan Sharma',
    email: 'rohan.ads@flickacosmetics.com',
    password: 'rohan',
    role: 'performance_marketer',
    roleTitle: 'Growth & Ads Lead',
    department: 'Performance Marketing',
    status: 'approved',
    isAdmin: false,
    initials: 'RS',
    avatarBg: 'bg-indigo-600',
    avatarText: 'text-white',
    createdAt: '2026-08-08T12:00:00Z',
    approvedAt: '2026-08-08T12:30:00Z',
    approvedBy: 'Priyanka Paliwal',
  },
  {
    id: 'user-kavya',
    name: 'Kavya Verma',
    email: 'kavya@flickacosmetics.com',
    password: 'kavya',
    role: 'graphic_designer',
    roleTitle: 'Brand & Packaging Designer',
    department: 'Packaging & Visuals',
    status: 'approved',
    isAdmin: false,
    initials: 'KV',
    avatarBg: 'bg-rose-600',
    avatarText: 'text-white',
    createdAt: '2026-08-10T14:00:00Z',
    approvedAt: '2026-08-10T14:45:00Z',
    approvedBy: 'Priyanka Paliwal',
  },
  {
    id: 'user-pending-tanvi',
    name: 'Tanvi Rawat',
    email: 'tanvi@flickacosmetics.com',
    password: 'tanvi',
    role: 'ugc_creator',
    roleTitle: 'UGC Content & Influencer Specialist',
    department: 'Influencer & Social Content',
    status: 'pending',
    isAdmin: false,
    initials: 'TR',
    avatarBg: 'bg-pink-600',
    avatarText: 'text-white',
    createdAt: '2026-08-25T18:30:00Z',
  },
];

export const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'priyanka',
    name: 'Priyanka Paliwal',
    initials: 'PP',
    role: 'performance_marketer',
    roleTitle: 'Performance Marketer',
    avatarBg: 'bg-purple-600',
    avatarText: 'text-white',
    email: 'priyanka@flickacosmetics.com',
  },
  {
    id: 'aarav',
    name: 'Aarav',
    initials: 'AA',
    role: 'video_editor',
    roleTitle: 'Video Editor',
    avatarBg: 'bg-amber-600',
    avatarText: 'text-white',
    email: 'aarav.video@flickacosmetics.com',
  },
  {
    id: 'meera',
    name: 'Meera',
    initials: 'ME',
    role: 'graphic_designer',
    roleTitle: 'Graphic Designer',
    avatarBg: 'bg-teal-600',
    avatarText: 'text-white',
    email: 'meera.design@flickacosmetics.com',
  },
  {
    id: 'rohan',
    name: 'Rohan Sharma',
    initials: 'RS',
    role: 'performance_marketer',
    roleTitle: 'Growth & Ads Lead',
    avatarBg: 'bg-indigo-600',
    avatarText: 'text-white',
    email: 'rohan.ads@flickacosmetics.com',
  },
  {
    id: 'kavya',
    name: 'Kavya Verma',
    initials: 'KV',
    role: 'graphic_designer',
    roleTitle: 'Brand & Packaging Designer',
    avatarBg: 'bg-rose-600',
    avatarText: 'text-white',
    email: 'kavya@flickacosmetics.com',
  },
];

export const INITIAL_TAGS: TagCategory[] = [
  {
    id: 'tag-creative',
    name: 'Creative',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dotColor: '#f43f5e',
  },
  {
    id: 'tag-catalogs',
    name: 'Catalogs',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dotColor: '#3b82f6',
  },
  {
    id: 'tag-ugc',
    name: 'UGC',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dotColor: '#f59e0b',
  },
  {
    id: 'tag-ai',
    name: 'AI',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dotColor: '#a855f7',
  },
  {
    id: 'tag-animated-video',
    name: 'Animated Video',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: '#10b981',
  },
  {
    id: 'tag-others',
    name: 'Others',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dotColor: '#64748b',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Festive sale hero banner concepts',
    description: 'Create 3 hero banner variations for upcoming Diwali / Festive beauty launch with luxury gold accents, typography treatment, and call to action: FLAT 30% OFF.',
    notes: 'Focus on warm lighting and royal burgundy + golden tones. High-contrast typography for headline.',
    status: 'not_started',
    tagIds: ['tag-creative'],
    createdById: 'priyanka',
    createdByName: 'Priyanka Paliwal',
    product: 'Festive Beauty Box',
    funnel: 'TOF',
    persona: 'Festive Shoppers',
    concept: 'Gifting & Festive Glow',
    platform: 'Meta (Instagram / FB)',
    deliverableFormat: '1920x1080 (16:9 YouTube/Hero)',
    priority: 'high',
    dueDate: '2026-08-28',
    monthKey: '2026-08',
    createdAt: '2026-08-20T10:15:00Z',
    updatedAt: '2026-08-20T10:15:00Z',
    driveLink: 'https://drive.google.com/drive/folders/festive-sale-raw',
    figmaLink: 'https://figma.com/file/festive-banners-2026',
    refImages: [
      {
        id: 'ref-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        name: 'luxury_festive_mood.jpg',
        createdAt: '2026-08-20T10:20:00Z'
      }
    ],
    createdImages: [],
    activity: [
      {
        id: 'act-1',
        text: 'Card created by Priyanka Paliwal',
        timestamp: '2026-08-20T10:15:00Z',
        user: 'Priyanka Paliwal'
      }
    ],
    checklist: [
      { id: 'c1', text: '16:9 Web Hero Banner (1920x1080)', completed: false },
      { id: 'c2', text: '1:1 App Store / Feed Pop-up (1080x1080)', completed: false },
      { id: 'c3', text: 'Clean PNG exports without text for localized ads', completed: false },
    ],
  },
  {
    id: 'task-2',
    title: 'Shoot product catalog — new shades',
    description: 'Design digital lookbook and product catalog grids showcasing the 8 new matte foundation & lip shades with swatch close-ups.',
    notes: 'Color accurate swatches under 5500K balanced daylight lighting. Export high-res PDF and PNG.',
    status: 'not_started',
    tagIds: ['tag-catalogs'],
    assigneeId: 'meera',
    createdById: 'priyanka',
    createdByName: 'Priyanka Paliwal',
    product: 'Velvet Matte Shades',
    funnel: 'MOF',
    persona: 'Beauty Enthusiasts',
    concept: 'Shade Match & Swatch Guide',
    platform: 'Website / Shopify',
    deliverableFormat: 'Catalog Spread (PDF/PNG)',
    priority: 'medium',
    dueDate: '2026-08-29',
    monthKey: '2026-08',
    createdAt: '2026-08-21T11:30:00Z',
    updatedAt: '2026-08-21T11:30:00Z',
    driveLink: 'https://drive.google.com/drive/folders/product-photoshoot-raw',
    refImages: [
      {
        id: 'ref-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
        name: 'matte_shades_swatch.jpg',
        createdAt: '2026-08-21T11:35:00Z'
      }
    ],
    createdImages: [],
    activity: [
      {
        id: 'act-2',
        text: 'Card created and assigned to Meera',
        timestamp: '2026-08-21T11:30:00Z',
        user: 'Priyanka Paliwal'
      }
    ],
    checklist: [
      { id: 'c4', text: 'Color swatch color grading', completed: false },
      { id: 'c5', text: '8-page catalog layout', completed: false },
    ],
  },
  {
    id: 'task-3',
    title: 'ugc content by by to old foundation',
    description: 'Marketing campaign brief comparing old liquid foundation vs new breathable formulation. Fast-paced split screen hook.',
    notes: 'Side-by-side wear test: left side cakey vs right side dewy breathable finish after 8 hours.',
    status: 'not_started',
    tagIds: ['tag-ugc'],
    createdById: 'priyanka',
    createdByName: 'Priyanka Paliwal',
    product: 'Skin Glow Foundation',
    funnel: 'BOF',
    persona: 'Working Professionals',
    concept: 'Comparison / Before-After',
    platform: 'Meta (Instagram / FB)',
    deliverableFormat: '1080x1920 (9:16 Reel/Story)',
    priority: 'high',
    dueDate: '2026-08-27',
    monthKey: '2026-08',
    createdAt: '2026-08-22T09:00:00Z',
    updatedAt: '2026-08-22T09:00:00Z',
    referenceUrl: 'https://instagram.com/reels/sample-beauty-hook',
    refImages: [
      {
        id: 'ref-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
        name: 'before_after_glow.jpg',
        createdAt: '2026-08-22T09:05:00Z'
      }
    ],
    createdImages: [],
    activity: [
      {
        id: 'act-3',
        text: 'Card created with UGC split-screen brief',
        timestamp: '2026-08-22T09:00:00Z',
        user: 'Priyanka Paliwal'
      }
    ],
  },
  {
    id: 'task-4',
    title: 'Edit UGC reel from creator batch',
    description: 'Combine creator footage from batch #4. Add catchy text overlays, jump cuts, sound effects, trending audio timing, and product discount sticker in first 3 seconds.',
    notes: 'Use trending audio track from Instagram library. Highlight "Transfer-proof" text badge at 0:02.',
    status: 'in_progress',
    tagIds: ['tag-ugc'],
    assigneeId: 'aarav',
    createdById: 'priyanka',
    createdByName: 'Priyanka Paliwal',
    product: 'Waterproof Kajal & Liner',
    funnel: 'BOF',
    persona: 'College Students',
    concept: 'Smudge-Test Demo',
    platform: 'YouTube Shorts',
    deliverableFormat: '1080x1920 (9:16 Reel/Story)',
    priority: 'high',
    dueDate: '2026-08-26',
    monthKey: '2026-08',
    createdAt: '2026-08-21T14:20:00Z',
    updatedAt: '2026-08-23T16:00:00Z',
    driveLink: 'https://drive.google.com/drive/folders/ugc-creator-batch-04',
    refImages: [
      {
        id: 'ref-4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
        name: 'creator_batch_raw.jpg',
        createdAt: '2026-08-21T14:30:00Z'
      }
    ],
    createdImages: [
      {
        id: 'creat-1',
        type: 'video',
        url: 'https://drive.google.com/file/d/sample-reel-v1-render.mp4',
        name: 'kajal_smudge_reel_draft_v1.mp4',
        createdAt: '2026-08-23T15:45:00Z'
      }
    ],
    activity: [
      {
        id: 'act-4a',
        text: 'Card created and assigned to Aarav',
        timestamp: '2026-08-21T14:20:00Z',
        user: 'Priyanka Paliwal'
      },
      {
        id: 'act-4b',
        text: 'Moved to In Progress by Aarav',
        timestamp: '2026-08-22T10:00:00Z',
        user: 'Aarav'
      },
      {
        id: 'act-4c',
        text: 'Draft video uploaded for review',
        timestamp: '2026-08-23T15:45:00Z',
        user: 'Aarav'
      }
    ],
    checklist: [
      { id: 'c6', text: 'Hook cut in first 2.5s', completed: true },
      { id: 'c7', text: 'Bold subtitle captions', completed: true },
      { id: 'c8', text: 'Color grade creator lighting', completed: false },
      { id: 'c9', text: 'CTA end frame with promo code', completed: false },
    ],
    reviewComments: [
      {
        id: 'rev-1',
        authorId: 'priyanka',
        authorName: 'Priyanka Paliwal',
        text: 'Make sure the price callout happens at 0:04 mark before viewer drops off!',
        timestamp: '2026-08-22T17:00:00Z',
      }
    ]
  },
  {
    id: 'task-5',
    title: 'AI moodboard for festive campaign',
    description: 'Generate high-res Midjourney / Gemini concept aesthetics for festive lighting, ethnic wardrobe color palettes, and packaging textures.',
    notes: 'Delivered 12 Midjourney prompt outputs with golden spark particles and festive bokeh.',
    status: 'done',
    tagIds: ['tag-ai'],
    assigneeId: 'aarav',
    createdById: 'priyanka',
    createdByName: 'Priyanka Paliwal',
    product: 'Festive Season 2026',
    funnel: 'TOF',
    persona: 'Festive Shoppers',
    concept: 'AI Concept Art & Lighting',
    platform: 'Meta (Instagram / FB)',
    deliverableFormat: '1080x1080 (1:1 Feed)',
    priority: 'medium',
    dueDate: '2026-08-20',
    monthKey: '2026-08',
    createdAt: '2026-08-19T08:00:00Z',
    updatedAt: '2026-08-20T18:00:00Z',
    completedAt: '2026-08-20T18:00:00Z',
    figmaLink: 'https://figma.com/file/ai-moodboards-festive',
    refImages: [
      {
        id: 'ref-5',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
        name: 'festive_lighting_ref.jpg',
        createdAt: '2026-08-19T08:30:00Z'
      }
    ],
    createdImages: [
      {
        id: 'creat-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=600&q=80',
        name: 'ai_moodboard_approved.png',
        createdAt: '2026-08-20T17:30:00Z'
      }
    ],
    activity: [
      {
        id: 'act-5a',
        text: 'Card created',
        timestamp: '2026-08-19T08:00:00Z',
        user: 'Priyanka Paliwal'
      },
      {
        id: 'act-5b',
        text: 'Approved and moved to Done',
        timestamp: '2026-08-20T18:00:00Z',
        user: 'Priyanka Paliwal'
      }
    ]
  },
  {
    id: 'task-6',
    title: 'Animated logo sting for reels intro',
    description: '3-second slick micro-animation of Flicka Cosmetics logo shimmer with subtle audio swoosh for all Instagram Reels & TikTok video intros.',
    notes: 'Delivered in transparent ProRes 4444 and MP4 format for Premiere & CapCut.',
    status: 'done',
    tagIds: ['tag-animated-video'],
    assigneeId: 'meera',
    createdById: 'priyanka',
    createdByName: 'Priyanka Paliwal',
    product: 'Brand Identity',
    funnel: 'Retention',
    persona: 'Gen-Z Glam',
    concept: 'Brand Shimmer Sting',
    platform: 'Meta (Instagram / FB)',
    deliverableFormat: 'Vector / Motion Sting',
    priority: 'high',
    dueDate: '2026-08-21',
    monthKey: '2026-08',
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-08-21T15:30:00Z',
    completedAt: '2026-08-21T15:30:00Z',
    driveLink: 'https://drive.google.com/drive/folders/brand-logo-stings',
    createdImages: [
      {
        id: 'creat-3',
        type: 'video',
        url: 'https://drive.google.com/file/d/logo_shimmer_final.mp4',
        name: 'logo_shimmer_final.mp4',
        createdAt: '2026-08-21T15:00:00Z'
      }
    ],
    activity: [
      {
        id: 'act-6a',
        text: 'Card created',
        timestamp: '2026-08-18T10:00:00Z',
        user: 'Priyanka Paliwal'
      },
      {
        id: 'act-6b',
        text: 'Approved and moved to Done',
        timestamp: '2026-08-21T15:30:00Z',
        user: 'Priyanka Paliwal'
      }
    ]
  },
];
