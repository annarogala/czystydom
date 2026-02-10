import { getData, setData } from './lib/db.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // GET all todos
      const data = await getData();
      res.status(200).json(data);
      
    } else if (req.method === 'POST') {
      // POST new todo
      const data = await getData();
      
      const newTodo = {
        id: data.nextId,
        ...req.body,
        lastCleaned: null
      };
      
      data.todos.push(newTodo);
      data.nextId += 1;
      
      await setData(data);
      res.status(201).json(newTodo);
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
