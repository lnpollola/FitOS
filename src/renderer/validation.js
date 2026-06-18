export function addFormValidation(formEl) {
  const inputs = formEl.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateField(input);
    });
    input.addEventListener('input', () => {
      if (input.dataset.touched) validateField(input);
    });
  });

  formEl.addEventListener('submit', (e) => {
    let valid = true;
    inputs.forEach(input => {
      input.dataset.touched = 'true';
      if (!validateField(input)) valid = false;
    });
    if (!valid) e.preventDefault();
  });
}

function validateField(input) {
  const errorEl = input.parentElement.querySelector('.field-error');
  let error = '';

  if (input.required && !input.value.trim()) {
    error = 'This field is required';
  } else if (input.type === 'number' && input.value) {
    const val = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    if (input.min && val < min) error = `Minimum value is ${min}`;
    else if (input.max && val > max) error = `Maximum value is ${max}`;
    else if (input.step && input.step.includes('.') && isNaN(val)) error = 'Enter a valid number';
  } else if (input.type === 'date' && input.value && isNaN(Date.parse(input.value))) {
    error = 'Enter a valid date';
  }

  if (errorEl) errorEl.textContent = error;
  else if (error) {
    const el = document.createElement('div');
    el.className = 'field-error';
    el.style.cssText = 'color:#e94560;font-size:12px;margin-top:2px';
    el.textContent = error;
    input.parentElement.appendChild(el);
  }

  input.style.borderColor = error ? '#e94560' : '';
  return !error;
}
