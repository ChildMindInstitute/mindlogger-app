import React from "react";
import PropTypes from "prop-types";
import { View, Image } from "react-native";
import i18n from "i18next";
import { AboutView } from "./core/AboutView";

// eslint-disable-next-line
class AppletAbout extends React.Component {
  constructor() {
    super();
    this.state = {
      markdown: i18n.t("applet_about:loading"),
    };
  }

  async componentDidMount() {
    const { about, aboutContent } = this.props.applet;

    if (about && about.en) {
      await this.getMD(about.en);
    } else if (aboutContent && aboutContent.en) {
      this.setState({
        markdown: aboutContent.en,
      });
    } else {
      this.setState({
        markdown: `# ¯\\\\_(ツ)_/¯
        ‍
${i18n.t("applet_about:no_info")}

        `,
      });
    }
  }

  async getMD(url) {
    const resp = await fetch(url);
    const markdown = await resp.text();

    this.setState({
      markdown,
    });
  }

  render() {
    const { markdown } = this.state;
    const { landingPageType } = this.props.applet;

    return (
      <View style={{ padding: landingPageType != 'image' ? 10 : 0, height: '100%' }}>
        {
          (landingPageType == 'markdown' || landingPageType == 'text') && (
            <AboutView>{markdown}</AboutView>
          ) || (
            <Image source={{ uri: markdown }} style={{
              flex: 1,
              width: "100%",
              resizeMode: "cover",
            }} />
          )
        }
      </View>
    );
  }
}

AppletAbout.propTypes = {
  applet: PropTypes.object.isRequired,
};

export default AppletAbout;
