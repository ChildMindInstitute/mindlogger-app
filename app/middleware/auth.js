import types from '../actions/actionTypes';
import {setUserLocal, updateUserLocal} from '../actions/coreActions';

export default store => next => action => {
    if(action.status == 'COMPLETE' && action.firebase == 'auth') {
        switch(action.type) {
            case types.REGISTER_USER:
            case types.LOGIN_USER:
                store.dispatch(setUserLocal(action.response))
                break;
            case types.LOGOUT_USER:
                store.dispatch(setUserLocal({}))
                break;
            case types.UPDATE_USER_PROFILE:
            case types.UPDATE_USER_PASSWORD:
                store.dispatch(updateUserLocal(action.response))
                break;
        }
    }
    return next(action);
    
}