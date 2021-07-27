import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, View, ImageBackground, Platform } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, Left, Body, Right } from 'native-base';
import _ from 'lodash';
import { colors } from '../../theme';
import ActivityList from '../../components/ActivityList';
// import AppletSummary from '../../components/AppletSummary';
import AppletCalendar from '../../components/AppletCalendar';
import AppletFooter from './AppletFooter';
import AppletAbout from '../../components/AppletAbout';
import AppletData from '../../components/AppletData';

import { contrast } from '../../utils/utils.color';

const IOSHeaderPadding = Platform.OS === 'ios' ? '3.5%' : 0;
const IOSBodyPadding = Platform.OS === 'ios' ? 9 : 0;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
  },
  circle: {
    width: 15,
    height: 15,
    borderRadius: 15 / 2,
    backgroundColor: colors.alert,
    position: 'absolute',
  },
});

// eslint-disable-next-line
class AppletDetailsComponent extends React.Component {
  constructor(props) {
    super(props);
    // this.handlePressSettings = _.debounce(this.handlePressSettings, 200);
    this.onPressTime = 0;
    this.state = {
      selectedTab: props.initialTab,
      // onSettings: 0,
    };
  }

  getResponseDates() {
    // TODO: a quick hack to add a dot for today's date
    // if the user has responded today. This is instead of
    // refreshing all the applets
    const { applet /* , appletData */ } = this.props;
    // let allDates = [];
    // const mapper = (resp) => {
    //   const d = resp.map(r => r.date);
    //   allDates = allDates.concat(d);
    //   return allDates;
    // };

    // const items = Object.keys(appletData);
    // R.forEach(mapper, appletData.responses);
    // const items = Object.keys(appletData.responses);
    // items.map(item => mapper(appletData.responses[item]));
    // items.map(item => mapper(appletData.responses[item]));

    // if (allDates.length) {
    //   const maxDate = moment.max(allDates.map(d => moment(d)));
    //   if (applet.responseDates.indexOf(maxDate) < 0) {
    //     applet.responseDates.push(maxDate);
    //   }
    // }

    return applet.responseDates;
  }

  handlePressSettings() {
    const { onPressSettings } = this.props;
    const currentTime = Date.now();

    if (currentTime - this.onPressTime > 350) {
      this.onPressTime = currentTime;
      onPressSettings();
    }
  }

  // eslint-disable-next-line
  renderActiveTab() {
    const { selectedTab } = this.state;
    const {
      applet,
      onPressActivity,
      onLongPressActivity,
      // inProgress,
      appletData,
    } = this.props;

    const responseDates = this.getResponseDates() || [];
    switch (selectedTab) {
      case 'activity':
        return (
          <Content>
            <View style={{ flex: 1 }}>
              <AppletCalendar responseDates={responseDates} />
              <ActivityList
                onPressActivity={onPressActivity}
                onLongPressActivity={onLongPressActivity}
              />
            </View>
          </Content>
        );
      case 'data':
        return (
          <View style={{ flex: 1 }}>
            <AppletData responseDates={responseDates} applet={applet} appletData={appletData} />
          </View>
        );
      case 'about':
        return (
          <Content>
            <AppletAbout applet={applet} />
          </Content>
        );
      default:
        break;
    }
  }

  handlePress() {
    const { onPressBack } = this.props;
    const currentTime = Date.now();

    if (currentTime - this.onPressTime > 250) {
      this.onPressTime = currentTime;
      onPressBack();
    }
  }

  render() {
    const { applet, hasInvites, primaryColor } = this.props;

    const { selectedTab } = this.state;

    const backgroundColor = applet && applet.theme && applet.theme.primaryColor ? applet.theme.primaryColor : primaryColor;
    const color = contrast(backgroundColor);

    return (
      <Container style={[styles.container, { flex: 1 }]}>
        <StatusBar barStyle="dark-content" />
        <Header
          style={{
            backgroundColor,
            paddingTop: IOSHeaderPadding,
          }}
        >
          <Left>
            <Button transparent onPress={() => this.handlePress()}>
              <Icon ios="ios-home" android="md-home" />
              {hasInvites ? <View style={styles.circle} /> : null}
            </Button>
          </Left>
          <Body style={{ paddingTop: IOSBodyPadding }}>
            <Title style={{ color }}>{applet.name.en}</Title>
          </Body>
          <Right style={{ flexDirection: 'row' }}>
            <Button
              disabled
              transparent
              onPress={() => {
                this.handlePressSettings();
              }}
            >
              {/* <Icon type="FontAwesome" name="gear" /> */}
            </Button>
          </Right>
        </Header>
        <ImageBackground
          style={{ width: '100%', height: '100%', flex: 1 }}
          source={{
            // uri: 'https://images.unsplash.com/photo-1517639493569-5666a7b2f494?ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80'
            uri: applet && applet.theme && applet.theme.backgroundImage ? applet.theme.backgroundImage : 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80',
          }}
        >
          {this.renderActiveTab()}
        </ImageBackground>
        <AppletFooter
          applet={applet}
          active={selectedTab}
          changeTab={tabName => this.setState({ selectedTab: tabName })}
        />
      </Container>
    );
  }
}

AppletDetailsComponent.propTypes = {
  applet: PropTypes.object.isRequired,
  appletData: PropTypes.object.isRequired,
  // inProgress: PropTypes.object.isRequired,
  onPressActivity: PropTypes.func.isRequired,
  onLongPressActivity: PropTypes.func.isRequired,
  onPressBack: PropTypes.func.isRequired,
  onPressSettings: PropTypes.func.isRequired,
  primaryColor: PropTypes.string.isRequired,
  hasInvites: PropTypes.bool.isRequired,
  initialTab: PropTypes.string.isRequired,
};

export default AppletDetailsComponent;
