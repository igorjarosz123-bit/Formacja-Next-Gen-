import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import TileEditor from './TileEditor';

const DEFAULT_SECTIONS = [
  { id: 'uwielbienie', title: 'Uwielbienie' },
  { id: 'uczniostwo', title: 'Uczniostwo' },
  { id: 'relacje', title: 'Relacje' },
  { id: 'ewangelizacja', title: 'Ewangelizacja' },
  { id: 'sluzba', title: 'Służba' }
];

export default function Board() {
  const [tiles, setTiles] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTile, setEditingTile] = useState(null);

  useEffect(() => {
    const col = collection(db, 'tiles');
    const unsub = onSnapshot(col, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTiles(data);
    });
    return () => unsub();
  }, []);

  function onDragEnd(result) {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newSection = destination.droppableId;
    const index = destination.index;
    const t = tiles.find(x => x.id === draggableId);
    if (!t) return;
    const tileRef = doc(db, 'tiles', draggableId);
    updateDoc(tileRef, { section: newSection, order: index }).catch(console.error);
  }

  function openNew(sectionId) {
    setEditingTile({ section: sectionId, title: '', description: '', leader: '', date: '' });
    setEditorOpen(true);
  }

  function editTile(t) { setEditingTile(t); setEditorOpen(true); }

  async function deleteTile(id) {
    if (!confirm('Usunąć ten temat?')) return;
    await deleteDoc(doc(db, 'tiles', id));
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DEFAULT_SECTIONS.map(sec => (
          <div key={sec.id} className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{sec.title}</h3>
              <button onClick={() => openNew(sec.id)} className="text-sm text-blue-600">+ Dodaj</button>
            </div>
            <Droppable droppableId={sec.id} type="TILE">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {tiles.filter(t => (t.section || 'uwielbienie') === sec.id).sort((a,b)=> (a.order||0)-(b.order||0)).map((t, idx) => (
                    <Draggable key={t.id} draggableId={t.id} index={idx}>
                      {(prov) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="mb-2 bg-gray-50 p-2 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{t.title || '— brak tytułu —'}</div>
                              <div className="text-xs text-gray-600">{t.leader ? `Prowadzący: ${t.leader}` : 'Brak prowadzącego'}</div>
                              <div className="text-xs text-gray-500">{t.date || ''}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => editTile(t)} className="text-sm text-green-600">Edytuj</button>
                              <button onClick={() => deleteTile(t.id)} className="text-sm text-red-600">Usuń</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>

      {editorOpen && (
        <TileEditor tile={editingTile} onClose={() => { setEditorOpen(false); setEditingTile(null); }} />
      )}

      <DragDropContext onDragEnd={onDragEnd} />
    </div>
  );
}
