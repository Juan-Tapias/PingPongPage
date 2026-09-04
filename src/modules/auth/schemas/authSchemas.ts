import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

export const loginSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, 'El correo electrónico es obligatorio')
      .email('Ingresa un correo electrónico válido'),
    password: z
      .string()
      .min(1, 'La contraseña es obligatoria')
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  }),
)

export const registroSchema = toTypedSchema(
  z
    .object({
      nombre: z
        .string()
        .min(1, 'El nombre es obligatorio')
        .min(2, 'El nombre debe tener al menos 2 caracteres'),
      apellido: z
        .string()
        .min(1, 'El apellido es obligatorio')
        .min(2, 'El apellido debe tener al menos 2 caracteres'),
      email: z
        .string()
        .min(1, 'El correo electrónico es obligatorio')
        .email('Ingresa un correo electrónico válido'),
      telefono: z
        .string()
        .min(1, 'El teléfono es obligatorio')
        .regex(/^[0-9+ ]{7,15}$/, 'Ingresa un número de teléfono válido'),
      tipo: z.enum(['camper', 'trabajador'], {
        message: 'Debes seleccionar si eres Camper o Trabajador',
      }),   
      password: z
        .string()
        .min(1, 'La contraseña es obligatoria')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
      confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    }),
)
