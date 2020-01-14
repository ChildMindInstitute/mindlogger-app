import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import TabItem from './TabItem';
import { sortAppletsAlphabetically } from '../../services/helper';
import AllAppletsModel from './AllAppletsModel';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
});

class TabsView extends React.Component {
  onPress = (applet) => {
    this.props.onPress(applet);
  };

  renderTabs(applets, currentApplet) {
    return (
      <React.Fragment>
        {applets.map(applet => (
          <TabItem
            applet={applet}
            onPress={() => this.onPress(applet)}
            key={applet.id}
            selected={currentApplet.id === applet.id}
          />

        ))}
      </React.Fragment>
    );
  }

  render() {
    const { applets, onPress, currentApplet, sortedAlphabetically } = this.props;
    const data = Object.assign([], applets);
    if (sortedAlphabetically) {
      sortAppletsAlphabetically(data);
    }

    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
        >
          <TabItem
            key="allApplets"
            applet={AllAppletsModel}
            selected={currentApplet.id === AllAppletsModel.id}
            onPress={() => {
              onPress(AllAppletsModel);
            }}
          />

          {this.renderTabs(data, currentApplet)}

        </ScrollView>
      </View>
    );
  }
}


TabsView.propTypes = {
  sortedAlphabetically: PropTypes.bool,
  applets: PropTypes.array.isRequired,
  onPress: PropTypes.func.isRequired,
  currentApplet: PropTypes.object.isRequired,
};
TabsView.defaultProps = {
  sortedAlphabetically: true,
};
export default TabsView;
