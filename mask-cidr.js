// ============================================
// NetToolsHub
// Subnet Mask ↔ CIDR Converter
// ============================================


// ---------- Validate Subnet Mask ----------

function validateSubnetMask(mask) {

    const parts = mask.trim().split(".");

    if (parts.length !== 4) {
        return false;
    }

    const numbers = parts.map(Number);

    if (numbers.some(
        n => !Number.isInteger(n) || n < 0 || n > 255
    )) {
        return false;
    }


    /*
        Valid subnet mask octets can only be:

        255
        254
        252
        248
        240
        224
        192
        128
        0
    */

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


    if (!numbers.every(
        n => validOctets.includes(n)
    )) {
        return false;
    }


    /*
        After the first non-255 octet,
        all following octets must be 0.
    */

    let zeroStarted = false;

    for (const octet of numbers) {

        if (zeroStarted && octet !== 0) {
            return false;
        }

        if (octet !== 255) {
            zeroStarted = true;
        }
    }


    return true;
}


// ---------- Mask → CIDR ----------

function maskToCIDR(mask) {

    if (!validateSubnetMask(mask)) {
        return null;
    }


    const parts =
        mask.trim()
            .split(".")
            .map(Number);


    let cidr = 0;


    parts.forEach(octet => {

        let value = octet;

        while (value > 0) {

            cidr += value & 128 ? 1 : 0;

            value =
                (value << 1) & 255;
        }

    });


    return cidr;
}


// ---------- CIDR → Mask ----------

function cidrToMask(prefix) {

    prefix = Number(prefix);


    if (
        !Number.isInteger(prefix) ||
        prefix < 0 ||
        prefix > 32
    ) {

        return null;
    }


    const mask = [];

    let remaining = prefix;


    for (let i = 0; i < 4; i++) {

        if (remaining >= 8) {

            mask.push(255);

            remaining -= 8;

        } else if (remaining > 0) {

            mask.push(
                256 - Math.pow(
                    2,
                    8 - remaining
                )
            );

            remaining = 0;

        } else {

            mask.push(0);

        }

    }


    return mask.join(".");
}


// ---------- Binary Mask ----------

function maskToBinary(mask) {

    return mask
        .split(".")
        .map(octet =>
            Number(octet)
                .toString(2)
                .padStart(8, "0")
        )
        .join(".");
}


// ---------- Calculate Host Information ----------

function getNetworkInfo(cidr) {

    const hostBits =
        32 - cidr;


    const totalIPs =
        Math.pow(2, hostBits);


    let usableHosts;


    if (cidr <= 30) {

        usableHosts =
            totalIPs - 2;

    } else if (cidr === 31) {

        /*
            /31 is normally used for
            point-to-point links.
        */

        usableHosts = 2;

    } else {

        /*
            /32 represents one host address.
        */

        usableHosts = 1;
    }


    return {
        hostBits,
        totalIPs,
        usableHosts
    };
}


// ---------- Show Result ----------

function showResult(mask, cidr) {

    const info =
        getNetworkInfo(cidr);


    document.getElementById(
        "resultMask"
    ).textContent = mask;


    document.getElementById(
        "resultCIDR"
    ).textContent = "/" + cidr;


    document.getElementById(
        "resultNetworkBits"
    ).textContent = cidr;


    document.getElementById(
        "resultHostBits"
    ).textContent =
        info.hostBits;


    document.getElementById(
        "resultTotalIPs"
    ).textContent =
        info.totalIPs.toLocaleString();


    document.getElementById(
        "resultUsableHosts"
    ).textContent =
        info.usableHosts.toLocaleString();


    document.getElementById(
        "resultBinary"
    ).textContent =
        maskToBinary(mask);


    document.getElementById(
        "maskCIDRResult"
    ).style.display = "block";


    hideError();


    window.maskCIDRResult = {
        mask,
        cidr,
        hostBits: info.hostBits,
        totalIPs: info.totalIPs,
        usableHosts: info.usableHosts,
        binary: maskToBinary(mask)
    };
}


// ---------- Mask → CIDR Button ----------

function convertMaskToCIDR() {

    const mask =
        document.getElementById(
            "subnetMask"
        ).value.trim();


    if (!mask) {

        showError(
            "Please enter a subnet mask."
        );

        return;
    }


    const cidr =
        maskToCIDR(mask);


    if (cidr === null) {

        showError(
            "Invalid subnet mask. Example: 255.255.255.0"
        );

        return;
    }


    document.getElementById(
        "cidr"
    ).value = "/" + cidr;


    showResult(mask, cidr);
}


// ---------- CIDR → Mask Button ----------

function convertCIDRToMask() {

    let cidr =
        document.getElementById(
            "cidr"
        ).value.trim();


    if (!cidr) {

        showError(
            "Please enter a CIDR prefix."
        );

        return;
    }


    // Remove slash
    cidr =
        cidr.replace("/", "");


    if (!/^\d+$/.test(cidr)) {

        showError(
            "Invalid CIDR. Example: /24 or 24"
        );

        return;
    }


    cidr = Number(cidr);


    const mask =
        cidrToMask(cidr);


    if (mask === null) {

        showError(
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


    showResult(mask, cidr);
}


// ---------- Example ----------

function loadMaskCIDRExample() {

    document.getElementById(
        "subnetMask"
    ).value =
        "255.255.255.192";


    document.getElementById(
        "cidr"
    ).value =
        "/26";


    showResult(
        "255.255.255.192",
        26
    );
}


// ---------- Reset ----------

function resetMaskCIDR() {

    document.getElementById(
        "subnetMask"
    ).value = "";


    document.getElementById(
        "cidr"
    ).value = "";


    document.getElementById(
        "maskCIDRResult"
    ).style.display =
        "none";


    hideError();


    window.maskCIDRResult =
        null;
}


// ---------- Error ----------

function showError(message) {

    const error =
        document.getElementById(
            "maskCIDRError"
        );


    error.textContent =
        message;


    error.style.display =
        "block";


    document.getElementById(
        "maskCIDRResult"
    ).style.display =
        "none";
}


function hideError() {

    const error =
        document.getElementById(
            "maskCIDRError"
        );


    error.textContent = "";

    error.style.display =
        "none";
}


// ---------- Copy Result ----------

function copyMaskCIDRResult() {

    if (!window.maskCIDRResult) {

        alert(
            "Please calculate a result first."
        );

        return;
    }


    const result =
        window.maskCIDRResult;


    const text =
`SUBNET MASK ↔ CIDR RESULT
==========================

Subnet Mask: ${result.mask}

CIDR: /${result.cidr}

Network Bits: ${result.cidr}

Host Bits: ${result.hostBits}

Total IP Addresses: ${result.totalIPs}

Usable Hosts: ${result.usableHosts}

Binary Mask:
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


// ---------- Keyboard Support ----------

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

                    convertMaskToCIDR();

                }

            }
        );


        cidrInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    convertCIDRToMask();

                }

            }
        );

    }
);