import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { View } from 'react-native';
import { ListItem, List } from 'native-base';
import { Heading, BodyText } from './core';

const ActivityResponseList = ({ responses }) => {
  const sortedReponses = responses.sort((a, b) => {
    return b.meta.responseCompleted - a.meta.responseCompleted;
  });
  return (
    <View style={{ padding: 20, paddingBottom: 30 }}>
      <Heading>Responses</Heading>
      <List>
        {sortedReponses.map(response => (
          <ListItem key={response._id}>
            <BodyText>{moment(response.meta.responseCompleted).format('LL [at] LT')}</BodyText>
          </ListItem>
        ))}
      </List>
    </View>
  );
};

ActivityResponseList.propTypes = {
  responses: PropTypes.array.isRequired,
};

export default ActivityResponseList;
