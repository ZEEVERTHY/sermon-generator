// Sermon data structure
export interface SermonPoint {
    heading: string;
    content: string;
    supportingScripture?: string;
  }
  
  export interface Sermon {
    title: string;
    scripture: string;
    introduction: string;
    mainPoints: SermonPoint[];
    conclusion: string;
    callToAction: string;
  }
  
  // Form input types
  export type InputType = 'passage' | 'topic';
  
  // API request and response types
  export interface GenerateSermonRequest {
    input: string;
    inputType: InputType;
  }
  
  export interface GenerateSermonResponse {
    sermon: Sermon;
  }
  
  // Bible book pattern for detection
  export interface BibleBookPattern {
    regex: RegExp;
    book: string;
  }
  
  // Theme information
  export interface ThemeInfo {
    key: string;
    verses: string[];
    themes: string[];
  }
  
  // Theme mapping
  export interface ThemeMap {
    [key: string]: ThemeInfo;
  }