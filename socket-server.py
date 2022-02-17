import socket, json
import threading

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
    elif d['type'] == 'live_event':
        print('live response', d['data'])

def readData(address, data):
    if address not in buffer:
        buffer[address] = ''

    buffer[address] += data.decode()

    index = buffer[address].find('$$$')

    if index >= 0:
        process(address, buffer[address][:index])
        buffer[address] = buffer[address][index+3:]

def serveClient(socket, address):
    while 1:
        receivedData = socket.recv(1024)

        if not receivedData: break

        readData(address, receivedData)

    socket.close()

    print ( "Disconnected from", address)

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

    print ('waiting for connection')

    # loop waiting for connections (terminate with Ctrl-C)
    try:
        while 1:
            newSocket, address = sock.accept()
            thread = threading.Thread(
                target=serveClient,
                kwargs={
                    'socket': newSocket,
                    'address': address
                }
            )
            print ("Connected from", address)
            thread.start()
    finally:
        sock.close()

startServer()
