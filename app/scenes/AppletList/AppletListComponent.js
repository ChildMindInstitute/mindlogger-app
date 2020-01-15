import React from 'react';
import { StyleSheet, ScrollView, View, Text, ImageBackground, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Container, Header, Title, Button, Icon, Body, Right, Left } from 'native-base';
import { useNetInfo } from '@react-native-community/netinfo';
import { colors } from '../../theme';
import AppletListItem from '../../components/AppletListItem';
import AppletInvite from '../../components/AppletInvite';
import { connectionAlert, mobileDataAlert } from '../../services/networkAlerts';

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
  applets,
  invites,
  isDownloadingApplets,
  title,
  primaryColor,
  onPressDrawer,
  onPressRefresh,
  onPressAbout,
  onPressApplet,
  mobileDataAllowed,
  toggleMobileDataAllowed,
}) => {
  const netInfo = useNetInfo();

  const allActivityApplet = {};
  if (applets.length > 0) {
    allActivityApplet.name = { en: 'All My Activities' };
    allActivityApplet.activities = [];
    allActivityApplet.id = 'applet/all';
  }
  return (
    <Container style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        style={{ width: '100%', height: '100%', flex: 1 }}
        source={{
          uri: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80',
        }}
      >
        <Header style={{ backgroundColor: 'transparent', borderBottomWidth: 0 }}>
          <Left />
          <Body>
            <Title>{title}</Title>
          </Body>
          <Right style={{ flexDirection: 'row' }}>
            <Button transparent onPress={onPressDrawer}>
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
          { applets.length > 0 && (
            <AppletListItem applet={allActivityApplet} onPress={onPressApplet} key={allActivityApplet.id} />
          )}
          {applets.map(applet => (
            <AppletListItem applet={applet} onPress={onPressApplet} key={applet.id} />
          ))}
          {/* {
            applets.length === 0 && isDownloadingApplets
              ? <BodyText style={styles.sync}>Synchronizing...</BodyText>
              : <JoinDemoApplets />
          } */}
          {
            invites.length
              ? <AppletInvite /> : null
          }

          <View
            style={{
              marginTop: 20,
              marginBottom: 40,
              alignItems: 'center',
              alignContent: 'center',
              textAlign: 'center',
            }}
          >
            <TouchableOpacity onPress={onPressAbout}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                About MindLogger
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </ImageBackground>

    </Container>
  );
};

AppletListComponent.propTypes = {
  applets: PropTypes.array.isRequired,
  invites: PropTypes.array.isRequired,
  isDownloadingApplets: PropTypes.bool.isRequired,
  onPressDrawer: PropTypes.func.isRequired,
  onPressAbout: PropTypes.func.isRequired,
  onPressRefresh: PropTypes.func.isRequired,
  onPressApplet: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  primaryColor: PropTypes.string.isRequired,
  mobileDataAllowed: PropTypes.bool.isRequired,
  toggleMobileDataAllowed: PropTypes.func.isRequired,
};

export default AppletListComponent;
