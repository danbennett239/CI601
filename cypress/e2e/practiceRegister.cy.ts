describe("Dental Practice Registration (FR5)", () => {
  beforeEach(() => {
    cy.visit("/signin");
    cy.intercept("PUT", "/api/integrations/upload", {
      statusCode: 200,
      body: { fileUrl: "https://fake-url.com/practice-photo.jpg" },
    }).as("uploadPhoto");

    cy.intercept("POST", "/api/practice/register", (req) => {
      const { practiceName, email, password, address, openingHours, practiceServices } = req.body;
      if (
        practiceName === "Healthy Smiles Dental" &&
        email === "practice@example.com" &&
        password === "Secure$123" &&
        address.line1 === "123 Dental Street" &&
        address.city === "London" &&
        address.postcode === "SW1A 1AA" &&
        address.country === "UK" &&
        openingHours.length === 7 &&
        Object.keys(practiceServices).includes("checkup")
      ) {
        req.reply({ statusCode: 302, headers: { Location: "/home" } })
      } else {
        req.reply({
          statusCode: 400,
          body: { error: "Registration failed." },
        });
      }
    }).as("registerPractice");
  });

  it("should navigate to /practice-register when clicking the 'Register here' link", () => {
    cy.get('[data-cy="practice-register-link"]').click();
    cy.url().should("eq", "http://localhost:3000/practice-register");
  });

  it("should show an error when passwords do not match during practice registration", () => {
    cy.get('[data-cy="practice-register-link"]').click();

    cy.get('[data-cy="practice-register-form"]').within(() => {
      // Simulate photo upload
      cy.get('[data-cy="photo-input"]').selectFile({
        contents: Cypress.Buffer.from("fake-image-data"),
        fileName: "practice-photo.jpg",
        mimeType: "image/jpeg",
      }, { force: true });

      cy.get('[data-cy="practice-name-input"]').type("Healthy Smiles Dental");
      cy.get('[data-cy="email-input"]').type("practice@example.com");
      cy.get('[data-cy="phone-number-input"]').type("01234 567890");
      cy.get('[data-cy="password-input"]').type("Secure$123");
      cy.get('[data-cy="repeat-password-input"]').type("Different$123");

      cy.get('[data-cy="address-line1-input"]').type("123 Dental Street");
      cy.get('[data-cy="city-input"]').type("London");
      cy.get('[data-cy="postcode-input"]').type("SW1A 1AA");
      cy.get('[data-cy="country-input"]').type("UK");

      // Set Monday's hours
      cy.get('[data-cy="monday-open-input"]').type("09:00");
      cy.get('[data-cy="monday-close-input"]').type("17:00");

      // Mark other days as closed
      const days = ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      days.forEach((day) => {
        cy.get(`[data-cy="${day}-closed-checkbox"]`).check();
      });

      cy.get('[data-cy="checkup-service-checkbox"]').check();
      cy.get('[data-cy="checkup-price-input"]').type("50");

      cy.get('[data-cy="submit-button"]').click();

      cy.contains("Passwords do not match").should("be.visible");
    });

    cy.url().should("eq", "http://localhost:3000/practice-register");
  });

  it("should allow a practice to register successfully, redirect to homepage", () => {
    cy.get('[data-cy="practice-register-link"]').click();

    cy.get('[data-cy="practice-register-form"]').within(() => {
      // Simulate photo upload
      cy.get('[data-cy="photo-input"]').selectFile({
        contents: Cypress.Buffer.from("fake-image-data"),
        fileName: "practice-photo.jpg",
        mimeType: "image/jpeg",
      }, { force: true });

      cy.get('[data-cy="practice-name-input"]').type("Healthy Smiles Dental");
      cy.get('[data-cy="email-input"]').type("practice@example.com");
      cy.get('[data-cy="phone-number-input"]').type("01234 567890");
      cy.get('[data-cy="password-input"]').type("Secure$123");
      cy.get('[data-cy="repeat-password-input"]').type("Secure$123");

      cy.get('[data-cy="address-line1-input"]').type("123 Dental Street");
      cy.get('[data-cy="city-input"]').type("London");
      cy.get('[data-cy="postcode-input"]').type("SW1A 1AA");
      cy.get('[data-cy="country-input"]').type("UK");

      // Set Monday's hours
      cy.get('[data-cy="monday-open-input"]').type("09:00");
      cy.get('[data-cy="monday-close-input"]').type("17:00");

      // Mark other days as closed
      const days = ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      days.forEach((day) => {
        cy.get(`[data-cy="${day}-closed-checkbox"]`).check();
      });

      cy.get('[data-cy="checkup-service-checkbox"]').check();
      cy.get('[data-cy="checkup-price-input"]').type("50");

      cy.get('[data-cy="submit-button"]').click();
    });

    cy.url().should("eq", "http://localhost:3000/home");
  });
});