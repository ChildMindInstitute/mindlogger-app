import React from 'react';
import { StyleSheet, FlatList, RefreshControl } from 'react-native';
import PropTypes from 'prop-types';
import { Container, Header, Title, Button, Icon, Body, Right, Left } from 'native-base';
import AppletListItem from '../../components/AppletListItem';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
  },
  text: {
    alignSelf: 'center',
    marginBottom: 7,
    fontSize: 10,
    color: '#aaa',
  },
  mb: {
    marginBottom: 15,
  },
  letter: {
    fontSize: 14,
  },
  activityList: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  activityListContainer: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
});

const AppletListComponent = ({
  applets,
  isDownloadingApplets,
  onPressDrawer,
  onPressRefresh,
  onPressApplet,
}) => (
  <Container style={styles.container}>
    <Header>
      <Left />
      <Body>
        <Title>MindLogger</Title>
      </Body>
      <Right style={{ flexDirection: 'row' }}>
        <Button transparent onPress={onPressDrawer}>
          <Icon name="menu" />
        </Button>
      </Right>
    </Header>
    <FlatList
      style={styles.activityList}
      contentContainerStyle={styles.activityListContainer}
      refreshControl={(
        <RefreshControl
          refreshing={isDownloadingApplets}
          onRefresh={onPressRefresh}
          title="Syncing..."
        />
      )}
      renderItem={({ item }) => (
        <AppletListItem applet={item} onPress={onPressApplet} />
      )}
      data={applets}
      keyExtractor={item => item.id}
    />
  </Container>
);

AppletListComponent.propTypes = {
  applets: PropTypes.array.isRequired,
  isDownloadingApplets: PropTypes.bool.isRequired,
  onPressDrawer: PropTypes.func.isRequired,
  onPressRefresh: PropTypes.func.isRequired,
  onPressApplet: PropTypes.func.isRequired,
};

export default AppletListComponent;
