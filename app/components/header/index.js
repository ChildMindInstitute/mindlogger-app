import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { View, Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { colors } from '../../theme';

const logoImage = require('../../../img/color_logo.png');

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 50,
    right: 15,
  },
  logo: {
    position: 'absolute',
    top: 20,
    right: 50,
    left: 15,
  },
  logoImage: {
    width: '100%',
    height: 100,
    resizeMode: "stretch",
  }
});

const ActHeader = ({ watermark, ...props }) => (
  <>
    {watermark &&
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
  </>
);

ActHeader.propTypes = {
};

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(ActHeader);
