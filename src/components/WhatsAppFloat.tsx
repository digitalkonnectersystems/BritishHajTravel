"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getSiteIdentity } from "@/actions/pageActions";


const DEFAULT_LABEL = "Chat on WhatsApp";

export default function WhatsAppFloat({ initialIdentity }: { initialIdentity?: any }) {
  const pathname = usePathname();
  const [href, setHref] = useState(initialIdentity?.whatsappFloatUrl || "");
  const [label, setLabel] = useState(initialIdentity?.whatsappFloatLabel || DEFAULT_LABEL);

  useEffect(() => {
    // Respond to live identity updates dispatched from the admin panel.
    const onUpdate = () => {
      getSiteIdentity().then((data) => {
        setHref(data?.whatsappFloatUrl || "");
        if (data?.whatsappFloatLabel) setLabel(data.whatsappFloatLabel);
      });
    };
    window.addEventListener("identity_updated", onUpdate);
    return () => window.removeEventListener("identity_updated", onUpdate);
  }, []);

  if (
    !href ||
    pathname?.startsWith("/admin") ||
    pathname === "/letstravel" ||
    pathname?.startsWith("/letstravel/") ||
    pathname === "/login" ||
    pathname?.startsWith("/login/")
  ) {
    return null;
  }

  return (
    <a
      href={href}
      className="fixed bottom-[30px] right-[30px] z-[100] w-[60px] h-[60px] max-[576px]:bottom-[20px] max-[576px]:w-[25px] max-[576px]:h-[25px] max-[576px]:right-[20px]"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
    >
      <Image
        src="/img/whatsapp.svg"
        alt={label}
        width={60}
        height={60}
        className="w-full h-full object-contain"
      />
    </a>
  );
}
