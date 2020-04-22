import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { getResponseInActivity } from '../../state/responses/responses.actions';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 30,
    right: 20,
  },
});

const ActHeader = ({ getResponseInActivity }) => {
  const handlePress = () => {
    getResponseInActivity(false);
    Actions.pop();
    // setTimeout(() => Actions.refresh(), 500);
  };
  return (
    <TouchableOpacity style={styles.button} onPress={() => handlePress()}>
      <Icon type="FontAwesome" name="close" style={{ color: colors.tertiary }} />
    </TouchableOpacity>
  );
};

ActHeader.propTypes = {
  getResponseInActivity: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  getResponseInActivity,
};

export default connect(null, mapDispatchToProps)(ActHeader);
