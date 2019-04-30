import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, Text, Left, Body, View } from 'native-base';
import Image from '../../components/image/Image';
import styles from './styles';
import ActivityDueDate from './ActivityDueDate';

const BUTTON_COLORS = ['#0067a0', '#919d9d', '#00c1d5', '#b5bd00'];

const buttonStyle = {
  width: 30,
  height: 30,
  borderRadius: 15,
  alignItems: 'center',
  paddingTop: 6,
};

const ActivityRow = ({ activity, onPress }) => {
  if (activity.isHeader === true) {
    return (
      <ListItem itemHeader>
        <Text>{activity.text}</Text>
      </ListItem>
    );
  }

  const backgroundColor = BUTTON_COLORS[parseInt(activity.appletId.substr(-1), 16) % 4];

  return (
    <ListItem avatar onPress={() => onPress(activity)}>
      <Left>
        {activity.logoImage
          ? <Image thumb square file={activity.logoImage} />
          : (
            <View style={{ ...buttonStyle, backgroundColor }}>
              <Text style={styles.letter}>
                {activity.appletShortName.en.substr(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
      </Left>
      <Body>
        <Text style={{ color: activity.status === 'in-progress' ? '#11c' : null }}>{activity.name.en}</Text>
        <ActivityDueDate activity={activity} />
      </Body>
    </ListItem>
  );
};

ActivityRow.propTypes = {
  activity: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default ActivityRow;
