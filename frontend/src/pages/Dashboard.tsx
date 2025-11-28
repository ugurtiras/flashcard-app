import { useEffect, useState } from 'react';
import { wordlistAPI } from '../api/client';
import { useAuthStore } from '../store/authStore';
import './Dashboard.css';
import WordListView from '../components/WordListView';

interface WordList {
  id: number;
  title: string;
  description: string;
}

export default function Dashboard() {
  const [wordlists, setWordlists] = useState<WordList[]>([]);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    loadWordlists();
  }, []);

  const loadWordlists = async () => {
    try {
      const response = await wordlistAPI.getAll();
      setWordlists(response.data);
    } catch (error) {
      console.error('Failed to load word lists');
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await wordlistAPI.create(title, description);
      setTitle('');
      setDescription('');
      setShowForm(false);
      loadWordlists();
    } catch (error) {
      console.error('Failed to create word list');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await wordlistAPI.delete(id);
      loadWordlists();
    } catch (error) {
      console.error('Failed to delete word list');
    }
  };

  if (selectedList) {
    return (
      <WordListView
        listId={selectedList}
        onBack={() => setSelectedList(null)}
      />
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Flashcard App</h1>
        <button className="btn-logout" onClick={logout}>
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="wordlists-section">
          <h2>Your Word Lists</h2>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Create New List
            </button>
          )}

          {showForm && (
            <form className="form-create-list" onSubmit={handleCreateList}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="wordlists-grid">
            {wordlists.map((list) => (
              <div key={list.id} className="wordlist-card">
                <h3>{list.title}</h3>
                <p>{list.description}</p>
                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => setSelectedList(list.id)}
                  >
                    Open
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(list.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
