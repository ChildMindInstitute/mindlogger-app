import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StatusBar} from 'react-native';
import {connect} from 'react-redux';
import {Container, Button, H3, Text, Item, Label, Input, Form, View, Header, Right, Row, Body, ListItem, CheckBox} from 'native-base';
import {Actions} from 'react-native-router-flux';

import styles from './styles';

class Consent extends Component { // eslint-disable-line
    componentWillMount() {
        this.setState({
            content: false,
            storage: false,
            contact: false,
        })
    }
    toggleState(name) {
        let data = {}
        data[name] = !this.state[name]
        this.setState(data)
    }
    onNext = () => {
        Actions.sign_up()
    }
    render() {
        const {login} = this.props
        const {content, storage, contact } = this.state
        return (
            <Container>
                <StatusBar barStyle='light-content'/>
                <View style={styles.container}>
                    <View style={styles.header}></View>
                    <Form>
                        <Row style={styles.consentRow}>
                            <Text style={styles.text}>This app provides a easy way to collect survey, voice, drawing activities.</Text>
                        </Row>
                        <Item  last>
                            
                        </Item>
                        <Row style={styles.consentRow} onPress={()=>this.toggleState('content')} >
                            <CheckBox checked={content} onPress={()=>this.toggleState('content')}/>
                            <Text style={styles.consentRowText}>I understand that viewing certain images can be uncomfortable while using this app</Text>
                        </Row>
                        <Row style={styles.consentRow} onPress={()=>this.toggleState('storage')} >
                            <CheckBox checked={storage} onPress={()=>this.toggleState('storage')}  />
                            <Text style={styles.consentRowText}>I will allow the Child Mind Institute to store data from use of this app on a secure cloud server, and to access this information for clinical and research purposes</Text>
                        </Row>
                        <Row style={styles.consentRow} onPress={()=>this.toggleState('contact')} >
                            <CheckBox checked={contact} onPress={()=>this.toggleState('contact')} />
                            <Text style={styles.consentRowText}>I permit the Child Mind Institute to contact me regarding information gathered from this app for clinical or research purposes.</Text>
                        </Row>
                        <Button warning block disabled={!(content && storage)} onPress={this.onNext}>
                            <Text>Next</Text>
                        </Button>
                    </Form>
                </View>
            </Container>
        );
    }
}

function bindActions(dispatch) {
    return {};
}

const mapStateToProps = state => ({themeState: state.drawer.themeState, routes: state.drawer.routes});

export default connect(mapStateToProps, bindActions)(Consent);
