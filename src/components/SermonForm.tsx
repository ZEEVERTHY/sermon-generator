import { useState } from 'react';
import { InputType } from '@/types';
import styles from '@/styles/Home.module.css';

interface SermonFormProps {
  onSubmit: (input: string, inputType: InputType) => void;
  loading: boolean;
}

export default function SermonForm({ onSubmit, loading }: SermonFormProps) {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<InputType>('passage'); // Default to passage

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input, inputType);
    }
  };

  // Common Bible passages suggestions
  const passageSuggestions = [
    'John 3:16',
    'Psalm 23',
    'Romans 8:28-39',
    'Matthew 5:3-12',
    'Philippians 4:4-9'
  ];

  // Common sermon topic suggestions
  const topicSuggestions = [
    'Love',
    'Faith',
    'Hope',
    'Grace',
    'Forgiveness'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputTypeToggle}>
          <button 
            type="button"
            className={`${styles.toggleButton} ${inputType === 'passage' ? styles.activeToggle : ''}`}
            onClick={() => setInputType('passage')}
          >
            Bible Passage
          </button>
          <button 
            type="button"
            className={`${styles.toggleButton} ${inputType === 'topic' ? styles.activeToggle : ''}`}
            onClick={() => setInputType('topic')}
          >
            Sermon Topic
          </button>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="sermon-input">
            {inputType === 'passage' ? 'Enter Bible Passage:' : 'Enter Sermon Topic:'}
          </label>
          <input
            id="sermon-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputType === 'passage' ? 'e.g., John 3:16 or Romans 8:28-39' : 'e.g., Love, Faith, Hope'}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.suggestionContainer}>
          <p className={styles.suggestionLabel}>Suggestions:</p>
          <div className={styles.suggestionTags}>
            {(inputType === 'passage' ? passageSuggestions : topicSuggestions).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className={styles.suggestionTag}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Generating Sermon...' : 'Generate Sermon'}
        </button>
      </form>
    </div>
  );
}