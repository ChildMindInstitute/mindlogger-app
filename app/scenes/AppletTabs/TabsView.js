import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import TabItem from './TabItem';
import { ALL_APPLETS_ID } from '../../components/AllApplets';
import { sortAppletsAlphabetically } from '../../services/helper';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
});

class TabsView extends React.Component {
  onPress = (applet) => {
    this.props.onPress(applet);
    this.fireOnInitial = true;
  };

  renderTabs(applets, currentApplet) {
    return (
      <React.Fragment>
        {applets.map(applet => (
          <TabItem
            applet={applet}
            onPress={() => this.onPress(applet)}
            key={applet.id}
            selected={this.fireOnInitial
            && currentApplet.id === applet.id}
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
    const allAppletsItem = {
      id: ALL_APPLETS_ID,
      name: { en: 'All applets' },
    };

    return (
      <React.Fragment>
        <ScrollView
          horizontal
          style={styles.container}
        >
          <TabItem
            key="allApplets"
            applet={allAppletsItem}
            selected={!this.fireOnInitial}
            onPress={() => {
              onPress(allAppletsItem);
            }}
          />

          {this.renderTabs(data, currentApplet)}

        </ScrollView>
      </React.Fragment>
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
