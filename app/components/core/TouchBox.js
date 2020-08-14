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
    // this.handlePress = _.debounce(this.handlePress, 750);
    this.state = {
      selected: false,
    };
  }

  componentDidUpdate() {
    const { setActivityOpened, activityOpened } = this.props;

    if (activityOpened) {
      this.timer = setTimeout(() => {
        this.handleSelected();
      }, 750);
      setActivityOpened(false);
    }
  }

  handleSelected = () => {
    this.setState({ selected: false });
    clearTimeout(this.timer);
  };

  onHandlePress = () => {
    // this.handlePress();
    const { activityStatus } = this.props;
    const { selected } = this.state;
    const { onPress } = this.props;

    if (!selected) {
      this.setState({ selected: true });
      onPress();
      if (activityStatus !== 'in-progress') {
        this.timer = setTimeout(() => { this.handleSelected(); }, 500);
      }
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
