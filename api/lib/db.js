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
export async function getData() {
  if (isProduction) {
    const todos = await redis.get(TODOS_KEY) || [];
    const nextId = await redis.get(NEXT_ID_KEY) || 1;
    return { todos, nextId };
  } else {
    return await readFromFile();
  }
}

export async function setData(data) {
  if (isProduction) {
    await redis.set(TODOS_KEY, data.todos);
    await redis.set(NEXT_ID_KEY, data.nextId);
  } else {
    await writeToFile(data);
  }
}

export async function getTodos() {
  if (isProduction) {
    return await redis.get(TODOS_KEY) || [];
  } else {
    const data = await readFromFile();
    return data.todos;
  }
}

export async function setTodos(todos) {
  if (isProduction) {
    await redis.set(TODOS_KEY, todos);
  } else {
    const data = await readFromFile();
    data.todos = todos;
    await writeToFile(data);
  }
}
