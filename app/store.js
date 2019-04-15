import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './state/root.reducer';

let store;

export default function configureStore(onCompletion) {
  const persistConfig = {
    key: 'root',
    storage,
    // whitelist: [],
  };

  const persistedReducer = persistReducer(persistConfig, rootReducer);

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line
  store = createStore(persistedReducer, {}, composeEnhancers(
    applyMiddleware(thunk),
  ));

  persistStore(store, null, onCompletion);

  return store;
}

export const getStore = () => store;
