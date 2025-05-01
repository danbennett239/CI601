describe("User Email Update (FR10)", () => {
  const userId = "user-123";
  const originalEmail = "alice@example.com";
  const updatedEmail = "alice+updated@example.com";

  beforeEach(() => {
    // 1. Stub initial /api/auth/me with original email
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

    // 2. Stub PUT request to update the user's email
    cy.intercept("PUT", `/api/user/${userId}`, {
      statusCode: 200,
      body: { message: "Email updated successfully" },
    }).as("updateEmail");

    // 3. Visit the profile page
    cy.visit("/profile");
  });

  it("updates the email and shows a success toast", () => {
    // 4. Enter new email
    cy.get('[data-cy="email-input"]').clear().type(updatedEmail);

    // 5. Intercept refreshed /me call AFTER the save is triggered
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

    // 6. Click save once enabled
    cy.get('[data-cy="save-button"]').should("not.be.disabled").click();

    // 7. Wait for both backend calls
    cy.wait("@updateEmail");
    cy.wait("@refreshUser");

    // 8. Assert success toast and updated input field
    cy.contains("Email updated successfully").should("be.visible");
    cy.get('[data-cy="email-input"]').should("have.value", updatedEmail);
  });
});
