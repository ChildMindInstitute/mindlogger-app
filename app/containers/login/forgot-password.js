import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StatusBar} from 'react-native';
import {connect} from 'react-redux';
import {
    Container,
    Button,
    H3,
    Text,
    Item,
    Input,
    Form,
    View,
    Header,
    Left,
    Right,
    Icon,
    Title,
    Body,
    Toast,
} from 'native-base';
import {Actions} from 'react-native-router-flux';
import { reduxForm, Field } from 'redux-form';
import {forgotPassword} from '../../actions/api';
import styles from './styles';

class ForgotPassword extends Component { // eslint-disable-line
    componentWillMount() {
        this.setState({})
    }

    onChangeText = (email) => {
        this.setState({email})
    }
    render() {
        const {forgotPassword} = this.props
        const {email} = this.state
        return (
            <Container>
                <StatusBar barStyle='light-content'/>
                <Header>
                    <Left>
                        <Button transparent onPress={() => Actions.pop()}>
                        <Icon name="close" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Forgot password</Title>
                    </Body>
                    <Right></Right>
                </Header>
                <View style={styles.container2}>
                    <Item>
                        <Input
                            placeholder="Email address"
                            style={styles.text}
                            placeholderTextColor="#aaa"
                            type="email" autoCapitalize='none' onChangeText={this.onChangeText} value={email} />
                    </Item>
                    <Button style={styles.button} block onPress={()=>forgotPassword(email)}><Text style={styles.buttonText}>Reset password</Text></Button>
                </View>
            </Container>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    forgotPassword: (email) => {
        return dispatch(forgotPassword({email})).then(res => {
            Toast.show({text:'Reset email has been sent', position: 'bottom', type:'success', duration:1000})
            Actions.replace('login')
        }).catch(err => {
            console.log(err)
            Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
        })
    }
})

const mapStateToProps = state => ({
    routes: state.drawer.routes,
});

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
