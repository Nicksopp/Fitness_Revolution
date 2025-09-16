let interval;
let timerInterval;
let totalTime = 0;

const circle1 = document.getElementById('circle1');
const circle2 = document.getElementById('circle2');
const breathInstruction = document.getElementById('breathInstruction');
const timerDisplay = document.getElementById('timerDisplay');

const audioInstructions = document.getElementById('audioInstructions');
const audioHold = document.getElementById('audioHold');
const audioExhale = document.getElementById('audioExhale');

document.getElementById('startButton').addEventListener('click', startBreathing);
document.getElementById('stopButton').addEventListener('click', stopBreathing);

function startBreathing() {
    clearInterval(interval);
    totalTime = 0;
    timerDisplay.textContent = totalTime;
    breatheInOut();
    timerInterval = setInterval(() => {
        totalTime++;
        timerDisplay.textContent = totalTime;
    }, 1000);
}

function stopBreathing() {
    clearInterval(interval);
    clearInterval(timerInterval);
    breathInstruction.textContent = "Exercise Stopped";
    resetCircles();
    displayResults();
}

function breatheInOut() {
    const inhaleDuration = document.getElementById('inhaleDuration').value * 1000;
    const holdDuration = document.getElementById('holdDuration').value * 1000;
    const exhaleDuration = document.getElementById('exhaleDuration').value * 1000;

    // Play inhale audio
    audioInstructions.play();
    breathInstruction.textContent = "Breathe In...";
    circle1.style.width = '200px';
    circle1.style.height = '200px';
    circle2.style.width = '200px';
    circle2.style.height = '200px';

    setTimeout(() => {
        breathInstruction.textContent = "Hold...";
        audioHold.play(); // Play hold audio
    }, inhaleDuration);

    setTimeout(() => {
        breathInstruction.textContent = "Breathe Out...";
        audioExhale.play(); // Play exhale audio
        resetCircles();
    }, inhaleDuration + holdDuration);

    // Repeat breathing exercise
    interval = setTimeout(breatheInOut, inhaleDuration + holdDuration + exhaleDuration);
}

function resetCircles() {
    circle1.style.width = '100px';
    circle1.style.height = '100px';
    circle2.style.width = '100px';
    circle2.style.height = '100px';
}

function displayResults() {
    let resultMessage = "";
    if (totalTime <= 10) {
        resultMessage = "Very Poor Performance: Try to relax and focus on your breathing.";
    } else if (totalTime <= 20) {
        resultMessage = "Excellent Performance: You're doing well! Keep it up!";
    } else {
        resultMessage = "Outstanding Performance: You're a pro at this!";
    }
    breathInstruction.textContent = resultMessage; // Display the result message
}
