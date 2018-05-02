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
import { reduxForm, Field, SubmissionError } from 'redux-form';
import {signUp, updateUserProfile} from '../../actions/api';
import {FormInputItem} from '../../components/form/FormItem'
import styles from './styles';

class SignUpForm extends Component {
    onRegister = () => {
        Actions.consent()
    }
    render() {
        const { handleSubmit, onSubmit, submitting, initialValues, onForgot } = this.props;
        return (
            <Form>
                <Field component={FormInputItem} label="First name" name="first_name" style={styles.text} floatingLabel />
                <Field component={FormInputItem} label="Last name" name="last_name" style={styles.text} floatingLabel />
                <Field component={FormInputItem} label="Email" name="email" style={styles.text} floatingLabel />
                <Field component={FormInputItem} label="Password" name="password" style={styles.text} floatingLabel secureTextEntry={true}/>
                <Button
                    warning
                    block
                    style={{marginTop: 40}}
                    disabled={submitting}
                    onPress={handleSubmit(onSubmit)}>
                    <Text>Sign Up</Text>
                </Button>
            </Form>
        )
    }
}

SignUpReduxForm = reduxForm({
    form: 'signup-form'
})(SignUpForm)

class SignUp extends Component { // eslint-disable-line
    onSignUp = ({email, password, first_name, last_name}) => {
        const {signUp, updateUserProfile} = this.props
        return signUp({first_name, last_name, email, password, role: 'user', newsletter: true}).then(user => {
            Toast.show({text:'Success', position: 'bottom', type:'success', duration:1000})
            Actions.replace('login')
        }).catch(error => {
            console.log(error)
            Toast.show({text: error.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
        })
    }
    render() {
        
        return (
            <Container>
                <StatusBar barStyle='light-content'/>
                <View style={styles.container}>
                    <View style={styles.header}>
                    </View>
                    <SignUpReduxForm onSubmit={this.onSignUp} onForgot={this.onForgot} />
                </View>
            </Container>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    signUp: (body) => dispatch(signUp(body)),
    updateUserProfile: (body) => dispatch(updateUserProfile(body)),
})

const mapStateToProps = state => ({ themeState: state.drawer.themeState, routes: state.drawer.routes});

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
