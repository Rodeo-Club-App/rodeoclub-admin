import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { useToast } from "@/hooks/use-toast";
// import { api } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { Loader, Upload, X } from "lucide-react";
import { isDragActive } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { useDropzone } from "react-dropzone";
interface UploadMediaModalProps {
  id?: string;
}

export interface UploadMediaModalRef {
  openModal: (id: string) => void;
}

export const UploadMediaModal = forwardRef<
  UploadMediaModalRef,
  UploadMediaModalProps
>(({}, ref) => {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    multiple: true,
  });

  const removeFile = (file: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  };

  const [isOpen, setIsOpen] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    openModal: (id: string) => {
      setEventId(id);
      setIsOpen(true);
    },
  }));

  const closeModal = () => {
    setIsOpen(false);
  };

  async function handlePublishEvent() {
    try {
      setLoading(true);
      //   await api.patch(`/lcl-events/publish/${eventId}`);

      queryClient.refetchQueries({
        queryKey: ["lcl-events"],
      });
      closeModal();

      toast({
        variant: "success",
        title: "Evento publicado com sucesso",
      });
    } catch (error: any) {
      setLoading(false);

      toast({
        variant: "destructive",
        title: "Falha ao publicar evento",
        description: error.response.data.message,
      });
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload de midias</DialogTitle>

          <div className="max-w-md mx-auto p-6">
            <Card className="border-white">
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/10"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Arraste e solte, ou clique para selecionar
                  </p>
                </div>
                {files.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <span className="text-sm truncate max-w-[180px]">
                            {file.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file)}
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6">
                  <Button className="w-full" disabled={files.length === 0}>
                    Upload {files.length}{" "}
                    {files.length === 1 ? "file" : "files"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogHeader>

        <DialogFooter>
          <Button
            onClick={handlePublishEvent}
            className="bg-primary-blue"
            type="button"
            disabled={loading}
          >
            Confirmar
            {loading && <Loader className="ml-2 w-4 h-4 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
