import { useState } from 'react'; // Eliminamos la importación innecesaria de React
import AdminRegisterForm from '../../components/auth/AdminRegisterForm';
import AdminCodeForm from '../../components/auth/AdminCodeForm';

const AdminRegisterPage = () => {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');

  const handleCodeRequested = (email: string) => {
    setEmail(email);
    setStep('verify');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 'request' ? (
        <AdminRegisterForm onCodeRequested={handleCodeRequested} />
      ) : (
        <AdminCodeForm email={email} />
      )}
    </div>
  );
};

export default AdminRegisterPage;