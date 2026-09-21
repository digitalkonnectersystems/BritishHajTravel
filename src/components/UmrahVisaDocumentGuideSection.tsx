"use client";

import Image from "next/image";

const defaultCards = [
  { image: "/img/saudi-visa-2.webp", tone: "good", title: "Good Example", bullets: ["Shows all 4 corners", "All details are fully legible", "Passport is signed"] },
  { image: "/img/saudi-visa-2.webp", tone: "bad", title: "Photo is Cut Off", bullets: ["A portion of your passport isn't visible."] },
  { image: "/img/saudi-visa-2.webp", tone: "bad", title: "Missing Signature", bullets: ["Passport is not signed.", "If your signature is on a separate page, make sure it's in the photo."] },
  { image: "/img/saudi-visa-2.webp", tone: "bad", title: "Text is Hard to Read", bullets: ["Light reflections", "Shadows", "Blurry text", "Please take your photo in a well-lit area."] },
];

export default function UmrahVisaDocumentGuideSection({ data = {} }: { data?: any }) {
  const cards = Array.isArray(data.cards) && data.cards.length > 0 ? data.cards : defaultCards;
  return (
    <section className="umrah-visa-document-guide">
      <div className="umrah-visa-document-guide-inner">
        <h2 dangerouslySetInnerHTML={{ __html: data.title || "Document / Passport <span>Correct Format</span>" }} />
        <p>{data.subtitle || "Please check the examples below to make sure your document is clear and complete."}</p>
        <div className="umrah-visa-document-cards">
          {cards.map((card: any, index: number) => (
            <article className={`umrah-visa-document-card ${card.tone === "good" ? "is-good" : "is-bad"}`} key={index}>
              <div className="umrah-visa-document-image"><Image src={card.image || "/img/saudi-visa-2.webp"} alt={card.imageAlt || card.title || "Passport example"} fill sizes="(max-width: 800px) 100vw, 25vw" className="object-contain" unoptimized /></div>
              <h3>{card.title || "Document example"}</h3>
              <ul>{(Array.isArray(card.bullets) ? card.bullets : []).map((bullet: string, bulletIndex: number) => <li key={bulletIndex}>{bullet}</li>)}</ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
