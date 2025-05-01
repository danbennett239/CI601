describe("Practice Info Update (FR11)", () => {
  const practiceId = "25970162-577e-4400-9847-7d8d97e92678";
  const updatedPracticeName = "abcd";

  const practiceUser = {
    user: {
      id: "a4eb02b0-830b-44df-95ba-3550a3230925",
      email: "1202@mail.com",
      role: "verified-practice",
      practice_id: practiceId,
    },
  };

  beforeEach(() => {
    // Initial login and page load
    cy.intercept("GET", "/api/auth/me", {
      statusCode: 200,
      body: practiceUser,
    }).as("getMe");

    cy.fixture("practiceDetails.json").then((original) => {
      cy.intercept("GET", `/api/practice/${practiceId}`, {
        statusCode: 200,
        body: original,
      }).as("getPractice");

      cy.visit("/practice-dashboard/settings");
      cy.wait("@getMe");
      cy.wait("@getPractice");
    });

    // Stub validation and PUTs
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

  it("updates the practice name and shows a success toast", () => {
    // Update input
    cy.get('input[data-cy="practice-name-input"]').clear().type(updatedPracticeName);

    // Stub refresh GET with updated name after save
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

    // Click save and assert flow
    cy.contains("button", "Save").click();

    cy.wait("@validateHours");
    cy.wait("@updateSettings");
    cy.wait("@updatePreferences");
    cy.wait("@refreshPractice");

    cy.contains("Settings saved successfully").should("be.visible");
    cy.get('input[data-cy="practice-name-input"]').should("have.value", updatedPracticeName);
  });
});
