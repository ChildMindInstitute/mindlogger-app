import React from 'react';
import PropTypes from 'prop-types';
import { Button, Text, Container, ListItem, Left, Right, Icon } from 'native-base';
import { DatePickerIOS, Modal, StyleSheet, View } from 'react-native';
import moment from 'moment';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  paddingContent: {
    padding: 20,
    flexGrow: 1,
  },
  datePickerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    color: colors.grey,
  },
});

class TimePicker extends React.Component {
  state = {
    modalVisible: false,
  };

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  render() {
    const { onChange, value = {}, label } = this.props;
    const date = new Date();
    date.setHours(value.hour || 0);
    date.setMinutes(value.minute || 0);
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>{label}</Text>
        <ListItem
          onPress={() => {
            this.setModalVisible(true);
          }}
        >
          <Left>
            <Text>{moment(date).format('h:mm a')}</Text>
          </Left>
          <Right>
            {label === 'From' ? <Icon type="FontAwesome" name="bed" /> : <Icon type="Ionicons" name="ios-alarm" />}
          </Right>
        </ListItem>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
        >
          <Container style={styles.paddingContent}>
            <Container style={styles.datePickerContainer}>
              <DatePickerIOS
                date={date}
                onDateChange={(date) => {
                  onChange({
                    hour: date.getHours(),
                    minute: date.getMinutes(),
                  });
                }}
                mode="time"
              />
            </Container>
            <Button
              full
              style={styles.okButton}
              onPress={() => {
                onChange({
                  hour: date.getHours(),
                  minute: date.getMinutes(),
                });
                this.setModalVisible(false);
              }}
            >
              <Text>OK</Text>
            </Button>
          </Container>
        </Modal>
      </View>
    );
  }
}

TimePicker.defaultProps = {
  value: undefined,
  label: undefined,
};

TimePicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.shape({
    hour: PropTypes.number,
    minute: PropTypes.number,
  }),
  label: PropTypes.string,
};

export default TimePicker;
