import React from 'react';
import PropTypes from 'prop-types';
import { Button, Footer, FooterTab } from 'native-base';
import { colors } from '../../themes/colors';
import theme from '../../themes/base-theme';
import SurveyIcon from '../../components/Icons/Survey';
import DataIcon from '../../components/Icons/Data';
import AboutIcon from '../../components/Icons/About';
import BaseText from '../../components/base_text/base_text';

// eslint-disable-next-line
class AppletFooter extends React.Component {
  render() {
    const { active, changeTab } = this.props;
    const defaultColor = '#7E7E7E';
    return (
      <Footer>
        <FooterTab>
          <Button vertical active={active === 'survey'} onPress={() => changeTab('survey')}>
            <SurveyIcon color={active === 'survey' ? colors.primary : defaultColor} />
            <BaseText
              style={
                active === 'survey'
                  ? { color: colors.primary, fontWeight: 'bold', fontFamily: theme.fontFamily }
                  : { color: defaultColor, fontFamily: theme.fontFamily }
              }
              textKey="applet_footer:surveys"
            />
          </Button>

          <Button vertical active={active === 'data'} onPress={() => changeTab('data')}>
            <DataIcon color={active === 'data' ? colors.primary : defaultColor} />
            <BaseText
              style={
                active === 'data'
                  ? { color: colors.primary, fontWeight: 'bold', fontFamily: theme.fontFamily }
                  : { color: defaultColor, fontFamily: theme.fontFamily }
              }
              textKey="applet_footer:data"
            />
          </Button>

          <Button vertical active={active === 'about'} onPress={() => changeTab('about')}>
            <AboutIcon color={active === 'about' ? colors.primary : defaultColor} />
            <BaseText
              style={
                active === 'about'
                  ? { color: colors.primary, fontWeight: 'bold', fontFamily: theme.fontFamily }
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
  active: PropTypes.string.isRequired,
  changeTab: PropTypes.func.isRequired,
};

export default AppletFooter;
