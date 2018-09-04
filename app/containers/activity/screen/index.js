import React, { Component } from 'react'
import { View, Text, Image } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'


class Screen extends Component {
  static propTypes = {
    path: PropTypes.string
  }

  render() {
    const {screen: {meta: data}} = this.props;
    return (
      <View>
        <Image style={{width: '100%', height:'100%', resizeMode: 'contain'}} source={this.props.source}/>
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  screen: state.core.data && state.core.data[ownProps.path] || {meta:{}}
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(Screen)
