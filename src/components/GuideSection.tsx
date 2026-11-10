"use client";

import Link from "next/link";
import DynamicIcon from "@/components/ui/DynamicIcon";

type GuideStep = {
  number?: number | string;
  icon?: string;
  title?: string;
  detail?: string;
  description?: string;
  buttonLabel?: string;
  slug?: string;
};

const defaultSteps: GuideStep[] = [
  { number: 1, icon: "FilePenLine", title: "Registration", detail: "Create your account and get started in just a few clicks.", slug: "#" },
  { number: 2, icon: "WalletCards", title: "Verification & eWallet", detail: "Verify your identity and set up your eWallet securely.", slug: "#" },
  { number: 3, icon: "Package", title: "Choosing Package Category", detail: "Select the package category that fits your needs.", slug: "#" },
  { number: 4, icon: "ShoppingCart", title: "Purchasing a Package", detail: "Complete your purchase and activate your package.", slug: "#" },
  { number: 5, icon: "Fingerprint", title: "Submitting Biometrics", detail: "Provide your biometric details for added security.", slug: "#" },
  { number: 6, icon: "HeartPulse", title: "Health", detail: "Access your health services and stay well.", slug: "#" },
];

export default function GuideSection({ data = {} }: { data?: any }) {
  const selectedGuideIds = Array.isArray(data.guideIds) ? data.guideIds : [];
  const managedGuides: GuideStep[] = Array.isArray(data.guides)
    ? data.guides.filter((guide: any) => guide.guideCategory === data.guideCategory && (selectedGuideIds.length === 0 || selectedGuideIds.includes(guide.id))).map((guide: any) => {
      const card = guide.guideCard || {};
      return { number: card.number || 1, icon: card.icon || 'FileText', title: guide.title, detail: card.detail || guide.metaDescription || '', buttonLabel: card.buttonLabel, slug: guide.slug };
    })
    : [];
  const steps: GuideStep[] = managedGuides.length > 0 ? managedGuides : (Array.isArray(data.steps) && data.steps.length > 0 ? data.steps : defaultSteps);
  const buttonLabel = data.buttonLabel || "Learn More";

  return (
    <section className="guide-section">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 px-5 md:p-6 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => {
          const number = step.number || index + 1;
          const detail = step.detail || step.description || "";
          const content = (
            <>
              <div className="guide-section__icon">
                <DynamicIcon name={step.icon || "FileText"} aria-hidden="true" strokeWidth={1.8} />
              </div>
              <div className="guide-section__content">
                <p className="guide-section__step">Step {number}</p>
                <h3 className="guide-section__title">{step.title || "Guide step"}</h3>
                <p className="guide-section__detail">{detail}</p>
                <span className="flex justify-center items-center self-start py-3 px-4 gap-2 text-center text-xs font-black rounded-md uppercase tracking-widest transition-colors block border-2 border-transparent cursor-pointer bg-red hover:bg-white hover:border-red text-white hover:text-red">
                  {step.buttonLabel || buttonLabel}
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </>
          );

          return step.slug && step.slug !== "#" ? (
            <Link href={step.slug} key={`${step.title || "step"}-${index}`} className="guide-section__card rounded-2xl border border-slate-200">
              {content}
            </Link>
          ) : (
            <article key={`${step.title || "step"}-${index}`} className="guide-section__card rounded-2xl border border-slate-200">
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
