import { useState, useEffect } from 'react';
import { Card, CardBody, Badge } from '../../components/ui';
import api from '../../services/api';

interface AgentStats {
  id: string;
  agentId: string;
  points: number;
  ticketsResolved: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  rating: number;
  badges: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsValue: number;
}

export function GamificationPage() {
  const [leaderboard, setLeaderboard] = useState<AgentStats[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'weekly' | 'achievements'>('leaderboard');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leaderboardRes, weeklyRes, achievementsRes] = await Promise.all([
        api.get('/gamification/leaderboard'),
        api.get('/gamification/leaderboard/weekly'),
        api.get('/gamification/achievements'),
      ]);
      setLeaderboard(leaderboardRes.data);
      setWeeklyLeaderboard(weeklyRes.data);
      setAchievements(achievementsRes.data);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getLevelColor = (level: number) => {
    if (level >= 10) return 'from-purple-500 to-pink-500';
    if (level >= 7) return 'from-yellow-500 to-orange-500';
    if (level >= 4) return 'from-green-500 to-teal-500';
    return 'from-blue-500 to-cyan-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">🎮 Gamificación</h1>
      </div>

      {/* Level Progress */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-slate-500">Tu Nivel</div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${getLevelColor(1)} bg-clip-text text-transparent`}>
                Nivel {leaderboard[0]?.level || 1}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Puntos</div>
              <div className="text-2xl font-bold text-slate-800">{leaderboard[0]?.points || 0}</div>
            </div>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getLevelColor(1)}`}
              style={{ width: `${((leaderboard[0]?.points || 0) % 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {100 - ((leaderboard[0]?.points || 0) % 100)} puntos para el siguiente nivel
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-t-lg ${activeTab === 'leaderboard' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          🏆 Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 rounded-t-lg ${activeTab === 'weekly' ? 'bg-yellow-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          📅 Semanal
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-t-lg ${activeTab === 'achievements' ? 'bg-purple-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          🎖 Logros
        </button>
      </div>

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <Card>
              <CardBody className="text-center py-8 text-slate-500">
                No hay datos aún. ¡Resuelve tickets para aparecer en el ranking!
              </CardBody>
            </Card>
          ) : (
            leaderboard.map((agent, index) => (
              <Card key={agent.id} className={index === 0 ? 'border-2 border-yellow-400' : ''}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                        index === 0 ? 'bg-yellow-400 text-white' :
                        index === 1 ? 'bg-gray-300 text-white' :
                        index === 2 ? 'bg-orange-400 text-white' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">Agente {agent.agentId.substring(0, 8)}</div>
                        <div className="text-sm text-slate-500">
                          {agent.ticketsResolved} tickets • Racha: {agent.currentStreak}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold bg-gradient-to-r ${getLevelColor(agent.level)} bg-clip-text text-transparent`}>
                        {agent.points} pts
                      </div>
                      <div className="text-xs text-slate-400">Nivel {agent.level}</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Weekly Leaderboard */}
      {activeTab === 'weekly' && (
        <div className="space-y-3">
          {weeklyLeaderboard.length === 0 ? (
            <Card>
              <CardBody className="text-center py-8 text-slate-500">
                No hay datos de esta semana aún.
              </CardBody>
            </Card>
          ) : (
            weeklyLeaderboard.map((agent, index) => (
              <Card key={agent.agentId} className={index === 0 ? 'border-2 border-yellow-400' : ''}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                        index === 0 ? 'bg-yellow-400 text-white' :
                        index === 1 ? 'bg-gray-300 text-white' :
                        index === 2 ? 'bg-orange-400 text-white' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">Agente</div>
                        <div className="text-sm text-slate-500">
                          {agent.ticketsResolved} tickets resueltos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-slate-800">
                        {agent.points} pts
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Achievements */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <Card key={achievement.id}>
              <CardBody className="text-center">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="font-semibold text-slate-800 mb-1">{achievement.name}</div>
                <div className="text-sm text-slate-500 mb-2">{achievement.description}</div>
                <Badge variant="success">+{achievement.pointsValue} pts</Badge>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-slate-800">{leaderboard[0]?.ticketsResolved || 0}</div>
            <div className="text-sm text-slate-500">Tickets Resueltos</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-slate-800">{leaderboard[0]?.currentStreak || 0}</div>
            <div className="text-sm text-slate-500">Racha Actual</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-slate-800">{leaderboard[0]?.longestStreak || 0}</div>
            <div className="text-sm text-slate-500">Mejor Racha</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-slate-800">{achievements.length}</div>
            <div className="text-sm text-slate-500">Logros Disponibles</div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
