describe("Unverified Practice Login (FR3, FR5)", () => {
  const unverifiedPracticeMe = {
    user: {
      id: "0e5604e6-e3b1-4b87-8e49-420ecf1d9fb1",
      email: "pending@example.com",
      role: "unverified-practice",
      practice_id: "5bc1f4a0-9f7e-4a2e-91e2-24e8a8aaf66c",
      hasura_claims: {
        "x-hasura-default-role": "unverified-practice",
        "x-hasura-allowed-roles": ["unverified-practice"],
        "x-hasura-user-id": "0e5604e6-e3b1-4b87-8e49-420ecf1d9fb1",
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
      if (email === "pending@example.com" && password === "Secure$123") {
        req.reply({
          statusCode: 200,
          body: { message: "Login successful" },
          headers: { "Set-Cookie": "session=pending123; Path=/" },
        });
      } else {
        req.reply({ statusCode: 401, body: { error: "Invalid credentials." } });
      }
    }).as("unverifiedLoginRequest");

    cy.intercept("GET", "/api/auth/me", {
      statusCode: 200,
      body: unverifiedPracticeMe,
    }).as("unverifiedMeRequest");
  });

  it("logs in an unverified practice and shows the View Application banner", () => {
    cy.get('[data-cy="login-form"]').within(() => {
      cy.get('input[id="email"]').type("pending@example.com");
      cy.get('input[id="password"]').type("Secure$123");
      cy.get("button").contains("Sign In").click();
    });

    cy.wait("@unverifiedLoginRequest");
    cy.wait("@unverifiedMeRequest");

    cy.location("pathname").should("eq", "/home");
    cy.contains("View Application").should("be.visible");
    cy.getCookie("session").its("value").should("eq", "pending123");
  });
});
