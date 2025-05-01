describe("User Login and Email Update Flow (FR3 + FR10)", () => {
  const userId = "user-123";
  const originalEmail = "alice@example.com";
  const updatedEmail = "alice+updated@example.com";

  beforeEach(() => {
    // Stub login
    cy.intercept("POST", "/api/auth/login", (req) => {
      const { email, password } = req.body;
      if (email === originalEmail && password === "Correct$123") {
        req.reply({
          statusCode: 200,
          body: { message: "Login successful" },
          headers: { "Set-Cookie": "session=abc123; Path=/" },
        });
      } else {
        req.reply({
          statusCode: 401,
          body: { error: "Invalid credentials." },
        });
      }
    }).as("loginRequest");

    // Stub initial /me call with original email
    cy.intercept("GET", "/api/auth/me", {
      statusCode: 200,
      body: {
        user: {
          id: userId,
          email: originalEmail,
          role: "user",
        },
      },
    }).as("getMe");

    // Stub PUT for email update
    cy.intercept("PUT", `/api/user/${userId}`, {
      statusCode: 200,
      body: { message: "Email updated successfully" },
    }).as("updateEmail");
  });

  it("logs in and updates the email successfully", () => {
    // Step 1: Login
    cy.visit("/signin");
    cy.get('[data-cy="login-form"]').within(() => {
      cy.get('input[id="email"]').type(originalEmail);
      cy.get('input[id="password"]').type("Correct$123");
      cy.get('button').contains("Sign In").click();
    });

    cy.url().should("eq", "http://localhost:3000/home");
    cy.getCookie("session").should("have.property", "value", "abc123");

    // Step 2: Navigate to profile
    cy.visit("/profile");
    cy.wait("@getMe");

    // Step 3: Type new email
    cy.get('[data-cy="email-input"]').clear().type(updatedEmail);

    // Step 4: Intercept refreshed GET /me with updated email AFTER clicking Save
    cy.intercept("GET", "/api/auth/me", {
      statusCode: 200,
      body: {
        user: {
          id: userId,
          email: updatedEmail,
          role: "user",
        },
      },
    }).as("refreshUser");

    // Step 5: Click save
    cy.get('[data-cy="save-button"]').should("not.be.disabled").click();

    // Step 6: Wait for PUT and updated GET
    cy.wait("@updateEmail");
    cy.wait("@refreshUser");

    // Step 7: Assertions
    cy.contains("Email updated successfully").should("be.visible");
    cy.get('[data-cy="email-input"]').should("have.value", updatedEmail);
  });
});
