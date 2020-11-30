import {
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    makeStyles,
    MenuItem,
    Select,
    Switch,
    Typography,
} from '@material-ui/core';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { usePoseNetContext } from '../../contexts/PoseNetContext';
import { drawKeyPoints, drawSkeleton, determineSnapCanvasBounds } from '../../utils/draw';
import { poseSimilarity } from 'posenet-similarity';
import Lock from '@material-ui/icons/LockTwoTone';
import * as _ from 'lodash';

const POSENET_DETECTION_INTERVAL = 300;

const videoSize = {
    width: 580,
    height: 435,
};

const useStyles = makeStyles((theme) => ({
    canvas: {
        position: 'absolute',
        top: 55,
    },
    video: {
        borderRadius: 5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    videoBox: {
        display: 'flex',
        flexDirection: 'column',
    },
    nameTag: {
        position: 'relative',
        transform: 'translateY(100%)',
        width: 80,
        height: 30,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        background: '#fafafa',
        padding: '2px 10px',
        borderRadius: 3,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    formControl: {
        width: 170,
    },
    camOverlay: {
        boxSizing: 'border-box',
        border: 'grey solid 1px',
        borderStyle: 'dashed',
        background: '#fafafa',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        borderRadius: 5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        zIndex: 10,
    },
    controlBox: {
        width: videoSize.width,
        height: 75,
        background: '#e0e0e0',
        borderRadius: 5,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));

const Loading = ({ width, height, hidden }) => {
    const classes = useStyles();
    return (
        <div
            className={classes.camOverlay}
            style={{ width, height, display: hidden ? 'none' : 'flex' }}
        >
            <CircularProgress></CircularProgress>
        </div>
    );
};

export default function CamVideo({ srcObject, net, me, camOwner, peers, ...props }) {
    const refVideo = useRef(null);
    const refCanvas = useRef(null);
    const refSnapCanvas = useRef(null);

    const [poses, setPoses, posenetEnabled, setPosenetEnabled] = usePoseNetContext();
    const [partner, setPartner] = useState('');
    const [videoLoading, setVideoLoading] = useState(true);
    const [similarityScore, setSimilarityScore] = useState(0);

    const classes = useStyles();

    const handleOnVideoLoaded = () => {
        setVideoLoading(false);
        refVideo.current.play();
    };

    const runPosenet = useCallback(() => {
        return setInterval(async () => {
            if (refVideo && refVideo.current && refVideo.current.readyState === 4) {
                const video = refVideo.current;
                const pose = await net.estimateSinglePose(video);

                // Draw canvas
                if (refCanvas && refCanvas.current) {
                    const ctx = refCanvas.current.getContext('2d');
                    refCanvas.current.width = video.videoWidth;
                    refCanvas.current.height = video.videoHeight;

                    drawKeyPoints(pose['keypoints'], 0.5, 'green', 3, ctx);
                    drawSkeleton(pose['keypoints'], 0.5, 'red', 3, ctx);
                }

                // Draw snap canvas used for actual scoring and comparison
                if (refSnapCanvas && refSnapCanvas.current) {
                    // Attempt to crop user's body and draw on a snap canvas; by doing so we disregard where the user stands in the camera space,
                    // giving us a better accuracy when comparing the user's pose with one of their peers'.
                    const [startingX, startingY, endingX, endingY] = determineSnapCanvasBounds(
                        pose,
                        0.5
                    );

                    // This value is used to add padding when drawing the cropped body on the canvas so it captures more space around the user.
                    let padding = 75;

                    let sx = startingX - padding;
                    let sy = startingY - padding;
                    let drawWidth = endingX - startingX + 2 * padding;
                    let drawHeight = endingY - startingY + 2 * padding;

                    const snapCtx = refSnapCanvas.current.getContext('2d');
                    refSnapCanvas.current.width = drawWidth;
                    refSnapCanvas.current.height = drawHeight;

                    snapCtx.drawImage(
                        video,
                        sx,
                        sy,
                        drawWidth,
                        drawHeight,
                        0,
                        0,
                        drawWidth,
                        drawHeight
                    );
                    const snapPose = await net.estimateSinglePose(refSnapCanvas.current);
                    drawKeyPoints(snapPose['keypoints'], 0.5, 'green', 3, snapCtx);
                    drawSkeleton(snapPose['keypoints'], 0.5, 'red', 3, snapCtx);

                    setPoses((v) => {
                        return { ...v, [camOwner]: snapPose };
                    });
                }
            }
        }, POSENET_DETECTION_INTERVAL);
    }, [camOwner, net, setPoses]);

    useEffect(() => {
        if (partner && poses[partner] && poses[me]) {
            let weightedDistance = poseSimilarity(poses[partner], poses[me]);
            setSimilarityScore(weightedDistance);
        }
    }, [partner, poses, me]);

    useEffect(() => {
        if (!refVideo.current) {
            return;
        }
        refVideo.current.srcObject = srcObject;
    }, [srcObject]);

    useEffect(() => {
        let detectInterval = null;
        if (net) {
            if (posenetEnabled) {
                detectInterval = runPosenet();
            }
        }

        return () => {
            if (detectInterval) {
                clearInterval(detectInterval);
            }
            setPoses((v) => {
                let copy = _.cloneDeep(v);
                delete copy[camOwner];
                return copy;
            });
        };
    }, [camOwner, me, net, partner, posenetEnabled, runPosenet, setPoses]);

    const renderVideo = () => {
        return (
            <>
                <Loading
                    hidden={!videoLoading}
                    width={videoSize.width}
                    height={videoSize.height}
                ></Loading>
                <video
                    hidden={videoLoading}
                    ref={refVideo}
                    width={videoSize.width}
                    height={videoSize.height}
                    className={classes.video}
                    onLoadedMetadata={handleOnVideoLoaded}
                    {...props}
                />
            </>
        );
    };

    const renderMatchSelect = () => {
        if (camOwner === me && peers.length > 0 && posenetEnabled) {
            return (
                <Grid item xs={4}>
                    <FormControl className={classes.formControl} variant={'filled'}>
                        <InputLabel id="demo-simple-select-label">Match Pose With</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={partner}
                            onChange={(e) => {
                                setPartner(e.target.value);
                            }}
                        >
                            <MenuItem key={`none-menu`} value={''}>
                                None
                            </MenuItem>
                            {peers.map((peerID, i) => (
                                <MenuItem key={`${i}-menu`} value={peerID}>
                                    {peerID}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            );
        }
    };

    const renderScore = () => {
        if (camOwner === me && posenetEnabled && partner !== '') {
            // The score will "almost" never hit < 0.4 because you'll "almost" always match at least one keypoint out of the 17.
            // So we can normalize this behavior by regarding the similarity score of 0.4 as 0% match; keep in mind the lower
            // the similarity score the better, and the score you get is betwee [0,1] (0 being the best, and 1 being the worst)
            // If we write out the (x,y) progression, we get (0.4, 0%) (0.3, 25%) (0.2, 50%) (0.1, 75%) (0, 100%)
            // That gives us a linear equation of y = -250x + 100 where x is the similarity score and y is the percent match

            let percentage = -250 * similarityScore + 100;
            let color = '#5cb85c';
            if (percentage < 70) {
                color = '#f0ad4e';
            }
            if (percentage < 40) {
                color = '#d9534f';
            }
            if (percentage < 0) {
                percentage = 0;
            }
            return (
                <Grid item xs={3}>
                    <Typography variant={'overline'} style={{ fontSize: 15 }}>
                        <b style={{ color }}>{percentage.toFixed(3)}%</b>
                    </Typography>
                </Grid>
            );
        }
    };

    const renderSwitch = () => {
        if (camOwner === me) {
            return (
                <Grid item style={{ padding: 10 }} xs={5}>
                    <FormControlLabel
                        control={
                            <Switch
                                size="medium"
                                checked={posenetEnabled}
                                onChange={(e) => {
                                    setPosenetEnabled(e.target.checked);
                                }}
                            />
                        }
                        label={`${
                            posenetEnabled ? 'Pose Detection Enabled' : 'Pose Detection Disabled'
                        }`}
                        labelPlacement="end"
                    />
                </Grid>
            );
        }
    };

    const renderControlBox = () => {
        if (camOwner !== me) {
            return (
                <Grid container className={classes.controlBox}>
                    <Lock color={'disabled'} style={{ marginRight: 8 }}></Lock>
                    <Typography variant={'body1'} color={'textSecondary'}>
                        You can't access your peer's control box
                    </Typography>
                </Grid>
            );
        }
        return (
            <Grid container className={classes.controlBox}>
                {renderSwitch()}
                {renderMatchSelect()}
                {renderScore()}
            </Grid>
        );
    };
    return (
        <>
            <canvas hidden ref={refSnapCanvas}></canvas>
            <div className={classes.videoBox}>
                <canvas
                    hidden={!posenetEnabled}
                    className={classes.canvas}
                    ref={refCanvas}
                ></canvas>
                <div className={classes.nameTag}>
                    <Typography variant={'overline'}>{camOwner}</Typography>
                </div>

                {renderVideo()}
            </div>
            {renderControlBox()}
            {/* <img src={image1} ref={refImage} alt="what"></img> */}
        </>
    );
}
