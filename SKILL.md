# UStudy UI and System Design

Practical conventions for building and extending UStudy. Follow these rules unless a feature already has a stronger and more established local pattern.

## Product Principles

* Build task-first screens. The first visible area should allow a student to inspect information, make a decision, or take action. Avoid marketing-style hero layouts in internal tools.
* Make the visual hierarchy explicit. Primary actions, supporting context, and lower-frequency commands should not compete for attention.
* Treat schedules, course plans, grades, and group rosters as operational data. Optimize for scanning, comparison, and repeated actions rather than decorative presentation.
* Prefer small, reversible UI changes over broad visual refactors when a request concerns a specific workflow.
* Preserve the user's existing plans and imported data. A UI improvement must never silently discard, reset, or reinterpret user data.

## Visual Language and Tokens

### Primary Brand Color

* Use `#004A98` as the primary UStudy brand color.
* Apply `#004A98` to:

  * Primary buttons.
  * Selected navigation items.
  * Active tabs.
  * Important links.
  * Checked controls.
  * Primary icons.
  * Key informational states.
* The primary brand color should remain visually dominant across the application. Supporting blue shades must not replace it as the default action color.

### Brand Moodboard

Use the following blue palette as the core UStudy moodboard:

* `#003A78` — deep blue.
* `#004A98` — primary brand blue.
* `#0058B2` — medium bright blue.
* `#0066CC` — bright blue.

Use each shade according to its role:

* Use `#003A78` for hover, pressed, dark emphasis, and high-contrast brand surfaces.
* Use `#004A98` as the default color for primary actions and selected states.
* Use `#0058B2` for secondary brand emphasis, supporting icons, charts, and intermediate gradient stops.
* Use `#0066CC` for brighter highlights, active accents, charts, and gradient endpoints.

Do not treat all four shades as interchangeable. Their visual hierarchy must remain:

`#003A78` → `#004A98` → `#0058B2` → `#0066CC`

### Brand Gradients

Gradients are allowed only when they reinforce the UStudy brand and should not be used as general decoration.

Approved gradients:

```css
bg-gradient-to-r from-[#004A98] to-[#0066CC]
```

```css
bg-gradient-to-r from-[#0058B2] to-[#0066CC]
```

Use the gradient from `#004A98` to `#0066CC` for:

* High-emphasis primary actions.
* Selected overview panels.
* Important summary headers.
* Limited brand moments where a flat fill lacks sufficient distinction.

Use the gradient from `#0058B2` to `#0066CC` for:

* Secondary highlighted surfaces.
* Supporting data visualizations.
* Less dominant informational emphasis.

Gradient direction may change when required by the layout, such as `bg-gradient-to-b` or `bg-gradient-to-br`, but the approved color pairs must remain unchanged.

Do not use gradients:

* Across large page backgrounds.
* On standard cards.
* On every primary button.
* For passive status badges.
* As decoration without semantic or hierarchical purpose.

Prefer a flat `#004A98` fill for ordinary primary actions. Gradients should remain deliberate and relatively rare.

### Neutral Palette

* Use `#FFFFFF` for raised surfaces and major content panels.
* Use `#F8FAFC` for muted page backgrounds and low-emphasis section surfaces.
* Use `#E5E7EB` for default borders and separators.
* Use `#111827` for primary text.
* Use `#64748B` for supporting text and metadata.
* Do not introduce additional near-white or gray values without a clear semantic reason.
* Muted text must remain readable. Supporting information is not disabled content.

### Semantic Colors

Keep semantic colors stable across the application:

* Use emerald for success, completion, and valid states.
* Use UStudy blue for current, selected, active, and informational states.
* Use amber for warnings, incomplete requirements, and items requiring attention.
* Use rose or red for destructive actions, failures, and errors.

Use pale semantic backgrounds for passive badges, notices, and status chips. Pair them with a darker foreground and border when additional definition is needed.

Use saturated semantic colors for deliberate actions and clearly differentiated chart series, not for large decorative surfaces.

Do not use arbitrary accent colors, decorative color blobs, or unrelated gradients. Color must communicate hierarchy, state, category, or interaction.

### Schedule Palette

Reserve the schedule palette for distinguishing courses within a timetable:

* `#3B82F6`
* `#10B981`
* `#F59E0B`
* `#8B5CF6`
* `#EC4899`
* `#06B6D4`
* `#F97316`
* `#14B8A6`

Do not use the schedule palette for generic application statuses.

Assign schedule colors deterministically so that a course retains the same color while the user scans, edits, or revisits a timetable.

Do not communicate critical information through schedule color alone. Retain a label, icon, pattern, border, or another non-color indicator.

### Typography, Shape, and Elevation

* Use the existing Inter or system sans-serif stack.
* Keep letter spacing at `0`.
* Use font weight, size, spacing, and color to establish hierarchy.
* Prefer compact operational typography:

  * Page headings: approximately `20–24px`.
  * Section headings: approximately `14–16px`.
  * Standard content: approximately `14px`.
  * Labels and metadata: approximately `12px`.
* Use `rounded-xl` for established major cards and contained panels.
* Use `rounded-lg` for controls and smaller surfaces.
* Use pill shapes only for compact badges, counts, filters, or status chips.
* Use `border-gray-200` as the default boundary.
* Use `shadow-sm` for raised cards.
* Reserve stronger elevation for transient overlays, menus, dialogs, or clearly interactive hover states.
* Keep spacing aligned to a four-pixel rhythm.
* Prefer `gap-2`, `gap-3`, `gap-4`, and `gap-6`.
* Use whitespace to separate sections instead of adding unnecessary nested cards.

### Interaction States

Every interactive control must have a visible and consistent:

* Default state.
* Hover state.
* Keyboard-focus state.
* Active or selected state.
* Disabled state.

Use the following primary interaction pattern:

* Default: `#004A98`.
* Hover and pressed: `#003A78`.
* Focus ring: `rgba(0, 74, 152, 0.28)`.
* Restrained selected surface: a pale blue derived from the primary palette, such as `#EAF3FF`.

Use the UStudy blue focus ring for keyboard navigation. Never remove a focus outline without replacing it with an equally visible focus treatment.

Keep neutral hover states subtle, typically using a muted surface or pale brand surface.

Reserve strong blue fills and approved brand gradients for primary commands, active navigation, and deliberately emphasized states.

Use opacity or neutral surfaces for disabled controls, while retaining enough contrast for users to identify the control and read its label.


## Layout And Responsive Design

### Role-Based Layouts

- Split a screen by role, not just by visual symmetry. For example, a member form belongs in the main column while a compact roster belongs in a supporting column.
- Use a fixed or bounded supporting column when its content is naturally narrow, such as `lg:grid-cols-[minmax(0,1fr)_360px]`.
- Use `gap-4` as the default for adjacent work areas unless the screen genuinely needs more visual separation.
- Keep the main action area wider than the summary or roster area. Do not give a read-only list equal visual weight to an editor.
- Do not turn full page sections into floating cards. Cards are for repeated entities, dialogs, and contained tools.

### Responsiveness

- Define stable grid tracks, aspect ratios, and minimum widths for tool surfaces. Hover labels, long names, and loading states must not resize the layout.
- Collapse complex desktop grids to one column on mobile. Do not force narrow multi-column layouts just to preserve the desktop composition.
- Use mobile-specific tabs or sheets when two dense panels cannot coexist comfortably on a small screen.
- Reserve `sticky` behavior primarily for desktop side context and long-form action bars. Ensure sticky elements have a bounded parent and do not block important content.
- Check that sticky panels still scroll internally when their content exceeds the viewport.

### Cards, Lists, And Density

- Avoid card-inside-card compositions. A large workspace card containing a flat `divide-y` list is usually clearer than a stack of mini-cards.
- Use row-based rosters for members, courses, and similar repeated items. Expand details inline with an accordion when useful.
- Use borders and spacing to group data; do not add a new background, radius, and shadow to every nested level.
- Keep corner radius restrained for operational surfaces. Match existing components before introducing a new card treatment.
- Use `truncate`, `min-w-0`, and stable flex behavior around course names, member names, and long Vietnamese labels.

## Controls And Interaction

- Use icon buttons for compact actions such as remove, edit, filter, export, preview, undo, and close. Add a descriptive `title` or tooltip.
- Use text buttons for clear primary commands such as adding a member, confirming a plan, or creating a schedule.
- Use menus for low-frequency grouped actions: add semester, export, reset, import, and destructive utilities.
- Put an action that affects a panel near that panel. Do not place a roster visibility toggle inside an unrelated form.
- For long forms, keep the primary CTA visible at the bottom of the form with a sticky action bar. Include enough context that the command remains understandable.
- Confirm or visually distinguish destructive actions. Use the destructive tone only for actions that actually remove or reset user data.
- When an action has variants, such as export format, expose a compact submenu or selector rather than multiple primary buttons.

## Information States And Feedback

- Convey state with text or a badge as well as color. Examples include `Đang học`, `Từ dữ liệu`, `Dự kiến`, `Đã hoàn thành`, and `Cần thêm thành viên`.
- Keep the meaning of statuses stable across views. A current semester should not simultaneously appear as planned in one place and completed in another.
- Fallback UI is only for missing source data. It must not override or conflict with imported data.
- Warnings should identify the affected item precisely. For prerequisites, show `Mã môn - Tên môn`, with the code alone as a fallback.
- Empty states should describe the missing data or next possible action tersely. Do not use them as marketing copy.
- Use status counts in headers where they help scanning, for example member count plus group readiness.

## Persisted UI State

- Persist durable personal UI choices in `localStorage`: active tabs, collapsed categories, roster visibility, layout split width, and preference controls.
- Use a named key in `STORAGE_KEYS` for every persisted value. Avoid inline storage-key strings in feature components.
- Initialize local state from storage once, then save via an effect or an explicit state update path.
- Persist only user preferences and draft interaction state. Do not persist derived data that can be reconstructed from source records.
- When storage shape changes, validate it and fall back safely instead of assuming it is valid.

## Data Import And Refresh

- Keep raw imported payloads, processed student data, import metadata, and UI-derived data as separate layers.
- Imported data must carry the source information needed to interpret it. For registration records, preserve the semester captured from the Portal response, not merely a client-side default.
- Prefer authoritative source signals in this order: explicit page heading or response data, selected Portal control values, then a clearly documented fallback.
- Do not infer an imported semester from a currently selected app setting when the Portal response provides the actual period.
- Components that depend on imported cache must react to refresh events. Do not read a storage snapshot once at mount if imports can update during the same session.
- Retain backward-compatible handling for older imported records that lack newer optional fields; mark them as unknown rather than fabricating a value.

## Status And Planning Semantics

- Centralize course status resolution. Course lists, plan panels, and previews must use the same source of truth.
- A passed course has priority over a current registration. A current registration should resolve to `studying` when there is no completed status.
- Clearly distinguish imported semesters from manually planned semesters. Imported historical/current courses should not be removable through a planning-only control.
- A registered current semester may count toward the product's chosen "accumulated" progress metric, but its visual status should remain `Đang học`.
- Use a fallback "current planned semester" only when there is no imported current semester. Never show two current semesters because one is imported and another is a fallback.
- When creating defaults, preserve existing imported semesters and prevent duplicate semester identifiers.

## Credits, Categories, And Deduplication

- Define the aggregation scope before adding credits. Never sum nested course arrays without handling duplicates.
- Within a parent category, process children in their declared order. A course first counted in an earlier child is excluded from later siblings under that same parent.
- Propagate the set of already counted course IDs to child category displays so child badges and parent totals agree.
- Specialization groups with multiple specialization children represent alternatives. Their required credits and progress use the highest applicable child branch, not the sum of all specialization branches.
- A specialization with no specialization children still sums its own required subgroups, such as mandatory, elective, and free-elective requirements.
- Options represent alternative paths. Evaluate them as alternatives, not as additive course buckets.
- Deduplicate by stable course ID, not by name. Course names can change or repeat.
- Keep credit eligibility rules, such as accumulation exclusions, in a shared utility instead of duplicating them in UI components.

## Component And Logic Boundaries

- Pages orchestrate state, routing, storage, and feature-level callbacks.
- Presentation components render a focused part of the UI and receive explicit props. Do not bury unrelated business logic inside a list row or modal.
- Move parsing, normalization, credit aggregation, schedule scoring, and export-row building into hooks or utility modules once they serve more than one UI surface.
- Add an abstraction only when it removes real duplication or makes a boundary clearer. Do not create a generic component for a one-off layout.
- Use domain types for storage, import records, semester status, export rows, and preferences. Avoid leaking `any` beyond boundary adapters.
- Prefer maps and sets for course lookup and deduplication. Do not repeatedly scan full arrays inside deeply nested renders.
- Keep source data immutable. Derive display data with `useMemo` or pure helpers rather than mutating imported or stored objects.

## Export Design

- Build one normalized export row model first, then render that model into each format.
- Course-list exports should include at least semester, course code, course name, credits, and status.
- Use UTF-8 BOM for CSV so Vietnamese text opens correctly in spreadsheet applications.
- Generate a real workbook for `.xlsx`; do not rename a CSV file with an Excel extension.
- Keep export commands in a menu near plan-level utilities. Do not crowd the primary editing toolbar.
- Use a deterministic, human-readable filename with the export date.

## Engineering And Verification

- Read the surrounding code and reuse established project conventions before changing a feature.
- Use `rg` for code discovery and inspect all call sites of shared helpers before changing their behavior.
- Preserve unrelated worktree changes. Never revert, format, or refactor files outside the requested scope without a clear need.
- Use `apply_patch` for manual file edits.
- Run `npm run build` after TypeScript or React changes. Report genuine environmental failures separately from code failures.
- For UI changes with meaningful layout impact, verify desktop and mobile views. Check long text, overflow, sticky behavior, menu placement, empty states, and scrolling.
- For imported-data changes, test the complete path: source payload, processing, cache refresh, status resolution, and rendered view.
- Keep comments short and explanatory. Prefer clear names and straightforward code over commentary that repeats the implementation.
