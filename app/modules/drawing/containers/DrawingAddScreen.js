import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment, Spinner } from 'native-base';

import { Actions } from 'react-native-router-flux';
import DrawingAddForm from '../components/DrawingAddForm';
import {addDrawing, updateDrawing} from '../actions'
import {fbAddActivityWithAudio, fbUpdateActivityWithAudio, fbUploadFile} from '../../../firebase'

const drawingInitial = {
  frequency: '1d',
  timer: 0
}

class DrawingAddScreen extends Component {

  constructor(props) {
    super(props);
  }

  onEditDrawing = (body) => {
    let {drawingIdx} = this.props
    let drawing = {...this.state.drawing, ...body}
    this.props.updateDrawing(drawingIdx, drawing)
    this.toggleSpinner(true)
    return fbUpdateActivityWithAudio('drawings', drawing).then(result => {
      this.toggleSpinner(false)
      Actions.pop()
    }).catch(error => {
      this.toggleSpinner(false)
      console.log(error)
    })
  }

  toggleSpinner = (show = true) => {
    this.setState({spinner: show})
  }

  onAddDrawing = (body) => {
    let {addDrawing} = this.props
    let data = {...body, 'activity_type':'drawing'}
    this.toggleSpinner()
    return fbAddActivityWithAudio('drawings', data, result => {
      this.toggleSpinner(false)
      console.log("pushed", result)
    }).then(res => {
      this.toggleSpinner(false)
      return addDrawing(res)
    }).catch(err => {
      this.toggleSpinner(false)
    })
  }

  componentWillMount() {
    let {drawings, drawingIdx} = this.props
    if(drawingIdx) {
      const drawing = drawings[drawingIdx]
      this.setState({drawing})
    } else {
      this.setState({})
    }
  }

  render() {
    const {drawing, spinner} = this.state;
    let title = drawing ? drawing.title : "New Drawing"
    return (
      <Container>
        <Header hasTabs>
          <Left>
            <Button transparent onPress={() => Actions.pop()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{title}</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
          {drawing ? (<DrawingAddForm onSubmit={this.onEditDrawing} initialValues={drawing}/>) : (<DrawingAddForm onSubmit={this.onAddDrawing} initialValues={drawingInitial}/>) }
          {spinner && <Spinner />}
        </Content>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  addDrawing: body => {
    dispatch(addDrawing(body))
    Actions.pop()
  },
  updateDrawing: (drawingIdx, body) => dispatch(updateDrawing(drawingIdx, body))
})

const mapStateToProps = state => ({
  drawings: state.drawing.drawings,
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps, mapDispatchToProps)(DrawingAddScreen);
