import React from 'react';

const PoseNetContext = React.createContext(null);

function usePoseNetContext() {
    const context = React.useContext(PoseNetContext);
    if (!context) {
        throw new Error(`usePoseNetContext must be used within a PoseNetProvider`);
    }
    return context;
}

function PoseNetProvider(props) {
    const [poses, setPoses] = React.useState({});
    const [posenetEnabled, setPosenetEnabled] = React.useState(false);

    const value = [poses, setPoses, posenetEnabled, setPosenetEnabled];
    return <PoseNetContext.Provider value={value} {...props} />;
}

export { PoseNetProvider, usePoseNetContext };
export default PoseNetContext;
