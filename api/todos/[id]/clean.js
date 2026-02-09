import { Redis } from '@upstash/redis';
import fs from 'fs/promises';
import path from 'path';

// Check if we're in production (Upstash) or development (file system)
const isProduction = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis only in production
const redis = isProduction ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
}) : null;

const TODOS_KEY = 'czystydom:todos';
const DATA_FILE = path.join(process.cwd(), 'server', 'todos.json');

// File system operations (for development)
async function readFromFile() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    const initialData = { todos: [], nextId: 1 };
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
}

async function writeToFile(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Unified data operations
async function getTodos() {
  if (isProduction) {
    return await redis.get(TODOS_KEY) || [];
  } else {
    const data = await readFromFile();
    return data.todos;
  }
}

async function setTodos(todos) {
  if (isProduction) {
    await redis.set(TODOS_KEY, todos);
  } else {
    const data = await readFromFile();
    data.todos = todos;
    await writeToFile(data);
  }
}

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
