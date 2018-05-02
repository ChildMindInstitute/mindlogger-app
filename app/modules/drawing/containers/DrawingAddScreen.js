import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Toast, Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment, Spinner } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { RNS3 } from 'react-native-aws3';

import DrawingAddForm from '../components/DrawingAddForm';

import { prepareAct } from '../../../helper';
import { addAct, updateAct } from '../../../actions/api';


const drawingInitial = {
  frequency: '1d',
  timer: 0
}

class DrawingAddScreen extends Component {

  constructor(props) {
    super(props);
  }

  onEditDrawing = (body) => {
    
    let {actIndex, updateAct, acts} = this.props
    let drawing = {...this.state.drawing, ...body}
    let {title, ...data} = drawing
    this.toggleSpinner(true)
    return prepareAct(data).then(act_data => {
      return updateAct(actIndex, {id: acts[actIndex].id, title, act_data})
    }).then(res => {
      this.toggleSpinner(false)
      Actions.pop()
    }).catch(error => {
      this.toggleSpinner(false)
      Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
    })
  }

  toggleSpinner = (show = true) => {
    this.setState({spinner: show})
  }

  onAddDrawing = ({title, ...data}) => {
    let {addAct} = this.props
    this.toggleSpinner()
    prepareAct(data).then(act_data => {
      return addAct({act_data, type:'drawing', title})
    })
    .then(res => {
      console.log(res)
      this.toggleSpinner(false)
      Actions.pop()
    }).catch(err => {
      this.toggleSpinner(false)
      Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
    })
  }

  componentWillMount() {
    let {acts, actIndex} = this.props
    if(actIndex!== undefined) {
      const act = acts[actIndex]
      this.setState({drawing: {title: act.title, ...act.act_data}})
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

const mapDispatchToProps = {
  addAct, updateAct
}

const mapStateToProps = state => ({
  acts: state.core.acts,
  themeState: state.drawer.themeState,
  user: state.core.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(DrawingAddScreen);
