import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatusBar, Platform } from 'react-native';
import { connect } from 'react-redux';
import { Container, Button, View, Header, Left, Right, Icon, Body, Title } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { SubmissionError } from 'redux-form';
import i18n from 'i18next';
import { skinSelector } from '../../state/app/app.selectors';
import { signUpSuccessful } from '../../state/user/user.thunks';
import { signUp } from '../../services/network';
import styles from './styles';
import SignupForm from './SignupForm';
import { getPrivateKey } from '../../services/encryption';

const isIOS = Platform.OS === 'ios';
const IOSHeaderPadding = isIOS ? 9 : 0;
const IOSBodyPadding = isIOS ? 9 : 0;

class SignUp extends Component {
  onSubmit = (body) => {
    const { signUpSuccessful } = this.props;
    return signUp(body)
      .then((response) => {
        response.privateKey = getPrivateKey({
          userId: response._id,
          email: body.email,
          password: body.password,
        });
        response.email = body.email;

        signUpSuccessful(response);
      })
      .catch((e) => {
        throw new SubmissionError({
          _error: e.message,
          password: i18n.t('sign_up_form:error'),
        });
      });
  };

  render() {
    const { skin } = this.props;
    return (
      <Container>
        <StatusBar barStyle={isIOS ? "dark-content" : "light-content"} />
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
            <Title>{i18n.t('sign_up_form:new_user')}</Title>
          </Body>
          <Right />
        </Header>
        <View style={[styles.container2, { backgroundColor: skin.colors.primary }]}>
          <SignupForm onSubmit={this.onSubmit} primaryColor={skin.colors.primary} />
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SignUp);
