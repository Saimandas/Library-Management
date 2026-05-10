import axios from "axios"

const register=async (username,email,password,firstName,lastName)=>{
   try {
        const data=await axios.post("http://localhost:5000/api/readers/register", {username,email, password, firstName, lastName });
        return data;
    } catch (error) {
        console.log(error);
        
          console.log(error.response);
        if (error.response.status===500) {
            throw new Error("Server is down");
        }else{
        throw new Error(error.response.data.message);
    }
}
}

const login=async function(email,password){
    try {
        const res=await axios.post("http://localhost:5000/api/readers/login",{email,password})
        return res.data.data;
    } catch (error) {
        console.log(error.response);
        throw new Error(error.response.data.message)
    }
}

export { login,register }