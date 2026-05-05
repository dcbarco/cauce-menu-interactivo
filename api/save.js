import { createClient } from 'redis';

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
    
    // Connect to standard Redis using REDIS_URL
    const client = createClient({
      url: process.env.REDIS_URL
    });
    
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();

    // Guardar el payload entero bajo la llave 'cauce_state'
    await client.set('cauce_state', JSON.stringify(payload));
    
    await client.disconnect();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving to Redis:', error);
    return res.status(500).json({ error: 'Failed to save data' });
  }
}
