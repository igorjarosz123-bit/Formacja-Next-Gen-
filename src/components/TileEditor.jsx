import React, { useState } from 'react';
import { addDoc, updateDoc, doc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export default function TileEditor({ tile, onClose }) {
  const isNew = !tile.id;
  const [form, setForm] = useState({
    title: tile.title || '',
    description: tile.description || '',
    leader: tile.leader || '',
    date: tile.date || '',
    section: tile.section || 'uwielbienie'
  });

  async function save() {
    if (isNew) {
      await addDoc(collection(db, 'tiles'), { ...form, createdAt: Date.now() });
    } else {
      await updateDoc(doc(db, 'tiles', tile.id), { ...form });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-full max-w-lg">
        <h3 className="font-bold mb-2">{isNew ? 'Dodaj temat' : 'Edytuj temat'}</h3>
        <label className="block text-sm">Tytuł</label>
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} className="w-full p-2 border rounded mb-2" />
        <label className="block text-sm">Opis</label>
        <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="w-full p-2 border rounded mb-2" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">Prowadzący</label>
            <input value={form.leader} onChange={e=>setForm({...form, leader:e.target.value})} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Data</label>
            <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="w-full p-2 border rounded" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose} className="px-3 py-1">Anuluj</button>
          <button onClick={save} className="px-3 py-1 bg-blue-600 text-white rounded">Zapisz</button>
        </div>
      </div>
    </div>
  );
}
