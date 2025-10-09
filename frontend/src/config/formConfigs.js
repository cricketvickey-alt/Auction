// Example form configurations for different use cases

export const playerRegistrationConfig = {
  title: "Player Registration",
  description: "Register for the cricket auction",
  fields: [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Enter your full name"
    },
    {
      name: "batch",
      label: "Batch",
      type: "number",
      required: true,
      min: 1,
      max: 31,
      placeholder: "Enter batch (1-31)"
    },
    {
      name: "house",
      label: "House",
      type: "select",
      required: true,
      options: [
        { value: "", label: "Select House" },
        { value: "Aravali", label: "Aravali" },
        { value: "Shivalik", label: "Shivalik" },
        { value: "Udaigiri", label: "Udaigiri" },
        { value: "Nilgiri", label: "Nilgiri" }
      ]
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      required: true,
      placeholder: "Enter phone number (registered with CricHeroes)",
      description: "Must be registered with CricHeroes App"
    },
    {
      name: "strength",
      label: "Playing Strength",
      type: "select",
      required: true,
      options: [
        { value: "", label: "Select Strength" },
        { value: "Batsman", label: "Batsman" },
        { value: "BattingAllrounder", label: "Batting Allrounder" },
        { value: "Bowler", label: "Bowler" },
        { value: "Bowling allrounder", label: "Bowling Allrounder" },
        { value: "All rounder", label: "All Rounder" }
      ]
    },
    {
      name: "totalMatchPlayed",
      label: "Total Matches Played",
      type: "number",
      required: false,
      min: 0,
      placeholder: "Enter total matches played"
    },
    {
      name: "totalScore",
      label: "Total Runs Scored",
      type: "number",
      required: false,
      min: 0,
      placeholder: "Enter total runs scored"
    },
    {
      name: "totalWicket",
      label: "Total Wickets Taken",
      type: "number",
      required: false,
      min: 0,
      placeholder: "Enter total wickets taken"
    },
    {
      name: "photoUrl",
      label: "Photo URL",
      type: "url",
      required: false,
      placeholder: "Enter photo URL (optional)"
    }
  ],
  submitButton: {
    text: "Register",
    successMessage: "Registration successful!",
    errorMessage: "Registration failed. Please try again."
  }
};

// Simple contact form example
export const contactFormConfig = {
  title: "Contact Us",
  description: "Get in touch with us",
  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Your name"
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "your@email.com"
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      required: true,
      rows: 5,
      placeholder: "Your message..."
    }
  ],
  submitButton: {
    text: "Send Message",
    successMessage: "Message sent successfully!",
    errorMessage: "Failed to send message."
  }
};

// Survey form example
export const surveyFormConfig = {
  title: "Player Feedback Survey",
  description: "Help us improve the auction experience",
  fields: [
    {
      name: "playerName",
      label: "Your Name",
      type: "text",
      required: true
    },
    {
      name: "experience",
      label: "How was your experience?",
      type: "radio",
      required: true,
      options: [
        { value: "excellent", label: "Excellent" },
        { value: "good", label: "Good" },
        { value: "average", label: "Average" },
        { value: "poor", label: "Poor" }
      ]
    },
    {
      name: "wouldRecommend",
      label: "Would you recommend this to others?",
      type: "checkbox",
      required: false
    },
    {
      name: "suggestions",
      label: "Suggestions for Improvement",
      type: "textarea",
      required: false,
      rows: 4,
      placeholder: "Share your thoughts..."
    }
  ],
  submitButton: {
    text: "Submit Feedback",
    successMessage: "Thank you for your feedback!",
    errorMessage: "Failed to submit feedback."
  }
};
