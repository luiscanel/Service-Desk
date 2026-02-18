import { useState } from 'react';
import { Card, CardBody, Button, Input, Modal, Badge } from '../../components/ui';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Cómo reiniciar el router WiFi',
    content: 'Para reiniciar el router WiFi, sigue estos pasos: 1. Desconecta el cable de alimentación, 2. Espera 30 segundos, 3. Vuelve a conectar. El router se reiniciará automáticamente.',
    category: 'Redes',
    tags: ['wifi', 'red', 'conexión'],
    author: 'Administrador',
    views: 145,
    createdAt: '2026-01-15',
    updatedAt: '2026-02-10',
  },
  {
    id: '2',
    title: 'Instalar Office 365',
    content: 'Para instalar Office 365: 1. Ve a office.com, 2. Inicia sesión con tu cuenta corporativa, 3. Haz clic en "Instalar Office", 4. Ejecuta el instalador.',
    category: 'Software',
    tags: ['office', 'microsoft', 'instalación'],
    author: 'Administrador',
    views: 89,
    createdAt: '2026-01-20',
    updatedAt: '2026-02-05',
  },
  {
    id: '3',
    title: 'Crear cuenta de usuario en Windows',
    content: 'Para crear una cuenta de usuario: 1. Abre Configuración, 2. Cuentas, 3. Familia y otros usuarios, 4. Agregar alguien más a esta PC.',
    category: 'Sistemas',
    tags: ['windows', 'usuario', 'cuenta'],
    author: 'Administrador',
    views: 67,
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
  },
];

export function KnowledgePage() {
  const [articles] = useState<Article[]>(mockArticles);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Software',
    tags: '',
  });

  const categories = ['all', 'Redes', 'Software', 'Sistemas', 'Seguridad', 'Hardware'];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Artículo creado exitosamente (demo)');
    setIsModalOpen(false);
    setFormData({ title: '', content: '', category: 'Software', tags: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Base de Conocimiento</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          + Nuevo Artículo
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <Input
            placeholder="Buscar artículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'Todas las categorías' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="text-2xl font-bold text-slate-800">{articles.length}</div>
            <div className="text-sm text-slate-500">Total Artículos</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-2xl font-bold text-slate-800">
              {articles.reduce((acc, a) => acc + a.views, 0)}
            </div>
            <div className="text-sm text-slate-500">Total Vistas</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-2xl font-bold text-slate-800">{categories.length - 1}</div>
            <div className="text-sm text-slate-500">Categorías</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-2xl font-bold text-slate-800">{articles.reduce((acc, a) => acc + a.tags.length, 0)}</div>
            <div className="text-sm text-slate-500">Tags</div>
          </CardBody>
        </Card>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Card 
            key={article.id} 
            hover 
            className="cursor-pointer"
            onClick={() => setSelectedArticle(article)}
          >
            <CardBody>
              <div className="flex items-start justify-between mb-3">
                <Badge variant="info">{article.category}</Badge>
                <span className="text-xs text-slate-400">👁 {article.views}</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4">{article.content}</p>
              <div className="flex flex-wrap gap-1">
                {article.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <div className="text-slate-400 mb-2">📚</div>
            <div className="text-slate-500">No se encontraron artículos</div>
          </CardBody>
        </Card>
      )}

      {/* Article Detail Modal */}
      <Modal
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.title || ''}
        size="lg"
      >
        {selectedArticle && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="info">{selectedArticle.category}</Badge>
              <span className="text-sm text-slate-500">Por {selectedArticle.author}</span>
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm text-slate-400">{selectedArticle.views} vistas</span>
            </div>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 whitespace-pre-wrap">{selectedArticle.content}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              {selectedArticle.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="text-xs text-slate-400">
              Actualizado: {selectedArticle.updatedAt}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Article Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Artículo"
        size="lg"
      >
        <form onSubmit={handleCreateArticle} className="space-y-4">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Título del artículo"
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contenido</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Escribe el contenido del artículo..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              rows={6}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Software">Software</option>
                <option value="Redes">Redes</option>
                <option value="Sistemas">Sistemas</option>
                <option value="Seguridad">Seguridad</option>
                <option value="Hardware">Hardware</option>
              </select>
            </div>
            <Input
              label="Tags (separados por coma)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="wifi, red, conexión"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Publicar Artículo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
