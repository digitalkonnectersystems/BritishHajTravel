import Link from "next/link";
import Image from "next/image";
import { getPackagesByType } from "@/actions/packageActions";
import { getPageBySlug } from "@/actions/pageActions";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import HajjPackagesSection from "@/components/HajjPackagesSection";

// Fallback cards shown only if no Hajj packages exist yet in the database,
// so the page never renders empty.
const fallbackCards = [
  {
    badgeDuration: "14 Days",
    title: "Economy Hajj Package 2027",
    heroImage:
      "https://images.unsplash.com/photo-1553755088-ef1973c7b4a1?auto=format&fit=crop&w=700&q=80",
    makkahHotel: {
      name: "5 Star Hotel in Makkah",
      location: "Near to Haram",
      image:
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/865309229.jpg?k=13b36d624d683462058664c3aa31641cbb4c53cf07ca581f02f127e198029575&o=",
      badge: "Breakfast",
      nights: "6 Nights",
    },
    madinahHotel: {
      name: "5 Star Hotel in Madinah",
      location: "Near to Masjid Nabawi",
      image:
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/523311776.jpg?k=2d6dfd51cd0bb767e33d6cc5dc4d3f8d76da0c17140158b7b43366dc7cf66a36&o=",
      badge: "Breakfast",
      nights: "6 Nights",
    },
    price: "12,995",
    btnLink: "/economy-hajj-2027",
  },
  {
    badgeDuration: "17 Days",
    title: "Deluxe Hajj 2027",
    heroImage:
      "https://images.unsplash.com/photo-1577295605163-132e25c3c914?auto=format&fit=crop&w=900&q=80",
    makkahHotel: {
      name: "5 Star Hotel Fairmont Makkah",
      location: "Near to Haram",
      image: "/img/fairmount.jpg",
      badge: "Buffet Included",
      nights: "8 Nights",
    },
    madinahHotel: {
      name: "5 Star Hotel Dar Al Eman Madinah",
      location: "Near to Masjid Nabawi",
      image: "/img/dar-al-eman.jpg",
      badge: "Buffet Included",
      nights: "7 Nights",
    },
    price: "17,995",
    btnLink: "/deluxe-hajj-2027",
  },
  {
    badgeDuration: "10 Days",
    title: "Express Custom Hajj 2027",
    heroImage:
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80",
    makkahHotel: {
      name: "Hyatt Regency Makkah",
      location: "Jabal Omar (Short Walk)",
      image:
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=300&q=80",
      badge: "Breakfast",
      nights: "5 Nights",
    },
    madinahHotel: {
      name: "Pullman Zamzam Madinah",
      location: "Walking Distance",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIMH3qB9RTiBkL_HJ1Ud2v3EUkitmSkKqpCuxjwQcnJNlt6DQcGjUrYoo&s=10",
      badge: "Breakfast",
      nights: "5 Nights",
    },
    price: "14,995",
    btnLink: "/contact",
  },
];

export default async function HajjPackagesPage() {
  let liveCards: any[] = [];
  let pageData: any = null;
  let pageSections: any[] = [];
  let hajjPackages: any[] = [];

  try {
    hajjPackages = await getPackagesByType("hajj");

    liveCards = hajjPackages.map((pkg: any) => {
      const cd = pkg.cardData || {};
      return {
        badgeDuration: cd.duration || `${pkg.durationDays || 14} Days`,
        title: pkg.title,
        heroImage:
          cd.bannerImage ||
          pkg.featuredImage ||
          "/uploads/sections/hajj_1.jpg",
        makkahHotel: cd.makkahHotel || null,
        madinahHotel: cd.madinahHotel || null,
        price: pkg.startingPrice
          ? Number(pkg.startingPrice).toLocaleString("en-CA", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
          : "",
        btnLink: cd.btnLink || `/package/${pkg.slug}`,
      };
    });
  } catch (err) {
    console.error("Failed to load Hajj packages:", err);
  }

  try {
    pageData = await getPageBySlug("/hajj-packages");
    if (pageData && pageData.sections) {
      pageSections = typeof pageData.sections === "string" ? JSON.parse(pageData.sections) : pageData.sections;
    }
  } catch (err) {
    console.error("Failed to load CMS page data:", err);
  }

  const cards = liveCards.length > 0 ? liveCards : fallbackCards;

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: 'body { background-color: #fffff !important; }' }} />
      <section className="hero packages">
        <div className="wrap">
          <h1 className="page-header-title">
            Luxury <span className="text-gold">Hajj Packages 2027</span>
          </h1>
          <p className="page-header-leadtxt">
            Luxury Hajj 2027 Packages with 5-Star Hotels, VIP Services &amp; Complete Spiritual Guidance.
          </p>
        </div>
      </section>

      {pageSections.length > 0 ? (
        <PageSectionsRenderer sections={pageSections} pageData={pageData} initialPackageData={{ hajj: liveCards.length > 0 ? hajjPackages : undefined }} />
      ) : (
        <HajjPackagesSection data={{}} initialPackages={cards.length > 0 ? cards : fallbackCards} />
      )}
    </main>
  );
}
