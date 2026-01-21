const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'todos.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialData = {
      todos: [],
      nextId: 1
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log('Created initial data file');
  }
}

// Read data from file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { todos: [], nextId: 1 };
  }
}

// Write data to file
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
    throw error;
  }
}

// GET all todos
app.get('/api/todos', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read todos' });
  }
});

// POST new todo
app.post('/api/todos', async (req, res) => {
  try {
    const data = await readData();
    const newTodo = {
      id: data.nextId,
      ...req.body,
      lastCleaned: null
    };
    
    data.todos.push(newTodo);
    data.nextId += 1;
    
    await writeData(data);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT update todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const data = await readData();
    const todoId = parseInt(req.params.id);
    const todoIndex = data.todos.findIndex(t => t.id === todoId);
    
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    data.todos[todoIndex] = {
      ...data.todos[todoIndex],
      ...req.body
    };
    
    await writeData(data);
    res.json(data.todos[todoIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const data = await readData();
    const todoId = parseInt(req.params.id);
    const initialLength = data.todos.length;
    
    data.todos = data.todos.filter(t => t.id !== todoId);
    
    if (data.todos.length === initialLength) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// PATCH mark as cleaned
app.patch('/api/todos/:id/clean', async (req, res) => {
  try {
    const data = await readData();
    const todoId = parseInt(req.params.id);
    const todoIndex = data.todos.findIndex(t => t.id === todoId);
    
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    data.todos[todoIndex].lastCleaned = new Date().toISOString();
    
    await writeData(data);
    res.json(data.todos[todoIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as cleaned' });
  }
});

// Start server
initializeDataFile().then(() => {
  app.listen(PORT, () => {
    console.log(`🏠 Czysty Dom API server running on http://localhost:${PORT}`);
    console.log(`📁 Data file: ${DATA_FILE}`);
  });
});
