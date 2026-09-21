"use client";

import DynamicSiteForm from "@/components/DynamicSiteForm";
import DynamicIcon from "@/components/ui/DynamicIcon";

const defaultRequirements = [
  { icon: "FileText", title: "All Nationality Passport Holders", description: "Passport copy in PDF format." },
  { icon: "Image", title: "Photo", description: "Passport size photo with white background (1)." },
  { icon: "Contact", title: "Non UK-British Passport Holders", description: "UK Visa BRP card front page required (Biometric UK Residence Permit)." },
  { icon: "CalendarDays", title: "Passport Validity", description: "Your passport must be valid for at least 7 months from the date of departure." },
  { icon: "Fingerprint", title: "Saudi Biometric Application", description: "Fingerprints confirmation is compulsory for all nationalities (including British-UK passport holders)." },
  { icon: "Smartphone", title: "Mobile Application", description: "Both iOS users and Android users can use this application." },
];

const defaultFormFields = [
  { id: "name", label: "Name", type: "text", placeholder: "Enter your full name", required: true },
  { id: "email", label: "Email", type: "email", placeholder: "Enter your email address", required: true },
  { id: "mobile", label: "Mobile Number", type: "tel", placeholder: "Enter your mobile number", required: true },
  { id: "quantity", label: "Quantity", type: "number", placeholder: "Enter number of travellers", required: true },
  { id: "travelDate", label: "Travel Date", type: "date", placeholder: "mm/dd/yyyy", required: true },
];

function RequirementIcon({ type }: { type?: string }) {
  return <span className="umrah-visa-requirement-icon" aria-hidden="true"><DynamicIcon name={type || "FileText"} size={20} strokeWidth={2} /></span>;
}

export function RequirementsContentSection({ data = {} }: { data?: any }) {
  const requirements = Array.isArray(data.requirements) && data.requirements.length > 0 ? data.requirements : defaultRequirements;
  const importantNotes = Array.isArray(data.importantNotes) && data.importantNotes.length > 0
    ? data.importantNotes
    : [
      "The Umrah visa & E Waiver visa process is online; no need to submit the passport physically.",
      "British Hajj Travel is the Ministry of Umrah & Hajj approved Umrah visa agency in UK.",
      "Females above the age of 60 can perform Umrah without a Mahram.",
      "All non-UK passport holders must be resident in the UK.",
    ];
  return (
    <div className="umrah-visa-requirements-panel !p-6">
          <div className="umrah-visa-section-heading">
            <h2>{data.title || "Requirements for Umrah Visa Application"}</h2>
            <p>{data.subtitle || "Please make sure you have the following documents and information ready:"}</p>
          </div>
          <div className="umrah-visa-requirements-list">
            {requirements.map((item: any, index: number) => (
              <div className="umrah-visa-requirement" key={index}>
                <RequirementIcon type={item.icon} />
                <div><strong>{item.title}</strong><span>{item.description}</span></div>
              </div>
            ))}
          </div>
          <div className="umrah-visa-note umrah-visa-note-important">
            <strong>{data.notesTitle || "Important Notes"}</strong>
            <ul>{importantNotes.map((note: string, index: number) => <li key={index}>{note}</li>)}</ul>
          </div>
          <div className="umrah-visa-note umrah-visa-note-red"><strong>{data.redNoticeTitle || "Receive Umrah Visa Same Day within 24 hour's."}</strong><span>{data.redNoticeText || "Fast and hassle-free processing with expert support."}</span></div>
          <div className="umrah-visa-note umrah-visa-note-green"><strong>{data.greenNoticeTitle || "WhatsApp us for Umrah Visa Price"}</strong><span>{data.greenNoticeText || "Get the latest price and guidance on your application."}</span></div>
    </div>
  );
}

export function UmrahVisaOrderFormSection({ data = {} }: { data?: any }) {
  const formFields = Array.isArray(data.formFields) && data.formFields.length > 0 ? data.formFields : defaultFormFields;
  return (
    <div className="umrah-visa-form-panel">
          <DynamicSiteForm
            formKey={data.formKey || "umrahVisaOrder"}
            fields={formFields}
            submitLabel={data.submitLabel || "Request Umrah Visa"}
            title={data.formTitle || "Umrah Visa Order Form"}
            description={data.formDescription || "Please fill in your information to order your Umrah Visa"}
            maxWidth="100%"
            bgColor="transparent"
            forceNoPadding
            cardContainer={false}
            preferFormConfig
          />
          <div className="umrah-visa-help"><strong>{data.helpTitle || "Need Help?"}</strong><span>{data.helpText || "Our team is available to assist you with your Umrah visa application."}</span><a href={data.helpLink || "https://wa.me/447957197390"}>Chat on WhatsApp →</a></div>
    </div>
  );
}

export default function UmrahVisaApplicationSection({ requirementsData = {}, formData = {}, data = {} }: { requirementsData?: any; formData?: any; data?: any }) {
  const mergedRequirements = { ...data, ...requirementsData };
  const mergedForm = { ...data, ...formData };
  return (
    <section className="umrah-visa-application-section">
      <div className="umrah-visa-application-grid">
        <RequirementsContentSection data={mergedRequirements} />
        <UmrahVisaOrderFormSection data={mergedForm} />
      </div>
    </section>
  );
}
