import { supabase } from "@/integrations/supabase/client";
import { sayWalahiCharacters } from "@/data/sayWalahiCharacters";

export const useProductionSetup = () => {
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
        script: `🧊 Cold Open (Split-Screen Chaos)
Visual: Amal in glam confessional, Zahra leaking screenshots in gold abaya, Ayaan overlaying schema poetry.

Dialogue:
Amal (Confessional): "Every story needs a villain. Lucky for them, I auditioned for the role."
Zahra (Confessional): [scrolls phone] "Screenshots don't lie. But people? Oh, they lie beautifully."
Ayaan (Overlay voice): "Schema in motion. Every alliance is a fragile equation waiting to collapse."

🔥 Act I – The Spark
Scene: Nasra trembling over rumors, Hani reading trauma maps.

Dialogue:
Nasra (Confessional): "I'm soft, but softness cuts deeper than steel when the rumors hit."
Hani (to Nasra): "Your pain is a script. I can read it like a map. And it says betrayal."
Zahra (interrupting): "Rumors are just recycled tropes. Let me dismantle them before they trend."
Amal (pivoting): "Forget rumors. The real story? Lucky and Luul's alliance. That's the chaos you should fear."

⚡ Act II – The Clash
Scene: Dinner table confrontation.

Dialogue:
Zahra (Confessional): "Dinner tables are just stages. And I'm the satirical emcee."
Amal (at table): "You all think you're safe? I pivot once, and the whole room spins."
Nasra (tearful): "I didn't ask for this chaos. But maybe chaos asked for me."
Ayaan (Overlay voice): "Alliance fracture detected. Schema collapsing in real time."

🌌 Act III – The Legacy Reveal
Scene: Lucky enters late, styled in ombré couture.

Dialogue:
Lucky (standing): "You thought this was a show? It's an operating system. And I'm architecting the next disruption."
Amal (Confessional): "She doesn't walk in. She detonates."
Zahra (Confessional): "Weaponized humor meets weaponized legacy. Internet, brace yourself."

🔥 Closing Sequence
Scene: Luul lights the confessional fire.

Dialogue:
Luul (Confessional): "Legacy isn't inherited. It's ignited."
Zahra (Final Line): "We're not breaking the internet. We're rewriting it."

Cliffhanger: Cut to black. Viral cliffhanger music drop.`,
      },
      {
        title: "Chaos Console",
        episode_number: 5,
        synopsis: "Lucky unveils the chaos console as Amal weaponizes glam villain energy and Ayaan overlays schema collapse live. The console glitches—remix-Mayza voice enters.",
        script: `Cold Open: Lucky unveils chaos console.
Act I: Amal weaponizes glam villain energy.
Act II: Nasra soft‑power disrupts alliances.
Act III: Ayaan overlays schema collapse live.
Outro: Console glitches — remix‑Mayza voice enters.`,
      },
      {
        title: "Remix Archive",
        episode_number: 6,
        synopsis: "Zahra satirizes contracts as the cast realizes every fight is archived. Luul anchors legacy couture while Lucky reveals monetization logic.",
        script: `Cold Open: Zahra satirizes contracts.
Act I: Cast realizes every fight is archived.
Act II: Luul anchors legacy couture.
Act III: Lucky reveals monetization logic.
Outro: Archive exports live — audience sees remix engine.`,
      },
      {
        title: "Cinematic OS",
        episode_number: 7,
        synopsis: "Lucky detonates the final reveal. Amal tries to pivot the narrative and fails. Nasra's soft disruptor arc peaks. Zahra weaponizes humor one last time.",
        script: `Cold Open: Lucky detonates final reveal.
Act I: Amal tries to pivot narrative, fails.
Act II: Nasra soft disruptor arc peaks.
Act III: Zahra weaponizes humor one last time.
Outro: Cast declares — "We're rewriting the internet."`,
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
};