import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  navigations: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 5,
  }
});

const ActHeader = (props) => {
  const {
    topNavigation,
    nextEnabled,
    prevEnabled,
    actionLabel,
    onPressNextScreen,
    onPressPrevScreen,
    onPressAction,
  } = props;

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={() => Actions.pop()}>
        <Icon 
          type="FontAwesome"
          name="close" 
          style={{ color: colors.tertiary }} />
      </TouchableOpacity>
      
      {topNavigation && 
        <View style={styles.navigations}>
          <TouchableOpacity onPress={() => onPressPrevScreen()}>
            {prevEnabled && 
              <Icon
                type="FontAwesome"
                name="arrow-left"
                style={{ color: colors.tertiary }} />
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onPressAction()}>
            {actionLabel &&
                <Icon
                  type="FontAwesome"
                  name="refresh"
                  style={{ color: colors.tertiary }} />
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onPressNextScreen()}>
            {nextEnabled &&
              <Icon
                type="FontAwesome"
                name="arrow-right"
                style={{ color: colors.tertiary }} />
            }
          </TouchableOpacity>
        </View>
      }
    </>
  );
};

ActHeader.propTypes = {
  topNavigation: PropTypes.bool,
  actionLabel: PropTypes.string,
  nextEnabled: PropTypes.bool,
  prevEnabled: PropTypes.bool,
  onPressNextScreen: PropTypes.func,
  onPressPrevScreen: PropTypes.func,
  onPressAction: PropTypes.func,
};

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(ActHeader);
