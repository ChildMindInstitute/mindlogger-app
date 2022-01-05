import net from 'net';

let socket = null, currentApplet = null;

export const sendData = (type, data, appletId) => {
  if (currentApplet && appletId == currentApplet.id && socket) {
    const string = JSON.stringify({
      type,
      data
    });

    socket.write(string + '$$$');

    return true;
  }

  return false;
}

export const createConnection = (host, port, applet) => {
  socket = net.connect(port, host)

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      currentApplet = applet;
      sendData('start_applet', currentApplet, currentApplet.id);
      resolve();
    })

    socket.on('error', () => {
      reject();
    })
  })
}

export const closeConnection = () => {
  if (socket) {
    socket.emit('close');
  }

  socket = null;
}

export const addCloseListner = (fn) => {
  socket.addListener('close', () => {
    socket = null;
    fn();
  })
}
