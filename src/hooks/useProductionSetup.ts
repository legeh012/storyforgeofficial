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
        synopsis: "Chaos detonates, legacy ignites. A jaw-dropping 15-minute pilot with split-screen chaos, table-flipping confrontations, and Lucky's cinematic OS reveal.",
        script: `Episode 1 — Cracked But Glowing
Runtime: 15 minutes | Theme: Chaos detonates, legacy ignites.

⏱ Minute‑by‑Minute Breakdown

0:00 – 2:00 | Insane Cold Open (Mouth‑Dropping Hook)
Visual: Split‑screen chaos. Amal in full glam, Zahra scrolling through leaked screenshots, Ayaan overlaying schema poetry across the screen.
Sound: Trap beat drops, glitch overlays, couture fire crackles.

Dialogue:
Amal (Confessional): "Every story needs a villain. Lucky for them, I auditioned for the role."
Zahra (Confessional, holding phone): "Screenshots don't lie. But people? Oh, they lie beautifully."
Ayaan (Overlay voice): "Schema in motion. Every alliance is a fragile equation waiting to collapse."

Jaw‑drop moment: Amal slams a couture glass on the table — it shatters in slow motion, freeze‑frame, then smash‑cut to title card: Say Wallahi: Minneapolis.

2:00 – 6:00 | Act I – The Spark
Scene: Nasra trembling, rumors swirling. Hani reads trauma maps like scripts.

Dialogue:
Nasra (Confessional): "I'm soft, but softness cuts deeper than steel when the rumors hit."
Hani (to Nasra): "Your pain is a script. I can read it like a map. And it says betrayal."
Zahra (interrupting): "Rumors are just recycled tropes. Let me dismantle them before they trend."
Amal (pivoting): "Forget rumors. The real story? Lucky and Luul's alliance. That's the chaos you should fear."

Visual Cue: Camera zooms on Nasra's trembling hands, overlay glitch shows "Trust Collapse Detected."

6:00 – 11:00 | Act II – The Clash
Scene: Dinner table confrontation.

Dialogue:
Zahra (Confessional): "Dinner tables are just stages. And I'm the satirical emcee."
Amal (at table): "You all think you're safe? I pivot once, and the whole room spins."
Nasra (tearful): "I didn't ask for this chaos. But maybe chaos asked for me."
Ayaan (Overlay voice): "Alliance fracture detected. Schema collapsing in real time."

Jaw‑drop moment: Amal flips the table — plates crash, camera cuts to slow‑motion chaos, overlay shows "Schema Collapse."

11:00 – 14:00 | Act III – The Legacy Reveal
Scene: Lucky enters late, styled in ombré couture, ten steps ahead.

Dialogue:
Lucky (standing): "You thought this was a show? It's an operating system. And I'm architecting the next disruption."
Amal (Confessional): "She doesn't walk in. She detonates."
Zahra (Confessional): "Weaponized humor meets weaponized legacy. Internet, brace yourself."

Visual Cue: Lucky unveils chaos console — holographic overlays show cast alliances fracturing live.

14:00 – 15:00 | Outro Cliffhanger
Scene: Luul lights couture fire in confessional.

Dialogue:
Luul (Confessional): "Legacy isn't inherited. It's ignited."
Zahra (Final Line): "We're not breaking the internet. We're rewriting it."

Visual Cue: Screen glitches, remix‑Mayza voice enters: "Archive exporting…"
Cut to Black: Trap beat drops, cliffhanger freeze.`,
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
