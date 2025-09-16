// app.js

const video = document.getElementById('videoElement');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const counterElement = document.getElementById('counter');
const stageElement = document.getElementById('stage');

let net;
let counter = 0;
let stage = null;

// Define connections with specific color assignments
const connections = [
    { pair: [5, 7], color: 'rgba(245,117,66,1)' },  // Left Shoulder to Left Elbow
    { pair: [7, 9], color: 'rgba(245,117,66,1)' },  // Left Elbow to Left Wrist
    { pair: [6, 8], color: 'rgba(66,245,117,1)' },  // Right Shoulder to Right Elbow
    { pair: [8, 10], color: 'rgba(66,245,117,1)' }, // Right Elbow to Right Wrist
    { pair: [5, 6], color: 'rgba(117,66,245,1)' },  // Left Shoulder to Right Shoulder
    { pair: [5, 11], color: 'rgba(117,245,66,1)' }, // Left Shoulder to Left Hip
    { pair: [6, 12], color: 'rgba(117,245,66,1)' }, // Right Shoulder to Right Hip
    { pair: [11, 12], color: 'rgba(245,66,117,1)' },// Left Hip to Right Hip
    { pair: [11, 13], color: 'rgba(66,117,245,1)' },// Left Hip to Left Knee
    { pair: [13, 15], color: 'rgba(66,117,245,1)' },// Left Knee to Left Ankle
    { pair: [12, 14], color: 'rgba(245,117,66,1)' },// Right Hip to Right Knee
    { pair: [14, 16], color: 'rgba(245,117,66,1)' } // Right Knee to Right Ankle
];

// Function to draw a line between two keypoints
function drawLine(partA, partB, color = 'rgba(245,117,66,1)', lineWidth = 2) {
    ctx.beginPath();
    ctx.moveTo(partA.x, partA.y);
    ctx.lineTo(partB.x, partB.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

// Load the PoseNet model
async function loadPoseNet() {
    net = await posenet.load();
    console.log("PoseNet Loaded");
}

// Setup the webcam
async function setupCamera() {
    if (navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => { resolve(video); };
        });
    } else {
        alert('getUserMedia not supported in this browser.');
    }
}

// Calculate angle between three points
function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) { angle = 360 - angle; }
    return angle;
}

// Main function to run the detection
async function runDetection() {
    const pose = await net.estimateSinglePose(video, {
        flipHorizontal: false
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (pose.keypoints) {
        // Draw keypoints with special styling for elbows and knees
        pose.keypoints.forEach(point => {
            if (point.score > 0.5) {
                ctx.beginPath();
                // Highlight elbows and knees
                if (point.part === 'leftElbow' || point.part === 'rightElbow' ||
                    point.part === 'leftKnee' || point.part === 'rightKnee') {
                    ctx.arc(point.position.x, point.position.y, 8, 0, 2 * Math.PI);
                    ctx.fillStyle = 'blue';
                } else {
                    ctx.arc(point.position.x, point.position.y, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = 'red';
                }
                ctx.fill();
            }
        });

        // Draw connections between keypoints with specific colors
        connections.forEach(connection => {
            const [startIdx, endIdx] = connection.pair;
            const partA = pose.keypoints[startIdx];
            const partB = pose.keypoints[endIdx];
            
            // Only draw if both keypoints have a high confidence score
            if (partA.score > 0.5 && partB.score > 0.5) {
                drawLine(partA.position, partB.position, connection.color, 2);
            }
        });

        // Get necessary landmarks for angle calculation (Left Arm)
        const leftShoulder = pose.keypoints.find(k => k.part === 'leftShoulder').position;
        const leftElbow = pose.keypoints.find(k => k.part === 'leftElbow').position;
        const leftWrist = pose.keypoints.find(k => k.part === 'leftWrist').position;

        // Calculate angle
        const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(angle.toFixed(2), leftElbow.x + 10, leftElbow.y - 10);

        // Rep counter logic
        if (angle > 160) {
            stage = "down";
        }
        if (angle < 30 && stage === 'down') {
            stage = "up";
            counter += 1;
            counterElement.innerText = counter;
        }
        stageElement.innerText = stage || '-';
    }

    requestAnimationFrame(runDetection);
}

// Initialize the application
async function init() {
    await setupCamera();
    video.play();
    await loadPoseNet();
    runDetection();
}

init();
