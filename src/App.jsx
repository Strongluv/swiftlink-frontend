import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Menu,
  ChevronRight,
  ChevronDown,
  Search,
  Smartphone,
  PhoneCall,
  LayoutGrid,
  Users,
  CreditCard,
  Wallet,
  RefreshCw,
  Home,
  Tv,
  Wifi,
  Zap,
  Rocket,
  ShoppingBag,
  X,
  Check,
  ArrowRight,
  Clock,
  Radio,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  LogOut,
  User,
  HelpCircle,
} from "lucide-react";

/* ----------------------------------------------------------------------- */
/*  SwiftLink — design tokens                                              */
/*  Display: Sora / Body: Inter / Mono (balances, codes): IBM Plex Mono    */
/*  Signal-green + amber on deep forest-ink, "link node" signature motif   */
/* ----------------------------------------------------------------------- */

/* ----------------------------------------------------------------------- */
/*  SwiftLink — design tokens                                              */
/*  Font: Montserrat throughout / Mono (balances, codes): IBM Plex Mono    */
/*  Deep black-blue background, dark glass-morphism cards                  */
/* ----------------------------------------------------------------------- */

const T = {
  ink: "#0E1015",
  surface: "rgba(255,255,255,0.045)",
  surface2: "rgba(255,255,255,0.06)",
  surface3: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.09)",
  primary: "#8B5CF6",
  primaryDim: "#6D3FD1",
  accent: "#F2B441",
  text: "#FFFFFF",
  muted: "#B0B3B8",
  mutedDim: "#7A7D85",
  danger: "#E8621A",
};

const fontDisplay = { fontFamily: "'Montserrat', system-ui, sans-serif", fontWeight: 700 };
const fontBody = { fontFamily: "'Montserrat', system-ui, sans-serif", fontWeight: 400 };
const fontBold = { fontFamily: "'Montserrat', system-ui, sans-serif", fontWeight: 700 };
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };

// Reusable glass-card look: soft blur, translucent fill, 12px corners, soft shadow.
const glassCard = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 12,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
};

const FONT_LINKS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 0px; height: 0px; }
    @keyframes pulseDot { 0%,100% { opacity: .35; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
    @keyframes dash { to { stroke-dashoffset: -24; } }
    @keyframes floatUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-in { animation: floatUp .35s ease both; }
  `}</style>
);

/* ----------------------------------------------------------------------- */
/*  Signature element: the "Link Signal" mark — three nodes joined by a    */
/*  dashed, animated connector. Used as the logo mark and as a motif in    */
/*  empty/success states.                                                  */
/* ----------------------------------------------------------------------- */

function LinkSignalMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="7" cy="30" r="4" fill={T.accent} />
      <circle cx="20" cy="10" r="4.5" fill={T.primary} />
      <circle cx="33" cy="26" r="4" fill={T.primary} />
      <path
        d="M10 27 L17 13 M23 12 L30 23"
        stroke={T.muted}
        strokeWidth="1.6"
        strokeDasharray="3 4"
        strokeLinecap="round"
        style={{ animation: "dash 1.8s linear infinite" }}
      />
    </svg>
  );
}

function Logo({ size = "text-2xl" }) {
  return (
    <div className="flex items-center gap-2">
      <LinkSignalMark size={30} />
      <span className={`${size} font-extrabold tracking-tight`} style={{ ...fontDisplay, color: T.text }}>
        Swift<span style={{ color: T.primary }}>Link</span>
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Live backend — your real Railway server                                */
/* ----------------------------------------------------------------------- */

/* ----------------------------------------------------------------------- */
/*  Google Sign-In — this Client ID is safe to keep in the code; it's      */
/*  meant to be public, unlike the 5sim key.                               */
/* ----------------------------------------------------------------------- */

const GOOGLE_CLIENT_ID = "513320871409-v8m5jpoe6rf86t5qrvvrtiup4lfmlmh9.apps.googleusercontent.com";

// Google sends back a signed token (a JWT) after login. This pulls the
// name/email out of it so we can greet the person by name.
function decodeGoogleToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    return null;
  }
}

const BACKEND_URL = "https://swiftlink-backend-production.up.railway.app";

// Paystack's PUBLIC key — safe to keep in frontend code, same idea as the
// Google Client ID. Replace this with your real one from your Paystack
// dashboard (Settings → API Keys & Webhooks → Public Key).
const PAYSTACK_PUBLIC_KEY = "pk_live_cfaa6b39d1c3ec2624ad1a3a5e05d0d6821f1b22";


/* ----------------------------------------------------------------------- */
/*  Data                                                                    */
/* ----------------------------------------------------------------------- */

// Small fallback list, only used if the live server can't be reached yet.
const FALLBACK_COUNTRIES = [
  { code: "usa", name: "United States", flag: "🇺🇸" },
  { code: "nigeria", name: "Nigeria", flag: "🇳🇬" },
  { code: "germany", name: "Germany", flag: "🇩🇪" },
  { code: "brazil", name: "Brazil", flag: "🇧🇷" },
];

const SERVICES = [
  { id: "esim", label: "eSIM", desc: "Instant data plan, no SIM swap", icon: Wifi, live: false },
  { id: "virtual", label: "Virtual Number", desc: "Real number, one-time use for verifications", icon: Smartphone, live: true },
  { id: "rental", label: "Number Rental", desc: "Keep a number for weeks or months", icon: PhoneCall, live: false },
];

const QUICK_ACTIONS = [
  { id: "tv", label: "TV", icon: Tv },
  { id: "airtime", label: "Airtime", icon: Smartphone },
  { id: "data", label: "Data", icon: Wifi },
  { id: "electricity", label: "Electricity", icon: Zap },
];

/* ----------------------------------------------------------------------- */
/*  Small building blocks                                                   */
/* ----------------------------------------------------------------------- */

function Toast({ text, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fixed left-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg animate-in"
      style={{
        bottom: 96,
        transform: "translateX(-50%)",
        background: T.surface3,
        border: `1px solid ${T.border}`,
        color: T.text,
        ...fontBody,
      }}
    >
      <Check size={16} color={T.primary} />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: "rgba(242,180,65,0.15)", color: T.accent, ...fontBody }}
    >
      {children}
    </span>
  );
}

function Sheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" style={{ background: "rgba(4,12,10,0.6)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl p-5 pb-8"
        style={{ ...glassCard, borderBottom: "none", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, animation: "slideUp .3s ease" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ ...fontDisplay, color: T.text }}>{title}</h3>
          <button onClick={onClose} style={{ color: T.muted }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Screens                                                                  */
/* ----------------------------------------------------------------------- */

// Real email + password accounts, with an optional Google sign-in shortcut.
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem("swiftlink_remembered_email") || "";
    } catch (err) {
      return "";
    }
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checkedPassword, setCheckedPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const googleBtnRef = useRef(null);
  const [slide, setSlide] = useState(0);

  const slides = [
    { title: "Real virtual numbers", desc: "WhatsApp, Instagram, TikTok, Facebook and hundreds more — verified instantly." },
    { title: "Grow your social accounts", desc: "Real followers, real likes, real delivery — boost or buy accounts safely." },
    { title: "One wallet, two currencies", desc: "Fund in Naira, spend in Naira or Dollars, always at a fair, live rate." },
    { title: "Every order, tracked live", desc: "Countdown timers, instant codes, and refunds if something doesn't deliver." },
  ];

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, []);

  // Load Google's real sign-in script and render their official button.
  // Only works when the site is opened from an address Google was told
  // to trust (right now: http://localhost:5173).
  useEffect(() => {
    const scriptId = "google-identity-script";

    const initGoogle = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            const payload = decodeGoogleToken(response.credential);
            const result = await onLogin({
              userId: payload?.sub || payload?.email,
              name: payload?.name || payload?.email || "there",
              email: payload?.email || null,
            });
            if (result && !result.ok) {
              setError(result.error);
            }
          },
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          width: 280,
        });
      }
    };

    if (document.getElementById(scriptId)) {
      initGoogle();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.id = scriptId;
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);
  }, []);

  // A simple check that the password at least LOOKS like a real one before
  // sending anything — this is the "check if my password is correct" button.
  const checkPassword = () => {
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      setCheckedPassword(false);
    } else {
      setError("");
      setCheckedPassword(true);
    }
  };

  const submit = async () => {
    setError("");
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a real email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      // "Remember me" just saves the email locally so it's pre-filled next
      // time — it never stores the password.
      try {
        if (rememberMe) localStorage.setItem("swiftlink_remembered_email", email.trim());
        else localStorage.removeItem("swiftlink_remembered_email");
      } catch (err) {}

      const endpoint = mode === "signup" ? "/api/account/signup" : "/api/account/login-password";
      const body = mode === "signup"
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not continue.");
        return;
      }

      const result = await onLogin({ userId: data.userId, name: data.name, email: data.email });
      if (result && !result.ok) {
        setError(result.error);
      }
    } catch (err) {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: T.ink }}>
      {/* Left illustration panel — desktop/tablet only, matches the split-screen
          pattern from the reference: brand visual on one side, form on the other. */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, #8B5CF6, #4C6FFF)` }}
      >
        <div className="flex items-center gap-2 relative z-10">
          <LinkSignalMark size={32} />
          <span style={{ ...fontBold, fontSize: 22, color: "#FFFFFF" }}>
            Swift<span style={{ color: "#04241A" }}>Link</span>
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="mb-4" style={{ ...fontBold, fontSize: 36, lineHeight: 1.15, color: "#FFFFFF" }}>
            {slides[slide].title}
          </h2>
          <p className="text-base" style={{ color: "rgba(255,255,255,0.85)", ...fontBody }}>
            {slides[slide].desc}
          </p>
          <div className="flex gap-2 mt-8">
            {slides.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === slide ? 28 : 8, background: i === slide ? "#FFFFFF" : "rgba(255,255,255,0.4)" }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs" style={{ color: "rgba(255,255,255,0.6)", ...fontBody }}>
          Real numbers, real accounts, real payments.
        </div>

        <Radio size={220} color="#FFFFFF" className="absolute -right-16 -bottom-16 opacity-10" />
      </div>

      {/* Right panel — the actual form. Identical content and behavior on
          every screen size; only the surrounding width changes. */}
      <div className="flex flex-col flex-1 px-6 lg:px-16 overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center items-center gap-5 py-10 lg:max-w-md lg:mx-auto lg:w-full">
        <div className="scale-125 mb-2">
          <LinkSignalMark size={64} />
        </div>
        <div className="text-center">
          <h1 className="mb-2" style={{ ...fontBold, fontSize: 28, fontWeight: 700, color: "#FFFFFF" }}>
            Swift<span style={{ color: T.primary }}>Link</span>
          </h1>
          <p className="max-w-[240px] mx-auto leading-relaxed" style={{ ...fontBody, fontSize: 16, fontWeight: 400, color: T.muted }}>
            Numbers, eSIMs, bills and gift cards — one connected account.
          </p>
        </div>

        <div ref={googleBtnRef} className="mt-2" />

        <div className="w-full flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ background: T.border }} />
          <span className="text-xs" style={{ color: T.mutedDim, ...fontBody }}>or</span>
          <div className="flex-1 h-px" style={{ background: T.border }} />
        </div>

        {/* Login / Sign up switch */}
        <div className="w-full flex rounded-xl p-1" style={{ background: T.surface2 }}>
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className="flex-1 rounded-lg py-2 text-sm font-semibold"
            style={{ background: mode === "login" ? T.primary : "transparent", color: mode === "login" ? "#FFFFFF" : T.muted, ...fontBody }}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            className="flex-1 rounded-lg py-2 text-sm font-semibold"
            style={{ background: mode === "signup" ? T.primary : "transparent", color: mode === "signup" ? "#FFFFFF" : T.muted, ...fontBody }}
          >
            Sign Up
          </button>
        </div>

        {mode === "signup" && (
          <div className="w-full">
            <label className="text-xs font-medium mb-1.5 block" style={{ ...fontBody, color: T.muted }}>Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl px-4 py-3.5 outline-none"
              style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.text, ...fontBody }}
            />
          </div>
        )}

        <div className="w-full">
          <label className="text-xs font-medium mb-1.5 block" style={{ ...fontBody, color: T.muted }}>Email address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            className="w-full rounded-xl px-4 py-3.5 outline-none"
            style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.text, ...fontBody }}
          />
        </div>

        <div className="w-full">
          <label className="text-xs font-medium mb-1.5 block" style={{ ...fontBody, color: T.muted }}>Password</label>
          <div className="relative">
            <input
              value={password}
              onChange={(e) => { setPassword(e.target.value); setCheckedPassword(false); }}
              placeholder="At least 6 characters"
              type={showPassword ? "text" : "password"}
              className="w-full rounded-xl pl-4 pr-11 py-3.5 outline-none"
              style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.text, ...fontBody }}
            />
            <button
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: T.mutedDim }}
              type="button"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            onClick={checkPassword}
            type="button"
            className="mt-2 flex items-center gap-1.5 text-xs font-medium"
            style={{ color: checkedPassword ? T.primary : T.accent, ...fontBody }}
          >
            {checkedPassword ? <CheckCircle size={14} /> : null}
            {checkedPassword ? "Looks good" : "Check password"}
          </button>
        </div>

        {mode === "login" && (
          <div className="w-full flex items-center justify-between -mt-1">
            <label className="flex items-center gap-2 text-xs" style={{ color: T.muted, ...fontBody }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => setError("Password reset isn't available yet — please contact support.")}
              className="text-xs font-medium"
              style={{ color: T.accent, ...fontBody }}
            >
              Forgot Password?
            </button>
          </div>
        )}

        {error && <div className="text-xs w-full" style={{ color: T.danger, ...fontBody }}>{error}</div>}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          style={{ background: T.primary, color: "#FFFFFF", ...fontBody, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Log In"}
          {!loading && <ArrowRight size={18} />}
        </button>

        <p className="text-xs text-center" style={{ color: T.muted, ...fontBody }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="font-semibold"
            style={{ color: T.accent }}
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
      <p className="text-center text-[11px] pb-6" style={{ color: T.mutedDim, ...fontBody }}>
        A real email is required — it's how your wallet and payments stay safe.
      </p>
      </div>
    </div>
  );
}

// The real menu — a mini profile, links to every main screen, and a
// working logout button that actually clears the session.
function MenuPanel({ onClose, userName, userEmail, tab, setTab, onLogout, onFaq }) {
  const links = [
    { id: "esims", label: "eSIMs" },
    { id: "numbers", label: "Numbers" },
    { id: "dashboard", label: "Dashboard" },
    { id: "accounts", label: "Account" },
  ];
  return (
    <Sheet title="Menu" onClose={onClose}>
      <div className="flex items-center gap-3 rounded-xl p-3 mb-4" style={{ background: T.surface2 }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: T.surface3 }}>
          <User size={18} color={T.primary} />
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: T.text, ...fontBody }}>{userName}</div>
          <div className="text-xs" style={{ color: T.muted, ...fontBody }}>{userEmail}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1 mb-4">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => { setTab(link.id); onClose(); }}
            className="w-full flex items-center justify-between rounded-lg px-4 py-3 text-left"
            style={{ background: tab === link.id ? T.surface2 : "transparent", ...fontBody }}
          >
            <span className="text-sm" style={{ color: tab === link.id ? T.primary : T.text }}>{link.label}</span>
            <ChevronRight size={14} color={T.mutedDim} />
          </button>
        ))}
        <button
          onClick={() => { onFaq(); onClose(); }}
          className="w-full flex items-center justify-between rounded-lg px-4 py-3 text-left"
          style={{ ...fontBody }}
        >
          <span className="text-sm flex items-center gap-2" style={{ color: T.text }}>
            <HelpCircle size={15} color={T.mutedDim} /> FAQ
          </span>
          <ChevronRight size={14} color={T.mutedDim} />
        </button>
      </div>

      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold"
        style={{ border: `1px solid ${T.danger}`, color: T.danger, ...fontBody }}
      >
        <LogOut size={16} />
        Log Out
      </button>
    </Sheet>
  );
}

// Real, concise answers to what customers actually ask most.
const FAQ_ITEMS = [
  {
    q: "How fast do I get my number or code?",
    a: "Virtual numbers are issued instantly. The SMS code usually arrives within seconds to a couple of minutes — tap \"Check for SMS code\" to refresh.",
  },
  {
    q: "Why should I use a VPN when buying a number?",
    a: "Some services check that your location matches the number's country. Turning on a VPN set to that same country improves your success rate.",
  },
  {
    q: "What happens if my number expires with no code?",
    a: "Every order has a 30-minute window. If nothing arrives in time, the order is marked expired — cancel before then for an automatic refund to your wallet.",
  },
  {
    q: "Is my payment safe?",
    a: "Yes. Card and transfer payments are handled entirely by Paystack — SwiftLink never sees or stores your card details.",
  },
  {
    q: "Can I get a refund if a service doesn't deliver?",
    a: "Yes — use \"Cancel & Refund\" before a code arrives. Once a code is delivered, the service has been provided and can no longer be refunded.",
  },
  {
    q: "How long do social media boosts take?",
    a: "Delivery speed depends on the exact service you pick — most start within minutes. You can track progress under Order History.",
  },
  {
    q: "Is my password safe?",
    a: "Yes. Passwords are scrambled (hashed) before being stored — nobody, including SwiftLink staff, can ever see your real password.",
  },
  {
    q: "Why do I need to enter a code from my email to log in?",
    a: "This is an extra security step. Even if someone guessed your password, they'd also need access to your email to get in.",
  },
];

function FAQPanel({ onClose }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <Sheet title="Frequently Asked Questions" onClose={onClose}>
      <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="rounded-lg overflow-hidden" style={{ background: T.surface2 }}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm font-medium pr-3" style={{ color: T.text, ...fontBody }}>{item.q}</span>
              <ChevronDown
                size={15}
                color={T.mutedDim}
                style={{ transform: openIndex === i ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}
              />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-3 text-xs leading-relaxed" style={{ color: T.muted, ...fontBody }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </Sheet>
  );
}

// Turns real order data into a simple notification feed — no fake content,
// just a friendlier way of showing what's already happened on the account.
function NotificationsPanel({ onClose, orders }) {
  const items = orders.slice(0, 15).map((o) => {
    let text = "";
    if (o.status === "received") text = `Code delivered for your ${o.service?.toLowerCase() || "order"} (${o.product || ""})`;
    else if (o.status === "cancelled") text = `Order cancelled and refunded — ${o.product || o.service}`;
    else text = `Waiting on your ${o.service?.toLowerCase() || "order"} (${o.product || ""})`;
    return { id: o.id, text, date: o.date };
  });

  return (
    <Sheet title="Notifications" onClose={onClose}>
      {items.length === 0 ? (
        <EmptyState label="Nothing yet" sub="Updates about your orders will show up here." />
      ) : (
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {items.map((n) => (
            <div key={n.id} className="rounded-lg px-4 py-3" style={{ background: T.surface2 }}>
              <div className="text-xs" style={{ color: T.text, ...fontBody }}>{n.text}</div>
              <div className="text-[11px] mt-1" style={{ color: T.mutedDim, ...fontBody }}>{n.date}</div>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

function Header({ onMenu, onNotif, notifCount, tab, setTab }) {
  const navLinks = [
    { id: "esims", label: "eSIMs" },
    { id: "numbers", label: "Numbers" },
    { id: "dashboard", label: "Dashboard" },
    { id: "accounts", label: "Accounts" },
    { id: "giftcards", label: "Gift Cards" },
  ];
  return (
    <div
      className="flex items-center justify-between px-5 lg:px-8 py-4 sticky top-0 z-20"
      style={{ background: T.ink, borderBottom: `1px solid ${T.border}` }}
    >
      <div className="flex items-center gap-10">
        <Logo />
        {/* Desktop/tablet horizontal nav — mobile keeps using the bottom tab bar */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setTab(link.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: tab === link.id ? T.primary : T.muted,
                background: tab === link.id ? T.surface2 : "transparent",
                ...fontBody,
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onNotif} className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ border: `1px solid ${T.border}` }}>
          <Bell size={16} color={T.text} />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold" style={{ background: T.accent, color: "#3A2600" }}>
              {notifCount}
            </span>
          )}
        </button>
        <button onClick={onMenu} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ border: `1px solid ${T.border}` }}>
          <Menu size={16} color={T.text} />
        </button>
      </div>
    </div>
  );
}

function CountryPicker({ value, onChange, countries, loading }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = countries.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl px-4 py-3.5"
        style={{ background: T.surface2, border: `1px solid ${T.border}` }}
      >
        <span className="flex items-center gap-2" style={{ ...fontBody, color: value ? T.text : T.mutedDim }}>
          {value ? <>{value.flag} {value.name}</> : loading ? "Loading real countries..." : "Select a country"}
        </span>
        <ChevronDown size={18} color={T.muted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-30 animate-in"
          style={{ background: T.surface2, border: `1px solid ${T.border}` }}
        >
          <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
            <Search size={14} color={T.mutedDim} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type to search..."
              className="bg-transparent outline-none text-sm w-full"
              style={{ ...fontBody, color: T.text }}
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.code}
                onClick={() => { onChange(c); setOpen(false); setQ(""); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                style={{ ...fontBody, color: T.text }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span className="text-lg">{c.flag}</span>
                <span className="text-sm">{c.name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-sm" style={{ color: T.mutedDim, ...fontBody }}>No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// A brand-matching security tip, shown wherever someone's about to buy a
// number for a specific country — replaces the old flat amber notice.
function VpnTip({ countryName }) {
  return (
    <div
      className="rounded-xl p-3.5 mb-4 flex items-start gap-3"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.16), rgba(76,111,255,0.10))",
        border: `1px solid rgba(139,92,246,0.35)`,
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "rgba(139,92,246,0.25)" }}
      >
        <Shield size={15} color={T.primary} />
      </div>
      <p className="text-[12px] leading-relaxed" style={{ color: T.text, ...fontBody }}>
        <span style={{ fontWeight: 700, color: T.primary }}>Tip: </span>
        for the best success rate, turn on a VPN set to <strong>{countryName}</strong> before verifying — some services check that your location matches the number's country.
      </p>
    </div>
  );
}

function ProductList({ products, buying, onBuy, rubToUsd, rubToNgn }) {
  const [q, setQ] = useState("");
  const POPULAR = ["whatsapp", "instagram", "facebook", "telegram", "tiktok", "google", "aliexpress", "amazon", "twitter", "discord"];

  const entries = Object.entries(products || {});
  const filtered = entries.filter(([key]) => key.toLowerCase().includes(q.toLowerCase()));
  // Bubble well-known services to the top so they're easy to find in a big list.
  filtered.sort((a, b) => {
    const ai = POPULAR.indexOf(a[0].toLowerCase());
    const bi = POPULAR.indexOf(b[0].toLowerCase());
    if (ai === -1 && bi === -1) return a[0].localeCompare(b[0]);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-2" style={{ background: T.surface3 }}>
        <Search size={13} color={T.mutedDim} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search WhatsApp, Instagram, TikTok..."
          className="bg-transparent outline-none text-xs w-full"
          style={{ ...fontBody, color: T.text }}
        />
      </div>
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {filtered.map(([key, val]) => {
          const { ngnPrice, usdPrice } = getRetailPrice(key, rubToUsd, rubToNgn);
          const outOfStock = val.Qty !== undefined && Number(val.Qty) <= 0;
          return (
            <button
              key={key}
              disabled={buying === key || outOfStock}
              onClick={() => onBuy(key)}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: T.surface3, ...fontBody, opacity: outOfStock ? 0.5 : 1 }}
            >
              <div>
                <div className="text-xs capitalize" style={{ color: T.text }}>{key}</div>
                {val.Qty !== undefined && (
                  <div className="text-[10px]" style={{ color: outOfStock ? T.danger : T.mutedDim }}>
                    {outOfStock ? "Out of stock" : `${val.Qty} in stock`}
                  </div>
                )}
              </div>
              <div
                className="text-right px-3 py-1.5 rounded-lg"
                style={{ background: buying === key ? "transparent" : "rgba(139,92,246,0.14)" }}
              >
                <div className="text-sm font-extrabold" style={{ color: buying === key ? T.mutedDim : T.primary, ...fontMono }}>
                  {buying === key ? "Buying..." : `₦${ngnPrice.toLocaleString()}`}
                </div>
                {buying !== key && (
                  <div className="text-[10px] font-medium" style={{ color: T.mutedDim, ...fontMono }}>${usdPrice.toFixed(2)}</div>
                )}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-xs py-2" style={{ color: T.mutedDim, ...fontBody }}>No matching service for this country right now.</div>
        )}
      </div>
    </div>
  );
}

// A purchased number is only valid for this long before it's considered expired.
const ORDER_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Tells your backend/database that an order's status (or code) changed,
// so it stays correct even after a page refresh.
function syncOrderStatus(userId, orderId, status, code) {
  if (!userId) return;
  fetch(`${BACKEND_URL}/api/account/${userId}/orders/${orderId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, code: code || null }),
  }).catch(() => {});
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Shown after a real purchase: the phone number, a live 30-minute countdown,
// a Cancel button (only while still waiting), and the code once it arrives.
// Once a code has been delivered, cancelling is no longer allowed — the
// service was already provided.
function ActiveOrderPanel({ order, setOrder, wallet, setWallet, userId, setOrders, notify }) {
  const [now, setNow] = useState(Date.now());
  const [checking, setChecking] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = (order.expiresAt || 0) - now;
  const expired = remaining <= 0 && !order.code;

  const updateOrderEverywhere = (patch) => {
    setOrder((o) => ({ ...o, ...patch }));
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...patch } : o)));
  };

  const checkForCode = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/numbers/status/${order.id}`);
      const data = await res.json();
      const code = data.sms && data.sms.length > 0 ? data.sms[0].code : null;
      if (code) {
        notify(`Code received: ${code}`);
        updateOrderEverywhere({ code, status: "received" });
        syncOrderStatus(userId, order.id, "received", code);
      } else {
        notify("No code yet — try again in a few seconds");
      }
    } catch (err) {
      notify("Could not check status right now");
    } finally {
      setChecking(false);
    }
  };

  const cancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/numbers/${order.id}/cancel`, { method: "POST" });
      if (!res.ok) {
        notify("Could not cancel — it may have already delivered a code");
        return;
      }
      // Refund the customer's wallet since the service wasn't delivered.
      if (order.usdPrice) setWallet((w) => ({ ...w, usd: w.usd + order.usdPrice }));
      updateOrderEverywhere({ status: "cancelled" });
      syncOrderStatus(userId, order.id, "cancelled", null);
      notify("Order cancelled and refunded to your wallet");
    } catch (err) {
      notify("Could not cancel right now");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <div className="rounded-xl p-4 mb-4" style={{ background: T.surface2 }}>
        <div className="text-xs mb-1" style={{ color: T.muted, ...fontBody }}>Your number</div>
        <div className="text-xl font-bold mb-3" style={fontMono}>{order.phone}</div>

        {order.code ? (
          <>
            <div className="text-xs mb-1" style={{ color: T.muted, ...fontBody }}>Code received</div>
            <div className="text-xl font-bold" style={{ ...fontMono, color: T.primary }}>{order.code}</div>
          </>
        ) : order.status === "cancelled" ? (
          <div className="text-xs" style={{ color: T.mutedDim, ...fontBody }}>This order was cancelled and refunded.</div>
        ) : expired ? (
          <div className="text-xs" style={{ color: T.danger, ...fontBody }}>Expired — no code arrived in time.</div>
        ) : (
          <>
            <div className="text-xs mb-1" style={{ color: T.muted, ...fontBody }}>Time remaining</div>
            <div className="text-lg font-bold" style={{ ...fontMono, color: T.accent }}>{formatCountdown(remaining)}</div>
          </>
        )}
      </div>

      {!order.code && order.status !== "cancelled" && !expired && (
        <div className="flex flex-col gap-2">
          <button
            onClick={checkForCode}
            disabled={checking}
            className="w-full rounded-xl py-3.5 font-semibold"
            style={{ background: T.primary, color: "#FFFFFF", ...fontBody }}
          >
            {checking ? "Checking..." : "Check for SMS code"}
          </button>
          <button
            onClick={cancelOrder}
            disabled={cancelling}
            className="w-full rounded-xl py-3.5 font-semibold"
            style={{ background: "transparent", border: `1px solid ${T.danger}`, color: T.danger, ...fontBody }}
          >
            {cancelling ? "Cancelling..." : "Cancel & Refund"}
          </button>
        </div>
      )}
    </div>
  );
}

function PlaceOrderCard({ orders, setOrders, notify, countries, countriesLoading, rubToUsd, rubToNgn, wallet, setWallet, userId }) {
  const [country, setCountry] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [products, setProducts] = useState(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [buying, setBuying] = useState(null); // product id currently being bought
  const [activeOrder, setActiveOrder] = useState(null); // the real order returned by 5sim

  // When the service sheet opens, ask the real backend which products
  // (WhatsApp, Telegram, etc.) are actually available for this country.
  const openServices = async () => {
    setShowServices(true);
    setProductsLoading(true);
    setProducts(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/numbers/products/${country.code}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      notify("Could not reach the live server for prices");
    } finally {
      setProductsLoading(false);
    }
  };

  // This is the real purchase — it spends real money from your 5sim wallet.
  // Before it runs, we make sure the customer's own USD wallet balance can
  // cover the price — converting some of their NGN balance automatically
  // if it can't, the same way a bank teller would offer to convert cash.
  const buyProduct = async (productId) => {
    const { usdPrice } = getRetailPrice(productId, rubToUsd, rubToNgn);

    if (wallet.usd < usdPrice) {
      const shortfallUsd = usdPrice - wallet.usd;
      const usdPerNgn = rubToUsd / rubToNgn;
      const neededNgn = shortfallUsd / usdPerNgn;

      if (wallet.ngn < neededNgn) {
        notify(`Not enough balance. Fund your wallet with at least ₦${neededNgn.toFixed(0)} to continue.`);
        return;
      }

      setWallet((w) => ({ ngn: w.ngn - neededNgn, usd: w.usd + shortfallUsd }));
      notify(`Converted ₦${neededNgn.toFixed(0)} → $${shortfallUsd.toFixed(2)} to cover this purchase`);
    }

    setBuying(productId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/numbers/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: country.code, product: productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Could not complete the purchase");
        return;
      }
      setWallet((w) => ({ ...w, usd: w.usd - usdPrice }));
      const order = {
        id: data.id,
        country,
        service: "Virtual Number",
        product: productId,
        phone: data.phone,
        status: "pending",
        date: new Date().toLocaleDateString(),
        expiresAt: Date.now() + ORDER_DURATION_MS,
        usdPrice,
      };
      setOrders((prev) => [order, ...prev]);
      setActiveOrder(order);
      setShowServices(false);
      notify(`Real number issued: ${data.phone}`);
    } catch (err) {
      notify("Network error — the live server may be waking up, try again");
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="mx-5 mt-5 rounded-2xl p-5" style={{ ...glassCard }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ ...fontDisplay, color: T.text }}>Place an order</h2>
        <button onClick={() => setShowHistory(true)} className="flex items-center gap-1 text-sm font-medium" style={{ color: T.accent, ...fontBody }}>
          History <ChevronRight size={14} />
        </button>
      </div>
      <label className="text-xs font-medium mb-1.5 block" style={{ color: T.muted, ...fontBody }}>Country</label>
      <CountryPicker value={country} onChange={setCountry} countries={countries} loading={countriesLoading} />
      <button
        disabled={!country}
        onClick={openServices}
        className="w-full rounded-xl py-3.5 font-semibold mt-4 transition-opacity"
        style={{
          background: T.primary,
          color: "#FFFFFF",
          opacity: country ? 1 : 0.4,
          ...fontBody,
        }}
      >
        Place Order
      </button>

      {showServices && (
        <Sheet title={`Choose a service · ${country?.name}`} onClose={() => setShowServices(false)}>
          <div className="flex flex-col gap-3">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              if (!s.live) {
                return (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl p-4" style={{ background: T.surface2, border: `1px solid ${T.border}`, opacity: 0.6 }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: T.surface3 }}>
                      <Icon size={18} color={T.muted} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: T.text, ...fontBody }}>{s.label}</span>
                        <Badge>Coming soon</Badge>
                      </div>
                      <div className="text-xs" style={{ color: T.muted, ...fontBody }}>{s.desc}</div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={s.id} className="rounded-xl p-4" style={{ background: T.surface2, border: `1px solid ${T.border}` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(31,203,148,0.15)" }}>
                      <Icon size={18} color={T.primary} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: T.text, ...fontBody }}>{s.label}</span>
                        <Badge>Live</Badge>
                      </div>
                      <div className="text-xs" style={{ color: T.muted, ...fontBody }}>{s.desc}</div>
                    </div>
                  </div>

                  {productsLoading && (
                    <div className="text-xs py-2" style={{ color: T.mutedDim, ...fontBody }}>Loading...</div>
                  )}

                  {products && !productsLoading && (
                    <>
                      <VpnTip countryName={country?.name} />
                      <ProductList products={products} buying={buying} onBuy={buyProduct} rubToUsd={rubToUsd} rubToNgn={rubToNgn} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Sheet>
      )}

      {activeOrder && (
        <Sheet title="Your real order" onClose={() => setActiveOrder(null)}>
          <ActiveOrderPanel
            order={activeOrder}
            setOrder={setActiveOrder}
            wallet={wallet}
            setWallet={setWallet}
            userId={userId}
            setOrders={setOrders}
            notify={notify}
          />
        </Sheet>
      )}

      {showHistory && (
        <Sheet title="Order history" onClose={() => setShowHistory(false)}>
          {orders.length === 0 ? (
            <EmptyState label="No orders yet" sub="Your placed orders will line up here, node by node." />
          ) : (
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: T.surface2 }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: T.text, ...fontBody }}>{o.service}{o.phone ? ` · ${o.phone}` : ""}</div>
                    <div className="text-xs" style={{ color: T.muted, ...fontBody }}>{o.country?.flag} {o.country?.name} · {o.date}</div>
                  </div>
                  <Badge>{o.status || "active"}</Badge>
                </div>
              ))}
            </div>
          )}
        </Sheet>
      )}
    </div>
  );
}

function EmptyState({ label, sub }) {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-3">
      <LinkSignalMark size={40} />
      <div>
        <div className="text-sm font-semibold" style={{ color: T.text, ...fontBody }}>{label}</div>
        <div className="text-xs mt-1" style={{ color: T.mutedDim, ...fontBody }}>{sub}</div>
      </div>
    </div>
  );
}

function PromoStrip() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-2.5" style={{ background: T.primary }}>
      <span className="text-xs font-semibold" style={{ color: "#FFFFFF", ...fontBody }}>
        Join our Telegram for updates and exclusive offers 🚀
      </span>
      <button onClick={() => setDismissed(true)} style={{ color: "#FFFFFF" }}><X size={14} /></button>
    </div>
  );
}

function DashboardTab({ userName, userId, userEmail, wallet, setWallet, notify, rubToUsd, rubToNgn, orders }) {
  const [showConvert, setShowConvert] = useState(false);
  const [convertAmt, setConvertAmt] = useState("");
  const [paystackReady, setPaystackReady] = useState(false);
  const [showFund, setShowFund] = useState(false);
  const [fundAmt, setFundAmt] = useState("");

  // Load Paystack's real payment popup script once.
  useEffect(() => {
    const scriptId = "paystack-script";
    if (document.getElementById(scriptId)) {
      setPaystackReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.id = scriptId;
    script.onload = () => setPaystackReady(true);
    document.body.appendChild(script);
  }, []);

  // Opens Paystack's real, secure payment popup. Nothing about money ever
  // touches our own code directly — Paystack handles the card entry.
  const openFundPopup = (amt) => {
    if (!paystackReady || !window.PaystackPop) {
      notify("Payment window is still loading — try again in a second");
      return;
    }
    if (!amt || amt <= 0) return;
    setShowFund(false);

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: userEmail || `${userId}@swiftlink.guest`,
      amount: Math.round(amt * 100), // Paystack works in kobo
      currency: "NGN",
      callback: (response) => {
        // Paystack says it worked — now we ask our OWN backend to double
        // check with Paystack directly before crediting anything.
        fetch(`${BACKEND_URL}/api/payments/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference, userId }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.ngn_balance !== undefined) {
              setWallet((w) => ({ ...w, ngn: data.ngn_balance }));
              notify(`₦${amt.toLocaleString()} added to your wallet`);
            } else {
              notify(data.error || "Could not confirm payment");
            }
          })
          .catch(() => notify("Could not confirm payment — contact support"));
      },
      onClose: () => notify("Payment window closed"),
    });
    handler.openIframe();
  };

  const usdPerNgn = rubToUsd / rubToNgn;
  const convertPreviewUsd = (parseFloat(convertAmt) || 0) * usdPerNgn;

  const doConvert = () => {
    const amt = parseFloat(convertAmt) || 0;
    if (amt <= 0) return;
    if (wallet.ngn < amt) {
      notify("Not enough NGN balance to convert that much");
      return;
    }
    const usdAmount = amt * usdPerNgn;
    setWallet((w) => ({ ngn: w.ngn - amt, usd: w.usd + usdAmount }));
    notify(`Converted ₦${amt.toLocaleString()} → $${usdAmount.toFixed(2)}`);
    setConvertAmt("");
    setShowConvert(false);
  };

  return (
    <div className="px-5 lg:px-0 pt-5 lg:pt-8 pb-4">
      <h2 className="text-xl font-extrabold" style={{ ...fontDisplay, color: T.text }}>Hello {userName}</h2>
      <p className="mb-4" style={{ color: T.muted, ...fontBody, fontSize: 16 }}>Here's an overview of your account's recent activity.</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <button onClick={() => setShowFund(true)} className="rounded-xl py-3 font-semibold text-sm" style={{ background: T.primary, color: "#FFFFFF", ...fontBody }}>
          Fund Account
        </button>
        <button onClick={() => setShowConvert(true)} className="rounded-xl py-3 font-semibold text-sm" style={{ border: `1px solid ${T.primary}`, color: T.primary, ...fontBody }}>
          Convert Currency
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div className="rounded-xl p-4" style={{ ...glassCard }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: T.surface3 }}>
            <Wallet size={15} color={T.primary} />
          </div>
          <div className="text-xs mb-1" style={{ color: T.muted, ...fontBody }}>USD Balance</div>
          <div className="text-lg font-bold" style={fontMono}>${wallet.usd.toFixed(2)}</div>
        </div>
        <div className="rounded-xl p-4" style={{ ...glassCard }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: T.surface3 }}>
            <CreditCard size={15} color={T.accent} />
          </div>
          <div className="text-xs mb-1" style={{ color: T.muted, ...fontBody }}>NGN Balance</div>
          <div className="text-lg font-bold" style={fontMono}>₦{wallet.ngn.toLocaleString()}</div>
        </div>
        <div className="rounded-xl p-4" style={{ ...glassCard }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: T.surface3 }}>
            <PhoneCall size={15} color={T.primary} />
          </div>
          <div className="text-xs mb-1" style={{ color: T.muted, ...fontBody }}>Purchased Numbers</div>
          <div className="text-lg font-bold" style={fontMono}>{orders.filter((o) => o.service === "Virtual Number").length}</div>
        </div>
        <div className="rounded-xl p-4" style={{ ...glassCard }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: T.surface3 }}>
            <Users size={15} color={T.accent} />
          </div>
          <div className="text-xs mb-1" style={{ color: T.muted, ...fontBody }}>Purchased Accounts</div>
          <div className="text-lg font-bold" style={fontMono}>{orders.filter((o) => o.service === "Social Media").length}</div>
        </div>
      </div>

      <div
        className="rounded-xl p-5 relative overflow-hidden mb-5"
        style={{ background: `linear-gradient(135deg, #8B5CF6, #4C6FFF)` }}
      >
        <div className="relative z-10">
          <div className="mb-1" style={{ ...fontBold, fontSize: 18, color: "#FFFFFF" }}>Your one-stop shop<br />for digital services.</div>
          <p className="text-xs mb-3 max-w-[180px]" style={{ color: "rgba(255,255,255,0.85)", ...fontBody }}>
            Real numbers and real social media growth — all in one wallet.
          </p>
        </div>
        <div className="absolute -right-2 top-3 opacity-30"><Radio size={70} color="#FFFFFF" /></div>
      </div>

      <div className="rounded-2xl p-4" style={{ ...glassCard }}>
        <div className="text-sm font-semibold mb-3" style={{ color: T.text, ...fontBody }}>History</div>
        {orders.length === 0 ? (
          <div className="text-xs py-4 text-center" style={{ color: T.mutedDim, ...fontBody }}>No activity yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.slice(0, 8).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: T.surface3 }}>
                <div>
                  <div className="text-xs font-semibold" style={{ color: T.text, ...fontBody }}>{o.service}{o.product ? ` · ${o.product}` : ""}</div>
                  <div className="text-[11px]" style={{ color: T.muted, ...fontBody }}>{o.date}</div>
                </div>
                <Badge>{o.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {showFund && (
        <Sheet title="Fund your wallet" onClose={() => setShowFund(false)}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: T.muted, ...fontBody }}>Amount (NGN)</label>
          <input
            value={fundAmt}
            onChange={(e) => setFundAmt(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Enter amount"
            inputMode="numeric"
            className="w-full rounded-xl px-4 py-4 outline-none mb-3 text-lg font-bold"
            style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.text, ...fontMono }}
          />
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[500, 1000, 2000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setFundAmt(String(amt))}
                className="rounded-lg py-2 text-xs font-semibold"
                style={{
                  background: fundAmt === String(amt) ? T.primary : T.surface3,
                  color: fundAmt === String(amt) ? "#FFFFFF" : T.muted,
                  ...fontBody,
                }}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
          <button
            onClick={() => openFundPopup(parseFloat(fundAmt))}
            disabled={!fundAmt || parseFloat(fundAmt) <= 0}
            className="w-full rounded-xl py-3.5 font-semibold"
            style={{ background: T.primary, color: "#FFFFFF", ...fontBody, opacity: fundAmt ? 1 : 0.5 }}
          >
            Continue to Payment
          </button>
        </Sheet>
      )}

      {showConvert && (
        <Sheet title="Convert currency" onClose={() => setShowConvert(false)}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: T.muted, ...fontBody }}>Amount to convert (NGN)</label>
          <input
            value={convertAmt}
            onChange={(e) => setConvertAmt(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="e.g. 5000"
            className="w-full rounded-xl px-4 py-3.5 outline-none mb-3"
            style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.text, ...fontMono }}
          />
          <div className="rounded-xl p-4 mb-4 flex items-center justify-between" style={{ background: T.surface2 }}>
            <div style={fontMono}>
              <div className="text-xs mb-1" style={{ color: T.muted }}>You send</div>
              <div className="font-semibold" style={{ color: T.text }}>₦{(parseFloat(convertAmt) || 0).toLocaleString()}</div>
            </div>
            <RefreshCw size={16} color={T.muted} />
            <div style={fontMono}>
              <div className="text-xs mb-1" style={{ color: T.muted }}>You get</div>
              <div className="font-semibold" style={{ color: T.text }}>${convertPreviewUsd.toFixed(2)}</div>
            </div>
          </div>
          <button onClick={doConvert} className="w-full rounded-xl py-3.5 font-semibold" style={{ background: T.primary, color: "#FFFFFF", ...fontBody }}>
            Convert now
          </button>
        </Sheet>
      )}
    </div>
  );
}

// How much SwiftLink adds on top of JustAnotherPanel's own price. Unlike
// the flat ₦2,000 on numbers, social media orders vary hugely in size
// (100 followers vs 100,000), so a percentage markup makes more sense
// here. Change this one number to adjust your profit on every SMM order.
const SMM_MARKUP_PERCENT = 30;

function AccountsTab({ notify, userId, wallet, setWallet, rubToUsd, rubToNgn, orders, setOrders }) {
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/smm/services`);
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        notify("Could not load social media services right now");
        setServices([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const usdPerNgn = rubToUsd / rubToNgn;

  // Group the huge real service list into categories, like "Instagram
  // Followers" or "TikTok Likes" — picking a category first, then a
  // service, is much easier than scrolling one giant list.
  const categories = Array.from(new Set((services || []).map((s) => s.category))).sort();

  const servicesInCategory = (services || []).filter((s) => s.category === category);
  const filteredInCategory = query.length > 0
    ? servicesInCategory.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : servicesInCategory;

  // JAP's "rate" is the price in USD per 1000 units. This works out the
  // real Naira price for the exact quantity someone wants, plus your markup.
  const priceForQuantity = (service, qty) => {
    if (!service || !qty) return 0;
    const costUsd = (parseFloat(service.rate) / 1000) * qty;
    const costNgn = costUsd / usdPerNgn;
    return costNgn * (1 + SMM_MARKUP_PERCENT / 100);
  };

  const previewPrice = selected ? priceForQuantity(selected, parseFloat(quantity) || 0) : 0;

  const placeOrder = async () => {
    const qty = parseFloat(quantity);
    if (!selected || !link || !qty) {
      notify("Fill in the link and quantity first");
      return;
    }
    if (qty < Number(selected.min) || qty > Number(selected.max)) {
      notify(`Quantity must be between ${selected.min} and ${selected.max}`);
      return;
    }
    const price = priceForQuantity(selected, qty);
    if (wallet.ngn < price) {
      notify(`Not enough NGN balance. This order costs ₦${price.toFixed(0)}`);
      return;
    }

    setBuying(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/smm/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: selected.service, link, quantity: qty }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        notify(data.error || "Could not place this order");
        return;
      }
      setWallet((w) => ({ ...w, ngn: w.ngn - price }));
      setOrders((prev) => [
        {
          id: String(data.order),
          country: null,
          service: "Social Media",
          product: selected.name,
          phone: link,
          status: "processing",
          date: new Date().toLocaleDateString(),
        },
        ...prev,
      ]);
      notify(`Order placed! ID #${data.order}`);
      setSelected(null);
      setLink("");
      setQuantity("");
    } catch (err) {
      notify("Network error placing the order");
    } finally {
      setBuying(false);
    }
  };

  const accountOrders = orders.filter((o) => o.service === "Social Media");

  return (
    <div className="px-5 lg:px-0 pt-5 lg:pt-8 pb-4">
      <h2 className="mb-1" style={{ ...fontBold, fontSize: 20, color: T.text }}>Accounts</h2>
      <p className="mb-4" style={{ color: T.muted, ...fontBody, fontSize: 16 }}>
        Boost followers, likes, and views — or buy ready-made social accounts. Real orders, real delivery.
      </p>

      {loading && <div className="text-xs" style={{ color: T.mutedDim, ...fontBody }}>Loading live services...</div>}

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
        <div>
          {!loading && !category && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
              {categories.slice(0, 30).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="rounded-lg px-3 py-3 text-left"
                  style={{ ...glassCard }}
                >
                  <span className="text-xs font-semibold" style={{ color: T.text, ...fontBody }}>{c}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && category && (
            <div className="mb-4">
              <button
                onClick={() => { setCategory(null); setQuery(""); }}
                className="flex items-center gap-1 text-xs font-medium mb-3"
                style={{ color: T.accent, ...fontBody }}
              >
                <ChevronRight size={12} style={{ transform: "rotate(180deg)" }} /> Back to categories
              </button>

              <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-3" style={{ ...glassCard }}>
                <Search size={14} color={T.mutedDim} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search within ${category}...`}
                  className="bg-transparent outline-none text-sm w-full"
                  style={{ ...fontBody, color: T.text }}
                />
              </div>

              <div className="flex flex-col gap-2">
                {filteredInCategory.slice(0, 40).map((s) => (
                  <button
                    key={s.service}
                    onClick={() => { setSelected(s); setQuantity(""); setLink(""); }}
                    className="w-full flex items-center justify-between rounded-lg px-4 py-3 text-left"
                    style={{ ...glassCard }}
                  >
                    <div className="flex-1 pr-2">
                      <div className="text-xs font-semibold" style={{ color: T.text, ...fontBody }}>{s.name}</div>
                      <div className="text-[11px]" style={{ color: T.mutedDim, ...fontBody }}>Min {s.min} · Max {s.max}</div>
                    </div>
                    <ChevronRight size={14} color={T.mutedDim} />
                  </button>
                ))}
                {filteredInCategory.length === 0 && (
                  <div className="text-xs py-2" style={{ color: T.mutedDim, ...fontBody }}>No matching service found.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-4" style={{ ...glassCard }}>
          <div className="text-sm font-semibold mb-3" style={{ color: T.text, ...fontBody }}>Order History</div>
          {accountOrders.length === 0 ? (
            <div className="text-xs py-4 text-center" style={{ color: T.mutedDim, ...fontBody }}>No orders yet.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {accountOrders.slice(0, 10).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: T.surface3 }}>
                  <div className="flex-1 pr-2">
                    <div className="text-xs font-semibold" style={{ color: T.text, ...fontBody }}>{o.product}</div>
                    <div className="text-[11px] truncate" style={{ color: T.muted, ...fontBody }}>{o.phone} · {o.date}</div>
                  </div>
                  <Badge>{o.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <Sheet title={selected.name} onClose={() => setSelected(null)}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: T.muted, ...fontBody }}>Link or username</label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://instagram.com/yourpage"
            className="w-full rounded-xl px-4 py-3 outline-none mb-3"
            style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.text, ...fontBody }}
          />
          <label className="text-xs font-medium mb-1.5 block" style={{ color: T.muted, ...fontBody }}>
            Quantity (min {selected.min}, max {selected.max})
          </label>
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder={`e.g. ${selected.min}`}
            className="w-full rounded-xl px-4 py-3 outline-none mb-4"
            style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.text, ...fontMono }}
          />
          <div className="rounded-xl p-4 mb-4 flex items-center justify-between" style={{ background: T.surface2 }}>
            <span className="text-xs" style={{ color: T.muted, ...fontBody }}>Total price</span>
            <span className="text-lg font-bold" style={{ ...fontMono, color: T.accent }}>₦{previewPrice.toFixed(0)}</span>
          </div>
          <button
            onClick={placeOrder}
            disabled={buying}
            className="w-full rounded-xl py-3.5 font-semibold"
            style={{ background: T.primary, color: "#FFFFFF", ...fontBody }}
          >
            {buying ? "Placing order..." : "Place Order"}
          </button>
        </Sheet>
      )}
    </div>
  );
}

function ComingSoonTab({ title, description }) {
  const [show, setShow] = useState(true);
  return (
    <div className="px-5 lg:px-0 pt-5 lg:pt-8 pb-4 h-full">
      {!show && (
        <button onClick={() => setShow(true)} className="text-sm font-medium" style={{ color: T.accent, ...fontBody }}>
          View {title.toLowerCase()} status
        </button>
      )}
      {show && (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: T.surface2 }}>
            <Clock size={26} color={T.primary} />
          </div>
          <div>
            <div className="text-xl font-bold mb-2" style={{ ...fontDisplay, color: T.text }}>Coming Soon!</div>
            <p className="text-sm max-w-[240px]" style={{ color: T.muted, ...fontBody }}>
              {description}
            </p>
          </div>
          <button onClick={() => setShow(false)} className="rounded-xl px-6 py-3 font-semibold text-sm mt-2" style={{ background: T.primary, color: "#FFFFFF", ...fontBody }}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function NumbersTab({ notify, orders, setOrders, countries, countriesLoading, rubToUsd, rubToNgn, wallet, setWallet, userId }) {
  const [country, setCountry] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const [products, setProducts] = useState(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [buying, setBuying] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  const openSheet = async () => {
    setShowSheet(true);
    setProductsLoading(true);
    setProducts(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/numbers/products/${country.code}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      notify("Could not reach the live server for prices");
    } finally {
      setProductsLoading(false);
    }
  };

  const buyProduct = async (productId) => {
    const { usdPrice } = getRetailPrice(productId, rubToUsd, rubToNgn);

    if (wallet.usd < usdPrice) {
      const shortfallUsd = usdPrice - wallet.usd;
      const usdPerNgn = rubToUsd / rubToNgn;
      const neededNgn = shortfallUsd / usdPerNgn;

      if (wallet.ngn < neededNgn) {
        notify(`Not enough balance. Fund your wallet with at least ₦${neededNgn.toFixed(0)} to continue.`);
        return;
      }

      setWallet((w) => ({ ngn: w.ngn - neededNgn, usd: w.usd + shortfallUsd }));
      notify(`Converted ₦${neededNgn.toFixed(0)} → $${shortfallUsd.toFixed(2)} to cover this purchase`);
    }

    setBuying(productId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/numbers/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: country.code, product: productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Could not complete the purchase");
        return;
      }
      setWallet((w) => ({ ...w, usd: w.usd - usdPrice }));
      const order = {
        id: data.id,
        country,
        service: "Virtual Number",
        product: productId,
        phone: data.phone,
        status: "pending",
        date: new Date().toLocaleDateString(),
        expiresAt: Date.now() + ORDER_DURATION_MS,
        usdPrice,
      };
      setOrders((prev) => [order, ...prev]);
      setActiveOrder(order);
      setShowSheet(false);
      notify(`Real number issued: ${data.phone}`);
    } catch (err) {
      notify("Network error — the live server may be waking up, try again");
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="px-5 lg:px-0 pt-5 lg:pt-8 pb-4">
      <h2 className="mb-1" style={{ ...fontBold, fontSize: 20, color: T.text }}>Numbers</h2>
      <p className="mb-5" style={{ color: T.muted, ...fontBody, fontSize: 16 }}>
        Real, live phone numbers for WhatsApp, Instagram, TikTok, Facebook, Alibaba, surveys, and hundreds more — pick a country to see what's available.
      </p>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
        <div className="rounded-xl p-4 mb-4" style={{ ...glassCard }}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: T.muted, ...fontBody }}>Country</label>
          <CountryPicker value={country} onChange={setCountry} countries={countries} loading={countriesLoading} />
          <button
            disabled={!country}
            onClick={openSheet}
            className="w-full rounded-xl py-3.5 font-bold mt-4 transition-opacity"
            style={{ background: T.primary, color: "#FFFFFF", opacity: country ? 1 : 0.4, ...fontBody, fontSize: 15, fontWeight: 700 }}
          >
            Browse Services
          </button>
        </div>

        {orders.filter((o) => o.service === "Virtual Number").length > 0 && (
          <div className="rounded-xl p-4" style={{ ...glassCard }}>
            <div className="text-sm font-semibold mb-3" style={{ color: T.text, ...fontBody }}>Your recent numbers</div>
            <div className="flex flex-col gap-2">
              {orders.filter((o) => o.service === "Virtual Number").slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: T.surface3 }}>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: T.text, ...fontBody }}>{o.phone}</div>
                    <div className="text-[11px]" style={{ color: T.muted, ...fontBody }}>{o.product} · {o.country?.name}</div>
                  </div>
                  <Badge>{o.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showSheet && (
        <Sheet title={`Choose a service · ${country?.name}`} onClose={() => setShowSheet(false)}>
          <VpnTip countryName={country?.name} />
          {productsLoading && (
            <div className="text-xs py-2" style={{ color: T.mutedDim, ...fontBody }}>Loading...</div>
          )}
          {products && !productsLoading && (
            <ProductList products={products} buying={buying} onBuy={buyProduct} rubToUsd={rubToUsd} rubToNgn={rubToNgn} />
          )}
        </Sheet>
      )}

      {activeOrder && (
        <Sheet title="Your real order" onClose={() => setActiveOrder(null)}>
          <ActiveOrderPanel
            order={activeOrder}
            setOrder={setActiveOrder}
            wallet={wallet}
            setWallet={setWallet}
            userId={userId}
            setOrders={setOrders}
            notify={notify}
          />
        </Sheet>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Bottom nav                                                              */
/* ----------------------------------------------------------------------- */

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "esims", label: "eSIMs", icon: LayoutGrid },
    { id: "numbers", label: "Numbers", icon: PhoneCall },
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "accounts", label: "Accounts", icon: Users },
    { id: "giftcards", label: "Gift Cards", icon: CreditCard },
  ];
  return (
    <div className="grid grid-cols-5 py-2.5 sticky bottom-0 lg:hidden" style={{ background: T.ink, borderTop: `1px solid ${T.border}` }}>
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} className="flex flex-col items-center gap-1">
            <Icon size={19} color={active ? T.primary : T.mutedDim} />
            <span className="text-[10px]" style={{ color: active ? T.primary : T.mutedDim, ...fontBody, fontWeight: active ? 600 : 400 }}>
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  App                                                                     */
/* ----------------------------------------------------------------------- */

/* ----------------------------------------------------------------------- */
/*  Pricing — YOUR fixed retail prices. Customers never see 5sim's own      */
/*  cost or currency (RUB/USD-from-5sim) — only what you're actually        */
/*  charging, in Naira, with the Dollar equivalent shown alongside.         */
/* ----------------------------------------------------------------------- */

// Change these three numbers anytime to adjust what you charge. Every
// service falls into one of these three price tiers.
const RETAIL_PRICE_NGN = {
  whatsapp: 5000,
  facebook: 2500,
  instagram: 2500,
};
const RETAIL_PRICE_DEFAULT_NGN = 2000; // everything else (Telegram, Google, etc.)

// Backup rates used only if the live currency lookup fails — update these
// occasionally by checking "1 RUB to USD" / "1 RUB to NGN" on Google.
const FALLBACK_RUB_TO_USD = 0.0105;
const FALLBACK_RUB_TO_NGN = 18;

// Works out the Naira price you're charging for a given service, plus the
// matching Dollar amount — both always represent the exact same price,
// just shown in two currencies. This never looks at 5sim's own price.
function getRetailPrice(productKey, rubToUsdRate, rubToNgnRate) {
  const key = (productKey || "").toLowerCase();
  const ngnPrice = RETAIL_PRICE_NGN[key] ?? RETAIL_PRICE_DEFAULT_NGN;
  const usdPerNgn = rubToUsdRate / rubToNgnRate;
  const usdPrice = ngnPrice * usdPerNgn;
  return { ngnPrice, usdPrice };
}

// Turns a 2-letter country code like "ng" into its real flag emoji 🇳🇬
function isoToFlag(iso2) {
  if (!iso2 || iso2.length !== 2) return "🌐";
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

// Your private control room. Only reachable by adding ?admin=1 to the
// website address — customers will never stumble onto this by accident,
// and even if they do, the password gate below still blocks them.
function AdminDashboard() {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);

  const loadUsers = async (adminKey) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { "x-admin-key": adminKey },
      });
      const json = await res.json();
      setUsers(json.users || []);
    } catch (err) {
      // Non-fatal — the overview stats can still show even if this fails.
    }
  };

  const loadOverview = async (adminKey) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/overview`, {
        headers: { "x-admin-key": adminKey },
      });
      if (res.status === 401) {
        setError("Wrong password.");
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setUnlocked(true);
      await loadUsers(adminKey);
    } catch (err) {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSuspend = async (userId, currentlySuspended) => {
    setActioningId(userId);
    try {
      await fetch(`${BACKEND_URL}/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": key },
        body: JSON.stringify({ suspended: !currentlySuspended }),
      });
      await loadUsers(key);
    } finally {
      setActioningId(null);
    }
  };

  const deleteUser = async (userId, userLabel) => {
    if (!window.confirm(`Permanently delete ${userLabel}'s account, wallet, and order history? This cannot be undone.`)) {
      return;
    }
    setActioningId(userId);
    try {
      await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "x-admin-key": key },
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setActioningId(null);
    }
  };

  const withdrawFunds = async (userId, currency, currentBalance) => {
    const amountStr = window.prompt(
      `How much ${currency.toUpperCase()} do you want to withdraw from this user's wallet? (Current balance: ${currency === "ngn" ? "₦" : "$"}${currentBalance})`
    );
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return;

    setActioningId(userId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": key },
        body: JSON.stringify({ currency, amount }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Could not withdraw funds.");
        return;
      }
      await loadUsers(key);
    } finally {
      setActioningId(null);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: T.ink }}>
        {FONT_LINKS}
        <div className="w-full max-w-sm rounded-xl p-6" style={{ ...glassCard }}>
          <h1 className="mb-1" style={{ ...fontBold, fontSize: 22, color: T.text }}>Admin Dashboard</h1>
          <p className="mb-4 text-sm" style={{ color: T.muted, ...fontBody }}>Enter your private admin password.</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-xl px-4 py-3 mb-3 outline-none"
            style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.text, ...fontBody }}
          />
          {error && <div className="text-xs mb-3" style={{ color: T.danger, ...fontBody }}>{error}</div>}
          <button
            onClick={() => loadOverview(key)}
            disabled={loading || !key}
            className="w-full rounded-xl py-3 font-bold"
            style={{ background: T.primary, color: "#FFFFFF", ...fontBody, opacity: key ? 1 : 0.5 }}
          >
            {loading ? "Checking..." : "Unlock"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-8" style={{ background: T.ink }}>
      {FONT_LINKS}
      <h1 className="mb-6" style={{ ...fontBold, fontSize: 26, color: T.text }}>SwiftLink — Admin</h1>

      <div className="grid grid-cols-3 gap-3 mb-8 max-w-2xl">
        <div className="rounded-xl p-4" style={{ ...glassCard }}>
          <div className="text-xs mb-1" style={{ color: T.muted, ...fontBody }}>Customers</div>
          <div className="text-2xl font-bold" style={fontMono}>{data.userCount}</div>
        </div>
        <div className="rounded-xl p-4" style={{ ...glassCard }}>
          <div className="text-xs mb-1" style={{ color: T.muted, ...fontBody }}>Orders</div>
          <div className="text-2xl font-bold" style={fontMono}>{data.orderCount}</div>
        </div>
        <div className="rounded-xl p-4" style={{ ...glassCard }}>
          <div className="text-xs mb-1" style={{ color: T.muted, ...fontBody }}>Est. Revenue</div>
          <div className="text-2xl font-bold" style={{ ...fontMono, color: T.primary }}>₦{data.estimatedRevenueNgn.toLocaleString()}</div>
        </div>
      </div>

      <h2 className="mb-3" style={{ ...fontBold, fontSize: 16, color: T.text }}>Customers</h2>
      <div className="rounded-xl overflow-hidden max-w-5xl mb-8" style={{ ...glassCard }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" style={{ ...fontBody, color: T.text }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">NGN</th>
                <th className="p-3">USD</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const wallet = u.wallets?.[0] || u.wallets || {};
                const busy = actioningId === u.id;
                return (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3" style={fontMono}>₦{Number(wallet.ngn_balance || 0).toLocaleString()}</td>
                    <td className="p-3" style={fontMono}>${Number(wallet.usd_balance || 0).toFixed(2)}</td>
                    <td className="p-3">
                      {u.suspended ? <Badge>suspended</Badge> : <Badge>active</Badge>}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          disabled={busy}
                          onClick={() => toggleSuspend(u.id, u.suspended)}
                          className="px-2 py-1 rounded text-[10px] font-semibold"
                          style={{ border: `1px solid ${T.accent}`, color: T.accent }}
                        >
                          {u.suspended ? "Unsuspend" : "Suspend"}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => withdrawFunds(u.id, "ngn", Number(wallet.ngn_balance || 0))}
                          className="px-2 py-1 rounded text-[10px] font-semibold"
                          style={{ border: `1px solid ${T.primary}`, color: T.primary }}
                        >
                          Withdraw ₦
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => withdrawFunds(u.id, "usd", Number(wallet.usd_balance || 0))}
                          className="px-2 py-1 rounded text-[10px] font-semibold"
                          style={{ border: `1px solid ${T.primary}`, color: T.primary }}
                        >
                          Withdraw $
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => deleteUser(u.id, u.name || u.email)}
                          className="px-2 py-1 rounded text-[10px] font-semibold"
                          style={{ border: `1px solid ${T.danger}`, color: T.danger }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center" style={{ color: T.mutedDim }}>No customers yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="mb-3" style={{ ...fontBold, fontSize: 16, color: T.text }}>Recent orders</h2>
      <div className="rounded-xl overflow-hidden max-w-4xl" style={{ ...glassCard }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" style={{ ...fontBody, color: T.text }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                <th className="p-3">Customer</th>
                <th className="p-3">Country</th>
                <th className="p-3">Product</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td className="p-3">{o.users?.name || o.users?.email || o.user_id}</td>
                  <td className="p-3">{o.country_name}</td>
                  <td className="p-3 capitalize">{o.product}</td>
                  <td className="p-3" style={fontMono}>{o.phone}</td>
                  <td className="p-3"><Badge>{o.status}</Badge></td>
                  <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SwiftLinkApp() {
  // Visiting the site as yourswiftlinksite.com/?admin=1 opens your private
  // dashboard instead of the customer app.
  if (typeof window !== "undefined" && window.location.search.includes("admin")) {
    return <AdminDashboard />;
  }

  const [authed, setAuthed] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [tab, setTab] = useState("esims");
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState({ usd: 0, ngn: 0 });
  const [toast, setToast] = useState(null);
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [rubToUsd, setRubToUsd] = useState(FALLBACK_RUB_TO_USD);
  const [rubToNgn, setRubToNgn] = useState(FALLBACK_RUB_TO_NGN);
  const [showMenu, setShowMenu] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const prevOrdersLen = useRef(0);

  const notify = (text) => setToast(text);

  // Clears everything and sends the person back to the login screen —
  // their saved wallet and orders stay safe in the database either way.
  const handleLogout = () => {
    setAuthed(false);
    setUserName("");
    setUserId(null);
    setUserEmail(null);
    setWallet({ usd: 0, ngn: 0 });
    setOrders([]);
    setTab("esims");
    setShowMenu(false);
    prevOrdersLen.current = 0;
  };

  // Runs the moment someone logs in — saves/loads their real account
  // from the database, instead of starting from zero every time.
  const handleLogin = async ({ userId: id, name, email }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/account/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, name, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || "Could not log in." };
      }

      setUserName(name);
      setUserId(id);
      setUserEmail(email);
      setAuthed(true);

      if (data.wallet) {
        setWallet({ usd: Number(data.wallet.usd_balance) || 0, ngn: Number(data.wallet.ngn_balance) || 0 });
      }
      if (data.orders) {
        prevOrdersLen.current = data.orders.length;
        setOrders(
          data.orders.map((o) => ({
            id: o.id,
            country: { code: o.country_code, name: o.country_name, flag: "" },
            service: o.service,
            product: o.product,
            phone: o.phone,
            status: o.status,
            code: o.code,
            date: new Date(o.created_at).toLocaleDateString(),
          }))
        );
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: "Could not reach the server. Try again." };
    }
  };

  // Whenever the wallet changes, quietly save it to the database in the
  // background — so refreshing the page never loses a balance again.
  useEffect(() => {
    if (!userId) return;
    fetch(`${BACKEND_URL}/api/account/${userId}/wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usd: wallet.usd, ngn: wallet.ngn }),
    }).catch(() => {});
  }, [wallet, userId]);

  // Whenever a brand-new order appears at the top of the list, save just
  // that one order permanently.
  useEffect(() => {
    if (!userId) return;
    if (orders.length > prevOrdersLen.current && orders[0]) {
      fetch(`${BACKEND_URL}/api/account/${userId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orders[0]),
      }).catch(() => {});
    }
    prevOrdersLen.current = orders.length;
  }, [orders, userId]);

  // Pull today's real RUB → USD and RUB → NGN exchange rates in one call,
  // so prices and wallet conversions are accurate, not guessed numbers.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/RUB");
        const data = await res.json();
        if (data.rates) {
          if (data.rates.USD) setRubToUsd(data.rates.USD);
          if (data.rates.NGN) setRubToNgn(data.rates.NGN);
        }
      } catch (err) {
        // Falls back to FALLBACK_RUB_TO_USD / FALLBACK_RUB_TO_NGN — still works.
      }
    })();
  }, []);

  // Pull the real, live country list from your Railway backend once,
  // when the app first opens.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/numbers/countries`);
        const data = await res.json();
        const list = Object.entries(data)
          .map(([code, val]) => {
            const iso2 = val.iso ? Object.keys(val.iso)[0] : null;
            return { code, name: val.text_en || code, flag: isoToFlag(iso2) };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        if (!cancelled && list.length > 0) setCountries(list);
      } catch (err) {
        // Falls back to the small local list — the app still works.
      } finally {
        if (!cancelled) setCountriesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen w-full" style={{ background: T.ink }}>
        {FONT_LINKS}
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: T.ink }}>
      {FONT_LINKS}
      <Header
        onMenu={() => setShowMenu(true)}
        onNotif={() => setShowNotifications(true)}
        notifCount={Math.min(orders.length, 9)}
        tab={tab}
        setTab={setTab}
      />
      <div className="flex-1 overflow-y-auto w-full max-w-[1300px] mx-auto lg:px-8 lg:w-full">
        {tab === "esims" && (
          <ComingSoonTab
            title="eSIMs"
            description="Real eSIM activation is on the way. Head to the Numbers tab for live virtual numbers right now."
          />
        )}
        {tab === "numbers" && (
          <NumbersTab
            notify={notify}
            orders={orders}
            setOrders={setOrders}
            countries={countries}
            countriesLoading={countriesLoading}
            rubToUsd={rubToUsd}
            rubToNgn={rubToNgn}
            wallet={wallet}
            setWallet={setWallet}
            userId={userId}
          />
        )}
        {tab === "dashboard" && (
          <DashboardTab
            userName={userName}
            userId={userId}
            userEmail={userEmail}
            wallet={wallet}
            setWallet={setWallet}
            notify={notify}
            rubToUsd={rubToUsd}
            rubToNgn={rubToNgn}
            orders={orders}
          />
        )}
        {tab === "accounts" && (
          <AccountsTab
            notify={notify}
            userId={userId}
            wallet={wallet}
            setWallet={setWallet}
            rubToUsd={rubToUsd}
            rubToNgn={rubToNgn}
            orders={orders}
            setOrders={setOrders}
          />
        )}
        {tab === "giftcards" && (
          <ComingSoonTab
            title="Gift Cards"
            description="We're building a smooth gift card marketplace. Thanks for your patience."
          />
        )}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
      {toast && <Toast text={toast} onDone={() => setToast(null)} />}
      {showMenu && (
        <MenuPanel
          onClose={() => setShowMenu(false)}
          userName={userName}
          userEmail={userEmail}
          tab={tab}
          setTab={setTab}
          onLogout={handleLogout}
          onFaq={() => setShowFaq(true)}
        />
      )}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} orders={orders} />
      )}
      {showFaq && <FAQPanel onClose={() => setShowFaq(false)} />}
    </div>
  );
}
