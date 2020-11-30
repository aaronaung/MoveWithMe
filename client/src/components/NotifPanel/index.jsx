import { Chip, makeStyles, Typography } from '@material-ui/core';
import CopyIcon from '@material-ui/icons/Assignment';
import React from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { withRouter } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    panel: {
        height: '100vh',
        width: 250,
        background: '#efefef',
        zIndex: 100,
        overflow: 'hidden',
    },

    panelItem: {
        paddingLeft: 20,
        paddingTop: 10,
        marginBottom: 15,
    },
}));

export default withRouter(({ match }) => {
    const roomID = match.params.id;
    const classes = useStyles();
    const [notifications] = useNotificationContext();

    const handleCopyClipboard = () => {
        const text = document.createElement('textarea');
        text.value = roomID;
        document.body.appendChild(text);
        text.select();
        document.execCommand('copy');
        document.body.removeChild(text);
    };

    return (
        <div className={classes.panel}>
            <Chip
                icon={<CopyIcon />}
                style={{ padding: 5, margin: 15, textOverflow: 'ellipsis' }}
                label={'Click to copy room ID'}
                onClick={handleCopyClipboard}
            />

            {notifications.map((notif, i) => {
                return (
                    <div className={classes.panelItem}>
                        <Typography
                            color="textSecondary"
                            variant="caption"
                            style={{ display: 'inline-block' }}
                        >
                            {notif.dateTime}
                        </Typography>
                        <br />
                        <Typography
                            style={{ display: 'inline-block', lineHeight: 2, color: '#2b2d2f' }}
                            variant="subtitle2"
                        >
                            {notif.msg}
                        </Typography>

                        {/* <hr style={{ border: 'none' }}></hr> */}
                    </div>
                );
            })}
        </div>
    );
});
