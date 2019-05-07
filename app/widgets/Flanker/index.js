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
      // this.setState({ loadingState: 'downloadError' });
      this.setState({ loadingState: 'ready' });
    });
  }

  render() {
    const { onChange, config, isCurrent } = this.props;
    const { loadingState, images } = this.state;
    if (loadingState === 'ready' && isCurrent) {
      // const injectConfig = `
      //   window.CONFIG = {
      //     leftImage: 'data:image/png;base64, ${images[0]}',
      //     leftImageButton: 'data:image/png;base64, ${images[1]}',
      //     rightImage: 'data:image/png;base64, ${images[2]}',
      //     rightImageButton: 'data:image/png;base64, ${images[3]}',
      //     experimentLength: ${config.experimentLength},
      //   };
      //   start();
      // `;
      const injectConfig = `
        window.CONFIG = {
          leftImage: 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/48/arrow-left.png',
          leftImageButton: 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/png/48/arrow-left.png',
          rightImage: 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/48/arrow-right.png',
          rightImageButton: 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/png/48/arrow-right.png',
          experimentLength: 4,
          showFixation: true,
          showFeedback: true,
          showResults: true,
          trialDuration: 1500,
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
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool.isRequired,
};
