import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform } from 'react-native';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Container, Header, Title, Button, Icon, Body, Right, Left, Content, Text, View } from 'native-base';
import { skinSelector, currentAppletSelector } from '../../state/app/app.selectors';
import { deactivateApplet, removeAndDeleteApplet } from '../../state/applets/applets.thunks';

const IOSHeaderPadding = Platform.OS === 'ios' ? '3.5%' : 0;
const IOSBodyPadding = Platform.OS === 'ios' ? 8 : 0;

// eslint-disable-next-line
class AppletSettings extends Component {
  constructor(props) {
    super(props);
    this.state = { showAlert: false };
  }

  showAlert = () => {
    this.setState({
      showAlert: true,
    });
  };

  hideAlert = () => {
    this.setState({
      showAlert: false,
    });
  };

  render() {
    const { skin, applet, removeAndDeleteApplet, deactivateApplet } = this.props;

    if (applet) {
      let { groupId } = applet;
      // eslint-disable-next-line
      groupId = groupId[0];
      const { showAlert } = this.state;

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
              <Title>Settings</Title>
            </Body>
            <Right />
          </Header>
          <Content>
            <View style={{ padding: 10 }}>
              <Text style={{ margin: 20 }}>
                If you want to remove this applet, but keep your data,
                click below
              </Text>
              <Button
                rounded
                full
                danger
                style={{ borderRadius: 50 }}
                bordered
                onPress={() => {
                  deactivateApplet(groupId);
                }}
              >
                <Text style={{ fontWeight: 'bold' }}>Remove</Text>
              </Button>
            </View>

            <View style={{ padding: 10 }}>
              <Text style={{ margin: 20 }}>
                If you want to delete your data from this applet and
                remove it, click below.
              </Text>
              <Button
                rounded
                full
                danger
                style={{ borderRadius: 50 }}
                onPress={() => this.showAlert()}
              >
                <Text style={{ fontWeight: 'bold' }}>
                  Remove and Delete Data
                </Text>
              </Button>
            </View>
          </Content>
          <AwesomeAlert
            show={showAlert}
            showProgress={false}
            title="Are you sure you want to delete your data?"
            message="You won't be able to recover it"
            closeOnHardwareBackPress={false}
            showCancelButton
            showConfirmButton
            cancelText="No, cancel"
            confirmText="Yes, delete it"
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              this.hideAlert();
            }}
            onConfirmPressed={() => {
              // TODO: add function that deletes the data
              // & routes you back to applet list view
              removeAndDeleteApplet(groupId);
              this.hideAlert();
            }}
          />
        </Container>
      );
    }
    // there isn't an applet defined so
    return (<Text>There isn't an applet defined.</Text>);
  }
}

AppletSettings.defaultProps = {
  applet: null,
};

AppletSettings.propTypes = {
  skin: PropTypes.object.isRequired,
  applet: PropTypes.object,
  deactivateApplet: PropTypes.func.isRequired,
  removeAndDeleteApplet: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  skin: skinSelector(state),
  applet: currentAppletSelector(state),
});

const mapDispatchToProps = {
  deactivateApplet,
  removeAndDeleteApplet,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppletSettings);
