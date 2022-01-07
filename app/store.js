import { createStore, applyMiddleware, compose } from 'redux';
import { Platform } from 'react-native';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger/src';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import FilesystemStorage from './services/fileSystemStorage';
import rootReducer from './state/root.reducer';

const isAndroid = Platform.OS === 'android';

let store;

export default function configureStore(onCompletion) {
  const persistConfig = {
    key: 'root-v3',
    storage: isAndroid ? FilesystemStorage : storage,
    // whitelist: [],
    blacklist: ['form'],
  };

  const persistedReducer = persistReducer(persistConfig, rootReducer);

  // eslint-disable-next-line no-undef
  const composeEnhancers = (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      // eslint-disable-next-line no-undef
      && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        trace: true,
        traceLimit: 25,
      }))
    || compose;

  const middlewares = [thunk];
  if (__DEV__) {
    middlewares.push(
      createLogger({
        level: 'info',
        collapsed: true,
        diff: true,
      }),
    );
  }

  store = createStore(persistedReducer, {}, composeEnhancers(applyMiddleware(...middlewares)));

  persistStore(store, null, onCompletion);

  return store;
}

export const getStore = () => store;
