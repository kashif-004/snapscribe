import { useState } from 'react';
import api from './api';

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const userData = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    if (mode === 'register') {
      userData.name = formData.get('name');
    }

    try {
      const endpoint =
        mode === 'register' ? '/auth/register' : '/auth/login';

      const response = await api.post(endpoint, userData);
      const token = response.data.token;

      localStorage.setItem('token', token);
      onAuth(token);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        'Something went wrong. Please try again.'
      );
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#fafafa] p-5">
      <form
        className="w-full max-w-[400px] rounded-[14px] border border-[#ededed] bg-white p-8 max-[480px]:px-5 max-[480px]:py-[25px]"
        onSubmit={handleSubmit}
      >
        <div className="mb-[30px] flex items-center justify-center gap-[9px] text-xl font-bold">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-[#6857db] text-[17px] font-bold text-white">
            S
          </span>
          <span>SnapScribe</span>
        </div>

        <h1 className="m-0 mb-2 text-center text-[23px]">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h1>

        <p className="mb-[25px] text-center text-[13px] leading-[1.5] text-[#999]">
          {mode === 'login'
            ? 'Log in to access your notes.'
            : 'Sign up to start organizing your notes.'}
        </p>

        {mode === 'register' && (
          <label className="mb-[17px] block text-[13px] font-semibold text-[#444]">
            Name
            <input
              type="text"
              name="name"
              placeholder="Your name"
              autoComplete="name"
              required
              className="mt-2 block w-full rounded-lg border border-[#e5e5e5] p-3 text-sm font-normal outline-none focus:border-[#9689ee]"
            />
          </label>
        )}

        <label className="mb-[17px] block text-[13px] font-semibold text-[#444]">
          Email
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="mt-2 block w-full rounded-lg border border-[#e5e5e5] p-3 text-sm font-normal outline-none focus:border-[#9689ee]"
          />
        </label>

        <label className="mb-[17px] block text-[13px] font-semibold text-[#444]">
          Password
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
            required
            className="mt-2 block w-full rounded-lg border border-[#e5e5e5] p-3 text-sm font-normal outline-none focus:border-[#9689ee]"
          />
        </label>

        <button
          className="mt-[5px] w-full cursor-pointer rounded-lg border-0 bg-[#6857db] p-[13px] text-sm font-semibold text-white hover:bg-[#5746c5]"
          type="submit"
        >
          {mode === 'login' ? 'Log In' : 'Create Account'}
        </button>

        <p className="mt-[22px] text-center text-[13px] text-[#888]">
          {mode === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent font-semibold text-[#6857db]"
            onClick={() =>
              setMode(mode === 'login' ? 'register' : 'login')
            }
          >
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </form>
    </main>
  );
}

export default Auth;
