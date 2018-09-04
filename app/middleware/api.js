import config from '../config';
import { AsyncStorage } from 'react-native';

export default store => next => action => {
    if ((!action.method && !action.path) || action.status) return next(action)

    let { path } = action;
    const { method, type, body } = action;
    const state = store.getState();
    let accessToken;
    
    if (state.core && state.core.auth) {
        var auth = state.core.auth;
        accessToken = auth.token;
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
    return makeRequest(method, path, body, accessToken, action)
        .then(response => {
            store.dispatch({...action, response, status: 'COMPLETE' });
            return Promise.resolve(response);
        })
        .catch(error => {
            store.dispatch({...action, error, status: 'ERRORED' });
            return Promise.reject(error);
        });
}

export const makeRequest = (method, path, data, accessToken, {isMultipartUpload, isJson, extraHeaders}) => {
    let headers = extraHeaders || {};
    if (headers['Girder-Authorization']) {
        
    } else if (accessToken) {
        headers["Girder-Token"] = accessToken;
    }
    
    let body = data;
    if (!isMultipartUpload && isJson) {
        headers.set("Content-Type", "application/json; charset=utf-8");
        body = JSON.stringify(data);
    }
    if (!isJson && method !== 'GET') {
        body = objectToFormData(data);
    }

    return fetch(`${config.apiHost}${path}`, {
            mode: 'cors',
            body,
            method,
            headers
        })
        .then(response => {
            console.log(method, `${config.apiHost}${path}`, body, response);
            const status = response.status;
            try {
                return response.json().then(json => {
                    return status === 200 ? Promise.resolve(json) : Promise.reject(json);
                })
            } catch (error) {
                Promise.reject(error);
            }
        });
}

const endpointGenerics = (state, path) => {
    let newPath = path;
    if (state.core.auth && state.core.auth.id) {
        newPath = newPath.replace(/users\/me/, `users/${state.core.auth.id}`);
    }
    return newPath;
}