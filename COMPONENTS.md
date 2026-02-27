# VibeLab — Reusable Components

## Explore Filter Configuration (Custom Dropdown)

**Files:**
- `js/custom-dropdown.js` — JS logic (toggle, select, callbacks, helper)
- `css/styles.css` — CSS under `/* Custom Dropdown Component */` section (lines ~726–787)

**What it is:**
A fully custom-styled dropdown component that replaces native `<select>` elements. Matches VibeLab's pill-shaped design system with rounded menus, accent highlights, and fade-in animation.

**Currently used in:**
- `feed.html` — Category filter, Built-with filter, Status filter

---

### Quick Start — Drop-in HTML

```html
<!-- 1. Include the script -->
<script src="js/custom-dropdown.js"></script>

<!-- 2. Add dropdown markup -->
<div class="custom-dropdown" id="my-filter">
  <button class="custom-dropdown-trigger" onclick="toggleCustomDropdown('my-filter')">
    <span class="custom-dropdown-label">All Items</span>
    <svg class="custom-dropdown-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
      <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="custom-dropdown-menu">
    <div class="custom-dropdown-option selected" data-value="all"
         onclick="selectDropdownOption('my-filter', 'all', 'All Items')">All Items</div>
    <div class="custom-dropdown-option" data-value="opt1"
         onclick="selectDropdownOption('my-filter', 'opt1', 'Option 1')">Option 1</div>
    <div class="custom-dropdown-option" data-value="opt2"
         onclick="selectDropdownOption('my-filter', 'opt2', 'Option 2')">Option 2</div>
  </div>
</div>

<!-- 3. Wire a callback -->
<script>
  onDropdownChange('my-filter', (value, label) => {
    console.log('Selected:', value, label);
  });
</script>
```

### Quick Start — JS Helper

```js
// Generate HTML dynamically
const html = createCustomDropdown({
  id: 'sort-dropdown',
  defaultLabel: 'Sort by: Trending',
  options: [
    { value: 'trending', label: 'Sort by: Trending' },
    { value: 'newest',   label: 'Sort by: Newest' },
    { value: 'popular',  label: 'Sort by: Popular' },
  ],
  onChange: (value) => handleSort(value)
});

document.getElementById('toolbar').insertAdjacentHTML('beforeend', html);
```

### API Reference

| Function | Description |
|---|---|
| `toggleCustomDropdown(id)` | Open/close a dropdown by id |
| `selectDropdownOption(id, value, label)` | Select an option programmatically |
| `getDropdownValue(id)` | Get the current selected value |
| `setDropdownValue(id, value)` | Set value programmatically |
| `onDropdownChange(id, callback)` | Register an onChange listener |
| `createCustomDropdown(config)` | Generate dropdown HTML string |

### CSS Classes

| Class | Purpose |
|---|---|
| `.custom-dropdown` | Wrapper (position: relative) |
| `.custom-dropdown-trigger` | The pill-shaped button |
| `.custom-dropdown-label` | Text inside the trigger |
| `.custom-dropdown-chevron` | SVG chevron arrow |
| `.custom-dropdown-menu` | Floating options panel |
| `.custom-dropdown-option` | Individual option row |
| `.custom-dropdown-option.selected` | Active/highlighted option |
| `.custom-dropdown.open` | When dropdown is expanded |
| `.custom-dropdown.disabled` | When dropdown is disabled |

### Design Tokens Used

`--border`, `--surface`, `--text`, `--text-secondary`, `--bg-alt`, `--accent-soft`, `--radius`, `--shadow-lg`
