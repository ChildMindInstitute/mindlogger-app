import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CachedImage } from 'react-native-img-cache';
import { Thumbnail } from 'native-base';
import { randomLink } from '../../services/helper';
import { fileLink } from '../../services/network';
import { authSelector } from '../../state/user/user.selectors';

const GImageComponent = ({ file, auth, thumb, ...props }) => {
  if (!thumb && Array.isArray(file)) {
    return (
      <CachedImage
        source={{ uri: randomLink(file, auth.token) }}
        {...props}
      />
    );
  }
  if (!thumb) {
    return (
      <CachedImage
        source={{ uri: fileLink(file, auth.token) }}
        {...props}
      />
    );
  }
  return <Thumbnail source={{ uri: fileLink(file, auth.token) }} {...props} />;
};

GImageComponent.defaultProps = {
  thumb: false,
};

GImageComponent.propTypes = {
  auth: PropTypes.object.isRequired,
  file: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  thumb: PropTypes.bool,
};

const mapStateToProps = state => ({
  auth: authSelector(state),
});

export const GImage = connect(mapStateToProps)(GImageComponent);
