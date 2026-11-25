/**
 * It tells React to render LandingExperience and passes the visitor’s language—English or Chinese—to it.
 */
'use client';
import LandingExperience from './LandingExperience'

export default function Hero({ lang }: { lang: string }) {
  return <LandingExperience lang={lang} />;
}
