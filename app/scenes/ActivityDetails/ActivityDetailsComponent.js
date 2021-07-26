import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { StyleSheet, StatusBar } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, Left, Body, Right } from 'native-base';
import { colors } from '../../theme';
import ActivitySummary from '../../components/ActivitySummary';
import ActivityResponseList from '../../components/ActivityResponseList';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
  },
});

const ActivityDetailsComponent = ({
  activity,
  onPressDrawer,
  onPressStart,
  onPressBack,
  responseHistory,
  primaryColor,
}) => {
  const responses = responseHistory.filter((response) => {
    // TODO: Update below or remove (currently unused) ActivityDetails from navigator.
    const responseActivityId = R.path(['meta', 'activity', '@id'], response);
    const formattedId = `activity/${responseActivityId}`;
    return activity.id === formattedId;
  });
  return (
    <Container style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header style={{ backgroundColor: primaryColor }}>
        <Left>
          <Button transparent onPress={onPressBack}>
            <Icon
              ios="ios-arrow-back"
              android="md-arrow-back"
            />
          </Button>
        </Left>
        <Body>
          <Title>{activity.name.en}</Title>
        </Body>
        <Right style={{ flexDirection: 'row' }}>
          <Button transparent onPress={onPressDrawer}>
            <Icon type="FontAwesome" name="bars" />
          </Button>
        </Right>
      </Header>
      <Content>
        <ActivitySummary
          activity={activity}
          onPressStart={onPressStart}
          primaryColor={primaryColor}
        />
        {responses.length > 0 && <ActivityResponseList responses={responses} />}
      </Content>
    </Container>
  );
};

ActivityDetailsComponent.propTypes = {
  activity: PropTypes.object.isRequired,
  responseHistory: PropTypes.array.isRequired,
  onPressDrawer: PropTypes.func.isRequired,
  onPressStart: PropTypes.func.isRequired,
  onPressBack: PropTypes.func.isRequired,
  primaryColor: PropTypes.string.isRequired,
};

export default ActivityDetailsComponent;
