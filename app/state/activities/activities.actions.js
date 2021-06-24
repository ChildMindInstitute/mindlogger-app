export const setActivities = (data) => {
  console.log('-----------dddds');
  console.log(data);
  return({
  type: "SET_ACTIVITIES",
  payload: data,
})};
