// Enable submit button only when form changes
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('#updateForm');
    const submitButton = form.querySelector('button[type="submit"]');
    
    form.addEventListener('change', function() {
      submitButton.disabled = false;
    });
    
    // Disable button on initial load
    submitButton.disabled = true;
  });