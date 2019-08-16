import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, StatusBar, Text, View } from 'react-native';
import { Markdown } from './core/Markdown';

// eslint-disable-next-line
class AppletAbout extends React.Component {

  constructor() {
    super();
    this.state = {
      markdown: 'loading',
    };
  }

  async componentDidMount() {
    const { about } = this.props;
    if (about) {
      await this.getMD(about);
    } else {
      this.setState({
        markdown: `# ¯\\\\_(ツ)_/¯
        ‍
The authors of this applet have not provided any information!

        `,
      });
    }
  }

  async getMD(url) {
    const resp = await fetch(url);
    const markdown = await resp.text();
    console.log('response is', resp);
    this.setState({
      markdown,
    });
  }

  render() {
    const { markdown } = this.state;
    return (
      <View style={{ padding: 10, backgroundColor: 'white' }}>
        <Markdown>
          {markdown}
        </Markdown>
      </View>
    );
  }
}

AppletAbout.propTypes = {
  about: PropTypes.string.isRequired,
};

export default AppletAbout;
