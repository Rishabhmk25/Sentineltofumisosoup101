import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AIService {
  static #runPythonInline(pythonCode, inputJson = {}, options = {}) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', ['-c', pythonCode], {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options,
      });

      const inputString = typeof inputJson === 'string' ? inputJson : JSON.stringify(inputJson);
      if (inputString) {
        pythonProcess.stdin.write(inputString);
      }
      pythonProcess.stdin.end();

      let result = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Python exited with code ${code}: ${error || result}`));
        }
        try {
          const parsed = JSON.parse(result);
          resolve(parsed);
        } catch {
          resolve({ output: result.trim() });
        }
      });
    });
  }

  static async analyzeComplaint(complaintData) {
    try {
      const summarizerDir = path.join(__dirname, '../models/summarizer');
      const pythonCode = `
import sys, json, os
sys.path.append(${JSON.stringify(summarizerDir)})
from image_to_text import extract_text_from_image
from pdf_to_text import extract_text_from_pdf
from audio_to_text import extract_text_from_audio
from video_to_text import extract_details_from_video
from summarizer import get_incident_details_from_text, get_narrative_summary

data = json.loads(sys.stdin.read() or '{}')
complaint = data.get('complaint', '')
image_path = data.get('image_path')
pdf_path = data.get('pdf_path')
audio_path = data.get('audio_path')
video_path = data.get('video_path')

image_text = extract_text_from_image(image_path) if image_path else ''
pdf_text = extract_text_from_pdf(pdf_path) if pdf_path else ''
audio_text = extract_text_from_audio(audio_path) if audio_path else ''
video_details = extract_details_from_video(video_path) if video_path else {"transcribed_audio": "", "text_from_frames": []}
text_from_video_audio = video_details.get('transcribed_audio', '')
text_from_video_frames = ' '.join(video_details.get('text_from_frames', []))

details = get_incident_details_from_text(complaint, image_text, pdf_text, audio_text, text_from_video_audio, text_from_video_frames)
summary = get_narrative_summary(complaint, image_text, pdf_text, audio_text, text_from_video_audio, text_from_video_frames)
print(json.dumps({"details": details, "summary": summary}))
`;
      return await AIService.#runPythonInline(pythonCode, complaintData);
    } catch (error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  static async checkDatabaseSimilarity(entityData) {
    try {
      const dbDir = path.join(__dirname, '../models/database_similarity');
      const pythonCode = `
import sys, json, os
sys.path.append(${JSON.stringify(dbDir)})
import database as db

victims_csv = os.path.join(${JSON.stringify(dbDir)}, 'victim_reports.csv')
official_csv = os.path.join(${JSON.stringify(dbDir)}, 'official_scam_records.csv')

db1 = db.ensure_all_columns(db.load_csv_safe(victims_csv))
db2 = db.ensure_all_columns(db.load_csv_safe(official_csv))

# Normalize set-like fields
set_fields = ['phones','bank_accounts','upi_ids','emails','websites','social_handles','ip_addresses','crypto_wallets','contact_methods']
for df in [db1, db2]:
    for field in set_fields:
        if 'phone' in field and field != 'contact_methods':
            df[field] = df[field].apply(lambda x: set(db.normalize_phone(p) for p in str(x).split('|') if p and p != 'nan'))
        elif 'email' in field:
            df[field] = df[field].apply(lambda x: set(db.normalize_email(e) for e in str(x).split('|') if e and e != 'nan'))
        elif 'website' in field:
            df[field] = df[field].apply(lambda x: set(db.normalize_website(w) for w in str(x).split('|') if w and w != 'nan'))
        else:
            df[field] = df[field].apply(db.normalize_field)

cross = db.cross_db_match(db1, db2, threshold=0.5)
within = db.within_db_match(db1, threshold=0.3)
print(json.dumps({"cross_db_matches": cross, "within_db_matches": within}))
`;
      return await AIService.#runPythonInline(pythonCode, entityData);
    } catch (error) {
      throw new Error(`Database similarity check failed: ${error.message}`);
    }
  }

  static async getChatbotResponse(query, context = '') {
    try {
      const chatbotDir = path.join(__dirname, '../models/chatbot');
      const pythonCode = `
import sys, json, os
sys.path.append(${JSON.stringify(chatbotDir)})
import chatbot as cb
from sentence_transformers import SentenceTransformer
import groq
from tavily import TavilyClient

data = json.loads(sys.stdin.read() or '{}')
query = data.get('query','')

embedding_model = SentenceTransformer(cb.MODEL_NAME)
docs = cb.get_pdf_text_and_metadata([os.path.join(${JSON.stringify(chatbotDir)}, p) for p in cb.PDF_FILES])
chunks = cb.chunk_documents(docs, chunk_size=1000, chunk_overlap=200)
index = cb.create_vector_index(chunks, embedding_model)
results = cb.search_index(query, embedding_model, index, chunks, k=5)

groq_key = os.environ.get('GROQ_API_KEY')
groq_client = groq.Groq(api_key=groq_key) if groq_key else None

tav_key = os.environ.get('TAVILY_API_KEY')
tav_client = TavilyClient(api_key=tav_key) if tav_key else None

answer = cb.generate_synthesized_answer(query, results, embedding_model, groq_client, tav_client)
print(json.dumps({"answer": answer, "sources": [r.get('source') for r in results]}))
`;
      return await AIService.#runPythonInline(pythonCode, { query, context });
    } catch (error) {
      throw new Error(`Chatbot response failed: ${error.message}`);
    }
  }

  static async extractTextFromFile(filePath, fileType) {
    try {
      let pythonScript;
      
      switch (fileType.toLowerCase()) {
        case 'pdf':
          pythonScript = path.join(__dirname, '../models/summarizer/pdf_to_text.py');
          break;
        case 'image':
          pythonScript = path.join(__dirname, '../models/summarizer/image_to_text.py');
          break;
        case 'audio':
          pythonScript = path.join(__dirname, '../models/summarizer/audio_to_text.py');
          break;
        case 'video':
          pythonScript = path.join(__dirname, '../models/summarizer/video_to_text.py');
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [pythonScript, filePath], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          error += data.toString();
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`Python process exited with code ${code}: ${error}`));
          } else {
            try {
              const extractedText = JSON.parse(result);
              resolve(extractedText);
            } catch (parseError) {
              // If not JSON, return as plain text
              resolve({ text: result.trim() });
            }
          }
        });
      });
    } catch (error) {
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  }

  static async classifyContent(content) {
    try {
      const summarizerDir = path.join(__dirname, '../models/summarizer');
      const pythonCode = `
import sys, json
sys.path.append(${JSON.stringify(summarizerDir)})
from classifier import classify_cybercrime

data = json.loads(sys.stdin.read() or '{}')
# Expect a dict with keys like: crime_type, financial_loss_inr, victims_affected, is_ongoing
priority, score = classify_cybercrime(data)
print(json.dumps({"priority": priority, "score": score}))
`;
      const payload = typeof content === 'string' ? { text: content } : content;
      return await AIService.#runPythonInline(pythonCode, payload);
    } catch (error) {
      throw new Error(`Content classification failed: ${error.message}`);
    }
  }

  static async findContradictions(data) {
    try {
      const summarizerDir = path.join(__dirname, '../models/summarizer');
      const pythonCode = `
import sys, json
sys.path.append(${JSON.stringify(summarizerDir)})
from contradict import contradiction_in_complain_and_evidences
from image_to_text import extract_text_from_image
from pdf_to_text import extract_text_from_pdf
from audio_to_text import extract_text_from_audio
from video_to_text import extract_details_from_video

payload = json.loads(sys.stdin.read() or '{}')
complaint = payload.get('complaint','')
image_path = payload.get('image_path')
pdf_path = payload.get('pdf_path')
audio_path = payload.get('audio_path')
video_path = payload.get('video_path')

image_text = extract_text_from_image(image_path) if image_path else ''
pdf_text = extract_text_from_pdf(pdf_path) if pdf_path else ''
audio_text = extract_text_from_audio(audio_path) if audio_path else ''
video_details = extract_details_from_video(video_path) if video_path else {"transcribed_audio": "", "text_from_frames": []}
text_from_video_audio = video_details.get('transcribed_audio', '')
text_from_video_frames = ' '.join(video_details.get('text_from_frames', []))

analysis, has_contradiction = contradiction_in_complain_and_evidences(complaint, image_text, pdf_text, audio_text, text_from_video_audio, text_from_video_frames)
print(json.dumps({"analysis": analysis, "has_contradiction": has_contradiction}))
`;
      return await AIService.#runPythonInline(pythonCode, data);
    } catch (error) {
      throw new Error(`Contradiction analysis failed: ${error.message}`);
    }
  }
}

