# Team UX Theme Styling Design

## Goal

Beautify `frontend/src/components/team` with a professional workspace style that prioritizes user experience over decoration. The team area should be easier to scan, safer to operate, and consistent with the application's active theme color.

## Scope

Update the visual presentation of:

- `TeamBuilderWrapper`
- `TeamBuilder`
- `RoleSquare`
- `TeamRoster`
- `TeamMemberCard`
- `TeamPickerModal`
- `frontend/src/styles/team.css`

No API or data model changes are planned.

## Design Direction

Use a clean console/workbench style:

- Compact information hierarchy for repeated use.
- Clear two-pane editor: role library on the left, roster/configuration on the right.
- Stable responsive behavior: two columns on desktop, single column on smaller screens.
- Cards and controls should feel polished but restrained, with small radius, subtle borders, and low-noise shadows.
- Actions must stay discoverable: add, edit, delete, clone, set default, and enable/disable should have visible affordances and hover/focus states.

## Theme Color Requirements

All normal UI styling should use existing theme variables:

- `--theme-primary`
- `--theme-primary-hover`
- `--theme-primary-light`
- `--theme-bg`
- `--theme-bg-card`
- `--theme-border`
- `--theme-text`
- `--theme-text-secondary`

Avoid hard-coded blue/stone styling in the team picker and replace it with theme-aware classes. Keep red only for destructive actions.

## Component Notes

`TeamBuilderWrapper` should show team cards as practical management surfaces: name, description, member count, active count, role chips, and clear icon actions.

`TeamBuilder` should keep the form compact and scannable. The team name, description, and global instructions should sit in a structured summary area with theme-aware focus states.

`RoleSquare` should make searching and adding roles easier. Role cards need consistent spacing, clear avatar/tag hierarchy, and an add button that is visible enough on touch devices.

`TeamRoster` and `TeamMemberCard` should make selected roles easy to configure. Default and enabled states must be visually distinct without relying only on color. Disabled cards should remain readable.

`TeamPickerModal` should match the same team visual language and theme color system on desktop and mobile.

## Testing And Verification

Run the frontend tests that cover team presentation if available, plus a type/build check for the frontend. Manually inspect the team builder in light and dark themes at desktop and mobile widths if the app can run locally.
