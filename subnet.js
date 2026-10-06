// Convert IPv4 address to 32-bit number
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


// Validate IP
function isValidIP(ip) {

    const parts = ip.split(".");

    if (parts.length !== 4) {
        return false;
    }

    return parts.every(part => {

        if (part === "") {
            return false;
        }

        const value = Number(part);

        return Number.isInteger(value)
            && value >= 0
            && value <= 255;
    });
}


// Create subnet mask
function createMask(cidr) {

    if (cidr === 0) {
        return 0;
    }

    return (2 ** 32) - (2 ** (32 - cidr));
}


// Get subnet mask
function maskToIP(mask) {

    return [
        Math.floor(mask / 16777216) % 256,
        Math.floor(mask / 65536) % 256,
        Math.floor(mask / 256) % 256,
        mask % 256
    ].join(".");
}


// Binary mask
function maskToBinary(mask) {

    return [
        Math.floor(mask / 16777216) % 256,
        Math.floor(mask / 65536) % 256,
        Math.floor(mask / 256) % 256,
        mask % 256
    ]
    .map(num => num.toString(2).padStart(8, "0"))
    .join(".");
}


// IP Class
function getIPClass(ip) {

    const firstOctet = Number(ip.split(".")[0]);

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
        return "Class D (Multicast)";
    }

    if (firstOctet >= 240 && firstOctet <= 255) {
        return "Class E";
    }

    return "Unknown";
}


// Main calculation
function calculateSubnet() {

    const ip = document.getElementById("ipAddress").value.trim();

    const cidr = Number(
        document.getElementById("cidr").value
    );

    const error = document.getElementById("errorMessage");

    error.textContent = "";


    // Validate IP
    if (!isValidIP(ip)) {

        error.textContent =
            "Please enter a valid IPv4 address.";

        return;
    }


    // Validate CIDR
    if (cidr < 0 || cidr > 32) {

        error.textContent =
            "CIDR must be between /0 and /32.";

        return;
    }


    const ipNumber = ipToNumber(ip);

    const mask = createMask(cidr);

    const wildcard = (2 ** 32 - 1) - mask;


    // Network address
    const network = Math.floor(
        ipNumber / (2 ** (32 - cidr))
    ) * (2 ** (32 - cidr));


    // Total addresses
    const totalAddresses =
        2 ** (32 - cidr);


    // Broadcast
    const broadcast =
        network + totalAddresses - 1;


    let firstIP;
    let lastIP;
    let usableHosts;


    // /31 special case
    if (cidr === 31) {

        firstIP = network;
        lastIP = broadcast;
        usableHosts = 2;

    }

    // /32 special case
    else if (cidr === 32) {

        firstIP = network;
        lastIP = network;
        usableHosts = 1;

    }

    // Normal IPv4 subnet
    else {

        firstIP = network + 1;
        lastIP = broadcast - 1;
        usableHosts = totalAddresses - 2;

    }


    // Display result

    document.getElementById("resultIP").textContent =
        ip;

    document.getElementById("resultCIDR").textContent =
        "/" + cidr;

    document.getElementById("subnetMask").textContent =
        maskToIP(mask);

    document.getElementById("wildcardMask").textContent =
        maskToIP(wildcard);

    document.getElementById("networkAddress").textContent =
        numberToIP(network);

    document.getElementById("broadcastAddress").textContent =
        numberToIP(broadcast);

    document.getElementById("firstIP").textContent =
        numberToIP(firstIP);

    document.getElementById("lastIP").textContent =
        numberToIP(lastIP);

    document.getElementById("totalAddresses").textContent =
        totalAddresses.toLocaleString();

    document.getElementById("usableHosts").textContent =
        usableHosts.toLocaleString();

    document.getElementById("ipClass").textContent =
        getIPClass(ip);

    document.getElementById("binaryMask").textContent =
        maskToBinary(mask);
}


// Example button
function setExample(ip, cidr) {

    document.getElementById("ipAddress").value = ip;

    document.getElementById("cidr").value = cidr;

    calculateSubnet();
}


// Reset
function resetCalculator() {

    document.getElementById("ipAddress").value =
        "192.168.10.10";

    document.getElementById("cidr").value =
        "24";

    document.getElementById("errorMessage").textContent = "";

    calculateSubnet();
}


// Copy result
function copyResult() {

    const result = `

IPv4 Subnet Calculation

IP Address: ${document.getElementById("resultIP").textContent}

CIDR: ${document.getElementById("resultCIDR").textContent}

Subnet Mask: ${document.getElementById("subnetMask").textContent}

Wildcard Mask: ${document.getElementById("wildcardMask").textContent}

Network Address: ${document.getElementById("networkAddress").textContent}

Broadcast Address: ${document.getElementById("broadcastAddress").textContent}

First Usable IP: ${document.getElementById("firstIP").textContent}

Last Usable IP: ${document.getElementById("lastIP").textContent}

Total Addresses: ${document.getElementById("totalAddresses").textContent}

Usable Hosts: ${document.getElementById("usableHosts").textContent}

IP Class: ${document.getElementById("ipClass").textContent}

Binary Mask: ${document.getElementById("binaryMask").textContent}
`;


    navigator.clipboard.writeText(result);

    alert("Subnet result copied!");
}


// Calculate when page loads
window.onload = function () {

    calculateSubnet();

};