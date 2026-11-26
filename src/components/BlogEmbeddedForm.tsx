import { ENQUIRY_FORM_CATALOG } from '@/lib/formEnquiryCatalog';
import BlogSidebarBookingForm from '@/components/BlogSidebarBookingForm';
import DynamicSiteForm from '@/components/DynamicSiteForm';
import HajjRegistrationForm from '@/components/HajjRegistrationForm';
import PackageCustomizationCTA from '@/components/PackageCustomizationCTA';
import UmrahRegistrationForm from '@/components/UmrahRegistrationForm';
import YosrAlMashaerHajjForm from '@/components/YosrAlMashaerHajjForm';
import { UmrahVisaOrderFormSection } from '@/components/UmrahVisaApplicationSection';

const destinationFields = [
  { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
  { id: 'email', label: 'Email Address', type: 'email', placeholder: 'Email Address', required: true },
  { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+44', required: true },
  { id: 'package_type', label: 'Destination / Package', type: 'text', placeholder: 'Destination or package', required: true },
  { id: 'adults', label: 'Adults', type: 'number', placeholder: '1', required: true },
  { id: 'children', label: 'Children', type: 'number', placeholder: '0', required: false },
  { id: 'infants', label: 'Infants', type: 'number', placeholder: '0', required: false },
  { id: 'postcode', label: 'Postcode', type: 'text', placeholder: 'Postcode', required: false },
  { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Additional details', required: false },
];

export default function BlogEmbeddedForm({
  formKey,
  blogTitle,
  sourcePage,
}: {
  formKey: string | null | undefined;
  blogTitle: string;
  sourcePage: string;
}) {
  if (!formKey || !ENQUIRY_FORM_CATALOG.some((form) => form.key === formKey)) return null;

  let form;
  switch (formKey) {
    case 'hajjRegistrationForm':
      form = <HajjRegistrationForm sourcePage={sourcePage} />;
      break;
    case 'yosrHajjForm':
      form = <YosrAlMashaerHajjForm sourcePage={sourcePage} />;
      break;
    case 'umrahRegistrationForm':
      form = <UmrahRegistrationForm sourcePage={sourcePage} />;
      break;
    case 'blogSidebarForm':
      form = <BlogSidebarBookingForm blogTitle={blogTitle} />;
      break;
    case 'customizedHajjForm':
      form = <PackageCustomizationCTA journey="hajj" />;
      break;
    case 'customizedUmrahForm':
      form = <PackageCustomizationCTA journey="umrah" />;
      break;
    case 'umrahVisaOrder':
      form = <UmrahVisaOrderFormSection data={{ formKey }} />;
      break;
    case 'destinationForm':
      form = (
        <DynamicSiteForm
          formKey={formKey}
          fields={destinationFields}
          title="Destination Enquiry"
          maxWidth="100%"
          cardContainer
        />
      );
      break;
    default:
      form = <DynamicSiteForm formKey={formKey} maxWidth="100%" cardContainer />;
  }

  return (
    <section className="mb-8 rounded-3xl bg-white p-5 shadow-sm md:p-8" aria-label="Enquiry form">
      {form}
    </section>
  );
}
