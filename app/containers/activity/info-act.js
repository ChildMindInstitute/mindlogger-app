import React, { Component } from 'react';
import { connect } from 'react-redux';
import InfoAct from './InfoAct';

class InfoActScreen extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.setState({index: 0, answers:[]});
  }

  render() {
    const {act} = this.props;
    return (
      <InfoAct act={act}/>
      );
  }

}

export default connect(state => ({
    act: state.core.actInfo,
  }),
  {
    
  }
)(InfoActScreen);
