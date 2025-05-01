describe("Verified Practice Login and Update Settings (FR3, FR5, FR11)", () => {
  const practiceId = "25970162-577e-4400-9847-7d8d97e92678";
  const updatedPracticeName = "abcd";

  const verifiedPracticeMe = {
    user: {
      id: "a4eb02b0-830b-44df-95ba-3550a3230925",
      email: "1202@mail.com",
      role: "verified-practice",
      practice_id: practiceId,
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

    // Stub login request
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

    // Stub initial /me
    cy.intercept("GET", "/api/auth/me", {
      statusCode: 200,
      body: verifiedPracticeMe,
    }).as("meRequest");

    // Stub GET practice data
    cy.fixture("practiceDetails.json").then((original) => {
      cy.intercept("GET", `/api/practice/${practiceId}`, {
        statusCode: 200,
        body: original,
      }).as("getPractice");
    });

    // Stub PUT + validation
    cy.intercept("POST", `/api/practice/${practiceId}/settings/validate`, {
      statusCode: 200,
      body: {},
    }).as("validateHours");

    cy.intercept("PUT", `/api/practice/${practiceId}/settings`, {
      statusCode: 200,
      body: {},
    }).as("updateSettings");

    cy.intercept("PUT", `/api/practice/${practiceId}/preferences`, {
      statusCode: 200,
      body: {},
    }).as("updatePreferences");
  });

  it("logs in, navigates to practice settings, updates name, and shows toast", () => {
    // Log in
    cy.get('[data-cy="login-form"]').within(() => {
      cy.get('input[id="email"]').type("practice@example.com");
      cy.get('input[id="password"]').type("Secure$123");
      cy.get('button').contains("Sign In").click();
    });

    cy.wait("@practiceLoginRequest");
    cy.wait("@meRequest");

    // Redirected to /home
    cy.url().should("include", "/home");

    // Navigate to dashboard
    cy.get('[data-cy="banner-practice-dashboard-link"]').first().click();
    cy.url().should("include", "/practice-dashboard");

    // Click the settings card via visible text
    cy.contains("Manage Practice Information and Preferences").click();
    cy.url().should("include", "/practice-dashboard/settings");
    cy.wait("@getPractice");

    // Update practice name
    cy.get('input[data-cy="practice-name-input"]').clear().type(updatedPracticeName);

    // Stub refresh after save
    cy.fixture("practiceDetails.json").then((original) => {
      const updated = {
        ...original,
        practice: {
          ...original.practice,
          practice_name: updatedPracticeName,
        },
      };
      cy.intercept("GET", `/api/practice/${practiceId}`, {
        statusCode: 200,
        body: updated,
      }).as("refreshPractice");
    });

    // Save
    cy.contains("button", "Save").click();
    cy.wait("@validateHours");
    cy.wait("@updateSettings");
    cy.wait("@updatePreferences");
    cy.wait("@refreshPractice");

    // Assert success
    cy.contains("Settings saved successfully").should("be.visible");
    cy.get('input[data-cy="practice-name-input"]').should("have.value", updatedPracticeName);
  });
});
