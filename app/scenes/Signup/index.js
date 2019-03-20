import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatusBar } from 'react-native';
import { connect } from 'react-redux';
import {
  Container,
  Content,
  Button,
  Header,
  Left,
  Icon,
  Right,
  Body,
  Title,
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import { SubmissionError } from 'redux-form';
import { signUpSuccessful } from '../../state/user/user.actions';
import { signUp } from '../../services/network';
import styles from './styles';
import SignupForm from './SignupForm';

class SignUp extends Component { // eslint-disable-line
  onSubmit = (body) => {
    const { signUpSuccessful } = this.props;
    return signUp(body)
      .then(signUpSuccessful)
      .catch((e) => {
        throw new SubmissionError({
          _error: e.message,
        });
      });
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
            <Title>New User</Title>
          </Body>
          <Right />
        </Header>
        <Content style={styles.container2}>
          <SignupForm onSubmit={this.onSubmit} />
        </Content>
      </Container>
    );
  }
}

SignUp.propTypes = {
  signUpSuccessful: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  signUpSuccessful,
};

export default connect(null, mapDispatchToProps)(SignUp);
