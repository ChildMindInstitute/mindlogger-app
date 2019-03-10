import React from 'react';
import PropTypes from 'prop-types';
import { Container, Header, Title, Content, Button, Icon, List, Text, Left, Body, Right, View, Spinner } from 'native-base';
import styles from './styles';
import ActivityRow from './ActivityRow';
import sortActivities from './sortActivities';

// const renderRightHiddenRow = (data, secId, rowId, rowMap) => (
//   <View style={{ flexDirection: 'row', height: 63 }}>
//     <Button
//       full
//       info
//       style={{ height: 63, width: 60 }}
//       onPress={() => this._editFrequency(rowId)}
//     >
//       <Icon active name="brush" />
//     </Button>
//     <Button
//       full
//       info
//       style={{ height: 63, width: 60 }}
//       onPress={() => this._editRow(data, secId, rowId, rowMap)}
//     >
//       <Icon active name="build" />
//     </Button>
//     <Button
//       full
//       danger
//       style={{ height: 63, width: 60 }}
//       onPress={() => this._deleteRow(data, secId, rowId, rowMap)}
//     >
//       <Icon active name="trash" />
//     </Button>
//   </View>
// );

const ActivityListComponent = ({
  showAdmin,
  activities,
  appletsDownloadProgress,
  isDownloadingApplets,
  onPressDrawer,
  onPressAddActivity,
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
        <Right>
          {showAdmin
            ? (
              <Button transparent onPress={onPressAddActivity}>
                <Icon name="add" />
              </Button>
            )
            : (
              <Button transparent onPress={onPressRefresh}><Icon name="refresh" /></Button>
            )}
        </Right>
      </Header>
      <Content>
        {isDownloadingApplets && (
          <View>
            <Spinner />
            {
              appletsDownloadProgress.total > 0 && (
                <Text style={styles.text}>
                  Downloaded {appletsDownloadProgress.downloaded} of {appletsDownloadProgress.total} activity sets
                </Text>
              )
            }
          </View>
        )}
        <List
          // dataSource={ds.cloneWithRowsAndSections(activities)}
          renderRow={(activity, secId, rowId) => (
            <ActivityRow
              onPress={onPressRow}
              activity={activity}
              secId={secId}
              rowId={rowId}
            />
          )}
          // // renderRightHiddenRow={renderRightHiddenRow}
          // rightOpenValue={showAdmin ? -120 : 0}
          // enableEmptySections
          dataArray={dataArray}
        />
      </Content>
    </Container>
  );
};

ActivityListComponent.propTypes = {
  showAdmin: PropTypes.bool.isRequired,
  activities: PropTypes.array.isRequired,
  appletsDownloadProgress: PropTypes.shape({
    downloaded: PropTypes.number,
    total: PropTypes.number,
  }).isRequired,
  inProgress: PropTypes.object.isRequired,
  isDownloadingApplets: PropTypes.bool.isRequired,
  onPressDrawer: PropTypes.func.isRequired,
  onPressAddActivity: PropTypes.func.isRequired,
  onPressRefresh: PropTypes.func.isRequired,
  onPressRow: PropTypes.func.isRequired,
};

export default ActivityListComponent;
