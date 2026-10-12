export const SUPPORTED_LANGUAGES = [
  {
    id: 'python',
    name: 'Python 3',
    version: '3.11',
    extension: '.py',
    monacoLanguage: 'python',
    defaultFile: 'main.py',
    icon: 'Terminal',
    dockerImage: 'python:3.11-slim',
    color: '#38bdf8', // sky-400
  },
  {
    id: 'java',
    name: 'Java (OpenJDK)',
    version: '17 LTS',
    extension: '.java',
    monacoLanguage: 'java',
    defaultFile: 'Main.java',
    icon: 'Coffee',
    dockerImage: 'eclipse-temurin:17-jdk-alpine',
    color: '#f97316', // orange-500
  },
  {
    id: 'cpp',
    name: 'C++ (GCC)',
    version: '13.2 (C++20)',
    extension: '.cpp',
    monacoLanguage: 'cpp',
    defaultFile: 'main.cpp',
    icon: 'Binary',
    dockerImage: 'gcc:13.2',
    color: '#3b82f6', // blue-500
  },
];

export const getLanguageById = (id) => {
  return SUPPORTED_LANGUAGES.find((l) => l.id === id) || SUPPORTED_LANGUAGES[0];
};

export const getLanguageByFilename = (filename) => {
  if (!filename) return SUPPORTED_LANGUAGES[0];
  if (filename.endsWith('.py')) return SUPPORTED_LANGUAGES.find((l) => l.id === 'python');
  if (filename.endsWith('.java')) return SUPPORTED_LANGUAGES.find((l) => l.id === 'java');
  if (filename.endsWith('.cpp') || filename.endsWith('.cc') || filename.endsWith('.h') || filename.endsWith('.hpp')) {
    return SUPPORTED_LANGUAGES.find((l) => l.id === 'cpp');
  }
  return SUPPORTED_LANGUAGES[0];
};
