import React, { useState, useEffect } from 'react';
import { StatusBar, View, StyleSheet, Alert } from 'react-native';
import { Container } from 'native-base';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import _ from 'lodash';
import { Actions } from 'react-native-router-flux';
import { currentPrizesActivitySelector } from '../../state/app/app.selectors';
import { usePrevious } from '../../services/hooks';

import { setSelected } from '../../state/responses/responses.actions';

import ActivityScreen from '../../components/screen';
import SlideInView from '../../components/SlideInView';
import ActHeader from '../../components/header';
import ActProgress from '../../components/progress';
import ActivityButtons from '../../components/ActivityButtons';
import { calcPosition } from '../../components/ActivityScreens'

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

const PAGES = ['PRIZES_LIST', 'CONFIRM'];

const TokenPrizesActivity = ({
  currentPrizesActivity,
  isSelected,
  setSelected,
}) => {
  const [balance, setBalance] = useState(10);
  const prizesScreen = {
    ...currentPrizesActivity.items[0],
    info: {
      en: `Balance: ${balance} Tokens`,
    },
  };
  const [answer, setAnswer] = useState(-1);
  const [confirm, setConfirm] = useState(-1);
  const [prize, setPrize] = useState({});
  const [confirmScreen, setConfirmScreen] = useState(currentPrizesActivity.items[1]);
  const [page, setPage] = useState(0);
  const prevPage = usePrevious(page);

  const fullScreen = currentPrizesActivity.fullScreen;
  const autoAdvance = currentPrizesActivity.autoAdvance;

  const handleSelectPrize = (ans, goToNext) => {
    setAnswer(ans);
    const selPrize = R.find(R.propEq('value', ans))(prizesScreen.valueConstraints.itemList);
    if (selPrize) {
      setPrize(selPrize);
      setConfirmScreen(prev => ({
        ...prev,
        question: {
          en: `${(selPrize.image ? `\r\n\r\n![confirm](${selPrize.image} =150x150)` : '')}
              \r\n\r\nDo you want ${selPrize.name.en} for ${selPrize.value} tokens`,
        },
      }));
      setPage(1);
    }
    setSelected(false);
  };

  const handleSelectConfirm = (ans, goToNext) => {
    setConfirm(ans);
    if (ans === 1) { // Yes
      Actions.push('activity_thanks');
    } else {
      setPage(0);
    }
    setSelected(false);
  };

  return (
    <Container style={{ flex: 1 }}>
      <StatusBar hidden />
      <View style={{ flex: 1, width: '100%', position: 'relative' }}>
        <SlideInView
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
          }}
          position={calcPosition(page, 0)}
          slideInFrom={calcPosition(prevPage, page)}
        >
          <ActivityScreen
            screen={prizesScreen}
            answer={answer}
            onChange={(ans, goToNext = false) => handleSelectPrize(ans, goToNext)}
            isCurrent={page === 0}
            onContentError={() => {}}
          />
        </SlideInView>
        <SlideInView
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
          }}
          position={calcPosition(page, 1)}
          slideInFrom={calcPosition(prevPage, page)}
        >
          <ActivityScreen
            screen={confirmScreen}
            answer={confirm}
            onChange={(ans, goToNext = false) => handleSelectConfirm(ans, goToNext)}
            isCurrent={page === 1}
            onContentError={() => {}}
          />
        </SlideInView>
      </View>
      {!fullScreen && (
        <View style={styles.buttonArea}>
          <ActProgress index={page} length={2} />
          <ActivityButtons
            nextEnabled={false}
            prevLabel="Back"
            prevEnabled
            onPressPrev={() => {
              if (page === 1) {
                setPage(0);
              } else {
                Actions.pop();
              }
              if (isSelected) {
                setSelected(false);
              }
            }}
          />
        </View>
      )}
      {!fullScreen && <ActHeader title={currentPrizesActivity.name.en} />}
    </Container>
  );
};

TokenPrizesActivity.propTypes = {
  currentPrizesActivity: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  setSelected: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isSelected: state.responses.isSelected,
  currentPrizesActivity: currentPrizesActivitySelector(state),
});

const mapDispatchToProps = {
  setSelected,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TokenPrizesActivity);
