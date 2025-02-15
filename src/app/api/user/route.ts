export async function GET() {
  return new Response(JSON.stringify({ message: "User API" }), {
    headers: { "Content-Type": "application/json" },
  });
}