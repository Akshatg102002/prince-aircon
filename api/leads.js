import supabase from './db-client.js';

const required = (value) => typeof value === 'string' && value.trim().length > 0;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('pa_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { name, phone, email, service, city, message, preferred_date, lead_type } = req.body || {};
      if (!required(name) || !required(phone) || !required(service) || !required(city)) {
        return res.status(400).json({ error: 'Name, phone, service and city are required.' });
      }
      const cleanPhone = String(phone).replace(/\s+/g, '');
      if (!/^[+0-9-]{8,15}$/.test(cleanPhone)) {
        return res.status(400).json({ error: 'Please enter a valid phone number.' });
      }
      const { data, error } = await supabase
        .from('pa_leads')
        .insert({
          name: name.trim(),
          phone: cleanPhone,
          email: email?.trim() || null,
          service: service.trim(),
          city: city.trim(),
          message: message?.trim() || null,
          preferred_date: preferred_date || null,
          lead_type: lead_type || 'service_booking',
          status: 'new',
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
