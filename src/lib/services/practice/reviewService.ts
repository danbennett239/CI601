const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;

interface Review {
  review_id: string;
  practice_id: string;
  appointment_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

interface ReviewAggregate {
  avgRating: number;
  reviewCount: number;
}

const CREATE_REVIEW_MUTATION = `
  mutation CreateReview($practiceId: uuid!, $appointmentId: uuid!, $rating: numeric!, $comment: String) {
    insert_practice_reviews_one(object: {
      practice_id: $practiceId,
      appointment_id: $appointmentId,
      rating: $rating,
      comment: $comment
    }) {
      review_id
      practice_id
      appointment_id
      rating
      comment
      created_at
      updated_at
    }
  }
`;

const UPDATE_REVIEW_MUTATION = `
  mutation UpdateReview($reviewId: uuid!, $rating: numeric!, $comment: String, $updatedAt: timestamp!) {
    update_practice_reviews_by_pk(
      pk_columns: { review_id: $reviewId },
      _set: { rating: $rating, comment: $comment, updated_at: $updatedAt }
    ) {
      review_id
      practice_id
      appointment_id
      rating
      comment
      created_at
      updated_at
    }
  }
`;

const GET_REVIEWS_QUERY = `
  query GetReviews($practiceId: uuid, $appointmentId: uuid, $userId: uuid) {
    practice_reviews(
      where: {
        _and: [
          { practice_id: { _eq: $practiceId } },
          { appointment_id: { _eq: $appointmentId } },
          { appointment: { user_id: { _eq: $userId } } }
        ]
      }
    ) {
      review_id
      practice_id
      appointment_id
      rating
      comment
      created_at
      updated_at
    }
  }
`;

const GET_REVIEW_AGGREGATES_QUERY = `
  query GetReviewAggregates($practiceId: uuid!) {
    practice_reviews_aggregate(where: { practice_id: { _eq: $practiceId } }) {
      aggregate {
        avg { rating }
        count
      }
    }
  }
`;

export async function createReview(
  practiceId: string,
  appointmentId: string,
  rating: number,
  comment?: string
): Promise<Review> {
  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: CREATE_REVIEW_MUTATION,
      variables: { practiceId, appointmentId, rating, comment },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0]?.message || "Failed to create review");
  }

  return result.data.insert_practice_reviews_one;
}

export async function updateReview(
  reviewId: string,
  rating: number,
  comment?: string
): Promise<Review> {
  const updatedAt = new Date().toISOString();
  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: UPDATE_REVIEW_MUTATION,
      variables: { reviewId, rating, comment, updatedAt },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0]?.message || "Failed to update review");
  }

  return result.data.update_practice_reviews_by_pk;
}

export async function getReviews(filters: {
  practiceId?: string;
  appointmentId?: string;
  userId?: string;
}): Promise<Review[]> {
  const { practiceId, appointmentId, userId } = filters;
  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: GET_REVIEWS_QUERY,
      variables: { practiceId, appointmentId, userId },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0]?.message || "Failed to fetch reviews");
  }

  return result.data.practice_reviews;
}

export async function getReviewAggregates(practiceId: string): Promise<ReviewAggregate> {
  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: GET_REVIEW_AGGREGATES_QUERY,
      variables: { practiceId },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0]?.message || "Failed to fetch review aggregates");
  }

  const aggregate = result.data.practice_reviews_aggregate.aggregate;
  return {
    avgRating: aggregate.avg.rating || 0,
    reviewCount: aggregate.count || 0,
  };
}