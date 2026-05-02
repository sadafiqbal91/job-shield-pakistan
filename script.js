// Content dictionary for English and Urdu
const content = {
    en: {
        tagline: "Fake Job Scam Detector",
        instruction: "Paste any job advertisement text or message below. Our system will analyze it for common scam indicators in Pakistan.",
        placeholder: "Paste the job description or WhatsApp message here...",
        analyzeBtn: "Analyze Job Ad",
        clearBtn: "Clear",
        resultTitle: "Analysis Result",
        warningsTitle: "Identified Red Flags:",
        safeMessage: "No obvious scam indicators found. However, always exercise caution and verify company details independently.",
        riskScore: "Risk Score",
        safeBadge: "Safe",
        warningBadge: "Suspicious",
        dangerBadge: "Scam",
        reportBtn: "Report This Scam",
        reportInstruction: "Is this a scam? Help others by reporting it to our database.",
        reportSuccess: "Thanks! This scam has been reported to our live database.",
        aiTitle: "AI Expert Opinion",
        aiLoading: "AI is analyzing the job description...",
        aiError: "AI analysis failed. Please try again later.",
    },
    ur: {
        tagline: "Jali Job Scam Detector",
        instruction: "Yahan kisi bhi job ka ishtehar ya message paste karein. Hamara system check karega ke isme koi scam ya dhoka to nahi.",
        placeholder: "Job ki details ya WhatsApp message yahan paste karein...",
        analyzeBtn: "Check Karein",
        clearBtn: "Clear",
        resultTitle: "Nateeja (Result)",
        warningsTitle: "Khatre ki Nishaniyan (Red Flags):",
        safeMessage: "Koi wazeh scam nahi mila. Phir bhi, ehtiyat karein aur company ki khud tehqeeq karein.",
        riskScore: "Risk Score",
        safeBadge: "Mehfooz (Safe)",
        warningBadge: "Mashkook (Suspicious)",
        dangerBadge: "Dhoka (Scam)",
        reportBtn: "Is Scam ko Report Karein",
        reportInstruction: "Kya ye ek dhoka hai? Isay database mein report kar ke doosron ki madad karein.",
        reportSuccess: "Shukriya! Ye scam humare live database mein report ho gaya hai.",
        aiTitle: "AI Expert Ki Raye (Opinion)",
        aiLoading: "AI analysis kar raha hai, thora intezar karein...",
        aiError: "AI analysis nakam ho gaya. Baad mein koshish karein.",
    }
};

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyD71JLI4Zk1x2GcSxvraVqd1HPAZbedPis",
  authDomain: "jobshield-pakistan.firebaseapp.com",
  projectId: "jobshield-pakistan",
  storageBucket: "jobshield-pakistan.firebasestorage.app",
  messagingSenderId: "236422579240",
  appId: "1:236422579240:web:63b02d308cf31741d6a11d",
  measurementId: "G-C5KFMG3N8X"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Scam indicators and their weights (score from 0 to 100)
const scamKeywords = [
    { regex: /registration fee/i, score: 40, en: "Mentions 'registration fee'. Legitimate jobs do not ask you to pay to work.", ur: "Registration fee mangi gayi hai. Asal jobs mein paise nahi mangte." },
    { regex: /security deposit/i, score: 40, en: "Asks for a 'security deposit'. This is a common scam tactic.", ur: "Security deposit manga gaya hai jo ke ek dhoka ho sakta hai." },
    { regex: /easy paisa|easypaisa|jazz cash|jazzcash/i, score: 30, en: "Mentions local mobile wallets (Easypaisa/JazzCash). Often used by scammers for quick, untraceable payments.", ur: "Easypaisa ya JazzCash ka zikar hai. Scammers aksar inka istemal karte hain." },
    { regex: /urgent hiring/i, score: 10, en: "Claims 'urgent hiring'. Scammers use urgency to rush your decision.", ur: "'Urgent Hiring' likha hai. Scammers jaldbazi karwate hain." },
    { regex: /no interview/i, score: 30, en: "Says 'no interview' required. Real companies always interview candidates.", ur: "Bina interview ke job de rahe hain, jo ke ajeeb hai." },
    { regex: /daily \d+\s*(rs|pkr)/i, score: 20, en: "Promises high daily guaranteed income. Often unrealistic.", ur: "Rozana fix aamdani ka wada kiya ja raha hai jo gair haqeeqi lagta hai." },
    { regex: /typing work|data entry/i, score: 10, en: "Mentions basic typing/data entry. Highly prone to scams in Pakistan.", ur: "Data entry ya typing ka kaam hai, inme kafi fraud hote hain." },
    { regex: /@gmail\.com|@yahoo\.com|@hotmail\.com/i, score: 20, en: "Uses a free email address (e.g., Gmail) instead of a company domain.", ur: "Company ki bajaye aam email (Gmail waghera) use hui hai." },
    { regex: /whatsapp only/i, score: 15, en: "Requests contact via 'WhatsApp only'. Professional jobs usually use email.", ur: "Sirf WhatsApp par contact karne ko kaha hai." },
    { regex: /investment/i, score: 30, en: "Mentions 'investment'. Jobs pay you, you don't pay them.", ur: "Investment ka zikar hai. Asal job mein aapko paise milte hain, dene nahi hote." },
    { regex: /laptop provide/i, score: 10, en: "Promises to provide a laptop easily. Often a bait to ask for shipping fees later.", ur: "Muft laptop dene ka wada hai, baad mein delivery charges mang sakte hain." }
];

// DOM Elements
const jobText = document.getElementById('job-text');
const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');
const resultSection = document.getElementById('result-section');
const riskBadge = document.getElementById('risk-badge');
const scoreFill = document.getElementById('score-fill');
const scoreText = document.getElementById('score-text');
const warningsList = document.getElementById('warnings-list');
const safeMessage = document.getElementById('safe-message');
const langEnBtn = document.getElementById('lang-en');
const langUrBtn = document.getElementById('lang-ur');
const reportContainer = document.getElementById('report-container');
const reportBtn = document.getElementById('report-btn');
const reportInstruction = document.getElementById('report-instruction');

const aiAnalysisSection = document.getElementById('ai-analysis-section');
const aiTitle = document.getElementById('ai-title');
const aiLoading = document.getElementById('ai-loading');
const aiLoadingText = document.getElementById('ai-loading-text');
const aiResultText = document.getElementById('ai-result-text');

let currentLang = 'en';
let lastAnalysis = null; // Store last results to re-render on language switch

// Language Toggle Logic
function updateLanguage(lang) {
    currentLang = lang;
    
    // Update active button state
    if(lang === 'en') {
        langEnBtn.classList.add('active');
        langUrBtn.classList.remove('active');
    } else {
        langUrBtn.classList.add('active');
        langEnBtn.classList.remove('active');
    }

    // Update static text
    document.getElementById('tagline-text').textContent = content[lang].tagline;
    document.getElementById('instruction-text').textContent = content[lang].instruction;
    jobText.placeholder = content[lang].placeholder;
    analyzeBtn.textContent = content[lang].analyzeBtn;
    clearBtn.textContent = content[lang].clearBtn;
    document.getElementById('result-title').textContent = content[lang].resultTitle;
    document.getElementById('warnings-title').textContent = content[lang].warningsTitle;
    safeMessage.querySelector('p').textContent = content[lang].safeMessage;
    
    // Update Report section
    reportInstruction.textContent = content[lang].reportInstruction;
    if (!reportBtn.classList.contains('reported')) {
        reportBtn.textContent = content[lang].reportBtn;
    }

    // Update AI section text
    aiTitle.textContent = content[lang].aiTitle;
    aiLoadingText.textContent = content[lang].aiLoading;

    // Re-render results if there's an active analysis
    if (lastAnalysis && !resultSection.classList.contains('hidden')) {
        renderResults(lastAnalysis.score, lastAnalysis.warnings);
    }
}

langEnBtn.addEventListener('click', () => updateLanguage('en'));
langUrBtn.addEventListener('click', () => updateLanguage('ur'));

// Clear functionality
clearBtn.addEventListener('click', () => {
    jobText.value = '';
    resultSection.classList.add('hidden');
    lastAnalysis = null;
});

// Analyze Logic
analyzeBtn.addEventListener('click', () => {
    const text = jobText.value.trim();
    if (!text) {
        alert(currentLang === 'en' ? "Please paste some text to analyze." : "Baraye meharbani analyze karne ke liye kuch text paste karein.");
        return;
    }

    let totalScore = 0;
    const detectedWarnings = [];

    scamKeywords.forEach(indicator => {
        if (indicator.regex.test(text)) {
            totalScore += indicator.score;
            detectedWarnings.push(indicator);
        }
    });

    // Cap the score at 100
    if (totalScore > 100) totalScore = 100;

    lastAnalysis = {
        score: totalScore,
        warnings: detectedWarnings
    };

    renderResults(totalScore, detectedWarnings);
    
    // Call Gemini AI for deeper analysis
    analyzeWithAI(text);
});

// Render Results
function renderResults(score, warnings) {
    resultSection.classList.remove('hidden');
    warningsList.innerHTML = '';
    
    // Update score bar
    scoreFill.style.width = `${score}%`;
    scoreText.textContent = `${content[currentLang].riskScore}: ${score}/100`;

    // Reset classes
    riskBadge.className = 'risk-badge';
    scoreFill.style.backgroundColor = '';

    // Determine risk level
    if (score === 0) {
        riskBadge.textContent = content[currentLang].safeBadge;
        riskBadge.classList.add('risk-safe');
        scoreFill.style.backgroundColor = 'var(--safe-color)';
        safeMessage.classList.remove('hidden');
        document.querySelector('.warnings-container').classList.add('hidden');
        reportContainer.classList.add('hidden');
    } else {
        safeMessage.classList.add('hidden');
        document.querySelector('.warnings-container').classList.remove('hidden');
        reportContainer.classList.remove('hidden');
        
        // Reset report button
        reportBtn.classList.remove('reported');
        reportBtn.disabled = false;
        reportBtn.textContent = content[currentLang].reportBtn;

        if (score < 50) {
            riskBadge.textContent = content[currentLang].warningBadge;
            riskBadge.classList.add('risk-warning');
            scoreFill.style.backgroundColor = 'var(--warning-color)';
        } else {
            riskBadge.textContent = content[currentLang].dangerBadge;
            riskBadge.classList.add('risk-danger');
            scoreFill.style.backgroundColor = 'var(--danger-color)';
        }

        // Render warnings
        warnings.forEach(warning => {
            const li = document.createElement('li');
            li.textContent = warning[currentLang];
            warningsList.appendChild(li);
        });
    }
}

// Handle Report to Firebase
reportBtn.addEventListener('click', () => {
    const text = jobText.value.trim();
    
    reportBtn.disabled = true;
    reportBtn.textContent = "...";

    db.collection("reported_scams").add({
        text: text,
        score: lastAnalysis.score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        language: currentLang
    })
    .then(() => {
        reportBtn.textContent = "✓ Reported";
        reportBtn.classList.add('reported');
        alert(content[currentLang].reportSuccess);
    })
    .catch((error) => {
        console.error("Error reporting scam: ", error);
        reportBtn.disabled = false;
        reportBtn.textContent = content[currentLang].reportBtn;
        alert("Error: Could not save report. Please try again.");
    });
});

// --- Gemini AI Analysis Function ---
async function analyzeWithAI(text) {
    aiAnalysisSection.classList.remove('hidden');
    aiLoading.classList.remove('hidden');
    aiResultText.textContent = "";

    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            body: JSON.stringify({ text: text, lang: currentLang }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || errorData.error || 'AI analysis failed. Please try again later.');
        }

        const data = await response.json();
        const aiResponseText = data.analysis;

        aiLoading.classList.add('hidden');
        aiResultText.textContent = aiResponseText;
    } catch (error) {
        console.error("AI Analysis Error:", error);
        aiLoading.classList.add('hidden');
        aiResultText.textContent = `${content[currentLang].aiError} (${error.message})`;
    }
}
