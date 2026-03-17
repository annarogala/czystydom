import { setData } from '../lib/db.js';
import defaultTodoData from '../../shared/default-todos.cjs';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: `Method ${req.method} not allowed. Only POST is supported.` });
    return;
  }

  try {
    const exampleData = JSON.parse(JSON.stringify(defaultTodoData));

    await setData(exampleData);
    res.status(200).json(exampleData);
  } catch (error) {
    console.error('Error hard resetting todos:', error);
    res.status(500).json({ error: 'Failed to hard reset todos' });
  }
}
