import React, { Component } from 'react';
import { connect } from 'react-redux';

import InfoAct from '../../components/InfoAct';

class VolumeInfo extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {act} = this.props;
    return (
      <InfoAct act={act} />
      );
  }
}

export default connect(state => ({
    
  }),
  {
    
  }
)(VolumeInfo);
