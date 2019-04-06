import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatusBar, AsyncStorage } from 'react-native';
import { connect } from 'react-redux';
import {
  Container,
  Button,
  View,
  Header,
  Left,
  Right,
  Icon,
  Title,
  Body,
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import { SubmissionError } from 'redux-form';
import styles from './styles';
import { showToast } from '../../state/app/app.actions';
import ChangeStudyForm from './ChangeStudyForm';
import config from '../../config';

class ChangeStudy extends Component {

  storeApiHost = async (newApiHost) => {
    try {
      await AsyncStorage.setItem('apiHost', newApiHost);
    } catch (error) {
      console.log(error.message);
    }
  };

  onSubmit = (body) => {
    global.apiHost = body.apiHost;
    this.storeApiHost(body.apiHost);
    const { showToast } = this.props;
    showToast({
      text: 'Study has been changed.',
      position: 'top',
      type: 'success',
      duration: 2000,
    });
    Actions.replace('login');
  }

  onReset = () => {
    global.apiHost = config.defaultApiHost;
    this.storeApiHost(config.defaultApiHost)
    const { showToast } = this.props;
    showToast({
      text: 'Study has been reset.',
      position: 'top',
      type: 'success',
      duration: 2000,
    });
    Actions.replace('login');
  }

  render() {
    return (
      <Container>
        <StatusBar barStyle="light-content" />
        <Header>
          <Left>
            <Button transparent onPress={() => Actions.pop()}>
              <Icon name="close" />
            </Button>
          </Left>
          <Body>
            <Title>Change Study</Title>
          </Body>
          <Right />
        </Header>
        <View style={styles.container2}>
          <ChangeStudyForm onSubmit={this.onSubmit} onReset={this.onReset} />
        </View>
      </Container>
    );
  }
}

ChangeStudy.propTypes = {
  showToast: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  showToast,
};

export default connect(null, mapDispatchToProps)(ChangeStudy);
