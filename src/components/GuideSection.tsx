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
    <section className="guide-section bg-white py-10 md:py-14">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 px-5 md:grid-cols-2 lg:grid-cols-3">
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
                <span className="guide-section__button">
                  {step.buttonLabel || buttonLabel}
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </>
          );

          return step.slug && step.slug !== "#" ? (
            <Link href={step.slug} key={`${step.title || "step"}-${index}`} className="guide-section__card">
              {content}
            </Link>
          ) : (
            <article key={`${step.title || "step"}-${index}`} className="guide-section__card">
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
