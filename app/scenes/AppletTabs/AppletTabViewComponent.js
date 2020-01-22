import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { Container, Content } from 'native-base';
import moment from 'moment';
import { colors } from '../../theme';
import ActivityList from '../../components/ActivityList';
import AppletCalendar from '../../components/AppletCalendar';
import AppletFooter from '../AppletDetails/AppletFooter';
import AppletAbout from '../../components/AppletAbout';
import AppletData from '../../components/AppletData';

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

class AppletTabViewComponent extends Component {
  constructor() {
    super();
    this.state = {
      selectedTab: 'survey',
    };
  }

  getResponseDates() {
    // TODO: a quick hack to add a dot for today's date
    // if the user has responded today. This is instead of
    // refreshing all the applets
    const { applet, appletData } = this.props;
    let allDates = [];
    const mapper = (resp) => {
      const d = resp.map(r => r.date);
      allDates = allDates.concat(d);
      return allDates;
    };

    const items = Object.keys(appletData);
    // R.forEach(mapper, appletData.responses);
    // const items = Object.keys(appletData.responses);
    // items.map(item => mapper(appletData.responses[item]));
    // items.map(item => mapper(appletData.responses[item]));

    if (allDates.length) {
      const maxDate = moment.max(allDates.map(d => moment(d)));
      if (applet.responseDates.indexOf(maxDate) < 0) {
        applet.responseDates.push(maxDate);
      }
    }

    return applet.responseDates;
  }

  // eslint-disable-next-line
  renderActiveTab() {
    const { selectedTab } = this.state;
    const {
      applet,
      onPressActivity,
      inProgress,
      appletData,
    } = this.props;

    const responseDates = this.getResponseDates() || [];

    switch (selectedTab) {
      case 'survey':
        return (
          <View>
            <AppletCalendar responseDates={responseDates} />
            <ActivityList
              activities={applet.activities}
              inProgress={inProgress}
              onPressActivity={onPressActivity}
            />
          </View>
        );
      case 'data':
        return (
          <View>
            <AppletCalendar responseDates={responseDates} />
            <AppletData
              applet={applet}
              appletData={appletData}
            />
          </View>
        );
      case 'about':
        return (
          <AppletAbout about={applet.about ? applet.about.en : ''} />
        );
      default:
        break;
    }
  }

  render() {
    const { selectedTab } = this.state;
    const { style } = this.props;

    return (
      <Container style={[styles.container, { ...style }]}>
        <ImageBackground
          style={{
            width: '100%',
            height: '100%',
            flex: 1,
          }}
          source={{
            // uri: 'https://images.unsplash.com/photo-1517639493569-5666a7b2f494?ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80'
            uri: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80',
          }}
        >
          <Content>
            {this.renderActiveTab()}
          </Content>
        </ImageBackground>
        <AppletFooter
          active={selectedTab}
          changeTab={tabName => this.setState({ selectedTab: tabName })}
        />
      </Container>
    );
  }
}

AppletTabViewComponent.propTypes = {
  style: PropTypes.object,
  applet: PropTypes.object.isRequired,
  appletData: PropTypes.object.isRequired,
  inProgress: PropTypes.object.isRequired,
  onPressActivity: PropTypes.func.isRequired,
};
AppletTabViewComponent.defaultProps = {
  style: {},
};
export default AppletTabViewComponent;
