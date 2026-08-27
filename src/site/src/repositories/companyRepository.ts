import companyData from "./company.json";

export interface ContactInfo {
  email: string;
  phone: string;
  phoneHref: string;
  location: string;
  location_i18n: string;
  hours: string;
  hours_i18n: string;
  linkedin: string;
  github: string;
}

export interface StaffMember {
  name: string;
  role: string;
  role_i18n: string;
}

export interface Company {
  contact: ContactInfo;
  staff: StaffMember[];
}

const company = companyData as Company;

export async function getContact(): Promise<ContactInfo> {
  return company.contact;
}

export async function getStaff(): Promise<StaffMember[]> {
  return company.staff;
}
