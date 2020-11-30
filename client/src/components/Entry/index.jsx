import { Button, Grid, makeStyles, TextField, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createRoom, joinRoom } from '../../api/room';

const useStyles = makeStyles((theme) => ({
    line: {
        borderTop: '1px solid grey',
    },
    box: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        height: 300,
        border: '1px solid grey',
        borderRadius: 5,
        padding: 20,
        background: '#fbfbfb',
        overflow: 'scroll',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            height: 500,
            padding: 10,
        },
    },
    boxItem: {
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
        [theme.breakpoints.down('sm')]: {
            padding: 10,
        },
    },
    btn: {
        marginTop: 10,
        height: 40,
    },
    textField: {
        marginTop: 10,
    },
}));

export default function Entry(props) {
    const classes = useStyles();

    const [roomID, setRoomID] = useState();
    const [username, setUsername] = useState();
    const history = useHistory();

    const joinExistingRoom = async (e) => {
        e.preventDefault();
        try {
            let joinResp = await joinRoom(roomID, username);
            if (joinResp.error) {
                throw joinResp.error;
            }

            history.push(`/room/${roomID}?name=${username}`);
        } catch (err) {
            alert(err);
        }
    };

    const createNewRoom = async (e) => {
        e.preventDefault();
        try {
            let resp = await createRoom(username);
            if (resp.error) {
                throw resp.error;
            }

            history.push(`/room/${resp.id}?name=${username}`);
        } catch (err) {
            alert(err);
        }
    };

    return (
        <Grid container spacing={3} className={classes.box}>
            <Grid className={classes.boxItem} item xs={12}>
                <TextField
                    id="name"
                    required={true}
                    className={classes.textField}
                    onChange={(e) => setUsername(e.target.value)}
                    label="Name"
                    variant="outlined"
                />
            </Grid>
            <Grid className={classes.boxItem} item xs={6}>
                <Typography variant={'overline'}>Join a room</Typography>

                <TextField
                    id="roomID"
                    required={true}
                    className={classes.textField}
                    onChange={(e) => setRoomID(e.target.value)}
                    label="Room ID"
                    variant="outlined"
                />
                <Button
                    variant={'outlined'}
                    fullWidth
                    color={'primary'}
                    onClick={joinExistingRoom}
                    className={classes.btn}
                >
                    Join
                </Button>
            </Grid>
            <Grid className={classes.boxItem} item xs={6}>
                <Typography variant={'overline'}>Don't have a room?</Typography>

                <Button
                    variant={'outlined'}
                    fullWidth
                    color={'primary'}
                    onClick={createNewRoom}
                    className={classes.btn}
                >
                    Create Room
                </Button>
            </Grid>
        </Grid>
    );
}
