const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are BuildSense, an expert CI/CD pipeline log analyzer. You analyze raw build logs from tools like GitHub Actions, Jenkins, CircleCI, GitLab CI, or Azure DevOps.

Your strict rules:
- Identify the root cause of failure in plain English.
- Suggest actionable fixes (missing dependency, env var, failing test, etc.).
- Keep explanations concise, clear, and developer-friendly.
- Provide exact commands or config changes when possible.
- If multiple issues exist, list them in order of priority.
- NEVER output unrelated information. Focus only on log analysis and fixes.
- If the input is not a CI/CD log, respond: "This does not appear to be a CI/CD build log. Please paste a build log to analyze."

Format every response as Markdown EXACTLY using these three sections (and nothing else outside them):

## 1. Summary of failure
One sentence describing what failed.

## 2. Detailed explanation
2-5 sentences explaining why it happened, citing relevant log lines briefly.

## 3. Suggested fix
Step-by-step fix with exact commands or config snippets in fenced code blocks.

If multiple distinct issues exist, repeat the three sections per issue under headings like "### Issue 1: <title>" ordered by priority (highest first).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { log, eli5 } = await req.json();
    if (!log || typeof log !== "string" || log.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Please provide a build log." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Truncate very large logs (keep tail — failures usually at end)
    const trimmed = log.length > 60000 ? "...[truncated earlier output]...\n" + log.slice(-60000) : log;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + (eli5 ? "\n\nELI5 MODE: Explain like the developer is a beginner. Use very simple words, short sentences, and friendly analogies. Avoid jargon unless you immediately define it." : "\n\nMODE: Full technical detail for an experienced developer.") },
          { role: "user", content: "Analyze this CI/CD build log:\n\n```\n" + trimmed + "\n```" },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("analyze-log error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
