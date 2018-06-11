const jsonfile = require("jsonfile");
const { sinceDays } = require("./config.json").psi;
const {
  getOrgs,
  getEvents,
  transform,
  filterStatus,
  pushData,
  updateStatus
} = require("./utils.js");

const moment = require("moment");

(async () => {
  const startDate = moment()
    .subtract(sinceDays, "days")
    .format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");

  let data = await getEvents(startDate, endDate);
  let orgs = await getOrgs();
  // let pendingData = filterStatus(data, "Pendding"); //Pendding
  let pendingData = require("./pendingData.json");
  let pushD = transform(pendingData, orgs);
  console.log(JSON.stringify(pushD));
  // let response = await pushData(pushD);
  // updateStatus(response, pendingData);
})();
