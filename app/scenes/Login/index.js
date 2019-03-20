import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Image } from 'react-native';
import { connect } from 'react-redux';
import {
  Container,
  Content,
  Text,
  View,
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import { SubmissionError } from 'redux-form';
import styles from './styles';
import { signInSuccessful } from '../../state/user/user.actions';
import { signIn } from '../../services/network';
import LoginForm from './LoginForm';

const logoImage = require('../../../img/CMI_white_logo.png');

class Login extends Component {
  onRegister = () => {
    Actions.sign_up();
  }

  onForgotPassword = () => {
    Actions.forgot_password();
  }

  onAbout = () => {
    Actions.about_app();
  }

  onSubmit = (body) => {
    const { signInSuccessful } = this.props;
    return signIn(body)
      .then(signInSuccessful)
      .catch(() => {
        throw new SubmissionError({
          _error: 'The username or password you entered is incorrect.',
        });
      });
  }

  render() {
    return (
      <Container>
        <Content style={styles.container}>
          <Text style={styles.header}>
            Mindlogger
          </Text>
          <LoginForm onSubmit={this.onSubmit} />
          <View style={styles.bottomRow}>
            <TouchableOpacity onPress={this.onRegister}>
              <Text style={styles.whiteText}>New user</Text>
            </TouchableOpacity>
            <Text style={{ ...styles.whiteText, marginLeft: 3, marginRight: 3 }}>or</Text>
            <TouchableOpacity onPress={this.onForgotPassword}>
              <Text style={styles.whiteText}>forgot password</Text>
            </TouchableOpacity>
            <Text style={styles.whiteText}>?</Text>
          </View>
          <View>
            <TouchableOpacity onPress={this.onAbout}>
              <Text style={styles.whiteText}>What is Mindlogger?</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 26 }}>
            <Image
              square
              style={styles.logo}
              source={logoImage}
            />
          </View>
        </Content>
      </Container>
    );
  }
}

Login.propTypes = {
  signInSuccessful: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  signInSuccessful,
};

export default connect(null, mapDispatchToProps)(Login);
