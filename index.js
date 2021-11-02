const fs = require("fs");
const clicks = require("./clicks.json");

const getNumberOfClicksPerIp = () => {
    var numberOfClicksPerIp = {};
    clicks.forEach(function (click) {
        if(numberOfClicksPerIp[click.ip]) {
            numberOfClicksPerIp[click.ip]++;
        } else {
            numberOfClicksPerIp[click.ip] = 1;
        }
    });

    return numberOfClicksPerIp;
};

const clickedInSameHour = (presentClickTimestamp, ipSet) => {
    var prevDate;
    var presentDate = new Date(presentClickTimestamp).getHours();
    if (ipSet.length < 1) {
        return true;
    } else { 
        prevDate = new Date(ipSet[ipSet.length - 1].timestamp).getHours();
        const diff = presentDate - prevDate;
        return diff === 0;
    }
};

const getResultedData = (ipSet, click) => {
    if(clickedInSameHour(click.timestamp, ipSet) && ipSet.length >= 1) {
        return checkForExpensiveClicks(click, ipSet);
    } else {
        ipSet.push(click);
        return ipSet;
    }
};

const checkForDeplicateIPsAndAmounts = (presentClick, ipSet) => {
    var duplicate = ipSet.find(clickItem => {
        return clickItem.ip === presentClick.ip && clickItem.amount === presentClick.amount;
    });
    if (duplicate) {
        return ipSet;
    } else {
        ipSet.push(presentClick);
        return ipSet;
    }
};

const checkForExpensiveClicks = (presentClick, ipSet) => {
    var prevClick = ipSet[ipSet.length -1];
    if (presentClick.amount > prevClick.amount) {
        ipSet.pop();
        ipSet.push(presentClick);
        return ipSet;
    } else if (presentClick.amount < prevClick.amount){
        return ipSet;
    } else {

        return checkForDeplicateIPsAndAmounts(presentClick, ipSet);
    }
};

const createClickSubset = () => {
    var numberOfClicksPerIP = getNumberOfClicksPerIp();
    var ipSet = [];
    const fileName = "ipSubset.json";
    for (var click of clicks) {
        if (numberOfClicksPerIP[click.ip] >= 11) {
            continue;
        }

        getResultedData(ipSet, click);
    }
    const ipSubset = JSON.stringify(ipSet, null, "\t");

    fs.writeFile(fileName, ipSubset, function(err) {
        if(err) console.log("error", err);
    });
    console.log("RESULT \n", "fileName :" +fileName);
};

createClickSubset();
    
module.exports = { 
    getNumberOfClicksPerIp,
    clickedInSameHour,
    getResultedData,
    checkForDeplicateIPsAndAmounts,
    checkForExpensiveClicks,
    createClickSubset
};

