import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Modal } from '../../components/ui';
import api from '../../services/api';

export function KnowledgeCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '', order: 0 });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get('/knowledge-categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/knowledge-categories/${editing.id}`, form);
      } else {
        await api.post('/knowledge-categories', form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', description: '', icon: '', order: 0 });
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (cat: any) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', order: cat.order || 0 });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar categoría?')) return;
    try {
      await api.delete(`/knowledge-categories/${id}`);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categorías de Conocimiento</h1>
          <p className="text-slate-500">Organiza los artículos por categorías</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', description: '', icon: '', order: 0 }); setShowModal(true); }}>
          + Nueva Categoría
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <Card key={cat.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{cat.icon || '📁'}</span>
                  <div>
                    <h3 className="font-semibold text-slate-800">{cat.name}</h3>
                    <p className="text-xs text-slate-500">Orden: {cat.order}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">{cat.description || 'Sin descripción'}</p>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(cat)}>Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(cat.id)}>Eliminar</Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {categories.length === 0 && !loading && (
        <div className="text-center py-10 text-slate-500">
          No hay categorías. Crea tu primera categoría.
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editing ? 'Editar Categoría' : 'Nueva Categoría'}>
          <div className="space-y-4">
            <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Hardware" />
            <Input label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tickets relacionados con hardware" />
            <Input label="Icono (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="💻" />
            <Input label="Orden" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} />
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
