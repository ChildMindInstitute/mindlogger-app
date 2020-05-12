import React, { useState } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { Container } from 'native-base';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { nextScreen, prevScreen } from '../../state/responses/responses.thunks';
import { currentResponsesSelector, itemVisiblitySelector, currentScreenSelector } from '../../state/responses/responses.selectors';
import { setAnswer } from '../../state/responses/responses.actions';
import { currentAppletSelector } from '../../state/app/app.selectors';
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
  isPrevEnabled,
} from '../../services/activityNavigation';

const styles = StyleSheet.create({
  buttonArea: {
    backgroundColor: 'white',
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: 'lightgray',
    shadowOffset: { height: 0, width: 0 },
    elevation: 2,
    zIndex: -1,
  },
});

const Activity = ({
  currentApplet,
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
  const currentItem = R.path(['items', currentScreen], activity);
  const fullScreen = currentItem.fullScreen || activity.fullScreen;
  const autoAdvance = currentItem.autoAdvance || activity.autoAdvance;

  const [isContentError, setContentError] = useState(false);

  return (
    <Container style={{ flex: 1 }}>
      <StatusBar hidden />
      <ActivityScreens
        activity={activity}
        answers={responses}
        currentScreen={currentScreen}
        onChange={(answer, goToNext = false) => {
          setAnswer(currentApplet.id, activity.id, currentScreen, answer);
          if (goToNext || autoAdvance || fullScreen) {
            nextScreen();
          }
        }}
        authToken={authToken}
        onContentError={() => setContentError(true)}
      />
      {!fullScreen && (
        <View style={styles.buttonArea}>
          {activity.items.length > 1 && (
            <ActProgress index={currentScreen} length={activity.items.length} />
          )}
          <ActivityButtons
            nextLabel={getNextLabel(
              currentScreen,
              itemVisibility,
              activity,
              responses,
              isContentError,
            )}
            nextEnabled={isNextEnabled(
              currentScreen,
              activity,
              responses,
            )}
            onPressNext={() => {
              setContentError(false);
              nextScreen();
            }}
            prevLabel={getPrevLabel(currentScreen, itemVisibility)}
            prevEnabled={isPrevEnabled(currentScreen, activity)}
            onPressPrev={prevScreen}
            actionLabel={getActionLabel(
              currentScreen,
              responses,
              activity.items,
            )}
            onPressAction={() => {
              setAnswer(currentApplet.id, activity.id, currentScreen, undefined);
            }}
          />
        </View>
      )}
      {!fullScreen && <ActHeader title={activity.name.en} />}
    </Container>
  );
};

Activity.defaultProps = {
  currentResponse: undefined,
  currentScreen: null,
};

Activity.propTypes = {
  currentApplet: PropTypes.object.isRequired,
  currentResponse: PropTypes.object,
  setAnswer: PropTypes.func.isRequired,
  authToken: PropTypes.string.isRequired,
  currentScreen: PropTypes.number,
  nextScreen: PropTypes.func.isRequired,
  prevScreen: PropTypes.func.isRequired,
  itemVisibility: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  currentApplet: currentAppletSelector(state),
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
