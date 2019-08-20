import React, { Component } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import PropTypes from 'prop-types';
import ScreenDisplay from './ScreenDisplay';
import Widget from './Widget';
import Timer from '../Timer';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    minHeight: '100%',
    justifyContent: 'center',
    flexGrow: 1,
  },
  text: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  delayView: {
    position: 'relative',
    minHeight: 100,
  },
  timerView: {
    position: 'absolute',
    right: 20,
    top: 60,
  },
  delayTimerView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
});

class Screen extends Component {
  static isValid(answer, screen) {
    if (screen.inputType === 'markdown-message') {
      return true;
    }
    return (answer !== null && typeof answer !== 'undefined');
  }

  constructor() {
    super();
    this.state = {
      scrollEnabled: true,
      inputDelayed: false,
      timerActive: false,
    };
    this.interval = null;
    this.startTime = null;
  }

  componentDidMount() {
    const { isCurrent } = this.props;
    if (isCurrent) {
      this._startClock();
    }
  }

  componentDidUpdate(oldProps) {
    const { isCurrent } = this.props;
    if (isCurrent && oldProps.isCurrent === false) {
      this._startClock();
    } else if (oldProps.isCurrent && isCurrent === false) {
      this._resetClock();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  _startClock = () => {
    this.interval = setInterval(this._clockTick, 100);
    this.startTime = Date.now();
  }

  _resetClock = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.setState({
        scrollEnabled: true,
        inputDelayed: false,
        timerActive: false,
      });
    }
  }

  _clockTick = () => {
    const { onChange, screen, answer } = this.props;
    const { delay, timer } = screen;
    const { inputDelayed, timerActive } = this.state;
    const timeElapsed = Date.now() - this.startTime;

    // Set inputDelayed to true if we're in the delay period
    if (delay) {
      if (timeElapsed < delay && inputDelayed === false) {
        this.setState({ inputDelayed: true });
      } else if (timeElapsed >= delay && inputDelayed === true) {
        this.setState({ inputDelayed: false });
      }
    }

    // Advance to next if the timer has expired
    if (timer) {
      const safeDelay = delay || 0;
      const timerEnd = safeDelay + timer;
      if (timeElapsed > safeDelay && timeElapsed < timerEnd && timerActive === false) {
        this.setState({ timerActive: true });
      } else if (timeElapsed >= timerEnd) {
        this.setState({ timerActive: false });
        onChange(answer, true);
      }
    }
  }

  render() {
    const { screen, answer, onChange, isCurrent } = this.props;
    const { scrollEnabled, inputDelayed, timerActive } = this.state;
    return (
      <View style={styles.outer}>
        <ScrollView
          alwaysBounceVertical={false}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          scrollEnabled={scrollEnabled}
        >
          <ScreenDisplay screen={screen} />
          {inputDelayed
            ? (
              <View pointerEvents="none" style={styles.delayView}>
                <View style={styles.delayTimerView}>
                  <Timer
                    duration={screen.delay}
                    color={colors.tertiary}
                    size={50}
                    strokeWidth={5}
                  />
                </View>
                <View style={{ opacity: 0.25 }}>
                  <Widget
                    answer={answer}
                    onChange={onChange}
                    isCurrent={isCurrent}
                    screen={screen}
                    onPress={() => { this.setState({ scrollEnabled: false }); }}
                    onRelease={() => { this.setState({ scrollEnabled: true }); }}
                  />
                </View>
              </View>
            )
            : (
              <Widget
                answer={answer}
                onChange={onChange}
                isCurrent={isCurrent}
                screen={screen}
                onPress={() => { this.setState({ scrollEnabled: false }); }}
                onRelease={() => { this.setState({ scrollEnabled: true }); }}
              />
            )
          }
        </ScrollView>
        {timerActive && (
          <View style={styles.timerView}>
            <Timer duration={screen.timer} color={colors.primary} size={40} />
          </View>
        )}
      </View>
    );
  }
}

Screen.defaultProps = {
  answer: undefined,
};

Screen.propTypes = {
  screen: PropTypes.object.isRequired,
  answer: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool.isRequired,
};

export default Screen;
