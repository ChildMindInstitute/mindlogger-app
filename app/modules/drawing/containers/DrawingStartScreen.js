import React, {Component} from 'react';
import {StyleSheet, StatusBar, Image} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header, Left, Right, Title, Body, Spinner } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import {
    Player,
    MediaStates
  } from 'react-native-audio-toolkit';

import baseTheme from '../../../theme'
import {setDrawing} from '../actions'

class DrawingStartScreen extends Component {
    constructor(props) {
        super(props)
        
    }

    componentWillMount() {
        this.setState({drawing: this.props.drawing})
    }

    componentDidMount() {
        const {drawing} = this.props
        if(drawing.audio_url) {
            this.player = new Player(this.props.drawing.audio_url, {
                autoDestroy: true
            }).prepare((err) => {
                if (err) {
                    console.log('error at _reloadPlayer():');
                    console.log(err);
                } else {
                    this.player.playPause((err, playing) => {
                    })
                }
            });
        }
    }

    toggleSpinner = (show = true) => {
        this.setState({spinner: show})
    }

    onBegin = () => {
        Actions.replace("drawing_activity")
    }

    render() {
        const {drawing, spinner} = this.state
        return (
        <Container>
        <Header>
            <Left>
            <Button transparent onPress={() => Actions.pop()}>
            <Icon name="arrow-back" />
            </Button>
            </Left>
            <Body style={{flex:2}}>
                <Title>{drawing.title}</Title>
            </Body>
            <Right>
            </Right>
        </Header>
        <View style={{ flex: 1 }}>
            {spinner && <Spinner />}
            <View style={{alignItems:'center', flexDirection: 'row', flex: 1}}>
                <View style={baseTheme.centerRow}>
                    {drawing.image_url ? 
                        (<Image style={{width: 300, height: 200}} source={{uri: drawing.image_url}} />) :
                        (<Icon name="brush" style={{fontSize:180}} />)
                    }
                </View>
            </View>
            <View style={{alignItems:'center'}}>
                <Text style={{margin:20}}>{drawing.instruction}</Text>
            </View>
            <View style={{margin: 20}}>
            <Button full onPress={this.onBegin}><Text>Begin</Text></Button>
            </View>
        </View>
        </Container>
        )
    }
}

export default connect(state => ({
    drawing: state.drawing.drawing_in_action,
  }),
  (dispatch) => bindActionCreators({setDrawing}, dispatch)
)(DrawingStartScreen);


