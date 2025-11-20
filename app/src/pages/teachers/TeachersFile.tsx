import CurrentClass from "@/components/current-class";
import TeachersNavigation from "@/components/teachers-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { File, Trash, Upload } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { verifyJWTToken } from "@/verifyJWTToken";
import { Spinner } from "@/components/ui/spinner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import api from "@/apiService";
import { verifyClass } from "@/verifyClass";

export default function TeachersFile() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [archives, setArchives] = useState<{ id: string; name: string; type: string }[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [archiveToDelete, setArchiveToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actuallyClass, setActuallyClass] = useState<any>(null);
  
  const { class_id } = useParams<{ class_id: string }>();

  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const decodedToken = verifyJWTToken("teacher", navigate);

      if (decodedToken) {
        setDecodedToken(decodedToken);
        const token = localStorage.getItem("JWTToken");
        setJwtToken(token);

        const isValid = await verifyClass(navigate, class_id, decodedToken);

        if (isValid) {
          fetchActuallyClasses(token);
          fetchArchives(token);
        }
      }
    };

    run();
  }, [navigate, class_id]);

  async function fetchArchives(token: string | null) {
    if (!class_id || !token) return;

    try {
      const response = await api.get<any>(`/classes/${class_id}/archives`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if(response.data.archives){
        setArchives(response.data.archives);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao buscar arquivos.");
    }
  }

  async function handleDeleteArchive(archiveId: string) {
    try {
      await api.delete(`/archives/${archiveId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      toast.success("Arquivo deletado com sucesso!");
      fetchArchives(jwtToken);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao deletar arquivo.");
    }
  }

  function handleUpload(){
    inputFileRef.current?.click();
  }

  async function handleSaveUploads() {
    if (selectedFiles.length === 0) {
      toast.error("Nenhum arquivo selecionado.");
      return;
    }

    if (!class_id) {
      toast.error("Código da turma não encontrado.");
      return;
    }

    setIsLoading(true);

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("class_id", class_id);

        await api.post("/archives", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${jwtToken}`,
          },
        });
      }

      toast.success("Arquivos salvos com sucesso!");
      setSelectedFiles([]);
      fetchArchives(jwtToken);
    } catch (error: any) {
      console.error("Erro ao salvar arquivos:", error);
      toast.error(error.response?.data?.message || "Erro ao salvar arquivos.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleRemoveFile(indexToRemove: number) {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
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

  return (
    <div className="font-nunito">
      <CurrentClass class_id={`${class_id}`} title={actuallyClass?.title} userType="teacher"/>
      <div className="container mx-auto max-w-2xl mt-26 pb-24 p-6">
        <h2 className="font-nunito text-2xl font-extrabold mb-4">Biblioteca de arquivos</h2>
        <Input 
          type="file" 
          multiple 
          accept=".pdf,.doc,.docx,.txt,.pptx"
          className="hidden" 
          ref={inputFileRef} 
          onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} 
        />
        <div className="flex flex-col items-center justify-center border-2 border-dashed bg-none rounded-2xl max-w-2xl h-24 hover:border-violet-400 cursor-pointer gap-4" onClick={handleUpload}>
          <Upload />
          <small>Arraste e solte ou Clique para adicionar arquivos</small>
        </div>
        {selectedFiles.length > 0 && (
          <div className="mt-4">
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
                    className="text-text-secondary hover:text-red-700 dark:hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {selectedFiles.length > 0 ? 
        (
          <Button 
            className="mt-4 w-full bg-purple-predominant rounded-xl border-b-4 border-b-dark-shadow p-6 font-nunito text-base font-bold hover:bg-purple-600 dark:text-white" 
            onClick={() => handleSaveUploads()} 
          >
            {isLoading ? <Spinner/> : null}
            SALVAR
          </Button>
        )
        : (
          <Button 
            className="mt-4 w-full bg-grey-disabled border-b-4 text-text-secondary rounded-xl border-2 p-6 font-nunito text-base font-bold" 
            disabled
          >
            SALVAR
          </Button>
        )}

          <div className="mt-8">
            <h2 className="font-nunito text-1xl font-extrabold mb-4">Existentes</h2>
             {archives.length > 0 ? (
              <div>
                <ul className="space-y-2">
                  {archives.map((archive) => (
                    <li key={archive.id} className="flex items-center justify-between p-2 border rounded-md max-w-2xl">
                      <div className="flex items-center">
                        <File className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
                        <span className="truncate pr-2">{archive.name}.{archive.type}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setArchiveToDelete(archive.id);
                          setIsAlertOpen(true);
                        }}
                        className="text-text-secondary hover:text-red-700 dark:hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Nenhum arquivo encontrado.</p>
            )}
          </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza que deseja deletar esse arquivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao deletar esse arquivo, você não poderá recuperá-lo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (archiveToDelete) {
                handleDeleteArchive(archiveToDelete);
              }
              setIsAlertOpen(false);
            }}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TeachersNavigation activePage="files" />
    </div>
  )
}
