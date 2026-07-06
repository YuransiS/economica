"use client";

import { useState, useEffect } from "react";
import { useUTMs } from "@/hooks/useUTMs";
import { motion } from "framer-motion";
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { validatePhoneNumber } from "@/utils/phone";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwYe3BwbCjBwKPpTq5UR8HKJ2wtunOn97tWzDaY3pbJVCkGXto5jxOYgtnmwemavEW7ow/exec";
const SHEET_ID = "1717964025";
const REDIRECT_URL = "https://t.me/+8YhpUFVIVDExMDcy";

interface LeadFormProps {
  title?: string;
  onComplete?: () => void;
  webhookUrl?: string;
  redirectUrl?: string;
  targetSheet?: string;
  pixelEventName?: string;
  pixelEventContent?: string;
}

export default function LeadForm({ 
  title = "Забронювати місце", 
  onComplete,
  webhookUrl = GOOGLE_SCRIPT_URL,
  redirectUrl = REDIRECT_URL,
  targetSheet,
  pixelEventName = "Lead",
  pixelEventContent = "Face Detox Intensive"
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState("ua");
  const utms = useUTMs();

  useEffect(() => {
    // Detect country by IP
    fetch("/api/country")
      .then((res) => res.json())
      .then((data) => {
        if (data.country) {
          setCountry(data.country.toLowerCase());
        }
      })
      .catch(() => {
        // Fallback to Ukraine if detection fails
        setCountry("ua");
      });
  }, []);

  const validatePhone = (phone: string) => {
    return validatePhoneNumber(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePhone(phone)) {
      setError("Будь ласка, введіть коректний номер телефону");
      return;
    }

    if (!telegram.trim()) {
      setError("Будь ласка, введіть ваш нік у Telegram");
      return;
    }

    if (telegram.includes("@") && telegram.includes(".") && !telegram.startsWith("@")) {
      setError("Будь ласка, введіть ваш нік у Telegram (наприклад, @username), а не Email");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      phone: "+" + phone,
      telegram,
      sheetId: SHEET_ID,
      targetSheet,
      isFree: true,
      utm_source: utms.source,
      utm_medium: utms.medium,
      utm_campaign: utms.campaign,
      utm_content: utms.content,
      utm_term: utms.term,
      date: new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kiev" }),
    };

    try {
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", pixelEventName, { content_name: pixelEventContent });
      }

      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSuccess(true);
      if (onComplete) onComplete();
      setTimeout(() => { window.location.href = redirectUrl; }, 2500);

    } catch (error) {
      console.error("Submission failed", error);
      setError("Виникла помилка. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 rounded-[2.5rem] text-center flex flex-col items-center justify-center min-h-[400px]"
      >
        <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="text-brand w-10 h-10" />
        </div>
        <h3 className="text-3xl font-bold text-dark mb-4">Дякуємо за реєстрацію!</h3>
        <p className="text-dark/70 mb-8 text-lg">Зараз ми перенаправимо вас у Telegram канал...</p>
        <a href={redirectUrl} className="btn-premium w-full">
          Перейти зараз <Send className="w-5 h-5" />
        </a>
      </motion.div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-brand/20 to-brand/5 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
      <form 
        onSubmit={handleSubmit} 
        className="relative glass p-6 md:p-10 rounded-[2.5rem] flex flex-col gap-6 shadow-2xl"
      >
        <div className="text-center mb-4">
          <h3 className="text-2xl md:text-3xl font-bold text-dark mb-2">{title}</h3>
          <p className="text-dark/50 text-sm">Введіть ваші дані для доступу</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Ваше ім'я"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-brand/10 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:bg-white transition-all text-dark placeholder:text-dark/30"
            />
          </div>
          
          <div className="phone-input-container">
            <PhoneInput
              country={country}
              value={phone}
              onChange={(val) => setPhone(val)}
              inputClass="!w-full !h-auto !py-4 !px-16 !rounded-2xl !bg-white/50 !border !border-brand/10 !text-dark !text-base !font-sans"
              buttonClass="!bg-transparent !border-none !rounded-l-2xl !pl-4"
              dropdownClass="!rounded-2xl !shadow-2xl"
              placeholder="Ваш номер телефону"
            />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Нік у Telegram (н-р: @username)"
              required
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-brand/10 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:bg-white transition-all text-dark placeholder:text-dark/30"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm px-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-premium w-full mt-4"
        >
          {loading ? <Loader2 className="animate-spin" /> : <>Зареєструватися <Send className="w-5 h-5" /></>}
        </button>
        
        <p className="text-[10px] text-dark/40 text-center uppercase tracking-widest">
          Ваші дані захищені наскрізним шифруванням
        </p>
      </form>

      <style jsx global>{`
        .phone-input-container .react-tel-input .form-control {
          font-family: inherit;
          font-size: 1rem;
        }
        .phone-input-container .react-tel-input .flag-dropdown {
          background: transparent !important;
          border: none !important;
        }
        .phone-input-container .react-tel-input .selected-flag:hover {
          background: rgba(0,0,0,0.05) !important;
          border-radius: 1rem 0 0 1rem;
        }
      `}</style>
    </div>
  );
}
