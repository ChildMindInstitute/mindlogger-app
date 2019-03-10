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
        {activity.meta && activity.meta.logoImage
          ? <Image thumb square file={activity.meta.logoImage} />
          : (
            <View style={{ ...buttonStyle, backgroundColor }}>
              <Text style={styles.letter}>{activity.appletShortName.substr(0, 1).toUpperCase()}</Text>
            </View>
          )}
      </Left>
      <Body>
        <Text>{activity.name}</Text>
      </Body>
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
