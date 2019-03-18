import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { Container } from 'native-base';
import { Actions } from 'react-native-router-flux';
import * as R from 'ramda';
import InfoHeader from './header/info';
import ActProgress from './progress';
import ActivityButtons from './ActivityButtons';
import Screen from './screen';

class InfoAct extends Component {
  constructor(props) {
    super(props);
    const screenLength = R.pathOr(0, ['activity', 'screens', 'length'], props);
    this.state = {
      index: 0,
      answers: new Array(screenLength),
    };
  }

  prev = () => {
    const { index } = this.state;
    if (index === 0) {
      Actions.pop();
    } else {
      this.setState({
        index: index - 1,
      });
    }
  }

  next = () => {
    const { index } = this.state;
    const { activity: { meta: data } } = this.props;
    if (index < data.screens.length - 1) {
      this.setState({ index: index + 1 });
    } else {
      Actions.pop();
    }
  }

  handleAnswer = (answer, index) => {
    const { answers } = this.state;
    this.setState({
      answers: R.update(index, answer, answers),
    });
  }

  render() {
    const { activity, auth } = this.props;
    const { meta: data } = activity;
    const { index, answers } = this.state;
    return (
      <Container>
        <StatusBar barStyle="light-content" />
        <InfoHeader title={activity.name} />
        { data.display && data.display.progress && (
          <ActProgress index={index + 1} length={data.screens.length} />
        )}
        { activity.screens && (
          <Screen
            screen={activity.screens[index]}
            answer={answers[index]}
            onChange={(answer) => { this.handleAnswer(answer, index); }}
            auth={auth}
          />
        )}
        <ActivityButtons
          nextLabel={index === activity.screens.length - 1 ? 'Done' : 'Next'}
          onPressNext={this.next}
          prevLabel="Back"
          onPressPrev={this.prev}
        />
      </Container>
    );
  }
}

InfoAct.propTypes = {
  auth: PropTypes.string.isRequired,
  activity: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: R.path(['core', 'auth'], state),
});

export default connect(mapStateToProps)(InfoAct);
