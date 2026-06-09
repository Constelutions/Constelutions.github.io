import techStackData from "./techStack.json";

export interface TechCategory {
  category: string;
  category_i18n: string;
  items: string[];
}

const techStack = techStackData as TechCategory[];

export async function getTechStack(): Promise<TechCategory[]> {
  return techStack;
}
