import { createContext, useContext, useState, useCallback } from 'react';

// ── Translation strings ───────────────────────────────────────────────────────
export const LANGUAGES = [
  { code: 'en', label: 'English',    native: 'English' },
  { code: 'hi', label: 'Hindi',      native: 'हिंदी' },
  { code: 'ta', label: 'Tamil',      native: 'தமிழ்' },
  { code: 'te', label: 'Telugu',     native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali',    native: 'বাংলা' },
  { code: 'mr', label: 'Marathi',    native: 'मराठी' },
];

const T = {
  en: {
    // Nav
    home: 'Home', chat: 'Chat', timeline: 'Timeline', profile: 'Profile',
    // Home
    tagline: 'Your guide through every step of voting',
    electionProcess: 'Election Process', aiAssistant: 'AI Assistant',
    timelineLabel: 'Timeline', myProfile: 'My Profile',
    stepByStep: 'Step-by-step guide', askAnything: 'Ask anything',
    keyDates: 'Key election dates', personalizedTips: 'Personalised tips',
    quickFacts: 'Quick Facts',
    forIndianVoters: '🇮🇳 For Indian Voters',
    getVoterId: 'Get Your Voter ID',
    applyOfficial: 'Apply via official government portal',
    notSureStart: 'Not sure where to start?',
    askAI: 'Ask the AI Assistant',
    explore: 'Explore',
    // Timeline
    electionTimeline: 'Election Timeline',
    keyDatesFor: 'Key dates for Election 2026',
    all: 'All', completed: 'Completed', active: 'Active', upcoming: 'Upcoming',
    // Notifications
    notifications: 'Notifications',
    noNotifications: 'No new notifications',
    markAllRead: 'Mark all read',
    daysLeft: 'days left',
    today: 'Today!',
    tomorrow: 'Tomorrow',
    // VoterID
    voterIdTitle: 'Voter ID — India 🇮🇳',
    selectState: 'Select Your State',
    stateHelp: 'Choose your state to get the right ECI links',
    checkEligibility: 'Check Your Eligibility',
    // Language picker
    selectLanguage: 'Language',
  },
  hi: {
    home: 'होम', chat: 'चैट', timeline: 'टाइमलाइन', profile: 'प्रोफाइल',
    tagline: 'मतदान के हर कदम में आपका मार्गदर्शक',
    electionProcess: 'चुनाव प्रक्रिया', aiAssistant: 'AI सहायक',
    timelineLabel: 'टाइमलाइन', myProfile: 'मेरी प्रोफाइल',
    stepByStep: 'चरण-दर-चरण मार्गदर्शिका', askAnything: 'कुछ भी पूछें',
    keyDates: 'चुनाव की मुख्य तारीखें', personalizedTips: 'व्यक्तिगत सुझाव',
    quickFacts: 'त्वरित तथ्य',
    forIndianVoters: '🇮🇳 भारतीय मतदाताओं के लिए',
    getVoterId: 'मतदाता पहचान पत्र पाएं',
    applyOfficial: 'सरकारी पोर्टल से आवेदन करें',
    notSureStart: 'कहाँ से शुरू करें?',
    askAI: 'AI सहायक से पूछें',
    explore: 'अन्वेषण करें',
    electionTimeline: 'चुनाव टाइमलाइन',
    keyDatesFor: 'चुनाव 2026 की मुख्य तारीखें',
    all: 'सभी', completed: 'पूर्ण', active: 'सक्रिय', upcoming: 'आगामी',
    notifications: 'सूचनाएं',
    noNotifications: 'कोई नई सूचना नहीं',
    markAllRead: 'सभी पढ़ा हुआ करें',
    daysLeft: 'दिन शेष', today: 'आज!', tomorrow: 'कल',
    voterIdTitle: 'मतदाता पहचान पत्र — भारत 🇮🇳',
    selectState: 'अपना राज्य चुनें',
    stateHelp: 'सही ECI लिंक के लिए राज्य चुनें',
    checkEligibility: 'पात्रता जांचें',
    selectLanguage: 'भाषा',
  },
  ta: {
    home: 'முகப்பு', chat: 'அரட்டை', timeline: 'காலவரிசை', profile: 'சுயவிவரம்',
    tagline: 'வாக்களிப்பின் ஒவ்வொரு படியிலும் உங்கள் வழிகாட்டி',
    electionProcess: 'தேர்தல் செயல்முறை', aiAssistant: 'AI உதவியாளர்',
    timelineLabel: 'காலவரிசை', myProfile: 'என் சுயவிவரம்',
    stepByStep: 'படி-படியாக வழிகாட்டி', askAnything: 'எதையும் கேளுங்கள்',
    keyDates: 'முக்கிய தேர்தல் தேதிகள்', personalizedTips: 'தனிப்பயன் குறிப்புகள்',
    quickFacts: 'விரைவு உண்மைகள்',
    forIndianVoters: '🇮🇳 இந்திய வாக்காளர்களுக்கு',
    getVoterId: 'வாக்காளர் அட்டை பெறுங்கள்',
    applyOfficial: 'அரசு போர்டல் மூலம் விண்ணப்பிக்கவும்',
    notSureStart: 'எங்கிருந்து தொடங்குவது?',
    askAI: 'AI உதவியாளரிடம் கேளுங்கள்',
    explore: 'ஆராயுங்கள்',
    electionTimeline: 'தேர்தல் காலவரிசை',
    keyDatesFor: 'தேர்தல் 2026 முக்கிய தேதிகள்',
    all: 'அனைத்தும்', completed: 'முடிந்தது', active: 'செயல்பாட்டில்', upcoming: 'வரவிருக்கும்',
    notifications: 'அறிவிப்புகள்',
    noNotifications: 'புதிய அறிவிப்புகள் இல்லை',
    markAllRead: 'அனைத்தையும் படித்ததாக குறி',
    daysLeft: 'நாட்கள் உள்ளன', today: 'இன்று!', tomorrow: 'நாளை',
    voterIdTitle: 'வாக்காளர் அட்டை — இந்தியா 🇮🇳',
    selectState: 'உங்கள் மாநிலத்தை தேர்ந்தெடுக்கவும்',
    stateHelp: 'சரியான ECI இணைப்புகளுக்கு மாநிலத்தை தேர்ந்தெடுக்கவும்',
    checkEligibility: 'தகுதி சரிபாருங்கள்',
    selectLanguage: 'மொழி',
  },
  te: {
    home: 'హోమ్', chat: 'చాట్', timeline: 'టైమ్‌లైన్', profile: 'ప్రొఫైల్',
    tagline: 'ఓటింగ్ ప్రతి దశలో మీ మార్గదర్శి',
    electionProcess: 'ఎన్నికల ప్రక్రియ', aiAssistant: 'AI సహాయకుడు',
    timelineLabel: 'టైమ్‌లైన్', myProfile: 'నా ప్రొఫైల్',
    stepByStep: 'దశల వారీ మార్గదర్శి', askAnything: 'ఏదైనా అడగండి',
    keyDates: 'ముఖ్యమైన ఎన్నికల తేదీలు', personalizedTips: 'వ్యక్తిగత సూచనలు',
    quickFacts: 'త్వరిత వాస్తవాలు',
    forIndianVoters: '🇮🇳 భారతీయ ఓటర్లకు',
    getVoterId: 'మీ ఓటర్ ID పొందండి',
    applyOfficial: 'అధికారిక ప్రభుత్వ పోర్టల్ ద్వారా దరఖాస్తు చేయండి',
    notSureStart: 'ఎక్కడ మొదలు పెట్టాలో తెలియడం లేదా?',
    askAI: 'AI సహాయకుడిని అడగండి',
    explore: 'అన్వేషించండి',
    electionTimeline: 'ఎన్నికల టైమ్‌లైన్',
    keyDatesFor: 'ఎన్నికలు 2026 ముఖ్య తేదీలు',
    all: 'అన్నీ', completed: 'పూర్తయింది', active: 'క్రియాశీలం', upcoming: 'రాబోయే',
    notifications: 'నోటిఫికేషన్లు',
    noNotifications: 'కొత్త నోటిఫికేషన్లు లేవు',
    markAllRead: 'అన్నీ చదివినట్లు గుర్తించు',
    daysLeft: 'రోజులు మిగిలాయి', today: 'ఈరోజు!', tomorrow: 'రేపు',
    voterIdTitle: 'ఓటర్ ID — భారతదేశం 🇮🇳',
    selectState: 'మీ రాష్ట్రం ఎంచుకోండి',
    stateHelp: 'సరైన ECI లింకుల కోసం రాష్ట్రాన్ని ఎంచుకోండి',
    checkEligibility: 'అర్హత తనిఖీ చేయండి',
    selectLanguage: 'భాష',
  },
  bn: {
    home: 'হোম', chat: 'চ্যাট', timeline: 'টাইমলাইন', profile: 'প্রোফাইল',
    tagline: 'ভোটদানের প্রতিটি পদক্ষেপে আপনার গাইড',
    electionProcess: 'নির্বাচন প্রক্রিয়া', aiAssistant: 'AI সহকারী',
    timelineLabel: 'টাইমলাইন', myProfile: 'আমার প্রোফাইল',
    stepByStep: 'ধাপে ধাপে গাইড', askAnything: 'যেকোনো প্রশ্ন করুন',
    keyDates: 'গুরুত্বপূর্ণ নির্বাচনের তারিখ', personalizedTips: 'ব্যক্তিগত পরামর্শ',
    quickFacts: 'দ্রুত তথ্য',
    forIndianVoters: '🇮🇳 ভারতীয় ভোটারদের জন্য',
    getVoterId: 'আপনার ভোটার আইডি পান',
    applyOfficial: 'সরকারি পোর্টালে আবেদন করুন',
    notSureStart: 'কোথা থেকে শুরু করবেন বুঝতে পারছেন না?',
    askAI: 'AI সহকারীকে জিজ্ঞেস করুন',
    explore: 'অন্বেষণ করুন',
    electionTimeline: 'নির্বাচনী টাইমলাইন',
    keyDatesFor: 'নির্বাচন ২০২৬ এর মূল তারিখ',
    all: 'সব', completed: 'সম্পন্ন', active: 'সক্রিয়', upcoming: 'আসন্ন',
    notifications: 'বিজ্ঞপ্তি',
    noNotifications: 'কোনো নতুন বিজ্ঞপ্তি নেই',
    markAllRead: 'সব পঠিত হিসেবে চিহ্নিত করুন',
    daysLeft: 'দিন বাকি', today: 'আজ!', tomorrow: 'আগামীকাল',
    voterIdTitle: 'ভোটার আইডি — ভারত 🇮🇳',
    selectState: 'আপনার রাজ্য নির্বাচন করুন',
    stateHelp: 'সঠিক ECI লিঙ্কের জন্য রাজ্য নির্বাচন করুন',
    checkEligibility: 'যোগ্যতা পরীক্ষা করুন',
    selectLanguage: 'ভাষা',
  },
  mr: {
    home: 'होम', chat: 'चॅट', timeline: 'टाइमलाइन', profile: 'प्रोफाइल',
    tagline: 'मतदानाच्या प्रत्येक टप्प्यात तुमचा मार्गदर्शक',
    electionProcess: 'निवडणूक प्रक्रिया', aiAssistant: 'AI सहाय्यक',
    timelineLabel: 'टाइमलाइन', myProfile: 'माझे प्रोफाइल',
    stepByStep: 'पायरी-पायरी मार्गदर्शिका', askAnything: 'काहीही विचारा',
    keyDates: 'मुख्य निवडणूक तारखा', personalizedTips: 'वैयक्तिक टिप्स',
    quickFacts: 'त्वरित माहिती',
    forIndianVoters: '🇮🇳 भारतीय मतदारांसाठी',
    getVoterId: 'मतदार ओळखपत्र मिळवा',
    applyOfficial: 'अधिकृत सरकारी पोर्टलवर अर्ज करा',
    notSureStart: 'कुठून सुरुवात करावी माहित नाही?',
    askAI: 'AI सहाय्यकाला विचारा',
    explore: 'एक्सप्लोर करा',
    electionTimeline: 'निवडणूक टाइमलाइन',
    keyDatesFor: 'निवडणूक २०२६ च्या मुख्य तारखा',
    all: 'सर्व', completed: 'पूर्ण', active: 'सक्रिय', upcoming: 'येणारे',
    notifications: 'सूचना',
    noNotifications: 'कोणत्याही नवीन सूचना नाहीत',
    markAllRead: 'सर्व वाचले म्हणून चिन्हांकित करा',
    daysLeft: 'दिवस शिल्लक', today: 'आज!', tomorrow: 'उद्या',
    voterIdTitle: 'मतदार ओळखपत्र — भारत 🇮🇳',
    selectState: 'तुमचे राज्य निवडा',
    stateHelp: 'योग्य ECI लिंकसाठी राज्य निवडा',
    checkEligibility: 'पात्रता तपासा',
    selectLanguage: 'भाषा',
  },
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('electpath_lang') || 'en'; } catch { return 'en'; }
  });

  const changeLang = useCallback((code) => {
    setLang(code);
    try { localStorage.setItem('electpath_lang', code); } catch {}
  }, []);

  const t = useCallback((key) => T[lang]?.[key] ?? T['en'][key] ?? key, [lang]);

  return (
    <LangContext.Provider value={{ lang, changeLang, t, languages: LANGUAGES }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
