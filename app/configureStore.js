
import { AsyncStorage } from 'react-native';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { persistStore } from 'redux-persist';
import rootReducer from './state/root.reducer';
import api from './middleware/api';
import auth from './middleware/auth';

export default function configureStore(onCompletion) {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line
  const store = createStore(rootReducer, {}, composeEnhancers(
    applyMiddleware(thunk, api, auth),
  ));
  persistStore(store, { storage: AsyncStorage }, onCompletion);

  // const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  // const store = createStoreWithMiddleware(reducer);
  return store;
}
