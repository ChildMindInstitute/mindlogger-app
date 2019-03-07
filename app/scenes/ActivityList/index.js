import {PushNotificationIOS} from 'react-native';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import PushNotification from 'react-native-push-notification';

import { openDrawer, closeDrawer } from '../../actions/drawer';
import {
    setActivity,
    setNotificationStatus,
    clearNotificationStatus,
    setVolumes,
    setVolume,
    setActs,
    updateQueue,
} from '../../actions/coreActions';

import { 
    addFolder,
    addItem,
    getCollection,
    getFolders,
    getItems,
    getActVariant,
    getUserCollection,
    uploadFile,
} from '../../actions/api';


import { getFileInfoAsync } from '../../helper';
import ActivityScreen from './view';


PushNotification.configure({

    // (optional) Called when Token is generated (iOS and Android)
    onRegister: function(token) {
        console.log( 'TOKEN:', token );
    },

    // (required) Called when a remote or local notification is opened or received
    onNotification: function(notification) {
        console.log( 'NOTIFICATION:', notification );

        // process the notification
        // if (Platform.OS == 'ios') {
        //     this.onNotificationIOS(notification);
        // } else {
        //     this.onNotificationAndroid(notification);
        // }
        // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
        Actions.push('push_act',{notification});
        notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
    //senderID: "YOUR GCM (OR FCM) SENDER ID",

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
        alert: true,
        badge: true,
        sound: true
    },
    visibility: 'public',

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: true,

    /**
      * (optional) default: true
      * - Specified if permissions (ios) and token (android and ios) will requested or not,
      * - if not, you must call PushNotificationsHandler.requestPermissions() later
      */
    requestPermissions: true,
    actions: '["Yes", "No"]',
});



const mapDispatchToProps = dispatch => {
    const downloadActGroup = actGroup => {
        return dispatch(getFolders(actGroup._id, 'acts', 'folder')).then(acts => {
            return Promise.all(acts.map(act => dispatch(getActVariant(act._id))
                .then(arr => {
                    return Promise.all(arr.map(v => dispatch(getItems(v._id))));
                }))).then(res => {
                    return acts;
                });
        });
    }

    const downloadInfoGroup = group => {
        return dispatch(getFolders(group._id, 'infoActs', 'folder')).then(acts => {
            return Promise.all(acts.map(act => dispatch(getActVariant(act._id))
                .then(arr => {
                    return Promise.all(arr.map(v => dispatch(getItems(v._id))));
                }))).then(res => {
                    return acts;
                })
        });
    }

    const downloadVolume = volume => {
        return dispatch(getFolders(volume._id, 'groups', 'folder')).then(res => {
            if (res.length > 0) {
                let actGroup;
                let infoGroup;
                res.forEach(group => {
                    if (group.meta && group.meta.info) {
                        infoGroup = group
                    } else {
                        actGroup = group
                    }
                });
                volume.acts=[];
                volume.infoActs=[];
                let arr = [];
                if (actGroup) {
                    arr.push(downloadActGroup(actGroup).then(acts => {
                        acts.forEach(act => {
                            act.volumeId = volume._id;
                        });
                        volume.acts = acts;
                    }));
                }
                if (infoGroup) {
                    arr.push(downloadInfoGroup(infoGroup).then(acts => {
                        volume.infoActs = acts;
                    }));
                }
                return Promise.all(arr);
            }
        })

    }

    const setupResponse = (user) =>{
        return dispatch(addFolder('Responses', {}, user._id, 'user', true)).then(res => {
            return dispatch(getUserCollection(user._id));
        })
    }

    const downloadAll = (user, progressCallback, completion) => {
        return dispatch(getCollection('Volumes')).then(res => {
            if (res.length>0)
                return dispatch(getFolders(res[0]._id, 'volumes'));
            else
                progressCallback(0,0);
        }).then(arr => {
            let volumes = [];
            let volumeCount = 0;
            let volumeDownloaded = 0;
            for (let index = 0; index < arr.length; index++) {
                const v = arr[index];
                if (v.meta && v.meta.members && v.meta.members.users.includes(user._id)) {
                    volumes.push(v);
                    volumeCount = volumeCount + 1;
                }
            }
            progressCallback(volumeCount, volumeDownloaded);
            let promiseArr = [];
            for (let index = 0; index < volumes.length; index++) {
                const volume = volumes[index];
                promiseArr.push(downloadVolume(volume).then(() => {
                    volumeDownloaded = volumeDownloaded + 1;
                    progressCallback(volumeCount, volumeDownloaded);
                    return true;
                }));
            }
            return Promise.all(promiseArr).then(res => {
                console.log("downloaded all.....");
                dispatch(setVolumes(volumes));
                console.log("Volumes set.....")
                let acts = [];
                volumes.forEach(v => {
                    acts = acts.concat(v.acts)
                });
                dispatch(setActs(acts));
                return acts;
            });
        });
    }

    syncData = (answerCache) => {
        var arr = [];
        answerCache.forEach(({name, payload, volumeName, collectionId, synced}, index) => {
            if (synced) return
            let pr = dispatch(addFolder(volumeName,{},collectionId, 'folder', true)).then(folder => {
                return dispatch(addItem(name, payload, folder._id)).then(res => {
                    let uploadAssets = [];
                    payload.responses.forEach(({data}) => {
                        let file;

                        if (data && data.survey && data.survey.uri) {
                            file = {uri: data.survey.uri, filename: data.survey.filename, type: 'application/octet'};
                        }
                        if (data && data.canvas && data.canvas.uri) {
                            file = {uri: data.canvas.uri, filename: data.canvas.filename, type: 'application/jpg'};
                        }
                        if(file == undefined) return;
                        uploadAssets.push(getFileInfoAsync(file.uri).then(stat => 
                            dispatch(uploadFile(file.filename, {
                                ...file,
                                size: stat.size
                            }, res._modelType, res._id)).then(res=>{
                                return true;
                            }).catch(err => {
                                console.log("Upload asset error", err);
                            })));

                        }
                    );
                    return Promise.all(uploadAssets);
                }).then(res => {
                    answerCache[index].synced = true;
                    console.log("Synced answer", res);
                    return true;
                });
            })
            arr.push(pr);
        });
        return Promise.all(arr).then(res => {
            dispatch(updateQueue(answerCache));
            return arr.length;
        })
    }

    const prepareToStartAct = (volume, data, options) => {
        dispatch(setVolume(volume));
        dispatch(setActivity(data.variant, data.info, options));
    }
    return {
        downloadAll,
        setupResponse,
        syncData,
        prepareToStartAct,
        ...bindActionCreators({
            openDrawer,
            closeDrawer,
            setActivity,
            setNotificationStatus,
            clearNotificationStatus},
            dispatch)
    };
}

const mapStateToProps = ({core: {auth, acts, notifications, checkedTime, volumes, self, actData, userData, answerCache = [], answerData = {}}}) => ({
    auth: auth,
    acts: acts || [],
    notifications: notifications || {},
    checkedTime,
    volumes: volumes || [],
    user: self || {},
    actData: actData || {},
    resCollection: userData && userData[self._id] && userData[self._id].collections && userData[self._id].collections.Responses,
    answerCache,
    answerData,
  });

export default connect(mapStateToProps, mapDispatchToProps)(ActivityScreen);
