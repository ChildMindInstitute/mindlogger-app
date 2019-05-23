import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatusBar } from 'react-native';
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
import { forgotPassword } from '../../services/network';
import { skinSelector } from '../../state/app/app.selectors';
import { showToast } from '../../state/app/app.thunks';
import ForgotPasswordForm from './ForgotPasswordForm';

class ForgotPassword extends Component {
  onSubmit = (body) => {
    const { showToast } = this.props;
    return forgotPassword(body.email)
      .then(() => {
        showToast({
          text: 'Reset email has been sent',
          position: 'top',
          type: 'success',
          duration: 2000,
        });
        Actions.replace('login');
      }).catch(() => {
        throw new SubmissionError({
          _error: 'That email does not exist in the system.',
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
            <Title>Forgot password</Title>
          </Body>
          <Right />
        </Header>
        <View style={[styles.container2, { backgroundColor: skin.colors.primary }]}>
          <ForgotPasswordForm onSubmit={this.onSubmit} primaryColor={skin.colors.primary} />
        </View>
      </Container>
    );
  }
}

ForgotPassword.propTypes = {
  showToast: PropTypes.func.isRequired,
  skin: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  skin: skinSelector(state),
});

const mapDispatchToProps = {
  showToast,
};

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
