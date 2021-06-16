import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { activityOpenedSelector } from '../../state/responses/responses.selectors';
import { setActivityOpened } from '../../state/responses/responses.actions';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  box: {
    borderRadius: 12,
    elevation: 3,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.3,
    // shadowRadius: 2,
    borderStyle: 'solid',
    borderColor: colors.lightGrey,
    borderWidth: 4,
    backgroundColor: 'white', // '#F0F0F0',
    padding: 16,
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
  },
});

class TouchBox extends React.Component {
  constructor(props) {
    super(props);

    this.timer = null;
    this.selectedTime = 0;
    // this.handlePress = _.debounce(this.handlePress, 750);
    // this.state = {
    //   selectedTime: 0,
    // };
  }

  componentDidUpdate() {
    const { setActivityOpened, activityOpened } = this.props;

    if (activityOpened) {
      this.selectedTime = Date.now();
    }
  }

  onHandlePress = () => {
    const { activityStatus } = this.props;
    const { onPress } = this.props;
    const currentTime = Date.now();

    if (currentTime - this.selectedTime > 2500) {
      if (activityStatus !== 'in-progress') {
        this.selectedTime = currentTime;
      }
      onPress();
    }
  };

  render() {
    const { disabled, onLongPress, children } = this.props;

    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={() => this.onHandlePress()}
        onLongPress={onLongPress}
      >
        <View style={styles.box}>{children}</View>
      </TouchableOpacity>
    );
  }
}

TouchBox.propTypes = {
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  onLongPress: PropTypes.func,
  activityStatus: PropTypes.string,
  activityOpened: PropTypes.bool.isRequired,
  setActivityOpened: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  activityOpened: activityOpenedSelector(state),
});

const mapDispatchToProps = {
  setActivityOpened,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TouchBox);
