import React from 'react';
import PropTypes from 'prop-types';
import { Button, Footer, FooterTab } from 'native-base';
import { colors } from '../../themes/colors';
import theme from '../../themes/base-theme';
import SurveyIcon from '../../components/Icons/Survey';
import DataIcon from '../../components/Icons/Data';
import AboutIcon from '../../components/Icons/About';
import BaseText from '../../components/base_text/base_text';
import { isTokenLoggerApplet } from '../../services/tokens';

// eslint-disable-next-line
class AppletFooter extends React.Component {
  render() {
    const { active, changeTab, applet } = this.props;
    const tokenLogger = isTokenLoggerApplet(applet);

    const defaultColor = tokenLogger ? '#A5A3A3' : '#7E7E7E';
    const activeColor = tokenLogger ? '#1F5FA0' : applet && applet.theme && applet.theme.primaryColor ? applet.theme.primaryColor : colors.primary;

    return (
      <Footer>
        <FooterTab>
          <Button vertical active={active === 'activity'} onPress={() => changeTab('activity')}>
            <SurveyIcon color={active === 'activity' ? activeColor : defaultColor} tokenLogger={tokenLogger} />
            <BaseText
              style={
                active === 'activity'
                  ? { color: activeColor, fontWeight: 'bold', fontFamily: theme.fontFamily }
                  : { color: defaultColor, fontFamily: theme.fontFamily }
              }
              textKey="applet_footer:activities"
            />
          </Button>

          <Button vertical active={active === 'data'} onPress={() => changeTab('data')}>
            <DataIcon color={active === 'data' ? activeColor : defaultColor} tokenLogger={tokenLogger} />
            <BaseText
              style={
                active === 'data'
                  ? { color: activeColor, fontWeight: 'bold', fontFamily: theme.fontFamily }
                  : { color: defaultColor, fontFamily: theme.fontFamily }
              }
              textKey="applet_footer:data"
            />
          </Button>

          <Button vertical active={active === 'about'} onPress={() => changeTab('about')}>
            <AboutIcon color={active === 'about' ? activeColor : defaultColor} tokenLogger={tokenLogger} />
            <BaseText
              style={
                active === 'about'
                  ? { color: activeColor, fontWeight: 'bold', fontFamily: theme.fontFamily }
                  : { color: defaultColor, fontFamily: theme.fontFamily }
              }
              textKey="applet_footer:about"
            />
          </Button>
        </FooterTab>
      </Footer>
    );
  }
}

AppletFooter.propTypes = {
  applet: PropTypes.object.isRequired,
  active: PropTypes.string.isRequired,
  changeTab: PropTypes.func.isRequired,
};

export default AppletFooter;
