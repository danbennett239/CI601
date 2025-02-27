// app/api/practice/review/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createReview,
  updateReview,
  getReviews,
  getReviewAggregates,
} from "@/lib/services/practice/reviewService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practiceId, appointmentId, rating, comment } = body;

    if (!practiceId || !appointmentId || typeof rating !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid required fields: practiceId, appointmentId, rating" },
        { status: 400 }
      );
    }

    const review = await createReview(practiceId, appointmentId, rating, comment);
    return NextResponse.json({ success: true, review });
  } catch (error: unknown) {
    console.error("Error creating review:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, rating, comment } = body;

    if (!reviewId || typeof rating !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid required fields: reviewId, rating" },
        { status: 400 }
      );
    }

    const updatedReview = await updateReview(reviewId, rating, comment);
    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error: unknown) {
    console.error("Error updating review:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const practiceId = searchParams.get("practiceId") || undefined;
    const appointmentId = searchParams.get("appointmentId") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const aggregate = searchParams.get("aggregate") === "true";

    if (aggregate) {
      if (!practiceId) {
        return NextResponse.json(
          { error: "practiceId is required for aggregation" },
          { status: 400 }
        );
      }
      const aggregates = await getReviewAggregates(practiceId);
      return NextResponse.json({ success: true, aggregates });
    }

    const reviews = await getReviews({ practiceId, appointmentId, userId });
    return NextResponse.json({ success: true, reviews });
  } catch (error: unknown) {
    console.error("Error fetching reviews:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}