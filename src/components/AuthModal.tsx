/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Mail, Lock, Phone, User as UserIcon, LogIn, AlertCircle, Shield } from 'lucide-react';
import { 
  loginWithEmail, 
  signUpWithEmail, 
  loginWithGoogle, 
  loginWithGuest, 
  loginWithPhoneSimulated 
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'phone' | 'google' | 'guest'>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'admin' | 'delivery'>('customer');
  
  // Phone OTP Flow states
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name || !email || !password || !phone) {
          throw new Error('Please fill all fields for registration');
        }
        const user = await signUpWithEmail(email, password, name, phone, role);
        onAuthSuccess(user);
        onClose();
      } else {
        if (!email || !password) {
          throw new Error('Please enter both email and password');
        }
        const user = await loginWithEmail(email, password);
        onAuthSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithGuest();
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Guest Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone) {
      setError('Please enter a valid phone number');
      return;
    }
    // Generate a random 6 digit OTP for the user to copy/paste in sandbox easily!
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(otp);
    setPhoneStep('otp');
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otpCode !== simulatedOtp) {
      setError(`Incorrect OTP. Please try again. (Simulated code is ${simulatedOtp})`);
      return;
    }
    setLoading(true);
    try {
      const user = await loginWithPhoneSimulated(phone, name || 'Phone Customer');
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Phone Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" id="auth-modal-root">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col relative animate-fade-in">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
          <div>
            <h2 className="text-lg font-black text-brand-dark flex items-center">
              <Shield className="w-5 h-5 mr-2 text-brand-green" />
              Arajuma Store Auth
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Secure Gateway</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
            id="close-auth-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-gray-50 border-b border-gray-100 p-1">
          <button
            onClick={() => { setActiveTab('email'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'email' ? 'bg-white shadow text-brand-green' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Email & Password
          </button>
          <button
            onClick={() => { setActiveTab('phone'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'phone' ? 'bg-white shadow text-brand-green' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Phone OTP
          </button>
          <button
            onClick={() => { setActiveTab('google'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'google' ? 'bg-white shadow text-brand-green' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Social / Guest
          </button>
        </div>

        {/* Form area */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="font-bold leading-relaxed">{error}</span>
            </div>
          )}

          {activeTab === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rihan Khan"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">User Role Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['customer', 'delivery', 'admin'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2 text-xs font-black rounded-lg border transition-all cursor-pointer capitalize ${
                            role === r 
                              ? 'bg-brand-green border-brand-green text-white shadow-sm' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {r === 'delivery' ? 'Delivery Boy' : r}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-green hover:bg-emerald-600 text-white text-xs font-black transition-all shadow-md flex items-center justify-center cursor-pointer"
              >
                {loading ? 'Processing Secure Session...' : isSignUp ? 'Create Secured Account' : 'Verify Credentials'}
              </button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-brand-green font-extrabold hover:underline cursor-pointer"
                >
                  {isSignUp ? 'Already registered? Verify credentials' : 'New to Arajuma Store? Register here'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'phone' && (
            <div>
              {phoneStep === 'input' ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">Enter Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">Your Name (For new registrations)</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Optional name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-brand-green hover:bg-emerald-600 text-white text-xs font-black transition-all shadow-md flex items-center justify-center cursor-pointer"
                  >
                    Generate Secure OTP Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-brand-green text-xs font-black text-center mb-2">
                    Simulated OTP sent to {phone}! <br />
                    Use the verification code: <span className="text-lg text-brand-orange select-all font-mono tracking-widest">{simulatedOtp}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">Enter Verification OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="w-full text-center py-3 rounded-xl border border-gray-200 text-lg font-black tracking-widest focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPhoneStep('input')}
                      className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black transition-all cursor-pointer"
                    >
                      Change Number
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl bg-brand-green hover:bg-emerald-600 text-white text-xs font-black transition-all shadow-md flex items-center justify-center cursor-pointer"
                    >
                      {loading ? 'Authenticating...' : 'Verify & Enter'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'google' && (
            <div className="space-y-4 py-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-black shadow-sm flex items-center justify-center space-x-3 cursor-pointer transition-colors"
              >
                <img src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=32&h=32" alt="Google" className="w-5 h-5 rounded-full" />
                <span>Continue with Google Cloud identity</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest">Or fallback bypass</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              <button
                type="button"
                onClick={handleGuestAuth}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-brand-dark hover:bg-gray-800 text-white text-xs font-black shadow-md flex items-center justify-center space-x-3 cursor-pointer transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Enter as Secured Guest Visitor</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
