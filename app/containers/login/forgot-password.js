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
    Label,
    Input,
    Form,
    View,
    Header,
    Right,
    Row,
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
                <View style={styles.container}>
                    <Item floatingLabel>
                        <Label style={styles.text}>Email address</Label>
                        <Input style={styles.text} onChangeText={this.onChangeText} value={email} />
                    </Item>
                    <Button full block onPress={()=>forgotPassword(email)}><Text>Reset password</Text></Button>
                </View>
            </Container>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    forgotPassword: (email) => {
        return dispatch(forgotPassword(email)).then(res => {
            console.log(res)
            Actions.replace('login')
        }).catch(err => {
            console.log(err)
            Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
        })
    }
})

const mapStateToProps = state => ({
    themeState: state.drawer.themeState,
    routes: state.drawer.routes,
});

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
