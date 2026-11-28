import { ExamplePrompts } from "./example-prompts";

export function EmptyScreen({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) {
    return (
        <section className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto py-6 text-center">
            <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">What would you like to learn?</h1>
                <p className="text-muted-foreground">Ask a question, explore a topic, or practice something new.</p>
            </div>
            <ExamplePrompts onSelect={onSelectPrompt} />
        </section>
    );
}