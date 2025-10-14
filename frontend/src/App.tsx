// src/frontend/src/App.tsx
import { useState } from "react";
import { authClient } from "./lib/auth";
import "./App.css";

function App() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authClient.signIn.email({
          email,
          password,
          rememberMe: true,
          callbackURL: "http://localhost:5174/",
      });

      console.log(response.data);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  }

return (
    <div className="w-full mx-auto mt-8 p-6">
      <form onSubmit={handleSubmit}>
        {/* Flexboxコンテナで要素を横並びにする */}
        <div className="flex items-center justify-center">
          {/* Email */}
          <label 
            htmlFor="email" 
            className="font-medium mr-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-48 p-2 border border-gray-300 rounded"
            required
          />

          {/* Password */}
          <label 
            htmlFor="password" 
            className="font-medium ml-6 mr-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-48 p-2 border border-gray-300 rounded"
            required
          />
        </div>

        {/* Button */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            className="bg-gray-100 text-gray-800 py-2 px-10 text-lg rounded-lg shadow-sm hover:bg-gray-200"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;