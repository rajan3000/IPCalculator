// ============================================
// NetToolsHub - VLSM Calculator
// ============================================


// ---------- IPv4 Validation ----------
function isValidIPv4(ip) {

    const parts = ip.trim().split(".");

    if (parts.length !== 4) {
        return false;
    }

    return parts.every(part => {
        if (!/^\d+$/.test(part)) {
            return false;
        }

        const num = Number(part);

        return num >= 0 && num <= 255;
    });
}


// ---------- IPv4 to Number ----------
function ipToNumber(ip) {

    const parts = ip.split(".").map(Number);

    return (
        parts[0] * 256 ** 3 +
        parts[1] * 256 ** 2 +
        parts[2] * 256 +
        parts[3]
    );
}


// ---------- Number to IPv4 ----------
function numberToIP(num) {

    const a = Math.floor(num / 256 ** 3);
    num %= 256 ** 3;

    const b = Math.floor(num / 256 ** 2);
    num %= 256 ** 2;

    const c = Math.floor(num / 256);
    const d = num % 256;

    return `${a}.${b}.${c}.${d}`;
}


// ---------- Prefix to Subnet Mask ----------
function prefixToMask(prefix) {

    if (prefix === 0) {
        return "0.0.0.0";
    }

    const maskNumber =
        (2 ** 32) - (2 ** (32 - prefix));

    return numberToIP(maskNumber);
}


// ---------- Parse Parent Network ----------
function parseCIDR(cidr) {

    const value = cidr.trim();

    const match = value.match(
        /^(\d{1,3}(?:\.\d{1,3}){3})\s*\/\s*(\d{1,2})$/
    );

    if (!match) {
        return null;
    }

    const ip = match[1];
    const prefix = Number(match[2]);

    if (!isValidIPv4(ip)) {
        return null;
    }

    if (prefix < 0 || prefix > 32) {
        return null;
    }

    const ipNumber = ipToNumber(ip);

    const blockSize = 2 ** (32 - prefix);

    const network =
        Math.floor(ipNumber / blockSize) * blockSize;

    const broadcast =
        network + blockSize - 1;

    return {
        ip,
        prefix,
        network,
        broadcast,
        blockSize
    };
}


// ---------- Calculate Required Block ----------
function getSubnetSize(requiredHosts) {

    /*
        Traditional IPv4 subnet:

        Usable hosts = Total addresses - 2

        Example:
        100 hosts
        100 + 2 = 102
        Next power of 2 = 128
        Therefore /25
    */

    let requiredAddresses = requiredHosts + 2;

    let blockSize = 1;

    while (blockSize < requiredAddresses) {
        blockSize *= 2;
    }

    // Minimum traditional subnet = /30
    if (blockSize < 4) {
        blockSize = 4;
    }

    const hostBits =
        Math.log2(blockSize);

    const prefix =
        32 - hostBits;

    return {
        blockSize,
        prefix,
        usableHosts: blockSize - 2
    };
}


// ---------- Parse Host Requirements ----------
function parseRequirements(text) {

    const lines = text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (lines.length === 0) {
        throw new Error(
            "Please enter at least one subnet requirement."
        );
    }

    const requirements = [];

    lines.forEach((line, index) => {

        let name = "";
        let hostsText = "";

        /*
            Supported formats:

            Office,100
            Office 100
            Office, 100
            100
        */

        if (line.includes(",")) {

            const parts = line.split(",");

            hostsText =
                parts[parts.length - 1].trim();

            name =
                parts.slice(0, -1)
                    .join(",")
                    .trim();

        } else {

            const match =
                line.match(/^(.*?)[\s]+(\d+)$/);

            if (match) {

                name = match[1].trim();
                hostsText = match[2];

            } else if (/^\d+$/.test(line)) {

                name = `Subnet ${index + 1}`;
                hostsText = line;

            } else {

                throw new Error(
                    `Invalid format on line ${index + 1}: "${line}"`
                );
            }
        }


        const hosts = Number(hostsText);


        if (!Number.isInteger(hosts) || hosts <= 0) {

            throw new Error(
                `Invalid host count on line ${index + 1}.`
            );
        }


        if (!name) {
            name = `Subnet ${index + 1}`;
        }


        requirements.push({
            name,
            hosts,
            originalOrder: index
        });

    });


    return requirements;
}


// ---------- Calculate VLSM ----------
function calculateVLSM() {

    hideError();

    try {

        const parentInput =
            document.getElementById("parentNetwork").value.trim();

        const requirementInput =
            document.getElementById("requirements").value.trim();


        // Validate parent network
        const parent =
            parseCIDR(parentInput);


        if (!parent) {

            throw new Error(
                "Please enter a valid parent network. Example: 192.168.10.0/24"
            );
        }


        // Parent /31 and /32 are not useful for multiple VLSM subnets
        if (parent.prefix > 30) {

            throw new Error(
                "For VLSM planning, please use a parent network of /30 or larger."
            );
        }


        // Parse requirements
        let requirements =
            parseRequirements(requirementInput);


        // Largest host requirement first
        requirements.sort((a, b) => {

            if (b.hosts !== a.hosts) {
                return b.hosts - a.hosts;
            }

            return a.originalOrder -
                b.originalOrder;
        });


        let currentAddress =
            parent.network;

        const allocations = [];


        // Allocate each subnet
        for (const requirement of requirements) {

            const subnet =
                getSubnetSize(requirement.hosts);


            const network =
                currentAddress;


            const broadcast =
                network + subnet.blockSize - 1;


            // Check if subnet fits inside parent
            if (broadcast > parent.broadcast) {

                const available =
                    parent.broadcast -
                    currentAddress + 1;


                throw new Error(
                    `Not enough address space for "${requirement.name}". ` +
                    `Required block: ${subnet.blockSize} addresses, ` +
                    `available: ${available}.`
                );
            }


            const firstUsable =
                network + 1;


            const lastUsable =
                broadcast - 1;


            const spareHosts =
                subnet.usableHosts -
                requirement.hosts;


            allocations.push({

                name: requirement.name,

                requiredHosts:
                    requirement.hosts,

                prefix:
                    subnet.prefix,

                mask:
                    prefixToMask(subnet.prefix),

                network,

                firstUsable,

                lastUsable,

                broadcast,

                totalAddresses:
                    subnet.blockSize,

                usableHosts:
                    subnet.usableHosts,

                spareHosts

            });


            // Move to next available address
            currentAddress =
                broadcast + 1;
        }


        // Total addresses
        const parentTotal =
            parent.blockSize;


        // Allocated addresses
        const allocated =
            currentAddress -
            parent.network;


        // Remaining addresses
        const remaining =
            parent.broadcast -
            currentAddress + 1;


        // Display results
        displaySummary(
            parent,
            parentTotal,
            allocated,
            remaining
        );


        displayAllocations(
            allocations
        );


        displayFreeSpace(
            currentAddress,
            remaining
        );


        // Save result for copy
        window.vlsmResult = {
            parent,
            allocations,
            allocated,
            remaining
        };

    } catch (error) {

        showError(error.message);

        hideResults();
    }
}


// ---------- Display Summary ----------
function displaySummary(
    parent,
    total,
    allocated,
    remaining
) {

    document.getElementById(
        "vlsmSummary"
    ).style.display = "grid";


    document.getElementById(
        "summaryParent"
    ).textContent =
        `${numberToIP(parent.network)}/${parent.prefix}`;


    document.getElementById(
        "summaryTotal"
    ).textContent =
        total.toLocaleString();


    document.getElementById(
        "summaryAllocated"
    ).textContent =
        allocated.toLocaleString();


    document.getElementById(
        "summaryRemaining"
    ).textContent =
        remaining.toLocaleString();
}


// ---------- Display Allocation Table ----------
function displayAllocations(
    allocations
) {

    const tbody =
        document.getElementById(
            "vlsmTableBody"
        );


    tbody.innerHTML = "";


    allocations.forEach(
        (item, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${index + 1}</td>

                <td>
                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>
                </td>

                <td>
                    ${item.requiredHosts}
                </td>

                <td>
                    <strong>
                        ${numberToIP(item.network)}/${item.prefix}
                    </strong>
                </td>

                <td>
                    ${item.mask}
                </td>

                <td>
                    ${numberToIP(item.network)}
                </td>

                <td>
                    ${numberToIP(item.firstUsable)}
                </td>

                <td>
                    ${numberToIP(item.lastUsable)}
                </td>

                <td>
                    ${numberToIP(item.broadcast)}
                </td>

                <td>
                    ${item.totalAddresses}
                </td>

                <td>
                    ${item.usableHosts}
                </td>

                <td>
                    ${item.spareHosts}
                </td>

            `;


            tbody.appendChild(row);
        }
    );


    document.getElementById(
        "vlsmResults"
    ).style.display = "block";
}


// ---------- Display Remaining Space ----------
function displayFreeSpace(
    nextAddress,
    remaining
) {

    document.getElementById(
        "freeSpace"
    ).style.display = "block";


    if (remaining > 0) {

        document.getElementById(
            "nextFreeIP"
        ).textContent =
            numberToIP(nextAddress);

    } else {

        document.getElementById(
            "nextFreeIP"
        ).textContent =
            "No free IPs";
    }


    document.getElementById(
        "remainingIPs"
    ).textContent =
        remaining.toLocaleString();
}


// ---------- Copy Result ----------
function copyVLSMResult() {

    if (!window.vlsmResult) {

        alert(
            "Please calculate VLSM first."
        );

        return;
    }


    const data =
        window.vlsmResult;


    let text = "";

    text += "VLSM ALLOCATION\n";
    text += "============================\n\n";


    text += "Parent Network: ";
    text += `${numberToIP(data.parent.network)}/${data.parent.prefix}\n`;

    text += "Total Addresses: ";
    text += `${data.parent.blockSize}\n`;

    text += "Allocated Addresses: ";
    text += `${data.allocated}\n`;

    text += "Remaining Addresses: ";
    text += `${data.remaining}\n\n`;


    text +=
        "Subnet | Required | CIDR | Mask | First Usable | Last Usable | Broadcast | Total | Usable | Spare\n";

    text +=
        "-------------------------------------------------------------------------------------------------------------\n";


    data.allocations.forEach(item => {

        text +=
            `${item.name} | ` +
            `${item.requiredHosts} | ` +
            `${numberToIP(item.network)}/${item.prefix} | ` +
            `${item.mask} | ` +
            `${numberToIP(item.firstUsable)} | ` +
            `${numberToIP(item.lastUsable)} | ` +
            `${numberToIP(item.broadcast)} | ` +
            `${item.totalAddresses} | ` +
            `${item.usableHosts} | ` +
            `${item.spareHosts}\n`;

    });


    navigator.clipboard.writeText(text)
        .then(() => {

            alert(
                "VLSM result copied successfully!"
            );

        })
        .catch(() => {

            alert(
                "Unable to copy result."
            );

        });
}


// ---------- Example ----------
function loadVLSMExample() {

    document.getElementById(
        "parentNetwork"
    ).value =
        "192.168.10.0/24";


    document.getElementById(
        "requirements"
    ).value =
`Office,100
Support,50
Cameras,20
Management,10`;


    calculateVLSM();
}


// ---------- Reset ----------
function resetVLSM() {

    document.getElementById(
        "parentNetwork"
    ).value = "";


    document.getElementById(
        "requirements"
    ).value = "";


    hideResults();

    hideError();


    window.vlsmResult = null;
}


// ---------- Hide Results ----------
function hideResults() {

    document.getElementById(
        "vlsmSummary"
    ).style.display = "none";


    document.getElementById(
        "vlsmResults"
    ).style.display = "none";


    document.getElementById(
        "freeSpace"
    ).style.display = "none";


    document.getElementById(
        "vlsmTableBody"
    ).innerHTML = "";
}


// ---------- Error ----------
function showError(message) {

    const error =
        document.getElementById(
            "errorMessage"
        );


    error.textContent =
        message;


    error.style.display =
        "block";
}


function hideError() {

    const error =
        document.getElementById(
            "errorMessage"
        );


    error.textContent = "";

    error.style.display =
        "none";
}


// ---------- HTML Safety ----------
function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ---------- Auto Calculate Example ----------
document.addEventListener(
    "DOMContentLoaded",
    function () {

        const parent =
            document.getElementById(
                "parentNetwork"
            );

        const requirements =
            document.getElementById(
                "requirements"
            );


        if (
            parent &&
            requirements &&
            parent.value &&
            requirements.value
        ) {

            calculateVLSM();
        }

    }
);