/// <reference types="cypress" />

function getNextDayOfWeek(dayName: string, hour = 10, minute = 0) {
  const dayIndexMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };
  const today = new Date();
  const result = new Date(today);
  result.setHours(hour, minute, 0, 0);
  const day = dayIndexMap[dayName];
  const diff = (day + 7 - today.getDay()) % 7 || 7;
  result.setDate(today.getDate() + diff);
  return result;
}


describe('Verified practice can create a multi‑service appointment (FR7)', () => {
  /* ---------- constants / fixtures ---------- */
  const practiceId = '25970162-577e-4400-9847-7d8d97e92678';
  const verifiedPracticeMe = {
    user: {
      id: 'a4eb02b0-830b-44df-95ba-3550a3230925',
      email: '1202@mail.com',
      role: 'verified-practice',
      practice_id: practiceId,
      hasura_claims: {},
      rememberMe: false,
      iat: 1744892025,
      exp: 1744895625,
    },
  };

  /* ---------- network stubs ---------- */
  beforeEach(() => {
    // 1 – authenticate as verified practice
    cy.intercept('GET', '/api/auth/me', { statusCode: 200, body: verifiedPracticeMe });

    // 2 – practice details (use response from the description)
    cy.intercept(
      'GET',
      `/api/practice/${practiceId}`,
      { statusCode: 200, fixture: 'practiceDetails.json' }, // save the JSON shown above as a fixture
    ).as('getPractice');

    // 3 – no appointments at first
    cy.intercept(
      'GET',
      `/api/appointment?practiceId=${practiceId}*`,
      { statusCode: 200, body: { appointments: [] } },
    ).as('initialAppointments');

    // 4 – POST to create appointment
    cy.intercept('POST', '/api/appointment', (req) => {
      req.alias = 'createAppointment';
      const newAppt = {
        appointment_id: 'new-id-123',
        practice_id: practiceId,
        title: req.body.title,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        services: req.body.services,
        booked: false,
      };
      req.reply({ statusCode: 200, body: { appointment: newAppt } });
    });
  });

  it('creates an appointment with Cleaning + Checkup', () => {
    /* Visit home -> dashboard -> appointments */
    cy.visit('/home');
    cy.get('[data-cy="banner-practice-dashboard-link"]').first().click();
    cy.location('pathname').should('eq', '/practice-dashboard');
    cy.contains('h2', 'Manage Appointments').click();
    cy.location('pathname').should('eq', '/practice-dashboard/appointments');
    cy.wait('@getPractice');
    cy.wait('@initialAppointments');

    /* Open Create‑Appointment popup */
    cy.get('[data-cy="create-appointment-button"]').click();

    /* Fill start & end datetime (today + 1 hour) */
    const startTime = getNextDayOfWeek("Monday", 10, 0);
    const endTime = getNextDayOfWeek("Monday", 10, 30);
    const startISO = startTime.toISOString().slice(0, 16);
    const endISO = endTime.toISOString().slice(0, 16);

    cy.get('[data-cy="start-time-input"]').clear().type(startISO);
    cy.get('[data-cy="end-time-input"]').clear().type(endISO);

    /* Deselect “All”, then pick Cleaning & Checkup */
    cy.get('[data-cy="all-types-checkbox"]').uncheck({ force: true });
    cy.get('[data-cy="cleaning-checkbox"]').check({ force: true });
    cy.get('[data-cy="checkup-checkbox"]').check({ force: true });

    /* Submit */
    cy.get('[data-cy="popup-create-appointment-button"]').first().click({ force: true });

    cy.get('[data-cy="popup-create-appointment-button"]').should('not.exist');
  });
});
