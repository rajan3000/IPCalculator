// Convert IPv4 to number
function ipToNumber(ip) {

    const parts = ip.split(".");

    if (parts.length !== 4) {
        return null;
    }

    let result = 0;

    for (let i = 0; i < 4; i++) {

        const value = Number(parts[i]);

        if (
            !Number.isInteger(value) ||
            value < 0 ||
            value > 255
        ) {
            return null;
        }

        result = result * 256 + value;
    }

    return result;
}


// Convert number to IPv4
function numberToIP(number) {

    return [
        Math.floor(number / 16777216) % 256,
        Math.floor(number / 65536) % 256,
        Math.floor(number / 256) % 256,
        number % 256
    ].join(".");
}


// Validate IPv4
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


// Get IP Class
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


// Find smallest CIDR block covering the range
function calculateCIDRSummary(start, end) {

    const xor = start ^ end;

    let prefix = 32;

    let value = xor >>> 0;

    while (value > 0) {

        prefix--;

        value = value >>> 1;
    }

    return "/" + prefix;
}


// Main calculation
function calculateRange() {

    const startIP =
        document.getElementById("startIP")
            .value.trim();


    const endIP =
        document.getElementById("endIP")
            .value.trim();


    const error =
        document.getElementById("errorMessage");


    error.textContent = "";


    // Validate Start IP

    if (!isValidIP(startIP)) {

        error.textContent =
            "Please enter a valid Start IPv4 address.";

        return;
    }


    // Validate End IP

    if (!isValidIP(endIP)) {

        error.textContent =
            "Please enter a valid End IPv4 address.";

        return;
    }


    const start =
        ipToNumber(startIP);


    const end =
        ipToNumber(endIP);


    // Check range order

    if (start > end) {

        error.textContent =
            "Start IP must be less than or equal to End IP.";

        return;
    }


    const totalIPs =
        end - start + 1;


    const cidr =
        calculateCIDRSummary(start, end);


    /*
       Display results
    */

    document.getElementById("resultStartIP")
        .textContent = startIP;


    document.getElementById("resultEndIP")
        .textContent = endIP;


    document.getElementById("totalIPs")
        .textContent =
        totalIPs.toLocaleString();


    document.getElementById("firstIP")
        .textContent =
        numberToIP(start);


    document.getElementById("lastIP")
        .textContent =
        numberToIP(end);


    document.getElementById("rangeSize")
        .textContent =
        totalIPs.toLocaleString() + " addresses";


    document.getElementById("ipClass")
        .textContent =
        getIPClass(startIP);


    document.getElementById("cidrSummary")
        .textContent = cidr;


    /*
       Network/Broadcast information
    */

    const prefix =
        parseInt(cidr.replace("/", ""));


    const blockSize =
        2 ** (32 - prefix);


    const network =
        Math.floor(start / blockSize)
        * blockSize;


    const broadcast =
        network + blockSize - 1;


    document.getElementById("networkAddress")
        .textContent =
        numberToIP(network);


    document.getElementById("broadcastAddress")
        .textContent =
        numberToIP(broadcast);
}


// Example buttons
function setExample(start, end) {

    document.getElementById("startIP")
        .value = start;


    document.getElementById("endIP")
        .value = end;


    calculateRange();
}


// Reset
function resetRange() {

    document.getElementById("startIP")
        .value = "192.168.10.1";


    document.getElementById("endIP")
        .value = "192.168.10.30";


    document.getElementById("errorMessage")
        .textContent = "";


    calculateRange();
}


// Copy result
function copyRangeResult() {

    const result = `

IP Range Calculator Result

Start IP: ${document.getElementById("resultStartIP").textContent}

End IP: ${document.getElementById("resultEndIP").textContent}

Total IP Addresses: ${document.getElementById("totalIPs").textContent}

First IP: ${document.getElementById("firstIP").textContent}

Last IP: ${document.getElementById("lastIP").textContent}

IP Range Size: ${document.getElementById("rangeSize").textContent}

IP Class: ${document.getElementById("ipClass").textContent}

CIDR Summary: ${document.getElementById("cidrSummary").textContent}

Network Address: ${document.getElementById("networkAddress").textContent}

Broadcast Address: ${document.getElementById("broadcastAddress").textContent}
`;


    navigator.clipboard.writeText(result)
        .then(() => {

            alert("IP range result copied!");

        })
        .catch(() => {

            alert("Unable to copy result.");

        });
}


// Run automatically
window.onload = function () {

    calculateRange();

};