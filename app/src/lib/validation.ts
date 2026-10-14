import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
});

export const updateDocumentSchema = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty").max(200).optional(),
    content: z.string().max(500_000, "Document is too large").optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "Provide at least one of title or content to update",
  });

export const shareDocumentSchema = z.object({
  userId: z.string().min(1, "Pick a user to share with"),
  permission: z.enum(["VIEW", "EDIT"]).default("VIEW"),
});

export const loginSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ShareDocumentInput = z.infer<typeof shareDocumentSchema>;
