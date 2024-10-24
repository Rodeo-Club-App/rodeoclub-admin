import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { forwardRef, useImperativeHandle, useState } from "react";
// import { api } from "@/services/api";
import { api } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Link2, Upload } from "lucide-react";
import { CircularProgressbar } from "react-circular-progressbar";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

import axios from "axios";
import { filesize } from "filesize";

interface UploadMediaModalProps {
  id?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  readableSize: string;
  preview: string;
  uploaded: boolean;
  url: string | null;
  progress: number;
  error: boolean;
  file: File;
  type: string;
}

export interface UploadMediaModalRef {
  openModal: () => void;
}

export const UploadMediaModal = forwardRef<
  UploadMediaModalRef,
  UploadMediaModalProps
>(({}, ref) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const queryClient = useQueryClient();

  // const { toast } = useToast();

  const handleUpload = async (files: File[]) => {
    const uploadedFiles: UploadedFile[] = files.map((file) => ({
      file,
      id: String(new Date().getTime()),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null,
      type: file.type,
    }));

    setUploadedFiles((prevFiles) => prevFiles.concat(uploadedFiles));

    uploadedFiles.forEach((file) => processUpload(file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: {
      // "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    multiple: true,
  });

  const updateFile = (id: string, data: Partial<UploadedFile>) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.map((uploadedFile) =>
        id === uploadedFile.id ? { ...uploadedFile, ...data } : uploadedFile
      )
    );
  };

  const processUpload = async (uploadedFile: UploadedFile) => {
    try {
      const { data: signedUrlData } = await api.post<{
        signedUrl: string;
        url: string;
      }>("/files/sign-url", {
        filename: uploadedFile.name,
        filetype: uploadedFile.type,
      });

      // const data = new FormData();
      // data.append("file", uploadedFile.file, uploadedFile.name);

      console.log(uploadedFile);

      const ImageResponse = await fetch(uploadedFile.preview);
      const imageBlob = await ImageResponse.blob();

      await axios.put(
        signedUrlData.signedUrl,
        imageBlob,

        {
          headers: {
            "Content-Type": uploadedFile.type,
          },
          onUploadProgress: (e) => {
            const progress = Math.round((e.loaded * 100) / e.total!);
            updateFile(uploadedFile.id, { progress });
          },
        }
      );

      updateFile(uploadedFile.id, {
        uploaded: true,
        url: signedUrlData.url,
      });

      await api.post("/medias/rodeoclub", {
        url: signedUrlData.url,
        type: "image",
      });
    } catch {
      updateFile(uploadedFile.id, { error: true });
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    openModal: () => {
      setIsOpen(true);
    },
  }));

  const closeModal = () => {
    queryClient.refetchQueries({
      queryKey: ["medias"],
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <ScrollArea>
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
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <img
                              src={file.preview}
                              alt={`Preview ${index}`}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <span className="text-sm truncate max-w-[180px]">
                              {file.name}
                            </span>
                          </div>

                          {!file.uploaded && !file.error && (
                            <CircularProgressbar
                              styles={{
                                root: { width: 24 },
                                path: { stroke: "#7159c1" },
                              }}
                              strokeWidth={10}
                              value={file.progress}
                            />
                          )}

                          {file.url && (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Link2
                                style={{ marginRight: 8 }}
                                size={24}
                                color="#222"
                              />
                            </a>
                          )}

                          {file.uploaded && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            // onClick={() => removeFile(file)}
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="h-4 w-4" />
                          </Button> */}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* <div className="mt-6">
                    <Button className="w-full" disabled={files.length === 0}>
                      Upload {files.length}{" "}
                      {files.length === 1 ? "file" : "files"}
                    </Button>
                  </div> */}
                </CardContent>
              </Card>
            </div>
          </DialogHeader>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});
