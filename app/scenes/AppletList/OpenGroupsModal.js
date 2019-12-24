import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, View, StyleSheet, Platform } from 'react-native';
import { Button, Text } from 'native-base';
import Modal from 'react-native-modal';

import ListButton from '../../components/ListButton';

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    alignItems: 'center',
    height: '90%',
    paddingTop: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingHorizontal: 35,
  },
  button: {
    marginVertical: 5,
  },
});

const OpenGroupsModal = ({ visible, groups, joinGroups, toggleModal }) => {
  const [selectedGroups, setSelectedGroups] = useState([]);

  const onPressGroup = (groupId) => {
    if (selectedGroups.includes(groupId)) {
      return setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    }

    return setSelectedGroups([...selectedGroups, groupId]);
  };

  const onPressJoin = () => {
    joinGroups(selectedGroups);
    toggleModal();
  };

  return (
    <Modal
      isVisible={visible}
      style={styles.modal}
      animationInTiming={500}
      backdropTransitionInTiming={600}
      useNativeDriver
    >
      <View style={styles.container}>
        <ScrollView>
          {groups && groups.map(group => (
            <ListButton
              key={group._id}
              title={group.name}
              onPress={() => onPressGroup(group._id)}
              selected={selectedGroups.includes(group._id)}
            />
          ))}
        </ScrollView>
        <View style={styles.buttonsContainer}>
          <Button
            style={styles.button}
            primary
            block
            disabled={!selectedGroups.length}
            onPress={onPressJoin}
          >
            <Text>
              {selectedGroups.length ? (
                `Join ${selectedGroups.length > 1 ? `${selectedGroups.length} groups` : '1 group'}`
              ) : 'Select groups to join'}
            </Text>
          </Button>
          <Button
            style={styles.button}
            light
            block
            onPress={toggleModal}
          >
            <Text>
              Close
            </Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
};

OpenGroupsModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  groups: PropTypes.array.isRequired,
  joinGroups: PropTypes.func.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default OpenGroupsModal;
