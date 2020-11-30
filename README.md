# MoveWithMe

I spent my thanksgiving week working on this passion project. I have always been curious about
how the video conferencing apps like Zoom and Facetime work, so I dug deep into WebRTC and its inner workings.
I learned quite a lot about P2P communication and how messy WebRTC really is behind-the-scenes :D

Fortunately, I discovered a couple libraries, peerjs and peer-server that abstract out the complexities behind
WebRTC and make it much easier for developers to write P2P applications - a video conferencing app like this one.

I also wanted to spice things up a little bit, because a plain video conferencing app would be boring...
I looked into tensorflow.js's very own pose detection library called PoseNet to detect poses of the participants, so the app can spit out a match-score in real-time that tells us how synchronized the participants' postures are.

# Note

The application isn't built for performance or with good security, because it's just a passion project.

# Inspiration

One day I woke up and wanted to write an app where I can have a personal trainer over a video chat helping me fix my posture.

Google's Move Mirror Project - https://medium.com/tensorflow/move-mirror-an-ai-experiment-with-pose-estimation-in-the-browser-using-tensorflow-js-2f7b769f9b23
