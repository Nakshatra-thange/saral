export async function roastMessage(message, context) {
  const res = await fetch("/api/roast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context }),
  });

  if (!res.ok) {
    let detail = "Something went wrong.";
    try {
      const body = await res.json();
      if (body?.error) detail = body.error;
    } catch {
      /* non-JSON error, keep default */
    }
    throw new Error(detail);
  }

  return res.json();
}
