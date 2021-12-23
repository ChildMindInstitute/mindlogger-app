import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { colors } from '../../theme';

const logoImage = require('../../../img/color_logo.png');

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  logo: {
    position: 'absolute',
    top: 20,
    right: 50,
    left: 15,
  },
  logoImage: {
    height: 65,
    width: 65,
    left: 0,
    top: 0,
    resizeMode: 'contain',
  },
  navigations: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 40,
  }
});

const ActHeader = (props) => {
  const {
    topNavigation,
    nextEnabled,
    prevEnabled,
    actionLabel,
    watermark,
    isSummaryScreen,
    isSplashScreen,
    prevLabel,
    onPressNextScreen,
    onPressPrevScreen,
    onPressAction,
  } = props;

  return (
    <>
      {!!watermark && !isSummaryScreen && !isSplashScreen &&
        <View style={styles.logo}>
          <Image square style={styles.logoImage} source={{ uri: watermark[0]['@id'] }} />
        </View>
      }
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
                style={{ color: prevLabel ? colors.tertiary : 'white' }} />
            }
          </TouchableOpacity>
          {!!actionLabel &&
            <TouchableOpacity onPress={() => onPressAction()}>
              <Icon
                type="FontAwesome"
                name="refresh"
                style={{ color: colors.tertiary }} />
            </TouchableOpacity>
          }
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
  isSummaryScreen: PropTypes.bool,
  isSplashScreen: PropTypes.bool,
  prevLabel: PropTypes.string,
  onPressNextScreen: PropTypes.func,
  onPressPrevScreen: PropTypes.func,
  onPressAction: PropTypes.func,
};

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(ActHeader);
