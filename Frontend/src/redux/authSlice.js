import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/admin/current-admin', {
        withCredentials: true
      });

      console.log("res", res);

      return res.data.data;
    } catch (error) {
      console.log("error", error?.response?.statusText);

      return rejectWithValue(
        error.response?.data?.message || "Error"
      );
    }
  }
);
const authSlice=createSlice({
    name:'auth',
    initialState:{
        user:null,
        status:'idle',
        error:null,
        isAdmin:undefined
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
            .addCase(fetchUser.pending,(state)=>{
                state.status='loading';
            })
            .addCase(fetchUser.fulfilled,(state,action)=>{
                state.status='succeeded';
                state.user=action.payload;
                state.isAdmin=action.payload?.role==="admin";
            })
            .addCase(fetchUser.rejected,(state,action)=>{
                state.status='failed';
                state.error=action.payload;
            });
    }
})

export const {  } = authSlice.actions;
 
export default authSlice.reducer;