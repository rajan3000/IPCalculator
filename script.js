function ipToNumber(ip) {

    const parts = ip.split(".").map(Number);

    return (
        parts[0] * 256 ** 3 +
        parts[1] * 256 ** 2 +
        parts[2] * 256 +
        parts[3]
    );
}


function numberToIP(number) {

    return [
        Math.floor(number / 256 ** 3) % 256,
        Math.floor(number / 256 ** 2) % 256,
        Math.floor(number / 256) % 256,
        number % 256
    ].join(".");
}


function createSubnetMask(cidr) {

    let mask = 0;

    for (let i = 0; i < cidr; i++) {
        mask += 2 ** (31 - i);
    }

    return mask;
}


function isValidIP(ip) {

    const parts = ip.split(".");

    if (parts.length !== 4) {
        return false;
    }

    return parts.every(part => {

        if (part === "" || isNaN(part)) {
            return false;
        }

        const value = Number(part);

        return value >= 0 && value <= 255;
    });
}


function getIPClass(firstOctet) {

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

    return "Reserved";
}


function calculateIP() {

    const ip = document.getElementById("ipAddress").value.trim();

    const cidr = Number(
        document.getElementById("cidr").value
    );

    const error = document.getElementById("error");

    error.textContent = "";

    if (!isValidIP(ip)) {

        error.textContent =
            "Please enter a valid IPv4 address.";

        return;
    }


    const parts = ip.split(".").map(Number);

    const ipNumber = ipToNumber(ip);

    const mask = createSubnetMask(cidr);

    const network = (ipNumber & mask) >>> 0;

    const totalAddresses = 2 ** (32 - cidr);

    const broadcast =
        network + totalAddresses - 1;


    let firstIP;
    let lastIP;
    let usableHosts;


    if (cidr === 31) {

        firstIP = network;
        lastIP = broadcast;
        usableHosts = 2;

    } else if (cidr === 32) {

        firstIP = network;
        lastIP = network;
        usableHosts = 1;

    } else {

        firstIP = network + 1;
        lastIP = broadcast - 1;
        usableHosts = totalAddresses - 2;
    }


    document.getElementById("resultIP").textContent =
        ip;

    document.getElementById("resultCIDR").textContent =
        "/" + cidr;

    document.getElementById("subnetMask").textContent =
        numberToIP(mask);

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
        getIPClass(parts[0]);
}


window.onload = function () {

    calculateIP();

};

function checkSameNetwork() {

    const ip1 = document.getElementById("ip1").value.trim();

    const ip2 = document.getElementById("ip2").value.trim();

    const cidr = Number(
        document.getElementById("networkCIDR").value
    );

    const result =
        document.getElementById("networkResult");


    if (!isValidIP(ip1) || !isValidIP(ip2)) {

        result.innerHTML =
            "❌ Please enter valid IPv4 addresses.";

        return;
    }


    const mask = createSubnetMask(cidr);


    const network1 =
        (ipToNumber(ip1) & mask) >>> 0;


    const network2 =
        (ipToNumber(ip2) & mask) >>> 0;


    if (network1 === network2) {

        result.innerHTML =
            "✅ Both IP addresses are in the SAME network.";

    } else {

        result.innerHTML =
            "❌ These IP addresses are in DIFFERENT networks.";
    }
}

function copyResults() {

    const ip =
        document.getElementById("resultIP").textContent;

    const cidr =
        document.getElementById("resultCIDR").textContent;

    const subnet =
        document.getElementById("subnetMask").textContent;

    const network =
        document.getElementById("networkAddress").textContent;

    const broadcast =
        document.getElementById("broadcastAddress").textContent;

    const first =
        document.getElementById("firstIP").textContent;

    const last =
        document.getElementById("lastIP").textContent;

    const hosts =
        document.getElementById("usableHosts").textContent;


    const text =

`IP Address: ${ip}
CIDR: ${cidr}
Subnet Mask: ${subnet}
Network Address: ${network}
Broadcast Address: ${broadcast}
First Usable IP: ${first}
Last Usable IP: ${last}
Usable Hosts: ${hosts}`;


    navigator.clipboard.writeText(text)
        .then(() => {

            alert("Result copied successfully!");

        })
        .catch(() => {

            alert("Unable to copy result.");

        });
}

function resetCalculator() {

    document.getElementById("ipAddress").value =
        "192.168.xx.xxx";

    document.getElementById("cidr").value =
        "xx";

    document.getElementById("error").textContent =
        "";

    calculateIP();
}

function toggleTheme() {

    document.body.classList.toggle("dark-mode");

    const button =
        document.getElementById("themeButton");

    if (document.body.classList.contains("dark-mode")) {

        button.textContent = "☀️ Light Mode";

    } else {

        button.textContent = "🌙 Dark Mode";
    }
}