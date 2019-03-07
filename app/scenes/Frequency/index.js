import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment, Spinner, Toast, View } from 'native-base';
import {PushNotificationIOS, Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';
import { Actions } from 'react-native-router-flux';

import { FormInputDatePicker } from '../../components/form/FormItem';
import { updateActivity } from '../../actions/coreActions';

class FrequencyForm extends Component {

    constructor(props) {
        super(props)
    }

    componentWillMount() {
        this.setState({...this.props.initialValues})
    }

    render() {
        const { handleSubmit, onSubmit, submitting, initialValues } = this.props;

        return (
            <Form>
                <Text>Frequency - Every {initialValues.act_data.frequency}</Text>
                <Field name="time_of_day" component={FormInputDatePicker} style={{height:50}}/>
                <Button onPress={handleSubmit(onSubmit)} disabled={submitting} block style={{ margin: 15, marginTop: 50 }}>
                    <Text>{ "Update" }</Text>
                </Button>
            </Form>)
    }
}

const FrequencyReduxForm = reduxForm({
    form: 'frequency-form'
})(FrequencyForm)


class FrequencyScreen extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    let {acts, actIndex} = this.props
    const act = acts[actIndex]
    this.setState({act})
  }

  onChangeTime = ({time_of_day}) => {
    let {acts, actIndex} = this.props
    const {act} = this.state
    const {frequency} = act.act_data
    act.time_of_day = time_of_day
    let repeatType
    frequency
    let interval = parseInt(frequency.substring(0, frequency.length-1))
    switch(frequency.substring(frequency.length-1))
    {
        case 'h':
            repeatType = 'hour'
            break;
        case 'd':
            repeatType = 'day'
            break;
        case 'w':
            repeatType = 'week'
            break;
        case 'm':
            repeatType = 'month'
            break;
    }
    if (Platform.OS == 'ios') {
        if(repeatType){
            if(interval>1) {
                for(var i=0; i<interval; i++) {
                    PushNotificationIOS.cancelLocalNotifications({act_id: act.id, time_id:i})
                    let ftime = new Date(time_of_day.getTime() + i*interval*3600*1000)
                    PushNotificationIOS.scheduleLocalNotification({fireDate: ftime.toISOString,alertTitle:`Time for ${act.type}`, alertBody: `Please take ${act.type} : ${act.title}`, isSilent:false, userInfo:{act_id:act.id, time_id:i}, repeatInterval: repeatType})
                }
            } else {
                PushNotificationIOS.cancelLocalNotifications({act_id: act.id})
                PushNotificationIOS.scheduleLocalNotification({fireDate: time_of_day.toISOString,alertTitle:`Time for ${act.type}`, alertBody: `Please take ${act.type} : ${act.title}`, isSilent:false, userInfo:{act_id:act.id}, repeatInterval: repeatType})
            }
        } else {
            PushNotificationIOS.cancelLocalNotifications({act_id: act.id})
            PushNotificationIOS.scheduleLocalNotification({fireDate: time_of_day.toISOString,alertTitle:`Time for ${act.type}`, alertBody: `Please take ${act.type} : ${act.title}`, isSilent:false, userInfo:{act_id:act.id}})
        }
    } else {
        if(repeatType) {
            if(interval>1) {
                for(var i=0; i<interval; i++) {
                    let ftime = new Date(time_of_day.getTime() + i*interval*3600*1000)
                    PushNotification.localNotification({
                        id: `${act.id}${i}`,
                        title: `Time for ${act.type} : ${act.title}`,
                        message: `Please take ${act.type}`,
                        repeatType,
                        fireDate: ftime.toISOString
                    })
                }
            } else {
                PushNotification.localNotification({
                    id: `${act.id}0`,
                    title: `Time for ${act.type} : ${act.title}`,
                    message: `Please take ${act.type}`,
                    repeatType,
                    fireDate: time_of_day.toISOString
                })
            }
        } else {
            PushNotification.localNotification({
                id: `${act.id}0`,
                title: `Time for ${act.type} : ${act.title}`,
                message: `Please take ${act.type}`,
                fireDate: time_of_day
            })
        }
    }
    updateActivity(actIndex, act)
    Actions.pop()
  }

  render() {
    const {act, spinner} = this.state;
    return (
      <Container>
        <Header hasTabs>
          <Left>
            <Button transparent onPress={() => Actions.pop()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{act.title}</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
            <View style={{alignItems: 'center'}}>
                <FrequencyReduxForm onSubmit={this.onChangeTime} initialValues={act}/>
            </View>
        </Content>
      </Container>
    );
  }
}

const mapDispatchToProps = {
  updateActivity
}

const mapStateToProps = state => ({
  acts: state.core.acts,
  user: state.core.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(FrequencyScreen);
