import React from 'react';
import { StyleSheet, ScrollView, RefreshControl, StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import { Container, Header, Title, Button, Icon, Body, Right, Left } from 'native-base';
import { useNetInfo } from '@react-native-community/netinfo';
import { colors } from '../../theme';
import AppletListItem from '../../components/AppletListItem';
import AppletInvite from '../../components/AppletInvite';
import { BodyText } from '../../components/core';
import JoinDemoApplets from '../../components/JoinDemoApplets';
import { connectionAlert, mobileDataAlert } from '../../services/networkAlerts';
import Svg, {
  Path,
  G,
} from 'react-native-svg';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
  },
  activityList: {
    flex: 1,
    backgroundColor: colors.lightGrey,
  },
  activityListContainer: {
    backgroundColor: colors.secondary,
    flex: 1,
    paddingTop: 10,
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
  onPressApplet,
  mobileDataAllowed,
  toggleMobileDataAllowed,
}) => {
  const netInfo = useNetInfo();
  return (
    <Container style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header style={{ backgroundColor: primaryColor }}>
        <Left />
        <Body>
          <Title>{title}</Title>
        </Body>
        <Right style={{ flexDirection: 'row' }}>
          <Button transparent onPress={onPressDrawer}>
            <Icon type="FontAwesome" name="bars" />
          </Button>
        </Right>
      </Header>
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
        <Svg width={600} height={600} style={{ position: 'absolute' }}>
          <Path
            d="M416.8 207.8c44.4 54.7 96.9 103.8 97.1 156.4.3 52.6-51.7 108.6-111.4 130.3-59.7 21.7-127.1 9.1-171.9-23-44.9-32.1-67.2-83.7-74.3-133.4-7.1-49.7 1.1-97.5 27.6-148 26.4-50.6 71.3-103.8 111.8-100.4 40.5 3.4 76.7 63.5 121.1 118.1z"
            fill="#FE840E"
          />
        </Svg>

        <Svg width={600} height={600} style={{ position: 'absolute' }}>
          <G transform="translate(150,150)">
            <Path
              d="M135,-141.8C156.8,-113.1,143.9,-56.6,139.1,-4.8C134.2,46.9,137.5,93.8,115.6,119.6C93.8,145.5,46.9,150.2,8.4,141.9C-30.2,133.5,-60.3,112,-105.5,86.2C-150.7,60.3,-210.8,30.2,-229.9,-19.1C-249,-68.4,-227,-136.7,-181.9,-165.4C-136.7,-194,-68.4,-183,-5.9,-177.1C56.6,-171.2,113.1,-170.5,135,-141.8Z"
              fill="#eb144c"
            />
          </G>
        </Svg>

        <Svg width={600} height={800} style={{ position: 'absolute' }}>
          <G transform="translate(200,450)">
            <Path
              d="M74.3,-115.2C99.1,-84.1,124.2,-66.3,136.5,-41.4C148.7,-16.4,148,15.8,141.6,49.2C135.1,82.6,122.8,117.4,98.2,133.7C73.7,150.1,36.8,148,-4.9,154.8C-46.6,161.5,-93.3,177,-120.2,161.5C-147.2,145.9,-154.4,99.2,-178.2,51.8C-201.9,4.4,-242.2,-43.7,-236,-81C-229.8,-118.4,-177.2,-144.9,-130.2,-168.8C-83.1,-192.7,-41.5,-213.8,-8.4,-202.2C24.7,-190.6,49.4,-146.3,74.3,-115.2Z"
              fill="#7bdcb5"
            />
          </G>

        </Svg>

        {applets.map(applet => (
          <AppletListItem applet={applet} onPress={onPressApplet} key={applet.id} />
        ))}
        {
          applets.length === 0 && isDownloadingApplets
            ? <BodyText style={styles.sync}>Synchronizing...</BodyText>
            : <JoinDemoApplets />
        }
        {
          invites.length
            ? <AppletInvite /> : null
        }

      </ScrollView>
    </Container>
  );
};

AppletListComponent.propTypes = {
  applets: PropTypes.array.isRequired,
  invites: PropTypes.array.isRequired,
  isDownloadingApplets: PropTypes.bool.isRequired,
  onPressDrawer: PropTypes.func.isRequired,
  onPressRefresh: PropTypes.func.isRequired,
  onPressApplet: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  primaryColor: PropTypes.string.isRequired,
  mobileDataAllowed: PropTypes.bool.isRequired,
  toggleMobileDataAllowed: PropTypes.func.isRequired,
};

export default AppletListComponent;
