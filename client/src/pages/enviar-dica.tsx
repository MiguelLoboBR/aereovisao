import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// Removemos o import do Layout pois agora usamos DashboardLayout via ProtectedRoute

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload, AlertTriangle } from "lucide-react";

// Schema para validação do formulário de envio de dica
const tipSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  content: z.string().min(20, "O conteúdo deve ter pelo menos 20 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
});

type TipFormValues = z.infer<typeof tipSchema>;

const categories = [
  { value: "equipamento", label: "Equipamento" },
  { value: "fotografia", label: "Fotografia e Vídeo" },
  { value: "regulamentação", label: "Regulamentação" },
  { value: "segurança", label: "Segurança" },
  { value: "técnica", label: "Técnicas de Voo" },
  { value: "manutenção", label: "Manutenção" },
  { value: "outro", label: "Outro" },
];

export default function EnviarDicaPage() {
  const { user } = useAuthJWT();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TipFormValues>({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Mutação para envio da dica
  const createTipMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/tips", formData, {
        formData: true,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips"] });
      
      toast({
        title: "Dica enviada!",
        description: "Sua dica foi enviada com sucesso e está em análise.",
      });
      
      setLocation("/dicas");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar dica",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: TipFormValues) => {
    if (!user) {
      toast({
        title: "Não autorizado",
        description: "Você precisa estar logado para enviar dicas.",
        variant: "destructive",
      });
      return;
    }

    // Criar FormData para upload de imagem
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("content", values.content);
    formData.append("category", values.category);
    formData.append("authorId", String(user.id));
    
    if (imageFile) {
      formData.append("image", imageFile);
    }

    createTipMutation.mutate(formData);
  };

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <section className="py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-inter font-bold text-aero-slate-800">Enviar dica</h1>
          <p className="text-aero-slate-600 mt-2">Compartilhe seu conhecimento com a comunidade</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Nova dica ou tutorial</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo para enviar uma dica. Ela será revisada por nossos moderadores antes de ser publicada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Importante!</AlertTitle>
              <AlertDescription>
                Sua dica será enviada para revisão e só será publicada após aprovação de um administrador.
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite um título claro e objetivo" {...field} />
                      </FormControl>
                      <FormDescription>
                        Um bom título ajuda outros pilotos a encontrarem sua dica.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva sua dica ou tutorial em detalhes..." 
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Seja detalhado e claro. Você pode usar Markdown para formatação.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>Imagem (opcional)</FormLabel>
                  <div 
                    className="border-2 border-dashed border-aero-slate-300 rounded-lg p-4 cursor-pointer hover:bg-aero-slate-50 transition-colors text-center"
                    onClick={handleImageClick}
                  >
                    {imagePreview ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-44 object-contain mb-2" 
                        />
                        <p className="text-sm text-aero-slate-500">Clique para alterar a imagem</p>
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center">
                        <Upload className="h-10 w-10 text-aero-slate-400 mb-2" />
                        <p className="text-aero-slate-600">Clique para upload de imagem</p>
                        <p className="text-sm text-aero-slate-500 mt-1">
                          PNG, JPG ou GIF (máx. 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation("/dicas")}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTipMutation.isPending}
                  >
                    {createTipMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar dica"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}