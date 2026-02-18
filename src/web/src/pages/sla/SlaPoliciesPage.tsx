import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Badge, Modal } from '../../components/ui';
import api from '../../services/api';

export function SlaPoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    priority: 'medium',
    responseTimeHours: 8,
    resolutionTimeHours: 24,
    description: '',
    escalationEmail: '',
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const res = await api.get('/sla/policies');
      setPolicies(res.data);
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/sla/policies/${editing.id}`, form);
      } else {
        await api.post('/sla/policies', form);
      }
      setShowModal(false);
      setEditing(null);
      loadPolicies();
    } catch (error) {
      console.error('Error saving policy:', error);
    }
  };

  const handleEdit = (policy: any) => {
    setEditing(policy);
    setForm({
      name: policy.name,
      priority: policy.priority,
      responseTimeHours: policy.responseTimeHours,
      resolutionTimeHours: policy.resolutionTimeHours,
      description: policy.description || '',
      escalationEmail: policy.escalationEmail || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar política SLA?')) return;
    try {
      await api.delete(`/sla/policies/${id}`);
      loadPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Políticas SLA</h1>
          <p className="text-slate-500">Configura tiempos de respuesta por prioridad</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', priority: 'medium', responseTimeHours: 8, resolutionTimeHours: 24, description: '', escalationEmail: '' }); setShowModal(true); }}>
          + Nueva Política
        </Button>
      </div>

      {/* SLA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardBody className="text-center">
            <div className="text-3xl font-bold">
              {policies.find(p => p.priority === 'critical')?.resolutionTimeHours || 0}h
            </div>
            <div className="text-sm opacity-90">Crítico</div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardBody className="text-center">
            <div className="text-3xl font-bold">
              {policies.find(p => p.priority === 'high')?.resolutionTimeHours || 0}h
            </div>
            <div className="text-sm opacity-90">Alta</div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardBody className="text-center">
            <div className="text-3xl font-bold">
              {policies.find(p => p.priority === 'medium')?.resolutionTimeHours || 0}h
            </div>
            <div className="text-sm opacity-90">Media</div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardBody className="text-center">
            <div className="text-3xl font-bold">
              {policies.find(p => p.priority === 'low')?.resolutionTimeHours || 0}h
            </div>
            <div className="text-sm opacity-90">Baja</div>
          </CardBody>
        </Card>
      </div>

      {/* Policies List */}
      {loading ? (
        <div className="text-center py-10">Cargando...</div>
      ) : (
        <div className="space-y-4">
          {policies.map(policy => (
            <Card key={policy.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant={getPriorityColor(policy.priority)} className="text-lg px-3 py-1">
                      {policy.priority.toUpperCase()}
                    </Badge>
                    <div>
                      <h3 className="font-semibold text-slate-800">{policy.name}</h3>
                      <p className="text-sm text-slate-500">{policy.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-slate-800">{policy.responseTimeHours}h</div>
                      <div className="text-xs text-slate-500">Respuesta</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-slate-800">{policy.resolutionTimeHours}h</div>
                      <div className="text-xs text-slate-500">Resolución</div>
                    </div>
                    {policy.escalationEmail && (
                      <Badge variant="info">📧 {policy.escalationEmail}</Badge>
                    )}
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(policy)}>Editar</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(policy.id)}>Eliminar</Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Política SLA' : 'Nueva Política SLA'}>
          <div className="space-y-4">
            <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Prioridad Alta" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Prioridad</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="critical">Crítico</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Tiempo de respuesta (horas)" type="number" value={form.responseTimeHours} onChange={(e) => setForm({ ...form, responseTimeHours: parseInt(e.target.value) })} />
              <Input label="Tiempo de resolución (horas)" type="number" value={form.resolutionTimeHours} onChange={(e) => setForm({ ...form, resolutionTimeHours: parseInt(e.target.value) })} />
            </div>
            <Input label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Para problemas que afectan operaciones" />
            <Input label="Email de escalación" value={form.escalationEmail} onChange={(e) => setForm({ ...form, escalationEmail: e.target.value })} placeholder="jefe@empresa.com" />
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
