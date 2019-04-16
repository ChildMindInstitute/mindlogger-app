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
import styles from './styles';
import { showToast, setApiHost, resetApiHost } from '../../state/app/app.actions';
import ChangeStudyForm from './ChangeStudyForm';
import { apiHostSelector } from '../../state/app/app.selectors';

class ChangeStudy extends Component {
  onSubmit = (body) => {
    const { showToast, setApiHost } = this.props;
    setApiHost(body.apiHost);
    showToast({
      text: 'Study has been changed.',
      position: 'top',
      type: 'success',
      duration: 2000,
    });
    Actions.replace('login');
  }

  onReset = () => {
    const { showToast, resetApiHost } = this.props;
    resetApiHost();
    showToast({
      text: 'Study has been reset.',
      position: 'top',
      type: 'success',
      duration: 2000,
    });
    Actions.replace('login');
  }

  render() {
    const { apiHost } = this.props;
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
