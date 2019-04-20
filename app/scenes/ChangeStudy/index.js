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
import ChangeStudyForm from './ChangeStudyForm';
import { showToast, setApiHost, resetApiHost } from '../../state/app/app.actions';
import { apiHostSelector } from '../../state/app/app.selectors';
import styles from './styles';


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
          </View>
        </Container>
      );
    }
  }
}

ChangeStudy.propTypes = {
  showToast: PropTypes.func.isRequired,
  resetApiHost: PropTypes.func.isRequired,
  setApiHost: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  apiHost: apiHostSelector(state),
});

const mapDispatchToProps = {
  showToast,
  setApiHost,
  resetApiHost,
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangeStudy);
