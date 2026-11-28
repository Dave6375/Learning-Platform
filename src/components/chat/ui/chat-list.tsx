import type { ChatMessage as Message } from "./chat";
import { ChatMessage } from "./chat-message";

export function ChatList({ messages }: { messages: Message[] }) {
    return (
        <div role="log" aria-label="Conversation" aria-live="polite" className="flex flex-col gap-5 py-6">
            {messages.map((message) => <ChatMessage key={message.id} content={message.content} />)}
        </div>
    );
}