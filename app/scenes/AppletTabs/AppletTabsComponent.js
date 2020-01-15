import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, StatusBar, View, ScrollView, Platform } from 'react-native';
import { Container, Header, Title, Button, Icon, Left, Body, Right } from 'native-base';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import AppletTabViewComponent from './AppletTabViewComponent';
import { colors } from '../../theme';
// import AppletSummary from '../../components/AppletSummary';
import TabsView from './TabsView';
import { isAllAppletsModel } from './AllAppletsModel';
import theme from '../../themes/variables';
import { tabHeight } from './TabItem';
import { sortAppletsAlphabetically } from '../../services/helper';

const contentHeight = theme.deviceHeight - theme.toolbarHeight - tabHeight - getStatusBarHeight() - (Platform.OS === 'ios' ? -20 : 0);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
  },
  circle: {
    width: 15,
    height: 15,
    borderRadius: 15 / 2,
    backgroundColor: colors.alert,
    position: 'absolute',
  },
});

// eslint-disable-next-line
class AppletTabsComponent extends React.Component {

  // eslint-disable-next-line react/sort-comp
  render() {
    const {
      applet,
      applets,
      onPressSettings,
      hasInvites,
      onPressBack,
      onPressApplet,
      primaryColor,
    } = this.props;

    return (
      <Container style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Header style={{ backgroundColor: primaryColor }}>
          <Left>
            <Button transparent onPress={onPressBack}>
              <Icon
                ios="ios-home"
                android="md-home"
              />
              {hasInvites ? <View style={styles.circle} /> : null}
            </Button>
          </Left>
          <Body>
            <Title>{applet.name.en}</Title>
          </Body>
          <Right style={{ flexDirection: 'row' }}>
            <Button transparent onPress={onPressSettings}>
              <Icon type="FontAwesome" name="gear" />
            </Button>
          </Right>
        </Header>
        <TabsView applets={applets} onPress={onPressApplet} currentApplet={applet} />
        {this.renderApplet()}
        {this.renderAllApplets()}
      </Container>
    );
  }

  renderApplet() {
    const {
      applet,
      appletData,
      inProgress,
      onPressActivity,
    } = this.props;

    return isAllAppletsModel(applet.id) || (
      <AppletTabViewComponent
        applet={applet}
        appletData={appletData}
        inProgress={inProgress}
        onPressActivity={onPressActivity}
      />
    );
  }

  renderAllApplets() {
    const {
      applet,
      appletData,
      applets,
      inProgress,
      onPressActivity,
    } = this.props;
    const sortedApplets = Object.assign([], applets);
    sortAppletsAlphabetically(sortedApplets);
    return isAllAppletsModel(applet.id) && (
      <ScrollView>
        {sortedApplets.map(applet => (
          <Fragment key={`item${applet.id}`}>
            <AppletTabViewComponent
              style={{ height: contentHeight }}
              key={applet.id}
              applet={applet}
              appletData={appletData}
              inProgress={inProgress}
              onPressActivity={onPressActivity}
            />
            <View
              key={`separator${applet.id}`}
              style={{
                height: 2,
                width: '100%',
                backgroundColor: colors.blue,
              }}
            />
          </Fragment>

        ))}

      </ScrollView>

    );
  }
}

const AppletType = PropTypes.shape({ id: PropTypes.string.isRequired });
AppletTabsComponent.propTypes = {
  applets: PropTypes.arrayOf(AppletType).isRequired,
  applet: AppletType.isRequired,
  appletData: PropTypes.object.isRequired,
  inProgress: PropTypes.object.isRequired,
  onPressApplet: PropTypes.func.isRequired,
  onPressActivity: PropTypes.func.isRequired,
  onPressBack: PropTypes.func.isRequired,
  onPressSettings: PropTypes.func.isRequired,
  primaryColor: PropTypes.string.isRequired,
  hasInvites: PropTypes.bool.isRequired,
};

export default AppletTabsComponent;
