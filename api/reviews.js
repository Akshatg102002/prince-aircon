import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('pa_reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { name, location, rating, service, review_text } = req.body || {};
      if (!name || !location || !service || !review_text || !rating) {
        return res.status(400).json({ error: 'All review fields are required.' });
      }
      const numericRating = Number(rating);
      if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
      }
      const { data, error } = await supabase
        .from('pa_reviews')
        .insert({
          name: String(name).trim(),
          location: String(location).trim(),
          rating: numericRating,
          service: String(service).trim(),
          review_text: String(review_text).trim(),
          before_after: null,
          is_featured: false,
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
