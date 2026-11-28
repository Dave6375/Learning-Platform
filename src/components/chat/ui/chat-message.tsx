export function ChatMessage({ content }: { content: string }) {
    return (
        <article className="ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
            <h2 className="mb-1 text-xs font-semibold opacity-80">You</h2>
            <p className="whitespace-pre-wrap break-words">{content}</p>
        </article>
    );
}