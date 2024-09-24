// Добавление событий после загрузки контента
document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskTableBody = document.getElementById('taskTableBody');
    const apiUrl = 'https://localhost:44326/api/tasks'; // URL вашего API

    let tasks = [];

    // Чтение всех задач (GET запрос)
    function fetchTasks() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                tasks = data;
                renderTasks();
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    // Добавление новой задачи (POST запрос)
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskTitle = taskInput.value.trim();
        const taskDescription = taskDescriptionInput.value.trim();
        if (taskTitle === '') return;

        const newTask = {
            title: taskTitle,
            description: taskDescription,
            status: 'In process', // Устанавливаем статус по умолчанию
            createDate: new Date() // Устанавливаем текущую дату
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        })
        .then(response => response.json())
        .then(addedTask => {
            tasks.unshift(addedTask); // Добавляем задачу в начало списка
            taskInput.value = ''; // Очищаем поле ввода названия задачи
            taskDescriptionInput.value = ''; // Очищаем поле ввода описания
            renderTasks();
        })
        .catch(error => console.error('Error adding task:', error));
    });

    // Отображение всех задач в таблице
    function renderTasks() {
        taskTableBody.innerHTML = '';
        tasks.forEach((task) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${task.title}</td>
                <td>${task.description}</td>
                <td>${task.status}</td>
                <td>${new Date(task.createDate).toLocaleString()}</td>
                <td>${task.updateDate ? new Date(task.updateDate).toLocaleString() : 'Not updated'}</td>
                <td class="actions">
                    <button class="edit" data-id="${task.id}">Edit</button>
                    <button class="delete" data-id="${task.id}">Delete</button>
                </td>
            `;
            taskTableBody.appendChild(tr);
        });
        attachActionHandlers();
    }

    // Обработчики для редактирования и удаления задач
    function attachActionHandlers() {
        // Редактирование задачи (PUT запрос)
        document.querySelectorAll('.edit').forEach((button) => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.getAttribute('data-id');
                const task = tasks.find((t) => t.id === Number(taskId));
                const newTaskTitle = prompt('Edit task title:', task.title);

                if (newTaskTitle !== null) {
                    const updatedTask = {
                        ...task,
                        title: newTaskTitle
                        // Описание задачи оставляем неизменным
                    };

                    fetch(`${apiUrl}/${taskId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedTask)
                    })
                    .then(() => {
                        task.title = newTaskTitle;
                        renderTasks();
                    })
                    .catch(error => console.error('Error updating task:', error));
                }
            });
        });

        // Удаление задачи (DELETE запрос)
        document.querySelectorAll('.delete').forEach((button) => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.getAttribute('data-id');

                fetch(`${apiUrl}/${taskId}`, {
                    method: 'DELETE'
                })
                .then(() => {
                    tasks = tasks.filter((t) => t.id !== Number(taskId));
                    renderTasks();
                })
                .catch(error => console.error('Error deleting task:', error));
            });
        });
    }

    // Инициализация, получение задач
    fetchTasks();
});
