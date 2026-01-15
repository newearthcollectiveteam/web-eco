# Updated Website Design & Copy Handoff Document – New Earth Collective

**Version 3.0 – Full Copy Inclusion, Aesthetic Polish & Structure Overhaul**  
**Primary Domain:** joinnewearthcollective.com  
**Current Date:** January 15, 2026  
**Goal:** Elevate the existing site into a polished, high-gravitas expression of our values. Retain and refine the minimal black + #FACF39 gold aesthetic with the subtle Flower of Life shader. Provide **every single word** of marketing copy for the website—polished, refined, and ready for direct implementation. Overhaul structure for intuitive flow, drawing inspiration from Anthropic.com's clean, centered hero and vertical storytelling. Ensure no placeholders; all content is substantive and complete.

Claude already has:
- Tech stack & components
- Existing Flower of Life GLSL shader (keep as site-wide background – low opacity 0.1–0.2, gold-tinted with #FACF39 lines, subtle breathing or scroll-triggered animation for a sense of sacred interconnection without distraction)
- Golden gradient buttons (reuse the exact gradient style consistently for all CTAs – e.g., linear-gradient(to right, #FFD700, #FACF39) or the precise one already coded; add subtle hover effects like scale 1.05 and brighter glow)
- Brand fonts: Airwaves Regular (logo and main headlines), Bourton Bold (slogans and taglines)

## Core Aesthetic & Branding Refinements

- **Primary Background:** Black (#000000 or near-black #0A0A0A for subtle depth)
- **Accent Gold:** #FACF39 – Use exclusively for headlines, links, borders, icons, button text/backgrounds/gradients
- **Text Colors:** Primary white/off-white (#FAFAFA or #F5F5F5) on black for high contrast and readability
- **Typography Stack:**
  - Logo & Main Headlines: Airwaves Regular (geometric, retro-futuristic vibe for gravitas)
  - Slogans & Taglines: Bourton Bold (bold, impactful for emphasis)
  - Body Text & Subheadings: Clean sans-serif (e.g., Inter or system-ui) – sizes: body 16–18px, subheads 20–24px
- **Buttons/CTAs:** Reuse existing golden gradient style. Rounded corners (8–12px). White or near-black text on gradient. Hover: subtle scale and glow animation.
- **Shader Integration:** Apply the existing GLSL Flower of Life as a full-page canvas background (z-index -1). Tint with #FACF39. Ensure mobile performance optimization.
- **Spacing & Layout:** Generous vertical padding (80–120px between sections). Max content width 1100–1200px centered. Mobile-responsive: stack sections vertically, use hamburger for nav.
- **Tone & Voice:** Warm, inclusive, heart-centered, and authentic. Use “we” to foster community. Incorporate refined buzzwords sparingly (e.g., "weave a tapestry," "puzzle pieces"). Frame AI as "Collective Intelligence (CI)" to emphasize unity. All copy is polished for flow, brevity, and resonance—refined from provided raw materials without adding unsubstantiated content.

## Navigation & Global Elements

Fixed top navigation bar (black background, semi-transparent on scroll for immersion):
- Left: Logo in Airwaves Regular (“New Earth Collective”) with optional small subtitle in Bourton Bold (“Heart-Led Creators United”)
- Center/Right Links (white text, hover to #FACF39):
  - Home (links to /)
  - About (links to /about)
  - Values (links to /values)
  - Resources (links to /resources)
  - Contact (links to /contact)
- Far Right: Prominent **Join** button (golden gradient, bold white text in Bourton Bold: “Join Now”). Links to /questionnaire. Hover glow.

Mobile: Gold #FACF39 hamburger icon; menu slides in with links stacked, Join button at bottom.

Footer (black background, 60px padding):
- Horizontal mirror of nav links (white, hover #FACF39)
- Social & Contact: Instagram icon linking to https://www.instagram.com/newearthcollectiveco/ (new tab); Email: “community@joinnewearthcollective.com” as mailto: link
- Copyright Line (white, small): “© 2026 New Earth Collective. All rights reserved.”
- Tagline (Bourton Bold, #FACF39, centered): “Technology Serving Consciousness – From Digital to In-Person Harmony”

## Homepage Structure & Full Copy (/)

Full vertical scrolling layout. Inspired by Anthropic.com: Dominant centered hero for immediate impact, followed by narrative sections building from mission to vision. Use full-width sections with centered content containers. Interweave CTAs strategically.

1. **Hero Section** (Full viewport height ~100–120vh, centered alignment, shader prominent)
   - Headline (Airwaves Regular, #FACF39, 4–5rem on desktop, responsive): “New Earth Collective”
   - Tagline (Bourton Bold, white, 2–2.5rem): “Activate Heart-Led Creators. Connect into a Living Network.”
   - Elevator Pitch Body (white, 1.25rem, max-width 800px, centered): “We host immersive festival experiences that activate heart-led creators and connect them into a living network for ongoing collaboration.”
   - Additional Invitational Text (white, smaller 1rem, below pitch): “Bring your whole self—shadows, gifts, and truths. Join us in weaving a tapestry of collective sovereignty, where individual empowerment blooms within the whole.”
   - Primary CTA: Large golden gradient button (Bourton Bold, white text): “Join the Collective” (links to /questionnaire)

2. **Mission Section** (Full-width, 80–100px padding top/bottom, black bg)
   - Headline (Airwaves Regular, #FACF39, 2.5rem, left-aligned or centered): “Our Mission”
   - Body Copy (white, paragraphs, max-width 900px): “Our mission is to connect heart-centered leaders worldwide to build systems that support more coherent and regenerative ways of being. Ways of being that honor our women and children. Ways of being that honor the land. Technological systems that empower our human sovereignty. We believe that sovereignty is the combination of freedom and agency. And that collective sovereignty can only be realized through the actualization of individual gifts.”
   - CTA Button (golden gradient, smaller): “Explore Our Values” (links to /values)

3. **Core Values Section** (Responsive grid: 3–4 columns on desktop, stack on mobile; each value in a card with thin #FACF39 border, black inner bg, hover subtle gold glow)
   - Section Headline (Airwaves Regular, #FACF39, 2.5rem, centered): “Our Guiding Values”
   - Value 1 Card:
     - Title (Bourton Bold, #FACF39): “Unconditional Love”
     - Description (white): “Every interaction begins with the heart. We lead with indiscriminate love, not ego—creating space where all beings are honored.”
   - Value 2 Card:
     - Title (Bourton Bold, #FACF39): “Circular Abundance”
     - Description (white): “Energy, knowledge, and resources flow multidirectionally. What you give returns; what you receive, you share. We operate in cycles, not hierarchies.”
   - Value 3 Card:
     - Title (Bourton Bold, #FACF39): “Radical Authenticity”
     - Description (white): “Bring your whole self—shadows, gifts, and truths. This is a judgment-free space where vulnerability is strength and masks aren't needed.”
   - Value 4 Card:
     - Title (Bourton Bold, #FACF39): “Expanding Consciousness”
     - Description (white): “We honor growth over perfection and embrace the messy, beautiful path of awakening. Evolution is the journey, not the destination.”
   - Value 5 Card:
     - Title (Bourton Bold, #FACF39): “Synarchy”
     - Description (white): “Leadership rooted in service and unconditional love. We synthesize wisdom from all traditions, recognizing that true authority comes from alignment with the highest good.”
   - Value 6 Card:
     - Title (Bourton Bold, #FACF39): “Technology Serving Consciousness”
     - Description (white): “AI and digital systems are mirrors and amplifiers of our highest values—tools that elevate humanity rather than diminish it.”
   - Value 7 Card:
     - Title (Bourton Bold, #FACF39): “Collective Sovereignty”
     - Description (white): “Individual empowerment exists within the whole. True freedom emerges through devotion to community and conscious connection.”
   - Value 8 Card:
     - Title (Bourton Bold, #FACF39): “Harmonic Collective Intelligence”
     - Description (white): “Like forests and mycelial networks, we blend individual gifts into a unified, living system—operating in seamless, mutually supportive harmony with nature's wisdom, cycles, and rhythms.”
   - Closing Text (white, centered below grid): “These values form the mycelial foundation of our synarchic leadership and harmonic collective intelligence, guiding every connection we weave.”

4. **Antithesis vs. Upside Section** (Two-column layout on desktop: left for antithesis, right for upside; stack on mobile. Use subtle #FACF39 dividers or accents)
   - Section Headline (Airwaves Regular, #FACF39, 2.5rem, centered): “Reclaiming Connection in a Fragmented World”
   - Left Column (Antithesis – Headline in Bourton Bold, #FACF39: “The Challenges We Address”)
     - Body Copy (white, bullet points):
       - “Engineered addiction and nervous system dysregulation. Social media platforms don't just capture our attention—they program our brains using variable reward schedules (the same mechanism as slot machines). Research shows chronic use creates feedback loops between stress hormones and reward neurotransmitters—we're running on activation without ever settling into regulation. You're not the customer. You're the product being trained.”
       - “Social fragmentation beyond our limits. Humans evolved to maintain meaningful relationships with roughly 150 people. When networks expand beyond this threshold, connection depth collapses. We start treating humans as abstractions. Empathy shuts off. Community dissolves into isolation.”
       - “Severed connection to land. We've abstracted ourselves from the physical world. What researchers call 'nature deficit disorder' isn't poetic—it's physiological. Visual contact with nature reduces anxiety, stabilizes heart rate, improves cognition. We've traded the horizon for the screen. Our bodies don't touch earth.”
       - “The erosion of sovereignty. Harvard professor Shoshana Zuboff calls it 'surveillance capitalism'—the claiming of private human experience as raw material for behavioral modification at scale. Tech companies don't just predict our behavior—they shape it. Without autonomy in action and thought, we lose our capacity for the moral judgment necessary for democracy itself.”
   - Right Column (Upside – Headline in Bourton Bold, #FACF39: “Our Regenerative Alternatives”)
     - Body Copy (white, bullet points; note: referenced companies aren't affiliated):
       - “Technology that strengthens in-person connection. The Global Ecovillage Network connects 6,000+ communities across 114 countries—living laboratories for technology that facilitates gathering instead of replacing it. These aren't utopian fantasies. They're regenerative communities already functioning today.”
       - “Technology that safeguards nervous system coherence. The Center for Humane Technology has been developing design principles that protect attention and wellbeing since 2013. Products like Light Phone—designed to be used as little as possible—demonstrate viable alternatives to attention-hijacking interfaces. This means rejecting variable reward schedules, designing for focused attention rather than infinite scroll, and building systems that support our biology.”
       - “Technology that reconnects us to land. Regenerative agriculture and permaculture show how technology can support ecological healing rather than extraction. These are integrated systems that enhance biodiversity, enrich soils, and capture carbon while reconnecting humans to the living systems that sustain us.”
       - “Technology that empowers true data sovereignty. Projects like Web5 are building decentralized platforms where users control their identity and data through self-sovereign systems. This isn't blockchain hype—it's infrastructure for a world where you own your data, control who accesses it, and can revoke that access at will. Where surveillance capitalism becomes technologically impossible.”
   - CTA at Bottom (centered, golden gradient button): “Join to Build This Regenerative Future” (links to /questionnaire)

5. **Who We Serve Section** (Two-column grid or cards; responsive stack)
   - Section Headline (Airwaves Regular, #FACF39, 2.5rem, centered): “Heart-Led Creators We Empower”
   - Left Column/Card (Headline in Bourton Bold, #FACF39: “Facilitators”)
     - Bullet List (white):
       - “Breathwork practitioners”
       - “Meditation guides”
       - “Somatic practitioners”
       - “Nervous system regulation specialists”
       - “Polarity/relationship guides”
       - “Yoga instructors”
       - “Medicine guides/shamans”
       - “Psychics”
       - “Sound healers”
       - “Reiki masters”
       - “Bodyworkers”
   - Right Column/Card (Headline in Bourton Bold, #FACF39: “Creators & Builders”)
     - Bullet List (white):
       - “Conscious entrepreneurs/solopreneurs”
       - “Sovereigns”
       - “Decentralized tech/currency activists”
       - “Regenerative farmers”
       - “Land developers”
       - “Permaculture practitioners”
       - “Conscious festival organizers”
       - “Musicians (DJs, producers)”
       - “Artists”
       - “Polymaths”
   - Closing Text (white, centered): “A lot of people have been out there just cultivating their own puzzle pieces. We just want to help people put their puzzle pieces together. Whether you're a shaman or a sovereign tech activist, your gifts are essential to the tapestry we weave.”

6. **Vision & Strategy Section** (Full-width text block with subtle phased timeline: numbered list or icons with #FACF39 accents)
   - Section Headline (Airwaves Regular, #FACF39, 2.5rem, left-aligned): “Our Long-Term Vision and Strategy”
   - Vision Copy (white, paragraph): “A world of decentralized regenerative communities, interlinked with coherent technologies and sovereign data. Where technology and nature exist in harmony. And technology and biology exist in harmony.”
   - Strategy Intro (white): “We have communities. We have the people. But we need technologies. Because of Collective Intelligence (CI), we can build technologies in the form of microapps rapidly, emergent from the needs of our communities. Technology in service of human connection, that ultimately begins with and ends in in-person human connection.”
   - Phased Path (numbered list, white text with #FACF39 numbers):
     1. “Questionnaire for event attendees to inform app”
     2. “Basic profile system, with first few MicroApps, networking based off harmonic/energetic blueprints”
     3. “Community trees, Community MicroApps, Community Resource Hubs”
     4. “CI integration, personal and community level. Chat bots that can talk to databases, hubs and microapps”
     5. “Seeding in-person communities on land outfitted with coherent tech/decentralized tech (Web5) with full sovereign data systems”
   - Hot Take Blockquote (Bourton Bold, #FACF39, italicized white): “AI should be called CI (Collective Intelligence) – Artificial just drives the idea of fragmentation.”

7. **Final Invitation Section** (Full-width, with #FACF39 accents for emphasis)
   - Large Text (Airwaves Regular, #FACF39, 3rem, centered): “Your Gifts Are Needed. The Network Awaits.”
   - Body (white): “Start weaving your puzzle piece into the tapestry. Complete our questionnaire to align and inform our emerging microapps.”
   - CTA Button (large golden gradient, Bourton Bold): “Join Now” (links to /questionnaire)

## Additional Pages – Full Copy & Structure

- **/about** (Similar to homepage but deeper dive; hero + sections)
  - Hero Headline (Airwaves Regular, #FACF39): “About New Earth Collective”
  - Hero Tagline (Bourton Bold, white): “Heart-Centered Leaders Building Regenerative Systems”
  - Hero Body: Reuse elevator pitch + mission copy from homepage.
  - Mission Section: Full mission copy as above.
  - Vision Section: Full vision copy as above.
  - Strategy Section: Full strategy intro + phased path as above.
  - Hot Takes & Buzzwords: “CI over AI for unity. Weave a tapestry of puzzle pieces. Technology begins and ends in in-person connection.”
  - CTA: Golden gradient button “Join the Movement” (links to /questionnaire)

- **/values** (Dedicated page; hero + expanded value sections, one per full-width block or card)
  - Hero Headline (Airwaves Regular, #FACF39): “Our Core Values”
  - Hero Body (white): “These principles guide every aspect of the New Earth Collective, from festivals to tech.”
  - Each Value as a Section (Headline in Bourton Bold, #FACF39; full description as in homepage, plus optional quote: e.g., for Unconditional Love: “Love is the foundation of all true connection.”)
  - Closing: “Living these values creates harmonic collective intelligence.”
  - CTA in Footer: “Align with Us” (links to /questionnaire)

- **/resources** (Hub page; hero + curated list)
  - Hero Headline (Airwaves Regular, #FACF39): “Resources for Regenerative Growth”
  - Hero Body (white): “Explore inspirations aligning with our upside—tools for coherence, sovereignty, and harmony.”
  - List Section (bullets or cards, white text):
    - “Global Ecovillage Network: Connect with 6,000+ regenerative communities (external link: https://ecovillage.org/, new tab)”
    - “Center for Humane Technology: Design principles for wellbeing (external link: https://www.humanetech.com/, new tab)”
    - “Light Phone: Minimalist tech for focus (external link: https://www.thelightphone.com/, new tab)”
    - “Regenerative Agriculture Resources: Permaculture and soil healing (external link: e.g., https://regenerationinternational.org/, new tab)”
    - “Web5 for Data Sovereignty: Decentralized identity (external link: https://tbd.website/web5, new tab)”
  - Teaser: “Coming soon: Community Resource Hubs and MicroApps.”
  - CTA: “Share Your Resources” (links to /questionnaire)

- **/contact** (Simple form page; hero + form)
  - Hero Headline (Airwaves Regular, #FACF39): “Connect with the Collective”
  - Hero Body (white): “Reach out for collaboration, questions, or to share your gifts.”
  - Form Fields (golden accents on inputs/buttons):
    - Name (text input)
    - Email (email input)
    - Message (textarea)
  - Submit Button (golden gradient): “Send Message” (submits to community@joinnewearthcollective.com)
  - Below Form: Instagram and email links as in footer.
  - No additional CTA needed.

- **/thank-you** (Post-submission page; simple hero)
  - Headline (Airwaves Regular, #FACF39): “Thank You for Sharing Your Blueprint”
  - Body (white): “Your responses help us assess alignment and inform the building of our app. We'll connect soon via email or our network. In the meantime, follow our journey on Instagram.”
  - Links: “Back to Home” (to /), Instagram (to https://www.instagram.com/newearthcollectiveco/, new tab)

## Questionnaire Refinements (/questionnaire)

Enhance the existing form at https://www.joinnewearthcollective.com/questionnaire. Multi-step wizard (e.g., Step 1: Personal Info, Step 2: Alignment, Step 3: Gifts & Tech). Use golden #FACF39 accents on progress bar, fields, and buttons. Retain min word limits and checkboxes.

- **Form Headline** (Airwaves Regular, #FACF39): “New Earth Collective Alignment Questionnaire”
- **Intro Text** (white): “This helps us suss alignment with our values and gather insights to build our microapps. Your data is held sovereignly.”
- **Fields** (all required unless noted; textareas with min word counters):
  1. Full Name (text input)
  2. Email (email input)
  3. Phone Number (tel input)
  4. Full Birthdate and Time (date and time pickers; note: “For energetic blueprint calculations—kept private and sovereign.”)
  5. How did you find the New Earth Collective? (textarea, min 20 words)
  6. In your own words, what does "New Earth" mean to you? (textarea, min 50 words)
  7. What is your primary intention for joining? (textarea, min 50 words)
  8. What does "sovereignty" mean to you? (textarea, min 50 words)
  9. What does "doing your inner work" currently look like for you? (check all that apply) (checkboxes: Breathwork, Meditation, Somatic practices, Nervous system regulation, Polarity/relationship work, Yoga, Medicine journeys, Psychic development, Sound healing, Reiki, Bodywork, Other (with text input))
  10. Describe a recent moment when you chose authenticity over performance, even though it was uncomfortable. (textarea, min 100 words)
  11. How do you typically respond when you're triggered or dysregulated in community spaces? (textarea, min 50 words)
  12. What unique gift, skill, or perspective do you want to share with the community? (textarea, min 50 words)
  13. What would you like to receive from this community? (textarea, min 50 words)
  14. What is your current relationship with technology? (textarea, min 50 words)
  15. What is your current relationship with AI? (textarea, min 50 words; note: “We prefer 'Collective Intelligence' framing.”)
  16. If you could improve social media, how would you? (textarea, min 100 words)
- **Submit Button** (golden gradient, Bourton Bold): “Submit Your Blueprint”
- **On Success:** Redirect to /thank-you with confirmation message.

## Technical & Functional Notes

- **Metadata Optimization:**
  - Homepage: Title: “New Earth Collective | Heart-Led Network for Regenerative Collaboration”; Description: “Join immersive festivals connecting creators into a sovereign, living network. Honor love, land, and collective intelligence.”
  - Other Pages: Similar, e.g., /about: “About Us | Mission, Vision, and Tech Path for Collective Sovereignty”
  - Include Open Graph tags for social sharing (image: logo or shader screenshot).
- **Code Practices:** Semantic HTML (e.g., <section class="hero">). ARIA labels for accessibility. Descriptive classes (e.g., .value-card, .cta-button).
- **Redirects:** Archive all at launch.joinnewearthcollective.com/*; set 301 redirects to corresponding root domain paths (e.g., /about).
- **Join Button Placement:** Nav bar, hero, end of mission/values/antithesis sections, footer.
- **Creative Implementation:** Within these exact specs, refine UX for heart-resonance—e.g., subtle transitions on section scrolls.

This is the complete handoff: Implement directly on the existing site foundation for polish and overhaul.