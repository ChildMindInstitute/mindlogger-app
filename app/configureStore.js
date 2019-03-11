import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './state/root.reducer';
import api from './middleware/api';
import auth from './middleware/auth';

export default function configureStore(onCompletion) {
  const persistConfig = {
    key: 'root',
    storage,
    whitelist: [],
  };

  const persistedReducer = persistReducer(persistConfig, rootReducer);

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line
  const store = createStore(persistedReducer, {}, composeEnhancers(
    applyMiddleware(thunk, api, auth),
  ));

  persistStore(store, null, onCompletion);

  // const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  // const store = createStoreWithMiddleware(reducer);
  return store;
}
