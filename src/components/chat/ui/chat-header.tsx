import Link from "next/link";

export function ChatHeader() {
    return (
        <header className="flex items-center justify-between border-b py-5">
            <Link href="/" className="rounded text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                ANEX Kronos
            </Link>
            <span className="text-sm text-muted-foreground">Chat preview</span>
        </header>
    );
}