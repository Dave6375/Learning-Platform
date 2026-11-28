import type { FormEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";

type Props = {
    draft: string;
    onDraftChange: (value: string) => void;
    onSend: () => void;
};

export function PromptForm({ draft, onDraftChange, onSend }: Props) {
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSend();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
            event.preventDefault();
            onSend();
        }
    }

    return (
        <div className="shrink-0 py-4">
            <p className="mb-2 text-center text-sm text-muted-foreground">AI replies are not connected yet.</p>
            <form onSubmit={submit} className="flex items-end gap-2 rounded-2xl border bg-card p-3 shadow-sm">
                <textarea aria-label="Your message" placeholder="Ask an SAT question..." value={draft}
                    onChange={(event) => onDraftChange(event.target.value)} onKeyDown={handleKeyDown}
                    rows={2} className="max-h-40 min-h-12 min-w-0 flex-1 resize-y rounded bg-transparent p-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" />
                <Button type="submit" disabled={!draft.trim()}>Send</Button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">Enter to send · Shift + Enter for a new line</p>
        </div>
    );
}