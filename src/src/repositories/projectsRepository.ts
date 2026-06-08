import projectsData from "./projects.json";

export interface Project {
  num: string;
  industry: string;
  industry_i18n: string;
  title_i18n: string;
  title: string;
  desc_i18n: string;
  desc: string;
  tags: string[];
  tags_i18n: string;
  outcome_i18n: string;
  outcome: string;
  flip?: boolean;
}

const projects = projectsData as Project[];

export async function getProjects(): Promise<Project[]> {
  return projects;
}
