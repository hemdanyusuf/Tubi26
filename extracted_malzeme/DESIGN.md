# Emerald Orchard Design System

### 1. Overview & Creative North Star
**Creative North Star: "The Fresh Curator"**
Emerald Orchard is a high-end editorial system designed for the intersection of utility and wellness. It moves away from the sterile, "app-like" look by embracing deep, lush greens, expansive whitespace, and a high-contrast typographic scale that feels more like a modern culinary magazine than a database. The system uses intentional asymmetry and heavy-weighted display type to guide the user's eye through inventory and information with a sense of rhythm and vitality.

### 2. Colors
The palette is rooted in a "Vibrant Fidelity" approach, using a high-chroma primary green (#13ec5b) as a functional accent against a sophisticated backdrop of "Mint-White" and "Deep Forest" neutrals.

- **The "No-Line" Rule:** Sectioning is achieved through shifts in background tone (e.g., moving from `surface` to `surface_container`) or through 1px borders colored exactly as `surface_container` (#e7f3eb) to ensure they feel like structural creases rather than heavy dividers.
- **Surface Hierarchy & Nesting:** Primary canvases use `surface` (#f6f8f6). Internal modules like cards and sidebars use `surface_bright` (#ffffff) to "lift" content. Deep-nested elements like search bars use `surface_container` to create a recessed, "etched" look.
- **The Glass & Gradient Rule:** For floating elements or primary CTAs, use a subtle 20-30% opacity glow of the primary color (`shadow-primary/30`) to simulate depth without heavy black shadows.

### 3. Typography
The system relies exclusively on **Manrope**, utilizing its variable weight axis to create a distinct hierarchy.
- **Display & Headline (2.25rem - 1.875rem):** Uses "Black" (900) or "ExtraBold" weights with tight letter-spacing (-0.02em) to create an authoritative, editorial impact.
- **Title & Body (1.125rem - 1rem):** Balanced and clear, focusing on readability.
- **Label & Metadata (0.875rem - 10px):** Frequently uses "Bold" weight and "Uppercase Tracking" to create a distinct visual texture for secondary information like "PREMIUM MEMBER" or "TAZELİK %75".

### 4. Elevation & Depth
Emerald Orchard rejects the "card-on-gray" cliché in favor of **Tonal Layering**.
- **The Layering Principle:** Depth is created by stacking. A card (`surface_bright`) sits on a background (`surface`), but contains progress bars or icons seated in `surface_container`.
- **Ambient Shadows:** The system uses `shadow-lg` and `shadow-xl` specifically with a color-tinted blur (e.g., `shadow-primary/30`). This creates a "glow" effect rather than a "drop" effect, making the UI feel light and vibrant.
- **Glassmorphism:** Elements like sidebar navigation items use high-transparency primary overlays (`primary/10`) to indicate state, allowing the underlying surface texture to remain visible.

### 5. Components
- **Buttons:** Primary buttons are large, rounded-xl (0.75rem), and high-contrast. They use a signature shadow that matches the button color to simulate a neon-underglow.
- **Inventory Cards:** These are the heart of the system. They feature a "Shelf" layout: an icon in a tinted container, bold title, and a high-contrast progress bar at the bottom to visualize quantity/freshness.
- **Search Inputs:** Recessed into the interface using `surface_container` or subtle ring-borders instead of traditional input fields.
- **Status Chips:** Small, pill-shaped indicators using secondary green or error red backgrounds with bold, high-contrast text to provide instant feedback.

### 6. Do's and Don'ts
**Do:**
- Use "Manrope Black" for main headers to maintain the editorial feel.
- Use tinted shadows that match the component's primary color.
- Maintain generous whitespace (`spacing: 3`) to allow the high-contrast typography to breathe.

**Don't:**
- Never use pure black (#000000) for text; use the "Deep Forest" on-surface color (#0d1b12).
- Avoid using standard 1px gray borders. If a boundary is needed, use the `surface_container` color.
- Do not use sharp corners; the `roundedness: 2` (0.5rem - 0.75rem) is essential to the organic, friendly nature of the system.