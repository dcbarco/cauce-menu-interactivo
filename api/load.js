import { createClient } from 'redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const client = createClient({
      url: process.env.REDIS_URL
    });
    
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();

    const dataString = await client.get('cauce_state');
    await client.disconnect();

    if (!dataString) {
      return res.status(404).json({ error: 'No data found' });
    }
    
    const data = JSON.parse(dataString);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error loading from Redis:', error);
    return res.status(500).json({ error: 'Failed to load data' });
  }
}
