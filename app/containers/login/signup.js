import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StatusBar} from 'react-native';
import {connect} from 'react-redux';
import {
    Container,
    Content,
    Button,
    H3,
    Text,
    Form,
    View,
    Header,
    Left,
    Icon,
    Right,
    Body,
    Title,
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
                <Field component={FormInputItem} placeholder="First name" name="first_name" style={styles.text} placeholderTextColor="#aaa" />
                <Field component={FormInputItem} placeholder="Last name" name="last_name" style={styles.text} placeholderTextColor="#aaa"/>
                <Field component={FormInputItem} placeholder="Email" name="email" style={styles.text} placeholderTextColor="#aaa"/>
                <Field component={FormInputItem} placeholder="Password" name="password" style={styles.text} placeholderTextColor="#aaa" secureTextEntry={true}/>
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
                <Header>
                    <Left>
                        <Button transparent onPress={() => Actions.pop()}>
                        <Icon name="close" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>New User</Title>
                    </Body>
                    <Right></Right>
                </Header>
                <Content style={styles.container2}>
                    <SignUpReduxForm onSubmit={this.onSignUp} onForgot={this.onForgot} />
                </Content>
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
