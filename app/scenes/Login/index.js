import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StatusBar, TouchableOpacity, Image} from 'react-native';
import {connect} from 'react-redux';
import {
    Container,
    Content,
    Button,
    Text,
    Form,
    View,
    Toast,
} from 'native-base';
import {Actions} from 'react-native-router-flux';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import {signIn} from '../../actions/api';
import {FormInputItem} from '../../components/form/FormItem'
import styles from './styles';

const logoImage = require('../../../img/CMI_white_logo.png');

class LoginForm extends Component {
    onRegister = () => {
        Actions.consent()
    }
    render() {
        const { handleSubmit, onSubmit, submitting, initialValues } = this.props;
        return (
            <Form>
                <Field component={FormInputItem} placeholder="Username" placeholderTextColor={'#aaa'} name="user" autoCapitalize='none' style={styles.text} />
                <Field component={FormInputItem} placeholder="Password" placeholderTextColor={'#aaa'} name="password" style={styles.text} secureTextEntry={true}/>
                <Button style={styles.button} block onPress={handleSubmit(onSubmit)} disabled={submitting}>
                    <Text style={styles.buttonText}>LOGIN</Text>
                </Button>
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

    componentDidUpdate() {
        console.log(this.props.auth);
        if (this.props.auth.token) {
            Actions.reset('activity');
        }
    }

    onRegister = () => {
        Actions.sign_up();
    }
    onForgotPassword = () => {
        Actions.forgot_password();
    }
    onAbout = () => {
        Actions.about_app();
    }
    render() {
        const {login, user, auth} = this.props;
        
        const {email, password} = user
        return (
            <Container>
                <StatusBar barStyle='light-content'/>
                <Content style={styles.container}>
                    <Text style={styles.header}>
                        Mindlogger
                    </Text>
                    <LoginReduxForm onSubmit={login} initialValues={{email, password}} />
                    <View style={styles.bottomRow}>
                        <TouchableOpacity onPress={this.onRegister}><Text style={styles.whiteText}>New user</Text></TouchableOpacity>
                        <Text style={styles.whiteText}> or  </Text>
                        <TouchableOpacity onPress={this.onForgotPassword}><Text style={styles.whiteText}>forgot password</Text></TouchableOpacity>
                        <Text style={styles.whiteText}>?</Text>
                    </View>
                    <View>
                        <TouchableOpacity onPress={this.onAbout}><Text style={styles.whiteText}>What is Mindlogger?</Text></TouchableOpacity>
                    </View>
                    <View style={{marginTop: 26}}>
                        <Image
                            square
                            style={styles.logo}
                            source={logoImage}
                            />
                    </View>
                </Content>
            </Container>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    login: (body) => {
        if(!body.password || body.password.length == 0) {
            throw new SubmissionError({password:'Password can not be empty!'})
        }
        return dispatch(signIn(body)).then(res => {
            console.log(res)
            return true
        }).then(res => {
            Actions.reset('activity', {isLogin: true})
        }).catch(err => {
            console.log(err)
            let errors = {}
            Toast.show({text: err.message, position: 'top', type: 'danger', buttonText: 'OK'})
            throw new SubmissionError(errors)
        })
    }
})

const mapStateToProps = state => ({
    routes: state.drawer.routes,
    auth: state.core.auth || {},
    user: state.core.self || {}
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
