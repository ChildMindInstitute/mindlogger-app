import { AppState } from 'react-native';

class IdleTimer {
  _idleTime;

  _countdown;

  _beforeBackgroundTime;

  _timeIsUpCb;

  _appState = AppState.currentState;

  subscribe = (secondsIdleTime, timeIsUpCb) => {
    this._idleTime = secondsIdleTime;
    this._timeIsUpCb = timeIsUpCb;
    this._countdown = secondsIdleTime;
    this._subscription = setInterval(this._decreaseTimer, 1000);
    AppState.addEventListener('change', this._handleAppStateChange);
  };

  unsubscribe = () => {
    this._idleTime = 0;
    this._countdown = 0;
    this._beforeBackgroundTime = new Date();
    this._timeIsUpCb = null;

    AppState.removeEventListener('change', this._handleAppStateChange);
  };

  resetTimer = () => {
    this._countdown = this._idleTime;
  }

  _handleAppStateChange = (nextAppState) => {
    const isInactriveToBackground = this._appState === 'inactive' && nextAppState === 'background';
    const isBackgroundToActive = this._appState === 'background' && nextAppState === 'active';

    if (isInactriveToBackground) {
      this._beforeBackgroundTime = new Date();
    }
    if (isBackgroundToActive) {
      const afterBackground = new Date();
      const dMinutes = Math.round((afterBackground - this._beforeBackgroundTime) / 1000);
      this._decreaseTimer(dMinutes);
    }

    this._appState = nextAppState;
  };

  _decreaseTimer = (seconds = 1) => {
    this._countdown -= seconds;
    this._handleTimerChanged();
  }

  _handleTimerChanged = () => {
    if (this._countdown <= 0) {
      clearInterval(this._subscription);

      if (this._timeIsUpCb) {
        this._timeIsUpCb();
      }
    }
  };
}

export const idleTimer = new IdleTimer();
