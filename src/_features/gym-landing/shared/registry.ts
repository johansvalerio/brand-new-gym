import type { ComponentType } from "react";
import { Hero5 as GymUlateHero } from "../gym-ulate/components/Hero5";
import { StoryText2 as GymUlateStory } from "../gym-ulate/components/StoryText2";
import FanDeckCards2 from "../gym-ulate/components/FanDeckCards2";
import { DifferencesSection as GymUlateDifferences } from "../gym-ulate/components/DifferencesSection";
import { Gallery as GymUlateGallery } from "../gym-ulate/components/Gallery";
import { CoachesSection as GymUlateCoaches } from "../gym-ulate/components/CoachesSection";
import { MembershipSection as GymUlateMembership } from "../gym-ulate/components/MembershipSection";
import { FaqSection as GymUlateFaq } from "../gym-ulate/components/FaqSection";
import { LocationHours as GymUlateLocation } from "../gym-ulate/components/LocationHours";
import { FinalCTA as GymUlateFinalCta } from "../gym-ulate/components/FinalCTA";
import { Footer as GymUlateFooter } from "../gym-ulate/components/Footer";
import { gymUlateSite } from "../gym-ulate/site";
import { zonaFitSite } from "../zona-fit/site";
import { isaacCastroSite } from "../isaac-castro/site";
import { ZonaFitHero } from "../zona-fit/components/Hero";
import { ZonaFitStory } from "../zona-fit/components/Story";
import { IsaacCastroHero } from "../isaac-castro/components/Hero";
import { IsaacCastroStory } from "../isaac-castro/components/Story";
import type { SiteConfig } from "./site";

export interface LandingSections {
  hero: ComponentType;
  story: ComponentType;
  fanDeck: ComponentType;
  differences: ComponentType;
  gallery: ComponentType;
  coaches: ComponentType;
  membership: ComponentType;
  faq: ComponentType;
  location: ComponentType;
  finalCta: ComponentType;
  footer: ComponentType;
}

/** Template base: gym-ulate. Todo slug sin override cae aquí por sección. */
const baseSections: LandingSections = {
  hero: GymUlateHero,
  story: GymUlateStory,
  fanDeck: FanDeckCards2,
  differences: GymUlateDifferences,
  gallery: GymUlateGallery,
  coaches: GymUlateCoaches,
  membership: GymUlateMembership,
  faq: GymUlateFaq,
  location: GymUlateLocation,
  finalCta: GymUlateFinalCta,
  footer: GymUlateFooter,
};

interface LandingEntry {
  site: SiteConfig;
  overrides: Partial<LandingSections>;
}

const landings: Record<string, LandingEntry> = {
  "gym-ulate": { site: gymUlateSite, overrides: {} },
  "zona-fit": { site: zonaFitSite, overrides: { hero: ZonaFitHero, story: ZonaFitStory } },
  "isaac-castro": { site: isaacCastroSite, overrides: { hero: IsaacCastroHero, story: IsaacCastroStory } },
};

/** Resuelve la landing del slug con fallback por sección al template base. */
export function getLanding(slug: string): { site: SiteConfig; sections: LandingSections } {
  const entry = landings[slug] ?? landings["gym-ulate"];
  return { site: entry.site, sections: { ...baseSections, ...entry.overrides } };
}
