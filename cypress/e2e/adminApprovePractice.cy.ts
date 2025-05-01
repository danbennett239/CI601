/// <reference types="cypress" />

describe("Admin can view and approve pending dental practices (FR9)", () => {
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

  const mockPractice = {
    practice_id: "mock-practice-id-123",
    practice_name: "Mock Dental Clinic",
    email: "clinic@example.com",
    phone_number: "01234567890",
    address: "123 Main Street",
    opening_hours: [],
    verified: false,
  };

  beforeEach(() => {
    cy.visit("/signin");

    cy.intercept("POST", "/api/auth/login", {
      statusCode: 200,
      body: { message: "Login successful" },
      headers: { "Set-Cookie": "session=admin123; Path=/" },
    }).as("adminLoginRequest");

    cy.intercept("GET", "/api/auth/me", {
      statusCode: 200,
      body: adminMe,
    }).as("adminMeRequest");

    cy.intercept("GET", "/api/practice/pending", {
      statusCode: 200,
      body: [mockPractice],
    }).as("getPendingPractices");

    cy.intercept("POST", "/api/practice/approve", (req) => {
      expect(req.body).to.deep.equal({ practiceId: mockPractice.practice_id });
      req.reply({ statusCode: 200, body: { success: true } });
    }).as("approvePractice");
  });

  it("allows the admin to approve a pending practice", () => {
    cy.get('[data-cy="login-form"]').within(() => {
      cy.get('input[id="email"]').type("admin@example.com");
      cy.get('input[id="password"]').type("Secure$123");
      cy.get("button").contains("Sign In").click();
    });

    cy.wait("@adminLoginRequest");
    cy.wait("@adminMeRequest");

    cy.contains("Admin Panel").click();
    cy.location("pathname").should("eq", "/admin-panel");

    cy.contains("Dental Practice Applications").click();
    cy.location("pathname").should("eq", "/admin-panel/dental-practices");

    cy.wait("@getPendingPractices");

    cy.contains(mockPractice.practice_name).click();

    cy.get('[data-cy="approve-practice-button"]').click();
    cy.wait("@approvePractice");
  });
});
