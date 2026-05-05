import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Configurar CORS básico por si acaso
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const payload = req.body;
    // Guardar el payload entero bajo la llave 'cauce_state'
    await kv.set('cauce_state', payload);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving to KV:', error);
    return res.status(500).json({ error: 'Failed to save data' });
  }
}
