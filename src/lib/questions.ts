
export const generateQuestions= async (storyId: number) => {
    const token = localStorage.getItem("accessToken")
    const url = `${import.meta.env.VITE_API_URL}/questions/story/${storyId}/generate`;
    const res = await fetch(url , {
        method:"POST",
        headers:{
            Authorization:token?`Bearer ${token}`:''
        }
    })
    return await res.json()
}

export const getQuestions = async (storyId:number) => {
    const token = localStorage.getItem("accessToken")
    const url = `${import.meta.env.VITE_API_URL}/questions/story/${storyId}`;
    const res = await fetch(url , {
        method:"GET",
        headers:{
            Authorization:token?`Bearer ${token}`:''
        }
    })
    return await res.json()
}

export const addQuestions = async (storyId: number, data:{question:string}) => {
    const token = localStorage.getItem("accessToken")
    const url = `${import.meta.env.VITE_API_URL}/questions/story/${storyId}/add`;
    const res = await fetch(url , {
        method:"POST",
        headers:{
            "Content-Type": "application/json",
            Authorization:token?`Bearer ${token}`:''
        },
        body:JSON.stringify(data)
    })
    return await res.json()
}

export const updateQuestion = async (questionId:number, data:{question:string}) => {
    const token = localStorage.getItem("accessToken")
    const url = `${import.meta.env.VITE_API_URL}/questions/${questionId}`;
    const res = await fetch(url , {
        method:"PUT",
        headers:{
            "Content-Type": "application/json",
            Authorization:token?`Bearer ${token}`:''
        },
        body:JSON.stringify(data)
    })
    return await res.json()
}

export const deleteQuestion = async (questionId:number) => {
    const token = localStorage.getItem("accessToken")
    const url = `${import.meta.env.VITE_API_URL}/questions/${questionId}`;
    const res = await fetch(url , {
        method:"DELETE",
        headers:{
            Authorization:token?`Bearer ${token}`:''
        }
    })
    return await res.json()
}

export const approveQuestions = async (storyId:number) => {
    const token = localStorage.getItem("accessToken")
    const url = `${import.meta.env.VITE_API_URL}/questions/story/${storyId}/approve`;
    const res = await fetch(url , {
        method:"PATCH",
        headers:{
            Authorization:token?`Bearer ${token}`:''
        }
    })
    return await res.json()
}

export const regenerateQuestions = async(storyId:number) => {
    const token = localStorage.getItem("accessToken")
    const url = `${import.meta.env.VITE_API_URL}/questions/story/${storyId}/regenerate`;
    const res = await fetch(url , {
        method:"POST",
        headers:{
            Authorization:token?`Bearer ${token}`:''
        }
    })
    return await res.json()
} 

export const submitAnswers = async (storyId:number,data: {
    answers: {
      questionId: number;
      answer: string;
    }[];
  }) =>{
    const token = localStorage.getItem("accessToken")
    const url = `${import.meta.env.VITE_API_URL}/questions/${storyId}/answers`;
     const res = await fetch(url , {
        method:"POST",
        headers:{
            "Content-Type": "application/json",
            Authorization:token?`Bearer ${token}`:''
        },
        body:JSON.stringify(data)
    })
    return await res.json()
}