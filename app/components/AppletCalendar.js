import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions } from 'react-native';
// import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import moment from 'moment';
import { connect } from 'react-redux';
import i18n from 'i18next';

import CalendarStrip from 'react-native-calendar-strip';
import { colors } from '../themes/colors';
import theme from '../themes/base-theme';

const { width } = Dimensions.get('window');

// eslint-disable-next-line
const ActCalendar = ({ responseDates, appLanguage }) => {
  return (
    <CalendarStrip
      locale={{
        name: 'en',
        config: {
          months: i18n.t('calendar:months').split('_'),
          weekdaysShort: i18n.t('calendar:weekdays').split('_'),
        },
      }}
      style={{ height: 90, width, paddingTop: 10, paddingBottom: 5 }}
      // selectedDate={new Date()}
      startingDate={moment().subtract(6, 'days')}
      useIsoWeekday={false}
      // TODO: comment the two lines below when you
      // want to be able to go to different weeks.
      leftSelector={[]}
      rightSelector={[]}
      // TODO: uncomment and fill the
      // markedDates prop below to add dots to the calendar.
      markedDates={responseDates.map(r => ({
        date: moment(r),
        dots: [{ key: 0, color: colors.primary, selectedDotColor: colors.primary }],
      }))}
      customDatesStyles={[
        {
          startDate: moment(),
          // dateNameStyle: { fontWeight: 'bold' },
          dateNumberStyle: { fontWeight: 'bold' },
        },
      ]}
      // highlightDateNumberStyle={{ fontWeight: 'normal' }}
      datesWhitelist={[
        {
          start: moment(),
          end: moment().add(0, 'days'),
        },
      ]}
      // calendarAnimation={{ type: 'sequence', duration: 30 }}
      calendarHeaderStyle={{ fontWeight: 'normal', fontFamily: theme.fontFamily }}
      dateNumberStyle={{ fontWeight: 'normal', fontFamily: theme.fontFamily }}
      daySelectionAnimation={{
        type: 'background',
        duration: 200,
        highlightColor: colors.lightBlue,
      }}
    />
  );
};

ActCalendar.propTypes = {
  responseDates: PropTypes.array.isRequired,
  appLanguage: PropTypes.string.isRequired,
};

const mapStateToProps = ({ app }) => ({
  appLanguage: app.appLanguage,
});

export default connect(
  mapStateToProps,
)(ActCalendar);
