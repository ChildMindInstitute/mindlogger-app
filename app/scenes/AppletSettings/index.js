import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import { Container, Header, Title, Button, Icon, Body, Right, Left, Content, Text, View } from 'native-base';
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
          <View style={{ padding: 10 }}>
            <Text style={{ margin: 20 }}>
              If you want to remove this applet, but keep your data, click below
            </Text>
            <Button rounded full danger style={{ borderRadius: 50 }} bordered>
              <Text style={{ fontWeight: 'bold' }}>Remove</Text>
            </Button>
          </View>

          <View style={{ padding: 10 }}>
            <Text style={{ margin: 20 }}>
              If you want to delete your data from this applet and remove it, click below.
            </Text>
            <Button rounded full danger style={{ borderRadius: 50 }}>
              <Text style={{ fontWeight: 'bold' }}>Remove and Delete Data</Text>
            </Button>
          </View>

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
