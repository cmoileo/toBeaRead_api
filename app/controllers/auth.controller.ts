import { loginValidator, registerValidator } from '#validators/auth.validator'
import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  public async register({ request, response }: HttpContext): Promise<void> {
    const data = await request.validateUsing(registerValidator)

    const [emailExists, userNameExists] = await Promise.all([
      User.query().where('email', data.email).first(),
      User.query().where('userName', data.userName).first(),
    ])

    if (emailExists || userNameExists) {
      return response.status(400).json({
        message: emailExists ? 'Email already in use' : 'Username already in use',
      })
    }

    const user = await User.create(data)

    const token = await User.accessTokens.create(user)

    return response.status(201).json({
      user: {
        id: user.id,
        userName: user.userName,
      },
      token,
    })
  }

  public async login({ request, response }: HttpContext): Promise<void> {
    const { email, password, userName } = await request.validateUsing(loginValidator)
    if (!email && !userName) {
      return response.status(400).json({
        message: 'Email or username is required',
      })
    }

    try {
      const user = email
        ? await User.findByOrFail('email', email)
        : await User.findByOrFail('userName', userName)

      if (!(await hash.verify(user.password, password))) {
        return response.status(401).json({
          message: 'Invalid credentials',
        })
      }

      const token = await User.accessTokens.create(user)

      return response.status(200).json({
        user: {
          id: user.id,
          userName: user.userName,
        },
        token,
      })
    } catch {
      return response.status(401).json({
        message: 'Invalid credentials',
      })
    }
  }

  public async logout({ auth, response }: HttpContext): Promise<void> {
    try {
      await auth.use('api').invalidateToken()

      return response.status(200).json({
        message: 'Logged out successfully',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'An error occurred while logging out',
      })
    }
  }
}
