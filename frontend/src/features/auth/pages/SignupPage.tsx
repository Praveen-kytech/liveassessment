import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { TihvoLogoText } from "@/components/ui/TihvoLogo"

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
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-3">
              <img src="/logo.png" alt="Tihvo Logo" className="w-10 h-10 object-contain" />
              <TihvoLogoText fontSize={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight mt-2">Create Account</h2>
            <p className="text-sm text-gray-500 mt-1">Join Tihvo Meet to start managing assessments.</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" 
               
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" 
               
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" 
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
              <select
                value={roleId}
                onChange={e => setRoleId(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none bg-white"
              >
                <option value={1}>Admin</option>
                <option value={2}>Participant</option>
              </select>
            </div>
            
            <div className="pt-2">
              <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg hover:bg-primary/90 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                Sign Up
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-50 p-4 lg:p-8">
        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 flex items-center justify-center bg-gray-900">
          <img 
            src="/doctor_hero.png" 
            alt="Healthcare Professional" 
            className="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-transform duration-1000 hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="relative z-10 flex flex-col h-full text-white p-12">
             <div className="mt-auto mb-8 text-center max-w-lg mx-auto">
               <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg">Tihvo Meet</h2>
               <p className="text-lg text-gray-200 drop-shadow-md">Professional assessment tools tailored for the modern healthcare environment.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
