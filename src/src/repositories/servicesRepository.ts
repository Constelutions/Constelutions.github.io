import servicesData from "./services.json";

export interface ServiceFeature {
  title_i18n: string;
  title: string;
  desc_i18n: string;
  desc: string;
}

export type ServiceIconType = "code" | "uiux" | "integrations" | "consulting";

export interface Service {
  num: string;
  id: string;
  title_i18n: string;
  title: string;
  desc_i18n: string;
  desc: string;
  iconType?: ServiceIconType;
  features: ServiceFeature[];
}

const services = servicesData as Service[];

export async function getServices(): Promise<Service[]> {
  return services;
}

export async function getServiceById(id: string): Promise<Service | undefined> {
  return services.find((s) => s.id === id);
}
