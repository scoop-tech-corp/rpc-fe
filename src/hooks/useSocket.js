import { useEffect } from 'react';

import { createSocketConnection } from 'service/service-socket';

function listen(callBack, channel, event, openId, userId, listUser) {
  window.Echo.channel(channel).listen(event, (payload) => {
    callBack({ ...payload, openId: openId, userId, listUser });
  });

  return function cleanUp() {
    window.Echo.leaveChannel(`${channel}`);
  };
}

function listenLogin(callBack) {
  const channel = Echo.join('presence.online.1');

  channel
    .here((users) => {
      callBack(users, 'HERE');
      console.log('userHere');
    })
    .joining((user) => {
      callBack(user, 'JOINING');
      console.log('userJoining');
    })
    .leaving((user) => {
      callBack(user, 'LEAVING');
      console.log('userLeaving');
    });
}

let socketCreated = false;

function createSocketConnectionOnce() {
  if (!socketCreated) {
    createSocketConnection();
    socketCreated = true;
  }
}

export const useSocket = ({ type, callBack, userId }) => {
  useEffect(() => {
    createSocketConnectionOnce();
    let cleanUpFunction;

    switch (type) {
      case 'CHAT': {
        cleanUpFunction = listen(callBack, `private-chat.${userId}`, 'SendMessage');
        break;
      }
      case 'READ': {
        cleanUpFunction = listen(callBack, `private-read.${userId}`, 'ReadMessage');
        break;
      }
      case 'USER_LOGIN': {
        cleanUpFunction = listenLogin(callBack);
        break;
      }

      // Add cases for other types if necessary
    }

    return cleanUpFunction;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Add an empty dependency array to ensure this effect runs only once
};
