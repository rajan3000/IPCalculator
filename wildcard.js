// ============================================
// NetToolsHub
// Wildcard Mask Calculator
// ============================================


// ---------- Validate IPv4 ----------

function isValidIPv4(ip) {

    const parts = ip.trim().split(".");

    if (parts.length !== 4) {
        return false;
    }

    return parts.every(part => {

        if (!/^\d+$/.test(part)) {
            return false;
        }

        const value = Number(part);

        return value >= 0 && value <= 255;
    });
}


// ---------- Validate Subnet Mask ----------

function isValidSubnetMask(mask) {

    if (!isValidIPv4(mask)) {
        return false;
    }

    const parts =
        mask.split(".").map(Number);


    const validOctets = [
        255,
        254,
        252,
        248,
        240,
        224,
        192,
        128,
        0
    ];


    if (!parts.every(
        value => validOctets.includes(value)
    )) {
        return false;
    }


    let zeroStarted = false;


    for (const value of parts) {

        if (zeroStarted && value !== 0) {
            return false;
        }

        if (value !== 255) {
            zeroStarted = true;
        }
    }


    return true;
}


// ---------- Subnet Mask → CIDR ----------

function maskToCIDR(mask) {

    if (!isValidSubnetMask(mask)) {
        return null;
    }


    const parts =
        mask.split(".").map(Number);


    let cidr = 0;


    for (const octet of parts) {

        let value = octet;

        while (value > 0) {

            cidr += value & 128 ? 1 : 0;

            value =
                (value << 1) & 255;
        }
    }


    return cidr;
}


// ---------- CIDR → Subnet Mask ----------

function cidrToMask(cidr) {

    cidr = Number(cidr);


    if (
        !Number.isInteger(cidr) ||
        cidr < 0 ||
        cidr > 32
    ) {
        return null;
    }


    const parts = [];

    let remaining = cidr;


    for (let i = 0; i < 4; i++) {

        if (remaining >= 8) {

            parts.push(255);

            remaining -= 8;

        } else if (remaining > 0) {

            parts.push(
                256 -
                Math.pow(
                    2,
                    8 - remaining
                )
            );

            remaining = 0;

        } else {

            parts.push(0);
        }
    }


    return parts.join(".");
}


// ---------- Calculate Wildcard ----------

function subnetMaskToWildcard(mask) {

    const parts =
        mask.split(".").map(Number);


    return parts
        .map(value => 255 - value)
        .join(".");
}


// ---------- Binary ----------

function toBinary(ip) {

    return ip
        .split(".")
        .map(value =>
            Number(value)
                .toString(2)
                .padStart(8, "0")
        )
        .join(".");
}


// ---------- Show Result ----------

function showWildcardResult(
    mask,
    cidr
) {

    const wildcard =
        subnetMaskToWildcard(mask);


    const hostBits =
        32 - cidr;


    const totalIPs =
        Math.pow(2, hostBits);


    let usableHosts;


    if (cidr <= 30) {

        usableHosts =
            totalIPs - 2;

    } else if (cidr === 31) {

        usableHosts = 2;

    } else {

        usableHosts = 1;
    }


    document.getElementById(
        "resultMask"
    ).textContent = mask;


    document.getElementById(
        "resultCIDR"
    ).textContent = "/" + cidr;


    document.getElementById(
        "resultWildcard"
    ).textContent = wildcard;


    document.getElementById(
        "resultNetworkBits"
    ).textContent = cidr;


    document.getElementById(
        "resultHostBits"
    ).textContent = hostBits;


    document.getElementById(
        "resultTotalIPs"
    ).textContent =
        totalIPs.toLocaleString();


    document.getElementById(
        "resultBinary"
    ).textContent =
        toBinary(wildcard);


    document.getElementById(
        "wildcardResult"
    ).style.display = "block";


    hideWildcardError();


    window.wildcardResultData = {

        mask,
        cidr,
        wildcard,
        hostBits,
        totalIPs,
        usableHosts,
        binary: toBinary(wildcard)

    };
}


// ---------- Mask → Wildcard ----------

function calculateFromMask() {

    const mask =
        document.getElementById(
            "subnetMask"
        ).value.trim();


    if (!mask) {

        showWildcardError(
            "Please enter a subnet mask."
        );

        return;
    }


    const cidr =
        maskToCIDR(mask);


    if (cidr === null) {

        showWildcardError(
            "Invalid subnet mask. Example: 255.255.255.0"
        );

        return;
    }


    const wildcard =
        subnetMaskToWildcard(mask);


    document.getElementById(
        "cidr"
    ).value = "/" + cidr;


    showWildcardResult(
        mask,
        cidr
    );
}


// ---------- CIDR → Wildcard ----------

function calculateFromCIDR() {

    let cidr =
        document.getElementById(
            "cidr"
        ).value.trim();


    if (!cidr) {

        showWildcardError(
            "Please enter a CIDR prefix."
        );

        return;
    }


    cidr =
        cidr.replace("/", "");


    if (!/^\d+$/.test(cidr)) {

        showWildcardError(
            "Invalid CIDR. Example: /24 or 24"
        );

        return;
    }


    cidr = Number(cidr);


    const mask =
        cidrToMask(cidr);


    if (mask === null) {

        showWildcardError(
            "CIDR must be between /0 and /32."
        );

        return;
    }


    document.getElementById(
        "subnetMask"
    ).value = mask;


    document.getElementById(
        "cidr"
    ).value = "/" + cidr;


    showWildcardResult(
        mask,
        cidr
    );
}


// ---------- Example ----------

function loadWildcardExample() {

    document.getElementById(
        "subnetMask"
    ).value =
        "255.255.255.0";


    document.getElementById(
        "cidr"
    ).value =
        "/24";


    showWildcardResult(
        "255.255.255.0",
        24
    );
}


// ---------- Reset ----------

function resetWildcard() {

    document.getElementById(
        "subnetMask"
    ).value = "";


    document.getElementById(
        "cidr"
    ).value = "";


    document.getElementById(
        "wildcardResult"
    ).style.display =
        "none";


    hideWildcardError();


    window.wildcardResultData = null;
}


// ---------- Error ----------

function showWildcardError(message) {

    const error =
        document.getElementById(
            "wildcardError"
        );


    error.textContent =
        message;


    error.style.display =
        "block";


    document.getElementById(
        "wildcardResult"
    ).style.display =
        "none";
}


function hideWildcardError() {

    const error =
        document.getElementById(
            "wildcardError"
        );


    error.textContent = "";

    error.style.display =
        "none";
}


// ---------- Copy ----------

function copyWildcardResult() {

    if (!window.wildcardResultData) {

        alert(
            "Please calculate a result first."
        );

        return;
    }


    const result =
        window.wildcardResultData;


    const text =
`WILDCARD MASK RESULT
====================

Subnet Mask: ${result.mask}

CIDR: /${result.cidr}

Wildcard Mask: ${result.wildcard}

Network Bits: ${result.cidr}

Host Bits: ${result.hostBits}

Total IP Addresses: ${result.totalIPs}

Usable Hosts: ${result.usableHosts}

Binary Wildcard Mask:
${result.binary}
`;


    navigator.clipboard
        .writeText(text)
        .then(() => {

            alert(
                "Result copied successfully!"
            );

        })
        .catch(() => {

            alert(
                "Unable to copy result."
            );

        });
}


// ---------- Enter Key ----------

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const maskInput =
            document.getElementById(
                "subnetMask"
            );


        const cidrInput =
            document.getElementById(
                "cidr"
            );


        maskInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {
                    calculateFromMask();
                }

            }
        );


        cidrInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {
                    calculateFromCIDR();
                }

            }
        );

    }
);