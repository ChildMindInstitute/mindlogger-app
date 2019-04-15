import React, { Component } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CachedImage } from 'react-native-img-cache';
import { randomLink } from '../../services/helper';
import { fileLink } from '../../services/network';
import { Thumbnail } from 'native-base';
import { authSelector } from '../../state/user/user.selectors';

class GImage extends Component {
  static propTypes = {
    file: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    thumb: PropTypes.bool
  }

  render() {
    const {file, auth, thumb, ...props} = this.props;
    if (!thumb) {
      if(Array.isArray(file))
        return (
          <CachedImage source={{uri: randomLink(file, auth.token)}} {...props}/>
        )
      else
        return (
          <CachedImage source={{uri: fileLink(file, auth.token)}} {...props}/>
        )
    } else {
      return (<Thumbnail source={{uri: fileLink(file, auth.token)}} {...props}/>)
    }
    
  }
}

const mapStateToProps = (state) => ({
  auth: authSelector(state)
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(GImage)
