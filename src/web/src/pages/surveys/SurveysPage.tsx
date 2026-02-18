import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui';
import api from '../../services/api';

export function SurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [surveysRes, statsRes] = await Promise.all([
        api.get('/surveys'),
        api.get('/surveys/stats'),
      ]);
      setSurveys(surveysRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Encuestas de Satisfacción</h1>
          <p className="text-slate-500">Mide la satisfacción de tus clientes</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardBody className="text-center">
              <div className="text-4xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-90">Encuestas Enviadas</div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardBody className="text-center">
              <div className="text-4xl font-bold">{stats.responded}</div>
              <div className="text-sm opacity-90">Respondidas</div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardBody className="text-center">
              <div className="text-4xl font-bold">{stats.avgRating || 0}</div>
              <div className="text-sm opacity-90">⭐ Rating Promedio</div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardBody className="text-center">
              <div className="text-4xl font-bold">{stats.nps || 0}</div>
              <div className="text-sm opacity-90">NPS Score</div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Rating Distribution */}
      {stats?.ratingDistribution && (
        <Card>
          <CardHeader><h2 className="font-semibold">Distribución de Ratings</h2></CardHeader>
          <CardBody>
            <div className="flex items-center gap-4">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center gap-2 flex-1">
                  <span className="text-sm">{star}★</span>
                  <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500" 
                      style={{ width: `${((stats.ratingDistribution[star] || 0) / (stats.responded || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600">{stats.ratingDistribution[star] || 0}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Surveys List */}
      <Card>
        <CardHeader><h2 className="font-semibold">Respuestas Recientes</h2></CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="text-center py-10">Cargando...</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {surveys.filter(s => s.responded).slice(0, 20).map((survey) => (
                <div key={survey.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-800">{survey.ticketNumber}</div>
                      <div className="text-sm text-slate-500">{survey.clientEmail}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-500 text-lg">{getRatingStars(survey.rating)}</div>
                      <div className="text-xs text-slate-500">{new Date(survey.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {survey.feedback && (
                    <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                      "{survey.feedback}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {surveys.filter(s => s.responded).length === 0 && !loading && (
            <div className="text-center py-10 text-slate-500">No hay respuestas aún</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
