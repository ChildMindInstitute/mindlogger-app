import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, StatusBar, Text, View } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, Left, Body, Right, Footer, FooterTab, } from 'native-base';
import { colors } from '../../theme';
import {
  Svg,
  Path,
  G
} from 'react-native-svg';
import ActivityList from '../../components/ActivityList';
import AppletSummary from '../../components/AppletSummary';
import AppletCalendar from '../../components/AppletCalendar';
import AppletFooter from './AppletFooter';


const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
  },
});

// eslint-disable-next-line
class AppletDetailsComponent extends React.Component {

  constructor() {
    super();
    this.state = {
      selectedTab: 'survey',
    };
  }

  renderActiveTab() {
    const { selectedTab } = this.state;
    const {
      applet,
      onPressActivity,
      inProgress,
    } = this.props;
    switch (selectedTab) {
      case 'survey':
        return (
          <View>
            <AppletCalendar />
            <ActivityList
              applet={applet}
              inProgress={inProgress}
              onPressActivity={onPressActivity}
            />
          </View>
        );
      case 'data':
        break;
      case 'about':
        return (<AppletSummary applet={applet} />);
      default:
        break;
    }
  }

  render() {
    const {
      applet,
      onPressDrawer,
      onPressBack,
      primaryColor,
    } = this.props;

    const { selectedTab } = this.state;

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
            </Button>
          </Left>
          <Body>
            <Title>{applet.name.en}</Title>
          </Body>
          <Right style={{ flexDirection: 'row' }}>
            <Button transparent onPress={onPressDrawer}>
              <Icon type="FontAwesome" name="bars" />
            </Button>
          </Right>
        </Header>
        <Content>
          {this.renderActiveTab()}
        </Content>
        <AppletFooter
          active={selectedTab}
          changeTab={tabName => this.setState({ selectedTab: tabName })}
        />
      </Container>
    );
  }
}

AppletDetailsComponent.propTypes = {
  applet: PropTypes.object.isRequired,
  inProgress: PropTypes.object.isRequired,
  onPressDrawer: PropTypes.func.isRequired,
  onPressActivity: PropTypes.func.isRequired,
  onPressBack: PropTypes.func.isRequired,
  primaryColor: PropTypes.string.isRequired,
};

export default AppletDetailsComponent;
