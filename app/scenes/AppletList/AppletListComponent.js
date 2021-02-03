import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  StyleSheet,
  ScrollView,
  View,
  ImageBackground,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import { Container, Header, Title, Button, Icon, Body, Right, Left } from 'native-base';
// import PushNotification from "react-native-push-notification";
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { colors } from '../../theme';
import { setReminder, cancelReminder } from '../../state/applets/applets.thunks';
import AppletListItem from '../../components/AppletListItem';
import AppletInvite from '../../components/AppletInvite';
// import NotificationService from '../../components/LocalNotification';
import { connectionAlert, mobileDataAlert } from '../../services/networkAlerts';
import BaseText from '../../components/base_text/base_text';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
  },
  activityList: {
    // flex: 1,
    // backgroundColor: colors.lightGrey,
  },
  activityListContainer: {
    // backgroundColor: colors.secondary,
    // flex: 1,
    paddingTop: 10,
    // paddingBottom: 30,
  },
  sync: {
    padding: 50,
    textAlign: 'center',
    fontSize: 18,
  },
});

const AppletListComponent = ({
  disabled,
  applets,
  invites,
  isDownloadingApplets,
  isDownloadingTargetApplet,
  title,
  setReminder,
  cancelReminder,
  onPressDrawer,
  onPressRefresh,
  onUploadQueue,
  onPressAbout,
  onPressApplet,
  mobileDataAllowed,
  toggleMobileDataAllowed,
}) => {
  const [onSettings, setOnSettings] = useState(0);
  const [onAboutTime, setOnAboutTime] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const netInfo = useNetInfo();

  const onPressSettings = () => {
    const currentTime = Date.now();

    if (currentTime - onSettings > 250) {
      setOnSettings(currentTime);
      onPressDrawer();
    }
  };

  const onHandleAbout = () => {
    const currentTime = Date.now();

    if (currentTime - onAboutTime > 250) {
      setOnAboutTime(currentTime);
      onPressAbout();
    }
  };

  const handleConnectivityChange = (connection) => {
    if (connection.isConnected) {
      cancelReminder();

      if (!isConnected) {
        onUploadQueue();
        setIsConnected(true);
      }
    } else {
      setIsConnected(false);
      setReminder();
    }
  }

  useEffect(() => {
    const netInfoUnsubscribe = NetInfo.addEventListener(handleConnectivityChange);
    return () => {
      if (netInfoUnsubscribe) {
        netInfoUnsubscribe();
      }
    }
  }, [])

  return (
    <Container style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        style={{ width: '100%', height: '100%', flex: 1 }}
        source={{
          uri:
            'https://images.unsplash.com/photo-1439853949127-fa647821eba0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80',
        }}
      >
        <SafeAreaView />
        <Header style={{ backgroundColor: 'transparent', borderBottomWidth: 0 }}>
          <Left />
          <Body>
            <Title>{title}</Title>
          </Body>
          <Right style={{ flexDirection: 'row' }}>
            <Button transparent onPress={onPressSettings}>
              <Icon type="FontAwesome" name="user" />
            </Button>
          </Right>
        </Header>
        {/* <View style={{ flex: 1, backgroundColor: 'transparent' }}> */}

        {/* <BackgroundBlobs /> */}
        <ScrollView
          style={styles.activityList}
          refreshControl={(
            <RefreshControl
              refreshing={isDownloadingApplets}
              onRefresh={() => {
                if (!netInfo.isConnected) {
                  connectionAlert();
                } else if (netInfo.type === 'cellular' && !mobileDataAllowed) {
                  mobileDataAlert(toggleMobileDataAllowed);
                } else {
                  onPressRefresh();
                }
              }}
            />
          )}
          contentContainerStyle={styles.activityListContainer}
        >
          {isDownloadingTargetApplet && <ActivityIndicator size="large" />}
          {applets.map(applet => (
            <AppletListItem
              applet={applet}
              disabled={disabled}
              onPress={onPressApplet}
              key={applet.id}
            />
          ))}
          {/* {
            applets.length === 0 && isDownloadingApplets
              ? <BodyText style={styles.sync}>Synchronizing...</BodyText>
              : <JoinDemoApplets />
          } */}
          {invites.length ? <AppletInvite /> : null}

          <View
            style={{
              marginTop: 20,
              marginBottom: 40,
              alignItems: 'center',
              alignContent: 'center',
              textAlign: 'center',
            }}
          >
            <TouchableOpacity onPress={onHandleAbout}>
              <BaseText
                style={{
                  color: colors.primary,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
                textKey="applet_list_component:about_title"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </Container>
  );
};

AppletListComponent.propTypes = {
  disabled: PropTypes.bool,
  applets: PropTypes.array.isRequired,
  invites: PropTypes.array.isRequired,
  isDownloadingApplets: PropTypes.bool.isRequired,
  isDownloadingTargetApplet: PropTypes.bool.isRequired,
  onPressDrawer: PropTypes.func.isRequired,
  setReminder: PropTypes.func.isRequired,
  cancelReminder: PropTypes.func.isRequired,
  onPressAbout: PropTypes.func.isRequired,
  onPressRefresh: PropTypes.func.isRequired,
  onUploadQueue: PropTypes.func.isRequired,
  onPressApplet: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  primaryColor: PropTypes.string.isRequired,
  mobileDataAllowed: PropTypes.bool.isRequired,
  toggleMobileDataAllowed: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  setReminder,
  cancelReminder,
};

export default connect(
  null,
  mapDispatchToProps,
)(AppletListComponent);
