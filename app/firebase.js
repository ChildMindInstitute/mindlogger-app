
// import firebase from 'firebase';
// import config from './config';
// import 'firebase/auth';
// import 'firebase/database';
// import {
//     Platform,
//     PermissionsAndroid,
//   } from 'react-native';
// import RNFetchBlob from 'react-native-fetch-blob'

// const fbApp = firebase.initializeApp(config.firebase)

// export const database = firebase.database(fbApp)
// export const base = Rebase.createClass(database)
// export const auth = firebase.auth(fbApp)
// export const storageRef = firebase.storage().ref()


// export const fbAddActivity = (module, activity, completion) => {
//     let data = {...activity, author:auth.currentUser.uid}
//     var ref = base.push(module, {data, then: completion})
//     return ref.key
// }
// export const fbUpdateActivity = (module, activity) => {
//   const {key, ...data} = activity
//   return base.update(`${module}/${key}`,{data})
// }

// export const fbUpdateActivityWithAudio = (module, activity) => {
//     if(activity.audio_path) {
//       var filename = activity.audio_path.replace(/^.*[\\\/]/, '')
//       return fbUploadFile(activity.audio_path, 'audios/'+filename).then(url => {
//         activity.audio_url = url
//         let {key, ...data} = activity
//         return base.update(`${module}/${key}`,{data})
//       })
//     } else {
//       let {key, ...data} = activity
//       return base.update(`${module}/${key}`,{data})
//     }
// }

// export const fbAddActivityWithAudio = (module, activity, completion) => {
//   return new Promise((resolve, reject) => {
//     let data = {...activity}
//     if(data.audio_path) {
//       var filename = data.audio_path.replace(/^.*[\\\/]/, '')
//       return fbUploadFile(data.audio_path,`audios/${filename}`).then(url => {
//         data.audio_url = url
//         const key = fbAddActivity(module, data, completion)
//         resolve({...data, key})
//       }).catch(err => {
//         reject(err)
//       })
//     } else {
//       const key = fbAddActivity(module, activity,completion)
//       return resolve({...data, key})
//     }
//   })
  
// }

// export const fbDeleteActivity = (module, activity) => {
//     const {key} = activity
//     return base.remove(`${module}/${key}`)
// }

// export const fbLoadAllActivity = (module, uid) => {
//     return base.fetch(module, {
//         asArray: true,
//         })
// }

// export const fbLoadAllActivityByAuthor = (module, uid) => {
//     return base.fetch(module, {
//         asArray: true,
//         queries: {
//           orderByChild: 'author',
//           equalTo: uid
//         }})
// }

// export const fbSaveAnswer = (activity, completion) => {
//     let {key, ...data} = activity
//     data.old_key = key
//     data.participant = auth.currentUser.uid
//     var ref = base.push('answers', {data, then: completion})
//     return ref.key
// }

// // const Blob = RNFetchBlob.polyfill.Blob
// // const fs = RNFetchBlob.fs
// // window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
// // window.Blob = Blob
// export const fbUploadFile = (uri, targetPath, mime = 'application/octet-stream') => {
//     return new Promise((resolve, reject) => {
//         const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
//         let uploadBlob = null
//         const fileRef = storageRef.child(targetPath)
        
//         fs.readFile(uploadUri, 'base64')
//         .then((data) => {
//           return Blob.build(data, { type: `${mime};BASE64` })
//         })
//         .then((blob) => {
//           uploadBlob = blob
//           return fileRef.put(blob, { cacheControl: 'public,max-age=3600', contentType: mime })
//         })
//         .then((snapshot) => {
//           uploadBlob.close()
//           resolve(snapshot.downloadURL)
//         })
//         .catch((error) => {
//           reject(error)
//         })
//     })
//   }
// export default {
//     database,
//     base,
//     auth,
// }