// Convert IPv4 to Number
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


// Convert Number to IPv4
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


// Create subnet mask
function createMask(cidr) {

    if (cidr === 0) {
        return 0;
    }

    return (2 ** 32) - (2 ** (32 - cidr));
}


// Convert mask to IPv4
function maskToIP(mask) {

    return [
        Math.floor(mask / 16777216) % 256,
        Math.floor(mask / 65536) % 256,
        Math.floor(mask / 256) % 256,
        mask % 256
    ].join(".");
}


// Calculate network address
function calculateNetwork(ipNumber, cidr) {

    const totalAddresses =
        2 ** (32 - cidr);


    return Math.floor(
        ipNumber / totalAddresses
    ) * totalAddresses;
}


// Calculate broadcast
function calculateBroadcast(network, cidr) {

    const totalAddresses =
        2 ** (32 - cidr);


    return network + totalAddresses - 1;
}


// Main function
function checkSameNetwork() {

    const ip1 =
        document.getElementById("ip1")
            .value.trim();


    const ip2 =
        document.getElementById("ip2")
            .value.trim();


    const cidr =
        Number(
            document.getElementById("cidr").value
        );


    const error =
        document.getElementById("errorMessage");


    const status =
        document.getElementById("networkStatus");


    error.textContent = "";


    // Validate IP 1

    if (!isValidIP(ip1)) {

        error.textContent =
            "Please enter a valid IPv4 address for IP 1.";

        return;
    }


    // Validate IP 2

    if (!isValidIP(ip2)) {

        error.textContent =
            "Please enter a valid IPv4 address for IP 2.";

        return;
    }


    // Convert IPs

    const ipNumber1 =
        ipToNumber(ip1);


    const ipNumber2 =
        ipToNumber(ip2);


    // Calculate networks

    const networkNumber1 =
        calculateNetwork(
            ipNumber1,
            cidr
        );


    const networkNumber2 =
        calculateNetwork(
            ipNumber2,
            cidr
        );


    // Broadcast addresses

    const broadcastNumber1 =
        calculateBroadcast(
            networkNumber1,
            cidr
        );


    const broadcastNumber2 =
        calculateBroadcast(
            networkNumber2,
            cidr
        );


    // Same network?

    const sameNetwork =
        networkNumber1 === networkNumber2;


    // Display status

    if (sameNetwork) {

        status.textContent =
            "✓ SAME NETWORK";

        status.className =
            "network-status same";

    }

    else {

        status.textContent =
            "✕ DIFFERENT NETWORK";

        status.className =
            "network-status different";
    }


    // Display results

    document.getElementById("resultIP1")
        .textContent = ip1;


    document.getElementById("resultIP2")
        .textContent = ip2;


    document.getElementById("resultCIDR")
        .textContent = "/" + cidr;


    document.getElementById("subnetMask")
        .textContent =
        maskToIP(createMask(cidr));


    document.getElementById("network1")
        .textContent =
        numberToIP(networkNumber1);


    document.getElementById("network2")
        .textContent =
        numberToIP(networkNumber2);


    document.getElementById("broadcast1")
        .textContent =
        numberToIP(broadcastNumber1);


    document.getElementById("broadcast2")
        .textContent =
        numberToIP(broadcastNumber2);
}


// Example buttons
function setExample(ip1, ip2, cidr) {

    document.getElementById("ip1")
        .value = ip1;


    document.getElementById("ip2")
        .value = ip2;


    document.getElementById("cidr")
        .value = cidr;


    checkSameNetwork();
}


// Reset
function resetNetwork() {

    document.getElementById("ip1")
        .value = "192.168.10.10";


    document.getElementById("ip2")
        .value = "192.168.10.20";


    document.getElementById("cidr")
        .value = "24";


    document.getElementById("errorMessage")
        .textContent = "";


    checkSameNetwork();
}


// Copy result
function copyNetworkResult() {

    const result = `

Same Network Checker

IP Address 1: ${document.getElementById("resultIP1").textContent}

IP Address 2: ${document.getElementById("resultIP2").textContent}

CIDR: ${document.getElementById("resultCIDR").textContent}

Subnet Mask: ${document.getElementById("subnetMask").textContent}

Network 1: ${document.getElementById("network1").textContent}

Network 2: ${document.getElementById("network2").textContent}

Broadcast 1: ${document.getElementById("broadcast1").textContent}

Broadcast 2: ${document.getElementById("broadcast2").textContent}

Result: ${document.getElementById("networkStatus").textContent}
`;


    navigator.clipboard.writeText(result)
        .then(() => {

            alert("Network result copied!");

        })
        .catch(() => {

            alert("Unable to copy result.");

        });
}


// Run on page load
window.onload = function () {

    checkSameNetwork();

};