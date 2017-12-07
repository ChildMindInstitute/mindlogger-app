import { auth, base, database} from '../firebase'
import {saveUserLocal} from '../actions/coreActions'
import * as types from '../actions/actionTypes'

const methods = {
    REGISTER_USER: ({email, password}) => auth.createUserWithEmailAndPassword(email, password),
    LOGIN_USER: ({email, password}) => auth.signInWithEmailAndPassword(email, password),
    UPDATE_USER_PASSWORD: ({password}) => auth.currentUser.updatePassword(password),
    UPDATE_USER_PROFILE: (body) => auth.currentUser.updateProfile(body),
    LOGOUT_USER: (body) => auth.signOut(),
    POST: (path, data) => base.post(path, {data}),
    GET: (path, options) => base.fetch(path, options),
    PUSH: (path, data) => base.push(path, {data}),
    DELETE: (path) => base.remove(path),
    FORGOT_PASSWORD: ({email}) => auth.sendPasswordResetEmail(email),
}

export default store => next => action => {
    if ((!action.firebase && !action.path) || action.status) return next(action)
    let promise
    if(action.firebase == 'auth') {
        fbMethod = methods[action.type]
        promise = fbMethod(action.data)
    } else if (action.method) {
        fbMethod = methods[action.method]
        promise = fbMethod(action.path, action.data)
    }
    if (promise) {
        return promise.then((result) => {
            let response = result || true
            store.dispatch({...action, response, status: 'COMPLETE'})
            return Promise.resolve(result)
        }).catch((error) => {
            store.dispatch({...action, error, status: 'ERROR'})
            return Promise.reject(error)
        })
    } else {
        return next(action)
    }
}