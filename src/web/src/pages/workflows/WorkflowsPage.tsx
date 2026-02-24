import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Workflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: string;
  conditions: any[];
  actions: any[];
  priority: number;
}

const triggerOptions = [
  { value: 'ticket_created', label: 'Ticket creado' },
  { value: 'ticket_assigned', label: 'Ticket asignado' },
  { value: 'ticket_status_changed', label: 'Estado cambiado' },
  { value: 'ticket_priority_changed', label: 'Prioridad cambiada' },
  { value: 'sla_warning', label: 'Advertencia SLA' },
  { value: 'sla_breached', label: 'SLA Incumplido' },
];

const actionOptions = [
  { value: 'assign_agent', label: 'Asignar agente' },
  { value: 'set_status', label: 'Cambiar estado' },
  { value: 'set_priority', label: 'Cambiar prioridad' },
  { value: 'send_email', label: 'Enviar email' },
  { value: 'notify_agent', label: 'Notificar agente' },
  { value: 'escalate', label: 'Escalar ticket' },
];

export function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    trigger: 'ticket_created',
    priority: 1,
    conditions: [] as any[],
    actions: [] as any[],
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await axios.get(`${API_URL}/workflows`);
      setWorkflows(response.data);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWorkflow) {
        await axios.put(`${API_URL}/workflows/${editingWorkflow.id}`, formData);
      } else {
        await axios.post(`${API_URL}/workflows`, formData);
      }
      loadWorkflows();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setFormData({
      name: workflow.name,
      description: workflow.description || '',
      isActive: workflow.isActive,
      trigger: workflow.trigger,
      priority: workflow.priority,
      conditions: workflow.conditions || [],
      actions: workflow.actions || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este workflow?')) {
      try {
        await axios.delete(`${API_URL}/workflows/${id}`);
        loadWorkflows();
      } catch (error) {
        console.error('Error deleting workflow:', error);
      }
    }
  };

  const handleToggleActive = async (workflow: Workflow) => {
    try {
      await axios.put(`${API_URL}/workflows/${workflow.id}`, {
        isActive: !workflow.isActive,
      });
      loadWorkflows();
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
  };

  const resetForm = () => {
    setEditingWorkflow(null);
    setFormData({
      name: '',
      description: '',
      isActive: true,
      trigger: 'ticket_created',
      priority: 1,
      conditions: [],
      actions: [],
    });
  };

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { field: 'priority', operator: 'equals', value: '' }],
    });
  };

  const addAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, { action: 'set_status', config: {} }],
    });
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const newConditions = [...formData.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setFormData({ ...formData, conditions: newConditions });
  };

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...formData.actions];
    newActions[index] = { ...newActions[index], [field]: value };
    setFormData({ ...formData, actions: newActions });
  };

  const removeCondition = (index: number) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index),
    });
  };

  const removeAction = (index: number) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index),
    });
  };

  const getTriggerLabel = (trigger: string) => {
    return triggerOptions.find(t => t.value === trigger)?.label || trigger;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">⚡ Workflows</h1>
          <p className="text-slate-500 mt-1">Automatiza acciones basadas en eventos</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>➕</span> Nuevo Workflow
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No hay workflows configurados
        </div>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className={`p-4 rounded-xl border ${
                workflow.isActive 
                  ? 'bg-white border-slate-200' 
                  : 'bg-slate-50 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleActive(workflow)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      workflow.isActive ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      workflow.isActive ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                  <div>
                    <h3 className="font-semibold text-slate-800">{workflow.name}</h3>
                    <p className="text-sm text-slate-500">{getTriggerLabel(workflow.trigger)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(workflow)}
                    className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(workflow.id)}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {workflow.description && (
                <p className="text-sm text-slate-500 mt-2">{workflow.description}</p>
              )}
              <div className="flex gap-2 mt-3">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {workflow.actions?.length || 0} acciones
                </span>
                {workflow.conditions?.length > 0 && (
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">
                    {workflow.conditions.length} condiciones
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold">
                {editingWorkflow ? 'Editar Workflow' : 'Nuevo Workflow'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Trigger (Evento)
                  </label>
                  <select
                    value={formData.trigger}
                    onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {triggerOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Prioridad
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    min={1}
                  />
                </div>
              </div>

              {/* Condiciones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Condiciones
                  </label>
                  <button
                    type="button"
                    onClick={addCondition}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    ➕ Agregar condición
                  </button>
                </div>
                {formData.conditions.map((condition, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={condition.field}
                      onChange={(e) => updateCondition(index, 'field', e.target.value)}
                      className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                    >
                      <option value="priority">Prioridad</option>
                      <option value="status">Estado</option>
                      <option value="category">Categoría</option>
                    </select>
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                      className="w-32 px-2 py-1 border border-slate-300 rounded text-sm"
                    >
                      <option value="equals">Igual a</option>
                      <option value="not_equals">Diferente de</option>
                      <option value="contains">Contiene</option>
                    </select>
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => updateCondition(index, 'value', e.target.value)}
                      placeholder="Valor"
                      className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Acciones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Acciones
                  </label>
                  <button
                    type="button"
                    onClick={addAction}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    ➕ Agregar acción
                  </button>
                </div>
                {formData.actions.map((action, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <select
                      value={action.action}
                      onChange={(e) => updateAction(index, 'action', e.target.value)}
                      className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                    >
                      {actionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={action.config?.value || ''}
                      onChange={(e) => updateAction(index, 'config', { value: e.target.value })}
                      placeholder="Valor"
                      className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingWorkflow ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
