import React from 'react';

const NotificationContext = React.createContext(null);

function useNotificationContext() {
    const context = React.useContext(NotificationContext);
    if (!context) {
        throw new Error(`useNotificationContext must be used within a NotificationProvider`);
    }
    return context;
}

function NotificationProvider(props) {
    const [notifications, setNotifications] = React.useState([]);

    const value = [notifications, setNotifications];
    return <NotificationContext.Provider value={value} {...props} />;
}

export { NotificationProvider, useNotificationContext };
export default NotificationContext;
