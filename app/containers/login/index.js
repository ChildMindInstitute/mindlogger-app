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
import styles from './styles';

class LoginForm extends Component {
    onRegister = () => {
        Actions.consent()
    }
    render() {
        const { handleSubmit, onSubmit, submitting, initialValues, onForgot } = this.props;
        return (
            <Form>
                <Field component={FormInputItem} label="Email" name="email" style={styles.text} floatingLabel />
                <Field component={FormInputItem} label="Password" name="password" style={styles.text} floatingLabel secureTextEntry={true}/>
                <Row style={{height: 40}}>
                    <Body>
                    </Body>
                    <Right>
                        <Button transparent><Text style={styles.text}>Forgot password?</Text></Button>
                    </Right>
                </Row>
                <Button warning block onPress={handleSubmit(onSubmit)} disabled={submitting}>
                    <Text>Login</Text>
                </Button>
                <Row style={styles.bottomRow}>
                    <Body><Text style={styles.text}>Don't have an account</Text></Body>
                    <Right><Button transparent onPress={this.onRegister}><Text style={styles.boldText}>Register now</Text></Button></Right>
                </Row>
            </Form>
        )
    }
}

LoginReduxForm = reduxForm({
    form: 'login-form'
})(LoginForm)

class Login extends Component { // eslint-disable-line

    render() {
        const {login} = this.props
        return (
            <Container>
                <StatusBar barStyle='light-content'/>
                <View style={styles.container}>
                    <View style={styles.header}>
                    </View>
                    <LoginReduxForm onSubmit={login} onForgot={this.onForgot} />
                </View>
            </Container>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    login: (body) => {
        console.log(body)
        return dispatch(loginUser(body)).then(res => {
            console.log(res)
            Toast.show({text:'Success', position: 'bottom'})
        }).catch(errors => {
            console.log(errors)
            Toast.show({text:'Conenction error', position: 'bottom', type: 'danger'})
            throw new SubmissionError(errors)
        })
    }
})

const mapStateToProps = state => ({navigation: state.cardNavigation, themeState: state.drawer.themeState, routes: state.drawer.routes});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
