const jsonfile = require("jsonfile");
const { startDate, endDate } = require("./config.json").psi;
const {
    getEvents,
    transform,
    filterStatus,
    pushData,
    updateStatus
} = require("./utils.js");



(async() => {

    let data = await getEvents(startDate, endDate);
    let pendingData = filterStatus(data, "Pendding");
    let pushD = transform(pendingData);
    let response = await pushData(pushD);
    updateStatus(response, pendingData);
})()