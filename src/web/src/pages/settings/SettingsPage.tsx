import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Badge } from '../../components/ui';
import { authService, settingsService } from '../../services/api';

export function SettingsPage() {
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    department: '',
  });
  const [notifications, setNotifications] = useState({
    emailTickets: true,
    emailAssigned: true,
    emailResolved: true,
    pushTickets: false,
    pushAssigned: true,
  });
  const [settings, setSettings] = useState({
    companyName: 'Service Desk Enterprise',
    timezone: 'America/Mexico_City',
    language: 'es',
    dateFormat: 'DD/MM/YYYY',
    autoAssign: true,
    slaHours: 24,
    maxTicketsPerAgent: 10,
  });
  
  // SMTP State
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    from: '',
  });
  const [smtpTestEmail, setSmtpTestEmail] = useState('');
  const [smtpStatus, setSmtpStatus] = useState<{ configured: boolean; testing?: boolean; testResult?: boolean }>({ configured: false });

  useEffect(() => {
    loadEmailConfig();
  }, []);

  const loadEmailConfig = async () => {
    try {
      const config = await settingsService.getEmailConfig();
      setSmtpConfig({
        host: config.host || '',
        port: config.port || 587,
        secure: config.secure || false,
        user: config.user || '',
        pass: '',
        from: config.from || '',
      });
      setSmtpStatus({ configured: config.configured || false });
    } catch (error) {
      console.error('Error loading email config:', error);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert('Perfil guardado exitosamente');
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert('Notificaciones guardadas');
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert('Configuración guardada');
  };

  const handleSaveSMTP = async () => {
    setSaving(true);
    try {
      await settingsService.saveEmailConfig(smtpConfig);
      setSmtpStatus({ configured: true });
      alert('Configuración SMTP guardada');
    } catch (error) {
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!smtpTestEmail) {
      alert('Ingresa un email para enviar la prueba');
      return;
    }
    setSmtpStatus({ ...smtpStatus, testing: true });
    try {
      const result = await settingsService.sendTestEmail(smtpTestEmail);
      setSmtpStatus({ ...smtpStatus, testing: false, testResult: result.success });
      alert(result.success ? 'Email de prueba enviado' : 'Error al enviar email de prueba');
    } catch (error) {
      setSmtpStatus({ ...smtpStatus, testing: false, testResult: false });
      alert('Error al enviar email de prueba');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
    { id: 'email', label: 'Correo SMTP', icon: '📧' },
    { id: 'system', label: 'Sistema', icon: '⚙️' },
    { id: 'security', label: 'Seguridad', icon: '🔒' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Configuración</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-800">Información del Perfil</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.firstName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{profileData.firstName} {profileData.lastName}</h3>
                    <p className="text-slate-500">{profileData.email}</p>
                    <Badge variant="info">Administrador</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Nombre" value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} />
                  <Input label="Apellido" value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Email" type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />
                  <Input label="Teléfono" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} placeholder="+52 55 1234 5678" />
                </div>
                <Input label="Departamento" value={profileData.department} onChange={(e) => setProfileData({ ...profileData, department: e.target.value })} placeholder="TI" />
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving}>{saving ? 'Guardando...' : 'Guardar Cambios'}</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader><h2 className="text-lg font-semibold text-slate-800">Configuración de Notificaciones</h2></CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="font-medium text-slate-700 mb-4">Notificaciones por Email</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'emailTickets', label: 'Nuevos tickets creados' },
                      { key: 'emailAssigned', label: 'Tickets asignados' },
                      { key: 'emailResolved', label: 'Tickets resueltos' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
                        <div className="font-medium text-slate-800">{item.label}</div>
                        <input type="checkbox" checked={notifications[item.key as keyof typeof notifications]} onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })} className="w-5 h-5 text-blue-600 rounded" />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={saving}>{saving ? 'Guardando...' : 'Guardar Preferencias'}</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Email SMTP Tab */}
          {activeTab === 'email' && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Configuración SMTP</h2>
                <Badge variant={smtpStatus.configured ? 'success' : 'warning'}>
                  {smtpStatus.configured ? '✓ Configurado' : 'No configurado'}
                </Badge>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700"><strong>ℹ️ Importante:</strong> Configura tu servidor SMTP para enviar notificaciones por email.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Servidor SMTP" value={smtpConfig.host} onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })} placeholder="smtp.gmail.com" />
                  <Input label="Puerto" type="number" value={smtpConfig.port} onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) })} placeholder="587" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Usuario SMTP" value={smtpConfig.user} onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })} placeholder="tu@email.com" />
                  <Input label="Contraseña / App Password" type="password" value={smtpConfig.pass} onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })} placeholder="••••••••••••" />
                </div>

                <Input label="Email Remitente" type="email" value={smtpConfig.from} onChange={(e) => setSmtpConfig({ ...smtpConfig, from: e.target.value })} placeholder="noreply@tuempresa.com" />

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
                  <div><div className="font-medium text-slate-800">Usar SSL/TLS (Puerto 465)</div></div>
                  <input type="checkbox" checked={smtpConfig.secure} onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.checked })} className="w-5 h-5 text-blue-600 rounded" />
                </label>

                <div className="flex justify-between pt-4 border-t border-slate-200">
                  <Button onClick={handleSaveSMTP} disabled={saving}>{saving ? 'Guardando...' : 'Guardar Configuración'}</Button>
                </div>

                {smtpStatus.configured && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-medium text-slate-700 mb-4">Probar Configuración</h3>
                    <div className="flex gap-3">
                      <Input placeholder="Email para prueba" value={smtpTestEmail} onChange={(e) => setSmtpTestEmail(e.target.value)} className="flex-1" />
                      <Button variant="secondary" onClick={handleTestEmail} disabled={smtpStatus.testing}>{smtpStatus.testing ? 'Enviando...' : 'Enviar Prueba'}</Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <Card>
              <CardHeader><h2 className="text-lg font-semibold text-slate-800">Configuración del Sistema</h2></CardHeader>
              <CardBody className="space-y-6">
                <Input label="Nombre de la Empresa" value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Zona Horaria</label>
                    <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800">
                      <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                      <option value="America/New_York">Nueva York (GMT-5)</option>
                      <option value="Europe/Madrid">Madrid (GMT+1)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Idioma</label>
                    <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800">
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="SLA (horas)" type="number" value={settings.slaHours} onChange={(e) => setSettings({ ...settings, slaHours: parseInt(e.target.value) })} />
                  <Input label="Máx. Tickets por Agente" type="number" value={settings.maxTicketsPerAgent} onChange={(e) => setSettings({ ...settings, maxTicketsPerAgent: parseInt(e.target.value) })} />
                </div>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
                  <div><div className="font-medium text-slate-800">Asignación Automática</div></div>
                  <input type="checkbox" checked={settings.autoAssign} onChange={(e) => setSettings({ ...settings, autoAssign: e.target.checked })} className="w-5 h-5 text-blue-600 rounded" />
                </label>
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={saving}>{saving ? 'Guardando...' : 'Guardar Configuración'}</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader><h2 className="text-lg font-semibold text-slate-800">Cambiar Contraseña</h2></CardHeader>
                <CardBody className="space-y-4">
                  <Input label="Contraseña Actual" type="password" placeholder="••••••••" />
                  <Input label="Nueva Contraseña" type="password" placeholder="••••••••" />
                  <Input label="Confirmar Contraseña" type="password" placeholder="••••••••" />
                  <div className="flex justify-end"><Button>Actualizar Contraseña</Button></div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader><h2 className="text-lg font-semibold text-slate-800">Autenticación de Dos Factores (2FA)</h2></CardHeader>
                <CardBody>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div><div className="font-medium text-slate-800">Estado: Desactivado</div></div>
                    <Button variant="secondary">Activar 2FA</Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
