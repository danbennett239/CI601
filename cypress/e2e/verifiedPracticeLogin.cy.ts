describe("Verified Practice Login (FR3, FR5)", () => {
  const verifiedPracticeMeResponse = {
    user: {
      id: "a4eb02b0-830b-44df-95ba-3550a3230925",
      email: "1202@mail.com",
      role: "verified-practice",
      practice_id: "25970162-577e-4400-9847-7d8d97e92678",
      hasura_claims: {
        "x-hasura-default-role": "verified-practice",
        "x-hasura-allowed-roles": ["verified-practice"],
        "x-hasura-user-id": "a4eb02b0-830b-44df-95ba-3550a3230925",
      },
      rememberMe: false,
      iat: 1744892025,
      exp: 1744895625,
    },
  };

  beforeEach(() => {
    cy.visit("/signin");

    /* Stub the login request */
    cy.intercept("POST", "/api/auth/login", (req) => {
      const { email, password } = req.body;
      if (email === "practice@example.com" && password === "Secure$123") {
        req.reply({
          statusCode: 200,
          body: { message: "Login successful" },
          headers: { "Set-Cookie": "session=practice123; Path=/" },
        });
      } else {
        req.reply({
          statusCode: 401,
          body: { error: "Invalid credentials." },
        });
      }
    }).as("practiceLoginRequest");

    /* Stub the /me call so the app thinks the logged‑in user is a verified practice */
    cy.intercept("GET", "/api/auth/me", {
      statusCode: 200,
      body: verifiedPracticeMeResponse,
    }).as("meRequest");
  });

  it("should log in a verified practice and show the Practice Dashboard banner", () => {
    cy.get('[data-cy="login-form"]').within(() => {
      cy.get('input[id="email"]').type("practice@example.com");
      cy.get('input[id="password"]').type("Secure$123");
      cy.get('button').contains("Sign In").click();
    });

    cy.wait("@practiceLoginRequest");
    cy.wait("@meRequest");

    cy.url().should("eq", "http://localhost:3000/home");
    cy.contains("Practice Dashboard").should("be.visible");
    cy.getCookie("session").should("have.property", "value", "practice123");
  });
});
