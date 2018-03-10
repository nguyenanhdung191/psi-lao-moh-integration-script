const jsonfile = require("jsonfile");
const { startDate, endDate } = require("./config.json").psi;
const {
    getOrgs,
    getEvents,
    transform,
    filterStatus,
    pushData,
    updateStatus
} = require("./utils.js");



(async () => {

    let data = await getEvents(startDate, endDate);
    let orgs = await getOrgs();
    let pendingData = filterStatus(data, "Pending");
    let pushD = transform(pendingData, orgs);
    let response = await pushData(pushD);
    updateStatus(response, pendingData);
})()