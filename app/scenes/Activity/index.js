import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { Container } from 'native-base';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import {
  nextScreen,
  prevScreen,
} from '../../state/responses/responses.thunks';
import {
  currentResponsesSelector,
  itemVisiblitySelector,
  currentScreenSelector,
} from '../../state/responses/responses.selectors';
import { setAnswer } from '../../state/responses/responses.actions';
import { authTokenSelector } from '../../state/user/user.selectors';
import ActivityScreens from '../../components/ActivityScreens';
import ActHeader from '../../components/header';
import ActProgress from '../../components/progress';
import ActivityButtons from '../../components/ActivityButtons';
import {
  getNextLabel,
  getPrevLabel,
  getActionLabel,
  isNextEnabled,
} from '../../services/activityNavigation';

const styles = StyleSheet.create({
  buttonArea: {
    backgroundColor: 'white',
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: 'lightgray',
    shadowOffset: { height: 0, width: 0 },
    elevation: 2,
  },
});

const Activity = ({
  setAnswer,
  currentResponse,
  authToken,
  currentScreen,
  nextScreen,
  prevScreen,
  itemVisibility,
}) => {
  if (!currentResponse) {
    return <View />;
  }

  const { activity, responses } = currentResponse;

  // Hide the header and footer if it's a certain type of widget
  const currentItem = R.path(['items', currentScreen], activity);
  const inputType = R.path(['inputType'], currentItem);
  const fullScreen = inputType === 'visual-stimulus-response';

  return (
    <Container>
      <StatusBar hidden />
      {!fullScreen && <ActHeader title={activity.name.en} />}
      <ActivityScreens
        activity={activity}
        answers={responses}
        currentScreen={currentScreen}
        onChange={(answer) => {
          setAnswer(activity.id, currentScreen, answer);
          if (inputType === 'visual-stimulus-response'
            || inputType === 'slider') {
            nextScreen();
          }
          if (inputType === 'radio'
            && R.path(['valueConstraints', 'multipleChoice'], currentItem) !== true) {
            nextScreen();
          }
          if (inputType === 'audioStimulus' && R.path(['inputs', 'autoAdvance'], currentItem)) {
            nextScreen();
          }
        }}
        authToken={authToken}
      />
      {!fullScreen && (
        <View style={styles.buttonArea}>
          {activity.items.length > 1 && (
            <ActProgress index={currentScreen} length={activity.items.length} />
          )}
          <ActivityButtons
            nextLabel={getNextLabel(currentScreen, itemVisibility, activity, responses)}
            nextEnabled={isNextEnabled(currentScreen, activity, responses)}
            onPressNext={nextScreen}
            prevLabel={getPrevLabel(currentScreen, itemVisibility)}
            prevEnabled
            onPressPrev={prevScreen}
            actionLabel={getActionLabel(currentScreen, responses, activity.items)}
            onPressAction={() => { setAnswer(activity.id, currentScreen, undefined); }}
          />
        </View>
      )}
    </Container>
  );
};

Activity.defaultProps = {
  currentResponse: undefined,
  currentScreen: null,
};

Activity.propTypes = {
  currentResponse: PropTypes.object,
  setAnswer: PropTypes.func.isRequired,
  authToken: PropTypes.string.isRequired,
  currentScreen: PropTypes.number,
  nextScreen: PropTypes.func.isRequired,
  prevScreen: PropTypes.func.isRequired,
  itemVisibility: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  currentResponse: currentResponsesSelector(state),
  authToken: authTokenSelector(state),
  currentScreen: currentScreenSelector(state),
  itemVisibility: itemVisiblitySelector(state),
});

const mapDispatchToProps = {
  setAnswer,
  nextScreen,
  prevScreen,
};

export default connect(mapStateToProps, mapDispatchToProps)(Activity);
