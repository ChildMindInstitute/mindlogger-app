export const ALL_APPLETS_ID = 'applet/all_applets';

const AllAppletsModel = {
  about: { en: 'All Applets' },
  activities: [],
  id: ALL_APPLETS_ID,
  name: { en: 'All Applets' },
  visibility: {
    ema_morning: true,
    ema_evening: true,
  },
};

export const isAllAppletsModel = appletId => appletId === ALL_APPLETS_ID;
export default AllAppletsModel;
