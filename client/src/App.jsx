import React from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import { PoseNetProvider } from './contexts/PoseNetContext';
import Entry from './components/Entry';
import Main from './components/Main';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
    return (
        <PoseNetProvider>
            <NotificationProvider>
                <Router>
                    <Switch>
                        <Route path="/room/:id">
                            <Main></Main>
                        </Route>
                        <Route path="/">
                            <Entry />
                        </Route>
                    </Switch>
                    {/* <MyCam></MyCam> */}
                </Router>
            </NotificationProvider>
        </PoseNetProvider>
    );
}

export default App;
