function getIPParts(ip) {

    return ip.split(".").map(Number);

}


// Validate IPv4
function isValidIPv4(ip) {

    if (!ip || ip.trim() === "") {
        return false;
    }

    const parts = ip.trim().split(".");

    if (parts.length !== 4) {
        return false;
    }

    for (let part of parts) {

        // Empty part
        if (part === "") {
            return false;
        }

        // Only digits
        if (!/^\d+$/.test(part)) {
            return false;
        }

        // Avoid values such as 01 or 001
        if (part.length > 1 && part.startsWith("0")) {
            return false;
        }

        const value = Number(part);

        if (value < 0 || value > 255) {
            return false;
        }

    }

    return true;

}


// Convert IP to number
function ipToNumber(ip) {

    const parts = getIPParts(ip);

    return (
        parts[0] * 256 ** 3 +
        parts[1] * 256 ** 2 +
        parts[2] * 256 +
        parts[3]
    );

}


// Check whether IP belongs to a CIDR range
function isInRange(ip, network, cidr) {

    const ipNumber = ipToNumber(ip);

    const networkNumber = ipToNumber(network);

    const mask =
        cidr === 0
            ? 0
            : (0xFFFFFFFF << (32 - cidr)) >>> 0;

    return (
        (ipNumber >>> 0 & mask) ===
        (networkNumber >>> 0 & mask)
    );

}


// Get IP Class
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
        return "Class E (Reserved)";
    }

    return "Special";

}


// Convert IP to binary
function ipToBinary(ip) {

    return ip
        .split(".")
        .map(octet =>
            Number(octet)
                .toString(2)
                .padStart(8, "0")
        )
        .join(".");

}


// Detect IP type
function getIPType(ip) {

    const firstOctet = getIPParts(ip)[0];

    // 0.0.0.0/8
    if (isInRange(ip, "0.0.0.0", 8)) {

        return {
            type: "Special",
            scope: "Special",
            description:
                "0.0.0.0/8 is reserved for special purposes such as this-network addressing."
        };

    }


    // Private 10.0.0.0/8
    if (isInRange(ip, "10.0.0.0", 8)) {

        return {
            type: "Private",
            scope: "Private",
            description:
                "Private IPv4 address from the 10.0.0.0/8 private-use range."
        };

    }


    // Loopback 127.0.0.0/8
    if (isInRange(ip, "127.0.0.0", 8)) {

        return {
            type: "Loopback",
            scope: "Local Host",
            description:
                "Loopback address. Traffic to this range is directed back to the local host."
        };

    }


    // Link Local / APIPA
    if (isInRange(ip, "169.254.0.0", 16)) {

        return {
            type: "APIPA / Link-Local",
            scope: "Local Link",
            description:
                "Link-local IPv4 address. Commonly used for automatic local addressing when DHCP is unavailable."
        };

    }


    // Private 172.16.0.0/12
    if (isInRange(ip, "172.16.0.0", 12)) {

        return {
            type: "Private",
            scope: "Private",
            description:
                "Private IPv4 address from the 172.16.0.0/12 private-use range."
        };

    }


    // CGNAT 100.64.0.0/10
    if (isInRange(ip, "100.64.0.0", 10)) {

        return {
            type: "CGNAT / Shared",
            scope: "Shared",
            description:
                "Shared address space commonly used for Carrier-Grade NAT (CGNAT)."
        };

    }


    // Private 192.168.0.0/16
    if (isInRange(ip, "192.168.0.0", 16)) {

        return {
            type: "Private",
            scope: "Private",
            description:
                "Private IPv4 address from the 192.168.0.0/16 private-use range."
        };

    }


    // Multicast
    if (firstOctet >= 224 && firstOctet <= 239) {

        return {
            type: "Multicast",
            scope: "Multicast",
            description:
                "Multicast IPv4 address. The 224.0.0.0/4 range is allocated for multicast."
        };

    }


    // Reserved Class E
    if (firstOctet >= 240 && firstOctet <= 255) {

        return {
            type: "Reserved",
            scope: "Reserved",
            description:
                "Reserved IPv4 address range."
        };

    }


    // Limited Broadcast
    if (ip === "255.255.255.255") {

        return {
            type: "Limited Broadcast",
            scope: "Broadcast",
            description:
                "Limited broadcast address."
        };

    }


    // TEST-NET-1
    if (isInRange(ip, "192.0.2.0", 24)) {

        return {
            type: "Documentation",
            scope: "Documentation",
            description:
                "TEST-NET-1 address reserved for documentation and examples."
        };

    }


    // TEST-NET-2
    if (isInRange(ip, "198.51.100.0", 24)) {

        return {
            type: "Documentation",
            scope: "Documentation",
            description:
                "TEST-NET-2 address reserved for documentation and examples."
        };

    }


    // TEST-NET-3
    if (isInRange(ip, "203.0.113.0", 24)) {

        return {
            type: "Documentation",
            scope: "Documentation",
            description:
                "TEST-NET-3 address reserved for documentation and examples."
        };

    }


    // Public
    return {
        type: "Public",
        scope: "Global",
        description:
            "Valid IPv4 address that is not in the private or common special-purpose ranges checked by this tool."
    };

}


// Main validation function
function validateIP() {

    const input = document.getElementById("ipAddress");

    const error = document.getElementById("error");

    const result = document.getElementById("result");

    const status = document.getElementById("validationStatus");

    const ip = input.value.trim();


    error.innerText = "";

    result.style.display = "none";


    // Empty
    if (ip === "") {

        error.innerText =
            "Please enter an IPv4 address.";

        return;

    }


    // Invalid
    if (!isValidIPv4(ip)) {

        error.innerText =
            "Invalid IPv4 address. Example: 192.168.1.10";

        return;

    }


    const parts = getIPParts(ip);

    const firstOctet = parts[0];

    const ipClass = getIPClass(firstOctet);

    const ipInfo = getIPType(ip);

    const binary = ipToBinary(ip);


    // Display values

    document.getElementById("resultIP").innerText =
        ip;

    document.getElementById("resultStatus").innerText =
        "VALID";

    document.getElementById("ipVersion").innerText =
        "IPv4";

    document.getElementById("ipClass").innerText =
        ipClass;

    document.getElementById("ipType").innerText =
        ipInfo.type;

    document.getElementById("ipScope").innerText =
        ipInfo.scope;

    document.getElementById("firstOctet").innerText =
        firstOctet;

    document.getElementById("binaryIP").innerText =
        binary;


    document.getElementById("ipDescription").innerText =
        ipInfo.description;


    // Status box

    status.innerText =
        "✓ VALID IPv4 ADDRESS";

    status.className =
        "network-status same";


    result.style.display = "block";

}


// Example
function loadExample() {

    document.getElementById("ipAddress").value =
        "192.168.1.100";

    validateIP();

}


// Reset
function resetValidator() {

    document.getElementById("ipAddress").value =
        "";

    document.getElementById("error").innerText =
        "";

    document.getElementById("result").style.display =
        "none";

}


// Copy result
function copyResult() {

    const ip =
        document.getElementById("resultIP").innerText;

    const status =
        document.getElementById("resultStatus").innerText;

    const version =
        document.getElementById("ipVersion").innerText;

    const ipClass =
        document.getElementById("ipClass").innerText;

    const type =
        document.getElementById("ipType").innerText;

    const scope =
        document.getElementById("ipScope").innerText;

    const firstOctet =
        document.getElementById("firstOctet").innerText;

    const binary =
        document.getElementById("binaryIP").innerText;

    const description =
        document.getElementById("ipDescription").innerText;


    const text =

`IP Validator Result

IP Address: ${ip}
Status: ${status}
IP Version: ${version}
IP Class: ${ipClass}
IP Type: ${type}
Scope: ${scope}
First Octet: ${firstOctet}

Binary:
${binary}

Description:
${description}`;


    navigator.clipboard.writeText(text)
        .then(() => {

            alert("Result copied successfully!");

        })
        .catch(() => {

            alert("Unable to copy result.");

        });

}


// Enter key support
document
    .getElementById("ipAddress")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            validateIP();

        }

    });