import React, { Component } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CachedImage } from 'react-native-img-cache';
import { randomLink } from '../../helper';

class GImage extends Component {
  static propTypes = {
    file: PropTypes.array,
  }

  render() {
    const {file, auth, ...props} = this.props;
    return (
      <CachedImage source={{uri: randomLink(file, auth.token)}} {...props}/>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.core.auth
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(GImage)
