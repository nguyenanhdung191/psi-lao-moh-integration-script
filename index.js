const jsonfile = require("jsonfile");

const {
    getEvents,
    transform,
    filterStatus,
    pushData,
    updateStatus
} = require("./utils.js");



(async() => {

    let data = await getEvents("2017-09-16", "2017-10-16");
    let pendingData = filterStatus(data, "Pendding");
    let pushD = transform(pendingData);
    let response = await pushData(pushD);
    updateStatus(response, pendingData);
})()