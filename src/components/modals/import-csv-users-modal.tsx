import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { forwardRef, useImperativeHandle, useState } from "react";
import { api } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse"; // Biblioteca para parsear CSV
import { Button } from "../ui/button";

interface ImportCsvUsersModalProps {
  id?: string;
}

export interface ImportCsvUsersModalRef {
  openModal: () => void;
}

export const ImportCsvUsersModal = forwardRef<
  ImportCsvUsersModalRef,
  ImportCsvUsersModalProps
>(({}, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[]>([]); // Armazenar dados do CSV

  const queryClient = useQueryClient();

  const { toast } = useToast();

  const handleUpload = (files: File[]) => {
    console.log(files);
    const file = files[0];
    console.log(file);

    if (!file)
      return toast({ title: "Formato inválido", variant: "destructive" });

    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast({ title: "Formato inválido" });
        return;
      }

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const formattedData = results.data.map((row: any) => ({
            firstName: row.Nome,
            lastName: row.Sobrenome,
            email: row.Email,
            birthdate: row.Nascimento,
            cpf: row.CPF,
            phone: row.Telefone,
            partner: row.Parceiro,
            number: row.Número,
            complement: row.Complemento,
            zipCode: row.CEP,
          }));

          const emailSet = new Set();
          const cpfSet = new Set();
          const errors: any[] = [];

          const uniqueData = formattedData.filter((user) => {
            const normalizedEmail = user.email.toLowerCase();
            const normalizedCpf = user.cpf.replace(/[.\-]/g, "");

            const isEmailDuplicate = emailSet.has(normalizedEmail);
            const isCpfDuplicate = cpfSet.has(normalizedCpf);

            if (isEmailDuplicate) {
              errors.push(`Email duplicado: ${user.email}`);
              return false;
            }

            if (isCpfDuplicate) {
              errors.push(`CPF duplicado: ${user.cpf}`);
              return false;
            }

            emailSet.add(normalizedEmail);
            cpfSet.add(normalizedCpf);

            return true;
          });

          if (errors.length > 0) {
            toast({
              title: "Erros encontrados",
              description: errors.join(", "),
              variant: "destructive",
            });
          } else {
            setUploadedData(uniqueData);
            console.log(uniqueData);
          }
        },
        error: (error) => {
          console.error("Erro ao ler o arquivo CSV:", error);
        },
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: {
      "text/csv": [".csv"],
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    openModal: () => {
      setIsOpen(true);
    },
  }));

  const closeModal = () => {
    setIsOpen(false);
    setUploadedData([]);
  };

  async function handleImport() {
    try {
      setIsLoading(true);
      const response = await api.post<{
        emailsInUse: string[];
        success: number;
      }>("/user/rodeoclub/import-csv", {
        users: uploadedData,
      });

      toast({
        description: `Importação finalizada, ${response.data.success} usuários adicionados`,
        variant: "success",
      });
      setIsLoading(false);

      queryClient.refetchQueries({
        queryKey: ["users"],
      });

      closeModal();
    } catch (error) {
      console.log(error);
      setIsLoading(false);

      toast({
        variant: "destructive",
        title: "Erro",
        //@ts-ignore
        description: error.message,
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <ScrollArea>
          <DialogHeader>
            <DialogTitle>Criação de usuários com CSV</DialogTitle>
            <DialogDescription>
              A tabela deve conter: Nome, Sobrenome, Email, CPF, Telefone, CEP,
              Número, Complemento
            </DialogDescription>

            <div className="max-w-md mx-auto p-6">
              <Card className="border-white">
                <CardContent>
                  {uploadedData.length === 0 && (
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
                  )}

                  {uploadedData && uploadedData.length > 0 && (
                    <div className="flex flex-col items-center">
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />{" "}
                        {uploadedData.length} usuários encontrados
                      </p>

                      <Button
                        disabled={isLoading}
                        onClick={handleImport}
                        type="button"
                      >
                        Iniciar importação
                        {isLoading && (
                          <Loader className="w-4 h-4 ml-2 animate-spin" />
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </DialogHeader>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});
