import Hero from "@/components/home/Hero";
import AutoHideHeader from "@/components/header/AutoHideHeader";

export default function Home() {
  return (
    <>
      <AutoHideHeader hideLanguageSwitch />
      <main>
        <Hero lang="en" />
      </main>
    </>
  );
}
