import demosData from "./demos.json";

export interface Demo {
  num: string;
  title_i18n: string;
  title: string;
  desc_i18n: string;
  desc: string;
  type_i18n: string;
  type: string;
  tags: string[];
}

const demos = demosData as Demo[];

export async function getDemos(): Promise<Demo[]> {
  return demos;
}
