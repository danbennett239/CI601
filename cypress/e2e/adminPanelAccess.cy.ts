/// <reference types="cypress" />

describe("Admin Login and Admin Panel Access (FR3, FR8)", () => {
  const adminMe = {
    user: {
      id: "51cdbb9d-57d5-4b12-b71c-59ddda560f13",
      email: "admin@example.com",
      role: "admin",
      hasura_claims: {
        "x-hasura-default-role": "admin",
        "x-hasura-allowed-roles": ["admin"],
        "x-hasura-user-id": "51cdbb9d-57d5-4b12-b71c-59ddda560f13",
      },
      rememberMe: false,
      iat: 1744892025,
      exp: 1744895625,
    },
  };

  beforeEach(() => {
    cy.visit("/signin");

    cy.intercept("POST", "/api/auth/login", (req) => {
      const { email, password } = req.body;
      if (email === "admin@example.com" && password === "Secure$123") {
        req.reply({
          statusCode: 200,
          body: { message: "Login successful" },
          headers: { "Set-Cookie": "session=admin123; Path=/" },
        });
      } else {
        req.reply({ statusCode: 401, body: { error: "Invalid credentials." } });
      }
    }).as("adminLoginRequest");

    cy.intercept("GET", "/api/auth/me", {
      statusCode: 200,
      body: adminMe,
    }).as("adminMeRequest");
  });

  it("logs in an admin user and navigates to the Admin Panel", () => {
    cy.get('[data-cy="login-form"]').within(() => {
      cy.get('input[id="email"]').type("admin@example.com");
      cy.get('input[id="password"]').type("Secure$123");
      cy.get("button").contains("Sign In").click();
    });

    cy.wait("@adminLoginRequest");
    cy.wait("@adminMeRequest");

    cy.location("pathname").should("eq", "/home");

    // Click the Admin Panel link in the banner
    cy.contains("Admin Panel").click();

    // Verify URL and that the panel loaded
    cy.location("pathname").should("eq", "/admin-panel");
    cy.contains("Admin Panel").should("be.visible");
  });
});
