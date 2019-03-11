import React from 'react';
import PropTypes from 'prop-types';
import InfoAct from '../../components/InfoAct';

const VolumeInfoScene = ({ activity }) => {
  return <InfoAct activity={activity} />;
};

VolumeInfoScene.propTypes = {
  activity: PropTypes.object.isRequired,
};

export default VolumeInfoScene;
