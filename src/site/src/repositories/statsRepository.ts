import statsData from "./stats.json";

export interface Stat {
  value: string;
  suffix?: string | boolean;
  label_i18n: string;
  label: string;
}

const stats = statsData as Stat[];

export async function getStats(): Promise<Stat[]> {
  return stats;
}
