import type { Hero, Mods, RaceId, RaceProfile } from "./types";

export const RACE_ORDER: RaceId[] = [
  "human",
  "aelf",
  "dwarf",
  "kithkin",
  "drakken",
  "ork",
  "vaelfling",
  "halar",
  "xenoark",
  "mechforged",
];

const HEROES: Hero[] = [
  {
    id: "marek",
    race: "human",
    name: "Captain Marek Voss",
    title: "Counter of bolts",
    blurb:
      "A levy officer who refused three retreats. He counts coin the way he counts bolts: nothing leaves the wall that did not earn its place.",
    bonus: "All kill-gold is worth 10% more.",
  },
  {
    id: "hale",
    race: "human",
    name: "Sister Hale of the Gate",
    title: "Chaplain of the nail-shrines",
    blurb:
      "She teaches that a life spent on the wall is a life the Hymn still owes. The first time a march breaks through each wave, she spends that debt instead of yours.",
    bonus: "The first leak of each march costs no lives.",
  },
  {
    id: "idris",
    race: "human",
    name: "Bannerman Idris Cole",
    title: "The unadorned flag",
    blurb:
      "Where his flag plants, human crews fire as if the next shift is watching. It is. He never decorates the cloth.",
    bonus: "Lineholds shoot 18% faster.",
  },
  {
    id: "lethariel",
    race: "aelf",
    name: "Lethariel of the Pale Current",
    title: "Shot ahead of the thought",
    blurb:
      "An aelf archer who looses where a body will be when the aether finishes deciding. The galleries under her feel longer than they are.",
    bonus: "Starlances reach 20% farther.",
  },
  {
    id: "yn",
    race: "aelf",
    name: "Scribe Yn Atheris",
    title: "Ledger of dead syllables",
    blurb:
      "Keeps the only intact book of Magikii fragments. Interest is paid in favors, which Yn accepts, reluctantly, as gold.",
    bonus: "Begin with 40 extra gold.",
  },
  {
    id: "saelith",
    race: "aelf",
    name: "Warden Saelith",
    title: "The second body",
    blurb:
      "Holds the high galleries. Her bolts pass through the first chest and go looking for another oath to break.",
    bonus: "Starlances pierce one more foe.",
  },
  {
    id: "brunna",
    race: "dwarf",
    name: "Thane Brunna Ironvein",
    title: "Wider mouths",
    blurb:
      "She widened the mortar mouths until the engineers wept and the enemy stopped arriving in polite groups.",
    bonus: "Anvil Mortars splash wider.",
  },
  {
    id: "dorrim",
    race: "dwarf",
    name: "Forge-Keeper Dorrim",
    title: "The mountain's book",
    blurb:
      "Prices every upgrade as if the stone is reading over his shoulder. The stone usually agrees with the discount.",
    bonus: "All upgrades cost 15% less.",
  },
  {
    id: "kessa",
    race: "dwarf",
    name: "Shieldmatron Kessa",
    title: "A door, a shield",
    blurb:
      "Once held a breach with a door, a shield, and other people's fear. The wall still counts her among its spare lives.",
    bonus: "The gate begins with 3 extra lives.",
  },
  {
    id: "nia",
    race: "kithkin",
    name: "Pounce-Captain Nia Whisk",
    title: "Before the order ends",
    blurb:
      "Trains whisker-posts to loose before her sentence finishes. Outsiders hear a buzz. The march hears a wall.",
    bonus: "Whisker Posts shoot 22% faster.",
  },
  {
    id: "jorr",
    race: "kithkin",
    name: "Night-Ear Jorr",
    title: "The shared rhythm",
    blurb:
      "Hears every crew on the wall and nags them until their shots share a pulse. He naps between complaints.",
    bonus: "Every crew shoots 6% faster.",
  },
  {
    id: "mewl",
    race: "kithkin",
    name: "Ribbon-Saint Mewl",
    title: "Not magic, manners",
    blurb:
      "A road-priest who blesses pouches. Kills under her ribbons come home with an extra coin. She insists this is etiquette.",
    bonus: "Whisker Post kills return 1 extra gold.",
  },
  {
    id: "veyr",
    race: "drakken",
    name: "Ash-Lord Veyr",
    title: "Stone that remembers",
    blurb:
      "Burns a line and keeps it burning until the masonry agrees. Anger is amateur. He writes in measured breath.",
    bonus: "Ember Roosts burn hotter and longer.",
  },
  {
    id: "ssarra",
    race: "drakken",
    name: "Brood-Sister Ssarra",
    title: "Cheap, ugly, standing",
    blurb:
      "Raises roosts fast and dares anyone to call them crude. The dare outlives most critics.",
    bonus: "Ember Roosts cost 20 less gold.",
  },
  {
    id: "rhaz",
    race: "drakken",
    name: "Sky-Captain Rhaz",
    title: "The updraft",
    blurb:
      "Teaches the young to exhale on the rising air, not on the insult. Reach improves. Pride is unconvinced, but quieter.",
    bonus: "Ember Roosts reach farther.",
  },
  {
    id: "grakka",
    race: "ork",
    name: "Boss Grakka",
    title: "One thing, until it learns",
    blurb:
      "Hits a single problem until it becomes a lesson for the rest of the road. Subtlety left years ago and did not write.",
    bonus: "Waaagh Pits hit 22% harder.",
  },
  {
    id: "mog",
    race: "ork",
    name: "Drum-Witch Mog",
    title: "Legs, reconsider",
    blurb:
      "Her drums do not inspire. They make the other side's knees late to their own march. She finds this funny.",
    bonus: "Waaagh Pit hits slow the march.",
  },
  {
    id: "urg",
    race: "ork",
    name: "Tusk-Marshal Urg",
    title: "The discount called fear",
    blurb:
      "Recruits pits cheap and calls the savings fear. The paymaster calls it a bargain and looks away.",
    bonus: "Waaagh Pits cost 12 less gold.",
  },
  {
    id: "cindrel",
    race: "vaelfling",
    name: "Brand-Prince Cindrel",
    title: "Fire with a clause",
    blurb:
      "Writes heat into a body so it keeps the appointment. The contract is short. The burn is not.",
    bonus: "Brand Spires burn harder.",
  },
  {
    id: "vess",
    race: "vaelfling",
    name: "Pact-Lawyer Vess",
    title: "The better clause",
    blurb:
      "Reads every sale, including the sale of a crew back to the wall, and always finds a line that pays you more.",
    bonus: "Selling a crew returns more gold.",
  },
  {
    id: "ilya",
    race: "vaelfling",
    name: "Horned Cantor Ilya",
    title: "The brand, sung farther",
    blurb:
      "Sings a brand past the distance it was drawn. The note is ugly. The reach is exact.",
    bonus: "Brand Spires reach farther.",
  },
  {
    id: "aurel",
    race: "halar",
    name: "King Aurel Hal",
    title: "One clean word",
    blurb:
      "A Lost King who still remembers a single Hymn Word without stumbling. In his presence the air is already half convinced, and the first speaking costs nothing.",
    bonus: "The first Hymn Word is free, and the word cools faster.",
  },
  {
    id: "cael",
    race: "halar",
    name: "Wing-Saint Cael",
    title: "Unhurry them",
    blurb:
      "She does not strike to kill first. She strikes so a march forgets why it was running. Her halo is warm enough to hold.",
    bonus: "Hymn Choirs slow the road harder.",
  },
  {
    id: "nyra",
    race: "halar",
    name: "Halo-Bearer Nyra",
    title: "A ring that is not hers",
    blurb:
      "Carries a second tangible halo. It is not her crown. It answers when she aims, which is more than most relics do.",
    bonus: "Hymn Choirs hit 25% harder.",
  },
  {
    id: "khess",
    race: "xenoark",
    name: "Brood-Mind Khess",
    title: "A nerve that learned",
    blurb:
      "A captured knot of the brood, named by the wall because the brood does not bother. Poison that passes through Khess remembers the next body.",
    bonus: "Brood Spires stack more poison.",
  },
  {
    id: "vorr",
    race: "xenoark",
    name: "Carapace-Queen Vorr",
    title: "Armor, declined",
    blurb:
      "The wall gave her a title so the crews would stand near the spire. Armor, to Vorr, is a suggestion already refused.",
    bonus: "Brood Spit ignores more armor.",
  },
  {
    id: "ix",
    race: "xenoark",
    name: "Silent Hunter Ix",
    title: "Between heartbeats",
    blurb:
      "Fires in the gap where a pulse should be. No one has heard Ix speak. The spires click as if something inside is counting.",
    bonus: "Brood Spires shoot faster.",
  },
  {
    id: "omn",
    race: "mechforged",
    name: "Relic-Heart OMN-1",
    title: "The oldest still parsing",
    blurb:
      "The oldest chassis that still answers. Its lens has opinions about armor, and the opinions are final.",
    bonus: "Relic Lenses hit 20% harder.",
  },
  {
    id: "lute",
    race: "mechforged",
    name: "Psalm-Engineer Lute",
    title: "Half priest, half wrench",
    blurb:
      "Retunes a dead Magikii syllable until a lens reaches past its old order. Lute hums while working. The machines do not.",
    bonus: "Relic Lenses reach farther.",
  },
  {
    id: "seraph",
    race: "mechforged",
    name: "Last Coil Seraph-9",
    title: "Already paid",
    blurb:
      "Spends herself on perfect intervals. Crews say the first costly improvement, standing near her, feels as if the mountain already settled the bill.",
    bonus: "Your first upgrade costs nothing.",
  },
];

export const RACES: RaceProfile[] = [
  {
    id: "human",
    name: "Humans",
    epithet: "The Gate-Sworn",
    lore: [
      "Short-lived and stubborn, humans keep the Hymnwall because somebody must do the dull work of holding a door. They do not hear aether cleanly. They write the watch, drill the bolts, and stand in the gap anyway.",
      "Their country is the River Marches under the wall. Their mark is a plain steel nail — the first fastener driven into the gate, still unornamented.",
    ],
    mark: "A plain steel nail.",
    heroes: HEROES.filter((h) => h.race === "human"),
  },
  {
    id: "aelf",
    name: "Aelves",
    epithet: "Aether-born",
    lore: [
      "Aelves are not wood-elves in a storybook. They condensed where the Hymn ran too hot: tall, pale, veins faintly lit, born already a half-step elsewhere. They remember the road as a sound, not a map.",
      "They garrison the high galleries and shoot along the pale current. Their mark is a thin lance of cooled starlight, light enough to balance on a finger, sharp enough to matter.",
    ],
    mark: "A lance of cooled starlight.",
    heroes: HEROES.filter((h) => h.race === "aelf"),
  },
  {
    id: "dwarf",
    name: "Dwarf",
    epithet: "The Anvil Kin",
    lore: [
      "The Dwarf live in the load-bearing stone under the Hymnwall. They distrust anything that flies, including hope. Their cannons are prayers with a fuse: short, loud, and meant for a crowd.",
      "They call the surface a draft. They still crew it, because a gate that falls becomes their ceiling. Their mark is a copper anvil-notch cut into the keystone.",
    ],
    mark: "A copper anvil-notch.",
    heroes: HEROES.filter((h) => h.race === "dwarf"),
  },
  {
    id: "kithkin",
    name: "Kithkin",
    epithet: "The Whiskered",
    lore: [
      "Kithkin are cat-people of the eaves, granaries, and night roads: quick hands, quicker pride, ears that hear a march before the dust stands up. Outsiders mistake the size. The small thing is the time between their shots.",
      "They nest in the wall's hollows and treat ribbons as serious regalia. Their mark is a sand-colored ribbon knotted through a whisker-ring.",
    ],
    mark: "A sand ribbon on a whisker-ring.",
    heroes: HEROES.filter((h) => h.race === "kithkin"),
  },
  {
    id: "drakken",
    name: "Drakken",
    epithet: "The Ash-Born",
    lore: [
      "Drakken are anthropomorphic dragons — scaled, horned, winged at the shoulder, too proud to crawl. They roost on broken towers and breathe in measured bursts. Fire is a craft. A tantrum is how amateurs write.",
      "They came to the wall when the sky-roads cooled. Their mark is a single ember scale, still warm, set in the roost lintel.",
    ],
    mark: "An ember scale.",
    heroes: HEROES.filter((h) => h.race === "drakken"),
  },
  {
    id: "ork",
    name: "Orks",
    epithet: "The Unsworn March",
    lore: [
      "Orks did not lose the Hymn. They got bored of it. They hit like a falling gate and laugh when the gate hits back. Some still take wall-contracts, because smashing things for pay is a kind of faith.",
      "The rest come up the road in the other direction, which the contracted Orks call a family argument. Their mark is a notched tusk-badge.",
    ],
    mark: "A notched tusk-badge.",
    heroes: HEROES.filter((h) => h.race === "ork"),
  },
  {
    id: "vaelfling",
    name: "Vaelfling",
    epithet: "The Brand-Born",
    lore: [
      "Vaelfling are devil-kin in the old tiefling sense: horns, tails, ember eyes, and a contract somewhere in the blood that nobody living signed. They are not from a pit under the wall. The pit is a rumor they charge rent on.",
      "Their working magic is brand and pact — heat with a clause. Their mark is a broken horn-ring, the crack filled with cooled red glass.",
    ],
    mark: "A broken horn-ring.",
    heroes: HEROES.filter((h) => h.race === "vaelfling"),
  },
  {
    id: "halar",
    name: "The Hal'ar",
    epithet: "The Lost Kings",
    lore: [
      "The Hal'ar are half-angel kings, not a choir of servants. Each is sovereign of a small, terrible kindness. Their halos are tangible metal, warm in the hand. Their aether wings are not born on them. Wings are earned, then summoned by speaking a Hymn Word — a name the Ages tried to unmake.",
      "Without the word, a Hal'ar walks. With it, they return as they were crowned. Most wings went silent when Magikii did. The peoples call them the Lost Kings. A few words remain, and the wall still knows how to spend them.",
    ],
    mark: "A tangible ring of halo-metal.",
    heroes: HEROES.filter((h) => h.race === "halar"),
  },
  {
    id: "xenoark",
    name: "Xenoarks",
    epithet: "The Unnamed Brood",
    lore: [
      "Xenoarks are not people in the way the wall means people. They are a hive-hunger in bodies: black glass carapace, inner mouths, acid that behaves like a thought. Travelers say xenomorph, then tyranid, then stop comparing. The brood does not keep either story.",
      "They follow biomass and the heat of the Hymn. A few nerve-knots have been broken into spires that spit venom outward. Nobody trusts them. The wall uses them anyway. Their mark, given by others, is a cracked inner jaw.",
    ],
    mark: "A cracked inner jaw.",
    heroes: HEROES.filter((h) => h.race === "xenoark"),
  },
  {
    id: "mechforged",
    name: "Mechforged",
    epithet: "The Word-Made",
    lore: [
      "Mechforged are robotic beings wound into motion by ancient Magikii and left running after the making-word was lost to the Ages. Plate, piston, and a quiet psalm where a soul would sit. They do not dream.",
      "They repeat the last order that still parses: hold the gate. Their lenses fire on schedules older than the peoples beside them. Their mark is a cold lens-slit, still lit.",
    ],
    mark: "A cold lens-slit.",
    heroes: HEROES.filter((h) => h.race === "mechforged"),
  },
];

export const HERO_BY_ID: Record<string, Hero> = Object.fromEntries(HEROES.map((h) => [h.id, h]));

export function raceById(id: RaceId): RaceProfile {
  return RACES.find((r) => r.id === id)!;
}

export function baseMods(): Mods {
  return {
    goldMul: 1,
    startGold: 0,
    lives: 0,
    firstLeakFree: false,
    allRate: 1,
    rate: {},
    range: {},
    dmg: {},
    costDelta: {},
    pierce: {},
    splash: {},
    armorPen: {},
    burnMul: 1,
    burnRace: null,
    burnDurMul: 1,
    poisonMul: 1,
    poisonMax: 3,
    slowOnRace: null,
    halarSlow: 0.62,
    upgradeMul: 1,
    sellMul: 0.6,
    hymnCdMul: 1,
    freeHymn: false,
    freeUpgrade: false,
    killGold: null,
  };
}

export function modsFor(heroId: string): Mods {
  const m = baseMods();
  switch (heroId) {
    case "marek":
      m.goldMul = 1.1;
      break;
    case "hale":
      m.firstLeakFree = true;
      break;
    case "idris":
      m.rate.human = 1.18;
      break;
    case "lethariel":
      m.range.aelf = 1.2;
      break;
    case "yn":
      m.startGold = 40;
      break;
    case "saelith":
      m.pierce.aelf = 1;
      break;
    case "brunna":
      m.splash.dwarf = 1.28;
      break;
    case "dorrim":
      m.upgradeMul = 0.85;
      break;
    case "kessa":
      m.lives = 3;
      break;
    case "nia":
      m.rate.kithkin = 1.22;
      break;
    case "jorr":
      m.allRate = 1.06;
      break;
    case "mewl":
      m.killGold = { race: "kithkin", extra: 1 };
      break;
    case "veyr":
      m.burnMul = 1.4;
      m.burnRace = "drakken";
      m.burnDurMul = 1.5;
      break;
    case "ssarra":
      m.costDelta.drakken = -20;
      break;
    case "rhaz":
      m.range.drakken = 1.18;
      break;
    case "grakka":
      m.dmg.ork = 1.22;
      break;
    case "mog":
      m.slowOnRace = { race: "ork", factor: 0.7 };
      break;
    case "urg":
      m.costDelta.ork = -12;
      break;
    case "cindrel":
      m.burnMul = 1.45;
      m.burnRace = "vaelfling";
      break;
    case "vess":
      m.sellMul = 0.78;
      break;
    case "ilya":
      m.range.vaelfling = 1.18;
      break;
    case "aurel":
      m.freeHymn = true;
      m.hymnCdMul = 0.7;
      break;
    case "cael":
      m.halarSlow = 0.48;
      break;
    case "nyra":
      m.dmg.halar = 1.25;
      break;
    case "khess":
      m.poisonMax = 5;
      m.poisonMul = 1.25;
      break;
    case "vorr":
      m.armorPen.xenoark = 6;
      break;
    case "ix":
      m.rate.xenoark = 1.25;
      break;
    case "omn":
      m.dmg.mechforged = 1.2;
      break;
    case "lute":
      m.range.mechforged = 1.16;
      break;
    case "seraph":
      m.freeUpgrade = true;
      break;
    default:
      break;
  }
  return m;
}
