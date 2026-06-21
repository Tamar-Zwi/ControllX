import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, Shield, User } from 'lucide-react';
import { useForm } from 'react-hook-form'; 
import { loginWithPasskey } from '../lib/api.ts';
import MatrixRain from '../components/MatrixRain.tsx';

type LoginFormInputs = {
  passkey: string;
};

const Login = () => {
  const [apiError, setApiError] = useState(''); 
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setIsScanning(true);
    setApiError('');

    setTimeout(async () => {
      try {
        const user = await loginWithPasskey(data.passkey); 
        localStorage.setItem('user', JSON.stringify(user));
        navigate(user.employeeType === 'DeskManager' ? '/admin' : '/agent');
      } catch (err) {
        setApiError('ACCESS DENIED: Invalid Passkey');
        setIsScanning(false);
      }
    }, 2000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <MatrixRain />

      <style dangerouslySetInnerHTML={{__html: `
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px rgba(0, 0, 0, 0.8) inset !important;
            -webkit-text-fill-color: #34d399 !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}} />

      <div className="z-10 w-full max-w-sm bg-black/80 border border-emerald-900 rounded-lg p-8 backdrop-blur-sm shadow-[0_0_40px_rgba(5,150,105,0.2)]">
        
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2 text-emerald-400">
            <Shield className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-[0.3em]">CONTROLX</h1>
          </div>
          <p className="text-[10px] text-emerald-700 tracking-widest">COMMAND INTERFACE</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-emerald-500 uppercase text-[10px]">
          
          <div className="relative mx-auto w-44 h-44 border border-emerald-900/50 rounded flex items-center justify-center bg-emerald-950/10">
            <div className="relative">
              <Fingerprint className={`w-20 h-20 transition-all duration-1000 ${isScanning ? 'text-emerald-400 opacity-100' : 'text-emerald-950 opacity-40'}`} />
              
              {isScanning && (
                <div className="absolute -top-4 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-scan" />
              )}
            </div>
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-emerald-500" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-emerald-500" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-emerald-500" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-emerald-500" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-emerald-700 font-bold"><User size={12} /> Access Key</label>
              
              <input
                type="password"
                autoComplete="new-password" 
                spellCheck={false} 
                {...register("passkey", { 
                  // 3 בדיקות הולידציה שלנו (מותאמות ל-ID):
                  required: "ACCESS KEY IS REQUIRED", 
                  pattern: { value: /^[0-9]+$/, message: "KEY MUST CONTAIN ONLY NUMBERS" },
                  maxLength: { value: 10, message: "KEY CANNOT EXCEED 10 DIGITS" }
                })}
                className={`w-full bg-black/60 border p-3 rounded outline-none text-center tracking-widest transition-colors ${
                  errors.passkey ? 'border-red-500/50 focus:border-red-500 text-red-400' : 'border-emerald-900 text-emerald-400 focus:border-emerald-500'
                }`}
                placeholder="••••"
              />
            </div>

            {errors.passkey && (
              <div className="text-red-500 font-bold text-center animate-pulse tracking-wider">
                {errors.passkey.message}
              </div>
            )}

            {apiError && !errors.passkey && (
              <div className="text-red-600 font-bold text-center animate-pulse tracking-wider">
                {apiError}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className={`w-full py-4 font-bold border transition-all ${isScanning ? 'border-emerald-950 text-emerald-900' : 'border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black shadow-[0_0_20px_rgba(5,150,105,0.3)]'}`}
          >
            {isScanning ? 'AUTHENTICATING...' : 'DECRYPT & ENTER'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;