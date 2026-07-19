import { ChatContent } from "./_components/chat-content";

interface ChatPageProps {
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function AIAssistantPage({ searchParams }: ChatPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="mt-4 flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <ChatContent initialSessionId={resolvedSearchParams.sessionId} />
    </div>
  );
}
