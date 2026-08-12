import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [roleId, setRoleId] = useState(1)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      const parts = fullName.trim().split(" ")
      const firstName = parts[0]
      const lastName = parts.length > 1 ? parts.slice(1).join(" ") : ""

      const response = await fetch("http://localhost:8000/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          first_name: firstName, 
          last_name: lastName, 
          role_id: roleId, 
          organization_id: 1 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        let errMsg = "Signup failed"
        if (Array.isArray(errorData.detail)) {
          errMsg = errorData.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ')
        } else if (errorData.detail) {
          errMsg = errorData.detail
        }
        throw new Error(errMsg)
      }

      navigate("/login")
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md" 
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md" 
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md" 
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={roleId}
              onChange={e => setRoleId(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value={1}>Admin</option>
              <option value={2}>Participant</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
