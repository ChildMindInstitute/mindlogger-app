import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Container,
  Button,
  View,
  Header,
  Left,
  Right,
  Icon,
  Text,
} from "native-base";
import { Actions } from "react-native-router-flux";
import QRCodeScanner from "react-native-qrcode-scanner";
import { Platform, Alert } from "react-native";
import i18n from "i18next";
import Permissions, { PERMISSIONS } from "react-native-permissions";
import EncryptedStorage from 'react-native-encrypted-storage'

import styles from "./styles";
import { getSkin } from "../../services/network";
import { setApiHost, resetApiHost, setSkin } from "../../state/app/app.actions";
import { apiHostSelector, skinSelector } from "../../state/app/app.selectors";
import { showToast } from "../../state/app/app.thunks";
import ChangeStudyForm from "./ChangeStudyForm";
import config from "../../config";
import { UserInfoStorage } from '../../features/system';

const IOSHeaderPadding = Platform.OS === "ios" ? 24 : 0;
const IOSBodyPadding = Platform.OS === "ios" ? 9 : 0;

const userInfoStorage = UserInfoStorage(EncryptedStorage);

class ChangeStudy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scanOpen: false,
    };
  }

  onSubmit = (body) => {
    const { showToast, setApiHost, setSkin } = this.props;

    const switchServer = () => {
      setApiHost(body.apiHost);
      getSkin().then((response) => {
        setSkin(response);
      });
      Actions.replace("login");
      showToast({
        text: i18n.t("change_study:successfully_changed"),
        position: "top",
        type: "success",
        duration: 2000,
      });
    };

    if (!body.apiHost.includes("https")) {
      Alert.alert(
        i18n.t("change_study:change_server"),
        i18n.t("change_study:http_confirm"),
        [
          {
            text: i18n.t("change_study:yes"),
            onPress: switchServer,
          },
          {
            text: i18n.t("change_study:no"),
            onPress: () => {},
          },
        ],
        { cancelable: false }
      );
    } else {
      switchServer();
    }
  };

  onReset = () => {
    const { showToast, resetApiHost, setSkin } = this.props;
    setSkin(config.defaultSkin);
    Actions.replace("login");
    showToast({
      text: i18n.t("change_study:successfully_reset"),
      position: "top",
      type: "success",
      duration: 2000,
    });
    resetApiHost();
  };

  onScan = (body) => {
    const { showToast, setApiHost, setSkin } = this.props;
    setApiHost(body.data);
    getSkin().then((response) => {
      setSkin(response);
    });
    Actions.replace("login");
    showToast({
      text: i18n.t("change_study:set_by_qr"),
      position: "top",
      type: "success",
      duration: 4000,
    });
  };

  toggleQrScanner = () => {
    const { scanOpen } = this.state;
    const permission = Platform.select({
      android: PERMISSIONS.ANDROID.CAMERA,
      ios: PERMISSIONS.IOS.CAMERA,
    });

    if (!scanOpen) {
      Permissions.check(permission).then((response) => {
        if (response !== Permissions.RESULTS.GRANTED) {
          Permissions.request(permission).then((response) => {
            if (response === Permissions.RESULTS.GRANTED) {
              this.setState({ scanOpen: true });
            }
          });
        } else {
          this.setState({ scanOpen: true });
        }
      });
    } else {
      this.setState({ scanOpen: !scanOpen });
    }
  };

  render() {
    const { apiHost } = this.props;
    const { skin } = this.props;

    const header = (
      <Header
        style={{
          backgroundColor: skin.colors.primary,
          paddingTop: IOSHeaderPadding,
        }}
      >
        <Left>
          <Button transparent onPress={() => Actions.pop()}>
            <Icon ios="ios-arrow-back" android="md-arrow-back" />
          </Button>
        </Left>
        <Right style={{ paddingTop: IOSBodyPadding }}>
          <Button transparent block onPress={this.toggleQrScanner}>
            <Text>
              {this.state.scanOpen
                ? i18n.t("change_study:enter_url_manually")
                : i18n.t("change_study:scan_qr")}
            </Text>
          </Button>
        </Right>
      </Header>
    );

    if (this.state.scanOpen) {
      return (
        <Container
          style={[styles.container, { backgroundColor: skin.colors.primary }]}
        >
          {header}
          <QRCodeScanner fadeIn showMarker onRead={this.onScan} />
        </Container>
      );
    }
    return (
      <Container
        style={[styles.container, { backgroundColor: skin.colors.primary }]}
      >
        {header}
        <View style={styles.formContainer}>
          <ChangeStudyForm
            onSubmit={this.onSubmit}
            onReset={this.onReset}
            initialValues={{ apiHost }}
            primaryColor={skin.colors.primary}
          />
        </View>
      </Container>
    );
  }
}

ChangeStudy.propTypes = {
  apiHost: PropTypes.string.isRequired,
  skin: PropTypes.object.isRequired,
  showToast: PropTypes.func.isRequired,
  resetApiHost: PropTypes.func.isRequired,
  setApiHost: PropTypes.func.isRequired,
  setSkin: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  apiHost: apiHostSelector(state),
  skin: skinSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  showToast,
  setApiHost: (apiHost) => {
    dispatch(setApiHost(apiHost));
    userInfoStorage.setApiHost(apiHost);
  },
  resetApiHost: () => {
    dispatch(setApiHost(config.defaultApiHost));
    userInfoStorage.setApiHost(config.defaultApiHost);
  },
  setSkin,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeStudy);
