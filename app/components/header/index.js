import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 30,
    right: 20,
  },
});

const ActHeader = () => {
  return (
    <TouchableOpacity style={styles.button} onPress={() => Actions.pop()}>
      <Icon 
        type="FontAwesome" 
        name="close" 
        style={{ color: colors.tertiary }} />
    </TouchableOpacity>
  );
};

ActHeader.propTypes = {
};

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(ActHeader);
