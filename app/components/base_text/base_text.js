/* REACT */
import React, { type Node } from 'react';
import { Text } from 'react-native';

/* MODULES */
import { Translation } from 'react-i18next';

/* STYLES */
import styles from './styles';

export default (props) => {
  const { style, children, isTitle, textKey, value, ...restProps } = props;

  return (
    <Text
      allowFontScaling={false}
      numberOfLines={0}
      ellipsizeMode="tail"
      {...restProps}
      style={[styles.text, isTitle && styles.title, ...(Array.isArray(style) ? style : [style])]}
    >
      {textKey ? <Translation>{t => t(textKey)}</Translation> : value || children}
    </Text>
  );
};
