export default function ContactMapsSection({ data }: { data?: any }) {
  const headTitle = data?.headTitle || "Head Office";
  const headAddress = data?.headAddress || "1325 Eglinton Ave E Suite Number 218, Mississauga, ON L4W 4L9, Canada";
  const headMap = data?.headMapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.1637775952674!2d-79.62528662340336!3d43.63487945347209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b3897316b3bdb%3A0xc6758691a49d5a8e!2sKing%20Travel%20Can%20Ltd%20-%20Mississauga!5e0!3m2!1sen!2sca!4v1710000000000!5m2!1sen!2sca";

  const branchTitle = data?.branchTitle || "Branch Office";
  const branchAddress = data?.branchAddress || "22 Ontario St S, Milton, ON L9T 2M6, Canada";
  const branchMap = data?.branchMapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2893.6521568283307!2d-79.87981462340915!3d43.5177187791263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b6fa0d880eae9%3A0xc57548acb421436c!2s22%20Ontario%20St%20S%2C%20Milton%2C%20ON%20L9T%202M6%2C%20Canada!5e0!3m2!1sen!2sca!4v1710000000001!5m2!1sen!2sca";

  return (
    <div className="flex flex-col gap-6 h-full justify-between">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100/80 p-4 flex-1 flex flex-col min-h-[250px]">
        <div className="mb-3 pl-2">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary flex items-center gap-2">
            <i className="fa-solid fa-building text-gold"></i> {headTitle}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{headAddress}</p>
        </div>
        <iframe
          src={headMap}
          className="w-full h-full min-h-[200px] rounded-2xl border-none flex-1"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100/80 p-4 flex-1 flex flex-col min-h-[250px]">
        <div className="mb-3 pl-2">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary flex items-center gap-2">
            <i className="fa-solid fa-building text-gold"></i> {branchTitle}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{branchAddress}</p>
        </div>
        <iframe
          src={branchMap}
          className="w-full h-full min-h-[200px] rounded-2xl border-none flex-1"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}

