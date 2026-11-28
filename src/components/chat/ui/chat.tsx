"use client";

import { useState } from "react";
import { useScrollToBottom } from "../hooks/use-scroll-to-bottom";
import { ChatHeader } from "./chat-header";
import { ChatList } from "./chat-list";
import { EmptyScreen } from "./empty-screen";
import { PromptForm } from "./prompt-form";

export type ChatMessage = { id: number; content: string };

export function Chat() {
    const [draft, setDraft] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const { scrollRef, onScroll } = useScrollToBottom(messages.length);

    function sendMessage() {
        if (!draft.trim()) return;
        setMessages((current) => [...current, { id: (current.at(-1)?.id ?? 0) + 1, content: draft }]);
        setDraft("");
    }

    return (
        <main className="mx-auto flex h-dvh max-w-3xl flex-col px-4">
            <ChatHeader />
            <div ref={scrollRef} onScroll={onScroll} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {messages.length === 0 ? <EmptyScreen onSelectPrompt={setDraft} /> : <ChatList messages={messages} />}
            </div>
            <PromptForm draft={draft} onDraftChange={setDraft} onSend={sendMessage} />
        </main>
    );
}