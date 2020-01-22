import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { Container, Content } from 'native-base';
// import moment from 'moment';
import { colors } from '../../theme';
import ActivityList from '../../components/ActivityList';
import AppletCalendar from '../../components/AppletCalendar';

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

class AppletTabAllViewComponent extends Component {
  getResponseDates() {
    // TODO: a quick hack to add a dot for today's date
    // if the user has responded today. This is instead of
    // refreshing all the applets
    const { applet } = this.props;
    // let allDates = [];
    // const mapper = (resp) => {
    //   const d = resp.map(r => r.date);
    //   allDates = allDates.concat(d);
    //   return allDates;
    // };
    //
    // const items = Object.keys(appletData);
    // // R.forEach(mapper, appletData.responses);
    // // const items = Object.keys(appletData.responses);
    // // items.map(item => mapper(appletData.responses[item]));
    // // items.map(item => mapper(appletData.responses[item]));
    //
    // if (allDates.length) {
    //   const maxDate = moment.max(allDates.map(d => moment(d)));
    //   if (applet.responseDates.indexOf(maxDate) < 0) {
    //     applet.responseDates.push(maxDate);
    //   }
    // }

    return applet.responseDates;
  }

  render() {
    const { style } = this.props;
    const responseDates = this.getResponseDates() || [];
    const {
      applets,
      onPressActivity,
      inProgress,
    } = this.props;
    const allActivities = [];
    applets.forEach((applet) => {
      allActivities.push(...applet.activities);
    });
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
            <AppletCalendar responseDates={responseDates} />
            <ActivityList
              activities={allActivities}
              inProgress={inProgress}
              onPressActivity={onPressActivity}
            />

          </Content>
        </ImageBackground>
      </Container>
    );
  }
}

const ObjectType = PropTypes.object;
AppletTabAllViewComponent.propTypes = {
  style: ObjectType,
  applets: PropTypes.arrayOf(ObjectType).isRequired,
  applet: ObjectType.isRequired,
  inProgress: ObjectType.isRequired,
  onPressActivity: PropTypes.func.isRequired,
};
AppletTabAllViewComponent.defaultProps = {
  style: {},
};
export default AppletTabAllViewComponent;
