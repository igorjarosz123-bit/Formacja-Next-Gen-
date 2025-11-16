import React, { useEffect, useState } from 'react';
import { signIn, auth } from './firebase';
import Board from './components/Board';

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    signIn().catch(console.warn);
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-4">
      <header className="max-w-5xl mx-auto flex items-center gap-4">
        <img src="/logo.png" alt="Next Gen" className="w-20 h-20 object-contain"/>
        <div>
          <h1 className="text-2xl font-bold">Formacja Next Gen</h1>
          <p className="text-sm text-gray-600">Młodzi dla Boga — panel liderski</p>
        </div>
      </header>
      <main className="max-w-5xl mx-auto mt-6">
        <Board user={user} />
      </main>
    </div>
  );
}
