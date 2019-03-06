
import { AsyncStorage } from 'react-native';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import { persistStore } from 'redux-persist';
import reducer from './reducers';
import promise from './promise';
import api from './middleware/api';
import auth from './middleware/auth';

export default function configureStore(onCompletion:()=>void):any {

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(reducer, {}, composeEnhancers(
    applyMiddleware(thunk, api, auth),
  ));
  const persist = persistStore(store, { storage: AsyncStorage }, onCompletion);

  // const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  // const store = createStoreWithMiddleware(reducer);
  return store
}
