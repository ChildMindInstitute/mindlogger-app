import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, StatusBar } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, Left, Body, Right } from 'native-base';
import { colors } from '../../theme';
import ActivityList from '../../components/ActivityList';
import AppletSummary from '../../components/AppletSummary';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
  },
});

const AppletDetailsComponent = ({
  applet,
  onPressDrawer,
  onPressActivity,
  onPressBack,
  inProgress,
}) => (
  <Container style={styles.container}>
    <StatusBar barStyle="light-content" />
    <Header>
      <Left>
        <Button transparent onPress={onPressBack}>
          <Icon
            ios="ios-arrow-back"
            android="md-arrow-back"
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
      <AppletSummary applet={applet} />
      <ActivityList applet={applet} inProgress={inProgress} onPressActivity={onPressActivity} />
    </Content>
  </Container>
);

AppletDetailsComponent.propTypes = {
  applet: PropTypes.object.isRequired,
  inProgress: PropTypes.object.isRequired,
  onPressDrawer: PropTypes.func.isRequired,
  onPressActivity: PropTypes.func.isRequired,
  onPressBack: PropTypes.func.isRequired,
};

export default AppletDetailsComponent;
