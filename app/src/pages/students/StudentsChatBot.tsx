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
import { verifyClass } from "@/verifyClass";


export default function StudentsChatBot() {
  const { class_id } = useParams<{ class_id: string }>();
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string; time: string }[]>([
    { role: "agent", content: "Olá, seja bem-vindo! Eu sou o DumbleAI, tenho acesso ao conteúdo do seu professor. Qualquer dúvida, me pergunte!", time: "" }
  ]);
  const [input, setInput] = useState("");
  const inputLength = input.trim().length;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actuallyClass, setActuallyClass] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const decodedToken = verifyJWTToken("student", navigate);

      if (decodedToken) {
        setDecodedToken(decodedToken);
        const token = localStorage.getItem("JWTToken");
        setJwtToken(token);

        const isValid = await verifyClass(navigate, class_id, decodedToken);

        if (isValid) {
          await fetchActuallyClasses(token);
          await getChatBotMessages(token, decodedToken);
        }
      }
    };
  
    run();
  }, [navigate, class_id]);

  async function getChatBotMessages(token: string | null, decodedToken: { id: string; role: string; exp: number } | null) {
    if (!class_id || !token) return;

    try {
      const response = await api.get<any>(`/students/${decodedToken?.id}/classes/${class_id}/chat-bot-messages`, {
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
        setMessages(prev => [prev[0], ...fetchedMessages]);
      } else {
        setMessages(prev => [prev[0]]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao buscar mensagens.");
    }
  }
  
  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!input.trim() || !class_id || !decodedToken || !jwtToken) return;

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
      { role: "agent", content: "Pensando...", time: formattedTime }, 
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
          class_id: class_id,
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

  async function fetchActuallyClasses(token: string | null) {
    const enrolledResponse = await api.get<any>(`/classes/${class_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    if (enrolledResponse.data.success) {
      setActuallyClass(enrolledResponse.data.class);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      <CurrentClass
        class_id={`${class_id}`}
        title={actuallyClass?.title}
        userType="student"
      />

      <div className="font-nunito flex-grow overflow-hidden px-4 flex justify-center mt-26 mb-28">
        <Card className="w-full max-w-2xl flex flex-col h-full">
          <CardHeader className="flex-shrink-0 flex flex-row items-center border-b">
            <div className="flex items-center gap-4">
              <Avatar className="border">
                <AvatarImage src="/DumbleIcon.png" alt="Image" />
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm leading-none font-medium">DumbleAI</p>
                <p className="text-muted-foreground text-xs">IA que te ajuda nos estudos</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-grow overflow-y-auto bg-muted pt-4">
            <div className="flex flex-col gap-4 pb-4 bg-muted">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-xs md:text-sm",
                    message.role === "user"
                      ? "bg-[#DCA7FF] text-black ml-auto"
                      : "bg-white text-black"
                  )}
                >
                  {message.role === "user" ? (
                    <span className="prose text-black text-sm"><ConversorMDtoHTML message={message.content} /></span>
                  ) : (
                    <span className="prose prose-invert text-black text-sm"><ConversorMDtoHTML message={message.content} /></span>
                  )}

                  {message.time && <div className="text-right text-black mt-1 text-xs">{message.time}</div>}
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
                placeholder="Pergunte alguma coisa..."
                className="flex-1 pr-10"
                autoComplete="off"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute top-1/2 right-2 size-6 -translate-y-1/2 rounded-full bg-purple-predominant dark:text-white hover:bg-purple-700"
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
