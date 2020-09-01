import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatusBar, Platform } from 'react-native';
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
  Title,
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import { SubmissionError } from 'redux-form';
import { skinSelector } from '../../state/app/app.selectors';
import { signUpSuccessful } from '../../state/user/user.thunks';
import { signUp } from '../../services/network';
import styles from './styles';
import SignupForm from './SignupForm';
import { getPrivateKey } from '../../services/encryption'

const IOSHeaderPadding = Platform.OS === 'ios' ? '3.5%' : 0;
const IOSBodyPadding = Platform.OS === 'ios' ? 9 : 0;

class SignUp extends Component {
  onSubmit = (body) => {
    const { signUpSuccessful } = this.props;
    return signUp(body)
      .then(response => {
        response.privateKey = getPrivateKey({ userId: response._id, email: body.email, password: body.password });
        signUpSuccessful(response);
      })
      .catch((e) => {
        throw new SubmissionError({
          _error: e.message,
          password: 'Sign up failed: username may already be in use.',
        });
      });
  }

  render() {
    const { skin } = this.props;
    return (
      <Container>
        <StatusBar barStyle="light-content" />
        <Header
          style={{
            backgroundColor: skin.colors.primary,
            paddingTop: IOSHeaderPadding,
          }}
        >
          <Left>
            <Button transparent onPress={() => Actions.pop()}>
              <Icon name="close" />
            </Button>
          </Left>
          <Body style={{ paddingTop: IOSBodyPadding }}>
            <Title>New User</Title>
          </Body>
          <Right />
        </Header>
        <View
          style={[
            styles.container2,
            { backgroundColor: skin.colors.primary },
          ]}
        >
          <SignupForm
            onSubmit={this.onSubmit}
            primaryColor={skin.colors.primary}
          />
        </View>
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
