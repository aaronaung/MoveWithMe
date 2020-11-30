import { makeStyles } from '@material-ui/core';
import React from 'react';
import CamGrid from '../CamGrid';
import NotifPanel from '../NotifPanel';

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
    },
}));

export default function Main() {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <CamGrid></CamGrid>
            <NotifPanel></NotifPanel>
        </div>
    );
}
