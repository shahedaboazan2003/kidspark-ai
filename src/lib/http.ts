const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export type ApiResponse<DATA = unknown> = {
  statusCode: number
  message: string
  success: boolean
  data: DATA
}


const getErrorMessage = (status: number) => {
  switch (status) {
    case 400:
      return 'Bad request 🧐'
    case 401:
      return 'Unauthorized - please login again 🔐'
    case 403:
      return 'Forbidden 🚫'
    case 404:
      return 'Not found 😢'
    case 409:
      return 'Already exists ⚠️'
    case 422:
      return 'Validation error (check your inputs) ✍️'
    case 500:
      return 'Server error 💥'
    default:
      return 'Something went wrong 😵'
  }
}

const http = {
  post: async <TResponse, TBody = unknown>(
    url: string,
    body?: TBody
  ): Promise<TResponse> => {
    const res = await fetch(`${API}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('accessToken')
          ? `Bearer ${localStorage.getItem('accessToken')}`
          : ''
      },
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await res.json()

    //  UPDATED ERROR HANDLING
    if (!res.ok) {
      console.log('❌ API ERROR:', {
        status: res.status,
        data
      })

      throw new Error(data?.message || getErrorMessage(res.status))
    }

    return data as TResponse
  },

  get
  : async <TResponse>(url: string): Promise<TResponse> => {
    const res = await fetch(`${API}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('accessToken')
          ? `Bearer ${localStorage.getItem('accessToken')}`
          : ''
      }
    })

    const data = await res.json()

    //  UPDATED ERROR HANDLING
    if (!res.ok) {
      console.log('❌ API ERROR:', {
        status: res.status,
        data
      })

      throw new Error(data?.message || getErrorMessage(res.status))
    }

    return data as TResponse
  }
}

export default http