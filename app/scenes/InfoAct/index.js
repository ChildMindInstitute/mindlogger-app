import React from 'react';
import PropTypes from 'prop-types';
import InfoAct from '../../components/InfoAct';

const InfoActScene = ({ activity }) => {
  return <InfoAct activity={activity} />;
};

InfoActScene.propTypes = {
  activity: PropTypes.object.isRequired,
};

export default InfoActScene;
