import net from 'net';

let connections = [];
let currentSocket = null, currentApplet = null;

export const sendData = (type, data, appletId) => {
  if (currentApplet && appletId == currentApplet.id && currentSocket) {
    const string = JSON.stringify({
      type,
      data
    });

    currentSocket.write(string + '$$$');

    return true;
  }

  return false;
}

export const getConnection = (applet) => {
  return connections.find(conn => conn.accountId == applet.accountId);
}

export const createConnection = (host, port, applet) => {
  const conn = getConnection(applet);

  if (conn) {
    currentSocket = conn.socket;
    currentApplet = applet;
    sendData('start_applet', currentApplet, currentApplet.id);

    return Promise.resolve();
  }

  currentSocket = net.connect(port, host)

  return new Promise((resolve, reject) => {
    currentSocket.on('connect', () => {
      currentApplet = applet;
      sendData('start_applet', currentApplet, currentApplet.id);

      connections.push({
        socket: currentSocket,
        accountId: applet.accountId,
        port, host
      })

      resolve();
    })

    currentSocket.on('error', () => {
      reject();
    })
  })
}

export const closeConnection = () => {
  const index = connections.findIndex(conn => conn.socket == currentSocket);

  if (index >= 0) {
    connections.splice(index, 1);
  }

  if (currentSocket) {
    currentSocket.emit('close');
  }

  currentSocket = null;
}

export const addCloseListener = (fn) => {
  currentSocket.addListener('close', () => {
    currentSocket = null;
    fn();
  })
}
