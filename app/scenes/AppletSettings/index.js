import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import { Container, Header, Title, Button, Icon, Body, Right, Left, Content, Text } from 'native-base';
import { skinSelector, currentAppletSelector } from '../../state/app/app.selectors';


// eslint-disable-next-line
class AppletSettings extends Component {
  render() {
    const { skin, applet } = this.props;
    console.log('applet is', applet);
    return (
      <Container>
        <Header style={{ backgroundColor: skin.colors.primary }}>
          <Left>
            <Button transparent onPress={Actions.pop}>
              <Icon
                ios="ios-arrow-back"
                android="md-arrow-back"
              />
            </Button>
          </Left>
          <Body>
            <Title>Settings</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <Text>
            {applet.id}
          </Text>
        </Content>
      </Container>
    );
  }
}

AppletSettings.propTypes = {
  skin: PropTypes.object.isRequired,
  applet: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  skin: skinSelector(state),
  applet: currentAppletSelector(state),
});

export default connect(mapStateToProps)(AppletSettings);
