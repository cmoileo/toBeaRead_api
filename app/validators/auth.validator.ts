import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    userName: vine.string().minLength(3).maxLength(32),
    email: vine.string().email(),
    password: vine.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/),
  })
)
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().optional(),
    userName: vine.string().minLength(3).maxLength(32).optional(),
    password: vine.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/),
  })
)
