import { UserType } from '@/contexts/AuthContext'

interface User {
  id: number
  username: string
  email: string
  type: UserType
  firstName: string
  lastName: string
}

export default User
