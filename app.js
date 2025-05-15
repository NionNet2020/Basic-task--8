let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskList();
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (text) {
        tasks.push({ id: Date.now(), text, completed: false });
        input.value = '';
        saveTasks();
        showNotification('Новая задача', text);
    }
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
    }
}

function setFilter(filter) {
    currentFilter = filter;
    updateTaskList();
}

function updateTaskList() {
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
            <span>${task.text}</span>
        `;
        taskList.appendChild(li);
    });
}

function showNotification(title, body) {
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, { body, icon: '/icon.png' });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateTaskList();
    document.getElementById('enableNotifications').addEventListener('click', () => {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                checkReminders();
            }
        });
    });
    checkReminders();
});

function checkReminders() {
    const lastNotification = localStorage.getItem('lastNotification');
    const now = Date.now();
    if ((!lastNotification || now - lastNotification > 7200000) && tasks.some(t => !t.completed)) {
        showNotification('Напоминание', 'У вас есть невыполненные задачи!');
        localStorage.setItem('lastNotification', now.toString());
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('ServiceWorker зарегистрирован'))
            .catch(err => console.log('Ошибка:', err));
    });
}