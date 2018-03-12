const fetch = require("node-fetch");
const moment = require("moment");

const {
    psi,
    hmis
} = require("./config.json");

const {
    deMapping,
    optionSets,
    programStage,
    program
} = require("./config.json");

const createAuthenticationHeader = (username, password) => {
    return "Basic " + new Buffer(username + ":" + password).toString("base64");
};

const getOrgs = async () => {
    let result = await fetch(`${psi.baseUrl}/api/organisationUnits.json?filter=ancestors.id:eq:ahlcUyvOgQT&fields=id,name,displayName,attributeValues&paging=false`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: createAuthenticationHeader(psi.username, psi.password)
        }
    })
        .then(function (res) {
            return res;
        });

    let json = await result.json();
    return json;
}

const getEvents = async (startDate, endDate) => {
    let result = await fetch(`${psi.baseUrl}/api/events.json?program=RjBwXyc5I66&startDate=${startDate}&endDate=${endDate}&skipPaging=true`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: createAuthenticationHeader(psi.username, psi.password)
        }
    })
        .then(function (res) {
            return res;
        });

    let json = await result.json();
    return json;
};

const filterStatus = (data, status) => {
    return data.events.filter((x) => x.dataValues.find((y) => y.value == `${status}`));
};

const transform = (cases, orgs) => {
    let payload = {
        events: []
    };

    cases.forEach(c => {

        let orgsCode = orgs.organisationUnits.find(x => x.id == c["orgUnit"]).attributeValues[0].value;
        let event = {
            event: c["event"],
            eventDate: c["eventDate"],
            // orgUnit: c["orgUnit"],
            orgUnit: (orgsCode) ? orgsCode : c["orgUnit"],
            program: program[c["program"]],
            programStage: programStage[c["programStage"]],
            dataValues: []
        };

        for (var key in deMapping) {
            let temp = c.dataValues.find((x) => x.dataElement == `${key}`);
            if (temp != null) {
                let dataValue = {};
                dataValue["dataElement"] = deMapping[key].mapping;
                dataValue["value"] = (deMapping[key].optionSet) ? optionSets[deMapping[key].optionSet][temp.value] : temp.value;
                event.dataValues.push(dataValue);
            }
        }
        payload.events.push(event);
    });
    return payload;
};

const updateStatus = async (res, data) => {

    let payload = {
        events: []
    };

    if (res.response.importSummaries == null || res.response.importSummaries.length < 1) {
        console.log("Something go wrong! The reason may be NO 'Pending Event' from source side or can't push events to destination!");
        console.log(JSON.stringify(res));
        return;
    }

    res.response.importSummaries.forEach((re, index) => {

        let status = data[index].dataValues.find((x) => x.dataElement == `MLbNyweMihi`);
        status["value"] = (re.status == "SUCCESS") ? "Synced" : "Rejected";
        if (status["value"] === "Synced") {
            data[index].dataValues.push({
                dataElement: "N5B5r1okTqq",
                value: moment().format("YYYY-MM-DDTHH:mm:ss")
            });
        } else {
            data[index].dataValues.push({
                dataElement: "hjSIBxruyJA",
                value: re.description
            });
        }
        payload.events.push(data[index]);
    })
    await fetch(psi.baseUrl + "/api/events", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: createAuthenticationHeader(psi.username, psi.password)
        },
        body: JSON.stringify(payload)
    })
        .then(function (res) {
            return res.json();
        })
        .then(json => {
            console.log("Update status done!!");
        });
};

const pushData = async (data) => {
    let result = await fetch(`${hmis.baseUrl}/api/events?orgUnitIdScheme=CODE`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: createAuthenticationHeader(hmis.username, hmis.password)
        },
        body: JSON.stringify(data)
    })
        .then(function (res) {
            return res;
        });
    let json = await result.json();
    console.log("Push events done!!");
    return json;
};

module.exports = {
    getOrgs,
    getEvents,
    transform,
    filterStatus,
    pushData,
    updateStatus
}