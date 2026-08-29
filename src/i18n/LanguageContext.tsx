import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getTranslations,
  type LanguageCode,
} from "./index";

import { useAuth } from "../components/auth/AuthProvider";
import { supabase } from "../services/supabase";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: ReturnType<typeof getTranslations>;
}

const LanguageContext =
  createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({
  children,
}: LanguageProviderProps) {
  const {
    session,
    loading: authLoading,
  } = useAuth();

  const [language, setLanguageState] =
    useState<LanguageCode>("en");

  const [languageLoading, setLanguageLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadLanguagePreference() {
      if (authLoading) {
        return;
      }

      if (!session?.user.id) {
        if (!cancelled) {
          setLanguageState("en");
          setLanguageLoading(false);
        }

        return;
      }

      setLanguageLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", session.user.id)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Language preference loading error:",
          error
        );

        setLanguageState("en");
        setLanguageLoading(false);

        return;
      }

      const savedLanguage =
        data?.preferred_language === "en" ||
        data?.preferred_language === "hi"
          ? data.preferred_language
          : "en";

      setLanguageState(savedLanguage);
      setLanguageLoading(false);
    }

    loadLanguagePreference();

    return () => {
      cancelled = true;
    };
  }, [authLoading, session?.user.id]);

  async function setLanguage(
    nextLanguage: LanguageCode
  ) {
    if (nextLanguage === language) {
      return;
    }

    setLanguageState(nextLanguage);

    if (!session?.user.id) {
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        preferred_language: nextLanguage,
      })
      .eq("id", session.user.id);

    if (error) {
      console.error(
        "Language preference saving error:",
        error
      );
    }
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: getTranslations(language),
    }),
    [language, session?.user.id]
  );

  if (authLoading || languageLoading) {
    return (
      <div className="min-h-screen bg-slate-950" />
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}