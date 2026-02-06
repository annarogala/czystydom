import { Redis } from '@upstash/redis';
import fs from 'fs/promises';
import path from 'path';

// Check if we're in production (Upstash) or development (file system)
const isProduction = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis only in production
const redis = isProduction ? Redis.fromEnv() : null;

const TODOS_KEY = 'czystydom:todos';
const NEXT_ID_KEY = 'czystydom:nextId';
const DATA_FILE = path.join(process.cwd(), 'server', 'todos.json');

// File system operations (for development)
async function readFromFile() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Initialize file if it doesn't exist
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
async function getData() {
  if (isProduction) {
    const todos = await redis.get(TODOS_KEY) || [];
    const nextId = await redis.get(NEXT_ID_KEY) || 1;
    return { todos, nextId };
  } else {
    return await readFromFile();
  }
}

async function setData(data) {
  if (isProduction) {
    await redis.set(TODOS_KEY, data.todos);
    await redis.set(NEXT_ID_KEY, data.nextId);
  } else {
    await writeToFile(data);
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
