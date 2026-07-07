import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const [services, gallery, reviews, posts, faqs, content] = await Promise.all([
      supabase.from('pa_services').select('*').order('sort_order', { ascending: true }),
      supabase.from('pa_gallery').select('*').order('sort_order', { ascending: true }),
      supabase.from('pa_reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('pa_blog_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('pa_faqs').select('*').order('sort_order', { ascending: true }),
      supabase.from('pa_site_content').select('*').order('sort_order', { ascending: true }),
    ]);

    const responses = { services, gallery, reviews, posts, faqs, content };
    for (const [key, result] of Object.entries(responses)) {
      if (result.error) throw new Error(`${key}: ${result.error.message}`);
    }

    return res.status(200).json({
      services: services.data || [],
      gallery: gallery.data || [],
      reviews: reviews.data || [],
      posts: posts.data || [],
      faqs: faqs.data || [],
      content: content.data || [],
    });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
