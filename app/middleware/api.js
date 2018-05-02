import config from '../config';
import { AsyncStorage } from 'react-native';

export default store => next => action => {
    if ((!action.method && !action.path) || action.status) return next(action)

    let { path } = action;
    const { method, type, body, isMultipartUpload } = action;
    const state = store.getState();
    let accessToken;
    
    if (state.core && state.core.auth) {
        var auth = state.core.auth;
        accessToken = auth.access_token;
    }
    

    if (!path || !method || !type) {
        throw new Error('Specify a path, method and type.')
    }

    if (typeof path === 'function') {
        path = path(state);
    }

    // replace endpoint generics such as 'user/me'
    path = endpointGenerics(state, path);

    // fire off request action to reducer
    next({...action, status: 'REQUESTED' });

    // make the request
    return makeRequest(method, path, body, accessToken, isMultipartUpload)
        .then(response => {
            store.dispatch({...action, response, status: 'COMPLETE' });
            console.log("API success:",path, body, response)
            return Promise.resolve(response);
        })
        .catch(error => {
            store.dispatch({...action, error, status: 'ERRORED' });
            return Promise.reject(error);
        });
}

export const makeRequest = (method, path, body, accessToken, isMultipartUpload) => {
    const headers = new Headers({
        "access_token": accessToken,
    });
    if (!isMultipartUpload) {
        headers.set("Content-Type", "application/json; charset=utf-8");
    }
    return fetch(`${config.apiHost}${path}`, {
            mode: 'cors',
            body: isMultipartUpload ? body : JSON.stringify(body),
            method,
            headers
        })
        .then(response => {
            const status = response.status;
            switch (status) {
                case 401:
                    
                    break;
            }
            return response.json();
        })
        .then(json => {
            return json.success ? Promise.resolve(json) : Promise.reject(json);
        });
}

const endpointGenerics = (state, path) => {
    let newPath = path;
    console.log(state);
    if (state.core.auth && state.core.auth.id) {
        newPath = newPath.replace(/users\/me/, `users/${state.core.auth.id}`);
    }
    return newPath;
}