import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Button,
  View,
  Header,
  Left,
  Right,
  Icon,
  Body,
  Text,
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import QRCodeScanner from 'react-native-qrcode-scanner';
import styles from './styles';
import { setApiHost, resetApiHost, setSkin } from '../../state/app/app.actions';
import { apiHostSelector, skinSelector } from '../../state/app/app.selectors';
import { showToast } from '../../state/app/app.thunks';
import ChangeStudyForm from './ChangeStudyForm';
import skins from '../../skins';

class ChangeStudy extends Component {
  constructor (props) {
     super(props);
     this.state = {
       scanOpen: false,
     }
  }

  onSubmit = (body) => {
    const { showToast, setApiHost } = this.props;
    Actions.replace('login');
    showToast({
      text: 'Study successfully changed.',
      position: 'top',
      type: 'success',
      duration: 2000,
    });
    setApiHost(body.apiHost);
  }

  onReset = () => {
    const { showToast, resetApiHost } = this.props;
    Actions.replace('login');
    showToast({
      text: 'Study successfully reset.',
      position: 'top',
      type: 'success',
      duration: 2000,
    });
    resetApiHost();
    setSkin(skins.defaultSkin);
  }

  onScan = (body) => {
    const { showToast, setApiHost } = this.props;
    Actions.replace('login');
    showToast({
      text: 'Study has been set by QR.',
      position: 'top',
      type: 'success',
      duration: 4000,
    });
    setApiHost(body.data);
  }

  toggleQrScanner = () => {
    this.setState({scanOpen: !this.state.scanOpen})
  }

  render() {
    const { apiHost } = this.props;

    const header = (
      <Header>
        <Left>
          <Button transparent onPress={() => Actions.pop()}>
            <Icon name="close" />
          </Button>
        </Left>
        <Right>
          <Button transparent block onPress={this.toggleQrScanner}>
            <Text style={styles.text}>{this.state.scanOpen ? "Enter URL Manually" : "Scan QR" }</Text>
          </Button>
        </Right>
      </Header>
    );


    if (this.state.scanOpen) {
      return  (
        <Container style={styles.container}>
          { header }
          <QRCodeScanner
            fadeIn={true}
            onRead={this.onScan}
            showMarker={true}
          />
        </Container>
      );
    } else {
      return (
        <Container style={styles.container}>
          { header }
          <View style={styles.formContainer}>
            <ChangeStudyForm
              onSubmit={this.onSubmit}
              onReset={this.onReset}
              initialValues={{ apiHost }}
            />
            <Button style={styles.button} block onPress={this.toggleSkin} >
              <Text style={styles.buttonText}>Skin</Text>
            </Button>
          </View>
        </Container>
      );
    }
  }
}

ChangeStudy.propTypes = {
  apiHost: PropTypes.string.isRequired,
  showToast: PropTypes.func.isRequired,
  resetApiHost: PropTypes.func.isRequired,
  setApiHost: PropTypes.func.isRequired,
  setSkin: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  apiHost: apiHostSelector(state),
});

const mapDispatchToProps = {
  showToast,
  setApiHost,
  resetApiHost,
  setSkin,
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangeStudy);
