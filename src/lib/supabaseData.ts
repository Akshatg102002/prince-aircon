import { supabase } from './supabaseClient';
import type { LeadInput, ReviewInput, SiteData } from './types';

// Direct Supabase equivalents of the /api/* serverless routes. These run in the
// browser using the anon/publishable key so the site works on static hosting.
// The api/ folder is kept intact for the Vercel deployment path.

// Mirrors GET /api/site-data (api/site-data.js).
export async function getSiteData(): Promise<SiteData> {
  const [services, gallery, reviews, posts, faqs, content] = await Promise.all([
    supabase.from('pa_services').select('*').order('sort_order', { ascending: true }),
    supabase.from('pa_gallery').select('*').order('sort_order', { ascending: true }),
    supabase.from('pa_reviews').select('*').order('created_at', { ascending: false }),
    supabase.from('pa_blog_posts').select('*').order('created_at', { ascending: false }),
    supabase.from('pa_faqs').select('*').order('sort_order', { ascending: true }),
    supabase.from('pa_site_content').select('*').order('sort_order', { ascending: true }),
  ]);

  const results = { services, gallery, reviews, posts, faqs, content };
  for (const [key, result] of Object.entries(results)) {
    if (result.error) throw new Error(`${key}: ${result.error.message}`);
  }

  return {
    services: services.data || [],
    gallery: gallery.data || [],
    reviews: reviews.data || [],
    posts: posts.data || [],
    faqs: faqs.data || [],
    content: content.data || [],
  };
}

// Mirrors POST /api/newsletter (api/newsletter.js).
export async function subscribeNewsletter(email: string): Promise<{ message: string }> {
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('Please enter a valid email address.');
  }
  const { error } = await supabase
    .from('pa_newsletter')
    .insert({ email: email.trim().toLowerCase() })
    .select()
    .single();
  // 23505 = unique violation => already subscribed (treated as success).
  if (error && error.code === '23505') return { message: 'Already subscribed.' };
  if (error) throw new Error(error.message);
  return { message: 'Subscribed successfully.' };
}

// Mirrors POST /api/leads (api/leads.js).
const required = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

export async function submitLead(payload: LeadInput): Promise<void> {
  const { name, phone, email, service, city, message, preferred_date, lead_type } = payload;
  if (!required(name) || !required(phone) || !required(service) || !required(city)) {
    throw new Error('Name, phone, service and city are required.');
  }
  const cleanPhone = String(phone).replace(/\s+/g, '');
  if (!/^[+0-9-]{8,15}$/.test(cleanPhone)) {
    throw new Error('Please enter a valid phone number.');
  }
  const { error } = await supabase.from('pa_leads').insert({
    name: name.trim(),
    phone: cleanPhone,
    email: email?.trim() || null,
    service: service.trim(),
    city: city.trim(),
    message: message?.trim() || null,
    preferred_date: preferred_date || null,
    lead_type: lead_type || 'service_booking',
    status: 'new',
  });
  if (error) throw new Error(error.message);
}

// Mirrors POST /api/reviews (api/reviews.js).
export async function submitReview(payload: ReviewInput): Promise<void> {
  const { name, location, rating, service, review_text } = payload;
  if (!name || !location || !service || !review_text || !rating) {
    throw new Error('All review fields are required.');
  }
  const numericRating = Number(rating);
  if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new Error('Rating must be between 1 and 5.');
  }
  const { error } = await supabase.from('pa_reviews').insert({
    name: String(name).trim(),
    location: String(location).trim(),
    rating: numericRating,
    service: String(service).trim(),
    review_text: String(review_text).trim(),
    before_after: null,
    is_featured: false,
  });
  if (error) throw new Error(error.message);
}
