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
import {loginUser} from '../../actions/api';
import {FormInputItem} from '../../components/form/FormItem'
import { auth, base} from '../../firebase'
import styles from './styles';

class LoginForm extends Component {
    onRegister = () => {
        Actions.consent()
    }

    onForgotPassword = () => {
        Actions.forgot_password()
    }
    render() {
        const { handleSubmit, onSubmit, submitting, initialValues, onForgot } = this.props;
        return (
            <Form>
                <Field component={FormInputItem} placeholder="Email" placeholderTextColor={'#aaa'} name="email" keyboardType={'email-address'} autoCapitalize='none' style={styles.text} />
                <Field component={FormInputItem} placeholder="Password" placeholderTextColor={'#aaa'} name="password" style={styles.text} secureTextEntry={true}/>
                <Button style={{marginTop:10}} warning block onPress={handleSubmit(onSubmit)} disabled={submitting}>
                    <Text>Login</Text>
                </Button>
                <Row style={styles.bottomRow}>
                    <Body>
                        <Button transparent onPress={this.onForgotPassword}><Text style={styles.rightText}>GET A NEW PASSWORD</Text></Button>
                    </Body>    
                </Row>
                <Row style={{height: 40}}>
                    <Body><Button transparent onPress={this.onRegister}><Text style={styles.boldText}>Register now</Text></Button></Body>
                </Row>
            </Form>
        )
    }
}

LoginReduxForm = reduxForm({
    form: 'login-form',
    enableReinitialize: true
})(LoginForm)

class Login extends Component { // eslint-disable-line
    componentWillMount() {
        console.ignoredYellowBox = ['Setting a timer']
    }
    render() {
        const {login, user} = this.props
        const {email, password} = user
        console.log(this.props)
        return (
            <Container>
                <StatusBar barStyle='light-content'/>
                <View style={styles.container}>
                    <View style={styles.header}>
                    </View>
                    <LoginReduxForm onSubmit={login} onForgot={this.onForgot} initialValues={{email, password}} />
                </View>
            </Container>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    login: (body) => {
        return dispatch(loginUser(body)).then(res => {
            console.log(res)
            base.update(`users/${res.uid}`, {data:{name: res.displayName, email: res.email}})
            Actions.push('activity')
        }).catch(err => {
            console.log(err)
            let errors = {}
            Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
            switch(err.code) {
                case 'auth/wrong-password':
                    errors.password = err.message
                    break;
                case 'auth/wrong-email':
                    errors.email = err.message
                    break;
            }
            throw new SubmissionError(errors)
        })
    }
})

const mapStateToProps = state => ({
    themeState: state.drawer.themeState,
    routes: state.drawer.routes,
    user: state.core.user || {},
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
