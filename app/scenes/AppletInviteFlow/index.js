import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { Container, Header, Button } from 'native-base';
import { Actions } from 'react-native-router-flux';
// import { invitesSelector } from '../../state/applets/applets.selectors';
import ActHeader from '../../components/header';
import SlideInView from '../../components/SlideInView';
import { colors } from '../../themes/colors';
import theme from '../../themes/base-theme';
import AboutInvite from './AboutInvite';
import DataInvite from './DataInvite';
import JoinInvite from './JoinInvite';
import { acceptInvitation } from '../../state/applets/applets.thunks';
import { currentInviteSelector } from '../../state/applets/applets.selectors';


const calcPosition = (currentScreen, index) => {
  if (currentScreen < index) {
    return 'right';
  }
  if (currentScreen > index) {
    return 'left';
  }
  return 'middle';
};

const styles = StyleSheet.create({
  buttonArea: {
    backgroundColor: 'white',
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: 'lightgray',
    shadowOffset: { height: 0, width: 0 },
    elevation: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: colors.secondary,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 22,
    fontFamily: theme.fontFamily,
    fontWeight: '300',
    color: colors.primary,
  },
});

// eslint-disable-next-line
class AppletInviteFlow extends Component {
  constructor(props) {
    super(props);
    const { acceptInvitation, currentInvite } = props;
    console.log('PROPS ARE', this.props);
    this.state = {
      currentScreen: 0,
      direction: 'middle',
      steps: [
        <AboutInvite inviteInfo={currentInvite} />,
        <DataInvite inviteInfo={currentInvite} />,
        <JoinInvite onAccept={() => {
          acceptInvitation(currentInvite._id).then(() => {
            Actions.pop();
          });
        }}
        />,
      ],
    };
  }

  render() {
    const { currentScreen, steps, direction } = this.state;
    return (
      <Container>
        {/* Header */}
        <Header style={{ backgroundColor: 'white', borderBottomWidth: 0 }}>
          <ActHeader />
        </Header>

        {/* Content */}
        <View style={{ flex: 1, width: '100%', position: 'relative' }}>
          {steps.map((step, index) => (
            <SlideInView
              key={`intro-screen-${index}`}
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
              }}
              position={calcPosition(currentScreen, index)}
              slideInFrom={direction}
            >
              <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                {step}
              </View>

            </SlideInView>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonArea}>
          <View style={styles.footer}>
            {currentScreen > 0 ? (
              <Button
                transparent
                style={styles.button}
                onPress={() => {
                  this.setState({
                    currentScreen: currentScreen - 1,
                    direction: calcPosition(currentScreen, currentScreen - 1) });
                }}
              >
                <Text style={styles.buttonText}>Back</Text>
              </Button>
            ) : null }
            {currentScreen < steps.length - 1 ? (
              <Button
                transparent
                style={styles.button}
                onPress={() => {
                  this.setState({
                    currentScreen: currentScreen + 1,
                    direction: calcPosition(currentScreen, currentScreen + 1) });
                }}
              >
                <Text style={styles.buttonText}>Next</Text>
              </Button>
            ) : null }
          </View>
        </View>
      </Container>
    );
  }
}

AppletInviteFlow.propTypes = {
  acceptInvitation: PropTypes.func.isRequired,
  currentInvite: PropTypes.string.isRequired,
};

// eslint-disable-next-line
const mapStateToProps = state => ({
  currentInvite: currentInviteSelector(state),
});

const mapDispatchToProps = {
  acceptInvitation,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppletInviteFlow);
