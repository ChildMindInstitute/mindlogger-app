import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, Text, Left, Body, Right, View } from 'native-base';
import moment from 'moment';
import Image from '../../components/image/Image';
import styles from './styles';

const BUTTON_COLORS = ['#0067a0', '#919d9d', '#00c1d5', '#b5bd00'];

const buttonStyle = {
  width: 30,
  height: 30,
  borderRadius: 15,
  alignItems: 'center',
  paddingTop: 6,
};

const ActivityRow = ({ activity, secId, rowId, onPress }) => {
  if (activity.isHeader === true) {
    return (
      <ListItem itemHeader>
        <Text style={styles.letter}>{activity.text}</Text>
      </ListItem>
    );
  }

  const backgroundColor = BUTTON_COLORS[parseInt(activity.appletId.substr(-1), 16) % 4];

  const index = parseInt(secId, 10);
  let dateStr = '';
  if (activity.nextTime) {
    const actDate = moment(activity.nextTime);
    const currentDate = moment();
    if (actDate.dayOfYear() === currentDate.dayOfYear()) {
      dateStr = actDate.format('LT');
    } else {
      dateStr = actDate.format('MMM D');
    }
  }

  return (
    <ListItem avatar onPress={() => onPress(activity)}>
      <Left>
        {activity.meta && activity.meta.logoImage
          ? <Image thumb square file={activity.meta.logoImage} />
          : (
            <View style={{ ...buttonStyle, backgroundColor }}>
              <Text style={styles.letter}>{activity.appletShortName.substr(0, 1).toUpperCase()}</Text>
            </View>
          )}
      </Left>
      <Body>
        <Text style={index === 0 ? { color: '#11c' } : {}}>{activity.name}</Text>
        <Text note />
      </Body>
      <Right>
        <Text note>{dateStr}</Text>
      </Right>
    </ListItem>
  );
};

ActivityRow.propTypes = {
  activity: PropTypes.object.isRequired,
  secId: PropTypes.string.isRequired,
  rowId: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default ActivityRow;
