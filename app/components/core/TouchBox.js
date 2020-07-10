import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { getResponseInActivity, getResponseInApplet } from '../../state/responses/responses.actions';
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

// const withPreventDoubleClick = (WrappedComponent) => {
//   class PreventDoubleClick extends React.PureComponent {
//     onPress = debounce(this.debouncedOnPress, 300, { leading: true, trailing: false });

//     debouncedOnPress = () => {
//       this.props.onPress && this.props.onPress();
//     }

//     render() {
//       return <WrappedComponent {...this.props} onPress={this.onPress} />;
//     }
//   }

//   PreventDoubleClick.displayName = `withPreventDoubleClick(${WrappedComponent.displayName ||WrappedComponent.name})`
//   return PreventDoubleClick;
// };

// const TouchableOpacityEx = withPreventDoubleClick(TouchableOpacity);

const TouchBox = ({ children, activity, onPress, getResponseInActivity, getResponseInApplet, isActivity, isApplet }) => {
  const [touched, setTouched] = useState(false);
  const [appletTouched, setAppletTouched] = useState(false);

  useEffect(() => {
    if (activity) {
      getResponseInActivity(false);
    } else {
      getResponseInApplet(false);
    }
    // setTouched(false);
  }, []);

  const handlePress = () => {
    if (activity) {
      if (!touched || !isActivity) {
        onPress();
      }
      setTouched(true);
      getResponseInActivity(true);
    } else {
      getResponseInApplet(true);
      if (!appletTouched) {
        onPress();
      }
      setAppletTouched(true);
    }
  };

  useEffect(() => {
    if (!activity) {
      setAppletTouched(isApplet);
    }
  }, [isApplet]);

  return (
    <TouchableOpacity disabled={(activity && activity.status === 'scheduled' && !activity.nextAccess)} onPress={handlePress}>
      <View style={styles.box}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

TouchBox.propTypes = {
  children: PropTypes.node.isRequired,
  activity: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  getResponseInActivity: PropTypes.func.isRequired,
  getResponseInApplet: PropTypes.func.isRequired,
  isApplet: PropTypes.bool.isRequired,
  isActivity: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isActivity: state.responses.isActivity,
  isApplet: state.responses.isApplet,
});

const mapDispatchToProps = {
  getResponseInActivity,
  getResponseInApplet,
};

export default connect(mapStateToProps, mapDispatchToProps)(TouchBox);
