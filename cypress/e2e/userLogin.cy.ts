describe("User Sign-In (FR3)", () => {
  beforeEach(() => {
    cy.visit("/signin");
    cy.intercept("POST", "/api/auth/login", (req) => {
      const { email, password } = req.body;
      if (email === "alice@example.com" && password === "Correct$123") {
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
  });

  it("should show an error when logging in with incorrect credentials", () => {
    cy.get('[data-cy="login-form"]').within(() => {
      cy.get('input[id="email"]').type("alice@example.com");
      cy.get('input[id="password"]').type("WrongPass");
      cy.get('button').contains("Sign In").click();
      cy.contains("Invalid credentials.").should("be.visible");
    });
    cy.url().should("eq", "http://localhost:3000/signin");
    cy.getCookie("session").should("not.exist");
  });

  it("should allow a registered user to log in with correct credentials and redirect to dashboard", () => {
    cy.get('[data-cy="login-form"]').within(() => {
      cy.get('input[id="email"]').type("alice@example.com");
      cy.get('input[id="password"]').type("Correct$123");
      cy.get('button').contains("Sign In").click();
    });

    // Removed toast assertion
    cy.url().should("eq", "http://localhost:3000/home");
    cy.getCookie("session").should("have.property", "value", "abc123");
  });
});