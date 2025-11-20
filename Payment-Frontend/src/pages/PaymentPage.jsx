import React from 'react';
import PaymentForm from '../components/PaymentForm';

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Sath Villa – Payment</h1>
        <PaymentForm />
      </div>
    </div>
  );
}