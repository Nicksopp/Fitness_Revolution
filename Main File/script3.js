let video;
let detector;
let isDetecting = false;
let counter = 0;
let stage = "down"; // Track the curl stage

async function setupCamera() {
    video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
    });
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadModel() {
    const model = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    return model;
}

function calculateAngle(a, b, c) {
    const angle = Math.abs(Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0])) * (180 / Math.PI);
    return angle > 180 ? 360 - angle : angle;
}

function isBicepCurl(landmarks) {
    const shoulder = landmarks[poseDetection.PoseLandmark.LEFT_SHOULDER];
    const elbow = landmarks[poseDetection.PoseLandmark.LEFT_ELBOW];
    const wrist = landmarks[poseDetection.PoseLandmark.LEFT_WRIST];

    const elbowAngle = calculateAngle(
        [shoulder.x, shoulder.y],
        [elbow.x, elbow.y],
        [wrist.x, wrist.y]
    );

    // Check the stage of the curl
    if (elbowAngle > 160 && stage === "up") {
        stage = "down"; // The curl is coming down
        counter++; // Increment the counter for a successful rep
        return true;
    } else if (elbowAngle < 30) {
        stage = "up"; // The curl is going up
    }
    return false;
}

async function detectPose() {
    if (isDetecting) {
        const poses = await detector.estimatePoses(video);
        drawResults(poses);
    }
    requestAnimationFrame(detectPose);
}

function drawResults(poses) {
    const outputCanvas = document.getElementById('output');
    const context = outputCanvas.getContext('2d');
    context.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    poses.forEach(pose => {
        pose.keypoints.forEach(keypoint => {
            if (keypoint.score > 0.5) {
                context.beginPath();
                context.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                context.fillStyle = 'yellow';
                context.fill();
            }
        });

        if (isBicepCurl(pose.keypoints)) {
            showResult(`Reps: ${counter}`);
        }
    });
}

function showResult(text) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = text;
}

async function startDetection() {
    isDetecting = true;
    detector = await loadModel();
    await setupCamera();
    video.play();
    detectPose();
}

function stopDetection() {
    isDetecting = false;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    counter = 0;
    stage = "down"; // Reset the stage
}

document.getElementById('startBtn').addEventListener('click', startDetection);
document.getElementById('stopBtn').addEventListener('click', stopDetection);
