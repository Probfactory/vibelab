/**
 * ============================================================
 * EXPLORE FILTER CONFIGURATION — Custom Dropdown Component
 * ============================================================
 *
 * Reusable custom-styled dropdown to replace native <select> elements.
 * Designed to match VibeLab's design system (pill-shaped, rounded menus,
 * accent highlight on selected option, fade-in animation).
 *
 * USAGE:
 * ------
 * 1. Include this script:  <script src="js/custom-dropdown.js"></script>
 * 2. Include the CSS block below (already in css/styles.css under "Custom Dropdown Component")
 * 3. Add HTML markup (see createCustomDropdown helper or manual HTML below)
 *
 * HTML MARKUP (manual):
 * ---------------------
 *   <div class="custom-dropdown" id="my-dropdown">
 *     <button class="custom-dropdown-trigger" onclick="toggleCustomDropdown('my-dropdown')">
 *       <span class="custom-dropdown-label">Default Label</span>
 *       <svg class="custom-dropdown-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
 *         <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 *       </svg>
 *     </button>
 *     <div class="custom-dropdown-menu">
 *       <div class="custom-dropdown-option selected" data-value="all"
 *            onclick="selectDropdownOption('my-dropdown', 'all', 'Default Label')">Default Label</div>
 *       <div class="custom-dropdown-option" data-value="opt1"
 *            onclick="selectDropdownOption('my-dropdown', 'opt1', 'Option 1')">Option 1</div>
 *     </div>
 *   </div>
 *
 * JS HELPER — createCustomDropdown(config):
 * ------------------------------------------
 *   const html = createCustomDropdown({
 *     id: 'my-dropdown',
 *     defaultLabel: 'All Items',
 *     options: [
 *       { value: 'all', label: 'All Items' },
 *       { value: 'web', label: 'Web' },
 *       { value: 'mobile', label: 'Mobile' },
 *     ],
 *     onChange: (value) => { console.log('Selected:', value); }
 *   });
 *   document.getElementById('container').innerHTML = html;
 *
 * CSS CLASSES:
 * ------------
 *   .custom-dropdown            — wrapper (position: relative)
 *   .custom-dropdown-trigger    — the pill button
 *   .custom-dropdown-label      — text inside trigger
 *   .custom-dropdown-chevron    — SVG arrow icon
 *   .custom-dropdown-menu       — floating options panel
 *   .custom-dropdown-option     — individual option row
 *   .custom-dropdown-option.selected — highlighted active option
 *   .custom-dropdown.open       — modifier when dropdown is expanded
 *   .custom-dropdown.disabled   — modifier when dropdown is disabled
 *
 * REQUIRED CSS VARIABLES (from VibeLab design tokens):
 * ----------------------------------------------------
 *   --border, --surface, --text, --text-secondary,
 *   --bg-alt, --accent-soft, --radius, --shadow-lg
 *
 * ============================================================
 */

// ---- Registry for per-dropdown onChange callbacks ----
const _dropdownCallbacks = {};

/**
 * Toggle a custom dropdown open/closed.
 * Closes all other open dropdowns first.
 */
function toggleCustomDropdown(id) {
  const dd = document.getElementById(id);
  if (!dd) return;
  const wasOpen = dd.classList.contains('open');
  const trigger = dd.querySelector('.custom-dropdown-trigger');
  // Close every open dropdown and reset their aria-expanded
  document.querySelectorAll('.custom-dropdown.open').forEach(d => {
    d.classList.remove('open');
    const t = d.querySelector('.custom-dropdown-trigger');
    if (t) t.setAttribute('aria-expanded', 'false');
  });
  if (!wasOpen) {
    dd.classList.add('open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  }
}

/**
 * Select an option inside a custom dropdown.
 * Updates the label, highlights the option, closes the menu,
 * and fires the registered onChange callback (if any).
 */
function selectDropdownOption(dropdownId, value, label) {
  const dd = document.getElementById(dropdownId);
  if (!dd) return;

  // Update visible label
  const labelEl = dd.querySelector('.custom-dropdown-label');
  if (labelEl) labelEl.textContent = label;

  // Highlight selected option and update aria-selected
  dd.querySelectorAll('.custom-dropdown-option').forEach(opt => {
    const isMatch = opt.getAttribute('data-value') === value;
    opt.classList.toggle('selected', isMatch);
    opt.setAttribute('aria-selected', isMatch ? 'true' : 'false');
  });

  // Close menu and update aria-expanded
  dd.classList.remove('open');
  const trigger = dd.querySelector('.custom-dropdown-trigger');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');

  // Fire callback
  if (_dropdownCallbacks[dropdownId]) {
    _dropdownCallbacks[dropdownId](value, label);
  }
}

/**
 * Get the currently selected value of a custom dropdown.
 */
function getDropdownValue(dropdownId) {
  const dd = document.getElementById(dropdownId);
  if (!dd) return null;
  const selected = dd.querySelector('.custom-dropdown-option.selected');
  return selected ? selected.getAttribute('data-value') : null;
}

/**
 * Programmatically set the value of a custom dropdown.
 */
function setDropdownValue(dropdownId, value) {
  const dd = document.getElementById(dropdownId);
  if (!dd) return;
  const option = dd.querySelector(`.custom-dropdown-option[data-value="${value}"]`);
  if (option) {
    selectDropdownOption(dropdownId, value, option.textContent.trim());
  }
}

/**
 * Register an onChange callback for a dropdown.
 * callback(value, label)
 */
function onDropdownChange(dropdownId, callback) {
  _dropdownCallbacks[dropdownId] = callback;
}

/**
 * Generate HTML string for a custom dropdown.
 *
 * @param {Object} config
 * @param {string} config.id           — unique DOM id
 * @param {string} config.defaultLabel — label shown when default/first option selected
 * @param {Array}  config.options      — [{ value: string, label: string }]
 * @param {Function} [config.onChange] — optional callback(value, label)
 * @returns {string} HTML string
 */
function createCustomDropdown(config) {
  const { id, defaultLabel, options, onChange } = config;

  // Register callback if provided
  if (onChange) {
    _dropdownCallbacks[id] = onChange;
  }

  const chevronSVG = `<svg class="custom-dropdown-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const optionsHTML = options.map((opt, i) => {
    const isSelected = i === 0 ? ' selected' : '';
    return `<div class="custom-dropdown-option${isSelected}" data-value="${opt.value}" role="option" tabindex="-1" aria-selected="${i === 0 ? 'true' : 'false'}">${opt.label}</div>`;
  }).join('\n          ');

  return `
    <div class="custom-dropdown" id="${id}">
      <button class="custom-dropdown-trigger" aria-expanded="false" aria-haspopup="listbox" onclick="toggleCustomDropdown('${id}')">
        <span class="custom-dropdown-label">${defaultLabel}</span>
        ${chevronSVG}
      </button>
      <div class="custom-dropdown-menu" role="listbox">
        ${optionsHTML}
      </div>
    </div>`;
}

// ---- Global: close dropdowns when clicking outside ----
document.addEventListener('click', function(e) {
  if (!e.target.closest('.custom-dropdown')) {
    document.querySelectorAll('.custom-dropdown.open').forEach(d => {
      d.classList.remove('open');
      const t = d.querySelector('.custom-dropdown-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }
});

// ---- Keyboard navigation for custom dropdowns ----
document.addEventListener('keydown', function(e) {
  const dd = e.target.closest('.custom-dropdown');
  if (!dd) return;

  const trigger = dd.querySelector('.custom-dropdown-trigger');
  const menu = dd.querySelector('.custom-dropdown-menu');
  const options = Array.from(dd.querySelectorAll('.custom-dropdown-option'));
  if (!options.length) return;

  const isOpen = dd.classList.contains('open');
  const focused = dd.querySelector('.custom-dropdown-option:focus');
  const currentIndex = focused ? options.indexOf(focused) : -1;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (!isOpen) {
        toggleCustomDropdown(dd.id);
        options[0].focus();
      } else {
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        options[nextIndex].focus();
      }
      break;

    case 'ArrowUp':
      e.preventDefault();
      if (isOpen) {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        options[prevIndex].focus();
      }
      break;

    case 'Enter':
    case ' ':
      if (isOpen && focused) {
        e.preventDefault();
        selectDropdownOption(dd.id, focused.getAttribute('data-value'), focused.textContent.trim());
        trigger.focus();
      }
      break;

    case 'Escape':
      if (isOpen) {
        e.preventDefault();
        dd.classList.remove('open');
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      }
      break;

    case 'Home':
      if (isOpen) {
        e.preventDefault();
        options[0].focus();
      }
      break;

    case 'End':
      if (isOpen) {
        e.preventDefault();
        options[options.length - 1].focus();
      }
      break;
  }
});

// ---- Click delegation for dropdown options ----
document.addEventListener('click', function(e) {
  const option = e.target.closest('.custom-dropdown-option');
  if (!option) return;
  const dd = option.closest('.custom-dropdown');
  if (!dd) return;
  selectDropdownOption(dd.id, option.getAttribute('data-value'), option.textContent.trim());
});
