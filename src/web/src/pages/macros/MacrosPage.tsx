import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Badge, Modal } from '../../components/ui';
import api from '../../services/api';

export function MacrosPage() {
  const [macros, setMacros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', category: '', subject: '', content: '' });

  useEffect(() => {
    loadMacros();
  }, []);

  const loadMacros = async () => {
    try {
      const res = await api.get('/macros');
      setMacros(res.data);
    } catch (error) {
      console.error('Error loading macros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/macros/${editing.id}`, form);
      } else {
        await api.post('/macros', form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', category: '', subject: '', content: '' });
      loadMacros();
    } catch (error) {
      console.error('Error saving macro:', error);
    }
  };

  const handleEdit = (macro: any) => {
    setEditing(macro);
    setForm({ name: macro.name, category: macro.category || '', subject: macro.subject || '', content: macro.content });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar macro?')) return;
    try {
      await api.delete(`/macros/${id}`);
      loadMacros();
    } catch (error) {
      console.error('Error deleting macro:', error);
    }
  };

  const handleUse = async (id: string) => {
    try {
      await api.post(`/macros/${id}/use`);
      alert('Macro copiada al portapapeles');
    } catch (error) {
      console.error('Error using macro:', error);
    }
  };

  const categories = [...new Set(macros.map(m => m.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Macros / Plantillas</h1>
        <Button onClick={() => { setEditing(null); setForm({ name: '', category: '', subject: '', content: '' }); setShowModal(true); }}>
          + Nueva Macro
        </Button>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <Badge key={cat} variant="info">{cat}</Badge>
          ))}
        </div>
      )}

      {/* Macros Grid */}
      {loading ? (
        <div className="text-center py-10">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {macros.map(macro => (
            <Card key={macro.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-800">{macro.name}</h3>
                  <Badge variant={macro.isActive ? 'success' : 'warning'}>
                    {macro.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
                {macro.category && <Badge variant="info" className="mb-2">{macro.category}</Badge>}
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{macro.content}</p>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Usos: {macro.usageCount || 0}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleUse(macro.id)} className="text-blue-600 hover:underline">Usar</button>
                    <button onClick={() => handleEdit(macro)} className="text-slate-600 hover:underline">Editar</button>
                    <button onClick={() => handleDelete(macro.id)} className="text-red-600 hover:underline">Eliminar</button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {macros.length === 0 && !loading && (
        <div className="text-center py-10 text-slate-500">
          <p className="text-lg mb-2">No hay macros configuradas</p>
          <p className="text-sm">Crea tu primera macro para responder más rápido</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editing ? 'Editar Macro' : 'Nueva Macro'}>
          <div className="space-y-4">
            <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Saludo inicial" />
            <Input label="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General" />
            <Input label="Asunto (opcional)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Re: Tu ticket" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contenido</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                rows={6}
                placeholder="Escribe tu plantilla aquí..."
              />
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
