import Joi from "joi";

/* =========================
   REGISTER SCHEMA
========================= */
export const registerSchema = Joi.object({
  firstName: Joi.string().min(3).max(20).required().messages({
    "string.min": "First name must be at least 3 characters",
    "string.max": "First name must be at most 20 characters",
    "any.required": "First name is required",
  }),

  lastName: Joi.string().min(3).max(20).required().messages({
    "string.min": "Last name must be at least 3 characters",
    "string.max": "Last name must be at most 20 characters",
    "any.required": "Last name is required",
  }),

  // kept for backward compatibility (optional)
  fullName: Joi.string().min(3).max(60).optional(),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password must be at most 30 characters",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, and number",
      "any.required": "Password is required",
    }),

  phoneNumber: Joi.string()
    .pattern(/^\+?\d{10,15}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid number of 10-15 digits (pure digits or starting with +)",
      "any.required": "Phone number is required",
    }),

  gender: Joi.string()
    .valid("male", "female")
    .optional()
    .messages({
      "any.only": "Gender must be either 'male' or 'female'",
    }),

  nationality: Joi.string()
    .optional()
    .messages({
      "string.base": "Nationality must be a text value",
    }),

  ageDate: Joi.string()
    .isoDate()
    .optional()
    .messages({
      "string.isoDate": "Age must be a valid ISO date format",
    }),
});

/* =========================
   LOGIN SCHEMA
========================= */
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

/* =========================
   VERIFY SCHEMA
========================= */
export const verifySchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

/* =========================
   GOOGLE LOGIN
========================= */
export const googleLoginSchema = Joi.object({
  idToken: Joi.string().min(10).required(),
});

/* =========================
   FORGOT PASSWORD SCHEMA
========================= */
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required"
  })
});

/* =========================
   RESET PASSWORD SCHEMA
========================= */
export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string()
    .min(8)
    .max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .required()
    .messages({
      "string.min": "New password must be at least 8 characters",
      "string.max": "New password must be at most 30 characters",
      "string.pattern.base": "New password must contain uppercase, lowercase, and number",
      "any.required": "New password is required"
    })
});