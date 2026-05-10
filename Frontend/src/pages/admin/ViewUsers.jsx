import axios from "axios";
import React, { useEffect, useState } from "react";

const Users = () => {
  const [users, setusers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/admin/users");
        if (response.data) {
          setusers(response.data.data);
        }
      } catch (error) {
        alert("Error fetching users:", error.response.data.message || error.message);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 md:p-10">

      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
        All Users
      </h1>

      <div className="backdrop-blur-lg bg-white/60 border border-white/30 rounded-2xl shadow-lg p-6 transition-all duration-500 hover:shadow-xl">

        {users.length > 0 && (
          <div className="grid grid-cols-2 font-semibold text-gray-600 border-b pb-3 mb-4">
            <span>Full Name</span>
            <span>Email</span>
          </div>
        )}

        <div className="space-y-3">
          {
            console.log(users)
          }

          {users.length > 0 && users.map((user, index) => (
            <div
              key={index}
              className="grid grid-cols-2 items-center bg-white/70 backdrop-blur-md rounded-xl px-4 py-3 shadow-sm hover:scale-[1.02] hover:bg-white transition-all duration-300"
            >
              {
                console.log("user", user)
              }
              <span className="text-gray-800 font-medium">
                {user.username}
              </span>

              <span className="text-gray-600">
                {user.email}
              </span>
            </div>
          ))}

          {users.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              No users found
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Users;