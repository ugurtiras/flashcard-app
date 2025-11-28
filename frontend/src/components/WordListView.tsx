import { useEffect, useState } from 'react';
import { wordlistAPI, cardAPI } from '../api/client';
import './WordListView.css';

interface Card {
  id: number;
  front: string;
  front_example: string;
  back: string;
}

interface WordListViewProps {
  listId: number;
  onBack: () => void;
}

export default function WordListView({ listId, onBack }: WordListViewProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [listTitle, setListTitle] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [front, setFront] = useState('');
  const [frontExample, setFrontExample] = useState('');
  const [back, setBack] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    loadList();
  }, [listId]);

  const loadList = async () => {
    try {
      const response = await wordlistAPI.getById(listId);
      setListTitle(response.data.list.title);
      setCards(response.data.cards);
    } catch (error) {
      console.error('Failed to load word list');
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cardAPI.create(listId, front, frontExample, back);
      setFront('');
      setFrontExample('');
      setBack('');
      setShowForm(false);
      loadList();
    } catch (error) {
      console.error('Failed to add card');
    }
  };

  const handleDeleteCard = async (id: number) => {
    try {
      await cardAPI.delete(id);
      loadList();
    } catch (error) {
      console.error('Failed to delete card');
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  if (cards.length === 0 && !showForm) {
    return (
      <div className="wordlist-view">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <h1>{listTitle}</h1>
        <p className="empty-message">No cards yet</p>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add First Card
        </button>

        {showForm && (
          <form className="form-add-card" onSubmit={handleAddCard}>
            <div className="form-group">
              <label htmlFor="front">Word (Front)</label>
              <input
                id="front"
                type="text"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="frontExample">Usage Example</label>
              <input
                id="frontExample"
                type="text"
                value={frontExample}
                onChange={(e) => setFrontExample(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="back">Translation/Definition</label>
              <input
                id="back"
                type="text"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                Add Card
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
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="wordlist-view">
      <button className="btn-back" onClick={onBack}>
        ← Back
      </button>
      <h1>{listTitle}</h1>

      {!showForm && (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add Card
        </button>
      )}

      {showForm && (
        <form className="form-add-card" onSubmit={handleAddCard}>
          <div className="form-group">
            <label htmlFor="front">Word (Front)</label>
            <input
              id="front"
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="frontExample">Usage Example</label>
            <input
              id="frontExample"
              type="text"
              value={frontExample}
              onChange={(e) => setFrontExample(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="back">Translation/Definition</label>
            <input
              id="back"
              type="text"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              required
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn btn-primary">
              Add Card
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

      <div className="cards-container">
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div className="card-content">
                <h2>{currentCard?.front}</h2>
                <p>{currentCard?.front_example}</p>
              </div>
            </div>
            <div className="flashcard-back">
              <div className="card-content">
                <h2>{currentCard?.back}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="card-navigation">
          <button className="btn btn-secondary" onClick={prevCard}>
            ← Previous
          </button>
          <span className="card-counter">
            {currentCardIndex + 1} / {cards.length}
          </span>
          <button className="btn btn-secondary" onClick={nextCard}>
            Next →
          </button>
        </div>

        <button
          className="btn btn-danger"
          onClick={() => handleDeleteCard(currentCard?.id)}
        >
          Delete Card
        </button>
      </div>

      <div className="cards-list">
        <h3>All Cards ({cards.length})</h3>
        <div className="cards-table">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`card-row ${index === currentCardIndex ? 'active' : ''}`}
              onClick={() => {
                setCurrentCardIndex(index);
                setIsFlipped(false);
              }}
            >
              <span className="card-number">{index + 1}</span>
              <span className="card-word">{card.front}</span>
              <button
                className="btn-delete-small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCard(card.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
