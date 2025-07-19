import { useState } from 'react';
import { Sermon } from '@/types';
import styles from '@/styles/Home.module.css';

interface SermonResultProps {
  sermon: Sermon;
}

export default function SermonResult({ sermon }: SermonResultProps) {
  const [activeTab, setActiveTab] = useState<'sermon' | 'outline' | 'notes'>('sermon');
  
  // Function to create downloadable text
  const downloadSermon = () => {
    // Convert sermon to text format
    const sermonText = `
${sermon.title}
Scripture: ${sermon.scripture}

INTRODUCTION:
${sermon.introduction}

MAIN POINTS:
${sermon.mainPoints.map((point, index) => `
${index + 1}. ${point.heading}
   ${point.supportingScripture ? `Scripture: ${point.supportingScripture}` : ''}
   ${point.content}
`).join('')}

CONCLUSION:
${sermon.conclusion}

CALL TO ACTION:
${sermon.callToAction}
    `.trim();
    
    // Create a Blob and download
    const blob = new Blob([sermonText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sermon - ${sermon.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className={styles.sermonResultContainer}>
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'sermon' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('sermon')}
        >
          Full Sermon
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'outline' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('outline')}
        >
          Sermon Outline
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'notes' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Preaching Notes
        </button>
      </div>
      
      <div className={styles.sermonResult}>
        {activeTab === 'sermon' && (
          <>
            <h2 className={styles.sermonTitle}>{sermon.title}</h2>
            <p className={styles.sermonScripture}>Scripture: {sermon.scripture}</p>
            
            <section className={styles.sermonSection}>
              <h3>Introduction</h3>
              <p>{sermon.introduction}</p>
            </section>
            
            <section className={styles.sermonSection}>
              <h3>Main Points</h3>
              {sermon.mainPoints.map((point, index) => (
                <div key={index} className={styles.point}>
                  <h4>{point.heading}</h4>
                  {point.supportingScripture && (
                    <p className={styles.supportingScripture}>
                      <strong>Scripture:</strong> {point.supportingScripture}
                    </p>
                  )}
                  <p>{point.content}</p>
                </div>
              ))}
            </section>
            
            <section className={styles.sermonSection}>
              <h3>Conclusion</h3>
              <p>{sermon.conclusion}</p>
            </section>
            
            <section className={styles.sermonSection}>
              <h3>Call to Action</h3>
              <p>{sermon.callToAction}</p>
            </section>
          </>
        )}
        
        {activeTab === 'outline' && (
          <>
            <h2 className={styles.sermonTitle}>{sermon.title}</h2>
            <p className={styles.sermonScripture}>Scripture: {sermon.scripture}</p>
            
            <div className={styles.outlineContainer}>
              <div className={styles.outlineItem}>
                <h3>I. Introduction</h3>
                <p>{sermon.introduction.substring(0, 100)}...</p>
              </div>
              
              {sermon.mainPoints.map((point, index) => (
                <div key={index} className={styles.outlineItem}>
                  <h3>{`${getRomanNumeral(index + 2)}. ${point.heading}`}</h3>
                  <p className={styles.outlineSubItem}>
                    A. Scripture: {point.supportingScripture || "Various passages"}
                  </p>
                  <p className={styles.outlineSubItem}>
                    B. Key thought: {point.content.substring(0, 80)}...
                  </p>
                </div>
              ))}
              
              <div className={styles.outlineItem}>
                <h3>{`${getRomanNumeral(sermon.mainPoints.length + 2)}. Conclusion`}</h3>
                <p>{sermon.conclusion.substring(0, 100)}...</p>
              </div>
              
              <div className={styles.outlineItem}>
                <h3>{`${getRomanNumeral(sermon.mainPoints.length + 3)}. Call to Action`}</h3>
                <p>{sermon.callToAction.substring(0, 100)}...</p>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'notes' && (
          <>
            <h2 className={styles.sermonTitle}>Preaching Notes: {sermon.title}</h2>
            <p className={styles.sermonScripture}>Main Scripture: {sermon.scripture}</p>
            
            <div className={styles.preachingNotes}>
              <div className={styles.noteItem}>
                <h3>Opening Prayer</h3>
                <p>Lord, open our hearts and minds to Your Word today. Speak through me as I share these truths from Scripture. Help us not just to be hearers of the Word but doers also. Amen.</p>
              </div>
              
              <div className={styles.noteItem}>
                <h3>Introduction Tips</h3>
                <ul>
                  <li>Begin with a relevant story or illustration about {sermon.title.split(':')[0]}</li>
                  <li>Read {sermon.scripture} slowly and clearly</li>
                  <li>Establish connection with the audience through a question about their experience with this topic</li>
                </ul>
              </div>
              
              {sermon.mainPoints.map((point, index) => (
                <div key={index} className={styles.noteItem}>
                  <h3>Point {index + 1}: {point.heading}</h3>
                  <ul>
                    <li>Scripture emphasis: {point.supportingScripture || "Cross-reference with other relevant passages"}</li>
                    <li>Key idea: {getKeyIdea(point.content)}</li>
                    <li>Potential illustration: {getIllustrationIdea(point.heading)}</li>
                    <li>Pause for emphasis after main statement</li>
                  </ul>
                </div>
              ))}
              
              <div className={styles.noteItem}>
                <h3>Conclusion Notes</h3>
                <ul>
                  <li>Briefly recap main points</li>
                  <li>Share personal application</li>
                  <li>End with motivating challenge from Call to Action</li>
                  <li>Allow for moment of reflection before closing prayer</li>
                </ul>
              </div>
              
              <div className={styles.noteItem}>
                <h3>Timing Guide</h3>
                <ul>
                  <li>Introduction: 3-5 minutes</li>
                  <li>Each main point: 5-7 minutes</li>
                  <li>Conclusion: 3-4 minutes</li>
                  <li>Total sermon time: 25-35 minutes</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className={styles.actionButtons}>
        <button onClick={() => window.print()} className={styles.actionButton}>
          Print Sermon
        </button>
        <button onClick={downloadSermon} className={styles.actionButton}>
          Download Text
        </button>
      </div>
    </div>
  );
}

// Helper Functions
function getRomanNumeral(num: number): string {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return romanNumerals[num - 1] || num.toString();
}

function getKeyIdea(content: string): string {
  // Extract first sentence as key idea
  const firstSentence = content.split('.')[0] + '.';
  return firstSentence;
}

function getIllustrationIdea(heading: string): string {
  const illustrationMap: Record<string, string> = {
    "God's unconditional love": "Parent-child relationship or shepherd with lost sheep",
    "Loving others": "Good Samaritan modern equivalent",
    "Trust in God's promises": "Abraham's faith journey or personal testimony",
    "Faith in action": "Example from a missionary's life or local ministry impact",
    "Biblical principles": "Contrast worldly versus biblical approach",
    "Application for today": "Recent news event or common workplace scenario",
    "Spiritual growth": "Plant/garden metaphor or athletic training analogy"
  };
  
  // Find a matching illustration or create a generic one
  for (const [key, value] of Object.entries(illustrationMap)) {
    if (heading.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return "Personal story related to this principle or historical example";
}