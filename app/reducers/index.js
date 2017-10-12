import { combineReducers } from 'redux';

import drawer from './drawer';
import routes from './routes';
import cardNavigation from './cardNavigation';
import survey from '../modules/survey/reducer';

export default combineReducers({

  drawer,
  cardNavigation,
  routes,
  survey
});
