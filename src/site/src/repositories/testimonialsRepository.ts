import testimonialsData from "./testimonials.json";

export interface Testimonial {
  quote_i18n: string;
  quote: string;
  name: string;
  role_i18n: string;
  role: string;
}

const testimonials = testimonialsData as Testimonial[];

export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonials;
}
