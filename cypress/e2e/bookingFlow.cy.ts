describe("Happy‑path booking – login required on /book", () => {
  let isLoggedIn = false;      // toggled when POST /auth/login succeeds

  beforeEach(() => {
    /* ----- dynamic /api/auth/me ----- */
    cy.intercept("GET", "/api/auth/me", (req) => {
      if (isLoggedIn) {
        // after the user logs in
        req.reply(200, {
          user: {
            id: "user‑id",
            first_name: "Alice",
            last_name: "Example",
            email: "alice@example.com",
            role: "user",
          },
        });
      } else {
        // not logged in yet
        const hittingBookPage = req.headers.referer?.includes("/book");
        hittingBookPage
          ? req.reply(401, { error: "Unauthenticated" }) // show login form
          : req.reply(200, { user: null });              // public pages
      }
    }).as("me");

    /* ----- login ----- */
    cy.intercept("POST", "/api/auth/login", (req) => {
      isLoggedIn = true;  // flip flag so subsequent /me returns 200 user
      req.reply({
        statusCode: 200,
        body: { message: "Login successful" },
        headers: { "Set-Cookie": "session=abc123; Path=/" },
      });
    }).as("login");

    /* ----- booking POST (wildcard) ----- */
    cy.intercept(
      { method: "POST", url: /\/api\/appointment\/[^/]+\/book/ },
      { statusCode: 200, body: { success: true } },
    ).as("book");
  });

  it("completes booking and shows Booking Confirmed", () => {
    /* Home → Search */
    cy.visit("/home");
    cy.get('[data-cy="search-appointments-link"]').click();
    cy.location("pathname").should("eq", "/search");

    /* Wait for real search XHR to finish so results render */
    cy.intercept("GET", /\/api\/appointment\/search.*/).as("search");
    cy.wait("@search");

    /* Click first live appointment card */
    cy.get('[data-cy="appointment-card"]').first().click();

    /* Grab the live appointment ID from URL */
    cy.location("pathname")
      .should("match", /^\/appointments\/[0-9a-f-]{36}$/)
      .then((path) => {
        const id = path.split("/")[2];

        /* Proceed to checkout */
        cy.get('[data-cy="proceed-to-checkout-button"]').click();

        /* /me now 401 → login form visible */
        cy.wait("@me");
        cy.get('[data-cy="login-form"]').within(() => {
          cy.get("#email").type("alice@example.com");
          cy.get("#password").type("Correct$123");
          cy.get('button').contains("Sign In").click();
        });
        cy.wait("@login"); // flips isLoggedIn = true
        cy.wait("@me");    // this time returns 200 with user

        /* Confirm booking */
        cy.get('[data-cy="confirm-booking-button"]').click();
        cy.wait("@book");
        cy.contains("Booking Confirmed").should("be.visible");
      });
  });
});
