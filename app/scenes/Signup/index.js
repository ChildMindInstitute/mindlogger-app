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
import { skinSelector } from '../../state/app/app.selectors';
import { signUpSuccessful } from '../../state/user/user.thunks';
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
    const { skin } = this.props;
    return (
      <Container>
        <StatusBar barStyle="light-content" />
        <Header style={{ backgroundColor: skin.colors.primary }}>
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
          <SignupForm onSubmit={this.onSubmit} primaryColor={skin.colors.primary} />
        </Content>
      </Container>
    );
  }
}

SignUp.propTypes = {
  signUpSuccessful: PropTypes.func.isRequired,
  skin: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  skin: skinSelector(state),
});

const mapDispatchToProps = {
  signUpSuccessful,
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
