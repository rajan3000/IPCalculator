function ipToNumber(ip) {

    const parts = ip.split(".");

    if (parts.length !== 4) {
        return null;
    }

    let number = 0;

    for (let i = 0; i < 4; i++) {

        const value = Number(parts[i]);

        if (
            !Number.isInteger(value) ||
            value < 0 ||
            value > 255
        ) {
            return null;
        }

        number = number * 256 + value;
    }

    return number;
}


function numberToIP(number) {

    return [
        Math.floor(number / 16777216) % 256,
        Math.floor(number / 65536) % 256,
        Math.floor(number / 256) % 256,
        number % 256
    ].join(".");
}


function isValidIP(ip) {

    const parts = ip.split(".");

    if (parts.length !== 4) {
        return false;
    }

    for (const part of parts) {

        if (part === "") {
            return false;
        }

        const value = Number(part);

        if (
            !Number.isInteger(value) ||
            value < 0 ||
            value > 255
        ) {
            return false;
        }
    }

    return true;
}


function createMask(cidr) {

    if (cidr === 0) {
        return 0;
    }

    return (2 ** 32) - (2 ** (32 - cidr));
}


function numberToMask(mask) {

    return [
        Math.floor(mask / 16777216) % 256,
        Math.floor(mask / 65536) % 256,
        Math.floor(mask / 256) % 256,
        mask % 256
    ].join(".");
}


function getIPClass(ip) {

    const firstOctet =
        Number(ip.split(".")[0]);


    if (firstOctet >= 1 && firstOctet <= 126) {
        return "Class A";
    }


    if (firstOctet >= 128 && firstOctet <= 191) {
        return "Class B";
    }


    if (firstOctet >= 192 && firstOctet <= 223) {
        return "Class C";
    }


    if (firstOctet >= 224 && firstOctet <= 239) {
        return "Class D";
    }


    if (firstOctet >= 240 && firstOctet <= 255) {
        return "Class E";
    }


    return "Unknown";
}


function calculateCIDR() {

    const ip =
        document.getElementById("ipAddress").value.trim();


    const cidr =
        Number(document.getElementById("cidr").value);


    const error =
        document.getElementById("errorMessage");


    error.textContent = "";


    if (!isValidIP(ip)) {

        error.textContent =
            "Please enter a valid IPv4 address.";

        return;
    }


    if (cidr < 0 || cidr > 32) {

        error.textContent =
            "CIDR must be between /0 and /32.";

        return;
    }


    const ipNumber =
        ipToNumber(ip);


    const mask =
        createMask(cidr);


    const totalAddresses =
        2 ** (32 - cidr);


    const network =
        Math.floor(
            ipNumber / totalAddresses
        ) * totalAddresses;


    const broadcast =
        network + totalAddresses - 1;


    const wildcard =
        (2 ** 32 - 1) - mask;


    let firstIP;
    let lastIP;
    let usableHosts;


    /*
       /31 and /32 are handled separately
    */

    if (cidr === 31) {

        firstIP = network;

        lastIP = broadcast;

        usableHosts = 2;

    }

    else if (cidr === 32) {

        firstIP = network;

        lastIP = network;

        usableHosts = 1;

    }

    else {

        firstIP = network + 1;

        lastIP = broadcast - 1;

        usableHosts =
            totalAddresses - 2;

    }


    const hostBits =
        32 - cidr;


    /*
       Display Results
    */

    document.getElementById("resultIP")
        .textContent = ip;


    document.getElementById("resultCIDR")
        .textContent = "/" + cidr;


    document.getElementById("subnetMask")
        .textContent = numberToMask(mask);


    document.getElementById("wildcardMask")
        .textContent = numberToMask(wildcard);


    document.getElementById("networkAddress")
        .textContent = numberToIP(network);


    document.getElementById("broadcastAddress")
        .textContent = numberToIP(broadcast);


    document.getElementById("firstIP")
        .textContent = numberToIP(firstIP);


    document.getElementById("lastIP")
        .textContent = numberToIP(lastIP);


    document.getElementById("totalAddresses")
        .textContent =
        totalAddresses.toLocaleString();


    document.getElementById("usableHosts")
        .textContent =
        usableHosts.toLocaleString();


    document.getElementById("ipClass")
        .textContent =
        getIPClass(ip);


    document.getElementById("hostBits")
        .textContent =
        hostBits;
}


/*
   Example Button
*/

function setExample(ip, cidr) {

    document.getElementById("ipAddress")
        .value = ip;


    document.getElementById("cidr")
        .value = cidr;


    calculateCIDR();
}


/*
   Reset
*/

function resetCIDR() {

    document.getElementById("ipAddress")
        .value = "192.168.10.10";


    document.getElementById("cidr")
        .value = "24";


    document.getElementById("errorMessage")
        .textContent = "";


    calculateCIDR();
}


/*
   Copy Result
*/

function copyCIDRResult() {

    const result = `

CIDR Calculator Result

IP Address: ${document.getElementById("resultIP").textContent}

CIDR: ${document.getElementById("resultCIDR").textContent}

Subnet Mask: ${document.getElementById("subnetMask").textContent}

Wildcard Mask: ${document.getElementById("wildcardMask").textContent}

Network Address: ${document.getElementById("networkAddress").textContent}

Broadcast Address: ${document.getElementById("broadcastAddress").textContent}

First IP: ${document.getElementById("firstIP").textContent}

Last IP: ${document.getElementById("lastIP").textContent}

Total Addresses: ${document.getElementById("totalAddresses").textContent}

Usable Hosts: ${document.getElementById("usableHosts").textContent}

IP Class: ${document.getElementById("ipClass").textContent}

Host Bits: ${document.getElementById("hostBits").textContent}
`;


    navigator.clipboard.writeText(result)
        .then(() => {

            alert("CIDR result copied!");

        })
        .catch(() => {

            alert("Unable to copy result.");

        });
}


/*
   Run automatically when page opens
*/

window.onload = function () {

    calculateCIDR();

};