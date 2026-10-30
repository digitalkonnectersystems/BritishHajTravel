export default function ContactMapsSection({ data }: { data?: any }) {
  const headTitle = data?.headTitle || "Head Office";
  const headAddress = data?.headAddress || "";
  const headMap = data?.headMapUrl || "";

  const branchTitle = data?.branchTitle || "Branch Office";
  const branchAddress = data?.branchAddress || "";
  const branchMap = data?.branchMapUrl || "";

  if (!headMap && !branchMap) return null;
  return (
    <div className="flex flex-col gap-6 h-full justify-between">
      {headMap ? <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100/80 p-4 flex-1 flex flex-col min-h-[250px]">
        <div className="mb-3 pl-2">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary flex items-center gap-2">
            <i className="fa-solid fa-building text-red"></i> {headTitle}
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
      </div> : null}

      {branchMap ? <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100/80 p-4 flex-1 flex flex-col min-h-[250px]">
        <div className="mb-3 pl-2">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary flex items-center gap-2">
            <i className="fa-solid fa-building text-red"></i> {branchTitle}
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
      </div> : null}
    </div>
  );
}

