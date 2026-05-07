---
name: ui-design-principles
description: |
  Project UI design principles based on Practical UI (2nd ed.) — minimalism,
  consistency, accessibility, clear hierarchy. Includes the design workflow
  for new components and a chapter index pointing to the canonical Practical UI
  reference. Use when designing or reviewing visual aspects (layout, color,
  spacing, typography, buttons, forms) of components in this codebase.
version: 1.0.0
---

# UI Design Principles

> This project's visual standards follow *Practical UI* (2nd ed.).
> For a11y and general UI rules: pair with `Web Design Guidelines` Skill.
> For component layering / composition: pair with `atomic-design-convention` Skill.

## Core Principles

- **Minimalism**: Remove unnecessary elements to reduce cognitive load
- **Consistency**: Maintain visual and interaction consistency
- **Accessibility**: Interface is usable by all users
- **Clear hierarchy**: Use colour, spacing, and typography to build visual hierarchy

## Priority Rule

> **Accessibility over visual minimalism**: When `Web Design Guidelines` Skill rules
> (ARIA, focus states, contrast, keyboard navigation) conflict with purely visual
> simplification, **accessibility takes precedence**.

## Design Workflow

1. Confirm the component layer (atoms / molecules / organisms — see `atomic-design-convention` Skill)
2. Find the relevant guideline in the Practical UI chapter index below
3. Ask the user when a guideline is unclear
4. Ensure the final design matches the project's visual consistency

## Practical UI (2nd ed.) Chapter Reference

> Practical-UI-2nd-edition.pdf is not in version control due to copyright and file size; distribution is handled internally by the team.
> Without the PDF, develop using this Skill's chapter reference and core principles.

### 1. Fundamentals — pp. 16–53

- Minimise usability risks — p. 17
- Have a logical reason for every design detail — p. 19
- Minimise interaction cost — p. 21
- Minimise cognitive load — p. 24
- Create a design system — p. 26
- Ensure the interface is accessible — p. 35
- Use common design patterns — p. 40
- Use the 80/20 Rule to prioritise — p. 42
- Keep costs in mind — p. 43
- Be consistent — p. 44
- Clearly indicate interaction states — p. 47

### 2. Less is more — pp. 55–76

- Remove unnecessary information — p. 56
- Remove unnecessary styles — p. 57
- Not all links need to be underlined — p. 59
- Use progressive disclosure — p. 61
- Don't confuse minimalism with simplicity — p. 63
- Make sure important content is visible — p. 65
- Design for the smallest screen first — p. 66
- Reduce choice to speed up decision making — p. 67

### 3. Colour — pp. 78–161

- Ensure sufficient contrast — p. 79
- Don't rely on colour alone to convey meaning — p. 85
- Use system colours to indicate status — p. 87
- Use colour to define a clear visual hierarchy — p. 89
- Use black and white for a timeless aesthetic — p. 91
- Add a tinge of colour to black and white — p. 93
- Use 1 brand colour — p. 94
- Apply the brand colour to interactive elements — p. 96
- Create a colour palette with rules that govern its usage — p. 103
- Use the HSB colour system — p. 105
- 5 colour variations is often all you need — p. 106
- Create a dark colour palette — p. 116
- Add depth using colour and shadows — p. 120
- Consider using transparent colours — p. 124
- Create a transparent colour palette — p. 129
- Use transparent layers for interaction states — p. 142
- Name colours to keep them organised — p. 146
- Adjust photo colour temperature to match the colour palette — p. 152

### 4. Layout and spacing — pp. 163–227

- Group related elements — p. 164
- Create a clear visual hierarchy — p. 179
- Test visual hierarchy using The Squint Test — p. 187
- Use depth to create visual hierarchy — p. 188
- Understand the box model — p. 189
- Design @1x using points — p. 191
- Create a set of predefined spacing options — p. 192
- Space elements based on how closely related they are — p. 194
- Be generous with white space — p. 201
- Align the main layout to a 12 column grid — p. 203
- Align text to improve readability — p. 207
- Try to avoid using multiple alignments — p. 210
- Keep related actions close — p. 213
- Ensure your interface is unbreakable — p. 216
- Use the Rule of Thirds for photos — p. 217

### 5. Typography — pp. 229–264

- Use a single sans serif typeface — p. 230
- Evoke emotion using a second typeface for headings — p. 237
- Use regular and bold font weights only — p. 239
- Use a type scale to set font sizes — p. 241
- Make long body text bigger — p. 244
- Use at least 1.5 line height for long body text — p. 245
- Decrease line height as font size increases — p. 247
- Ensure ideal line length — p. 248
- Left align text — p. 251
- Decrease letter spacing for large text — p. 253
- Ensure text on photos is legible — p. 254
- Avoid light grey and pure black text — p. 257

### 6. Copywriting — pp. 266–293

- Be concise — p. 267
- Use sentence case — p. 269
- Use plain and simple language — p. 270
- Front-load text — p. 271
- Use the inverted pyramid — p. 272
- Limit the use of abbreviations and acronyms — p. 274
- Limit the use of UPPERCASE — p. 275
- Break up content using descriptive headings and bullets — p. 276
- Avoid using "my" on form labels — p. 278
- Use vocabulary consistently — p. 279
- Use numerals for numbers — p. 281
- Avoid full stops if possible — p. 283
- Ensure text length is similar across similar interface elements — p. 284
- Ensure text links describe their destination — p. 285
- Write clear error messages — p. 287

### 7. Buttons — pp. 295–328

- Define 3 button weights — p. 296
- Use a single primary button for the most important action — p. 303
- Use secondary buttons for less important actions — p. 305
- Use tertiary buttons for the least important actions — p. 306
- Try to avoid disabled buttons — p. 307
- Left align buttons — p. 312
- Ensure button text describes the action — p. 317
- Ensure buttons have a sufficient target size — p. 318
- Balance icon and text pairs — p. 320
- Add friction to destructive actions — p. 322

### 8. Forms — pp. 330–369

- Stack forms in a single column layout — p. 331
- Minimise the number of form fields — p. 336
- Mark optional fields — p. 337
- Try to avoid optional fields by using opt-ins — p. 338
- Mark both required and optional fields — p. 339
- Match field width to the intended input — p. 344
- Stick with conventional form field styles — p. 346
- Display hints above form fields — p. 348
- Don't use placeholder text instead of a label — p. 350
- Ensure form field labels are close to their fields — p. 352
- Try to use radio buttons instead of dropdowns — p. 353
- Use an autocomplete instead of a long dropdown — p. 354
- Use steppers for numeric fields instead of dropdowns — p. 356
- Use a checkbox or toggle switch for 2 options — p. 358
- Use positive phrasing for checkboxes — p. 360
- Break up long forms into multiple steps — p. 361
- Group related fields under headings — p. 362
- Ensure form field borders are high contrast — p. 363
- Choose your form validation approach — p. 364

## Component Composition UI Handling

Outer containers manage border radius and spacing uniformly — avoid hardcoding `margin` or `rounded-lg` inside components as this causes stacking conflicts. See `atomic-design-convention` Skill for detailed component composition rules; see the corresponding Skills for shadcn and Tailwind technical details.
