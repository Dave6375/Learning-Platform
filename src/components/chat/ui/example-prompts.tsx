const prompts = [
    "Explain how to solve a quadratic equation for the SAT.",
    "Give me an SAT reading practice question.",
    "Help me make a study plan for the SAT.",
];

export function ExamplePrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
    return (
        <div className="grid w-full gap-2 sm:grid-cols-3">
            {prompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => onSelect(prompt)}
                    className="rounded-xl border bg-card p-4 text-left text-sm text-card-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                    {prompt}
                </button>
            ))}
        </div>
    );
}