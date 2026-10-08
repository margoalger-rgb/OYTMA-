# Oyo Traffic Website — As-Built Documentation

## 1. Project overview

**Website name:** Oyo Traffic — Road Information Hub  
**Purpose:** A public-facing information website for road safety, sourced agency updates, road-condition reporting, and vehicle-security guidance for Oyo State, Nigeria.  
**Primary audience:** Residents, drivers, vehicle buyers, and other road users in Oyo State.  
**Application route:** `/`  
**Page language:** English

The site is designed as an information and awareness platform. It is not represented as an officially authorized government service, a live traffic-control system, an emergency dispatch service, or a vehicle-record search service. The page itself prominently communicates these limits.

## 2. Website structure and content

The homepage is a single responsive page with in-page navigation. Sections appear in this order:

1. **Header and navigation** — Oyo Traffic identity, mobile menu, and links to overview, map, updates, road safety, Fraud & Auto Crime, and citizen reporting.
2. **Hero** — Introduces the road information hub and links to the base map and report form. States that traffic and incident information should be verified and sourced.
3. **Availability/status strip** — Shows the base map as available, public notices as available when published, and live traffic as not connected.
4. **About** — Explains the source-first, clear-status, people-first approach.
5. **Services** — Eight information categories: traffic information, road safety, public advisories, hazard awareness, public resources, shared information, Fraud & Auto Crime, and vehicle tracking.
6. **Geographic overview/map** — Embedded OpenStreetMap view and links to directions for Ibadan, Ogbomoso, Oyo, Iseyin, Saki, Eruwa, Igboho, and Kishi. The map is a base map only; live traffic colours and incident markers are not available.
7. **Road safety** — Practical general safety reminders for road users.
8. **Agency updates and leadership** — Searchable and filterable source-linked articles, plus the chairman feature and links to the supplied profile and source reports.
9. **Incident awareness** — Empty state until a reliable source confirms incidents; no unverified incident feed is displayed.
10. **Citizen road-condition report** — Form for submitting a road location, issue type, description, and up to two optional images.
11. **Fraud & Auto Crime** — Topic-based guidance for fraud prevention, car-theft prevention, buying and selling vehicles, roadside/traffic scams, and next steps. The “Buying & selling cars” topic includes an interactive five-step “Verify before you buy” checklist covering vehicle identity, ownership and registration, customs/import documents, theft and claims, and invoices/payment.
12. **Vehicle tracking requests** — Form for tracker-enrollment or vehicle-location-check requests. The page states that tracking is not connected and requests are pending setup.
13. **Transparency statement and footer** — Clarifies that authorization has not been established, provides navigation and a contact reference, and advises visitors to verify official contact details.

## 3. Interactions

- Header links navigate to sections on the same page; the mobile menu can be opened and closed.
- Update cards can be searched and filtered by Leadership, Operations, or Road safety. Article links open their cited source.
- The map provides outbound links to OpenStreetMap and city directions in Google Maps.
- The road report accepts a location, category, written description, and optional JPEG, PNG, or WebP images. The browser limits uploads to two images, 1.75 MB each.
- The “Verify before you buy” checklist has five selectable steps, checkboxes, a progress indicator, previous/next navigation, and a reset action. Checklist progress is transient React state; it is not persisted. The checklist does not request or transmit a VIN, identity document, or vehicle papers.
- The vehicle-service form submits a request type, vehicle make/model/year, plate number, name, email, phone, and required consent.

## 4. Current data and sources

### Agency updates

The currently displayed update cards are statically defined in the frontend, not fetched from a live agency feed. Each card includes a category, publication date, title, summary, source label, source URL, and image. The listed source publications are from OYRTMA/Oyo State Government. Confirm that these remain current before reusing or republishing them.

### Chairman feature

The featured chairman is Major Adekoya Adesagba (Rtd). The external profile link points to the LinkedIn URL supplied for the chairman profile; a separate OYRTMA article is linked as a source report. The biography on the page describes his Nigerian Army service and academic qualifications. Do not treat the different sources as interchangeable: independently verify titles, current appointments, profile ownership, and biography before publication.

### Map

The embedded map is provided by OpenStreetMap. The city direction links are Google Maps URLs. Neither service is presented as a live traffic provider for this site.

### Buyer guidance links

The customs guidance links to the Nigeria Customs Service website at `https://customs.gov.ng/`. The theft/claims guidance links to the OYRTMA website at `https://oyrtma.oyostate.gov.ng/`. These links do not indicate that this website can query either organization’s records or that either organization offers a particular vehicle-verification service.

## 5. Form endpoints and data handling

### Road-condition reports

**Endpoint:** `POST /api/incidents`  
**Request format:** `multipart/form-data`  
**Required fields:** location, issue type, description  
**Optional files:** Up to two JPEG, PNG, or WebP images; each up to 1.75 MB. The server also validates the image file signature and limits the total request body.

The server validates form values, uploads accepted images to **private Vercel Blob storage**, and inserts the report and attachment paths into the `incidentReports` database table. On a database failure, uploaded blobs are deleted when possible. A successful response returns a report ID. There is no public report browser, automatic verification, emergency alert, or staff moderation interface described by the current application.

Issue types include collisions, flooding, obstructions, potholes/road damage, missing manhole covers, breakdowns, closures, vehicle theft, fraud/suspicious vehicle activity, and other hazards. A visitor-submitted report is an observation, not a verified public fact.

### Vehicle-service requests

**Endpoint:** `POST /api/vehicle-requests`  
**Request format:** JSON  
**Request types:** tracker enrollment (`registration_request`) or location check (`location_check`).

The server validates vehicle and contact fields, requires consent, and inserts the request into the `vehicleRegistrations` database table with tracking status `pending_tracker_setup`. The endpoint returns success when the database insert succeeds. The current UI describes requests as pending setup; no live GPS integration, location map, emergency notification, or follow-up service is connected.

The form submits identifiable contact details together with vehicle details. The current UI warns that it is not login-protected and that users should submit details only if they accept that risk. Review privacy notice, access controls, retention, authorization, and operations for handling these requests before using the form as a real government service.

### “Verify before you buy” checklist

The checklist is informational and runs in the browser. It does not send data to the application or an authority, search police/customs/finance/insurance records, validate submitted documents, issue a clearance result, or guarantee a vehicle’s history or legal ownership. Users must confirm records directly with the issuing authority or record-holder.

## 6. Visual and accessibility direction

- Clean, editorial public-service presentation with restrained green, cream, and dark navy colours.
- Responsive layouts for desktop and mobile; section navigation and forms are designed for touch as well as pointer interaction.
- Uses semantic page sections, headings, labelled controls, visible status text, and screen-reader text where appropriate.
- Informational claims are paired with source links or caveats where applicable. A map illustration is explicitly labelled conceptual and is not a route or traffic feed.

## 7. Technology stack

- **Framework:** Next.js 16 App Router
- **UI:** React 19, TypeScript, custom CSS in `app/globals.css`
- **Icons:** `lucide-react`
- **Database:** PostgreSQL through Drizzle ORM, using the project’s database connection
- **Private uploads:** Vercel Blob
- **Analytics:** Vercel Analytics is rendered in production only
- **Package manager:** pnpm

Relevant implementation files:

- `app/page.tsx` — homepage route
- `app/layout.tsx` — document language, metadata, viewport, global stylesheet, and production analytics
- `components/traffic-platform.tsx` — page sections, content, and client-side interactions
- `app/globals.css` — visual system and responsive styling
- `app/api/incidents/route.ts` — incident validation, private image uploads, and database insert
- `app/api/vehicle-requests/route.ts` — vehicle-service request validation and database insert
- `lib/db/schema.ts` — database table definitions
- `lib/db/index.ts` — database client

## 8. Important operational limits and launch checklist

Before presenting the site as an official OYRTMA/Oyo State service:

- Obtain written authorization to use the agency identity, logos, leadership information, and official-service wording.
- Verify every public contact method, appointment, biography, article, external profile, and operational claim with an authorized source.
- Connect and label an authorized live-traffic provider before advertising live traffic or incident markers.
- Establish a verified review/moderation process before treating citizen reports as incidents or publishing them.
- Secure and test access controls for submitted personal and vehicle information; define who can review requests and a retention/deletion policy.
- Connect a real vehicle-tracking provider before accepting enrollment/location requests as an operational service.
- Do not advertise the buyer checklist as an official vehicle-history check unless official data sources, authorization, and an accountable review process are actually integrated.
- Check official external URLs, image rights, privacy disclosures, and contact details before production launch.

**Status represented by the current site:** Public-information presentation; official authorization not established; live traffic and vehicle tracking not connected; buyer verification is guidance only.

## 9. Environment configuration

The application relies on project-provided environment configuration for the PostgreSQL connection and private Vercel Blob uploads. These credentials are managed outside the source files. Never put database URLs, Blob tokens, or other secrets into this document or client-side code.

## 10. Maintenance notes

Update the static notices and leadership content in `components/traffic-platform.tsx` when verified source information changes. Keep publication dates, source URLs, images, and image descriptions aligned. Keep this document synchronized with changes to user-visible sections, data collection, API behavior, integrations, and service availability.

---

This document describes the implementation as currently built; it is not a promise that unavailable integrations or official services are operational.
