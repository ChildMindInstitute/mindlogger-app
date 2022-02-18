import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import { createConnection, closeConnection, addCloseListener, getConnection } from '../../services/socket';
import { Icon } from 'native-base';
import Modal from 'react-native-modal';
import { showToast } from '../../state/app/app.thunks';
import { setTCPConnectionHistory } from '../../state/app/app.actions';
import { tcpConnectionHistorySelector } from '../../state/app/app.selectors';
import { CheckBox } from 'react-native-elements';

const styles = StyleSheet.create({
  sectionHeading: {
    height: 20,
    width: '100%',
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
    color: rgb(64, 64, 64)
  },
  status: {
    marginLeft: 10,
    fontSize: 17,
  },
  configBtn: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: rgb(0, 128, 0),
    marginHorizontal: 1
  },
  modal: {
    borderRadius: 10,
    padding: 20,
    paddingBottom: 10,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'white'
  },
  textStyle: {
    fontSize: 20,
    color: rgb(16, 16, 16),
    marginBottom: 2
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: 'grey',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10
  },
  error: {
    color: rgb(128, 0, 0),
    fontSize: 18
  },
  checkbox: {
    backgroundColor: 'white',
    borderWidth: 0,
    marginLeft: 0,
    marginTop: 0,
    marginBottom: 0
  }
});

const LiveConnection = ({
  applet,
  showToast,
  connectionHistory,
  setTCPConnectionHistory
}) => {
  const history = connectionHistory && connectionHistory[applet.accountId] || { ip: '127.0.0.1', port: 8881 };

  const [visible, setVisible] = useState(false);
  const [ip, setIPAddress] = useState(history.ip);
  const [port, setPort] = useState(history.port.toString());
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const conn = getConnection(applet);

    if (conn && applet) {
      setPort(conn.port.toString());
      setIPAddress(conn.host);
      setStatus(true);
      createConnection(conn.host, conn.port, applet);
    }
  }, [])

  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.title}>Live Connection:</Text>
      <Text
        style={[
          styles.status,
          { color: !status ? 'grey' : 'green' }
        ]}
      >
        { status ? `${ip} (${port})` : 'not available'}
      </Text>

      <TouchableOpacity
        style={{ marginHorizontal: 20 }}
        onPress={() => setVisible(true)}
      >
        <Icon
          type="FontAwesome"
          name="edit"
          style={{
            color: 'rgb(0, 0, 64)',
            fontSize: 22,
            alignSelf: 'flex-end',
          }}
        />
      </TouchableOpacity>

      <Modal
        isVisible={visible}
        onBackdropPress={() => setVisible(false)}
        backdropOpacity={0.2}
      >
        <View style={styles.modal}>
          <Text
            style={[
              styles.textStyle,
              { fontWeight: 'bold', color: 'grey', textAlign: 'center', marginBottom: 20, alignItems: 'center' }
            ]}
          > Connect To Server { connecting && <ActivityIndicator /> || <></> }</Text>

          <Text
            style={styles.textStyle}
          >IP Address:</Text>

          <TextInput
            style={styles.input}
            onChangeText={setIPAddress}
            value={ip}
          />

          <Text
            style={styles.textStyle}
          >Port:</Text>

          <TextInput
            style={styles.input}
            onChangeText={setPort}
            value={port}
            keyboardType="numeric"
          />

            <CheckBox
              checked={remember}
              onPress={() => setRemember(!remember)}
              checkedIcon="check-square"
              uncheckedIcon="square-o"
              checkedColor={'grey'}
              uncheckedColor={'grey'}
              title={'Remember'}
              containerStyle={styles.checkbox}
            />

          {
            error && <Text style={styles.error}>{error}</Text> || <></>
          }

          <View style={styles.modalActions}>
            <Button
              title="Reset"
              onPress={() => {
                closeConnection();
                setStatus(false);
                setVisible(false)
              }}
            />

            <Button
              title="Submit"
              disabled={connecting}
              onPress={() => {
                setConnecting(true);

                createConnection(ip, Number(port), applet).then(() => {
                  if (remember) {
                    setTCPConnectionHistory({
                      ...connectionHistory,
                      [applet.accountId]: {
                        port: Number(port),
                        ip
                      }
                    })
                  }

                  setConnecting(false);
                  setError('')
                  setStatus(true)
                  setVisible(false)

                  addCloseListener(() => {
                    setStatus(false)

                    showToast({
                      text: 'tcp connection was closed',
                      position: 'bottom',
                      duration: 2000,
                    });
                  })
                }).catch(() => {
                  setConnecting(false);
                  setStatus(false)
                  setError('Connection failed. Please double check ip and port')
                })
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

LiveConnection.propTypes = {
  applet: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  connectionHistory: tcpConnectionHistorySelector(state),
});

const mapDispatchToProps = {
  showToast,
  setTCPConnectionHistory,
};

export default connect(mapStateToProps, mapDispatchToProps)(LiveConnection);
