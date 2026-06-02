const TAKEN_BRANDS = [
    'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix',
    'Tesla', 'SpaceX', 'Infosys', 'TCS', 'Wipro', 'Accenture',
    'Intel', 'IBM', 'Oracle', 'SAP', 'Adobe', 'Salesforce',
    'Uber', 'Airbnb', 'Spotify', 'Twitter', 'LinkedIn', 'Snapchat',
    'Flipkart', 'Paytm', 'Zomato', 'Swiggy', 'Ola', 'Byju\'s',
    'CloudSync', 'SkillBridge'
];

const PREFIXES = ['Tech', 'Neo', 'Cloud', 'Data', 'Cyber', 'Alpha', 'Nova', 'Quantum', 'Apex', 'Zen'];
const SUFFIXES = ['Tech', 'Labs', 'Works', 'Soft', 'Systems', 'Hub', 'Nest', 'Forge', 'Sync', 'Flow'];

const ALTERNATIVES = {
    'tech': ['TechNova', 'NeoTech', 'TechForge', 'CloudTech', 'TechVista'],
    'cloud': ['CloudBase', 'CloudNest', 'CloudWorks', 'CloudLabs', 'NeoCloud'],
    'data': ['DataForge', 'DataWorks', 'DataHub', 'DataFlow', 'NeoData'],
    'digital': ['DigiCore', 'DigitalNest', 'DigitalForge', 'DigiLabs', 'NeoDigi'],
    'solutions': ['SolvTech', 'SolutionLabs', 'SolveForge', 'SolvNest', 'ApexSolutions'],
    'soft': ['SoftForge', 'SoftWorks', 'SoftLabs', 'NeoSoft', 'CyberSoft'],
    'green': ['GreenLeaf', 'EcoVibe', 'GreenForge', 'EcoNest', 'GreenLabs'],
    'health': ['HealthPulse', 'HealthNest', 'VitalTech', 'MediSync', 'HealthForge'],
    'pay': ['PayFlow', 'PayNest', 'PayWorks', 'CashSync', 'PayForge'],
    'learn': ['SkillBridge', 'LearnForge', 'EduNest', 'SkillSync', 'LearnHub']
};

document.addEventListener('DOMContentLoaded', () => {
    const checkBtn = document.getElementById('check-brand-btn');
    const brandInput = document.getElementById('brand-input');

    if (checkBtn) {
        checkBtn.addEventListener('click', checkBrand);
    }

    if (brandInput) {
        brandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') checkBrand();
        });
    }
});

function checkBrand() {
    const input = document.getElementById('brand-input');
    const resultDiv = document.getElementById('brand-result');
    const statusDiv = document.getElementById('brand-status');
    const suggestionsDiv = document.getElementById('brand-suggestions');

    let brandName = input.value.trim();
    if (!brandName) {
        alert('Please enter a brand name to check.');
        return;
    }

    resultDiv.classList.remove('hidden');
    statusDiv.innerHTML = '';
    suggestionsDiv.innerHTML = '';

    const isTaken = checkAvailability(brandName);

    if (isTaken) {
        statusDiv.innerHTML = `
            <div class="brand-status-unavailable">
                <i class="fa-solid fa-circle-xmark"></i>
                <div>
                    <strong>"${brandName}"</strong> is already taken or registered.
                    <p>Try one of the suggestions below:</p>
                </div>
            </div>
        `;

        const suggestions = generateSuggestions(brandName);
        if (suggestions.length > 0) {
            const list = document.createElement('div');
            list.className = 'suggestions-list';
            suggestions.forEach(name => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                const avail = checkAvailability(name) ? 'taken' : 'available';
                item.innerHTML = `
                    <span class="suggestion-name">${name}</span>
                    <span class="suggestion-status ${avail}">${avail === 'available' ? 'Available' : 'Taken'}</span>
                    <button class="btn btn-sm ${avail === 'available' ? 'btn-primary' : 'btn-outline-primary'}" 
                        onclick="document.getElementById('brand-input').value='${name}'; checkBrand()">
                        <i class="fa-solid fa-arrow-right"></i> Check
                    </button>
                `;
                list.appendChild(item);
            });
            suggestionsDiv.appendChild(list);
        }
    } else {
        statusDiv.innerHTML = `
            <div class="brand-status-available">
                <i class="fa-solid fa-circle-check"></i>
                <div>
                    <strong>"${brandName}"</strong> is available!
                    <p>You can register this brand name.</p>
                </div>
            </div>
        `;

        const similar = generateSimilarNames(brandName);
        if (similar.length > 0) {
            suggestionsDiv.innerHTML = '<p style="margin-top: 15px; font-weight: 500; color: var(--text);">You might also like:</p>';
            const list = document.createElement('div');
            list.className = 'suggestions-list';
            similar.forEach(name => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                const avail = checkAvailability(name) ? 'taken' : 'available';
                item.innerHTML = `
                    <span class="suggestion-name">${name}</span>
                    <span class="suggestion-status ${avail}">${avail === 'available' ? 'Available' : 'Taken'}</span>
                    <button class="btn btn-sm ${avail === 'available' ? 'btn-primary' : 'btn-outline-primary'}" 
                        onclick="document.getElementById('brand-input').value='${name}'; checkBrand()">
                        <i class="fa-solid fa-arrow-right"></i> Check
                    </button>
                `;
                list.appendChild(item);
            });
            suggestionsDiv.appendChild(list);
        }
    }
}

function checkAvailability(name) {
    const normalized = name.trim().toLowerCase();
    return TAKEN_BRANDS.some(brand => brand.toLowerCase() === normalized);
}

function generateSuggestions(name) {
    const suggestions = new Set();
    const lower = name.toLowerCase();

    for (const [key, alts] of Object.entries(ALTERNATIVES)) {
        if (lower.includes(key) || key.includes(lower)) {
            alts.forEach(a => {
                if (!checkAvailability(a)) suggestions.add(a);
            });
        }
    }

    for (const prefix of PREFIXES) {
        const candidate = prefix + capitalize(name);
        if (!checkAvailability(candidate)) suggestions.add(candidate);
    }

    for (const suffix of SUFFIXES) {
        const candidate = capitalize(name) + suffix;
        if (!checkAvailability(candidate)) suggestions.add(candidate);
    }

    const prefixSuffix = randomPrefix() + capitalize(name) + randomSuffix();
    if (!checkAvailability(prefixSuffix)) suggestions.add(prefixSuffix);

    return Array.from(suggestions).slice(0, 6);
}

function generateSimilarNames(name) {
    const suggestions = new Set();
    const lower = name.toLowerCase();

    for (const prefix of PREFIXES) {
        const candidate = prefix + capitalize(name);
        if (!checkAvailability(candidate)) suggestions.add(candidate);
    }

    for (const suffix of SUFFIXES) {
        const candidate = capitalize(name) + suffix;
        if (!checkAvailability(candidate)) suggestions.add(candidate);
    }

    const withThe = 'The ' + capitalize(name);
    if (!checkAvailability(withThe)) suggestions.add(withThe);

    const withInc = capitalize(name) + ' Inc';
    if (!checkAvailability(withInc)) suggestions.add(withInc);

    return Array.from(suggestions).slice(0, 6);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function randomPrefix() {
    return PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
}

function randomSuffix() {
    return SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
}
