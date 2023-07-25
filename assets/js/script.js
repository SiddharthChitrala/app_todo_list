const cardContainer = document.getElementById('card-container');
const tasks = [];
const dates = [];
const times = [];

const calendarBtn = document.getElementById('calendar-btn');
const calendarPickerContainer = document.getElementById('calendar-picker-container');
const calendarSaveBtn = document.getElementById('calendar-save-btn');

calendarBtn.addEventListener('click', function () {
    calendarPickerContainer.classList.toggle('d-none');
});

calendarSaveBtn.addEventListener('click', function () {
    const selectedDate = document.getElementById('calendar-picker').value;
    if (selectedDate !== '') {
        dates.push(selectedDate);
        calendarPickerContainer.classList.add('d-none');
        saveDataToLocalStorage();
    }
});

const notificationBtn = document.getElementById('notification-btn');
const timePickerContainer = document.getElementById('time-picker-container');
const saveBtn = document.getElementById('save-btn');

notificationBtn.addEventListener('click', function () {
    timePickerContainer.classList.toggle('d-none');
});

saveBtn.addEventListener('click', function () {
    const selectedTime = document.getElementById('time-picker').value;
    if (selectedTime !== '') {
        times.push(selectedTime);
        timePickerContainer.classList.add('d-none');
        saveDataToLocalStorage();
    }
});

const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');

taskInput.addEventListener('input', function () {
    if (taskInput.value.trim() !== '') {
        addBtn.style.display = 'inline-block';
    } else {
        addBtn.style.display = 'none';
    }
});

addBtn.addEventListener('click', function () {
    const task = taskInput.value.trim();
    if (task !== '') {
        tasks.push({ task: task, date: dates[dates.length - 1], time: times[times.length - 1], notified: false });
        const card = createCard(task, dates[dates.length - 1], times[times.length - 1]);
        cardContainer.appendChild(card);
        taskInput.value = '';
        addBtn.style.display = 'none';
        saveDataToLocalStorage();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    loadDataFromLocalStorage();
    checkDateTime();
    setInterval(checkDateTime, 1000);
});

function createCard(task, date, time) {
    const card = document.createElement('div');
    card.classList.add('card', 'col-md-4', 'my-3');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    card.style.marginRight = '10px';
    card.style.marginBottom = '10px';

    const taskTitle = document.createElement('h5');
    taskTitle.classList.add('card-title');
    taskTitle.textContent = task;

    const dateText = document.createElement('p');
    dateText.classList.add('card-text');
    dateText.textContent = 'Date: ' + date;

    const timeText = document.createElement('p');
    timeText.classList.add('card-text');
    timeText.textContent = 'Time: ' + time;

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action-container', 'd-flex', 'justify-content-between', 'align-items-center');

    const importantIcon = document.createElement('button');
    importantIcon.classList.add('btn', 'btn-link', 'important-icon');
    importantIcon.innerHTML = '<i class="far fa-star"></i>';
    let isImportant = false;

    importantIcon.addEventListener('click', function () {
        isImportant = !isImportant;
        card.classList.toggle('important');
        saveDataToLocalStorage();
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-outline', 'mt-3');
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';

    deleteBtn.addEventListener('click', function () {
        cardContainer.removeChild(card);
        const index = tasks.findIndex((item) => item.task === task);
        if (index !== -1) {
            tasks.splice(index, 1);
            dates.splice(index, 1);
            times.splice(index, 1);
        }
        saveDataToLocalStorage();
    });

    actionContainer.appendChild(importantIcon);
    actionContainer.appendChild(deleteBtn);

    cardBody.appendChild(taskTitle);
    cardBody.appendChild(dateText);
    cardBody.appendChild(timeText);
    cardBody.appendChild(actionContainer);
    card.appendChild(cardBody);

    return card;
}

function saveDataToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('selectedDates', JSON.stringify(dates));
    localStorage.setItem('selectedTimes', JSON.stringify(times));
}

function loadDataFromLocalStorage() {
    const savedTasks = localStorage.getItem('tasks');
    const savedDates = localStorage.getItem('selectedDates');
    const savedTimes = localStorage.getItem('selectedTimes');

    if (savedTasks && savedDates && savedTimes) {
        tasks.push(...JSON.parse(savedTasks));
        dates.push(...JSON.parse(savedDates));
        times.push(...JSON.parse(savedTimes));

        for (let i = 0; i < tasks.length; i++) {
            const card = createCard(tasks[i].task, dates[i], times[i]);
            cardContainer.appendChild(card);
        }
    }
}

function checkDateTime() {
    const currentDate = new Date();
    const notificationTimeFrame = 1; // Specify the time frame in minutes

    let hasUnexpiredTasks = false;

    for (let i = tasks.length - 1; i >= 0; i--) {
        const taskDate = new Date(tasks[i].date);
        const taskTime = tasks[i].time.split(':');
        const taskDateTime = new Date(
            taskDate.getFullYear(),
            taskDate.getMonth(),
            taskDate.getDate(),
            taskTime[0],
            taskTime[1]
        );

        if (
            currentDate.getTime() >= taskDateTime.getTime() &&
            currentDate.getTime() <= taskDateTime.getTime() + notificationTimeFrame * 60 * 1000
        ) {
            // Task is due within the specified time frame
            if (!tasks[i].notified) {
                tasks[i].notified = true;
                playNotificationSound();
            }
            hasUnexpiredTasks = true;
        }
    }

    // Check if all tasks have been completed
    if (!hasUnexpiredTasks) {
        stopNotificationSound();
    }
}

let audio; // Variable to store the notification audio
async function playNotificationSound() {
    try {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        audio = new Audio('assets/img/mp3.wav');
        await audio.play();
        alert('Task notification!');
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
}


function stopNotificationSound() {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
}
