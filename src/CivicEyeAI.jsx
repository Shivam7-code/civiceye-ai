import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapPin, Camera, Upload, Activity, CheckCircle2, Clock, AlertTriangle,
  ShieldCheck, Building2, Droplets, Lightbulb, Trash2, Construction,
  Zap, BarChart3, Globe, User, LayoutDashboard, Plus, ArrowRight,
  Loader2, X, Filter, TrendingUp, Users, Gauge, Award, Sparkles,
  Brain, Send, RefreshCw, Eye, LayoutGrid, Table2, ChevronRight, Cpu,
  Lock, LogOut, Phone, Siren, Shield, PhoneCall, Navigation, Hospital,
  Flame, Waves, Wind, Thermometer, Mountain, Radio, ShieldAlert, Cross,
  PhoneIncoming, MapPinned, BellRing
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import _ from "lodash";
import { predictDisasterRisk } from "./utils/disasterPrediction";

/* ----------------------------- Constants ----------------------------- */

const STATUS_ORDER = ["Submitted", "Acknowledged", "In Progress", "Resolved"];

const SEV = {
  low:      { color: "#34d399", glow: "rgba(52,211,153,0.55)",  rank: 1 },
  medium:   { color: "#fbbf24", glow: "rgba(251,191,36,0.55)",  rank: 2 },
  high:     { color: "#fb923c", glow: "rgba(251,146,60,0.55)",  rank: 3 },
  critical: { color: "#f43f5e", glow: "rgba(244,63,94,0.6)",    rank: 4 },
};

const ISSUE_ICON = {
  pothole: Construction,
  garbage: Trash2,
  water_leakage: Droplets,
  damaged_streetlight: Lightbulb,
  road_damage: Construction,
  drainage_issue: Droplets,
  public_safety_hazard: AlertTriangle,
  infrastructure_damage: Building2,
  other: Activity,
};

const ISSUE_GRADIENT = {
  pothole: ["#f59e0b", "#7c2d12"],
  garbage: ["#22c55e", "#14532d"],
  water_leakage: ["#38bdf8", "#1e3a8a"],
  damaged_streetlight: ["#fde047", "#854d0e"],
  road_damage: ["#fb923c", "#7c2d12"],
  drainage_issue: ["#22d3ee", "#155e75"],
  public_safety_hazard: ["#f43f5e", "#7f1d1d"],
  infrastructure_damage: ["#a78bfa", "#4c1d95"],
  other: ["#94a3b8", "#334155"],
};

const STATUS_COLOR = {
  "Submitted": "#60a5fa",
  "Acknowledged": "#a78bfa",
  "In Progress": "#fbbf24",
  "Resolved": "#34d399",
};

const LEVELS = [
  { min: 0,   key: 0 },
  { min: 40,  key: 1 },
  { min: 90,  key: 2 },
  { min: 160, key: 3 },
  { min: 260, key: 4 },
];

/* --------------------------- Translations ---------------------------- */

const T = {
  en: {
    appName: "CivicEye AI",
    eyebrow: "Smart City Civic Intelligence",
    heroTitle: "Report. Analyze. Resolve.",
    heroSub: "An AI-powered civic platform that sees urban problems, triages them in seconds, and routes them to the right department — building smarter, safer cities.",
    ctaPrimary: "Launch Platform",
    ctaSecondary: "How it works",
    backHome: "Home",
    statReports: "Issues Analyzed",
    statResolved: "Resolved",
    statResponse: "Avg Response (hrs)",
    statCities: "Cities Onboard",
    featuresTitle: "Built for the whole city",
    f1t: "AI Vision Triage", f1d: "Snap a photo. Computer vision classifies the issue, scores urgency, and estimates impact instantly.",
    f2t: "Smart Routing", f2d: "Every report is auto-assigned to the right municipal department with a severity-ranked queue.",
    f3t: "Live Analytics", f3d: "Real-time dashboards and a city heatmap give officials a bird's-eye view of urban health.",
    f4t: "Citizen Engagement", f4d: "Residents earn points and levels for active participation, turning civic duty into impact.",
    howTitle: "Three steps to a fixed city",
    s1t: "Capture", s1d: "A citizen photographs a civic issue and drops a location pin.",
    s2t: "Analyze", s2d: "CivicEye AI classifies the problem, scores urgency and routes it.",
    s3t: "Resolve", s3d: "The right department acknowledges, acts and marks it resolved.",
    roleCitizen: "Citizen", roleOfficer: "Officer", roleAdmin: "Admin",
    tabDashboard: "Dashboard", tabReport: "Report Issue", tabAnalytics: "Analytics",
    welcome: "Welcome back, Citizen",
    total: "Total Reports", active: "Active", resolved: "Resolved",
    recentActivity: "Recent Activity", reportNew: "Report New Issue",
    engagement: "Engagement Score", level: "Level", points: "pts", noActivity: "No reports yet — be the first to make your city better.",
    reportTitle: "Report a Civic Issue",
    uploadPrompt: "Upload a photo of the issue",
    uploadHint: "PNG or JPG — our AI will analyze it instantly",
    changePhoto: "Change photo",
    analyzing: "AI is analyzing the scene…",
    analyzeFail: "Couldn't reach the AI service. Showing an offline estimate so you can still submit.",
    retry: "Re-analyze",
    aiResult: "AI Analysis",
    issueType: "Issue Type", severity: "Severity", urgency: "Urgency Score",
    affected: "Affected Population", department: "Department", summary: "Summary",
    confidence: "Confidence", aiEstimate: "AI estimate", lowConf: "Low confidence — this may not be a civic issue.",
    locationTitle: "Pin the location",
    locationHint: "Tap the city map or type coordinates",
    coords: "Latitude, Longitude", submit: "Submit Report", submitDone: "Report submitted!",
    authTitle: "Complaint Operations",
    authSub: "All civic reports, ranked by urgency",
    filters: "Filters", fCat: "Category", fSev: "Severity", fStat: "Status",
    all: "All", sortNote: "Sorted by urgency", cards: "Cards", table: "Table",
    advance: "Advance", colId: "ID", colType: "Type", colDept: "Dept", colStatus: "Status", colUrg: "Urgency", colAction: "Action",
    noMatch: "No complaints match these filters.",
    analyticsTitle: "City Analytics",
    severityDist: "Severity Distribution", byCategory: "Complaints by Category",
    monthlyTrend: "Monthly Trend", deptPerf: "Department Performance",
    cityMapTitle: "Live City Heatmap", cityMapHint: "Glowing dots are active reports, colored by severity",
    reported: "Reported", resolvedBar: "Resolved",
    sev: { low: "Low", medium: "Medium", high: "High", critical: "Critical" },
    status: { "Submitted": "Submitted", "Acknowledged": "Acknowledged", "In Progress": "In Progress", "Resolved": "Resolved" },
    dept: { "Road Maintenance": "Road Maintenance", "Sanitation": "Sanitation", "Water Board": "Water Board", "Electrical": "Electrical", "Public Works": "Public Works", "Public Safety": "Public Safety" },
    issue: { pothole: "Pothole", garbage: "Garbage", water_leakage: "Water Leakage", damaged_streetlight: "Damaged Streetlight", road_damage: "Road Damage", drainage_issue: "Drainage Issue", public_safety_hazard: "Public Safety Hazard", infrastructure_damage: "Infrastructure Damage", other: "Other" },
    levelName: ["Newcomer", "Contributor", "Advocate", "Champion", "City Guardian"],
    mlEstimate: "ML estimate",
    slaStatus: "SLA Status", colSla: "SLA Risk",
    atRiskCard: "Tickets at risk of SLA breach", atRiskHint: "Predicted to miss resolution deadline",
    atRiskFilter: "Show only at-risk", sortUrg: "Urgency", sortSla: "SLA Risk",
    sortBy: "Sort by", daysLeft: "d left", daysOver: "d over",
    riskZonesTitle: "Predicted Risk Zones", riskZonesHint: "K-Means clusters forecasting where the next issue is likely — tap a zone to inspect",
    showHotspots: "Show predicted hotspots", topZones: "Top Risk Zones",
    zonePast: "past complaints", zoneChance: "chance next issue here", zoneAvg: "Avg severity",
    zoneMembers: "Complaints in this zone", noZone: "Tap a risk zone to see its complaints.",
    risk: { "On Track": "On Track", "At Risk": "At Risk", "Critical": "Critical", "Breached": "Breached" },
    // --- Auth / Emergency / Safety / Disaster ---
    loginTitle: "Sign in to CivicEye AI", loginSub: "Smart City Civic Intelligence Platform",
    email: "Email", password: "Password", roleLabel: "Sign in as", login: "Login", logout: "Logout",
    demoCreds: "Demo credentials (click to fill)", invalidCreds: "Invalid email or password for this role.",
    signedInAs: "Signed in as",
    emergency: "Emergency", emergencyHub: "Emergency Hub", ambulance: "Ambulance", police: "Police", fire: "Fire", sos: "SOS",
    sosActivate: "Activate SOS", sosActive: "Emergency Mode Active", sosHint: "One tap shares your live location with responders",
    locating: "Getting your live location…", locFail: "Location unavailable — enable GPS/permissions. Showing approximate city centre.",
    liveLocation: "Live Location", time: "Time", callNow: "Call now", nearest: "Nearest", cancel: "Cancel", sosLogged: "SOS recorded",
    resourcesTitle: "Emergency Resource Locator", resourcesHint: "Hospitals, police and fire stations near you",
    openNow: "Open now", openOnly: "Open now only", km: "km away", allKinds: "All",
    safetyTitle: "Women Safety Mode", shield: "Safety Shield", shieldOn: "Shield Active", shieldOff: "Shield Off",
    shieldHint: "Quick access to SOS, fake call and live-location sharing",
    fakeCall: "Trigger Fake Call", incoming: "Incoming call…", decline: "Decline", accept: "Accept",
    shareLoc: "Share Live Location", sharing: "Sharing live location…", stopShare: "Stop sharing",
    disasterTitle: "Disaster Alerts", disasterSub: "Active hazard levels and recommended actions",
    affectedArea: "Area", affectedPop: "Affected", recActions: "Recommended actions",
    riskPredTitle: "Disaster Risk Prediction", aiDisclaimer: "AI Estimate — Not an official government warning.",
    activeSos: "Active SOS alerts", noSos: "No active SOS alerts.", noResources: "No facilities match this filter.",
    level: "Level",
    dlevel: { Green: "Green", Yellow: "Yellow", Orange: "Orange", Red: "Red" },
    rlevel: { Low: "Low", Moderate: "Moderate", High: "High", Critical: "Critical" },
    hazard: { Flood: "Flood", Earthquake: "Earthquake", Cyclone: "Cyclone", Heatwave: "Heatwave" },
    rkind: { hospital: "Hospital", police: "Police", fire: "Fire" },
    tabSafety: "Safety", tabAlerts: "Alerts",
  },
  hi: {
    appName: "CivicEye AI",
    eyebrow: "स्मार्ट सिटी नागरिक बुद्धिमत्ता",
    heroTitle: "रिपोर्ट करें। विश्लेषण करें। हल करें।",
    heroSub: "एक AI-संचालित नागरिक मंच जो शहरी समस्याओं को देखता है, सेकंडों में उनका वर्गीकरण करता है और सही विभाग तक पहुँचाता है — स्मार्ट और सुरक्षित शहर बनाता है।",
    ctaPrimary: "प्लेटफ़ॉर्म शुरू करें",
    ctaSecondary: "यह कैसे काम करता है",
    backHome: "होम",
    statReports: "विश्लेषित समस्याएँ",
    statResolved: "हल हुईं",
    statResponse: "औसत प्रतिक्रिया (घंटे)",
    statCities: "जुड़े शहर",
    featuresTitle: "पूरे शहर के लिए बना",
    f1t: "AI विज़न ट्राइएज", f1d: "एक फ़ोटो लें। कंप्यूटर विज़न समस्या को वर्गीकृत करता है, तात्कालिकता मापता है और प्रभाव का अनुमान लगाता है।",
    f2t: "स्मार्ट रूटिंग", f2d: "हर रिपोर्ट गंभीरता के अनुसार सही नगरपालिका विभाग को स्वतः सौंपी जाती है।",
    f3t: "लाइव एनालिटिक्स", f3d: "रीयल-टाइम डैशबोर्ड और सिटी हीटमैप अधिकारियों को शहरी स्वास्थ्य का विहंगम दृश्य देते हैं।",
    f4t: "नागरिक भागीदारी", f4d: "नागरिक सक्रिय भागीदारी के लिए अंक और स्तर अर्जित करते हैं।",
    howTitle: "ठीक शहर तक तीन कदम",
    s1t: "कैप्चर", s1d: "नागरिक समस्या की फ़ोटो लेता है और स्थान पिन करता है।",
    s2t: "विश्लेषण", s2d: "CivicEye AI समस्या का वर्गीकरण करता है और उसे रूट करता है।",
    s3t: "समाधान", s3d: "सही विभाग स्वीकार करता है, कार्य करता है और हल के रूप में चिह्नित करता है।",
    roleCitizen: "नागरिक", roleOfficer: "अधिकारी", roleAdmin: "एडमिन",
    tabDashboard: "डैशबोर्ड", tabReport: "समस्या दर्ज करें", tabAnalytics: "एनालिटिक्स",
    welcome: "वापसी पर स्वागत है, नागरिक",
    total: "कुल रिपोर्ट", active: "सक्रिय", resolved: "हल हुईं",
    recentActivity: "हाल की गतिविधि", reportNew: "नई समस्या दर्ज करें",
    engagement: "भागीदारी स्कोर", level: "स्तर", points: "अंक", noActivity: "अभी कोई रिपोर्ट नहीं — अपने शहर को बेहतर बनाने वाले पहले बनें।",
    reportTitle: "नागरिक समस्या दर्ज करें",
    uploadPrompt: "समस्या की फ़ोटो अपलोड करें",
    uploadHint: "PNG या JPG — हमारा AI तुरंत विश्लेषण करेगा",
    changePhoto: "फ़ोटो बदलें",
    analyzing: "AI दृश्य का विश्लेषण कर रहा है…",
    analyzeFail: "AI सेवा तक नहीं पहुँच सका। आप फिर भी सबमिट कर सकें, इसके लिए ऑफ़लाइन अनुमान दिखाया जा रहा है।",
    retry: "फिर विश्लेषण करें",
    aiResult: "AI विश्लेषण",
    issueType: "समस्या प्रकार", severity: "गंभीरता", urgency: "तात्कालिकता स्कोर",
    affected: "प्रभावित जनसंख्या", department: "विभाग", summary: "सारांश",
    confidence: "विश्वास", aiEstimate: "AI अनुमान", lowConf: "कम विश्वास — यह नागरिक समस्या नहीं हो सकती।",
    locationTitle: "स्थान पिन करें",
    locationHint: "सिटी मैप पर टैप करें या निर्देशांक दर्ज करें",
    coords: "अक्षांश, देशांतर", submit: "रिपोर्ट सबमिट करें", submitDone: "रिपोर्ट सबमिट हुई!",
    authTitle: "शिकायत संचालन",
    authSub: "सभी नागरिक रिपोर्ट, तात्कालिकता के अनुसार क्रमित",
    filters: "फ़िल्टर", fCat: "श्रेणी", fSev: "गंभीरता", fStat: "स्थिति",
    all: "सभी", sortNote: "तात्कालिकता अनुसार क्रमित", cards: "कार्ड", table: "तालिका",
    advance: "आगे बढ़ाएँ", colId: "आईडी", colType: "प्रकार", colDept: "विभाग", colStatus: "स्थिति", colUrg: "तात्कालिकता", colAction: "कार्रवाई",
    noMatch: "इन फ़िल्टर से कोई शिकायत मेल नहीं खाती।",
    analyticsTitle: "शहर एनालिटिक्स",
    severityDist: "गंभीरता वितरण", byCategory: "श्रेणी अनुसार शिकायतें",
    monthlyTrend: "मासिक रुझान", deptPerf: "विभाग प्रदर्शन",
    cityMapTitle: "लाइव सिटी हीटमैप", cityMapHint: "चमकते बिंदु सक्रिय रिपोर्ट हैं, गंभीरता अनुसार रंगीन",
    reported: "दर्ज", resolvedBar: "हल हुईं",
    sev: { low: "कम", medium: "मध्यम", high: "उच्च", critical: "गंभीर" },
    status: { "Submitted": "सबमिट", "Acknowledged": "स्वीकृत", "In Progress": "प्रगति में", "Resolved": "हल हुई" },
    dept: { "Road Maintenance": "सड़क रखरखाव", "Sanitation": "स्वच्छता", "Water Board": "जल बोर्ड", "Electrical": "विद्युत", "Public Works": "लोक निर्माण", "Public Safety": "जन सुरक्षा" },
    issue: { pothole: "गड्ढा", garbage: "कचरा", water_leakage: "जल रिसाव", damaged_streetlight: "खराब स्ट्रीटलाइट", road_damage: "सड़क क्षति", drainage_issue: "जल निकासी समस्या", public_safety_hazard: "जन सुरक्षा खतरा", infrastructure_damage: "बुनियादी ढाँचा क्षति", other: "अन्य" },
    levelName: ["नवागंतुक", "योगदानकर्ता", "समर्थक", "चैंपियन", "नगर संरक्षक"],
    mlEstimate: "ML अनुमान",
    slaStatus: "SLA स्थिति", colSla: "SLA जोखिम",
    atRiskCard: "SLA उल्लंघन के जोखिम वाले टिकट", atRiskHint: "समय-सीमा चूकने का पूर्वानुमान",
    atRiskFilter: "केवल जोखिम वाले दिखाएँ", sortUrg: "तात्कालिकता", sortSla: "SLA जोखिम",
    sortBy: "क्रमबद्ध करें", daysLeft: "दिन शेष", daysOver: "दिन अधिक",
    riskZonesTitle: "पूर्वानुमानित जोखिम क्षेत्र", riskZonesHint: "K-Means क्लस्टर बताते हैं अगली समस्या कहाँ संभव है — विवरण हेतु क्षेत्र टैप करें",
    showHotspots: "पूर्वानुमानित हॉटस्पॉट दिखाएँ", topZones: "शीर्ष जोखिम क्षेत्र",
    zonePast: "पिछली शिकायतें", zoneChance: "अगली समस्या यहाँ होने की संभावना", zoneAvg: "औसत गंभीरता",
    zoneMembers: "इस क्षेत्र की शिकायतें", noZone: "इसकी शिकायतें देखने हेतु जोखिम क्षेत्र टैप करें।",
    risk: { "On Track": "सही राह पर", "At Risk": "जोखिम में", "Critical": "गंभीर", "Breached": "उल्लंघित" },
    loginTitle: "CivicEye AI में साइन इन करें", loginSub: "स्मार्ट सिटी नागरिक बुद्धिमत्ता मंच",
    email: "ईमेल", password: "पासवर्ड", roleLabel: "इस रूप में साइन इन करें", login: "लॉगिन", logout: "लॉगआउट",
    demoCreds: "डेमो क्रेडेंशियल (भरने हेतु क्लिक करें)", invalidCreds: "इस भूमिका हेतु अमान्य ईमेल या पासवर्ड।",
    signedInAs: "साइन इन:",
    emergency: "आपातकाल", emergencyHub: "आपातकालीन हब", ambulance: "एम्बुलेंस", police: "पुलिस", fire: "अग्निशमन", sos: "SOS",
    sosActivate: "SOS सक्रिय करें", sosActive: "आपातकालीन मोड सक्रिय", sosHint: "एक टैप आपकी लाइव लोकेशन साझा करता है",
    locating: "आपकी लाइव लोकेशन प्राप्त हो रही है…", locFail: "लोकेशन अनुपलब्ध — GPS/अनुमति सक्षम करें। अनुमानित शहर केंद्र दिखा रहे हैं।",
    liveLocation: "लाइव लोकेशन", time: "समय", callNow: "अभी कॉल करें", nearest: "निकटतम", cancel: "रद्द करें", sosLogged: "SOS दर्ज",
    resourcesTitle: "आपातकालीन संसाधन लोकेटर", resourcesHint: "आपके पास अस्पताल, पुलिस और अग्निशमन केंद्र",
    openNow: "अभी खुला", openOnly: "केवल खुले हुए", km: "किमी दूर", allKinds: "सभी",
    safetyTitle: "महिला सुरक्षा मोड", shield: "सुरक्षा कवच", shieldOn: "कवच सक्रिय", shieldOff: "कवच बंद",
    shieldHint: "SOS, नकली कॉल और लाइव-लोकेशन साझा तक त्वरित पहुँच",
    fakeCall: "नकली कॉल चालू करें", incoming: "इनकमिंग कॉल…", decline: "अस्वीकार", accept: "स्वीकार",
    shareLoc: "लाइव लोकेशन साझा करें", sharing: "लाइव लोकेशन साझा हो रही है…", stopShare: "साझा रोकें",
    disasterTitle: "आपदा अलर्ट", disasterSub: "सक्रिय खतरा स्तर और अनुशंसित कार्रवाई",
    affectedArea: "क्षेत्र", affectedPop: "प्रभावित", recActions: "अनुशंसित कार्रवाई",
    riskPredTitle: "आपदा जोखिम पूर्वानुमान", aiDisclaimer: "AI अनुमान — यह सरकारी चेतावनी नहीं है।",
    activeSos: "सक्रिय SOS अलर्ट", noSos: "कोई सक्रिय SOS अलर्ट नहीं।", noResources: "इस फ़िल्टर से कोई सुविधा मेल नहीं खाती।",
    level: "स्तर",
    dlevel: { Green: "हरा", Yellow: "पीला", Orange: "नारंगी", Red: "लाल" },
    rlevel: { Low: "कम", Moderate: "मध्यम", High: "उच्च", Critical: "गंभीर" },
    hazard: { Flood: "बाढ़", Earthquake: "भूकंप", Cyclone: "चक्रवात", Heatwave: "लू" },
    rkind: { hospital: "अस्पताल", police: "पुलिस", fire: "अग्निशमन" },
    tabSafety: "सुरक्षा", tabAlerts: "अलर्ट",
  },
  kn: {
    appName: "CivicEye AI",
    eyebrow: "ಸ್ಮಾರ್ಟ್ ಸಿಟಿ ನಾಗರಿಕ ಬುದ್ಧಿಮತ್ತೆ",
    heroTitle: "ವರದಿ ಮಾಡಿ. ವಿಶ್ಲೇಷಿಸಿ. ಪರಿಹರಿಸಿ.",
    heroSub: "ನಗರ ಸಮಸ್ಯೆಗಳನ್ನು ನೋಡಿ, ಕ್ಷಣಗಳಲ್ಲಿ ವರ್ಗೀಕರಿಸಿ ಸರಿಯಾದ ಇಲಾಖೆಗೆ ತಲುಪಿಸುವ AI-ಚಾಲಿತ ನಾಗರಿಕ ವೇದಿಕೆ — ಸ್ಮಾರ್ಟ್ ಮತ್ತು ಸುರಕ್ಷಿತ ನಗರಗಳನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ.",
    ctaPrimary: "ವೇದಿಕೆ ಪ್ರಾರಂಭಿಸಿ",
    ctaSecondary: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    backHome: "ಮುಖಪುಟ",
    statReports: "ವಿಶ್ಲೇಷಿಸಿದ ಸಮಸ್ಯೆಗಳು",
    statResolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
    statResponse: "ಸರಾಸರಿ ಪ್ರತಿಕ್ರಿಯೆ (ಗಂಟೆ)",
    statCities: "ಸೇರಿದ ನಗರಗಳು",
    featuresTitle: "ಇಡೀ ನಗರಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ",
    f1t: "AI ದೃಷ್ಟಿ ವಿಂಗಡಣೆ", f1d: "ಫೋಟೋ ತೆಗೆಯಿರಿ. ಕಂಪ್ಯೂಟರ್ ದೃಷ್ಟಿ ಸಮಸ್ಯೆಯನ್ನು ವರ್ಗೀಕರಿಸಿ ತುರ್ತುತೆ ಮತ್ತು ಪ್ರಭಾವವನ್ನು ಅಂದಾಜಿಸುತ್ತದೆ.",
    f2t: "ಸ್ಮಾರ್ಟ್ ರೂಟಿಂಗ್", f2d: "ಪ್ರತಿ ವರದಿ ತೀವ್ರತೆಯ ಆಧಾರದಲ್ಲಿ ಸರಿಯಾದ ಪಾಲಿಕೆ ಇಲಾಖೆಗೆ ಸ್ವಯಂ ನಿಯೋಜಿಸಲಾಗುತ್ತದೆ.",
    f3t: "ಲೈವ್ ಅನಾಲಿಟಿಕ್ಸ್", f3d: "ರಿಯಲ್-ಟೈಮ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಮತ್ತು ನಗರ ಹೀಟ್‌ಮ್ಯಾಪ್ ಅಧಿಕಾರಿಗಳಿಗೆ ನಗರ ಆರೋಗ್ಯದ ನೋಟ ನೀಡುತ್ತದೆ.",
    f4t: "ನಾಗರಿಕ ಭಾಗವಹಿಸುವಿಕೆ", f4d: "ನಾಗರಿಕರು ಸಕ್ರಿಯ ಭಾಗವಹಿಸುವಿಕೆಗಾಗಿ ಅಂಕಗಳು ಮತ್ತು ಹಂತಗಳನ್ನು ಗಳಿಸುತ್ತಾರೆ.",
    howTitle: "ಸರಿಪಡಿಸಿದ ನಗರಕ್ಕೆ ಮೂರು ಹಂತಗಳು",
    s1t: "ಸೆರೆಹಿಡಿಯಿರಿ", s1d: "ನಾಗರಿಕನು ಸಮಸ್ಯೆಯ ಫೋಟೋ ತೆಗೆದು ಸ್ಥಳ ಪಿನ್ ಮಾಡುತ್ತಾನೆ.",
    s2t: "ವಿಶ್ಲೇಷಣೆ", s2d: "CivicEye AI ಸಮಸ್ಯೆಯನ್ನು ವರ್ಗೀಕರಿಸಿ ರೂಟ್ ಮಾಡುತ್ತದೆ.",
    s3t: "ಪರಿಹಾರ", s3d: "ಸರಿಯಾದ ಇಲಾಖೆ ಸ್ವೀಕರಿಸಿ, ಕಾರ್ಯ ಮಾಡಿ ಪರಿಹರಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸುತ್ತದೆ.",
    roleCitizen: "ನಾಗರಿಕ", roleOfficer: "ಅಧಿಕಾರಿ", roleAdmin: "ಅಡ್ಮಿನ್",
    tabDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", tabReport: "ಸಮಸ್ಯೆ ವರದಿ", tabAnalytics: "ಅನಾಲಿಟಿಕ್ಸ್",
    welcome: "ಮರಳಿ ಸ್ವಾಗತ, ನಾಗರಿಕ",
    total: "ಒಟ್ಟು ವರದಿಗಳು", active: "ಸಕ್ರಿಯ", resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
    recentActivity: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ", reportNew: "ಹೊಸ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ",
    engagement: "ಭಾಗವಹಿಸುವಿಕೆ ಸ್ಕೋರ್", level: "ಹಂತ", points: "ಅಂಕ", noActivity: "ಇನ್ನೂ ವರದಿಗಳಿಲ್ಲ — ನಿಮ್ಮ ನಗರವನ್ನು ಉತ್ತಮಗೊಳಿಸುವ ಮೊದಲಿಗರಾಗಿ.",
    reportTitle: "ನಾಗರಿಕ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ",
    uploadPrompt: "ಸಮಸ್ಯೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    uploadHint: "PNG ಅಥವಾ JPG — ನಮ್ಮ AI ತಕ್ಷಣ ವಿಶ್ಲೇಷಿಸುತ್ತದೆ",
    changePhoto: "ಫೋಟೋ ಬದಲಿಸಿ",
    analyzing: "AI ದೃಶ್ಯವನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ…",
    analyzeFail: "AI ಸೇವೆ ತಲುಪಲಾಗಲಿಲ್ಲ. ನೀವು ಸಲ್ಲಿಸಲು ಸಾಧ್ಯವಾಗುವಂತೆ ಆಫ್‌ಲೈನ್ ಅಂದಾಜು ತೋರಿಸಲಾಗುತ್ತಿದೆ.",
    retry: "ಮರು ವಿಶ್ಲೇಷಿಸಿ",
    aiResult: "AI ವಿಶ್ಲೇಷಣೆ",
    issueType: "ಸಮಸ್ಯೆ ಪ್ರಕಾರ", severity: "ತೀವ್ರತೆ", urgency: "ತುರ್ತು ಸ್ಕೋರ್",
    affected: "ಬಾಧಿತ ಜನಸಂಖ್ಯೆ", department: "ಇಲಾಖೆ", summary: "ಸಾರಾಂಶ",
    confidence: "ವಿಶ್ವಾಸ", aiEstimate: "AI ಅಂದಾಜು", lowConf: "ಕಡಿಮೆ ವಿಶ್ವಾಸ — ಇದು ನಾಗರಿಕ ಸಮಸ್ಯೆಯಾಗಿರದಿರಬಹುದು.",
    locationTitle: "ಸ್ಥಳ ಪಿನ್ ಮಾಡಿ",
    locationHint: "ನಗರ ನಕ್ಷೆಯ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ ಅಥವಾ ನಿರ್ದೇಶಾಂಕ ನಮೂದಿಸಿ",
    coords: "ಅಕ್ಷಾಂಶ, ರೇಖಾಂಶ", submit: "ವರದಿ ಸಲ್ಲಿಸಿ", submitDone: "ವರದಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!",
    authTitle: "ದೂರು ಕಾರ್ಯಾಚರಣೆ",
    authSub: "ಎಲ್ಲಾ ನಾಗರಿಕ ವರದಿಗಳು, ತುರ್ತಿನ ಆಧಾರದಲ್ಲಿ ಶ್ರೇಣೀಕೃತ",
    filters: "ಫಿಲ್ಟರ್‌ಗಳು", fCat: "ವರ್ಗ", fSev: "ತೀವ್ರತೆ", fStat: "ಸ್ಥಿತಿ",
    all: "ಎಲ್ಲಾ", sortNote: "ತುರ್ತಿನ ಆಧಾರದಲ್ಲಿ ಶ್ರೇಣೀಕೃತ", cards: "ಕಾರ್ಡ್‌ಗಳು", table: "ಟೇಬಲ್",
    advance: "ಮುಂದುವರಿಸಿ", colId: "ಐಡಿ", colType: "ಪ್ರಕಾರ", colDept: "ಇಲಾಖೆ", colStatus: "ಸ್ಥಿತಿ", colUrg: "ತುರ್ತು", colAction: "ಕ್ರಿಯೆ",
    noMatch: "ಈ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಯಾವುದೇ ದೂರು ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.",
    analyticsTitle: "ನಗರ ಅನಾಲಿಟಿಕ್ಸ್",
    severityDist: "ತೀವ್ರತೆ ವಿತರಣೆ", byCategory: "ವರ್ಗದ ಆಧಾರದಲ್ಲಿ ದೂರುಗಳು",
    monthlyTrend: "ಮಾಸಿಕ ಪ್ರವೃತ್ತಿ", deptPerf: "ಇಲಾಖೆ ಕಾರ್ಯಕ್ಷಮತೆ",
    cityMapTitle: "ಲೈವ್ ನಗರ ಹೀಟ್‌ಮ್ಯಾಪ್", cityMapHint: "ಹೊಳೆಯುವ ಚುಕ್ಕೆಗಳು ಸಕ್ರಿಯ ವರದಿಗಳು, ತೀವ್ರತೆಯ ಆಧಾರದಲ್ಲಿ ಬಣ್ಣ",
    reported: "ವರದಿ", resolvedBar: "ಪರಿಹರಿಸಲಾಗಿದೆ",
    sev: { low: "ಕಡಿಮೆ", medium: "ಮಧ್ಯಮ", high: "ಹೆಚ್ಚು", critical: "ಗಂಭೀರ" },
    status: { "Submitted": "ಸಲ್ಲಿಸಲಾಗಿದೆ", "Acknowledged": "ಸ್ವೀಕರಿಸಲಾಗಿದೆ", "In Progress": "ಪ್ರಗತಿಯಲ್ಲಿ", "Resolved": "ಪರಿಹರಿಸಲಾಗಿದೆ" },
    dept: { "Road Maintenance": "ರಸ್ತೆ ನಿರ್ವಹಣೆ", "Sanitation": "ನೈರ್ಮಲ್ಯ", "Water Board": "ಜಲ ಮಂಡಳಿ", "Electrical": "ವಿದ್ಯುತ್", "Public Works": "ಲೋಕೋಪಯೋಗಿ", "Public Safety": "ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ" },
    issue: { pothole: "ಗುಂಡಿ", garbage: "ಕಸ", water_leakage: "ನೀರಿನ ಸೋರಿಕೆ", damaged_streetlight: "ಹಾಳಾದ ಬೀದಿದೀಪ", road_damage: "ರಸ್ತೆ ಹಾನಿ", drainage_issue: "ಒಳಚರಂಡಿ ಸಮಸ್ಯೆ", public_safety_hazard: "ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ ಅಪಾಯ", infrastructure_damage: "ಮೂಲಸೌಕರ್ಯ ಹಾನಿ", other: "ಇತರೆ" },
    levelName: ["ಹೊಸಬ", "ಕೊಡುಗೆದಾರ", "ಪ್ರತಿಪಾದಕ", "ಚಾಂಪಿಯನ್", "ನಗರ ರಕ್ಷಕ"],
    mlEstimate: "ML ಅಂದಾಜು",
    slaStatus: "SLA ಸ್ಥಿತಿ", colSla: "SLA ಅಪಾಯ",
    atRiskCard: "SLA ಉಲ್ಲಂಘನೆ ಅಪಾಯದ ಟಿಕೆಟ್‌ಗಳು", atRiskHint: "ಗಡುವು ತಪ್ಪಿಸುವ ಮುನ್ಸೂಚನೆ",
    atRiskFilter: "ಅಪಾಯದವುಗಳನ್ನು ಮಾತ್ರ ತೋರಿಸಿ", sortUrg: "ತುರ್ತು", sortSla: "SLA ಅಪಾಯ",
    sortBy: "ವಿಂಗಡಿಸಿ", daysLeft: "ದಿನ ಬಾಕಿ", daysOver: "ದಿನ ಮೀರಿದೆ",
    riskZonesTitle: "ಮುನ್ಸೂಚಿತ ಅಪಾಯ ವಲಯಗಳು", riskZonesHint: "ಮುಂದಿನ ಸಮಸ್ಯೆ ಎಲ್ಲಿ ಸಾಧ್ಯ ಎಂದು K-Means ಕ್ಲಸ್ಟರ್ ಸೂಚಿಸುತ್ತದೆ — ವಿವರಕ್ಕೆ ವಲಯ ಟ್ಯಾಪ್ ಮಾಡಿ",
    showHotspots: "ಮುನ್ಸೂಚಿತ ಹಾಟ್‌ಸ್ಪಾಟ್ ತೋರಿಸಿ", topZones: "ಪ್ರಮುಖ ಅಪಾಯ ವಲಯಗಳು",
    zonePast: "ಹಿಂದಿನ ದೂರುಗಳು", zoneChance: "ಮುಂದಿನ ಸಮಸ್ಯೆ ಇಲ್ಲಿ ಆಗುವ ಸಾಧ್ಯತೆ", zoneAvg: "ಸರಾಸರಿ ತೀವ್ರತೆ",
    zoneMembers: "ಈ ವಲಯದ ದೂರುಗಳು", noZone: "ಅದರ ದೂರುಗಳನ್ನು ನೋಡಲು ಅಪಾಯ ವಲಯ ಟ್ಯಾಪ್ ಮಾಡಿ.",
    risk: { "On Track": "ಸರಿಯಾಗಿದೆ", "At Risk": "ಅಪಾಯದಲ್ಲಿ", "Critical": "ಗಂಭೀರ", "Breached": "ಉಲ್ಲಂಘಿಸಲಾಗಿದೆ" },
    loginTitle: "CivicEye AI ಗೆ ಸೈನ್ ಇನ್ ಆಗಿ", loginSub: "ಸ್ಮಾರ್ಟ್ ಸಿಟಿ ನಾಗರಿಕ ಬುದ್ಧಿಮತ್ತೆ ವೇದಿಕೆ",
    email: "ಇಮೇಲ್", password: "ಪಾಸ್‌ವರ್ಡ್", roleLabel: "ಈ ರೂಪದಲ್ಲಿ ಸೈನ್ ಇನ್", login: "ಲಾಗಿನ್", logout: "ಲಾಗ್‌ಔಟ್",
    demoCreds: "ಡೆಮೋ ರುಜುವಾತುಗಳು (ತುಂಬಲು ಕ್ಲಿಕ್ ಮಾಡಿ)", invalidCreds: "ಈ ಪಾತ್ರಕ್ಕೆ ಅಮಾನ್ಯ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್.",
    signedInAs: "ಸೈನ್ ಇನ್:",
    emergency: "ತುರ್ತು", emergencyHub: "ತುರ್ತು ಹಬ್", ambulance: "ಆಂಬುಲೆನ್ಸ್", police: "ಪೊಲೀಸ್", fire: "ಅಗ್ನಿಶಾಮಕ", sos: "SOS",
    sosActivate: "SOS ಸಕ್ರಿಯಗೊಳಿಸಿ", sosActive: "ತುರ್ತು ಮೋಡ್ ಸಕ್ರಿಯ", sosHint: "ಒಂದು ಟ್ಯಾಪ್ ನಿಮ್ಮ ಲೈವ್ ಸ್ಥಳ ಹಂಚುತ್ತದೆ",
    locating: "ನಿಮ್ಮ ಲೈವ್ ಸ್ಥಳ ಪಡೆಯಲಾಗುತ್ತಿದೆ…", locFail: "ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ — GPS/ಅನುಮತಿ ಸಕ್ರಿಯಗೊಳಿಸಿ. ಅಂದಾಜು ನಗರ ಕೇಂದ್ರ ತೋರಿಸಲಾಗಿದೆ.",
    liveLocation: "ಲೈವ್ ಸ್ಥಳ", time: "ಸಮಯ", callNow: "ಈಗ ಕರೆ ಮಾಡಿ", nearest: "ಹತ್ತಿರದ", cancel: "ರದ್ದು", sosLogged: "SOS ದಾಖಲಾಗಿದೆ",
    resourcesTitle: "ತುರ್ತು ಸಂಪನ್ಮೂಲ ಲೊಕೇಟರ್", resourcesHint: "ನಿಮ್ಮ ಸಮೀಪದ ಆಸ್ಪತ್ರೆ, ಪೊಲೀಸ್ ಮತ್ತು ಅಗ್ನಿಶಾಮಕ ಠಾಣೆಗಳು",
    openNow: "ಈಗ ತೆರೆದಿದೆ", openOnly: "ತೆರೆದಿರುವವು ಮಾತ್ರ", km: "ಕಿಮೀ ದೂರ", allKinds: "ಎಲ್ಲಾ",
    safetyTitle: "ಮಹಿಳಾ ಸುರಕ್ಷತೆ ಮೋಡ್", shield: "ಸುರಕ್ಷತಾ ಕವಚ", shieldOn: "ಕವಚ ಸಕ್ರಿಯ", shieldOff: "ಕವಚ ಆಫ್",
    shieldHint: "SOS, ನಕಲಿ ಕರೆ ಮತ್ತು ಲೈವ್-ಸ್ಥಳ ಹಂಚಿಕೆಗೆ ತ್ವರಿತ ಪ್ರವೇಶ",
    fakeCall: "ನಕಲಿ ಕರೆ ಪ್ರಚೋದಿಸಿ", incoming: "ಒಳಬರುವ ಕರೆ…", decline: "ತಿರಸ್ಕರಿಸಿ", accept: "ಸ್ವೀಕರಿಸಿ",
    shareLoc: "ಲೈವ್ ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಿ", sharing: "ಲೈವ್ ಸ್ಥಳ ಹಂಚಲಾಗುತ್ತಿದೆ…", stopShare: "ಹಂಚಿಕೆ ನಿಲ್ಲಿಸಿ",
    disasterTitle: "ವಿಪತ್ತು ಎಚ್ಚರಿಕೆಗಳು", disasterSub: "ಸಕ್ರಿಯ ಅಪಾಯ ಮಟ್ಟ ಮತ್ತು ಶಿಫಾರಸು ಕ್ರಮಗಳು",
    affectedArea: "ಪ್ರದೇಶ", affectedPop: "ಬಾಧಿತ", recActions: "ಶಿಫಾರಸು ಕ್ರಮಗಳು",
    riskPredTitle: "ವಿಪತ್ತು ಅಪಾಯ ಮುನ್ಸೂಚನೆ", aiDisclaimer: "AI ಅಂದಾಜು — ಇದು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಎಚ್ಚರಿಕೆ ಅಲ್ಲ.",
    activeSos: "ಸಕ್ರಿಯ SOS ಎಚ್ಚರಿಕೆಗಳು", noSos: "ಸಕ್ರಿಯ SOS ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ.", noResources: "ಈ ಫಿಲ್ಟರ್‌ಗೆ ಸೌಲಭ್ಯ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.",
    level: "ಮಟ್ಟ",
    dlevel: { Green: "ಹಸಿರು", Yellow: "ಹಳದಿ", Orange: "ಕಿತ್ತಳೆ", Red: "ಕೆಂಪು" },
    rlevel: { Low: "ಕಡಿಮೆ", Moderate: "ಮಧ್ಯಮ", High: "ಹೆಚ್ಚು", Critical: "ಗಂಭೀರ" },
    hazard: { Flood: "ಪ್ರವಾಹ", Earthquake: "ಭೂಕಂಪ", Cyclone: "ಚಂಡಮಾರುತ", Heatwave: "ಬಿಸಿಗಾಳಿ" },
    rkind: { hospital: "ಆಸ್ಪತ್ರೆ", police: "ಪೊಲೀಸ್", fire: "ಅಗ್ನಿಶಾಮಕ" },
    tabSafety: "ಸುರಕ್ಷತೆ", tabAlerts: "ಎಚ್ಚರಿಕೆಗಳು",
  },
};

/* ----------------------------- Seed data ----------------------------- */

function daysAgo(d) {
  const t = new Date();
  t.setDate(t.getDate() - d);
  return t.toISOString();
}

const SEED = [
  { id: "CIV-0001", issueType: "pothole", severity: "high", urgencyScore: 82, estimatedAffectedPopulation: 4200, department: "Road Maintenance", summary: "Large pothole on a two-lane road creating a traffic hazard.", confidence: 0.91, status: "In Progress", timestamp: daysAgo(2), photo: null, mapX: 22, mapY: 38, byCitizen: true },
  { id: "CIV-0002", issueType: "garbage", severity: "medium", urgencyScore: 54, estimatedAffectedPopulation: 1500, department: "Sanitation", summary: "Overflowing garbage bins near a residential block.", confidence: 0.86, status: "Acknowledged", timestamp: daysAgo(5), photo: null, mapX: 61, mapY: 28, byCitizen: true },
  { id: "CIV-0003", issueType: "water_leakage", severity: "critical", urgencyScore: 95, estimatedAffectedPopulation: 8000, department: "Water Board", summary: "Burst water main flooding the street intersection.", confidence: 0.94, status: "Submitted", timestamp: daysAgo(1), photo: null, mapX: 45, mapY: 64, byCitizen: true },
  { id: "CIV-0004", issueType: "damaged_streetlight", severity: "low", urgencyScore: 28, estimatedAffectedPopulation: 600, department: "Electrical", summary: "A single streetlight not functioning at night.", confidence: 0.88, status: "Resolved", timestamp: daysAgo(30), photo: null, mapX: 79, mapY: 52, byCitizen: true },
  { id: "CIV-0005", issueType: "road_damage", severity: "high", urgencyScore: 76, estimatedAffectedPopulation: 3100, department: "Public Works", summary: "Cracked and broken road surface over a long stretch.", confidence: 0.83, status: "Acknowledged", timestamp: daysAgo(12), photo: null, mapX: 33, mapY: 76, byCitizen: true },
  { id: "CIV-0006", issueType: "drainage_issue", severity: "medium", urgencyScore: 60, estimatedAffectedPopulation: 2200, department: "Public Works", summary: "Clogged storm drain causing standing water.", confidence: 0.8, status: "Submitted", timestamp: daysAgo(70), photo: null, mapX: 68, mapY: 72, byCitizen: true },
];

const ANALYSIS_INSTRUCTION =
`You are CivicEye AI, a civic-issue triage vision model. Analyze the attached image of a possible civic/urban issue and respond with ONLY valid JSON — no markdown, no code fences, no prose — matching exactly this schema:
{
  "issueType": "pothole | garbage | water_leakage | damaged_streetlight | road_damage | drainage_issue | public_safety_hazard | infrastructure_damage | other",
  "severity": "low | medium | high | critical",
  "urgencyScore": 0-100,
  "estimatedAffectedPopulation": integer,
  "department": "Road Maintenance | Sanitation | Water Board | Electrical | Public Works | Public Safety",
  "summary": "one short factual sentence describing what is visible",
  "confidence": 0.0-1.0
}
Base every field ONLY on what is visible. Do not invent details. If the image is unclear or not a civic issue, set issueType to "other" and confidence below 0.4. Return the JSON object and nothing else.`;

/* ------------------------------ ML models ----------------------------- */
/* Vanilla-JS predictive models — no external ML libraries.
   Rule-based SLA breach predictor + K-Means geographic hotspot forecasting.
   Outputs are RESOURCE-ALLOCATION ESTIMATES, never presented as verified fact.
   Recalculated from React state via useMemo on every complaint change. */

const SLA_DAYS = { low: 30, medium: 14, high: 7, critical: 2 };

const RISK_META = {
  "On Track": { color: "#34d399", glow: "rgba(52,211,153,0.55)", rank: 0 },
  "At Risk":  { color: "#fbbf24", glow: "rgba(251,191,36,0.55)", rank: 1 },
  "Critical": { color: "#fb923c", glow: "rgba(251,146,60,0.55)", rank: 2 },
  "Breached": { color: "#f43f5e", glow: "rgba(244,63,94,0.6)",   rank: 3 },
};

function daysOpenOf(c) {
  return (Date.now() - new Date(c.timestamp).getTime()) / 86400000;
}

// ML MODEL 1 — SLA Breach Predictor (decision tree + additive risk weights)
function predictSLABreach(complaint, departmentWorkload) {
  const slaDays = SLA_DAYS[complaint.severity] ?? 14;
  const daysOpen = daysOpenOf(complaint);
  const daysRemaining = Math.round(slaDays - daysOpen);

  if (complaint.status === "Resolved") {
    return { breachProbability: 0, daysRemaining, riskLevel: "On Track", resolved: true };
  }

  // Base risk from time remaining (decision tree)
  let p;
  if (daysRemaining < 0) p = 1.0;
  else if (daysRemaining <= 2) p = 0.85;
  else if (daysRemaining <= 5) p = 0.55;
  else p = 0.2;

  // Additive modifiers (these now actually combine with the base)
  if (departmentWorkload > 10) p += 0.3;
  else if (departmentWorkload > 5) p += 0.15;
  if (complaint.severity === "critical") p += 0.15;
  p = Math.max(0, Math.min(1, p));

  let riskLevel;
  if (daysRemaining < 0) riskLevel = "Breached";
  else if (p > 0.75) riskLevel = "Critical";
  else if (p > 0.5) riskLevel = "At Risk";
  else riskLevel = "On Track";

  return { breachProbability: Number(p.toFixed(2)), daysRemaining, riskLevel, resolved: false };
}

// Map-plane distance (Euclidean on mapX/mapY 0–100 grid).
// Haversine is reserved for real lat/lng; most tickets only carry map coords.
function planeDist(a, b) {
  const dx = a[0] - b[0], dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

const SEV_RANK_TO_KEY = ["low", "medium", "high", "critical"];
function avgSevKey(idxs, complaints) {
  if (!idxs.length) return "low";
  const mean = idxs.reduce((s, i) => s + (SEV[complaints[i].severity]?.rank || 1), 0) / idxs.length;
  return SEV_RANK_TO_KEY[Math.max(0, Math.min(3, Math.round(mean) - 1))];
}

// ML MODEL 2 — Hotspot Forecasting via K-Means on map coordinates.
// k adapts to data size (~n/2, capped at 5); deterministic spread init for demo stability.
function predictHotspots(complaints) {
  const pts = complaints.map((c) => [c.mapX, c.mapY]);
  const n = pts.length;
  if (n === 0) return [];
  const k = Math.max(1, Math.min(5, Math.round(n / 2)));

  // Evenly-spaced deterministic seeding (better spread than first-k)
  let centroids = [];
  for (let i = 0; i < k; i++) centroids.push(pts[Math.floor((i * n) / k)].slice());

  let clusters = Array.from({ length: k }, () => []);
  for (let iter = 0; iter < 10; iter++) {
    clusters = Array.from({ length: k }, () => []);
    pts.forEach((point, idx) => {
      let best = 0, bestD = Infinity;
      centroids.forEach((c, i) => {
        const d = planeDist(point, c);
        if (d < bestD) { bestD = d; best = i; }
      });
      clusters[best].push(idx);
    });
    centroids = clusters.map((cluster, i) => {
      if (!cluster.length) return centroids[i];
      const mx = cluster.reduce((s, idx) => s + pts[idx][0], 0) / cluster.length;
      const my = cluster.reduce((s, idx) => s + pts[idx][1], 0) / cluster.length;
      return [mx, my];
    });
  }

  return centroids
    .map((centroid, i) => ({
      id: "zone-" + i,
      mapX: centroid[0],
      mapY: centroid[1],
      count: clusters[i].length,
      avgSeverity: avgSevKey(clusters[i], complaints),
      forecastRisk: Number((clusters[i].length / n).toFixed(3)),
      memberIds: clusters[i].map((idx) => complaints[idx].id),
    }))
    .filter((z) => z.count > 0)
    .sort((a, b) => b.forecastRisk - a.forecastRisk);
}

/* ----------------------------- Utilities ----------------------------- */

// Safe storage: persists in a real browser (local Vite build), and degrades
// gracefully to an in-memory map where storage is blocked (e.g. the artifact
// sandbox). The existing complaint flow stays in React state; only the NEW
// emergency/safety/disaster/auth modules use this, as the prompt requests.
const _mem = {};
const safeGet = (key) => {
  try {
    const raw = (typeof localStorage !== "undefined" ? localStorage.getItem(key) : null);
    if (raw != null) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return key in _mem ? _mem[key] : null;
};
const safeSet = (key, value) => {
  _mem[key] = value;
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* ignore */ }
};
const safeRemove = (key) => {
  delete _mem[key];
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
  } catch (e) { /* ignore */ }
};

const LS = { auth: "civiceye_auth", emergency: "civiceye_emergency", safety: "civiceye_safety", disaster: "civiceye_disaster" };

// Mock login users (client-side only — no backend, no real auth).
const DEMO_USERS = {
  citizen: { email: "citizen@civiceye.app", password: "demo123", role: "citizen", name: "Asha Citizen" },
  officer: { email: "officer@civiceye.app", password: "demo123", role: "officer", name: "Officer Rao" },
  admin:   { email: "admin@civiceye.app",   password: "demo123", role: "admin",   name: "Admin Mehta" },
};

// Seeded emergency resources plotted on the SVG city map (mapX/mapY: 0-100).
const EMERGENCY_RESOURCES = [
  { id: "h1", kind: "hospital", name: "City General Hospital", phone: "+911234500111", distanceKm: 1.2, openNow: true,  mapX: 28, mapY: 30 },
  { id: "h2", kind: "hospital", name: "Sunrise Multispeciality", phone: "+911234500112", distanceKm: 3.4, openNow: true,  mapX: 70, mapY: 44 },
  { id: "p1", kind: "police",   name: "Central Police Station",  phone: "100",            distanceKm: 0.8, openNow: true,  mapX: 48, mapY: 22 },
  { id: "p2", kind: "police",   name: "Lakeview Police Outpost", phone: "100",            distanceKm: 2.6, openNow: false, mapX: 60, mapY: 70 },
  { id: "f1", kind: "fire",     name: "Metro Fire Station",      phone: "101",            distanceKm: 1.9, openNow: true,  mapX: 20, mapY: 64 },
  { id: "f2", kind: "fire",     name: "Eastside Fire Brigade",   phone: "101",            distanceKm: 4.1, openNow: true,  mapX: 82, mapY: 28 },
];

const RESOURCE_META = {
  hospital: { color: "#34d399", glow: "rgba(52,211,153,0.6)", Icon: Hospital, tel: "108" },
  police:   { color: "#60a5fa", glow: "rgba(96,165,250,0.6)", Icon: Shield,   tel: "100" },
  fire:     { color: "#fb923c", glow: "rgba(251,146,60,0.6)", Icon: Flame,    tel: "101" },
};

// Seeded disaster alerts (mock — no live feed).
const DISASTER_LEVELS = {
  Green:  { color: "#34d399", rank: 0 },
  Yellow: { color: "#fbbf24", rank: 1 },
  Orange: { color: "#fb923c", rank: 2 },
  Red:    { color: "#f43f5e", rank: 3 },
};

const DISASTER_ICON = { Flood: Waves, Earthquake: Mountain, Cyclone: Wind, Heatwave: Thermometer };

const SEED_DISASTERS = [
  { id: "d1", hazard: "Flood",      level: "Orange", area: "Riverside & Old Town",   affected: 18500, actions: ["Move to higher ground", "Avoid low bridges", "Keep documents waterproof"] },
  { id: "d2", hazard: "Heatwave",   level: "Red",    area: "Central Business Dist.", affected: 42000, actions: ["Stay indoors 12–4pm", "Hydrate frequently", "Check on elderly neighbours"] },
  { id: "d3", hazard: "Cyclone",    level: "Yellow", area: "Coastal Belt",           affected: 9800,  actions: ["Secure loose objects", "Charge devices", "Track official bulletins"] },
  { id: "d4", hazard: "Earthquake", level: "Green",  area: "Greater Metro",          affected: 0,     actions: ["Know safe spots", "Secure heavy furniture", "Prepare a go-bag"] },
];

// Mock zones fed into the disaster risk predictor.
const DISASTER_RISK_ZONES = [
  { area: "Riverside & Old Town",   hazard: "Flood",      baseRisk: 72, exposure: 0.9 },
  { area: "Central Business Dist.", hazard: "Heatwave",   baseRisk: 80, exposure: 0.8 },
  { area: "Coastal Belt",           hazard: "Cyclone",    baseRisk: 55, exposure: 0.7 },
  { area: "Greater Metro",          hazard: "Earthquake", baseRisk: 40, exposure: 0.6 },
];

function useCountUp(target, run, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return val;
}

function levelFor(score) {
  let lvl = 0;
  for (const l of LEVELS) if (score >= l.min) lvl = l.key;
  return lvl;
}

function fmt(n) { return Number(n || 0).toLocaleString(); }

/* --------------------------- Small components ------------------------- */

function SeverityBadge({ severity, t }) {
  const meta = SEV[severity] || SEV.low;
  return (
    <span className="ce-badge" style={{ color: meta.color, borderColor: meta.color + "55", background: meta.color + "1a" }}>
      <span className="ce-dot" style={{ background: meta.color, boxShadow: `0 0 8px ${meta.glow}` }} />
      {t.sev[severity] || severity}
    </span>
  );
}

function StatusBadge({ status, t }) {
  const c = STATUS_COLOR[status] || "#94a3b8";
  return (
    <span className="ce-badge" style={{ color: c, borderColor: c + "55", background: c + "14" }}>
      {t.status[status] || status}
    </span>
  );
}

function SlaBadge({ sla, t, compact }) {
  if (!sla || sla.resolved) {
    return <span className="ce-badge" style={{ color: "#64748b", borderColor: "#64748b44", background: "#64748b14" }}><CheckCircle2 size={11} /> {t.status.Resolved}</span>;
  }
  const m = RISK_META[sla.riskLevel] || RISK_META["On Track"];
  const label = t.risk[sla.riskLevel] || sla.riskLevel;
  const days = sla.daysRemaining < 0
    ? `${Math.abs(sla.daysRemaining)}${t.daysOver}`
    : `${sla.daysRemaining}${t.daysLeft}`;
  return (
    <span className="ce-badge" style={{ color: m.color, borderColor: m.color + "55", background: m.color + "1a" }}>
      <span className="ce-dot" style={{ background: m.color, boxShadow: `0 0 8px ${m.glow}` }} />
      {label}{!compact && <span style={{ opacity: 0.7 }}> · {days}</span>}
    </span>
  );
}

function Thumb({ c, size = 56 }) {
  const Icon = ISSUE_ICON[c.issueType] || Activity;
  const [g1, g2] = ISSUE_GRADIENT[c.issueType] || ISSUE_GRADIENT.other;
  if (c.photo) {
    return <img src={c.photo} alt="" style={{ width: size, height: size, objectFit: "cover", borderRadius: 12 }} />;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${g1}, ${g2})`, flexShrink: 0
    }}>
      <Icon size={size * 0.42} color="#fff" strokeWidth={1.8} />
    </div>
  );
}

/* ------------------------------ City map ------------------------------ */

function CityMap({ complaints, interactive, picked, onPick, t, height = 300, hotspots, selectedZone, onSelectZone, resources, onSelectResource, selectedResource }) {
  const ref = useRef(null);
  const W = 400, H = 280;

  const handleClick = (e) => {
    if (!interactive || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const lat = (12.36 - (y / 100) * 0.18).toFixed(5);
    const lng = (76.58 + (x / 100) * 0.22).toFixed(5);
    onPick({ mapX: Math.round(x), mapY: Math.round(y), lat: Number(lat), lng: Number(lng) });
  };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      onClick={handleClick}
      style={{ width: "100%", height, borderRadius: 16, cursor: interactive ? "crosshair" : "default", display: "block" }}
    >
      <defs>
        <radialGradient id="mapglow" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0b1220" />
        </radialGradient>
        <linearGradient id="roadgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#mapglow)" />
      {/* grid roads */}
      {[60, 130, 200, 270, 340].map((x) => (
        <line key={"v" + x} x1={x} y1="0" x2={x} y2={H} stroke="url(#roadgrad)" strokeWidth="1.4" />
      ))}
      {[55, 110, 165, 220].map((y) => (
        <line key={"h" + y} x1="0" y1={y} x2={W} y2={y} stroke="url(#roadgrad)" strokeWidth="1.4" />
      ))}
      {/* decorative blocks */}
      {[[20, 18, 30, 26], [150, 70, 38, 30], [300, 130, 34, 40], [80, 180, 40, 28], [250, 30, 30, 22]].map((b, i) => (
        <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx="4" fill="#ffffff" opacity="0.04" stroke="#ffffff" strokeOpacity="0.06" />
      ))}
      {/* predicted hotspot zones (radius scales with forecast risk) */}
      {hotspots && hotspots.map((z) => {
        const meta = SEV[z.avgSeverity] || SEV.low;
        const cx = (z.mapX / 100) * W;
        const cy = (z.mapY / 100) * H;
        const r = 20 + z.forecastRisk * 95;
        const active = selectedZone === z.id;
        return (
          <g key={z.id} style={{ cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); onSelectZone && onSelectZone(active ? null : z.id); }}>
            <circle cx={cx} cy={cy} r={r} fill={meta.color} opacity={active ? 0.28 : 0.16}
              stroke={meta.color} strokeOpacity={active ? 0.9 : 0.4} strokeWidth={active ? 2 : 1} className="ce-pulse">
              <title>{`${z.count} ${t.zonePast} • ${Math.round(z.forecastRisk * 100)}% ${t.zoneChance} • ${t.zoneAvg}: ${t.sev[z.avgSeverity]}`}</title>
            </circle>
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff"
              style={{ pointerEvents: "none" }}>{Math.round(z.forecastRisk * 100)}%</text>
          </g>
        );
      })}
      {/* complaint dots */}
      {complaints.map((c) => {
        const meta = SEV[c.severity] || SEV.low;
        const cx = (c.mapX / 100) * W;
        const cy = (c.mapY / 100) * H;
        const isResolved = c.status === "Resolved";
        return (
          <g key={c.id} opacity={isResolved ? 0.45 : 1}>
            <circle cx={cx} cy={cy} r="13" fill={meta.color} opacity="0.18" className="ce-pulse" />
            <circle cx={cx} cy={cy} r="5.5" fill={meta.color} stroke="#0b1220" strokeWidth="1.5"
              style={{ filter: `drop-shadow(0 0 6px ${meta.glow})` }}>
              <title>{`${t.issue[c.issueType]} • ${t.sev[c.severity]}`}</title>
            </circle>
          </g>
        );
      })}
      {/* emergency resource markers (diamonds) */}
      {resources && resources.map((r) => {
        const meta = RESOURCE_META[r.kind];
        const cx = (r.mapX / 100) * W;
        const cy = (r.mapY / 100) * H;
        const active = selectedResource === r.id;
        const s = active ? 9 : 7;
        return (
          <g key={r.id} style={{ cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); onSelectResource && onSelectResource(active ? null : r.id); }}>
            <rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} rx="3"
              transform={`rotate(45 ${cx} ${cy})`}
              fill={meta.color} stroke="#0b1220" strokeWidth="1.5"
              opacity={r.openNow ? 1 : 0.5}
              style={{ filter: `drop-shadow(0 0 6px ${meta.glow})` }}>
              <title>{`${r.name} • ${r.distanceKm} ${t.km}${r.openNow ? " • " + t.openNow : ""}`}</title>
            </rect>
          </g>
        );
      })}
      {/* picked point */}
      {picked && (
        <g>
          <circle cx={(picked.mapX / 100) * W} cy={(picked.mapY / 100) * H} r="16" fill="#38bdf8" opacity="0.2" className="ce-pulse" />
          <circle cx={(picked.mapX / 100) * W} cy={(picked.mapY / 100) * H} r="6" fill="#38bdf8" stroke="#fff" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

/* ------------------------------- App ---------------------------------- */

export default function CivicEyeAI() {
  const [view, setView] = useState("landing");
  const [role, setRole] = useState("citizen");
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("dashboard");
  const [complaints, setComplaints] = useState(SEED);
  const [counter, setCounter] = useState(7);
  const [highlightId, setHighlightId] = useState(null);

  // Auth (mock, client-side). Restore session + safety pref on mount.
  const [session, setSession] = useState(null);
  const [shield, setShieldState] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [sosRecords, setSosRecords] = useState([]);

  const t = T[lang];

  useEffect(() => {
    const s = safeGet(LS.auth);
    if (s && s.role) { setSession(s); setRole(s.role); setView("app"); }
    const saf = safeGet(LS.safety);
    if (saf && typeof saf.shield === "boolean") setShieldState(saf.shield);
    const em = safeGet(LS.emergency);
    if (Array.isArray(em)) setSosRecords(em);
  }, []);

  const setShield = (v) => { setShieldState(v); safeSet(LS.safety, { shield: v }); };

  const login = (sess) => {
    safeSet(LS.auth, sess);
    setSession(sess);
    setRole(sess.role);
    setTab("dashboard");
    setView("app");
  };

  const logout = () => {
    safeRemove(LS.auth);
    setSession(null);
    setView("landing");
    setTab("dashboard");
  };

  // keep a valid tab when role changes
  useEffect(() => {
    if (role === "citizen" && (tab === "analytics")) setTab("dashboard");
    if (role !== "citizen" && (tab === "report" || tab === "safety")) setTab("dashboard");
  }, [role]); // eslint-disable-line

  const addComplaint = (data, photo, loc) => {
    const id = "CIV-" + String(counter).padStart(4, "0");
    setCounter((n) => n + 1);
    const ticket = {
      id, ...data, status: "Submitted", timestamp: new Date().toISOString(),
      photo, mapX: loc.mapX, mapY: loc.mapY, lat: loc.lat, lng: loc.lng, byCitizen: true,
    };
    setComplaints((arr) => [ticket, ...arr]);
    setHighlightId(id);
    return id;
  };

  const advance = (id) => {
    setComplaints((arr) => arr.map((c) => {
      if (c.id !== id) return c;
      const i = STATUS_ORDER.indexOf(c.status);
      return i < STATUS_ORDER.length - 1 ? { ...c, status: STATUS_ORDER[i + 1] } : c;
    }));
  };

  return (
    <div className="ce-root">
      <style>{CSS}</style>

      {view === "landing" && (
        <Landing t={t} lang={lang} setLang={setLang}
          onLaunch={() => setView(session ? "app" : "login")} />
      )}

      {view === "login" && (
        <LoginPage t={t} lang={lang} setLang={setLang} onLogin={login} />
      )}

      {view === "app" && session && (
        <div className="ce-app">
          <TopBar
            t={t} role={role} setRole={setRole} lang={lang} setLang={setLang}
            onHome={() => setView("landing")} session={session} onLogout={logout}
          />
          <Tabs t={t} role={role} tab={tab} setTab={setTab} />
          <main className="ce-main">
            {role === "citizen" && tab === "dashboard" && (
              <CitizenDash t={t} complaints={complaints} onReport={() => setTab("report")}
                highlightId={highlightId} shield={shield} onSOS={() => setSosOpen(true)}
                goSafety={() => setTab("safety")} goAlerts={() => setTab("alerts")} />
            )}
            {role === "citizen" && tab === "report" && (
              <ReportFlow t={t} lang={lang} onSubmit={addComplaint} goDash={() => setTab("dashboard")} complaints={complaints} />
            )}
            {role === "citizen" && tab === "safety" && (
              <>
                <WomenSafetyMode t={t} shield={shield} setShield={setShield} onSOS={() => setSosOpen(true)} />
                <div className="ce-main" style={{ padding: 0, marginTop: 16 }}>
                  <ResourceLocator t={t} complaints={complaints} />
                </div>
              </>
            )}
            {tab === "alerts" && (
              <DisasterDashboard t={t} sosRecords={role !== "citizen" ? sosRecords : null} />
            )}
            {role !== "citizen" && tab === "dashboard" && (
              <AuthorityDash t={t} complaints={complaints} advance={advance} highlightId={highlightId}
                sosRecords={sosRecords} goAlerts={() => setTab("alerts")} />
            )}
            {role !== "citizen" && tab === "analytics" && (
              <Analytics t={t} complaints={complaints} />
            )}
          </main>

          <EmergencyHub t={t} onSOS={() => setSosOpen(true)} sosCount={sosRecords.length} />
          {sosOpen && <SOSPanel t={t} onClose={() => setSosOpen(false)} onSaved={setSosRecords} />}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Landing ------------------------------- */

function Landing({ t, lang, setLang, onLaunch }) {
  const [run, setRun] = useState(false);
  useEffect(() => { const id = setTimeout(() => setRun(true), 250); return () => clearTimeout(id); }, []);
  const c1 = useCountUp(48700, run);
  const c2 = useCountUp(41200, run);
  const c3 = useCountUp(6, run);
  const c4 = useCountUp(120, run);

  const features = [
    { Icon: Brain, title: t.f1t, desc: t.f1d },
    { Icon: Send, title: t.f2t, desc: t.f2d },
    { Icon: BarChart3, title: t.f3t, desc: t.f3d },
    { Icon: Award, title: t.f4t, desc: t.f4d },
  ];
  const steps = [
    { Icon: Camera, title: t.s1t, desc: t.s1d },
    { Icon: Cpu, title: t.s2t, desc: t.s2d },
    { Icon: CheckCircle2, title: t.s3t, desc: t.s3d },
  ];

  return (
    <div className="ce-landing">
      <div className="ce-bgmesh" />
      <nav className="ce-nav">
        <div className="ce-brand">
          <span className="ce-logo"><Eye size={18} /></span>
          <span className="ce-grad-text ce-brandtext">{t.appName}</span>
        </div>
        <div className="ce-navright">
          <LangSwitch lang={lang} setLang={setLang} />
          <button className="ce-btn ce-btn-primary ce-btn-sm" onClick={onLaunch}>
            {t.ctaPrimary} <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <header className="ce-hero">
        <div className="ce-eyebrow ce-fade-up"><Sparkles size={14} /> {t.eyebrow}</div>
        <h1 className="ce-fade-up" style={{ animationDelay: "0.08s" }}>
          <span className="ce-grad-text">{t.heroTitle}</span>
        </h1>
        <p className="ce-hero-sub ce-fade-up" style={{ animationDelay: "0.16s" }}>{t.heroSub}</p>
        <div className="ce-hero-cta ce-fade-up" style={{ animationDelay: "0.24s" }}>
          <button className="ce-btn ce-btn-primary" onClick={onLaunch}>{t.ctaPrimary} <ArrowRight size={18} /></button>
          <a className="ce-btn ce-btn-ghost" href="#how">{t.ctaSecondary}</a>
        </div>

        <div className="ce-stats ce-fade-up" style={{ animationDelay: "0.32s" }}>
          {[
            { v: fmt(c1), l: t.statReports },
            { v: fmt(c2), l: t.statResolved },
            { v: c3, l: t.statResponse },
            { v: c4 + "+", l: t.statCities },
          ].map((s, i) => (
            <div className="ce-stat-pill ce-glass" key={i}>
              <div className="ce-stat-v ce-grad-text">{s.v}</div>
              <div className="ce-stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </header>

      <section className="ce-section">
        <h2 className="ce-h2">{t.featuresTitle}</h2>
        <div className="ce-grid-4">
          {features.map((f, i) => (
            <div className="ce-glass ce-feature ce-fade-up" key={i} style={{ animationDelay: `${0.05 * i}s` }}>
              <div className="ce-feat-icon"><f.Icon size={22} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ce-section" id="how">
        <h2 className="ce-h2">{t.howTitle}</h2>
        <div className="ce-grid-3">
          {steps.map((s, i) => (
            <div className="ce-glass ce-step ce-fade-up" key={i} style={{ animationDelay: `${0.05 * i}s` }}>
              <div className="ce-step-num">{i + 1}</div>
              <div className="ce-feat-icon"><s.Icon size={22} /></div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <ChevronRight className="ce-step-arrow" size={20} />}
            </div>
          ))}
        </div>
        <div className="ce-cta-final">
          <button className="ce-btn ce-btn-primary ce-btn-lg" onClick={onLaunch}>
            {t.ctaPrimary} <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <footer className="ce-footer">CivicEye AI — Smart City Hackathon Prototype</footer>
    </div>
  );
}

/* ------------------------------ Chrome -------------------------------- */

function LangSwitch({ lang, setLang }) {
  const langs = [["en", "EN"], ["hi", "हि"], ["kn", "ಕ"]];
  return (
    <div className="ce-lang ce-glass">
      <Globe size={14} style={{ opacity: 0.7, marginRight: 2 }} />
      {langs.map(([k, label]) => (
        <button key={k} className={"ce-lang-btn" + (lang === k ? " active" : "")} onClick={() => setLang(k)}>{label}</button>
      ))}
    </div>
  );
}

function TopBar({ t, role, setRole, lang, setLang, onHome, session, onLogout }) {
  const roles = [
    ["citizen", t.roleCitizen, User],
    ["officer", t.roleOfficer, ShieldCheck],
    ["admin", t.roleAdmin, Building2],
  ];
  return (
    <header className="ce-topbar ce-glass">
      <button className="ce-brand ce-brand-btn" onClick={onHome}>
        <span className="ce-logo"><Eye size={18} /></span>
        <span className="ce-grad-text ce-brandtext">{t.appName}</span>
      </button>
      <div className="ce-navright">
        <div className="ce-role ce-glass">
          {roles.map(([k, label, Icon]) => (
            <button key={k} className={"ce-role-btn" + (role === k ? " active" : "")} onClick={() => setRole(k)}>
              <Icon size={14} /> <span className="ce-role-label">{label}</span>
            </button>
          ))}
        </div>
        <LangSwitch lang={lang} setLang={setLang} />
        {session && (
          <button className="ce-btn ce-btn-ghost ce-btn-sm ce-logout" onClick={onLogout} title={`${t.signedInAs} ${session.name}`}>
            <LogOut size={15} /> <span className="ce-role-label">{t.logout}</span>
          </button>
        )}
      </div>
    </header>
  );
}

function Tabs({ t, role, tab, setTab }) {
  const tabs = role === "citizen"
    ? [["dashboard", t.tabDashboard, LayoutDashboard], ["report", t.tabReport, Plus], ["safety", t.tabSafety, Shield], ["alerts", t.tabAlerts, BellRing]]
    : [["dashboard", t.tabDashboard, LayoutDashboard], ["analytics", t.tabAnalytics, BarChart3], ["alerts", t.tabAlerts, BellRing]];
  return (
    <div className="ce-tabs">
      {tabs.map(([k, label, Icon]) => (
        <button key={k} className={"ce-tab" + (tab === k ? " active" : "")} onClick={() => setTab(k)}>
          <Icon size={16} /> {label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------- Citizen dashboard ------------------------- */

function CitizenDash({ t, complaints, onReport, highlightId, shield, onSOS, goSafety, goAlerts }) {
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const active = total - resolved;
  const reports = complaints.filter((c) => c.byCitizen).length;
  const score = reports * 10 + resolved * 5;
  const lvl = levelFor(score);
  const lvlName = t.levelName[lvl];
  const nextMin = LEVELS[Math.min(lvl + 1, LEVELS.length - 1)].min;
  const prevMin = LEVELS[lvl].min;
  const pct = lvl >= LEVELS.length - 1 ? 100 : Math.min(100, Math.round(((score - prevMin) / (nextMin - prevMin)) * 100));

  const recent = _.orderBy(complaints, ["timestamp"], ["desc"]).slice(0, 5);

  return (
    <div className="ce-page">
      <div className="ce-page-head">
        <div className="ce-welcome-wrap">
          <h2 className="ce-h2 ce-left">{t.welcome}</h2>
          {shield && (
            <span className="ce-shield-badge" onClick={goSafety} role="button">
              <ShieldCheck size={13} /> {t.shieldOn}
            </span>
          )}
        </div>
        <div className="ce-head-actions">
          <button className="ce-btn ce-btn-ghost ce-sos-shortcut" onClick={onSOS}><Siren size={16} /> {t.sos}</button>
          <button className="ce-btn ce-btn-primary" onClick={onReport}><Plus size={18} /> {t.reportNew}</button>
        </div>
      </div>

      <div className="ce-grid-3">
        <StatCard icon={Activity} label={t.total} value={total} accent="#38bdf8" />
        <StatCard icon={Clock} label={t.active} value={active} accent="#fb923c" />
        <StatCard icon={CheckCircle2} label={t.resolved} value={resolved} accent="#34d399" />
      </div>

      <div className="ce-grid-2col">
        <div className="ce-glass ce-card">
          <div className="ce-card-title"><Activity size={16} /> {t.recentActivity}</div>
          {recent.length === 0 ? (
            <p className="ce-muted">{t.noActivity}</p>
          ) : (
            <div className="ce-activity">
              {recent.map((c) => (
                <div key={c.id} className={"ce-act-row" + (c.id === highlightId ? " ce-flash" : "")}>
                  <Thumb c={c} size={44} />
                  <div className="ce-act-mid">
                    <div className="ce-act-top">
                      <span className="ce-mono">{c.id}</span>
                      <StatusBadge status={c.status} t={t} />
                    </div>
                    <div className="ce-act-type">{t.issue[c.issueType]}</div>
                  </div>
                  <SeverityBadge severity={c.severity} t={t} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ce-glass ce-card ce-engage">
          <div className="ce-card-title"><Award size={16} /> {t.engagement}</div>
          <div className="ce-engage-score ce-grad-text">{score}<span className="ce-pts">{t.points}</span></div>
          <div className="ce-level-badge"><Sparkles size={14} /> {t.level} {lvl + 1} · {lvlName}</div>
          <div className="ce-progress"><div className="ce-progress-fill" style={{ width: pct + "%" }} /></div>
          <div className="ce-engage-meta">
            <span><Plus size={12} /> +10 / report</span>
            <span><CheckCircle2 size={12} /> +5 / resolved</span>
          </div>
        </div>
      </div>

      <div className="ce-grid-2col">
        <DisasterMiniWidget t={t} onOpen={goAlerts} />
        <button className="ce-glass ce-card ce-emergency-shortcut" onClick={goSafety}>
          <div className="ce-card-title"><Shield size={16} /> {t.safetyTitle}</div>
          <p className="ce-muted">{t.shieldHint}</p>
          <div className="ce-mini-link">{t.tabSafety} <ChevronRight size={13} /></div>
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="ce-glass ce-statcard">
      <div className="ce-statcard-icon" style={{ color: accent, background: accent + "1a", boxShadow: `0 0 18px ${accent}33` }}>
        <Icon size={20} />
      </div>
      <div>
        <div className="ce-statcard-v">{fmt(value)}</div>
        <div className="ce-statcard-l">{label}</div>
      </div>
    </div>
  );
}

/* ----------------------------- Report flow ---------------------------- */

function ReportFlow({ t, lang, onSubmit, goDash, complaints }) {
  const [photo, setPhoto] = useState(null);     // dataURL
  const [b64, setB64] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [warn, setWarn] = useState(false);
  const [loc, setLoc] = useState(null);
  const [coordText, setCoordText] = useState("");
  const [done, setDone] = useState(null);
  const fileRef = useRef(null);

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base = String(dataUrl).split(",")[1];
      setPhoto(dataUrl);
      setB64(base);
      setMediaType(file.type || "image/jpeg");
      setResult(null);
      setDone(null);
      analyze(base, file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  const fallback = () => ({
    issueType: "other", severity: "medium", urgencyScore: 50,
    estimatedAffectedPopulation: 1000, department: "Public Works",
    summary: "Civic issue reported by a citizen (offline estimate).", confidence: 0.35,
  });

  const clamp = (r) => {
    const types = Object.keys(ISSUE_ICON);
    const sevs = Object.keys(SEV);
    const depts = ["Road Maintenance", "Sanitation", "Water Board", "Electrical", "Public Works", "Public Safety"];
    return {
      issueType: types.includes(r.issueType) ? r.issueType : "other",
      severity: sevs.includes(r.severity) ? r.severity : "medium",
      urgencyScore: Math.max(0, Math.min(100, Math.round(Number(r.urgencyScore) || 0))),
      estimatedAffectedPopulation: Math.max(0, Math.round(Number(r.estimatedAffectedPopulation) || 0)),
      department: depts.includes(r.department) ? r.department : "Public Works",
      summary: typeof r.summary === "string" ? r.summary : "Civic issue detected.",
      confidence: Math.max(0, Math.min(1, Number(r.confidence) || 0)),
    };
  };

  const analyze = async (base, type) => {
    setLoading(true); setWarn(false);
    try {
      const dataUrl = `data:${type};base64,${base}`;
      const resp = await fetch("/api/groq/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          temperature: 0.2,
          max_tokens: 1000,
          response_format: { type: "json_object" },
          messages: [{
            role: "user",
            content: [
              { type: "text", text: ANALYSIS_INSTRUCTION },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          }],
        }),
      });
      if (!resp.ok) throw new Error("Groq API " + resp.status);
      const data = await resp.json();
      let raw = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
      raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = clamp(JSON.parse(raw));
      setResult(parsed);
    } catch (err) {
      setResult(fallback());
      setWarn(true);
    } finally {
      setLoading(false);
    }
  };

  const onPick = (p) => {
    setLoc(p);
    setCoordText(`${p.lat}, ${p.lng}`);
  };

  const onCoordChange = (v) => {
    setCoordText(v);
    const m = v.split(",").map((s) => Number(s.trim()));
    if (m.length === 2 && !isNaN(m[0]) && !isNaN(m[1])) {
      const mx = Math.max(0, Math.min(100, Math.round(((m[1] - 76.58) / 0.22) * 100)));
      const my = Math.max(0, Math.min(100, Math.round(((12.36 - m[0]) / 0.18) * 100)));
      setLoc({ lat: m[0], lng: m[1], mapX: mx, mapY: my });
    }
  };

  const canSubmit = result && loc && !loading;

  const submit = () => {
    if (!canSubmit) return;
    const id = onSubmit(result, photo, loc);
    setDone(id);
    setTimeout(() => goDash(), 1200);
  };

  const reset = () => { setPhoto(null); setB64(null); setResult(null); setLoc(null); setCoordText(""); setDone(null); };

  return (
    <div className="ce-page">
      <h2 className="ce-h2 ce-left">{t.reportTitle}</h2>

      <div className="ce-grid-2col">
        {/* Left: upload + AI result */}
        <div className="ce-stack">
          <div className="ce-glass ce-card">
            <div className="ce-card-title"><Camera size={16} /> {t.uploadPrompt}</div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
            {!photo ? (
              <button className="ce-upload" onClick={() => fileRef.current && fileRef.current.click()}>
                <Upload size={30} />
                <span className="ce-upload-main">{t.uploadPrompt}</span>
                <span className="ce-muted">{t.uploadHint}</span>
              </button>
            ) : (
              <div className="ce-uploaded">
                <img src={photo} alt="upload" className="ce-uploaded-img" />
                <button className="ce-btn ce-btn-ghost ce-btn-sm" onClick={() => fileRef.current && fileRef.current.click()}>
                  <RefreshCw size={14} /> {t.changePhoto}
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="ce-glass ce-card ce-analyzing">
              <Loader2 className="ce-spin" size={22} />
              <span>{t.analyzing}</span>
            </div>
          )}

          {result && !loading && (
            <div className="ce-glass ce-card ce-result ce-fade-up">
              <div className="ce-card-title"><Brain size={16} /> {t.aiResult}
                <span className="ce-ai-chip"><Sparkles size={11} /> AI</span>
              </div>
              {warn && <div className="ce-warn"><AlertTriangle size={14} /> {t.analyzeFail}</div>}
              {result.confidence < 0.4 && <div className="ce-warn"><AlertTriangle size={14} /> {t.lowConf}</div>}

              <div className="ce-result-head">
                <Thumb c={{ issueType: result.issueType, photo }} size={56} />
                <div>
                  <div className="ce-result-type">{t.issue[result.issueType]}</div>
                  <div className="ce-muted ce-result-sum">{result.summary}</div>
                </div>
              </div>

              <div className="ce-result-grid">
                <ResField label={t.severity} estimate t={t}>
                  <SeverityBadge severity={result.severity} t={t} />
                </ResField>
                <ResField label={t.urgency} estimate t={t}>
                  <span className="ce-result-val">{result.urgencyScore}<span className="ce-muted">/100</span></span>
                </ResField>
                <ResField label={t.affected} estimate t={t}>
                  <span className="ce-result-val">{fmt(result.estimatedAffectedPopulation)}</span>
                </ResField>
                <ResField label={t.department} t={t}>
                  <span className="ce-result-val ce-sm">{t.dept[result.department]}</span>
                </ResField>
                <ResField label={t.confidence} t={t}>
                  <span className="ce-result-val">{Math.round(result.confidence * 100)}%</span>
                </ResField>
              </div>

              <button className="ce-btn ce-btn-ghost ce-btn-sm" onClick={() => analyze(b64, mediaType)}>
                <RefreshCw size={14} /> {t.retry}
              </button>
            </div>
          )}
        </div>

        {/* Right: location + submit */}
        <div className="ce-stack">
          <div className="ce-glass ce-card">
            <div className="ce-card-title"><MapPin size={16} /> {t.locationTitle}</div>
            <p className="ce-muted ce-hint">{t.locationHint}</p>
            <CityMap complaints={complaints} interactive picked={loc} onPick={onPick} t={t} height={240} />
            <label className="ce-field-label">{t.coords}</label>
            <input className="ce-input" value={coordText} placeholder="12.31000, 76.65000"
              onChange={(e) => onCoordChange(e.target.value)} />
          </div>

          <button className={"ce-btn ce-btn-primary ce-btn-lg ce-submit" + (canSubmit ? "" : " ce-disabled")}
            onClick={submit} disabled={!canSubmit}>
            {done ? (<><CheckCircle2 size={18} /> {t.submitDone}</>) : (<><Send size={18} /> {t.submit}</>)}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResField({ label, children, estimate, t }) {
  return (
    <div className="ce-resfield">
      <div className="ce-resfield-label">
        {label}{estimate && <span className="ce-est">{t.aiEstimate}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ------------------------- Authority dashboard ------------------------ */

function AuthorityDash({ t, complaints, advance, highlightId, sosRecords, goAlerts }) {
  const [cat, setCat] = useState("all");
  const [sev, setSev] = useState("all");
  const [stat, setStat] = useState("all");
  const [viewMode, setViewMode] = useState("cards");
  const [atRiskOnly, setAtRiskOnly] = useState(false);
  const [sortMode, setSortMode] = useState("urgency"); // urgency | sla

  // ML MODEL 1 — recalculated from state on every complaint change (<100ms)
  const slaById = useMemo(() => {
    const workloadByDept = _.countBy(
      complaints.filter((c) => c.status === "In Progress"), "department"
    );
    const map = {};
    complaints.forEach((c) => {
      map[c.id] = predictSLABreach(c, workloadByDept[c.department] || 0);
    });
    return map;
  }, [complaints]);

  const atRiskCount = useMemo(
    () => complaints.filter((c) => {
      const s = slaById[c.id];
      return s && !s.resolved && s.riskLevel !== "On Track";
    }).length,
    [complaints, slaById]
  );

  const filtered = useMemo(() => {
    let arr = complaints.filter((c) => {
      const s = slaById[c.id];
      const atRisk = s && !s.resolved && s.riskLevel !== "On Track";
      return (cat === "all" || c.issueType === cat) &&
        (sev === "all" || c.severity === sev) &&
        (stat === "all" || c.status === stat) &&
        (!atRiskOnly || atRisk);
    });
    if (sortMode === "sla") {
      return _.orderBy(arr, [(c) => slaById[c.id]?.breachProbability || 0, "urgencyScore"], ["desc", "desc"]);
    }
    return _.orderBy(arr, ["urgencyScore"], ["desc"]);
  }, [complaints, cat, sev, stat, atRiskOnly, sortMode, slaById]);

  const catOpts = Object.keys(ISSUE_ICON);
  const sevOpts = Object.keys(SEV);

  return (
    <div className="ce-page">
      <div className="ce-page-head">
        <div>
          <h2 className="ce-h2 ce-left">{t.authTitle}</h2>
          <p className="ce-muted ce-sub">{t.authSub}</p>
        </div>
        <div className="ce-viewtoggle ce-glass">
          <button className={"ce-vt-btn" + (viewMode === "cards" ? " active" : "")} onClick={() => setViewMode("cards")}><LayoutGrid size={15} /> {t.cards}</button>
          <button className={"ce-vt-btn" + (viewMode === "table" ? " active" : "")} onClick={() => setViewMode("table")}><Table2 size={15} /> {t.table}</button>
        </div>
      </div>

      {/* ML at-risk summary card */}
      <div className="ce-authority-summary">
        <div className="ce-glass ce-card ce-atrisk">
          <div className="ce-atrisk-icon"><AlertTriangle size={22} /></div>
          <div className="ce-atrisk-body">
            <div className="ce-atrisk-num">{atRiskCount}</div>
            <div className="ce-atrisk-label">{t.atRiskCard}</div>
            <div className="ce-muted ce-atrisk-hint">{t.atRiskHint}</div>
          </div>
          <span className="ce-ml-chip"><Brain size={11} /> {t.mlEstimate}</span>
        </div>

        <div className="ce-glass ce-card ce-atrisk ce-sos-summary" onClick={goAlerts} role="button">
          <div className="ce-atrisk-icon" style={{ background: "#f43f5e1a", color: "#f43f5e" }}><Siren size={22} /></div>
          <div className="ce-atrisk-body">
            <div className="ce-atrisk-num">{sosRecords ? sosRecords.length : 0}</div>
            <div className="ce-atrisk-label">{t.activeSos}</div>
            <div className="ce-muted ce-atrisk-hint">{t.disasterSub}</div>
          </div>
          <ChevronRight size={18} style={{ opacity: 0.5 }} />
        </div>
      </div>

      <div className="ce-filters ce-glass">
        <span className="ce-filters-label"><Filter size={14} /> {t.filters}</span>
        <Select value={cat} onChange={setCat} label={t.fCat} all={t.all}
          options={catOpts.map((k) => [k, t.issue[k]])} />
        <Select value={sev} onChange={setSev} label={t.fSev} all={t.all}
          options={sevOpts.map((k) => [k, t.sev[k]])} />
        <Select value={stat} onChange={setStat} label={t.fStat} all={t.all}
          options={STATUS_ORDER.map((k) => [k, t.status[k]])} />
        <label className="ce-select-wrap">
          <span className="ce-select-label">{t.sortBy}</span>
          <select className="ce-select" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
            <option value="urgency">{t.sortUrg}</option>
            <option value="sla">{t.sortSla}</option>
          </select>
        </label>
        <button className={"ce-toggle" + (atRiskOnly ? " active" : "")} onClick={() => setAtRiskOnly((v) => !v)}>
          <AlertTriangle size={13} /> {t.atRiskFilter}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="ce-glass ce-card ce-empty">{t.noMatch}</div>
      ) : viewMode === "cards" ? (
        <div className="ce-grid-cards">
          {filtered.map((c) => (
            <ComplaintCard key={c.id} c={c} t={t} advance={advance} highlight={c.id === highlightId} sla={slaById[c.id]} />
          ))}
        </div>
      ) : (
        <div className="ce-glass ce-card ce-tablewrap">
          <table className="ce-table">
            <thead>
              <tr>
                <th>{t.colId}</th><th></th><th>{t.colType}</th><th>{t.colUrg}</th>
                <th>{t.fSev}</th><th>{t.slaStatus}</th><th>{t.colDept}</th><th>{t.colStatus}</th><th>{t.colAction}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const sla = slaById[c.id];
                const rowColor = sla && !sla.resolved ? (RISK_META[sla.riskLevel]?.color) : null;
                return (
                  <tr key={c.id} className={c.id === highlightId ? "ce-flash" : ""}
                    style={rowColor && sla.riskLevel !== "On Track" ? { boxShadow: `inset 3px 0 0 ${rowColor}` } : undefined}>
                    <td className="ce-mono">{c.id}</td>
                    <td><Thumb c={c} size={36} /></td>
                    <td>{t.issue[c.issueType]}</td>
                    <td><b style={{ color: SEV[c.severity].color }}>{c.urgencyScore}</b></td>
                    <td><SeverityBadge severity={c.severity} t={t} /></td>
                    <td><SlaBadge sla={sla} t={t} /></td>
                    <td className="ce-nowrap">{t.dept[c.department]}</td>
                    <td><StatusBadge status={c.status} t={t} /></td>
                    <td>
                      <button className="ce-btn ce-btn-ghost ce-btn-xs" disabled={c.status === "Resolved"}
                        onClick={() => advance(c.id)}>
                        {c.status === "Resolved" ? <CheckCircle2 size={13} /> : <>{t.advance} <ChevronRight size={13} /></>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Select({ value, onChange, label, all, options }) {
  return (
    <label className="ce-select-wrap">
      <span className="ce-select-label">{label}</span>
      <select className="ce-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">{all}</option>
        {options.map(([k, lbl]) => <option key={k} value={k}>{lbl}</option>)}
      </select>
    </label>
  );
}

function ComplaintCard({ c, t, advance, highlight, sla }) {
  const meta = SEV[c.severity];
  return (
    <div className={"ce-glass ce-complaint" + (highlight ? " ce-flash" : "")} style={{ borderLeft: `3px solid ${meta.color}` }}>
      <div className="ce-complaint-head">
        <Thumb c={c} size={52} />
        <div className="ce-complaint-meta">
          <div className="ce-complaint-top">
            <span className="ce-mono">{c.id}</span>
            <SeverityBadge severity={c.severity} t={t} />
          </div>
          <div className="ce-complaint-type">{t.issue[c.issueType]}</div>
          <div className="ce-complaint-dept"><Building2 size={12} /> {t.dept[c.department]}</div>
        </div>
        <div className="ce-urg" title="Urgency">
          <Gauge size={13} style={{ color: meta.color }} />
          <span style={{ color: meta.color }}>{c.urgencyScore}</span>
        </div>
      </div>
      <p className="ce-complaint-sum">{c.summary}</p>
      {sla && (
        <div className="ce-complaint-sla">
          <SlaBadge sla={sla} t={t} />
          <span className="ce-ml-chip ce-ml-chip-sm"><Brain size={10} /> {t.mlEstimate}</span>
        </div>
      )}
      <div className="ce-complaint-foot">
        <StatusBadge status={c.status} t={t} />
        <button className="ce-btn ce-btn-primary ce-btn-xs" disabled={c.status === "Resolved"} onClick={() => advance(c.id)}>
          {c.status === "Resolved" ? <><CheckCircle2 size={13} /> {t.status.Resolved}</> : <>{t.advance} <ChevronRight size={13} /></>}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Analytics ----------------------------- */

const CHART_COLORS = ["#38bdf8", "#a855f7", "#22d3ee", "#f472b6", "#34d399", "#fbbf24"];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#e2e8f0" }}>
      {label && <div style={{ marginBottom: 4, opacity: 0.7 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill }}>{p.name}: <b>{p.value}</b></div>
      ))}
    </div>
  );
}

function Analytics({ t, complaints }) {
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);

  // ML MODEL 2 — K-Means hotspots, recalculated from state
  const hotspots = useMemo(() => predictHotspots(complaints), [complaints]);
  const zoneMembers = useMemo(() => {
    if (!selectedZone) return null;
    const z = hotspots.find((h) => h.id === selectedZone);
    if (!z) return null;
    return complaints.filter((c) => z.memberIds.includes(c.id));
  }, [selectedZone, hotspots, complaints]);

  const sevData = useMemo(() => {
    const g = _.countBy(complaints, "severity");
    return Object.keys(SEV).map((k) => ({ name: t.sev[k], value: g[k] || 0, color: SEV[k].color })).filter((d) => d.value > 0);
  }, [complaints, t]);

  const catData = useMemo(() => {
    const g = _.countBy(complaints, "issueType");
    return Object.keys(g).map((k) => ({ name: t.issue[k], value: g[k] }));
  }, [complaints, t]);

  const trendData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, name: d.toLocaleString("en", { month: "short" }), value: 0 });
    }
    complaints.forEach((c) => {
      const d = new Date(c.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find((x) => x.key === key);
      if (m) m.value += 1;
    });
    return months;
  }, [complaints]);

  const deptData = useMemo(() => {
    const byDept = _.groupBy(complaints, "department");
    return Object.keys(byDept).map((d) => ({
      name: d.replace(" Maintenance", "").replace("Public ", ""),
      [t.reported]: byDept[d].length,
      [t.resolvedBar]: byDept[d].filter((c) => c.status === "Resolved").length,
    }));
  }, [complaints, t]);

  const active = complaints.filter((c) => c.status !== "Resolved");

  return (
    <div className="ce-page">
      <h2 className="ce-h2 ce-left">{t.analyticsTitle}</h2>

      {/* ML MODEL 2 — Predicted Risk Zones */}
      <div className="ce-glass ce-card">
        <div className="ce-card-title"><Brain size={16} /> {t.riskZonesTitle}
          <span className="ce-ml-chip"><Sparkles size={11} /> {t.mlEstimate}</span>
        </div>
        <p className="ce-muted ce-hint">{t.riskZonesHint}</p>

        {hotspots.length > 0 && (
          <div className="ce-topzones">
            <span className="ce-topzones-label"><TrendingUp size={13} /> {t.topZones}:</span>
            {hotspots.slice(0, 3).map((z, i) => {
              const m = SEV[z.avgSeverity];
              return (
                <button key={z.id} className={"ce-zonepill" + (selectedZone === z.id ? " active" : "")}
                  style={{ borderColor: m.color + "66", color: m.color }}
                  onClick={() => setSelectedZone(selectedZone === z.id ? null : z.id)}>
                  <span className="ce-dot" style={{ background: m.color, boxShadow: `0 0 8px ${m.glow}` }} />
                  #{i + 1} · {Math.round(z.forecastRisk * 100)}%
                </button>
              );
            })}
          </div>
        )}

        <button className={"ce-toggle ce-toggle-inline" + (showHotspots ? " active" : "")} onClick={() => setShowHotspots((v) => !v)}>
          <MapPin size={13} /> {t.showHotspots}
        </button>

        <CityMap complaints={complaints} t={t} height={340}
          hotspots={showHotspots ? hotspots : null}
          selectedZone={selectedZone} onSelectZone={setSelectedZone} />

        {zoneMembers && (
          <div className="ce-zonedrill">
            <div className="ce-zonedrill-title">{t.zoneMembers} ({zoneMembers.length})</div>
            {zoneMembers.map((c) => (
              <div key={c.id} className="ce-zonedrill-row">
                <Thumb c={c} size={34} />
                <span className="ce-mono">{c.id}</span>
                <span className="ce-zonedrill-type">{t.issue[c.issueType]}</span>
                <SeverityBadge severity={c.severity} t={t} />
              </div>
            ))}
          </div>
        )}
        {!selectedZone && <p className="ce-muted ce-hint" style={{ marginTop: 10, marginBottom: 0 }}>{t.noZone}</p>}
      </div>

      <div className="ce-glass ce-card">
        <div className="ce-card-title"><MapPin size={16} /> {t.cityMapTitle}</div>
        <p className="ce-muted ce-hint">{t.cityMapHint}</p>
        <CityMap complaints={complaints} t={t} height={320} />
        <div className="ce-maplegend">
          {Object.keys(SEV).map((k) => (
            <span key={k} className="ce-legend-item">
              <span className="ce-dot" style={{ background: SEV[k].color, boxShadow: `0 0 8px ${SEV[k].glow}` }} />
              {t.sev[k]}
            </span>
          ))}
        </div>
      </div>

      <div className="ce-grid-2col">
        <div className="ce-glass ce-card">
          <div className="ce-card-title"><Sparkles size={16} /> {t.severityDist}</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={sevData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} stroke="none">
                {sevData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="ce-glass ce-card">
          <div className="ce-card-title"><BarChart3 size={16} /> {t.byCategory}</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={catData} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="value" name={t.fCat} radius={[6, 6, 0, 0]}>
                {catData.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="ce-glass ce-card">
          <div className="ce-card-title"><TrendingUp size={16} /> {t.monthlyTrend}</div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData} margin={{ top: 6, right: 12, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="trendfill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" name={t.total} stroke="#38bdf8" strokeWidth={2} fill="url(#trendfill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="ce-glass ce-card">
          <div className="ce-card-title"><Building2 size={16} /> {t.deptPerf}</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptData} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#cbd5e1" }} />
              <Bar dataKey={t.reported} fill="#38bdf8" radius={[5, 5, 0, 0]} />
              <Bar dataKey={t.resolvedBar} fill="#34d399" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ============================ NEW MODULES ============================ */
/* Phase 2 (DEFERRED, not built): AI Safe Route, Night Safety auto-assistant,
   Community Guardian network, Safe Shelter detail, Emergency Broadcast,
   audio recording, analytics-dashboard emergency widgets. */

/* ------------------------------ Login -------------------------------- */

function LoginPage({ t, lang, setLang, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [error, setError] = useState(false);

  const submit = () => {
    const u = DEMO_USERS[role];
    if (u && email.trim().toLowerCase() === u.email && password === u.password) {
      setError(false);
      onLogin({ role: u.role, name: u.name, email: u.email, ts: Date.now() });
    } else {
      setError(true);
    }
  };

  const fill = (r) => {
    setRole(r); setEmail(DEMO_USERS[r].email); setPassword(DEMO_USERS[r].password); setError(false);
  };

  const roles = [["citizen", t.roleCitizen, User], ["officer", t.roleOfficer, ShieldCheck], ["admin", t.roleAdmin, Building2]];

  return (
    <div className="ce-login">
      <div className="ce-bgmesh" />
      <div className="ce-login-top"><LangSwitch lang={lang} setLang={setLang} /></div>
      <div className="ce-glass ce-login-card ce-fade-up">
        <div className="ce-brand ce-login-brand">
          <span className="ce-logo"><Eye size={20} /></span>
          <span className="ce-grad-text ce-brandtext">{t.appName}</span>
        </div>
        <h2 className="ce-login-title">{t.loginTitle}</h2>
        <p className="ce-muted ce-login-sub">{t.loginSub}</p>

        <label className="ce-field-label">{t.email}</label>
        <input className="ce-input" type="email" value={email} autoComplete="username"
          placeholder="you@civiceye.app" onChange={(e) => { setEmail(e.target.value); setError(false); }} />

        <label className="ce-field-label">{t.password}</label>
        <input className="ce-input" type="password" value={password} autoComplete="current-password"
          placeholder="••••••••" onChange={(e) => { setPassword(e.target.value); setError(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />

        <label className="ce-field-label">{t.roleLabel}</label>
        <div className="ce-role ce-glass ce-login-roles">
          {roles.map(([k, label, Icon]) => (
            <button key={k} type="button" className={"ce-role-btn" + (role === k ? " active" : "")} onClick={() => setRole(k)}>
              <Icon size={14} /> <span>{label}</span>
            </button>
          ))}
        </div>

        {error && <div className="ce-warn"><AlertTriangle size={14} /> {t.invalidCreds}</div>}

        <button className="ce-btn ce-btn-primary ce-btn-lg ce-login-btn" onClick={submit}>
          <Lock size={16} /> {t.login}
        </button>

        <div className="ce-democreds">
          <div className="ce-democreds-label">{t.demoCreds}</div>
          {roles.map(([k, label]) => (
            <button key={k} className="ce-democred-row" onClick={() => fill(k)}>
              <span className="ce-mono">{DEMO_USERS[k].email}</span>
              <span className="ce-democred-pw">{DEMO_USERS[k].password}</span>
              <span className="ce-democred-role">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Emergency Hub --------------------------- */

function nowStamp() { return new Date().toLocaleString(); }

function EmergencyHub({ t, onSOS, sosCount }) {
  const [open, setOpen] = useState(false);
  const items = [
    { key: "ambulance", Icon: Cross, label: t.ambulance, color: "#34d399", tel: "108" },
    { key: "police", Icon: Shield, label: t.police, color: "#60a5fa", tel: "100" },
    { key: "fire", Icon: Flame, label: t.fire, color: "#fb923c", tel: "101" },
  ];
  return (
    <div className="ce-ehub">
      {open && (
        <div className="ce-ehub-menu ce-fade-up">
          {items.map((it) => (
            <a key={it.key} href={`tel:${it.tel}`} className="ce-ehub-item ce-glass" style={{ borderColor: it.color + "55" }}>
              <span className="ce-ehub-ic" style={{ background: it.color + "22", color: it.color }}><it.Icon size={18} /></span>
              <span className="ce-ehub-label">{it.label}</span>
              <span className="ce-ehub-tel">{it.tel}</span>
            </a>
          ))}
          <button className="ce-ehub-item ce-ehub-sos" onClick={() => { setOpen(false); onSOS(); }}>
            <span className="ce-ehub-ic" style={{ background: "#ffffff22", color: "#fff" }}><Siren size={18} /></span>
            <span className="ce-ehub-label">{t.sos}</span>
          </button>
        </div>
      )}
      <button className={"ce-ehub-fab" + (open ? " open" : "")} onClick={() => setOpen((v) => !v)} aria-label={t.emergencyHub}>
        {open ? <X size={24} /> : <Siren size={24} />}
        {!open && sosCount > 0 && <span className="ce-ehub-badge">{sosCount}</span>}
      </button>
    </div>
  );
}

/* ----------------------------- SOS Panel ----------------------------- */

function SOSPanel({ t, onClose, onSaved }) {
  const [phase, setPhase] = useState("locating"); // locating | active | error
  const [coords, setCoords] = useState(null);
  const [stamp] = useState(nowStamp());

  useEffect(() => {
    let done = false;
    const finish = (c, err) => {
      if (done) return; done = true;
      setCoords(c); setPhase(err ? "error" : "active");
      const record = { id: "SOS-" + Date.now(), lat: c.lat, lng: c.lng, accuracy: c.accuracy || null, time: stamp, approx: !!err };
      const prev = safeGet(LS.emergency) || [];
      const next = [record, ...prev];
      safeSet(LS.emergency, next);
      onSaved && onSaved(next);
    };
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => finish({ lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5), accuracy: Math.round(pos.coords.accuracy) }, false),
        () => finish({ lat: 12.2958, lng: 76.6394 }, true),
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      finish({ lat: 12.2958, lng: 76.6394 }, true);
    }
  }, []); // eslint-disable-line

  return (
    <div className="ce-modal-overlay" onClick={onClose}>
      <div className="ce-glass ce-sos-card ce-fade-up" onClick={(e) => e.stopPropagation()}>
        <button className="ce-modal-x" onClick={onClose}><X size={18} /></button>
        <div className="ce-sos-emoji">🚨</div>
        <div className="ce-sos-title">{t.sosActive}</div>

        {phase === "locating" && (
          <div className="ce-analyzing" style={{ justifyContent: "center", marginTop: 12 }}>
            <Loader2 className="ce-spin" size={20} /> <span>{t.locating}</span>
          </div>
        )}

        {phase === "error" && <div className="ce-warn" style={{ marginTop: 12 }}><AlertTriangle size={14} /> {t.locFail}</div>}

        {(phase === "active" || phase === "error") && coords && (
          <>
            <div className="ce-sos-loc">
              <MapPinned size={16} />
              <div>
                <div className="ce-sos-loc-label">{t.liveLocation}</div>
                <div className="ce-mono ce-sos-coords">{coords.lat}, {coords.lng}{coords.accuracy ? ` (±${coords.accuracy}m)` : ""}</div>
              </div>
            </div>
            <div className="ce-sos-time"><Clock size={13} /> {t.time}: {stamp}</div>
            <div className="ce-sos-pulse"><span className="ce-dot" style={{ background: "#f43f5e", boxShadow: "0 0 10px rgba(244,63,94,0.8)" }} /> {t.sosLogged}</div>
            <div className="ce-sos-actions">
              <a className="ce-btn ce-btn-primary" href="tel:112"><PhoneCall size={16} /> 112</a>
              <a className="ce-btn ce-btn-ghost" href="tel:108"><Cross size={16} /> 108</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------- Emergency Resource Locator ------------------- */

function ResourceLocator({ t, complaints }) {
  const [kind, setKind] = useState("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [sel, setSel] = useState(null);

  const list = useMemo(() => {
    let arr = EMERGENCY_RESOURCES.filter((r) =>
      (kind === "all" || r.kind === kind) && (!openOnly || r.openNow)
    );
    return _.orderBy(arr, ["distanceKm"], ["asc"]);
  }, [kind, openOnly]);

  const kinds = [["all", t.allKinds], ["hospital", t.rkind.hospital], ["police", t.rkind.police], ["fire", t.rkind.fire]];

  return (
    <div className="ce-glass ce-card">
      <div className="ce-card-title"><Navigation size={16} /> {t.resourcesTitle}</div>
      <p className="ce-muted ce-hint">{t.resourcesHint}</p>

      <div className="ce-res-filters">
        <div className="ce-res-kinds">
          {kinds.map(([k, lbl]) => (
            <button key={k} className={"ce-chip" + (kind === k ? " active" : "")} onClick={() => setKind(k)}>{lbl}</button>
          ))}
        </div>
        <button className={"ce-toggle" + (openOnly ? " active" : "")} onClick={() => setOpenOnly((v) => !v)}>
          <Clock size={13} /> {t.openOnly}
        </button>
      </div>

      <CityMap complaints={[]} t={t} height={260} resources={list} selectedResource={sel} onSelectResource={setSel} />

      {list.length === 0 ? (
        <p className="ce-muted ce-hint" style={{ marginTop: 12, marginBottom: 0 }}>{t.noResources}</p>
      ) : (
        <div className="ce-res-list">
          {list.map((r) => {
            const meta = RESOURCE_META[r.kind];
            return (
              <div key={r.id} className={"ce-res-row" + (sel === r.id ? " active" : "")} onClick={() => setSel(sel === r.id ? null : r.id)}>
                <span className="ce-res-ic" style={{ background: meta.color + "22", color: meta.color }}><meta.Icon size={16} /></span>
                <div className="ce-res-mid">
                  <div className="ce-res-name">{r.name}</div>
                  <div className="ce-res-meta">
                    <span>{r.distanceKm} {t.km}</span>
                    {r.openNow
                      ? <span className="ce-res-open">● {t.openNow}</span>
                      : <span className="ce-res-closed">● {t.shieldOff}</span>}
                  </div>
                </div>
                <a className="ce-btn ce-btn-ghost ce-btn-xs" href={`tel:${r.phone}`} onClick={(e) => e.stopPropagation()}>
                  <Phone size={13} /> {t.callNow}
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------- Women Safety Mode ------------------------- */

function FakeCallOverlay({ t, onClose }) {
  return (
    <div className="ce-fakecall">
      <div className="ce-fakecall-inner ce-fade-up">
        <div className="ce-fakecall-avatar"><User size={42} /></div>
        <div className="ce-fakecall-name">Mom</div>
        <div className="ce-fakecall-status">{t.incoming}</div>
        <div className="ce-fakecall-actions">
          <button className="ce-fakecall-btn decline" onClick={onClose}><Phone size={24} /></button>
          <button className="ce-fakecall-btn accept" onClick={onClose}><Phone size={24} /></button>
        </div>
      </div>
    </div>
  );
}

function WomenSafetyMode({ t, shield, setShield, onSOS }) {
  const [fakeCall, setFakeCall] = useState(false);
  const [sharing, setSharing] = useState(false);

  return (
    <div className="ce-page">
      <h2 className="ce-h2 ce-left">{t.safetyTitle}</h2>

      <div className="ce-glass ce-card ce-safety-hero">
        <div className={"ce-shield-ring" + (shield ? " on" : "")}>
          <Shield size={40} />
        </div>
        <div className="ce-safety-body">
          <div className="ce-safety-state">{shield ? t.shieldOn : t.shieldOff}</div>
          <p className="ce-muted">{t.shieldHint}</p>
          <button className={"ce-btn " + (shield ? "ce-btn-primary" : "ce-btn-ghost")} onClick={() => setShield(!shield)}>
            <ShieldCheck size={16} /> {shield ? t.shieldOn : t.shield}
          </button>
        </div>
      </div>

      <div className="ce-grid-3">
        <button className="ce-glass ce-safety-action" onClick={onSOS}>
          <span className="ce-safety-ic" style={{ background: "#f43f5e22", color: "#f43f5e" }}><Siren size={22} /></span>
          <span className="ce-safety-label">{t.sosActivate}</span>
        </button>
        <button className="ce-glass ce-safety-action" onClick={() => setFakeCall(true)}>
          <span className="ce-safety-ic" style={{ background: "#a855f722", color: "#c084fc" }}><PhoneIncoming size={22} /></span>
          <span className="ce-safety-label">{t.fakeCall}</span>
        </button>
        <button className={"ce-glass ce-safety-action" + (sharing ? " active" : "")} onClick={() => setSharing((v) => !v)}>
          <span className="ce-safety-ic" style={{ background: "#38bdf822", color: "#38bdf8" }}><MapPinned size={22} /></span>
          <span className="ce-safety-label">{sharing ? t.stopShare : t.shareLoc}</span>
        </button>
      </div>

      {sharing && (
        <div className="ce-glass ce-card ce-share-banner">
          <span className="ce-dot" style={{ background: "#38bdf8", boxShadow: "0 0 10px rgba(56,189,248,0.8)" }} />
          {t.sharing}
        </div>
      )}

      {fakeCall && <FakeCallOverlay t={t} onClose={() => setFakeCall(false)} />}
    </div>
  );
}

/* ----------------------- Disaster Alert Dashboard -------------------- */

function DisasterDashboard({ t, sosRecords }) {
  const risks = useMemo(() => predictDisasterRisk(DISASTER_RISK_ZONES), []);

  return (
    <div className="ce-page">
      <div className="ce-page-head">
        <div>
          <h2 className="ce-h2 ce-left">{t.disasterTitle}</h2>
          <p className="ce-muted ce-sub">{t.disasterSub}</p>
        </div>
      </div>

      {sosRecords && sosRecords.length > 0 && (
        <div className="ce-glass ce-card ce-atrisk" style={{ marginBottom: 16 }}>
          <div className="ce-atrisk-icon" style={{ background: "#f43f5e1a", color: "#f43f5e" }}><Siren size={22} /></div>
          <div className="ce-atrisk-body">
            <div className="ce-atrisk-num">{sosRecords.length}</div>
            <div className="ce-atrisk-label">{t.activeSos}</div>
          </div>
        </div>
      )}

      <div className="ce-grid-2col">
        {SEED_DISASTERS.map((d) => {
          const lvl = DISASTER_LEVELS[d.level];
          const Icon = DISASTER_ICON[d.hazard] || AlertTriangle;
          return (
            <div key={d.id} className="ce-glass ce-card ce-disaster" style={{ borderLeft: `3px solid ${lvl.color}` }}>
              <div className="ce-disaster-head">
                <span className="ce-disaster-ic" style={{ background: lvl.color + "1a", color: lvl.color }}><Icon size={22} /></span>
                <div>
                  <div className="ce-disaster-haz">{t.hazard[d.hazard]}</div>
                  <div className="ce-muted ce-disaster-area"><MapPin size={12} /> {d.area}</div>
                </div>
                <span className="ce-badge ce-disaster-level" style={{ color: lvl.color, borderColor: lvl.color + "55", background: lvl.color + "1a" }}>
                  <span className="ce-dot" style={{ background: lvl.color }} /> {t.dlevel[d.level]}
                </span>
              </div>
              {d.affected > 0 && <div className="ce-disaster-pop"><Users size={13} /> {t.affectedPop}: {fmt(d.affected)}</div>}
              <div className="ce-disaster-actions-label">{t.recActions}</div>
              <ul className="ce-disaster-actions">
                {d.actions.map((a, i) => <li key={i}><ChevronRight size={12} /> {a}</li>)}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="ce-glass ce-card" style={{ marginTop: 16 }}>
        <div className="ce-card-title"><Brain size={16} /> {t.riskPredTitle}
          <span className="ce-ml-chip"><Sparkles size={11} /> {t.mlEstimate}</span>
        </div>
        <div className="ce-disclaimer"><ShieldAlert size={14} /> {t.aiDisclaimer}</div>
        <div className="ce-grid-cards">
          {risks.map((r, i) => {
            const lvl = r.riskLevel === "Critical" ? "#f43f5e" : r.riskLevel === "High" ? "#fb923c" : r.riskLevel === "Moderate" ? "#fbbf24" : "#34d399";
            return (
              <div key={i} className="ce-glass ce-risk-card">
                <div className="ce-risk-top">
                  <span className="ce-risk-area">{r.area}</span>
                  <span className="ce-badge" style={{ color: lvl, borderColor: lvl + "55", background: lvl + "1a" }}>{t.rlevel[r.riskLevel]}</span>
                </div>
                <div className="ce-risk-haz ce-muted">{t.hazard[r.hazard]}</div>
                <div className="ce-risk-bar"><div className="ce-risk-fill" style={{ width: r.riskPercentage + "%", background: lvl }} /></div>
                <div className="ce-risk-pct" style={{ color: lvl }}>{r.riskPercentage}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --------------------- Small dashboard widgets ----------------------- */

function DisasterMiniWidget({ t, onOpen }) {
  const top = useMemo(() => _.orderBy(SEED_DISASTERS, [(d) => DISASTER_LEVELS[d.level].rank], ["desc"])[0], []);
  const lvl = DISASTER_LEVELS[top.level];
  const Icon = DISASTER_ICON[top.hazard] || AlertTriangle;
  return (
    <div className="ce-glass ce-card ce-mini-disaster" onClick={onOpen} role="button">
      <div className="ce-card-title"><BellRing size={16} /> {t.disasterTitle}</div>
      <div className="ce-mini-disaster-row">
        <span className="ce-disaster-ic" style={{ background: lvl.color + "1a", color: lvl.color }}><Icon size={20} /></span>
        <div className="ce-mini-disaster-mid">
          <div className="ce-mini-disaster-haz">{t.hazard[top.hazard]}</div>
          <div className="ce-muted ce-mini-disaster-area">{top.area}</div>
        </div>
        <span className="ce-badge" style={{ color: lvl.color, borderColor: lvl.color + "55", background: lvl.color + "1a" }}>{t.dlevel[top.level]}</span>
      </div>
      <div className="ce-mini-link">{t.tabAlerts} <ChevronRight size={13} /></div>
    </div>
  );
}

/* -------------------------------- CSS --------------------------------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

.ce-root{
  --bg:#070b16; --panel:rgba(255,255,255,0.04); --border:rgba(255,255,255,0.09);
  --text:#e8edf7; --muted:#8b99b3; --blue:#38bdf8; --purple:#a855f7;
  font-family:'Outfit',system-ui,sans-serif; color:var(--text);
  background:var(--bg); min-height:100%; width:100%;
  -webkit-font-smoothing:antialiased; position:relative; overflow-x:hidden;
}
.ce-root *{box-sizing:border-box;}
h1,h2,h3,.ce-brandtext,.ce-mono{font-family:'Chakra Petch','Outfit',sans-serif;}

.ce-grad-text{
  background:linear-gradient(120deg,#7dd3fc 0%,#a855f7 55%,#f0abfc 100%);
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
}
.ce-glass{
  background:var(--panel); border:1px solid var(--border);
  backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
  border-radius:18px; box-shadow:0 8px 30px rgba(0,0,0,0.35);
}
.ce-muted{color:var(--muted); font-size:13px; line-height:1.5;}
.ce-mono{font-size:12px; letter-spacing:0.5px; color:#a5b4fc;}

/* buttons */
.ce-btn{display:inline-flex; align-items:center; gap:8px; border:none; cursor:pointer;
  font-family:'Outfit',sans-serif; font-weight:600; font-size:14px; border-radius:12px;
  padding:11px 18px; transition:transform .18s ease, box-shadow .18s ease, opacity .18s; color:#fff; text-decoration:none;}
.ce-btn:active{transform:translateY(1px) scale(.99);}
.ce-btn-primary{background:linear-gradient(120deg,#2563eb,#7c3aed); box-shadow:0 6px 22px rgba(124,58,237,.45);}
.ce-btn-primary:hover{transform:translateY(-2px); box-shadow:0 10px 30px rgba(124,58,237,.6);}
.ce-btn-ghost{background:rgba(255,255,255,0.05); border:1px solid var(--border); color:var(--text);}
.ce-btn-ghost:hover{background:rgba(255,255,255,0.1);}
.ce-btn-sm{padding:8px 14px; font-size:13px; border-radius:10px;}
.ce-btn-xs{padding:6px 10px; font-size:12px; border-radius:9px; gap:4px;}
.ce-btn-lg{padding:14px 24px; font-size:15px;}
.ce-btn:disabled,.ce-disabled{opacity:.45; cursor:not-allowed; box-shadow:none; transform:none;}

/* badges */
.ce-badge{display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:600;
  padding:4px 10px; border-radius:999px; border:1px solid; white-space:nowrap;}
.ce-dot{width:7px; height:7px; border-radius:50%; display:inline-block;}

/* landing */
.ce-landing{position:relative; z-index:1; padding:0 20px 40px;}
.ce-bgmesh{position:fixed; inset:0; z-index:0; pointer-events:none;
  background:
    radial-gradient(700px circle at 15% 5%, rgba(56,189,248,0.18), transparent 55%),
    radial-gradient(800px circle at 85% 15%, rgba(168,85,247,0.20), transparent 55%),
    radial-gradient(700px circle at 50% 90%, rgba(56,189,248,0.10), transparent 60%);
}
.ce-nav,.ce-hero,.ce-section{position:relative; z-index:1; max-width:1140px; margin:0 auto;}
.ce-nav{display:flex; align-items:center; justify-content:space-between; padding:20px 0; flex-wrap:wrap; gap:12px;}
.ce-brand{display:flex; align-items:center; gap:10px;}
.ce-brand-btn{background:none; border:none; cursor:pointer; padding:0;}
.ce-logo{width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(120deg,#2563eb,#7c3aed); color:#fff; box-shadow:0 0 18px rgba(124,58,237,.5);}
.ce-brandtext{font-size:19px; font-weight:700; letter-spacing:.5px;}
.ce-navright{display:flex; align-items:center; gap:12px; flex-wrap:wrap;}

.ce-hero{text-align:center; padding:46px 0 30px;}
.ce-eyebrow{display:inline-flex; align-items:center; gap:7px; font-size:13px; font-weight:600; color:#7dd3fc;
  padding:7px 14px; border-radius:999px; border:1px solid rgba(56,189,248,.3); background:rgba(56,189,248,.08); margin-bottom:22px;}
.ce-hero h1{font-size:60px; line-height:1.04; margin:0 0 18px; font-weight:700; letter-spacing:-1px;}
.ce-hero-sub{max-width:640px; margin:0 auto 28px; color:#aebbd4; font-size:17px; line-height:1.6;}
.ce-hero-cta{display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-bottom:46px;}

.ce-stats{display:grid; grid-template-columns:repeat(4,1fr); gap:14px; max-width:820px; margin:0 auto;}
.ce-stat-pill{padding:20px 14px; text-align:center;}
.ce-stat-v{font-size:30px; font-weight:700; font-family:'Chakra Petch',sans-serif;}
.ce-stat-l{font-size:12.5px; color:var(--muted); margin-top:4px;}

.ce-section{padding:46px 0;}
.ce-h2{font-size:32px; text-align:center; margin:0 0 30px; font-weight:700; letter-spacing:-.5px;}
.ce-h2.ce-left{text-align:left; font-size:26px; margin-bottom:6px;}
.ce-grid-4{display:grid; grid-template-columns:repeat(4,1fr); gap:16px;}
.ce-grid-3{display:grid; grid-template-columns:repeat(3,1fr); gap:16px; position:relative;}
.ce-feature,.ce-step{padding:24px 22px;}
.ce-feature h3,.ce-step h3{font-size:17px; margin:14px 0 8px; font-weight:600;}
.ce-feature p,.ce-step p{color:var(--muted); font-size:13.5px; line-height:1.55; margin:0;}
.ce-feat-icon{width:46px; height:46px; border-radius:13px; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(120deg,rgba(56,189,248,.18),rgba(168,85,247,.22)); color:#bae6fd; border:1px solid rgba(255,255,255,.08);}
.ce-step{position:relative;}
.ce-step-num{position:absolute; top:18px; right:20px; font-size:34px; font-weight:700; color:rgba(255,255,255,.07); font-family:'Chakra Petch';}
.ce-step-arrow{position:absolute; right:-19px; top:50%; transform:translateY(-50%); color:rgba(168,85,247,.6); z-index:2;}
.ce-cta-final{text-align:center; margin-top:34px;}
.ce-footer{text-align:center; color:var(--muted); font-size:12.5px; padding:34px 0 6px; position:relative; z-index:1;}

/* lang + role switch */
.ce-lang{display:inline-flex; align-items:center; gap:2px; padding:4px 8px; border-radius:11px;}
.ce-lang-btn{background:none; border:none; color:var(--muted); cursor:pointer; font-size:13px; font-weight:600;
  padding:5px 9px; border-radius:8px; transition:.15s; font-family:'Outfit';}
.ce-lang-btn.active{background:linear-gradient(120deg,#2563eb,#7c3aed); color:#fff;}
.ce-lang-btn:hover:not(.active){color:var(--text);}

/* app shell */
.ce-app{position:relative; z-index:1; min-height:100vh;}
.ce-app::before{content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
  background:radial-gradient(800px circle at 80% -5%, rgba(168,85,247,.14), transparent 55%),
            radial-gradient(700px circle at 5% 100%, rgba(56,189,248,.12), transparent 55%);}
.ce-topbar{position:relative; z-index:2; display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px; margin:14px; border-radius:16px; flex-wrap:wrap; gap:12px;}
.ce-role{display:inline-flex; gap:3px; padding:4px; border-radius:12px;}
.ce-role-btn{background:none; border:none; color:var(--muted); cursor:pointer; font-size:13px; font-weight:600;
  padding:7px 13px; border-radius:9px; display:inline-flex; align-items:center; gap:6px; transition:.15s; font-family:'Outfit';}
.ce-role-btn.active{background:linear-gradient(120deg,#2563eb,#7c3aed); color:#fff; box-shadow:0 4px 14px rgba(124,58,237,.4);}
.ce-role-btn:hover:not(.active){color:var(--text);}

.ce-tabs{position:relative; z-index:2; display:flex; gap:8px; padding:0 26px; margin-bottom:8px; flex-wrap:wrap;}
.ce-tab{background:none; border:none; color:var(--muted); cursor:pointer; font-size:14px; font-weight:600;
  padding:10px 16px; border-radius:10px 10px 0 0; display:inline-flex; align-items:center; gap:7px;
  border-bottom:2px solid transparent; transition:.15s; font-family:'Outfit';}
.ce-tab.active{color:#fff; border-bottom-color:#a855f7;}
.ce-tab:hover:not(.active){color:var(--text);}

.ce-main{position:relative; z-index:2; max-width:1180px; margin:0 auto; padding:14px 26px 60px;}
.ce-page{animation:cefade .4s ease both;}
.ce-page-head{display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:22px; flex-wrap:wrap;}
.ce-sub{margin:2px 0 0;}

.ce-grid-3,.ce-grid-2col{display:grid; gap:16px; margin-bottom:18px;}
.ce-grid-3{grid-template-columns:repeat(3,1fr);}
.ce-grid-2col{grid-template-columns:1fr 1fr;}
.ce-grid-cards{display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:16px;}
.ce-stack{display:flex; flex-direction:column; gap:16px;}

.ce-card{padding:20px;}
.ce-card-title{display:flex; align-items:center; gap:8px; font-weight:600; font-size:15px; margin-bottom:14px; color:#dbe4f5;}
.ce-ai-chip{margin-left:auto; display:inline-flex; align-items:center; gap:4px; font-size:10.5px; font-weight:700;
  padding:3px 9px; border-radius:999px; background:linear-gradient(120deg,rgba(56,189,248,.25),rgba(168,85,247,.3)); color:#e0f2fe;}

/* stat cards */
.ce-statcard{padding:20px; display:flex; align-items:center; gap:16px;}
.ce-statcard-icon{width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center;}
.ce-statcard-v{font-size:28px; font-weight:700; font-family:'Chakra Petch';}
.ce-statcard-l{font-size:13px; color:var(--muted);}

/* activity */
.ce-activity{display:flex; flex-direction:column; gap:10px;}
.ce-act-row{display:flex; align-items:center; gap:12px; padding:10px; border-radius:12px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.05);}
.ce-act-mid{flex:1; min-width:0;}
.ce-act-top{display:flex; align-items:center; gap:8px; margin-bottom:3px;}
.ce-act-type{font-size:14px; font-weight:500;}

/* engagement */
.ce-engage{display:flex; flex-direction:column;}
.ce-engage-score{font-size:48px; font-weight:700; font-family:'Chakra Petch'; line-height:1;}
.ce-pts{font-size:16px; margin-left:8px; -webkit-text-fill-color:var(--muted);}
.ce-level-badge{display:inline-flex; align-items:center; gap:6px; align-self:flex-start; margin:12px 0 14px;
  padding:6px 13px; border-radius:999px; font-size:13px; font-weight:600; color:#f0abfc;
  background:rgba(168,85,247,.14); border:1px solid rgba(168,85,247,.3);}
.ce-progress{height:9px; border-radius:999px; background:rgba(255,255,255,.07); overflow:hidden;}
.ce-progress-fill{height:100%; border-radius:999px; background:linear-gradient(90deg,#38bdf8,#a855f7); transition:width .6s ease;}
.ce-engage-meta{display:flex; gap:16px; margin-top:12px; font-size:12px; color:var(--muted);}
.ce-engage-meta span{display:inline-flex; align-items:center; gap:5px;}

/* upload */
.ce-upload{width:100%; display:flex; flex-direction:column; align-items:center; gap:8px; padding:38px 20px;
  border:2px dashed rgba(255,255,255,.16); border-radius:14px; background:rgba(255,255,255,.02); color:var(--muted);
  cursor:pointer; transition:.18s; font-family:'Outfit';}
.ce-upload:hover{border-color:rgba(168,85,247,.5); background:rgba(168,85,247,.06); color:var(--text);}
.ce-upload-main{font-size:15px; font-weight:600; color:var(--text);}
.ce-uploaded{display:flex; flex-direction:column; gap:12px; align-items:flex-start;}
.ce-uploaded-img{width:100%; max-height:260px; object-fit:cover; border-radius:13px; border:1px solid var(--border);}

.ce-analyzing{display:flex; align-items:center; gap:12px; color:#bae6fd; font-weight:500;}
.ce-spin{animation:cespin 1s linear infinite;}

/* result */
.ce-warn{display:flex; align-items:center; gap:8px; font-size:12.5px; color:#fcd34d;
  background:rgba(251,191,36,.1); border:1px solid rgba(251,191,36,.25); padding:8px 12px; border-radius:10px; margin-bottom:12px;}
.ce-result-head{display:flex; align-items:center; gap:14px; margin-bottom:16px;}
.ce-result-type{font-size:19px; font-weight:700; font-family:'Chakra Petch';}
.ce-result-sum{margin-top:3px;}
.ce-result-grid{display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;}
.ce-resfield{background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:11px 13px;}
.ce-resfield-label{font-size:11.5px; color:var(--muted); margin-bottom:7px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;}
.ce-est{font-size:9.5px; font-weight:700; letter-spacing:.4px; text-transform:uppercase; color:#7dd3fc;
  background:rgba(56,189,248,.14); padding:2px 6px; border-radius:5px;}
.ce-result-val{font-size:18px; font-weight:700; font-family:'Chakra Petch';}
.ce-result-val.ce-sm{font-size:14px;}

/* location */
.ce-hint{margin:0 0 12px;}
.ce-field-label{display:block; font-size:12px; color:var(--muted); margin:14px 0 6px;}
.ce-input{width:100%; background:rgba(255,255,255,.04); border:1px solid var(--border); color:var(--text);
  padding:11px 14px; border-radius:11px; font-size:14px; font-family:'Outfit'; outline:none; transition:.15s;}
.ce-input:focus{border-color:rgba(168,85,247,.6); background:rgba(168,85,247,.05);}
.ce-submit{width:100%; justify-content:center;}

/* filters */
.ce-filters{display:flex; align-items:center; gap:14px; padding:12px 16px; margin-bottom:18px; flex-wrap:wrap;}
.ce-filters-label{display:inline-flex; align-items:center; gap:7px; font-size:13px; font-weight:600; color:#dbe4f5;}
.ce-select-wrap{display:flex; flex-direction:column; gap:4px;}
.ce-select-label{font-size:10.5px; color:var(--muted); text-transform:uppercase; letter-spacing:.4px;}
.ce-select{background:rgba(255,255,255,.05); border:1px solid var(--border); color:var(--text);
  padding:7px 11px; border-radius:9px; font-size:13px; font-family:'Outfit'; cursor:pointer; outline:none; min-width:120px;}
.ce-select option{background:#0f172a; color:var(--text);}
.ce-sortnote{margin-left:auto; display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--muted);}

/* complaint card */
.ce-complaint{padding:16px; display:flex; flex-direction:column; gap:12px;}
.ce-complaint-head{display:flex; gap:12px; align-items:flex-start;}
.ce-complaint-meta{flex:1; min-width:0;}
.ce-complaint-top{display:flex; align-items:center; gap:8px; margin-bottom:5px;}
.ce-complaint-type{font-size:16px; font-weight:600; font-family:'Chakra Petch';}
.ce-complaint-dept{display:flex; align-items:center; gap:5px; font-size:12px; color:var(--muted); margin-top:3px;}
.ce-urg{display:flex; flex-direction:column; align-items:center; gap:2px; font-weight:700; font-size:18px; font-family:'Chakra Petch';}
.ce-complaint-sum{font-size:13px; color:#c0cadd; line-height:1.5; margin:0;}
.ce-complaint-foot{display:flex; align-items:center; justify-content:space-between; gap:10px;}

/* table */
.ce-tablewrap{overflow-x:auto; padding:8px;}
.ce-table{width:100%; border-collapse:collapse; font-size:13px; min-width:680px;}
.ce-table th{text-align:left; color:var(--muted); font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.4px; padding:12px 12px; border-bottom:1px solid var(--border);}
.ce-table td{padding:11px 12px; border-bottom:1px solid rgba(255,255,255,.04); vertical-align:middle;}
.ce-table tbody tr:hover{background:rgba(255,255,255,.03);}
.ce-nowrap{white-space:nowrap;}

.ce-empty{text-align:center; color:var(--muted); padding:40px 20px;}

/* analytics map legend */
.ce-maplegend{display:flex; gap:16px; flex-wrap:wrap; margin-top:12px; justify-content:center;}
.ce-legend-item{display:inline-flex; align-items:center; gap:7px; font-size:12.5px; color:var(--muted);}

/* viewtoggle */
.ce-viewtoggle{display:inline-flex; gap:3px; padding:4px; border-radius:11px;}
.ce-vt-btn{background:none; border:none; color:var(--muted); cursor:pointer; font-size:12.5px; font-weight:600;
  padding:7px 12px; border-radius:8px; display:inline-flex; align-items:center; gap:6px; transition:.15s; font-family:'Outfit';}
.ce-vt-btn.active{background:linear-gradient(120deg,#2563eb,#7c3aed); color:#fff;}

/* animations */
@keyframes cefade{from{opacity:0; transform:translateY(8px);}to{opacity:1; transform:none;}}
@keyframes ceUp{from{opacity:0; transform:translateY(22px);}to{opacity:1; transform:none;}}
.ce-fade-up{animation:ceUp .6s cubic-bezier(.2,.7,.3,1) both;}
@keyframes cespin{to{transform:rotate(360deg);}}
@keyframes cepulse{0%{transform:scale(.85); opacity:.5;}50%{transform:scale(1.15); opacity:.15;}100%{transform:scale(.85); opacity:.5;}}
.ce-pulse{transform-origin:center; transform-box:fill-box; animation:cepulse 2.4s ease-in-out infinite;}
@keyframes ceflash{0%{background:rgba(168,85,247,.22);}100%{background:transparent;}}
.ce-flash{animation:ceflash 1.8s ease-out;}

/* ===== ML module styles ===== */
.ce-ml-chip{margin-left:auto; display:inline-flex; align-items:center; gap:4px; font-size:10.5px; font-weight:700;
  padding:3px 9px; border-radius:999px; background:linear-gradient(120deg,rgba(56,189,248,.25),rgba(168,85,247,.3)); color:#e0f2fe; white-space:nowrap;}
.ce-ml-chip-sm{font-size:9.5px; padding:2px 7px;}
.ce-atrisk{display:flex; align-items:center; gap:16px; margin-bottom:18px;}
.ce-atrisk-icon{width:48px; height:48px; border-radius:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center;
  background:rgba(251,146,60,.14); color:#fb923c;}
.ce-atrisk-body{flex:1; min-width:0;}
.ce-atrisk-num{font-size:30px; font-weight:700; font-family:'Chakra Petch'; line-height:1;}
.ce-atrisk-label{font-size:14px; font-weight:600; margin-top:2px;}
.ce-atrisk-hint{font-size:12px;}
.ce-authority-summary{display:grid; grid-template-columns:1fr 1fr; gap:16px;}
.ce-authority-summary .ce-atrisk{margin-bottom:0;}
.ce-sos-summary{cursor:pointer; transition:transform .15s;}
.ce-sos-summary:hover{transform:translateY(-2px);}
.ce-toggle{display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,.05); border:1px solid var(--border);
  color:var(--muted); cursor:pointer; font-size:12.5px; font-weight:600; padding:8px 13px; border-radius:10px; font-family:'Outfit'; transition:.15s;}
.ce-toggle:hover{color:var(--text);}
.ce-toggle.active{background:linear-gradient(120deg,#2563eb,#7c3aed); color:#fff; border-color:transparent;}
.ce-toggle-inline{margin:10px 0;}
.ce-complaint-sla{display:flex; align-items:center; gap:8px; flex-wrap:wrap;}
.ce-topzones{display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:10px;}
.ce-topzones-label{display:inline-flex; align-items:center; gap:6px; font-size:12.5px; color:var(--muted);}
.ce-zonepill{display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,.04); border:1px solid;
  border-radius:999px; padding:5px 12px; font-size:12.5px; font-weight:700; cursor:pointer; font-family:'Outfit'; transition:.15s;}
.ce-zonepill.active{background:rgba(255,255,255,.1);}
.ce-zonedrill{margin-top:12px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:12px;}
.ce-zonedrill-title{font-size:13px; font-weight:600; margin-bottom:10px;}
.ce-zonedrill-row{display:flex; align-items:center; gap:10px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,.04);}
.ce-zonedrill-row:last-child{border-bottom:none;}
.ce-zonedrill-type{flex:1; font-size:13px;}

/* ===== Login ===== */
.ce-login{position:relative; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; z-index:1;}
.ce-login-top{position:absolute; top:18px; right:18px; z-index:2;}
.ce-login-card{position:relative; z-index:1; width:100%; max-width:430px; padding:32px 28px;}
.ce-login-brand{justify-content:center; margin-bottom:18px;}
.ce-login-title{font-size:22px; text-align:center; margin:0 0 6px; font-weight:700;}
.ce-login-sub{text-align:center; margin:0 0 22px;}
.ce-login-roles{display:grid !important; grid-template-columns:repeat(3,1fr); gap:3px; margin-bottom:4px;}
.ce-login-roles .ce-role-btn{justify-content:center;}
.ce-login-btn{width:100%; justify-content:center; margin-top:18px;}
.ce-democreds{margin-top:20px; border-top:1px solid var(--border); padding-top:16px;}
.ce-democreds-label{font-size:11.5px; color:var(--muted); margin-bottom:10px; text-transform:uppercase; letter-spacing:.4px;}
.ce-democred-row{display:flex; align-items:center; gap:8px; width:100%; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06);
  border-radius:10px; padding:9px 12px; margin-bottom:7px; cursor:pointer; transition:.15s; font-family:'Outfit'; color:var(--text);}
.ce-democred-row:hover{background:rgba(168,85,247,.1); border-color:rgba(168,85,247,.3);}
.ce-democred-pw{font-size:12px; color:var(--muted);}
.ce-democred-role{margin-left:auto; font-size:11px; font-weight:700; color:#7dd3fc; background:rgba(56,189,248,.14); padding:3px 9px; border-radius:6px;}
.ce-logout .ce-role-label{margin-left:2px;}

/* ===== Emergency Hub (FAB) ===== */
.ce-ehub{position:fixed; right:22px; bottom:22px; z-index:50; display:flex; flex-direction:column; align-items:flex-end; gap:12px;}
.ce-ehub-fab{position:relative; width:60px; height:60px; border-radius:50%; border:none; cursor:pointer; color:#fff;
  background:linear-gradient(135deg,#f43f5e,#b91c1c); box-shadow:0 8px 26px rgba(244,63,94,.55); display:flex; align-items:center; justify-content:center;
  transition:transform .2s; animation:cebeacon 2.4s ease-in-out infinite;}
.ce-ehub-fab:hover{transform:scale(1.07);}
.ce-ehub-fab.open{background:linear-gradient(135deg,#475569,#1e293b); animation:none;}
.ce-ehub-badge{position:absolute; top:-2px; right:-2px; min-width:20px; height:20px; padding:0 5px; border-radius:999px;
  background:#fff; color:#b91c1c; font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,.4);}
.ce-ehub-menu{display:flex; flex-direction:column; gap:10px; align-items:stretch;}
.ce-ehub-item{display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:14px; cursor:pointer; text-decoration:none;
  color:var(--text); border:1px solid var(--border); min-width:210px; transition:transform .15s; font-family:'Outfit'; background:rgba(15,23,42,.85);}
.ce-ehub-item:hover{transform:translateX(-3px);}
.ce-ehub-ic{width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0;}
.ce-ehub-label{font-weight:600; font-size:14px;}
.ce-ehub-tel{margin-left:auto; font-size:13px; color:var(--muted); font-family:'Chakra Petch';}
.ce-ehub-sos{border:none; background:linear-gradient(135deg,#f43f5e,#b91c1c); color:#fff;}
.ce-ehub-sos .ce-ehub-label{color:#fff;}
@keyframes cebeacon{0%,100%{box-shadow:0 8px 26px rgba(244,63,94,.5);}50%{box-shadow:0 8px 34px rgba(244,63,94,.85);}}

/* ===== Modal / SOS ===== */
.ce-modal-overlay{position:fixed; inset:0; z-index:60; background:rgba(2,6,16,.72); backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center; padding:20px;}
.ce-sos-card{position:relative; width:100%; max-width:420px; padding:28px; text-align:center; border:1px solid rgba(244,63,94,.4); box-shadow:0 0 50px rgba(244,63,94,.3);}
.ce-modal-x{position:absolute; top:14px; right:14px; background:rgba(255,255,255,.06); border:none; color:var(--text); width:30px; height:30px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center;}
.ce-sos-emoji{font-size:46px; animation:ceshake 1.2s ease-in-out infinite;}
.ce-sos-title{font-size:20px; font-weight:700; font-family:'Chakra Petch'; color:#fb7185; margin-top:6px;}
.ce-sos-loc{display:flex; align-items:center; gap:12px; text-align:left; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:12px; margin-top:16px; color:#38bdf8;}
.ce-sos-loc-label{font-size:11px; color:var(--muted);}
.ce-sos-coords{font-size:14px; color:var(--text); margin-top:2px;}
.ce-sos-time{display:flex; align-items:center; gap:6px; justify-content:center; font-size:12.5px; color:var(--muted); margin-top:12px;}
.ce-sos-pulse{display:inline-flex; align-items:center; gap:8px; margin-top:12px; font-size:13px; font-weight:600; color:#34d399;}
.ce-sos-actions{display:flex; gap:10px; justify-content:center; margin-top:18px;}
.ce-sos-actions .ce-btn{text-decoration:none;}
@keyframes ceshake{0%,100%{transform:rotate(-6deg);}50%{transform:rotate(6deg);}}

/* ===== Resource locator ===== */
.ce-res-filters{display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:12px;}
.ce-res-kinds{display:flex; gap:6px; flex-wrap:wrap;}
.ce-chip{background:rgba(255,255,255,.05); border:1px solid var(--border); color:var(--muted); cursor:pointer;
  font-size:12.5px; font-weight:600; padding:6px 13px; border-radius:999px; font-family:'Outfit'; transition:.15s;}
.ce-chip.active{background:linear-gradient(120deg,#2563eb,#7c3aed); color:#fff; border-color:transparent;}
.ce-res-list{display:flex; flex-direction:column; gap:8px; margin-top:14px;}
.ce-res-row{display:flex; align-items:center; gap:12px; padding:10px; border-radius:12px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.05); cursor:pointer; transition:.15s;}
.ce-res-row:hover,.ce-res-row.active{background:rgba(56,189,248,.08); border-color:rgba(56,189,248,.3);}
.ce-res-ic{width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0;}
.ce-res-mid{flex:1; min-width:0;}
.ce-res-name{font-weight:600; font-size:14px;}
.ce-res-meta{display:flex; gap:12px; font-size:12px; color:var(--muted); margin-top:2px;}
.ce-res-open{color:#34d399;}
.ce-res-closed{color:#94a3b8;}
.ce-res-row .ce-btn{text-decoration:none;}

/* ===== Women safety ===== */
.ce-safety-hero{display:flex; align-items:center; gap:20px; margin-bottom:18px;}
.ce-shield-ring{width:74px; height:74px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;
  color:#64748b; background:rgba(100,116,139,.12); border:2px solid rgba(100,116,139,.3); transition:.3s;}
.ce-shield-ring.on{color:#c084fc; background:rgba(168,85,247,.16); border-color:rgba(168,85,247,.5); box-shadow:0 0 26px rgba(168,85,247,.4);}
.ce-safety-body{flex:1;}
.ce-safety-state{font-size:19px; font-weight:700; font-family:'Chakra Petch'; margin-bottom:4px;}
.ce-safety-body .ce-btn{margin-top:10px;}
.ce-safety-action{display:flex; flex-direction:column; align-items:center; gap:10px; padding:22px 16px; cursor:pointer; border:none; font-family:'Outfit'; color:var(--text); transition:transform .15s;}
.ce-safety-action:hover{transform:translateY(-3px);}
.ce-safety-action.active{border:1px solid rgba(56,189,248,.4);}
.ce-safety-ic{width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center;}
.ce-safety-label{font-size:13.5px; font-weight:600; text-align:center;}
.ce-share-banner{display:flex; align-items:center; gap:10px; margin-top:16px; font-weight:600; color:#7dd3fc;}
.ce-shield-badge{display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#c084fc;
  background:rgba(168,85,247,.16); border:1px solid rgba(168,85,247,.4); padding:5px 11px; border-radius:999px; cursor:pointer; margin-top:8px;}
.ce-welcome-wrap{display:flex; flex-direction:column; gap:2px;}
.ce-head-actions{display:flex; gap:10px; flex-wrap:wrap;}
.ce-sos-shortcut{color:#fb7185; border-color:rgba(244,63,94,.3);}
.ce-sos-shortcut:hover{background:rgba(244,63,94,.12);}

/* ===== Fake call ===== */
.ce-fakecall{position:fixed; inset:0; z-index:70; background:linear-gradient(180deg,#0b1220,#020610); display:flex; align-items:center; justify-content:center;}
.ce-fakecall-inner{text-align:center; color:#fff;}
.ce-fakecall-avatar{width:110px; height:110px; border-radius:50%; margin:0 auto 18px; background:rgba(255,255,255,.08); display:flex; align-items:center; justify-content:center; color:#cbd5e1; border:2px solid rgba(255,255,255,.12);}
.ce-fakecall-name{font-size:28px; font-weight:700; font-family:'Chakra Petch';}
.ce-fakecall-status{color:#94a3b8; margin-top:6px; animation:cefadepulse 1.5s ease-in-out infinite;}
.ce-fakecall-actions{display:flex; gap:60px; justify-content:center; margin-top:50px;}
.ce-fakecall-btn{width:62px; height:62px; border-radius:50%; border:none; cursor:pointer; color:#fff; display:flex; align-items:center; justify-content:center;}
.ce-fakecall-btn.decline{background:#ef4444; transform:rotate(135deg);}
.ce-fakecall-btn.accept{background:#22c55e; animation:cebeacon 1.5s ease-in-out infinite;}
@keyframes cefadepulse{0%,100%{opacity:.5;}50%{opacity:1;}}

/* ===== Disaster ===== */
.ce-disaster{display:flex; flex-direction:column; gap:10px;}
.ce-disaster-head{display:flex; align-items:flex-start; gap:12px;}
.ce-disaster-ic{width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;}
.ce-disaster-haz{font-size:17px; font-weight:700; font-family:'Chakra Petch';}
.ce-disaster-area{display:flex; align-items:center; gap:5px; font-size:12.5px; margin-top:2px;}
.ce-disaster-level{margin-left:auto; align-self:flex-start;}
.ce-disaster-pop{display:flex; align-items:center; gap:6px; font-size:13px; color:#c0cadd;}
.ce-disaster-actions-label{font-size:11.5px; text-transform:uppercase; letter-spacing:.4px; color:var(--muted); margin-top:2px;}
.ce-disaster-actions{list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:5px;}
.ce-disaster-actions li{display:flex; align-items:center; gap:6px; font-size:13px; color:#c0cadd;}
.ce-disclaimer{display:flex; align-items:center; gap:8px; font-size:12.5px; color:#fcd34d; background:rgba(251,191,36,.1);
  border:1px solid rgba(251,191,36,.25); padding:8px 12px; border-radius:10px; margin-bottom:14px;}
.ce-risk-card{padding:16px;}
.ce-risk-top{display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:4px;}
.ce-risk-area{font-size:14px; font-weight:600;}
.ce-risk-haz{font-size:12px; margin-bottom:10px;}
.ce-risk-bar{height:8px; border-radius:999px; background:rgba(255,255,255,.07); overflow:hidden;}
.ce-risk-fill{height:100%; border-radius:999px; transition:width .6s ease;}
.ce-risk-pct{font-size:20px; font-weight:700; font-family:'Chakra Petch'; margin-top:8px; text-align:right;}

/* ===== mini widgets ===== */
.ce-mini-disaster{cursor:pointer; transition:transform .15s;}
.ce-mini-disaster:hover{transform:translateY(-2px);}
.ce-mini-disaster-row{display:flex; align-items:center; gap:12px;}
.ce-mini-disaster-mid{flex:1; min-width:0;}
.ce-mini-disaster-haz{font-weight:600; font-size:15px;}
.ce-mini-disaster-area{font-size:12px;}
.ce-mini-link{display:flex; align-items:center; gap:4px; justify-content:flex-end; font-size:13px; font-weight:600; color:#7dd3fc; margin-top:12px;}
.ce-emergency-shortcut{cursor:pointer; text-align:left; border:none; font-family:'Outfit'; color:var(--text); transition:transform .15s; display:flex; flex-direction:column;}
.ce-emergency-shortcut:hover{transform:translateY(-2px);}
.ce-emergency-shortcut p{margin:0; flex:1;}

/* responsive */
@media(max-width:900px){
  .ce-grid-4{grid-template-columns:repeat(2,1fr);}
  .ce-grid-2col{grid-template-columns:1fr;}
  .ce-stats{grid-template-columns:repeat(2,1fr);}
  .ce-hero h1{font-size:42px;}
  .ce-step-arrow{display:none;}
  .ce-authority-summary{grid-template-columns:1fr;}
}
@media(max-width:620px){
  .ce-grid-3{grid-template-columns:1fr;}
  .ce-grid-4{grid-template-columns:1fr;}
  .ce-stats{grid-template-columns:repeat(2,1fr);}
  .ce-hero h1{font-size:34px;}
  .ce-hero-sub{font-size:15px;}
  .ce-h2{font-size:25px;}
  .ce-result-grid{grid-template-columns:1fr;}
  .ce-role-label{display:none;}
  .ce-main{padding:12px 14px 50px;}
  .ce-tabs{padding:0 14px;}
  .ce-topbar{margin:10px;}
  .ce-ehub{right:16px; bottom:16px;}
  .ce-ehub-item{min-width:180px;}
  .ce-fakecall-actions{gap:40px;}
}
`;
