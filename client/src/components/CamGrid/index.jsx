import React, { useEffect, useState, useMemo, useCallback } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';
import { withRouter, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import * as _ from 'lodash';
import CamVideo from '../CamVideo';
import * as posenet from '@tensorflow-models/posenet';
import { Grid, makeStyles } from '@material-ui/core';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { joinRoom } from '../../api/room';

const useStyles = makeStyles(() => ({
    gridItem: {
        display: 'flex',
        flexDirection: 'column',
        // height: '100vh',
        alignItems: 'center',
        // justifyContent: 'center',
    },
}));

export default withRouter(({ match, location }) => {
    const me = queryString.parse(location.search).name;
    const roomID = match.params.id;
    const classes = useStyles();
    const history = useHistory();

    const [net, setNet] = useState();
    const [videoStreams, setVideoStreams] = useState({});
    const [, setNotifications] = useNotificationContext();

    const peers = useMemo(() => ({}), []);
    const socket = useMemo(
        () => io(process.env.REACT_APP_API_ENDPOINT || 'http://localhost:4000'),
        []
    );

    const notify = useCallback(
        (msg) => {
            let d = new Date();
            setNotifications((prev) => {
                return [...prev, { dateTime: d.toLocaleString(), msg }];
            });
        },
        [setNotifications]
    );

    useEffect(() => {
        const loadPosenet = async () => {
            let n = await posenet.load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                inputResolution: { width: 640, height: 480 },
                multiplier: 0.75,
            });

            setNet(n);
        };

        loadPosenet();
    }, []);

    useEffect(() => {
        navigator.getUserMedia =
            navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        if (!navigator.getUserMedia) {
            alert('getUserMedia not supported');
        } else {
            navigator.getUserMedia(
                {
                    video: true,
                    audio: false,
                },
                (stream) => {
                    // add yourself to the videoStreams
                    setVideoStreams((v) => {
                        return { ...v, [me]: stream };
                    });

                    const peerOpts = {
                        host: process.env.REACT_APP_PEER_SERVER_HOST || 'localhost',
                    };
                    if (process.env.REACT_APP_PEER_SERVER_PORT !== undefined) {
                        peerOpts.port = process.env.REACT_APP_PEER_SERVER_PORT;
                    }
                    const peer = new Peer(me, peerOpts);

                    // when a user instantiate a peer, emit joinRoom event.
                    peer.on('open', (id) => {
                        notify(`Welcome to the room ${id}!`);
                        socket.emit('joinRoom', roomID, id);
                    });

                    // the socket server emits this event when someone (yourself not included) connects, call them right away with your video stream
                    socket.on('userConnected', (peerID) => {
                        notify(`${peerID} joined the room.`);
                        const peerConnection = peer.call(peerID, stream);

                        // when you call the newly joined user they're gonna respond with a stream so you should be ready to take care of that.
                        peerConnection.on('stream', (recipientVideoStream) => {
                            // addVideo(peerID, recipientVideoStream);
                            setVideoStreams((v) => {
                                return { ...v, [peerID]: recipientVideoStream };
                            });
                        });

                        // if the recipient hangs up/closes the connection (when the socket disconnects) then remove the video
                        peerConnection.on('close', () => {
                            notify(`${peerID} left the room.`);
                            setVideoStreams((v) => {
                                const copy = _.cloneDeep(v);
                                delete copy[peerID];
                                return copy;
                            });
                        });

                        // add the peer connection to the list of peers, so you can close the connection later when the peer disconnects
                        peers[peerID] = peerConnection;
                    });

                    peer.on('call', (call) => {
                        const callerID = call.peer;

                        // when someone calls you, answer with the stream
                        call.answer(stream);

                        // when the caller streams you video, add it to your list of videos
                        call.on('stream', (callerVideoStream) => {
                            // addVideo(callerID, callerVideoStream);
                            setVideoStreams((v) => {
                                return { ...v, [callerID]: callerVideoStream };
                            });
                        });

                        // if the caller hangs up/closes the connection (when the socket disconnects) then remove their video
                        call.on('close', () => {
                            notify(`${callerID} left the room.`);
                            setVideoStreams((v) => {
                                let copy = _.cloneDeep(v);
                                delete copy[callerID];
                                return copy;
                            });
                        });

                        // add the caller to the list of peers, so you can close the connection later when the caller disconnects
                        peers[callerID] = call;
                    });

                    // when a user disconnects, close the connection with that user
                    socket.on('userDisconnected', (disconnectedUserID) => {
                        console.log('user disconnected: ', disconnectedUserID);
                        if (peers[disconnectedUserID]) {
                            peers[disconnectedUserID].close();
                        }
                    });
                },
                (err) => {
                    alert('unable to stream media', err.message);
                    return;
                }
            );
        }
    }, [socket, peers, me, roomID, notify]);

    return (
        <Grid
            container
            spacing={3}
            style={{ paddingTop: 20, paddingLeft: 20, height: '100vh', overflow: 'scroll' }}
        >
            {Object.keys(videoStreams).map((user, i) => {
                return (
                    <Grid className={classes.gridItem} item xs={6} key={`${i}-grid-item`}>
                        <CamVideo
                            key={`${i}-vid`}
                            net={net}
                            me={me}
                            camOwner={user}
                            peers={Object.keys(videoStreams).filter((id) => id !== me)}
                            srcObject={videoStreams[user]}
                        />
                    </Grid>
                );
            })}
        </Grid>
    );
});
