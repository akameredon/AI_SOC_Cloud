import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, AlertTriangle, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTED_QUESTIONS = [
  "What are the highest risk events today?",
  "Which cameras are offline?",
  "Summarize all open incidents",
  "Any intrusions in the last hour?",
];

function formatContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const boldified = line.replace(/\*\*(.*?)\*\*/g, (_m, p1) => `<strong>${p1}</strong>`);
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <div key={i} className="flex gap-2 pl-2">
          <span className="text-primary mt-1 shrink-0">›</span>
          <span dangerouslySetInnerHTML={{ __html: boldified.replace(/^[-•] /, "") }} />
        </div>
      );
    }
    return <div key={i} dangerouslySetInnerHTML={{ __html: boldified || "&nbsp;" }} />;
  });
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [unconfigured, setUnconfigured] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (messages.length === 0) {
        setMessages([{
          role: "assistant",
          content: "**ARIA online.** I have real-time access to your camera feeds, security events, alerts, and incidents.\n\nAsk me anything — threat analysis, camera status, incident summaries, risk assessments.",
        }]);
      }
    }
  }, [open]);

  async function sendMessage(text: string) {
    const userMsg = text.trim();
    if (!userMsg || streaming) return;

    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setUnconfigured(false);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages(prev => [...prev, assistantMsg]);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json() as { error?: string };
        if (response.status === 503) setUnconfigured(true);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: err.error ?? "Something went wrong." };
          return updated;
        });
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6)) as { content?: string; done?: boolean; error?: string };
            if (parsed.error) {
              fullContent = parsed.error;
            } else if (parsed.content) {
              fullContent += parsed.content;
            }
            if (parsed.done || parsed.error) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullContent };
                return updated;
              });
            } else if (parsed.content) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullContent };
                return updated;
              });
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: "Connection error. Please try again." };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-all",
          "border border-primary/40 bg-background hover:bg-primary/10",
          open ? "text-primary" : "text-primary animate-pulse"
        )}
        title="AI Security Assistant"
      >
        {open ? <ChevronDown className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[420px] max-w-[calc(100vw-24px)] flex flex-col rounded border border-border bg-card shadow-2xl"
          style={{ height: "520px" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-foreground tracking-wider">ARIA</div>
                <div className="text-[10px] font-mono text-primary flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  AI Risk Intelligence Assistant
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 font-mono text-xs">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="h-5 w-5 rounded bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[85%] rounded px-3 py-2 leading-relaxed space-y-0.5",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 border border-border text-foreground"
                )}>
                  {msg.role === "assistant" ? formatContent(msg.content) : msg.content}
                  {msg.role === "assistant" && streaming && i === messages.length - 1 && (
                    <span className="inline-block w-1.5 h-3 bg-primary animate-pulse ml-0.5 align-middle" />
                  )}
                </div>
              </div>
            ))}

            {unconfigured && (
              <div className="flex items-start gap-2 text-chart-2 bg-chart-2/10 border border-chart-2/30 rounded px-3 py-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="text-[10px] leading-relaxed">
                  Add your <strong>GEMINI_API_KEY</strong> in the Replit Secrets panel (padlock icon) to activate ARIA.
                </span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggested questions (only when first message) */}
          {messages.length <= 1 && !streaming && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => void sendMessage(q)}
                  className="text-[10px] font-mono px-2 py-1 rounded border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors bg-muted/20"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-border shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about threats, cameras, incidents..."
                disabled={streaming}
                className="flex-1 bg-muted/30 border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50"
              />
              <button
                onClick={() => void sendMessage(input)}
                disabled={streaming || !input.trim()}
                className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0"
              >
                {streaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
