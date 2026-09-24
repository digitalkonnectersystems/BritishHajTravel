# Section Mapping Documentation

This document maps all the dynamic sections used across the Next.js frontend pages.

## Global Concepts
Every section uses this structure in the database:
- `id` (int)
- `page_id` (int, foreign key)
- `type` (varchar, determines which UI block renders)
- `data` (json, contains the exact fields for this section)
- `order` (int, sorting)

## Mapped Section Types

### 1. Page Banner (Hero)
**Used on:** Nearly all pages (About, Contact, Airlines, etc.)
**Note:** Usually stored in the `pages` table directly as `bannerTitle`, `bannerDescription`, `bannerBgImage`, `bannerPosition`, `bannerSize`. It is NOT a section in `page_sections`.

### 2. Stats Grid
**Used on:** About Page
**Fields:**
- `items`: Array of objects (`value`, `label`)

### 3. Intro / Text Block
**Used on:** About Page, Home Page
**Fields:**
- `eyebrow` (string)
- `title` (string, HTML allowed in some places)
- `description` (string/text)

### 4. Image + Text (Why Choose Us)
**Used on:** About Page, Home Page
**Fields:**
- `eyebrow`
- `title`
- `description`
- `subheading` (optional)
- `features` (Array of strings)
- `image` (URL)

### 5. Services Grid (What We Provide)
**Used on:** About Page
**Fields:**
- `eyebrow`
- `title`
- `items`: Array (`icon`, `title`, `subtitle`, `description`)

### 6. Accreditations Bar (Badges Cards)
**Used on:** About Page, Home Page
**Fields:**
- `items`: Array (`title`, `icon`, `iconType`)

### 7. Umrah Packages Grid
**Used on:** About Page, Umrah Page
**Fields:**
- `items`: Array (`id`, `title`, `duration`, `heroImage`, `price`, `makkahHotel` obj, `madinahHotel` obj)

### 8. Airlines Marquee (Partners Marquee)
**Used on:** Airlines Page, About Page, Home Page
**Fields:**
- `eyebrow`
- `title`
- `logos`: Array (`src`, `alt`)
- `speedMs`
- `direction`

### 9. Available Flights Grid
**Used on:** Airlines Page
**Fields:**
- `eyebrow`
- `title`
- `items`: Array of editable flight cards. Each card supports:
  - `logo`, `code`, `name`, `operatedBy`
  - `price`, `priceSubtext`, `seatsText`, `bookingLabel`, `bookingUrl`
  - `outbound` and `return` direction objects with `date`, `className`, `first`, `second`, `layoverText`, and `layoverDuration`
  - `first` and `second` points support `code`, `city`, `time`, and `flightNumber`
  - Legacy summary fields (`originCode`, `originCity`, `destCode`, `destCity`, `time`) remain supported as fallbacks
- Airline logos are uploaded from the admin editor to the `flights` media folder.

### 10. Available Seats
**Used on:** Airlines Page, Any Page
**Fields:**
- `eyebrow`
- `title`
- `subtitle`
- `items`: Array (`logo`, `airline`, `flightLabel`, `departure`, `returnDate`, `route`, `seats`, `baggage`, `price`, `bookingLabel`, `bookingUrl`)
- Seat-card logos are uploaded from the admin editor to the `flights` media folder.

### 11. Flight Assistance CTA
**Used on:** Airlines Page
**Fields:**
- `title`
- `description`
- `btnLabel`
- `btnLink`

### 11. Contact Info Cards
**Used on:** Contact Page
**Fields:**
- `card1Title`, `headAddress`, `branchAddress`
- `card2Title`, `phone1`, `phone2`, `phone3`
- `card3Title`, `email`, `facebookUrl`, `instagramUrl`, `linkedinUrl`, `tiktokUrl`

### 12. Contact Form
**Used on:** Contact Page
**Fields:**
- `title`
- `subtitle`
- `enabled`
- `successMessage`

### 13. Contact Maps
**Used on:** Contact Page
**Fields:**
- `headTitle`, `headAddress`, `headMapUrl`
- `branchTitle`, `branchAddress`, `branchMapUrl`

### 14. Exclusive Upcoming Umrah Packages
**Used on:** Home Page
**Fields:**
- `eyebrow`
- `title`
- `description`
- `items`: Array (`month`, `title`, `price`, `heroImage`, `includes` array)

### 15. Select Preferred Travel Service
**Used on:** Home Page
**Fields:**
- `eyebrow`
- `title`
- `items`: Array (`icon`, `title`, `description`, `link`)

### 16. What We Provide (Numbered Features)
**Used on:** Home Page
**Fields:**
- `eyebrow`
- `title`
- `image`
- `videoUrl` (optional — YouTube watch/shorts/live, Vimeo, direct .mp4/.webm, or raw embed URL; turns the image card into a click-to-play inline video player)
- `videoPoster` (optional — custom thumbnail; falls back to the video's YouTube thumbnail, then `image`)
- `videoFit` (`cover` default — fills the card with no black borders; `contain` — full frame visible)
- `badgeTitle`, `badgeSubtitle` (reused as the play-button label when a video is set)
- `items`: Array (`num`, `title`, `description`)

### 17. Hajj Packages Grid
**Used on:** Home Page, Hajj Packages Page
**Fields:**
- `eyebrow`
- `title`
- `description`
- `items`: Array (`title`, `price`, `duration`, `heroImage`, `features` array, `makkahHotel` obj, `madinahHotel` obj, `badge`)

### 18. Sold Out Packages
**Used on:** Home Page
**Fields:**
- `eyebrow`
- `title`
- `description`
- `items`: Array (`month`, `title`, `price`, `heroImage`, `includes` array with `text`, `icon`, `iconColor`)

### 19. Visa Solutions Grid
**Used on:** Home Page, Saudi Visa Page
**Fields:**
- `eyebrow`
- `title`
- `items`: Array (`title`, `description`, `icon`, `image`)

### 20. Testimonials
**Used on:** Home Page
**Fields:**
- `eyebrow`
- `title`
- `items`: Array (`name`, `role`, `content`, `rating`, `image`)

### 21. Latest Blogs
**Used on:** Home Page, Blogs Page
**Fields:**
- `eyebrow`
- `title`
- (Usually pulls from `blog_posts` table dynamically, but may have override settings)

### 22. Guide Video
**Used on:** Guide Pages
**Fields:**
- `source`: `embed` for YouTube/Vimeo or `upload` for an uploaded video
- `url`: YouTube/Vimeo URL or uploaded media URL
- `title` (optional — displayed above the video)
- `caption` (optional)

### 23. Guide FAQ
**Used on:** Guide Pages
**Fields:**
- `eyebrow`, `heading`, `description`
- `items`: Array of FAQ items with `question` and ordered `answerBlocks`
- `answerBlocks`: Array of `{ type: 'text', content }`, `{ type: 'image', url, alt }`, or `{ type: 'video', url }`

## Plan for Implementation
1. Go through `src/app/admin/pages/edit/page.tsx` and ensure ALL these section types exist in `SECTION_CATALOG`.
2. Add comprehensive default data to the catalog.
3. Update the switch-case in `AdminPagesEdit` to render proper form inputs and array editors for every type.
4. Remove all hardcoded default fallback arrays from `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/contact/page.tsx`, `src/app/airlines/page.tsx`.
