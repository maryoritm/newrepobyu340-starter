document.getElementById("reviewForm")?.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
      vehicle_id: form.vehicle_id.value,
      rating: form.rating.value,
      comment: form.comment.value.trim()
    };
  
    // Validation
    const errors = [];
    if (!formData.rating || isNaN(formData.rating) || formData.rating < 1 || formData.rating > 5) {
      errors.push("Please select a valid rating (1-5).");
    }
    if (!formData.comment || formData.comment.length < 10) {
      errors.push("Comment must be at least 10 characters.");
    }
  
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }
  
    // Submit via fetch
    try {
      const response = await fetch('/reviews/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include', // ESSENTIAL for cookies
        body: JSON.stringify(formData)
      });
  
      if (response.redirected) {
        return window.location.href = response.url;
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Server error");
      }
  
      window.location.reload();
    } catch (error) {
      console.error("Fetch error:", error);
      alert(error.message || "Connection error. Please reload the page and log in again.");
    }
  });