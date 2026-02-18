import { useEffect, useState } from 'react';
import { agentsService, usersService } from '../../services/api';
import { Card, CardBody, Button, Input, Modal, Badge } from '../../components/ui';

interface Agent {
  id: string;
  userId: string;
  level: number;
  isAvailable: boolean;
  skills: string[];
  ticketCapacity: number;
  currentTickets: number;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

// Skills preconfigurados
const defaultSkills: Skill[] = [
  { id: '1', name: 'Redes', category: 'Infraestructura' },
  { id: '2', name: 'Sistemas Operativos', category: 'Infraestructura' },
  { id: '3', name: 'Hardware', category: 'Infraestructura' },
  { id: '4', name: 'Windows Server', category: 'Servidores' },
  { id: '5', name: 'Linux', category: 'Servidores' },
  { id: '6', name: 'Active Directory', category: 'Servicios' },
  { id: '7', name: 'Office 365', category: 'Software' },
  { id: '8', name: 'Seguridad', category: 'Seguridad' },
  { id: '9', name: 'Bases de Datos', category: 'Desarrollo' },
  { id: '10', name: 'SQL Server', category: 'Desarrollo' },
  { id: '11', name: 'VMware', category: 'Virtualización' },
  { id: '12', name: 'Azure', category: 'Cloud' },
  { id: '13', name: 'AWS', category: 'Cloud' },
  { id: '14', name: 'Soporte Técnico', category: 'Servicios' },
  { id: '15', name: 'Cableado Estructurado', category: 'Infraestructura' },
];

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [skills, setSkills] = useState<Skill[]>(defaultSkills);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    level: 1,
    isAvailable: true,
    skills: [] as string[],
    ticketCapacity: 5,
  });
  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'Infraestructura',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [agentsRes, usersRes] = await Promise.all([
        agentsService.getAll(),
        usersService.getAll(),
      ]);
      setAgents(agentsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await agentsService.create({
        ...formData,
        currentTickets: 0,
      });
      setIsModalOpen(false);
      setFormData({ userId: '', level: 1, isAvailable: true, skills: [], ticketCapacity: 5 });
      loadData();
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este agente?')) {
      try {
        await agentsService.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting agent:', error);
      }
    }
  };

  const handleAddSkill = (skillName: string) => {
    if (skillName && !formData.skills.includes(skillName)) {
      setFormData({ ...formData, skills: [...formData.skills, skillName] });
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillName) });
  };

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSkill) {
      setSkills(skills.map(s => s.id === editingSkill.id ? { ...editingSkill, ...skillForm } : s));
      setEditingSkill(null);
    } else {
      setSkills([...skills, { ...skillForm, id: Date.now().toString() }]);
    }
    setSkillForm({ name: '', category: 'Infraestructura' });
    setIsSkillModalOpen(false);
  };

  const handleDeleteSkill = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este skill?')) {
      setSkills(skills.filter(s => s.id !== id));
    }
  };

  const openEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillForm({ name: skill.name, category: skill.category });
    setIsSkillModalOpen(true);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : userId;
  };

  const filteredAgents = agents.filter(agent => {
    const userName = getUserName(agent.userId).toLowerCase();
    return userName.includes(searchTerm.toLowerCase());
  });

  const categories = ['Infraestructura', 'Servidores', 'Servicios', 'Software', 'Seguridad', 'Desarrollo', 'Virtualización', 'Cloud'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Agentes</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsSkillModalOpen(true)}>
            ⚙️ Gestionar Skills
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            + Nuevo Agente
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <Input
            placeholder="Buscar agentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardBody>
      </Card>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-500">Cargando...</div>
        ) : filteredAgents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">No se encontraron agentes</div>
        ) : (
          filteredAgents.map((agent) => (
            <Card key={agent.id} hover>
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {getUserName(agent.userId).charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{getUserName(agent.userId)}</h3>
                      <p className="text-sm text-slate-500">Nivel {agent.level}</p>
                    </div>
                  </div>
                  <Badge variant={agent.isAvailable ? 'success' : 'default'}>
                    {agent.isAvailable ? 'Disponible' : 'No disponible'}
                  </Badge>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-500">Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent.skills?.map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {(!agent.skills || agent.skills.length === 0) && (
                        <span className="text-slate-400 text-xs">Sin skills asignados</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capacidad:</span>
                    <span className="text-slate-700">{agent.currentTickets}/{agent.ticketCapacity}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all" 
                      style={{ width: `${Math.min((agent.currentTickets / agent.ticketCapacity) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Create Agent Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Agente"
        size="lg"
      >
        <form onSubmit={handleCreateAgent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Usuario</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar usuario...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nivel"
              type="number"
              min={1}
              max={3}
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
            />
            <Input
              label="Capacidad de Tickets"
              type="number"
              min={1}
              max={20}
              value={formData.ticketCapacity}
              onChange={(e) => setFormData({ ...formData, ticketCapacity: parseInt(e.target.value) })}
            />
          </div>
          
          {/* Skills Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Skills</label>
            <div className="space-y-3">
              {/* Selected Skills */}
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Add Skill */}
              <div className="flex gap-2">
                <select
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddSkill(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Seleccionar skill...</option>
                  {skills.filter(s => !formData.skills.includes(s.name)).map(skill => (
                    <option key={skill.id} value={skill.name}>
                      {skill.name} ({skill.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="isAvailable" className="text-sm text-slate-700">
              Disponible para asignaciones
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Agente
            </Button>
          </div>
        </form>
      </Modal>

      {/* Skills Management Modal */}
      <Modal
        isOpen={isSkillModalOpen}
        onClose={() => { setIsSkillModalOpen(false); setEditingSkill(null); setSkillForm({ name: '', category: 'Infraestructura' }); }}
        title="Gestionar Skills"
        size="lg"
      >
        <div className="space-y-4">
          {/* Add/Edit Skill Form */}
          <form onSubmit={handleSaveSkill} className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label="Nombre del Skill"
                value={skillForm.name}
                onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                placeholder="Nombre del skill"
                required
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
              <select
                value={skillForm.category}
                onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <Button type="submit">
              {editingSkill ? 'Actualizar' : 'Agregar'}
            </Button>
          </form>

          {/* Skills List */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-medium text-slate-700 mb-3">Skills Configurados ({skills.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {skills.map(skill => (
                <div key={skill.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <span className="font-medium text-slate-800">{skill.name}</span>
                    <Badge variant="default" className="ml-2">{skill.category}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditSkill(skill)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="secondary" onClick={() => { setIsSkillModalOpen(false); setEditingSkill(null); }}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
