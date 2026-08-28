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
  const { session } = useAuth();

  const [language, setLanguageState] =
    useState<LanguageCode>("en");

  useEffect(() => {
    let cancelled = false;

    async function loadLanguagePreference() {
      if (!session?.user.id) {
        setLanguageState("en");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Language preference loading error:",
          error
        );
        return;
      }

      if (cancelled) {
        return;
      }

      if (
        data?.preferred_language === "en" ||
        data?.preferred_language === "hi"
      ) {
        setLanguageState(data.preferred_language);
      } else {
        setLanguageState("en");
      }
    }

    loadLanguagePreference();

    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  async function setLanguage(
    nextLanguage: LanguageCode
  ) {
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