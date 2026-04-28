import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', userName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const msg = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        userName: form.userName,
        password: form.password,
        email: form.email,
      });
      setSuccess(msg || 'Registration successful! Please check your email to verify your account.');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
        <p className="text-text-light mb-4">{success}</p>
        <Link to="/login" className="text-primary hover:underline no-underline font-medium">Go to Login</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      {error && <div className="bg-red-50 text-danger rounded-lg p-3 mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input type="text" value={form.firstName} onChange={set('firstName')} required
              className="w-full px-3 py-2.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-base" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input type="text" value={form.lastName} onChange={set('lastName')} required
              className="w-full px-3 py-2.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-base" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input type="text" value={form.userName} onChange={set('userName')} required
            className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={form.email} onChange={set('email')} required
            className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={form.password} onChange={set('password')} required minLength={8}
            className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required
            className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-base" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer border-none text-base">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-text-light">
        Already have an account? <Link to="/login" className="text-primary hover:underline no-underline font-medium">Sign In</Link>
      </div>
    </div>
  );
}
