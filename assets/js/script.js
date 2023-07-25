const cardContainer = document.getElementById('card-container');
const tasks = [];
const dates = [];
const times = [];

// card that take the input for task , date and time

const calendarBtn = document.getElementById('calendar-btn');
const calendarPickerContainer = document.getElementById('calendar-picker-container');
const calendarSaveBtn = document.getElementById('calendar-save-btn');

// calendar input field and on click it will display and onclick it will hide

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

// date and time input field and on click it will display and onclick it will hide

notificationBtn.addEventListener('click', function () {
    timePickerContainer.classList.toggle('d-none');
});

// task input field and on enter any text it will display or else it is hidden

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

// after all this now adding all the inputs it will save to local db 

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

// now doc object model starts

document.addEventListener('DOMContentLoaded', function () {
    loadDataFromLocalStorage();
    checkDateTime();
    setInterval(checkDateTime, 1000);
});

// after adding it will create the new card

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

        // The splice() method is used to remove elements from an array and optionally replace them with new elements.

        if (index !== -1) {
            tasks.splice(index, 1);
            dates.splice(index, 1);
            times.splice(index, 1);
        }
         // Save the updated data to Local db
        saveDataToLocalStorage();
    });

    // it should insert an element node as a child node within another element

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

// retrieving data from the Local DB, parsing the data,
//  and using it to create and display cards for each task ..

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
// Function to check tasks notifications if needed

function checkDateTime() {
    const currentDate = new Date(); // Get the current date and time
    const notificationTimeFrame = 1; // Specific time frame in min

    let hasUnexpiredTasks = false;
    // Variable to indicate if any tasks have not expired within the specified notification time frame.

    // Loop through tasks in reverse order
    for (let i = tasks.length - 1; i >= 0; i--) {
        // Extract the date and time of the current task
        const taskDate = new Date(tasks[i].date);
        const taskTime = tasks[i].time.split(':');
        const taskDateTime = new Date(
            taskDate.getFullYear(), // year 
            taskDate.getMonth(), //  month 
            taskDate.getDate(), // day 
            taskTime[0], // hrs
            taskTime[1] // min
        );

        // Check if the current date and time in specified notification time frame
        if (
            currentDate.getTime() >= taskDateTime.getTime() && // If this condition is true, the task is expired
            currentDate.getTime() <= taskDateTime.getTime() + notificationTimeFrame * 60 * 1000
            // If this condition is true, the task should be notified
        ) {
            // Task is done within the specified time frame
            if (!tasks[i].notified) {
                // Check if the task has not been notified yet 
                tasks[i].notified = true; // marking the task as notified
                playNotificationSound(); // Trigger the notification sound for the task
            }
            hasUnexpiredTasks = true; // Set the flag to indicate there are unexpired tasks
        }
    }

    // Check if all tasks have been completed 
    if (!hasUnexpiredTasks) {
        stopNotificationSound(); // Stop sound after completed
    }
}


let audio; // var store notification audio
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

// to stop notification

function stopNotificationSound() {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
}
