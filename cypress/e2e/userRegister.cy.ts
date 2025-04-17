describe("User Registration (FR2)", () => {
  beforeEach(() => {
    // Visit the sign-in page, which contains the registration form
    cy.visit("/signin");

    // Mock the /api/auth/register endpoint
    cy.intercept("POST", "/api/auth/register", (req) => {
      const { first_name, last_name, email, password, role } = req.body;
      // Simulate a successful registration for valid data
      if (
        first_name === "John" &&
        last_name === "Doe" &&
        email === "john.doe@example.com" &&
        password === "Password$123" &&
        role === "user"
      ) {
        req.reply({
          statusCode: 200,
          body: { message: "User registered successfully" },
        });
      } else {
        req.reply({
          statusCode: 400,
          body: { error: "Registration failed." },
        });
      }
    }).as("registerRequest");
  });

  it("should show an error when passwords do not match during registration", () => {
    // Target the registration form
    cy.get('[data-cy="register-form"]').within(() => {
      // Fill in the registration form with mismatched passwords
      cy.get('input[id="firstName"]').type("John");
      cy.get('input[id="lastName"]').type("Doe");
      cy.get('input[id="email"]').type("john.doe@example.com");
      cy.get('input[id="password"]').type("Password$123");
      cy.get('input[id="repeatPassword"]').type("Different$123"); // Mismatched password

      // Submit the form
      cy.get('button').contains("Register").click();

      // Assert: Error message for mismatched passwords is displayed
      cy.contains("Passwords do not match").should("be.visible");
    });

    // Assert: No redirect occurs
    cy.url().should("eq", "http://localhost:3000/signin");
  });

  it("should allow a user to register successfully and redirect to homepage", () => {
    // Target the registration form
    cy.get('[data-cy="register-form"]').within(() => {
      // Fill in the registration form with valid data
      cy.get('input[id="firstName"]').type("John");
      cy.get('input[id="lastName"]').type("Doe");
      cy.get('input[id="email"]').type("john.doe@example.com");
      cy.get('input[id="password"]').type("Password$123");
      cy.get('input[id="repeatPassword"]').type("Password$123");

      // Submit the form
      cy.get('button').contains("Register").click();
    });

    // Assert: Redirects to /home
    cy.url().should("eq", "http://localhost:3000/home");
  });
});