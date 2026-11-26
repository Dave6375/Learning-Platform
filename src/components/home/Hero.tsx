/**
 * It tells React to render LandingExperience and passes the visitor’s language—English or Chinese—to it.
 */
'use client';
import LandingExperience from './LandingExperience'
import {Local} from "@/lib/trilingual";

export default function Hero({ lang }: { lang: Local }) {
  return (
      <LandingExperience lang={lang}/>
  );
}
