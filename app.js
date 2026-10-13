const STORAGE_KEY = 'todo-local-storage-v1';

let tasks = loadTasks();
let currentFilter = 'all';

const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const clearCompletedButton = document.getElementById('clear-completed');
const itemsLeft = document.getElementById('items-left');
const filterButtons = document.querySelectorAll('.filter');

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: generateId(),
    text: trimmed,
    completed: false
  });

  saveTasks();
  render();
  taskInput.value = '';
  taskInput.focus();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
}

function updateTask(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) {
    return;
  }

  tasks = tasks.map((task) =>
    task.id === id ? { ...task, text: trimmed } : task
  );
  saveTasks();
  render();
}

function getFilteredTasks() {
  if (currentFilter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function startEditing(taskId, textElement) {
  const li = textElement.closest('.task');
  const currentText = textElement.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  input.className = 'edit-input';

  textElement.replaceWith(input);
  input.focus();
  input.select();

  const finish = (shouldSave) => {
    const value = input.value.trim();

    if (shouldSave && value) {
      updateTask(taskId, value);
    } else if (shouldSave && !value) {
      deleteTask(taskId);
    } else {
      render();
    }
  };

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      finish(true);
    }
    if (event.key === 'Escape') {
      finish(false);
    }
  });

  input.addEventListener('blur', () => finish(true));
}

function renderTask(task) {
  const li = document.createElement('li');
  li.className = `task${task.completed ? ' completed' : ''}`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `Mark task as ${task.completed ? 'incomplete' : 'complete'}`);
  checkbox.addEventListener('change', () => toggleTask(task.id));

  const text = document.createElement('span');
  text.className = 'task-text';
  text.textContent = task.text;

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'icon-btn';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => startEditing(task.id, text));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'icon-btn delete';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => deleteTask(task.id));

  actions.appendChild(editButton);
  actions.appendChild(deleteButton);

  li.appendChild(checkbox);
  li.appendChild(text);
  li.appendChild(actions);

  return li;
}

function render() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = '';

  if (filteredTasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No tasks here yet.';
    taskList.appendChild(empty);
  } else {
    filteredTasks.forEach((task) => {
      taskList.appendChild(renderTask(task));
    });
  }

  const remaining = tasks.filter((task) => !task.completed).length;
  itemsLeft.textContent = remaining;

  filterButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === currentFilter);
  });
}

addTaskButton.addEventListener('click', () => addTask(taskInput.value));

taskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTask(taskInput.value);
  }
});

clearCompletedButton.addEventListener('click', () => {
  clearCompletedTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

render();
