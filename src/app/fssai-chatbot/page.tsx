
import ChatInterface from "@/components/specific/fssai-chatbot/ChatInterface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function FssaiChatbotPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <span>FSSAI AI Chatbot</span>
          </CardTitle>
          <CardDescription>
            Ask questions about FSSAI rules, regulations, and food safety guidelines in India.
            The AI will provide information based on its knowledge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  );
}
