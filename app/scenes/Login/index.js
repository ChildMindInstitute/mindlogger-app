import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import {
  Container,
  Content,
  Text,
  View,
  Icon,
  Footer,
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import { SubmissionError } from 'redux-form';
import styles from './styles';
import { signInSuccessful } from '../../state/user/user.thunks';
import { signIn } from '../../services/network';
import LoginForm from './LoginForm';
import { skinSelector } from '../../state/app/app.selectors';

const logoImage = require('../../../img/CMI_white_logo.png');

class Login extends Component {
  onRegister = () => {
    Actions.sign_up();
  }

  onForgotPassword = () => {
    Actions.forgot_password();
  }

  onChangeStudy = () => {
    Actions.change_study();
  }

  onAbout = () => {
    Actions.about_app();
  }

  onSubmit = (body) => {
    const { signInSuccessful } = this.props;
    return signIn(body)
      .then((response) => {
        if (typeof response.exception !== 'undefined') {
          throw response.exception;
        } else {
          signInSuccessful(response);
        }
      })
      .catch((e) => {
        if (typeof e.status !== 'undefined') {
          throw new SubmissionError({
            password: 'Login failed.',
          });
        } else {
          throw new SubmissionError({
            password: 'Login failed.',
          });
        }
      });
  }

  render() {
    const { skin } = this.props;
    const title = skin ? skin.name : 'MindLogger';
    return (
      <Container>
        <StatusBar barStyle="light-content" />
        <Content style={[styles.container, { backgroundColor: skin.colors.primary }]}>
          <Text style={styles.header}>{title}</Text>
          <LoginForm onSubmit={this.onSubmit} />
          <View style={styles.bottomRow}>
            <TouchableOpacity onPress={this.onRegister}>
              <Text style={styles.whiteText}>New User</Text>
            </TouchableOpacity>
            <Text style={styles.whiteText}>{' or '}</Text>
            <TouchableOpacity onPress={this.onForgotPassword}>
              <Text style={styles.whiteText}>Forgot Password</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity onPress={this.onAbout}>
              <Text style={styles.whiteText}>{'What is ' + title + '?'}</Text>
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
        <Footer style={[styles.footer, { backgroundColor: skin.colors.primary}]}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={this.onChangeStudy}>
              <Icon type="FontAwesome" name="database" style={styles.whiteIcon} />
            </TouchableOpacity>
          </View>
        </Footer>
      </Container>
    );
  }
}

Login.propTypes = {
  signInSuccessful: PropTypes.func.isRequired,
  skin: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  skin: skinSelector(state),
});

const mapDispatchToProps = {
  signInSuccessful,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
