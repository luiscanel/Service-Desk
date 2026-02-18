import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Badge, Modal } from '../../components/ui';
import api from '../../services/api';

export function PortalClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', company: '', phone: '' });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const res = await api.get('/portal/clients');
      setClients(res.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.post('/portal/clients', form);
      setShowModal(false);
      setForm({ email: '', name: '', company: '', phone: '' });
      loadClients();
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleRegenerateToken = async (id: string) => {
    if (!confirm('¿Generar nuevo token? El anterior quedará invalidados.')) return;
    try {
      const res = await api.post(`/portal/clients/${id}/regenerate-token`);
      alert(`Nuevo token: ${res.data.accessToken}`);
      loadClients();
    } catch (error) {
      console.error('Error regenerating token:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar cliente?')) return;
    try {
      await api.post(`/portal/clients/${id}/delete`);
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    alert('Token copiado');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Portal de Clientes</h1>
          <p className="text-slate-500">Gestiona clientes externos que pueden crear tickets</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Nuevo Cliente</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-blue-600">{clients.length}</div>
            <div className="text-sm text-slate-500">Clientes Registrados</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-green-600">{clients.filter(c => c.isActive).length}</div>
            <div className="text-sm text-slate-500">Activos</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-red-600">{clients.filter(c => !c.isActive).length}</div>
            <div className="text-sm text-slate-500">Inactivos</div>
          </CardBody>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader><h2 className="font-semibold">Clientes del Portal</h2></CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="text-center py-10">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Empresa</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Token</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{client.name}</div>
                        <div className="text-sm text-slate-500">{client.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{client.company || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={client.isActive ? 'success' : 'warning'}>
                          {client.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => copyToken(client.accessToken)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          📋 Copiar
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleRegenerateToken(client.id)} className="text-sm text-slate-600 hover:underline">🔄</button>
                          <button onClick={() => handleDelete(client.id)} className="text-sm text-red-600 hover:underline">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {clients.length === 0 && !loading && (
            <div className="text-center py-10 text-slate-500">No hay clientes registrados</div>
          )}
        </CardBody>
      </Card>

      {/* Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Nuevo Cliente">
          <div className="space-y-4">
            <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan Pérez" />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="juan@empresa.com" />
            <Input label="Empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
            <Input label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+52 55 1234 5678" />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Crear Cliente</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
