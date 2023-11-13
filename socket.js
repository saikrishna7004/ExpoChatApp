import io from 'socket.io-client';
import Config from './config';

const socket = io(Config.SOCKET_SERVER_URL);

export default socket;
