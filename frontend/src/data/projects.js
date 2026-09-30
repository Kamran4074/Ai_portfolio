// Verified project data, matching backend/knowledge/projects.md exactly.
// Keep these two in sync if the knowledge base changes.

export const projects = [
  {
    id: 'documind-ai',
    name: 'DocuMind AI',
    subtitle: 'Production Multi-Document RAG Chatbot',
    featured: true,
    description:
      'Production-style multi-document RAG chatbot that lets users upload PDF, DOCX, and TXT documents and ask grounded questions. Implements document ingestion, chunking, local embeddings, vector retrieval, source citations, conversation history, feedback, follow-up-aware retrieval, and offline evaluation.',
    tags: ['FastAPI', 'Streamlit', 'LangChain', 'ChromaDB', 'SQLite', 'Gemini', 'Sentence Transformers'],
    githubUrl: 'https://github.com/mozammilsiddique2a-dot/Docs-Chatbot',
  },
  {
    id: 'greenpack-ai',
    name: 'GreenPack AI',
    subtitle: 'EPR Compliance AI Service',
    featured: true,
    description:
      'AI-powered EPR compliance backend that processes monthly plastic declarations, reconciles them against ERP procurement data, and provides compliance Q&A through a local RAG pipeline.',
    tags: ['FastAPI', 'Python', 'Ollama', 'Llama 3', 'FAISS', 'Sentence Transformers', 'SQLite', 'SQLAlchemy'],
    githubUrl: 'https://github.com/mozammilsiddique2a-dot/greenpack-ai-service-',
  },
  {
    id: 'ai-first-crm-hcp',
    name: 'AI-First CRM HCP',
    subtitle: 'Healthcare CRM with AI-assisted logging',
    featured: true,
    description:
      'Full-stack AI-powered healthcare CRM module for managing Healthcare Professional interactions, with AI-assisted logging, automatic form autofill, interaction search, summaries, and follow-up suggestions.',
    tags: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'LangGraph', 'Groq', 'SQLAlchemy'],
    githubUrl: 'https://github.com/mozammilsiddique2a-dot/AI-First-CRM-HCP',
  },
  {
    id: 'syringe-angle-detector',
    name: 'Syringe Angle Detector',
    subtitle: 'Real-time Computer Vision system',
    featured: true,
    description:
      'Real-time computer vision system for syringe detection and angle measurement using YOLOv8. Detects syringes from camera input, calculates angle, smooths readings, and provides real-time confidence and safety indicators.',
    tags: ['Python', 'YOLOv8', 'OpenCV', 'Computer Vision'],
    githubUrl: 'https://github.com/mozammilsiddique2a-dot/-Syringe--Angle--Detector',
  },
  {
    id: 'shl-assessment-recommender',
    name: 'SHL Assessment Recommender',
    subtitle: 'Conversational recommendation API',
    featured: true,
    description:
      'Conversational assessment recommendation API that recommends relevant SHL Individual Test Solutions based on user requirements and conversational context.',
    tags: ['Python', 'FastAPI', 'REST API', 'Docker'],
    githubUrl: 'https://github.com/mozammilsiddique2a-dot/shl-conversational-recommender',
  },
  {
    id: 'ai-document-qa-chatbot',
    name: 'AI Document Q&A Chatbot with RAG',
    subtitle: 'RAG pipeline over PDF/text documents',
    featured: false,
    description:
      'A RAG pipeline built with LangChain and the OpenAI API for intelligent Q&A over PDF/text documents, with document chunking, embeddings, vector search, and prompt engineering to improve response accuracy.',
    tags: ['Python', 'LangChain', 'OpenAI API', 'LLM', 'RAG', 'Vector Database'],
    githubUrl: null,
  },
  {
    id: 'lung-cancer-detection',
    name: 'Lung Cancer Detection',
    subtitle: 'ML classification project — not a diagnostic tool',
    featured: false,
    description:
      'A machine-learning classification project predicting lung cancer likelihood from patient risk factors, evaluated with accuracy, precision, recall, and F1-score. This is a portfolio/educational project only — it is not clinically validated and must not be treated as a medical diagnosis.',
    tags: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'React', 'FastAPI'],
    githubUrl: 'https://github.com/mozammilsiddique2a-dot/lung_cancer_predection',
  },
]
