import React from 'react';
import PropTypes from 'prop-types';
import { Container, Header, Title, Content, Button, Icon, List, Text, Left, Body, Right, View, Spinner } from 'native-base';
import styles from './styles';
import ActivityRow from './ActivityRow';
import sortActivities from './sortActivities';

const ActivityListComponent = ({
  activities,
  appletsDownloadProgress,
  isDownloadingApplets,
  onPressDrawer,
  onPressRefresh,
  onPressRow,
  inProgress,
}) => {
  const dataArray = sortActivities(activities, inProgress);
  return (
    <Container style={styles.container}>
      <Header>
        <Left>
          <Button transparent onPress={onPressDrawer}>
            <Icon name="menu" />
          </Button>
        </Left>
        <Body>
          <Title>Activities</Title>
        </Body>
        <Right style={{ flexDirection: 'row' }}>
          <Button transparent onPress={onPressRefresh}><Icon name="refresh" /></Button>
        </Right>
      </Header>
      <Content>
        {isDownloadingApplets && (
          <View>
            <Spinner />
            {
              appletsDownloadProgress.total > 0
                ? (
                  <Text style={styles.text}>
                    Downloaded {appletsDownloadProgress.downloaded} of {appletsDownloadProgress.total} applets...
                  </Text>
                )
                : <Text style={styles.text}>Downloading applets...</Text>
            }
          </View>
        )}
        <List
          renderRow={activity => (
            <ActivityRow
              onPress={onPressRow}
              activity={activity}
              key={activity.isHeader ? activity.headerText : activity._id}
            />
          )}
          dataArray={dataArray}
        />
      </Content>
    </Container>
  );
};

ActivityListComponent.propTypes = {
  activities: PropTypes.array.isRequired,
  appletsDownloadProgress: PropTypes.shape({
    downloaded: PropTypes.number,
    total: PropTypes.number,
  }).isRequired,
  inProgress: PropTypes.object.isRequired,
  isDownloadingApplets: PropTypes.bool.isRequired,
  onPressDrawer: PropTypes.func.isRequired,
  onPressRefresh: PropTypes.func.isRequired,
  onPressRow: PropTypes.func.isRequired,
};

export default ActivityListComponent;
