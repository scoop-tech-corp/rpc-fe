import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// import configs from '@myapp/configs';

// declare global {
//   interface Window {
//     io: SocketIOClientStatic;
//     Echo: Echo;
//   }
// }

export function createSocketConnection() {
  if (!window.Echo) {
    const getToken = localStorage.getItem('serviceToken');
    window.Echo = new Echo({
      broadcaster: 'pusher',
      key: 'websocketkey',
      cluster: 'mt1',
      wsHost: '127.0.0.1', // Your domain
      wsPort: 6001, // Https port
      forceTLS: false,
      enabledTransports: ['ws', 'wss'], // <-- only use ws and wss as valid transports
      authEndpoint: 'http://localhost:8000/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${getToken}`
        }
      }
      // encrypted: true,
      // disableStats: true, // Change this to your liking this disables statistics
      // forceTLS: true,
      // enabledTransports: ['ws', 'wss'],
      // disabledTransports: ['sockjs', 'xhr_polling', 'xhr_streaming'] // Can be removed
    });
  }

  if (!window.Pusher) {
    window.Pusher = Pusher;
  }
}
