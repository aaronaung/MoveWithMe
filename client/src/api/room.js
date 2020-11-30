const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:4000';

export const getRoomByID = async (roomID) => {
  const response = await fetch(`${API_ENDPOINT}/rooms/${roomID}`);
  const json = await response.json();
  return json;
};

export const createRoom = async (username) => {
  const response = await fetch(`${API_ENDPOINT}/rooms?username=${username}`, {
    method: 'POST',
    insecure: true,
  });

  const json = await response.json();
  return json;
};

export const joinRoom = async (roomID, username) => {
  const response = await fetch(`${API_ENDPOINT}/rooms/${roomID}/join?username=${username}`, {
    method: 'POST',
    agent: {
      rejectUnauthorized: false,
    },
  });

  const json = await response.json();
  return json;
};

export const leaveRoom = async (roomID, username) => {
  const response = await fetch(`${API_ENDPOINT}/rooms/${roomID}/leave?username=${username}`, {
    method: 'POST',
  });

  const json = await response.json();
  return json;
};
