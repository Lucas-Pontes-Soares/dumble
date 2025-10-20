import CurrentClass from "@/components/current-class";
import StudentsNavigation from "@/components/students-navigation";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useRef } from "react";

import { ArrowUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { verifyJWTToken } from "@/verifyJWTToken";
import api from "@/apiService";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ConversorMDtoHTML from "@/ConversorMDtoHTML";


export default function StudentsChatBot() {
  const { classCode } = useParams<{ classCode: string }>();
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string; time: string }[]>([]);
  const [input, setInput] = useState("");
  const inputLength = input.trim().length;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("student", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
      const token = localStorage.getItem("JWTToken");
      setJwtToken(token);
      getChatBotMessages(token, decodedToken);
    }
  }, [navigate]);

  async function getChatBotMessages(token: string | null, decodedToken: { id: string; role: string; exp: number } | null) {
    if (!classCode || !token) return;

    try {
      const response = await api.get<any>(`/students/${decodedToken?.id}/classes/${classCode}/chat-bot-messages`, {
        headers: {                                                                         
          Authorization: `Bearer ${token}`,                                                
        },                                                                                 
      });                                                                                 
      if (response.data.messages) {
        const fetchedMessages = response.data.messages.flatMap((msg: { student_message: string; ai_message: string; created_at: string }) => {
          const dateObject = new Date(msg.created_at);
          // Formata o objeto Date. Ele converte de UTC (13:32Z) para o fuso horário
          // especificado (America/Sao_Paulo, GMT-3), resultando em 10:32.
          const formattedTime = dateObject.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }) + ' ' + dateObject.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/Sao_Paulo'
          });
          return [
            {
              role: "user",
              content: msg.student_message,
              time: formattedTime
            },
            {
              role: "agent",
              content: msg.ai_message,
              time: formattedTime
            }
          ];
        });
        setMessages(fetchedMessages);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao buscar mensagens.");
    }
  }
  
  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!input.trim() || !classCode || !decodedToken || !jwtToken) return;

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    const now = new Date();
    const formattedTime = now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' ' + now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Sao_Paulo'
    });
 

    // Add user message to state
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userMessage, time: formattedTime },
      { role: "agent", content: "Pensando...", time: formattedTime }, // Placeholder for AI response
    ]);

    try {
      const response = await fetch("http://localhost:3000/chat-bot-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          student_message: userMessage,
          class_code: classCode,
          student_id: decodedToken.id,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to fetch AI response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseContent = "";

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponseContent += chunk;

        // Update the last message (AI's message) in state
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1].content = aiResponseContent;
          return newMessages;
        });
      }
    } catch (error: any) {
      console.error("Error during streaming AI response:", error);
      toast.error(error.message || "Erro ao obter resposta do AI.");
      // Remove the placeholder AI message if an error occurs
      setMessages((prevMessages) => prevMessages.slice(0, prevMessages.length - 1));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      <CurrentClass
        acronym={`ED`}
        code={`${classCode}`}
        title={`Estrutura de Dados`}
        userType="student"
      />

      <div className="flex-grow overflow-hidden px-4 flex justify-center mt-24 mb-28">
        <Card className="w-full max-w-2xl flex flex-col h-full">
          <CardHeader className="flex-shrink-0 flex flex-row items-center">
            <div className="flex items-center gap-4">
              <Avatar className="border">
                <AvatarImage src="/avatars/01.png" alt="Image" />
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm leading-none font-medium">DumbleAI</p>
                <p className="text-muted-foreground text-xs">m@example.com</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-grow overflow-y-auto px-4">
            <div className="flex flex-col gap-4 pb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  )}
                >
                  {message.role === "user" ? (
                    <span className="prose"><ConversorMDtoHTML message={message.content} /></span>
                  ) : (
                    <span className="prose prose-invert"><ConversorMDtoHTML message={message.content} /></span>
                  )}

                  <div className="text-xs text-right text-muted-foreground mt-1">{message.time}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <CardFooter className="flex-shrink-0 border-t">
            <form
              onSubmit={handleSendMessage}
              className="relative w-full"
            >
              <Input
                id="message"
                placeholder="Pergunte alguma coisa"
                className="flex-1 pr-10"
                autoComplete="off"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute top-1/2 right-2 size-6 -translate-y-1/2 rounded-full"
                disabled={inputLength === 0 || isLoading}
              >
                {isLoading ? <Spinner className="size-3.5"/> : <ArrowUpIcon className="size-3.5" />}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      <StudentsNavigation activePage="chatBot" />
    </div>
  );
}
