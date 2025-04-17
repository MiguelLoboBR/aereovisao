import { z } from "zod";

export const postFormSchema = z.object({
  titulo: z.string().min(3, "Título obrigatório"),
  categoria: z.string().nonempty("Categoria obrigatória"),
  youtubeUrl: z.string().url("URL inválida").optional().nullable(),
  conteudo: z
    .string()
    .min(5, "Conteúdo deve ter pelo menos 5 caracteres")
    .max(50000, "Conteúdo muito longo"),
});

export type PostFormValues = z.infer<typeof postFormSchema>;