export default function ContactInfoCardsSection({ data }: { data?: any }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 relative z-20 -mt-20 md:-mt-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Locations */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100/80 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-gold flex items-center justify-center text-xl mb-4">
            <i className="fa-solid fa-location-dot"></i>
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary mb-4">
            {data?.card1Title || "OUR LOCATIONS"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-center sm:text-left border-t border-slate-100 pt-4 mt-auto">
            {/* Head Office */}
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-wide mb-1">HEAD OFFICE</span>
              <a
                className="text-xs font-medium leading-relaxed text-slate-600 hover:text-emerald-800 transition no-underline"
                href="https://maps.app.goo.gl/1BRUoBxtt4wWw58t6"
                target="_blank"
                rel="noopener noreferrer"
              >
                {data?.headAddress || "1325 Eglinton Ave E Suite Number 218, Mississauga, ON L4W 4L9, UK"}
              </a>
            </div>

            {/* Branch Office */}
            <div className="flex flex-col items-center sm:items-start border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-wide mb-1">BRANCH OFFICE</span>
              <a
                className="text-xs font-medium leading-relaxed text-slate-600 hover:text-emerald-800 transition no-underline"
                href="https://maps.app.goo.gl/U6B4fci2Jas4sh6S6"
                target="_blank"
                rel="noopener noreferrer"
              >
                {data?.branchAddress || "22 Ontario St S, Milton, ON L9T 2M6, UK"}
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: Phone Support */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100/80 flex flex-col items-center text-center justify-between">
          <div className="flex flex-col items-center w-full">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-phone"></i>
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary mb-4">
              {data?.card2Title || "24/7 SUPPORT"}
            </h3>
            <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4 w-full">
              {(() => {
                const supportList: any[] = (data?.supportItems && Array.isArray(data.supportItems) && data.supportItems.length > 0)
                  ? data.supportItems
                  : [
                    { phone: data?.phone1 || '+1 800-844-5464', label: '', text: data?.phone1 || '+1 800-844-5464', url: `tel:${(data?.phone1 || '+18008445464').replace(/\s+/g, '')}`, openInNewTab: false },
                    { phone: data?.phone2 || '+1 905-624-8555', label: '', text: data?.phone2 || '+1 905-624-8555', url: `tel:${(data?.phone2 || '+19056248555').replace(/\s+/g, '')}`, openInNewTab: false },
                    { phone: data?.phone3 || '+1 905-624-8344', label: '', text: data?.phone3 || '+1 905-624-8344', url: `tel:${(data?.phone3 || '+19056248344').replace(/\s+/g, '')}`, openInNewTab: false },
                  ];

                return supportList
                  .filter((item: any) => item && (item.phone || item.text || item.url))
                  .map((item: any, idx: number) => {
                    const phoneDisplay = item.phone || item.text || '';
                    const labelDisplay = item.label ? ` - ${item.label}` : '';
                    const actionUrl = item.url || (phoneDisplay.includes('@') ? `mailto:${phoneDisplay.trim()}` : `tel:${phoneDisplay.replace(/[^0-9+]/g, '')}`);

                    return (
                      <a
                        key={idx}
                        className="text-sm hover:text-emerald-800 transition font-semibold no-underline flex items-center justify-center gap-1.5 flex-wrap"
                        href={actionUrl}
                        target={item.openInNewTab ? "_blank" : undefined}
                        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                      >
                        <span className="text-ink-lt font-sans tracking-tight">{phoneDisplay}</span>
                        {item.label && (
                          <span className="text-ink-lt font-medium text-xs inline-flex items-center">
                            {item.label}
                          </span>
                        )}
                      </a>
                    );
                  });
              })()}
            </div>
          </div>
        </div>

        {/* Card 3: Email & Socials */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100/80 flex flex-col items-center text-center justify-between">
          <div className="flex flex-col items-center w-full mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-envelope"></i>
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary mb-2">
              {data?.card3Title || "EMAIL US"}
            </h3>
            <a href={`mailto:${data?.email || "saudivisa@kingtravelcan.com"}`} className="text-sm text-slate-700 hover:text-emerald-800 transition break-all font-semibold no-underline">
              {data?.email || "saudivisa@kingtravelcan.com"}
            </a>
          </div>

          <div className="w-full border-t border-slate-100 pt-3 flex flex-col items-center">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-2.5">FOLLOW US</h4>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(() => {
                const socialList: any[] = (data?.socialLinks && Array.isArray(data.socialLinks) && data.socialLinks.length > 0)
                  ? data.socialLinks
                  : [
                    { name: 'Facebook', url: data?.facebookUrl || 'https://www.facebook.com/kingtravelcan', icon: '/img/fb.svg', openInNewTab: true },
                    { name: 'Instagram', url: data?.instagramUrl || 'https://www.instagram.com/kingtravelcan/', icon: '/img/insta.svg', openInNewTab: true },
                    { name: 'LinkedIn', url: data?.linkedinUrl || 'https://ca.linkedin.com/company/kingtravelcan', icon: '/img/in.svg', openInNewTab: true },
                    { name: 'TikTok', url: data?.tiktokUrl || 'https://www.tiktok.com/@kingtravelcan', icon: '/img/tik.svg', openInNewTab: true },
                    { name: 'Twitter X', url: data?.twitterUrl || 'https://twitter.com/kingtravelcan', icon: '/img/x.svg', openInNewTab: true },
                    { name: 'Pinterest', url: data?.pinterestUrl || 'https://pinterest.com/kingtravelcan', icon: '/img/pinterest.svg', openInNewTab: true },
                  ];

                return socialList
                  .filter((item: any) => item && (item.url || item.icon))
                  .map((item: any, sIdx: number) => (
                    <a
                      key={sIdx}
                      href={item.url || '#'}
                      target={item.openInNewTab ? "_blank" : "_self"}
                      rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                      title={item.name || 'Social Link'}
                      className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center no-underline p-1.5 group shadow-xs"
                    >
                      {item.icon ? (
                        <img
                          src={item.icon}
                          alt={item.name || 'Social Icon'}
                          className="w-full h-full object-contain filter"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-700 group-hover:text-white transition-colors">
                          {item.name?.slice(0, 2) || '🔗'}
                        </span>
                      )}
                    </a>
                  ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

