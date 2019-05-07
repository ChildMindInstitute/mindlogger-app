import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Header, View } from 'native-base';
import { skinSelector } from '../../state/app/app.selectors';

class SkinnedHeader extends Component {
  render() {
    const { skin } = this.props;
    return (
      <Header>
      </Header>
    )
  }
}

SkinnedHeader.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  skin: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  skin: skinSelector(state),
});

export default connect(mapStateToProps, null)(SkinnedHeader);
