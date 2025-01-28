const ROCK_YOU = "./assets/rock10k.txt";

document.getElementById("password").addEventListener("input", async () => {
    const password = document.getElementById("password").value;
    const output = document.getElementById("output");
    const progressBar = document.getElementById("progress-bar");
    const progressContainer = document.querySelector(".progress-container");

    // 1) Clear or overwrite the existing output
    output.textContent = "";

    // 2) If password field is empty, show a default message
    if (!password) {
        output.textContent = "Start typing a password to see its analysis.";
        return;
    }

    // 3) Calculate strength and set up your text anew
    const score = calculatePasswordStrength(password);
    progressBar.value = score;
    output.textContent = `Password Strength Score: ${score}/100\n`;

    if (score >= 80) {
        output.textContent += "Very Strong Password.\n";
        output.classList.add("very-strong");
        progressContainer.classList.add("very-strong");
    } else if (score >= 60) {
        output.textContent += "Password is strong.\n";
        output.classList.add("strong");
        progressContainer.classList.add("strong");
    } else if (score >= 40) {
        output.textContent += "Moderate strength.\n";
        output.classList.add("moderate");
        progressContainer.classList.add("moderate");
    } else {
        output.textContent += "Your password is weak.\n";
        output.classList.add("weak");
        progressContainer.classList.add("weak");
    }

    output.textContent += provideFeedback(password) + "\n";

    // 4) Now do the RockYou check exactly once
    const isFound = await isInRockYouList(password);
    if (isFound) {
        output.textContent += "Warning: password found in rockyou.txt list.\n";
    } else {
        output.textContent += "Password not found in rockyou.txt list.\n";
    }
});


async function isInRockYouList(password) {
    try {
        // Fetching test file from server
        const response = await fetch (ROCK_YOU);
        if (!response.ok) {
            console.error  ("Error fetching rockyou.txt", response.status, response.statusText);
            return false;
        }
    const rockYouData  = await response.text();

    return rockYouData.includes(password + "\n") || rockYouData.includes("\n" + password);
    } catch (error) {
    console.error("Error checking RockYou List", error);
    return false;    
    }
}

// Helper Functions
function calculatePasswordStrength(password) {
    let score = 0;

    // Length scoring
    if (password.length >= 12) score += 20;
    if (password.length >= 16) score += 40;

    // Variety scoring
    if (containsUppercase(password)) score += 10;
    if (containsLowercase(password)) score += 10;
    if (containsDigit(password)) score += 10;
    if (containsSpecialChar(password)) score += 10;

    // Entropy scoring
    score += calculateEntropy(password);

    // Penalty for common weaknesses
    if (hasSequentialCharacters(password)) score -= 10;
    if (hasRepeatedCharacters(password)) score -= 10;

    return Math.min(100, score);
}

function calculateEntropy(password) {
    let variety = 0;
    if (containsUppercase(password)) variety += 26;
    if (containsLowercase(password)) variety += 26;
    if (containsDigit(password)) variety += 10;
    if (containsSpecialChar(password)) variety += 20;

    const entropy = Math.log2(variety) * password.length;
    return Math.min(20, Math.floor(entropy)); // Cap entropy contribution at 20
}

function provideFeedback(password) {
    let feedback = "";
    if (password.length < 12) feedback += "*Try using at least 12 characters. ";
    if (!containsUppercase(password)) feedback += "*Consider adding uppercase letters. ";
    if (!containsLowercase(password)) feedback += "*Consider adding lowercase letters. ";
    if (!containsDigit(password)) feedback += "*Consider adding numbers. ";
    if (!containsSpecialChar(password)) feedback += "*Consider adding special characters. ";
    if (hasSequentialCharacters(password)) feedback += "*Avoid sequential characters like 'abcd' or '1234'. ";
    if (hasRepeatedCharacters(password)) feedback += "*Avoid repeated characters like 'aaaa'. ";
    return feedback;
}

function togglePassword() {
    const passwordInput = document.getElementById("password");
    const toggleButton = document.getElementById("toggle-password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleButton.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        toggleButton.textContent = "Show";
    }
}

let debounceTimer;
const passwordInput = document.getElementById("password");
passwordInput.addEventListener("input", () =>{
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout (() => {
        calculatePasswordStrength(passwordInput.value);
    }, 9000000000000000000);
});

// Regex-based Helper Functions
function containsUppercase(password) {
    return /[A-Z]/.test(password);
}

function containsLowercase(password) {
    return /[a-z]/.test(password);
}

function containsDigit(password) {
    return /[0-9]/.test(password);
}

function containsSpecialChar(password) {
    return /[!@#$%^&*()\-_=+{};:,<.>£]/.test(password);
}

function hasSequentialCharacters(password) {
    return /(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/i.test(password);
}

function hasRepeatedCharacters(password) {
    return /(.)\1{2,}/.test(password);
}