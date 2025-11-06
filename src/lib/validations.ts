import { z } from "zod";

// Auth validations
export const signUpSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muy largo"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "Contraseña muy larga"),
  fullName: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Nombre muy largo")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
});

export const signInSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muy largo"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// Profile validations
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Nombre muy largo")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
  avatar_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

// Exam validations
export const examAnswerSchema = z.enum(["option_a", "option_b", "option_c", "option_d"]);

export const examSubmissionSchema = z.object({
  answers: z.record(z.string().uuid(), examAnswerSchema),
});

// Chat validations
export const chatMessageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1, "El mensaje no puede estar vacío").max(2000, "Mensaje muy largo"),
    })
  ),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ExamSubmission = z.infer<typeof examSubmissionSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
