import React from 'react';
import PropTypes from 'prop-types';
import { WebView, View, Text, StyleSheet } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { colors } from '../../theme';

/**
 * This component tries to download the flanker images and convert them to
 * base64 strings. The images are cached using rn-fetch-blob for future offline
 * use.
 */

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorText: {
    color: colors.grey,
  },
});

const requestImage = url => RNFetchBlob
  .config({
    fileCache: true,
  }).fetch('GET', url)
  .then((res) => {
    const { status } = res.info();
    if (status !== 200) {
      throw new Error('Status not 200');
    }
    return res.base64();
  });

export class Flanker extends React.Component {
  constructor() {
    super();
    this.state = { loadingState: 'idle' };
  }

  componentDidMount() {
    const { config } = this.props;
    this.setState({ loadingState: 'downloading' });
    Promise.all([
      requestImage(config.leftImage),
      requestImage(config.leftImageButton),
      requestImage(config.rightImage),
      requestImage(config.rightImageButton),
    ]).then((base64Images) => {
      this.setState({
        loadingState: 'ready',
        images: base64Images,
      });
    }).catch(() => {
      this.setState({ loadingState: 'downloadError' });
    });
  }

  render() {
    const { onChange, config, isCurrent } = this.props;
    const { loadingState, images } = this.state;
    if (loadingState === 'ready' && isCurrent) {
      const injectConfig = `
        window.CONFIG = {
          leftImage: 'data:image/png;base64, ${images[0]}',
          leftImageButton: 'data:image/png;base64, ${images[1]}',
          rightImage: 'data:image/png;base64, ${images[2]}',
          rightImageButton: 'data:image/png;base64, ${images[3]}',
          experimentLength: ${config.experimentLength || 12},
          showFixation: ${config.showFixation !== false ? 'true' : 'false'},
          showFeedback: ${config.showFeedback !== false ? 'true' : 'false'},
          showResults: ${config.showResults !== false ? 'true' : 'false'},
          trialDuration: ${config.trialDuration || 1500},
        };
        start();
      `;
      return (
        <WebView
          source={require('./flanker/index.html')}
          style={{ flex: 1, height: '100%' }}
          scalesPageToFit={false}
          scrollEnabled={false}
          injectedJavaScript={injectConfig}
          onMessage={(e) => {
            const dataString = e.nativeEvent.data;
            const data = JSON.parse(dataString);
            onChange(data);
          }}
        />
      );
    }
    if (loadingState === 'downloadError') {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading task. Please ensure you are connected to the Internet
            and contact your administrator.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.errorContainer} />
    );
  }
}

Flanker.propTypes = {
  config: PropTypes.shape({
    leftImage: PropTypes.string,
    leftImageButton: PropTypes.string,
    rightImage: PropTypes.string,
    rightImageButton: PropTypes.string,
    showFixation: PropTypes.bool,
    showFeedback: PropTypes.bool,
    showResults: PropTypes.bool,
    trialDuration: PropTypes.number,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool.isRequired,
};
