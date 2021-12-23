import socket, json

buffer = {}

def process(address, source):
    d = json.loads(source)

    if d['type'] == 'start_applet':
        print('applet content', d['data'])
    elif d['type'] == 'start_activity':
        print('start activity', d['data'])
    elif d['type'] == 'restart_activity':
        print('restart activity', d['data'])
    elif d['type'] == 'resume_activity':
        print('resume activity', d['data'])
    elif d['type'] == 'set_response':
        print('set response', d['data'])
    elif d['type'] == 'finish_activity':
        print('finish activity', d['data'])

def readData(address, data):
    if address not in buffer:
        buffer[address] = ''

    buffer[address] += data.decode()

    index = buffer[address].find('$$$')

    if index >= 0:
        process(address, buffer[address][:index])
        buffer[address] = buffer[address][index+3:]

def startServer():
    # Create a socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Ensure that you can restart your server quickly when it terminates
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # Set the client socket's TCP "well-known port" number
    well_known_port = 8881
    sock.bind(('127.0.0.1', well_known_port))

    # Set the number of clients waiting for connection that can be queued
    sock.listen(5)

    # loop waiting for connections (terminate with Ctrl-C)
    try:
        while 1:
            print ('waiting for connection')

            newSocket, address = sock.accept()

            print ("Connected from", address)

            # loop serving the new client
            while 1:
                receivedData = newSocket.recv(1024)

                if not receivedData: break

                readData(address, receivedData)

            newSocket.close()

            print ( "Disconnected from", address )
    finally:
        sock.close()

startServer()
