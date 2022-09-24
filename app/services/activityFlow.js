export const getActivitiesOfFlow = (applet, flow) => {
  return applet.activities.filter(act => flow.order.includes(act.name.en));
};

