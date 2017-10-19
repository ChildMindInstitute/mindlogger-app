
import { AsyncStorage } from 'react-native';
import devTools from 'remote-redux-devtools';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import { persistStore } from 'redux-persist';
import reducer from './reducers';
import promise from './promise';

export default function configureStore(onCompletion:()=>void):any {


  const store = createStore(reducer);
  const persist = persistStore(store, { storage: AsyncStorage }, onCompletion);

  // const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  // const store = createStoreWithMiddleware(reducer);
  return store
}
