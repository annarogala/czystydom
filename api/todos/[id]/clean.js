import { getTodos, setTodos } from '../../lib/db.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  const todoId = parseInt(id);

  if (!id || isNaN(todoId)) {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  if (req.method !== 'PATCH') {
    res.status(405).json({ error: `Method ${req.method} not allowed. Only PATCH is supported.` });
    return;
  }

  try {
    const todos = await getTodos();
    const todoIndex = todos.findIndex(t => t.id === todoId);

    if (todoIndex === -1) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    todos[todoIndex].lastCleaned = new Date().toISOString();
    await setTodos(todos);
    res.status(200).json(todos[todoIndex]);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
