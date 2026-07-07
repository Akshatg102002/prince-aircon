// Shared data types for the Prince Aircon site. Extracted so both the React
// components and the Supabase data layer (src/lib/supabaseData.ts) can share
// the exact same shapes the /api/* routes used to return.

export type Service = {
  id: number;
  category: 'ac' | 'hvac';
  title: string;
  slug: string;
  description: string;
  benefits: string[];
  process: string[];
  faqs: { q: string; a: string }[];
  icon: string;
  sort_order: number;
  featured: boolean;
};

export type GalleryItem = {
  id: number;
  title: string;
  category: string;
  image_url: string;
  video_url: string | null;
  alt_text: string;
  location: string;
};

export type Review = {
  id: number;
  name: string;
  location: string;
  rating: number;
  service: string;
  review_text: string;
  before_after: string | null;
  is_featured: boolean;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string;
  author: string;
  read_time: string;
  created_at: string;
};

export type FAQ = { id: number; page: string; question: string; answer: string; sort_order: number };

export type SiteContent = {
  id: number;
  section: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  items: string[] | null;
  sort_order: number;
};

export type SiteData = {
  services: Service[];
  gallery: GalleryItem[];
  reviews: Review[];
  posts: BlogPost[];
  faqs: FAQ[];
  content: SiteContent[];
};

export type LeadFormState = {
  name: string;
  phone: string;
  email: string;
  service: string;
  city: string;
  preferred_date: string;
  message: string;
};

export type LeadInput = LeadFormState & { lead_type: string };

export type ReviewInput = {
  name: string;
  location: string;
  rating: string | number;
  service: string;
  review_text: string;
};
