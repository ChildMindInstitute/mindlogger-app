import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { List, ListItem, Body, Text } from 'native-base';
import AppletImage from '../../components/AppletImage';
import { colors } from '../../themes/colors';

const styles = StyleSheet.create({
  listItem: {
    marginLeft: 0,
    marginRight: 0,
    paddingBottom: 10,
    paddingTop: 10,
    paddingLeft: 0,
    paddingRight: 0,
  },
  bodyBlock: {
    flex: 1,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  textBlock: {
    flex: 1,
    fontSize: 10,
  },
});

class AppletSmallList extends React.Component {

  isAppletHaveOverdues = (applet) => {
    return applet.activities.reduce(
      (accumulator, activity) => (activity.isOverdue ? accumulator + 1 : accumulator),
      0,
    ) > 0 ? false : true;
  }

  render() {
    const { applets, currentApplet, onPress } = this.props;

    return (
        <List dataArray={applets}
              horizontal={true}
              style={{backgroundColor: "white"}}
              renderRow={(applet) =>
          <ListItem onPress={() => onPress(applet)} style={[styles.listItem, {backgroundColor: applet.id == currentApplet.id ? colors.lightBlue : "initial"}]}>
            <Body style={styles.bodyBlock}>
              <AppletImage applet={applet} withCircle={this.isAppletHaveOverdues(applet)} />
              <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.textBlock}>{applet.name.en}</Text>
            </Body>
          </ListItem>
        }>
        </List>
    );
  }
};

AppletSmallList.propTypes = {
  applets: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default AppletSmallList;
