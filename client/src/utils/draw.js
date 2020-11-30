import * as posenet from '@tensorflow-models/posenet';

function toTuple({ x, y }) {
    return [x, y];
}

export function drawKeyPoints(
    keypoints,
    minConfidence,
    pointColor,
    pointRadius,
    canvasContext,
    scale = 1
) {
    keypoints.forEach((keypoint) => {
        if (keypoint.score >= minConfidence) {
            const { x, y } = keypoint.position;
            canvasContext.beginPath();
            canvasContext.arc(x * scale, y * scale, pointRadius, 0, 2 * Math.PI);
            canvasContext.fillStyle = pointColor;
            canvasContext.fill();
        }
    });
}

function drawSegment([firstX, firstY], [nextX, nextY], color, lineWidth, scale, canvasContext) {
    canvasContext.beginPath();
    canvasContext.moveTo(firstX * scale, firstY * scale);
    canvasContext.lineTo(nextX * scale, nextY * scale);
    canvasContext.lineWidth = lineWidth;
    canvasContext.strokeStyle = color;
    canvasContext.stroke();
}

export function drawSkeleton(keypoints, minConfidence, color, lineWidth, canvasContext, scale = 1) {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);

    adjacentKeyPoints.forEach((keypoints) => {
        drawSegment(
            toTuple(keypoints[0].position),
            toTuple(keypoints[1].position),
            color,
            lineWidth,
            scale,
            canvasContext
        );
    });
}

export function determineSnapCanvasBounds(pose, confidenceToleration) {
    // find the lowest & highest X and Y coordinates
    let lowest = { x: 640, y: 480 };
    let highest = { x: 0, y: 0 };

    for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        let confidence = pose.keypoints[i].score;

        if (confidence > confidenceToleration) {
            if (x < lowest.x) {
                lowest.x = x;
            }
            if (y < lowest.y) {
                lowest.y = y;
            }
            if (x > highest.x) {
                highest.x = x;
            }
            if (y > highest.y) {
                highest.y = y;
            }
        }
    }
    if (lowest.x < 0) {
        lowest.x = 0;
    }
    if (lowest.y < 0) {
        lowest.y = 0;
    }
    if (highest.x < 0) {
        highest.x = 0;
    }
    if (highest.x < 0) {
        highest.x = 0;
    }
    return [lowest.x, lowest.y, highest.x, highest.y];
}
