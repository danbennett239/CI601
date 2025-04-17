/// <reference types="cypress" />

describe('Search filters', () => {
  /* ---------- mock payloads ---------- */
  const initialAppointments = [
    {
      appointment_id: 'id-clean',
      title: 'Dental Cleaning',
      start_time: '2025-05-02T14:00:00Z',
      end_time:   '2025-05-02T14:30:00Z',
      services:   { cleaning: 50 },
      practice_name: 'Smile Clinic',
      distance: 5,
      address: { city: 'London' },
      photo: null,
      verified: true
    },
    {
      appointment_id: 'id-check',
      title: 'Dental Check‑up',
      start_time: '2025-05-01T09:00:00Z',
      end_time:   '2025-05-01T09:30:00Z',
      services:   { checkup: 40 },
      practice_name: 'Town Dental',
      distance: 2,
      address: { city: 'London' },
      photo: null,
      verified: true
    },
    {
      appointment_id: 'id-extract',
      title: 'Extraction',
      start_time: '2025-05-03T11:00:00Z',
      end_time:   '2025-05-03T12:00:00Z',
      services:   { extraction: 120 },
      practice_name: 'City Dentistry',
      distance: 8,
      address: { city: 'London' },
      photo: null,
      verified: true
    }
  ];

  const filteredAppointments = [initialAppointments[0]];   // only cleaning

  beforeEach(() => {
    /* SSR needs a 200 from /api/auth/me */
    cy.intercept('GET', '/api/auth/me', { statusCode: 200, body: { user: null } });

    /* postcode → lat/lon */
    cy.intercept(
      'GET',
      '/api/location/geocode?postcode=EC1A%201BB',
      { statusCode: 200, body: { latitude: 51.522, longitude: -0.102 } }
    ).as('geocode');

    /* single intercept for BOTH initial & filtered search */
    let call = 0;
    cy.intercept('GET', /\/api\/appointment\/search.*/, (req) => {
      call += 1;
      const isFiltered = req.query.appointmentType === 'cleaning';
      req.alias = isFiltered ? 'searchFiltered' : 'searchInit';

      req.reply({
        statusCode: 200,
        body: { appointments: isFiltered ? filteredAppointments
                                         : initialAppointments }
      });
    });

    /* navigate via /home to avoid SSR 500 */
    cy.visit('/home');
    cy.get('[data-cy="search-appointments-link"]').click();
    cy.location('pathname').should('eq', '/search');
  });

  it('filters by type, distance and price', () => {
    /* initial list */
    cy.wait('@searchInit');
    cy.get('[data-cy="appointment-card"]').should('have.length', 3);

    /* set filters */
    cy.get('[data-cy="filter-type-select"]').select('cleaning');
    cy.get('[data-cy="filter-price-min"]').clear().type('30');
    cy.get('[data-cy="filter-price-max"]').clear().type('60');
    cy.get('[data-cy="filter-postcode-input"]').type('EC1A 1BB');
    cy.get('[data-cy="filter-distance"]').clear().type('10');
    cy.get('[data-cy="filter-apply"]').click();

    /* wait network */
    cy.wait('@geocode');
    cy.wait('@searchFiltered');

    /* DOM assertion */
    cy.get('[data-cy="appointment-card"]')
      .should('have.length', 1)
      .first()
      .contains('Smile Clinic');
  });
});
