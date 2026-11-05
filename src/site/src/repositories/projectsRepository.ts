import type { ImageMetadata } from "astro";
import projectsData from "./projects.json";

interface LiveProductData {
  url: string;
  cta_i18n: string;
  cta: string;
  image: string;
  imageAlt_i18n: string;
  imageAlt: string;
}

interface ProjectData {
  num: string;
  industry: string;
  industry_i18n: string;
  title_i18n: string;
  title: string;
  desc_i18n: string;
  desc: string;
  tags: string[];
  outcome_i18n: string;
  outcome: string;
  flip?: boolean;
  live?: LiveProductData;
}

export interface LiveProduct extends Omit<LiveProductData, "image"> {
  image: ImageMetadata;
}

export interface Project extends Omit<ProjectData, "live"> {
  live?: LiveProduct;
}

// Screenshots are imported through Vite so astro:assets can resize and
// re-encode them at build time; the JSON only names the file.
const screenshots = import.meta.glob<{ default: ImageMetadata }>("../assets/portfolio/*.webp", {
  eager: true,
});

function resolveScreenshot(fileName: string): ImageMetadata {
  const screenshot = screenshots[`../assets/portfolio/${fileName}`];
  if (!screenshot) {
    throw new Error(`Portfolio screenshot not found: src/assets/portfolio/${fileName}`);
  }
  return screenshot.default;
}

const projects: Project[] = (projectsData as ProjectData[]).map(({ live, ...project }) => ({
  ...project,
  ...(live && { live: { ...live, image: resolveScreenshot(live.image) } }),
}));

export async function getProjects(): Promise<Project[]> {
  return projects;
}
