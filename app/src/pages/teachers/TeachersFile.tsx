import CurrentClass from "@/components/current-class";
import TeachersNavigation from "@/components/teachers-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { File, Trash, Upload } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { verifyJWTToken } from "@/verifyJWTToken";
import api from "@/apiService";

export default function TeachersFile() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("teacher", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
      setJwtToken(localStorage.getItem("JWTToken"));
    }
  }, [navigate]);

  const { classCode } = useParams<{ classCode: string }>();

  function handleUpload(){
    inputFileRef.current?.click();
  }

  async function handleSaveUploads() {
    if (selectedFiles.length === 0) {
      toast.error("Nenhum arquivo selecionado.");
      return;
    }

    if (!classCode) {
      toast.error("Código da turma não encontrado.");
      return;
    }

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("class_code", classCode);

        await api.post("/archives", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${jwtToken}`,
          },
        });
      }

      toast.success("Arquivos salvos com sucesso!");
      setSelectedFiles([]);
    } catch (error: any) {
      console.error("Erro ao salvar arquivos:", error);
      toast.error(error.response?.data?.message || "Erro ao salvar arquivos.");
    }
  }

  function handleRemoveFile(indexToRemove: number) {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <CurrentClass acronym={`ED`} code={`ED-1234`} title={`Estrutura de Dados`} userType="teacher"/>
      <div className="w-full pt-18 max-w-2xl">
         <h1 className="text-4xl font-bold mb-4">Arquivos do Professor - {classCode}</h1>
          <Input 
            type="file" 
            multiple 
            accept=".pdf,.doc,.docx,.txt,.pptx"
            className="collapse" 
            ref={inputFileRef} 
            onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} 
          />
          <div className="flex items-center justify-center border-2 border-dashed bg-none rounded-2xl max-w-2xl h-24 hover:border-violet-400 cursor-pointer" onClick={handleUpload}>
            <Upload />
            <span className="pl-4">Subir Arquivo</span>
          </div>
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-lg font-semibold mb-2">Arquivos selecionados:</p>
              <ul className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between p-2 border rounded-md max-w-2xl">
                    <div className="flex items-center">
                      <File className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
                      <span className="truncate pr-2">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Button className={`w-full mt-4 bg-emerald-400 hover:bg-emerald-700 ${selectedFiles.length === 0 ? 'bg-gray-400' : ''}`} onClick={() => handleSaveUploads()} disabled={selectedFiles.length === 0}>Salvar</Button>
      </div>
      <TeachersNavigation activePage="files" />
    </div>
  )
}
