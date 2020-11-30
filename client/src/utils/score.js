import * as similarity from 'compute-cosine-similarity';

function vectorizePositions(pose) {
    return pose.keypoints
        .map((p) => [p.position.x, p.position.y])
        .reduce((a, acc) => [...a, ...acc]);
}

function cosineDistanceMatching(vector1, vector2) {
    let cosineSimliarity = similarity(vector1, vector2);
    let distance = 2 * (1 - cosineSimliarity);
    return Math.sqrt(distance);
}

function weightedDistanceMatching(poseVector1, poseVector2) {
    let vector1PoseXY = poseVector1.slice(0, 34);
    let vector1Confidences = poseVector1.slice(34, 51);
    let vector1ConfidenceSum = poseVector1.slice(51, 52);

    let vector2PoseXY = poseVector2.slice(0, 34);

    // First summation
    let summation1 = 1 / vector1ConfidenceSum;

    // Second summation
    let summation2 = 0;
    for (let i = 0; i < vector1PoseXY.length; i++) {
        let tempConf = Math.floor(i / 2);
        let tempSum = vector1Confidences[tempConf] * Math.abs(vector1PoseXY[i] - vector2PoseXY[i]);
        summation2 = summation2 + tempSum;
    }

    return summation1 * summation2;
}

export function scoreSimilarity(pose1, pose2) {
    let vector1 = vectorizePositions(pose1);
    let vector2 = vectorizePositions(pose2);
    return cosineDistanceMatching(vector1, vector2);
}
