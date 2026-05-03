import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Activity, Upload, Sparkles, AlertCircle, Github, Workflow, FileCode, Zap, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const SAMPLE_LOG = `npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! 
npm ERR! While resolving: my-app@1.0.0
npm ERR! Found: react@18.2.0
npm ERR! node_modules/react
npm ERR!   react@"^18.2.0" from the root project
npm ERR! 
npm ERR! Could not resolve dependency:
npm ERR! peer react@"^17.0.0" from react-some-lib@2.1.0
npm ERR! node_modules/react-some-lib
npm ERR!   react-some-lib@"^2.1.0" from the root project
##[error] Process completed with exit code 1.`;

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-log`;

const Index = () => {
  const [log, setLog] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const analyze = async () => {
    if (!log.trim()) {
      toast.error("Please paste a build log first");
      return;
    }
    setLoading(true);
    setResult("");

    try {
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ log }),
      });

      if (!resp.ok || !resp.body) {
        const data = await resp.json().catch(() => ({}));
        if (resp.status === 429) toast.error("Rate limit exceeded — try again shortly.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error(data.error || "Failed to analyze log");
        setLoading(false);
        return;
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) { acc += c; setResult(acc); }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error — please retry");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large (max 2MB)");
      return;
    }
    file.text().then(setLog);
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Nav */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40 bg-background/70">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Activity className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-mono font-bold text-lg tracking-tight">BuildSense</h1>
              <p className="text-[10px] text-muted-foreground -mt-1 font-mono">CI/CD log analyzer</p>
            </div>
          </div>
          <a
            href="#analyze"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Try it →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="container relative py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs font-mono text-primary mb-6">
            <Sparkles className="w-3 h-3" />
            AI-powered root cause analysis
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Decode failing builds in <span className="text-gradient">plain English</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Paste raw logs from GitHub Actions, Jenkins, Azure DevOps or GitLab CI.
            Get the root cause, priority-ordered fixes, and exact commands to run.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /> GitHub Actions</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1.5"><Workflow className="w-3.5 h-3.5" /> Jenkins</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5" /> Azure DevOps</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> GitLab CI</span>
          </div>
        </div>
      </section>

      {/* Analyzer */}
      <section id="analyze" className="container pb-20">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="bg-gradient-card border-border/60 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-secondary/30">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-warning/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-success/70" />
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-2">build.log</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs font-mono" onClick={() => setLog(SAMPLE_LOG)}>
                  Sample
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs font-mono" onClick={() => fileRef.current?.click()}>
                  <Upload className="w-3 h-3 mr-1" /> Upload
                </Button>
                {log && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-mono" onClick={() => setLog("")}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
                <input ref={fileRef} type="file" accept=".log,.txt" hidden onChange={handleFile} />
              </div>
            </div>
            <Textarea
              value={log}
              onChange={(e) => setLog(e.target.value)}
              placeholder="Paste your CI/CD build log here..."
              className="min-h-[420px] resize-none border-0 rounded-none bg-transparent font-mono text-xs leading-relaxed focus-visible:ring-0"
              spellCheck={false}
            />
            <div className="px-4 py-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">
                {log.length.toLocaleString()} chars
              </span>
              <Button
                onClick={analyze}
                disabled={loading || !log.trim()}
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-mono shadow-glow"
              >
                {loading ? (
                  <><Activity className="w-4 h-4 mr-2 animate-pulse" /> Analyzing…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Analyze Log</>
                )}
              </Button>
            </div>
          </Card>

          {/* Output */}
          <Card className="bg-gradient-card border-border/60 shadow-card overflow-hidden flex flex-col" ref={resultRef}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-secondary/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-mono text-muted-foreground">analysis.md</span>
              </div>
              {result && !loading && (
                <Button variant="ghost" size="sm" className="h-7 text-xs font-mono" onClick={copyResult}>
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </div>

            <div className="p-6 min-h-[420px] flex-1 overflow-auto">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                  <div className="w-14 h-14 rounded-2xl border border-border/60 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-primary/60" />
                  </div>
                  <p className="font-mono text-sm">Awaiting log input…</p>
                  <p className="text-xs mt-1">Your analysis will appear here</p>
                </div>
              )}

              {loading && !result && (
                <div className="space-y-3 font-mono text-xs text-muted-foreground">
                  <div>{">"} parsing log…</div>
                  <div>{">"} identifying error patterns…</div>
                  <div className="cursor-blink">{">"} reasoning</div>
                </div>
              )}

              {result && (
                <article className="prose prose-invert prose-sm max-w-none
                  prose-headings:font-mono prose-headings:tracking-tight
                  prose-h2:text-primary prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2 prose-h2:flex prose-h2:items-center
                  prose-h3:text-accent prose-h3:text-sm
                  prose-strong:text-foreground
                  prose-code:text-accent prose-code:font-mono prose-code:text-xs prose-code:bg-secondary/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-background prose-pre:border prose-pre:border-border/60 prose-pre:font-mono prose-pre:text-xs
                  prose-li:text-muted-foreground prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-a:text-primary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                  {loading && <span className="cursor-blink" />}
                </article>
              )}
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {[
            { icon: AlertCircle, title: "Root cause", desc: "Pinpoint the exact failure with plain-English explanations." },
            { icon: Zap, title: "Actionable fixes", desc: "Step-by-step commands and config changes you can apply now." },
            { icon: Workflow, title: "Priority ordered", desc: "Multiple issues ranked so you fix what matters first." },
          ].map((f) => (
            <Card key={f.title} className="bg-gradient-card border-border/60 p-5">
              <f.icon className="w-5 h-5 text-primary mb-3" />
              <h3 className="font-mono font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/50 py-6">
        <div className="container text-center text-xs font-mono text-muted-foreground">
          BuildSense — built for developers who hate red checkmarks.
        </div>
      </footer>
    </div>
  );
};

export default Index;
