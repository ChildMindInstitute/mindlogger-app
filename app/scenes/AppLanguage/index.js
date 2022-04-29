import React from 'react';
import {
  Container,
  Header,
  Content,
  List,
  ListItem,
  Text,
  Title,
  Icon,
  Button,
  Left,
  Right,
  Body,
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import { Platform } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from 'i18next';
import RNRestart from 'react-native-restart';
import { setLanguage } from '../../state/app/app.actions';
import { skinSelector, mobileDataAllowedSelector } from '../../state/app/app.selectors';
import { userInfoSelector } from '../../state/user/user.selectors';
import { setApplicationLanguage } from '../../i18n/i18n';

const IOSHeaderPadding = Platform.OS === 'ios' ? 24 : 0;
const IOSBodyPadding = Platform.OS === 'ios' ? 9 : 0;

// eslint-disable-next-line
class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.onPressTime = 0;
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.appLanguage !== this.props.appLanguage) {
      Actions.splash();
      setTimeout(() => {
        RNRestart.Restart();
      }, 1000);
    }
  };

  renderLanguageItem = language => (
    <List>
      <ListItem
        button
        bordered
        onPress={() => {
          this.props.setAppLanguage(language);
          setApplicationLanguage(language);
        }}
        style={this.props.appLanguage === language ? { backgroundColor: '#7ff7ff' } : {}}
      >
        <Left>
          <Text>{i18n.t(`language_screen:${language}`)}</Text>
        </Left>
        <Right>
          <Icon name="arrow-forward" />
        </Right>
      </ListItem>
    </List>
  );

  render() {
    const { skin } = this.props;

    return (
      <Container>
        <Header
          style={{
            backgroundColor: skin.colors.primary,
            paddingTop: IOSHeaderPadding,
          }}
        >
          <Left>
            <Button transparent onPress={Actions.pop}>
              <Icon ios="ios-arrow-back" android="md-arrow-back" />
            </Button>
          </Left>
          <Body style={{ paddingTop: IOSBodyPadding }}>
            <Title>{i18n.t('language_screen:app_language')}</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          {this.renderLanguageItem('en')}
          {this.renderLanguageItem('fr')}
        </Content>
      </Container>
    );
  }
}

SettingsScreen.propTypes = {
  skin: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  skin: skinSelector(state),
  mobileDataAllowed: mobileDataAllowedSelector(state),
  userInfo: userInfoSelector(state),
  appLanguage: state.app.appLanguage,
});

const mapDispatchToProps = dispatch => ({
  setAppLanguage: lng => dispatch(setLanguage(lng)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsScreen);
