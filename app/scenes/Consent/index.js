import React, { Component } from 'react';
import { StatusBar, Platform } from 'react-native';
import { Container, Button, Text, Item, Form, View, Row, CheckBox } from 'native-base';
import { Actions } from 'react-native-router-flux';
import i18n from 'i18next';

import styles from './styles';

const isIOS = Platform.OS === 'ios';

export default class Consent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: false,
      storage: false,
      contact: false,
    };
  }

  onNext = () => {
    Actions.sign_up();
  };

  toggleState(name) {
    const data = {};
    data[name] = !this.state[name];
    this.setState(data);
  }

  render() {
    const { content, storage, contact } = this.state;
    return (
      <Container>
        <StatusBar barStyle={isIOS ? "dark-content" : "light-content"} />
        <View style={styles.container}>
          <View style={styles.header} />
          <Form>
            <Row style={styles.consentRow}>
              <Text style={styles.text}>{i18n.t('consent:this_app_provides')}</Text>
            </Row>
            <Item last />
            <Row style={styles.consentRow} onPress={() => this.toggleState('content')}>
              <CheckBox checked={content} onPress={() => this.toggleState('content')} />
              <Text style={styles.consentRowText}>{i18n.t('consent:i_understand')}</Text>
            </Row>
            <Row style={styles.consentRow} onPress={() => this.toggleState('storage')}>
              <CheckBox checked={storage} onPress={() => this.toggleState('storage')} />
              <Text style={styles.consentRowText}>{i18n.t('consent:i_will_allow')}</Text>
            </Row>
            <Row style={styles.consentRow} onPress={() => this.toggleState('contact')}>
              <CheckBox checked={contact} onPress={() => this.toggleState('contact')} />
              <Text style={styles.consentRowText}>{i18n.t('consent:i_premit')}</Text>
            </Row>
            <Button warning block disabled={!(content && storage)} onPress={this.onNext}>
              <Text>{i18n.t('consent:next')}</Text>
            </Button>
          </Form>
        </View>
      </Container>
    );
  }
}
