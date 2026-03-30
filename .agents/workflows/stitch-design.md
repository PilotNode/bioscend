---
description: How to use Stitch for UI design within BioScend
---

# Stitch UI Design Workflow

When designing new screens or features for BioScend, follow this locked-in workflow:

## 1. Stitch = Structural Wireframing Only
Use Stitch to quickly ideate **layout and element arrangement** (e.g. "where does the weekly calendar sit relative to the streak count?"). Do NOT rely on Stitch for the final visual aesthetic.

## 2. Local Codebase = Single Source of Truth for Design
All final implementations MUST use the existing BioScend design system:
- **Components:** `Card.tsx`, `Button.tsx`, `Input.tsx`, `Modal.tsx`, `ProgressCircle.tsx`
- **Tailwind Config:** Custom colors (`surface-base`, `surface-elevated`, `primary-500`, `secondary-500`), `shadow-glow`, neon effects
- **Icons:** Always use `lucide-react` icons
- **Typography:** Existing font stack from `tailwind.config.js`

## 3. Integration Over Addition
New features should integrate into existing surfaces (e.g. embed a widget into the Dashboard) rather than creating new standalone pages unless the feature truly warrants its own page. Avoid feature exhaustion.

## 4. Step-by-Step Process
1. Generate a structural wireframe in Stitch (text prompt, layout-focused)
2. Review the wireframe with the user for layout approval
3. Implement locally using existing React components and Tailwind classes
4. Verify build (`npm run build`) and visually test in browser
5. Update walkthrough artifact with screenshots/recordings
