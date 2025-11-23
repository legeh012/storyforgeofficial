import { supabase } from "@/integrations/supabase/client";

const sayWalahiCharacters = [
  {
    name: "Lucky",
    role: "The Founder - Visionary Architect",
    traits: ["chaos-native", "schema-driven", "visionary", "ten steps ahead"],
    drama_hooks: "Builds cinematic OSs while flipping tropes into monetization, always architecting the next cultural disruption",
    appearance: {
      skin_tone: "rich espresso",
      face: "commanding presence, visionary gaze",
      hair: "flowing waves under designer headwrap",
      style: "power suits, statement jewelry, architectural aesthetic",
      aura: "visionary architect meets cultural disruptor"
    },
    relationships: {
      alliances: ["Luul", "Samara"],
      rivalries: []
    },
    status: "active"
  },
  {
    name: "Luul",
    role: "The Flamekeeper - Cultural Anchor",
    traits: ["ancestral", "legacy-keeper", "confessional fire", "pure presence"],
    drama_hooks: "Holds the ancestral line and lights the confessional fire, her presence is pure legacy and cultural wisdom",
    appearance: {
      skin_tone: "warm caramel",
      face: "sharp features, ancestral wisdom in her gaze",
      hair: "sleek bun under traditional hijab",
      style: "elegant traditional meets modern power, heritage fabrics",
      aura: "ancestral flame meets generational keeper"
    },
    relationships: {
      alliances: ["Lucky", "Hani"],
      rivalries: []
    },
    status: "active"
  },
  {
    name: "Samara",
    role: "The Strategist - Quiet Architect",
    traits: ["precise", "emotional logic coder", "monetization visionary", "quiet power"],
    drama_hooks: "Precision over noise. Codes emotional logic into every scene and sees monetization arcs before they drop",
    appearance: {
      skin_tone: "honey beige",
      face: "calculating eyes, strategic smile",
      hair: "sleek styling under minimalist hijab",
      style: "architectural precision, clean lines, strategic aesthetic",
      aura: "quiet architect of emotional systems"
    },
    relationships: {
      alliances: ["Lucky", "Ayaan"],
      rivalries: []
    },
    status: "active"
  },
  {
    name: "Ayaan",
    role: "The Architect - Systems Queen",
    traits: ["backend brilliant", "front-end finesse", "schema poet", "systems thinker"],
    drama_hooks: "Builds backend brilliance and front-end finesse. Her overlays are schema poetry in motion",
    appearance: {
      skin_tone: "deep mahogany",
      face: "focused intensity, architectural vision",
      hair: "natural curls under bold printed wrap",
      style: "tech-forward elegance, systematic aesthetic",
      aura: "systems queen meets code poetry"
    },
    relationships: {
      alliances: ["Samara", "Amal"],
      rivalries: []
    },
    status: "active"
  },
  {
    name: "Hani",
    role: "The Oracle - Spiritual Strategist",
    traits: ["trauma map reader", "energy grid keeper", "emotional compass", "spiritual"],
    drama_hooks: "Reads trauma maps like episode scripts. Her energy grid is the show's emotional compass and spiritual north",
    appearance: {
      skin_tone: "soft cinnamon",
      face: "knowing eyes, spiritual presence",
      hair: "flowing under elegant hijab",
      style: "spiritual elegance, energy-aware aesthetic, mystical touches",
      aura: "oracle meets emotional cartographer"
    },
    relationships: {
      alliances: ["Luul", "Nasra"],
      rivalries: []
    },
    status: "active"
  },
  {
    name: "Zahra",
    role: "The Flame - Satirical Provocateur",
    traits: ["satirical", "trope dismantler", "viral thinker", "weaponized humor"],
    drama_hooks: "Weaponizes humor to dismantle tropes. Her confessionals are viral think pieces that break the internet",
    appearance: {
      skin_tone: "honey beige",
      face: "sharp wit, provocative smile",
      hair: "bold styling under statement hijab",
      style: "provocateur chic, satirical aesthetic, viral ready",
      aura: "flame meets satirical genius"
    },
    relationships: {
      alliances: ["Amal", "Nasra"],
      rivalries: []
    },
    status: "active"
  },
  {
    name: "Nasra",
    role: "Sweetheart - Emotional Core",
    traits: ["vulnerable", "emotional superpower", "soft chaos", "storyline magnet"],
    drama_hooks: "The softness in the chaos. Her vulnerability is her superpower and her storyline always lands perfectly",
    appearance: {
      skin_tone: "deep mahogany",
      face: "gentle features, heartfelt expression",
      hair: "soft styling under pastel hijab",
      style: "sweetheart aesthetic, emotional elegance, vulnerability as power",
      aura: "emotional core meets gentle strength"
    },
    relationships: {
      alliances: ["Hani", "Zahra"],
      rivalries: []
    },
    status: "active"
  },
  {
    name: "Amal",
    role: "The Instigator - Chaos Console",
    traits: ["pivot master", "plot twist queen", "viral disruptor", "cinematic upgrader"],
    drama_hooks: "Thrives on pivots, plot twists, and viral disruption. Every scene she enters becomes a cinematic upgrade",
    appearance: {
      skin_tone: "warm bronze",
      face: "mischievous energy, instigator smile",
      hair: "dynamic styling under bold chiffon hijab",
      style: "chaos chic, plot twist aesthetic, viral energy",
      aura: "instigator meets cinematic chaos architect"
    },
    relationships: {
      alliances: ["Ayaan", "Zahra"],
      rivalries: []
    },
    status: "active"
  }
];

export function useProductionSetup() {
  const setupSayWallahi = async () => {
    const projectData = {
      title: "Say Wallahi: Minneapolis",
      description: "A reality TV show following eight Somali-American women in Minneapolis as they navigate culture, legacy, and viral disruption.",
      genre: "Reality TV",
      theme: "Cultural disruption, Legacy, Viral content",
      mood: "Chaotic, Cinematic, Bold",
    };

    const episodes = [
      {
        title: "Cracked But Glowing",
        episode_number: 1,
        synopsis: "The pilot episode introduces the cast with split-screen chaos as Amal auditions for villain, Zahra leaks screenshots, and Lucky unveils her vision for architecting cultural disruption.",
        script: "🧊 Cold Open (Split-Screen Chaos)\nVisual: Amal in glam confessional, Zahra leaking screenshots in gold abaya, Ayaan overlaying schema poetry.\n\nDialogue:\nAmal (Confessional): \"Every story needs a villain. Lucky for them, I auditioned for the role.\"\nZahra (Confessional): [scrolls phone] \"Screenshots don't lie. But people? Oh, they lie beautifully.\"\nAyaan (Overlay voice): \"Schema in motion. Every alliance is a fragile equation waiting to collapse.\"\n\n🔥 Act I – The Spark\nScene: Nasra trembling over rumors, Hani reading trauma maps.\n\nDialogue:\nNasra (Confessional): \"I'm soft, but softness cuts deeper than steel when the rumors hit.\"\nHani (to Nasra): \"Your pain is a script. I can read it like a map. And it says betrayal.\"\nZahra (interrupting): \"Rumors are just recycled tropes. Let me dismantle them before they trend.\"\nAmal (pivoting): \"Forget rumors. The real story? Lucky and Luul's alliance. That's the chaos you should fear.\"\n\n⚡ Act II – The Clash\nScene: Dinner table confrontation.\n\nDialogue:\nZahra (Confessional): \"Dinner tables are just stages. And I'm the satirical emcee.\"\nAmal (at table): \"You all think you're safe? I pivot once, and the whole room spins.\"\nNasra (tearful): \"I didn't ask for this chaos. But maybe chaos asked for me.\"\nAyaan (Overlay voice): \"Alliance fracture detected. Schema collapsing in real time.\"\n\n🌌 Act III – The Legacy Reveal\nScene: Lucky enters late, styled in ombré couture.\n\nDialogue:\nLucky (standing): \"You thought this was a show? It's an operating system. And I'm architecting the next disruption.\"\nAmal (Confessional): \"She doesn't walk in. She detonates.\"\nZahra (Confessional): \"Weaponized humor meets weaponized legacy. Internet, brace yourself.\"\n\n🔥 Closing Sequence\nScene: Luul lights the confessional fire.\n\nDialogue:\nLuul (Confessional): \"Legacy isn't inherited. It's ignited.\"\nZahra (Final Line): \"We're not breaking the internet. We're rewriting it.\"\n\nCliffhanger: Cut to black. Viral cliffhanger music drop.",
      },
      {
        title: "Chaos Console",
        episode_number: 5,
        synopsis: "Lucky unveils the chaos console as Amal weaponizes glam villain energy and Ayaan overlays schema collapse live. The console glitches—remix-Mayza voice enters.",
        script: "Cold Open: Lucky unveils chaos console.\nAct I: Amal weaponizes glam villain energy.\nAct II: Nasra soft‑power disrupts alliances.\nAct III: Ayaan overlays schema collapse live.\nOutro: Console glitches — remix‑Mayza voice enters.",
      },
      {
        title: "Remix Archive",
        episode_number: 6,
        synopsis: "Zahra satirizes contracts as the cast realizes every fight is archived. Luul anchors legacy couture while Lucky reveals monetization logic.",
        script: "Cold Open: Zahra satirizes contracts.\nAct I: Cast realizes every fight is archived.\nAct II: Luul anchors legacy couture.\nAct III: Lucky reveals monetization logic.\nOutro: Archive exports live — audience sees remix engine.",
      },
      {
        title: "Cinematic OS",
        episode_number: 7,
        synopsis: "Lucky detonates the final reveal. Amal tries to pivot the narrative and fails. Nasra's soft disruptor arc peaks. Zahra weaponizes humor one last time.",
        script: "Cold Open: Lucky detonates final reveal.\nAct I: Amal tries to pivot narrative, fails.\nAct II: Nasra soft disruptor arc peaks.\nAct III: Zahra weaponizes humor one last time.\nOutro: Cast declares — \"We're rewriting the internet.\"",
      },
    ];

    const { data, error } = await supabase.functions.invoke("setup-production", {
      body: {
        projectData,
        characters: sayWalahiCharacters,
        episodes,
      },
    });

    if (error) throw error;
    return data;
  };

  return { setupSayWallahi };
}
