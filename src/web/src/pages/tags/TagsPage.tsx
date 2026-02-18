import { useState, useEffect } from 'react';
import { Button, Input, Modal } from '../../components/ui';
import api from '../../services/api';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];

export function TagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', color: '#3b82f6', entity: 'ticket' });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const res = await api.get('/tags');
      setTags(res.data);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/tags/${editing.id}`, form);
      } else {
        await api.post('/tags', form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', color: '#3b82f6', entity: 'ticket' });
      loadTags();
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleEdit = (tag: any) => {
    setEditing(tag);
    setForm({ name: tag.name, color: tag.color || '#3b82f6', entity: tag.entity || 'ticket' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar etiqueta?')) return;
    try {
      await api.delete(`/tags/${id}`);
      loadTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Etiquetas</h1>
          <p className="text-slate-500">Crea etiquetas para clasificar tickets</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', color: '#3b82f6', entity: 'ticket' }); setShowModal(true); }}>
          + Nueva Etiqueta
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando...</div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: tag.color || '#3b82f6' }}
              />
              <span className="font-medium text-slate-800">{tag.name}</span>
              <span className="text-xs text-slate-500">({tag.entity})</span>
              <button onClick={() => handleEdit(tag)} className="text-slate-400 hover:text-slate-600">✏️</button>
              <button onClick={() => handleDelete(tag.id)} className="text-slate-400 hover:text-red-600">🗑️</button>
            </div>
          ))}
        </div>
      )}

      {tags.length === 0 && !loading && (
        <div className="text-center py-10 text-slate-500">
          No hay etiquetas. Crea tu primera etiqueta.
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editing ? 'Editar Etiqueta' : 'Nueva Etiqueta'}>
          <div className="space-y-4">
            <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Urgente" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    className={`w-8 h-8 rounded-full ${form.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
              <select
                value={form.entity}
                onChange={(e) => setForm({ ...form, entity: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="ticket">Ticket</option>
                <option value="article">Artículo KB</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave}>{editing ? 'Actualizar' : 'Crear'}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
