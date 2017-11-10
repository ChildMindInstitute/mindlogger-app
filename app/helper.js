import React from 'react'

import {auth, base} from './firebase'

export const fbAddActivity = (module, activity, completion) => {
    let data = {...activity, uid:auth.currentUser.uid}
    var ref = base.push(module, {data, then: completion})
    return ref.key
}

export const fbUpdateActivity = (module, activity) => {
    const {key, ...data} = activity
    return base.update(`${module}/${key}`,{data})
}

export const fbDeleteActivity = (module, activity) => {
    const {key} = activity
    return base.remove(`${module}/${key}`)
}

export const fbLoadAllActivity = (module, uid) => {
    return base.fetch(module, {
        asArray: true,
        queries: {
          orderByChild: 'author',
          equalTo: uid
        }})
}