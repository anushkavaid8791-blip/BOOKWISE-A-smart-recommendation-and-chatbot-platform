// services/recommendationService.js
// Groq AI se book recommendations generate karta h — genre + mood dono support karta h


import axios from 'axios';
import Book from '../models/Book.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const getApiKey = () => (process.env.GROQ_API_KEY || '').trim();
const getCandidateModels = () => {
  const primary = (process.env.GROQ_MODEL || 'openai/gpt-oss-20b').trim();
  const pool = [primary, 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'groq/compound-mini'];
  return [...new Set(pool.filter(Boolean))];
};

const SUPPORTED_MOODS = [
  'happy', 'sad', 'relaxed', 'adventurous', 'romantic',
  'thoughtful', 'motivated', 'nostalgic', 'curious', 'cozy', 'mystery'
];

const FALLBACK_GENRE_BOOKS = {
  fiction: [
    { title: "To Kill a Mockingbird", author: "Harper Lee", reason: "A timeless masterpiece exploring morality, justice, and humanity." },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", reason: "Exquisite exploration of ambition, love, and the Jazz Age." },
    { title: "1984", author: "George Orwell", reason: "A gripping cautionary tale about truth, freedom, and surveillance." },
    { title: "Jane Eyre", author: "Charlotte Brontë", reason: "A deeply passionate story of independence and resilient romance." },
    { title: "Pride and Prejudice", author: "Jane Austen", reason: "Delightful wit, sharp observation, and memorable character chemistry." },
    { title: "The Catcher in the Rye", author: "J.D. Salinger", reason: "An iconic coming-of-age voice dissecting authenticity." }
  ],
  mystery: [
    { title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", reason: "Atmospheric Sherlock Holmes tale soaked in moorland mystery." },
    { title: "And Then There Were None", author: "Agatha Christie", reason: "The ultimate locked-island thriller of tension and secrets." },
    { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", reason: "A gritty Scandinavian investigation with brilliant sleuthing." },
    { title: "Gone Girl", author: "Gillian Flynn", reason: "Razor-sharp psychological twists and marital deception." },
    { title: "The Big Sleep", author: "Raymond Chandler", reason: "Classic hardboiled noir detective fiction at its peak." },
    { title: "In the Woods", author: "Tana French", reason: "Haunting, psychological murder investigation steeped in memory." }
  ],
  romance: [
    { title: "Pride and Prejudice", author: "Jane Austen", reason: "The gold standard of wit, chemistry, and mutual respect." },
    { title: "Emma", author: "Jane Austen", reason: "Charming matchmaker whose misadventures lead to true connection." },
    { title: "Normal People", author: "Sally Rooney", reason: "An intimate, tender portrait of young love across years." },
    { title: "Wuthering Heights", author: "Emily Brontë", reason: "Fiery, gothic passion set across wild, stormy landscapes." },
    { title: "The Song of Achilles", author: "Madeline Miller", reason: "Breathtakingly lyrical retelling of devotion and destiny." },
    { title: "Red, White & Royal Blue", author: "Casey McQuiston", reason: "Joyful, witty, modern high-stakes cross-Atlantic romance." }
  ],
  fantasy: [
    { title: "The Hobbit", author: "J.R.R. Tolkien", reason: "The classic cozy yet epic adventure through Middle-earth." },
    { title: "The Name of the Wind", author: "Patrick Rothfuss", reason: "Lyrical prose telling the legend of an elusive hero." },
    { title: "A Wizard of Earthsea", author: "Ursula K. Le Guin", reason: "Philosophical magic, shadows, and true self-discovery." },
    { title: "Good Omens", author: "Neil Gaiman & Terry Pratchett", reason: "Hilarious and heartwarming apocalyptic fantasy." },
    { title: "The Way of Kings", author: "Brandon Sanderson", reason: "Immensely rich worldbuilding and triumphant character arcs." },
    { title: "The Night Circus", author: "Erin Morgenstern", reason: "Enchanting duel of illusionists wrapped in sensory beauty." }
  ],
  scifi: [
    { title: "Dune", author: "Frank Herbert", reason: "Epic political maneuvering, ecology, and myth on Arrakis." },
    { title: "Fahrenheit 451", author: "Ray Bradbury", reason: "A poignant tribute to the enduring flame of literature." },
    { title: "Neuromancer", author: "William Gibson", reason: "The seminal cyberpunk ride into the neon-lit matrix." },
    { title: "Project Hail Mary", author: "Andy Weir", reason: "Thrilling scientific optimism and unexpected interstellar friendship." },
    { title: "Brave New World", author: "Aldous Huxley", reason: "Chilling dystopian look into technological conditioning." },
    { title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", reason: "Visionary anthropology, friendship, and quiet courage." }
  ]
};

const FALLBACK_MOOD_BOOKS = {
  cozy: [
    { title: "The House in the Cerulean Sea", author: "TJ Klune", reason: "A warm cup of tea in book form, overflowing with chosen family." },
    { title: "Little Women", author: "Louisa May Alcott", reason: "Tender, hearthside comfort celebrating sisterhood and growth." },
    { title: "Anne of Green Gables", author: "L.M. Montgomery", reason: "Pure infectious joy, nature appreciation, and heart." },
    { title: "A Gentleman in Moscow", author: "Amor Towles", reason: "Elegance, quiet contemplation, and culinary and literary pleasures." },
    { title: "The Secret Garden", author: "Frances Hodgson Burnett", reason: "Healing, blossoming nature and gentle warmth." },
    { title: "The Wind in the Willows", author: "Kenneth Grahame", reason: "Riverside camaraderie, charming antics, and peaceful pacing." }
  ],
  happy: [
    { title: "Good Omens", author: "Terry Pratchett & Neil Gaiman", reason: "Laugh-out-loud wit celebrating quirks of humanity." },
    { title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", reason: "Pure comedic brilliance across the cosmos." },
    { title: "P.G. Wodehouse: The Code of the Woosters", author: "P.G. Wodehouse", reason: "Effortless sunshine, hilarious misunderstandings, and unmatched phrasing." },
    { title: "Red, White & Royal Blue", author: "Casey McQuiston", reason: "High-spirited, feel-good, and deeply endearing." },
    { title: "The Rosie Project", author: "Graeme Simsion", reason: "Quirky, laugh-inducing romantic quest driven by data." },
    { title: "Where'd You Go, Bernadette", author: "Maria Semple", reason: "Smart, breezy, witty mystery that keeps you smiling." }
  ],
  relaxed: [
    { title: "Walden", author: "Henry David Thoreau", reason: "Quiet reflection on simplicity and living deliberately." },
    { title: "The Summer Book", author: "Tove Jansson", reason: "Gentle island life, philosophical grandmother-granddaughter days." },
    { title: "Norwegian Wood", author: "Haruki Murakami", reason: "Quiet, melancholic acoustic rhythms and nostalgic memories." },
    { title: "Siddhartha", author: "Hermann Hesse", reason: "A tranquil, meditative spiritual journey along the river." },
    { title: "Before the Coffee Gets Cold", author: "Toshikazu Kawaguchi", reason: "Reflective Tokyo cafe where you can revisit gentle memories." },
    { title: "Braiding Sweetgrass", author: "Robin Wall Kimmerer", reason: "Botanical wisdom connecting ecology with gratitude and calm." }
  ],
  adventurous: [
    { title: "The Count of Monte Cristo", author: "Alexandre Dumas", reason: "The ultimate breathless tale of treasure, intrigue, and vengeance." },
    { title: "Treasure Island", author: "Robert Louis Stevenson", reason: "High seas, salty pirates, and classic swashbuckling treasure hunts." },
    { title: "Into Thin Air", author: "Jon Krakauer", reason: "Pulse-pounding, unforgettable true ascent into extreme heights." },
    { title: "The Golden Compass", author: "Philip Pullman", reason: "Armored bears, zeppelins, and a courageous journey to the far North." },
    { title: "Around the World in Eighty Days", author: "Jules Verne", reason: "Clock-ticking international expedition powered by Victorian grit." },
    { title: "Jurassic Park", author: "Michael Crichton", reason: "Action-packed science run wild with suspense at every turn." }
  ],
  romantic: [
    { title: "Pride and Prejudice", author: "Jane Austen", reason: "The quintessential timeless dance of wit, banter, and hearts." },
    { title: "The Song of Achilles", author: "Madeline Miller", reason: "Poetic devotion woven into high tragedy and glory." },
    { title: "Jane Eyre", author: "Charlotte Brontë", reason: "Profound romantic devotion anchored in mutual equality." },
    { title: "Call Me by Your Name", author: "André Aciman", reason: "Sun-drenched, sensuous summer romance in rural Italy." },
    { title: "Persuasion", author: "Jane Austen", reason: "Exquisite second-chance romance about enduring patience and loyalty." },
    { title: "Outlander", author: "Diana Gabaldon", reason: "Time-travel romance filled with Scottish highlands and devotion." }
  ]
};

async function callGroq(prompt) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }

  const models = getCandidateModels();
  for (const model of models) {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are a book recommendation engine. Always respond with ONLY valid JSON, no preamble, no markdown fences. Format: {"recommendations": [{"title": "", "author": "", "reason": ""}]}'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );

      let raw = response.data.choices[0].message.content.trim();
      raw = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`Groq call failed with model ${model}:`, e.response?.data?.error?.message || e.message);
    }
  }
  return null;
}

async function getGenreRecommendations(genre, excludeTitle = null) {
  const cleanGenre = genre ? genre.toLowerCase().trim() : 'fiction';
  const prompt = `Suggest 6 popular books in the "${genre}" genre.${
    excludeTitle ? ` Do not include "${excludeTitle}".` : ''
  } For each, give title, author, and a one-line reason it fits the genre.`;
  const data = await callGroq(prompt);
  if (data && data.recommendations && data.recommendations.length > 0) {
    return data.recommendations;
  }
  const fallback = FALLBACK_GENRE_BOOKS[cleanGenre] || FALLBACK_GENRE_BOOKS.fiction;
  return excludeTitle ? fallback.filter(b => b.title.toLowerCase() !== excludeTitle.toLowerCase()) : fallback;
}

async function getMoodRecommendations(mood) {
  const cleanMood = mood ? mood.toLowerCase().trim() : 'cozy';
  const prompt = `Suggest 6 books perfect for someone feeling "${mood}" right now. Consider pacing, tone, and emotional weight — match the mood, not just the genre. For each, give title, author, and a one-line reason it fits this mood.`;
  const data = await callGroq(prompt);
  if (data && data.recommendations && data.recommendations.length > 0) {
    return data.recommendations;
  }
  return FALLBACK_MOOD_BOOKS[cleanMood] || FALLBACK_MOOD_BOOKS.cozy;
}

async function getGenreAndMoodRecommendations(genre, mood) {
  const prompt = `Suggest 6 books that are BOTH in the "${genre}" genre AND fit someone feeling "${mood}". For each, give title, author, and a one-line reason it fits both.`;
  const data = await callGroq(prompt);
  return data.recommendations || [];
}

async function getSimilarBooks(bookTitle, author = '') {
  const prompt = `Suggest 6 books similar to "${bookTitle}"${
    author ? ` by ${author}` : ''
  } in theme, tone, or style. For each, give title, author, and a one-line reason it's similar.`;
  const data = await callGroq(prompt);
  return data.recommendations || [];
}

async function getPersonalizedRecommendations(userReadTitles = []) {
  if (userReadTitles.length === 0) {
    return getGenreRecommendations('bestseller fiction');
  }
  const prompt = `A reader has enjoyed these books: ${userReadTitles.join(
    ', '
  )}. Suggest 6 new books they would likely enjoy next, based on patterns in their taste. For each, give title, author, and a one-line reason.`;
  const data = await callGroq(prompt);
  return data.recommendations || [];
}

async function enrichWithLocalData(recommendations) {
  const enriched = await Promise.all(
    recommendations.map(async (rec) => {
      const existing = await Book.findOne({
        title: new RegExp(`^${rec.title}$`, 'i')
      });
      return {
        ...rec,
        coverImage: existing?.coverImage || null,
        averageRating: existing?.averageRating || null,
        inDatabase: !!existing
      };
    })
  );
  return enriched;
}

const MULTILINGUAL_BOOK_KNOWLEDGE = [
  {
    keywords: ['self help', 'habit', 'habits', 'motivat', 'productive', 'focus', 'growth', 'improve', 'mindset', 'kamyab', 'safal'],
    replyHinglish: "Self-help aur personal growth ke liye yeh best practical books hain jo aapki habits aur thinking ko badal sakti hain:",
    replyHindi: "व्यक्तिगत विकास और अच्छी आदतों के निर्माण के लिए ये बेहतरीन पुस्तकें आपके जीवन को नई दिशा दे सकती हैं:",
    replyEnglish: "For personal growth, discipline, and habit formation, these transformative reads will elevate your mindset:",
    books: [
      { title: "Atomic Habits", author: "James Clear", reason: "Chhote-chhote changes kaise massive success banate hain, step-by-step framework." },
      { title: "The Psychology of Money", author: "Morgan Housel", reason: "Paison aur decisions ke peeche ka human psychology samajhne ke liye must-read." },
      { title: "Deep Work", author: "Cal Newport", reason: "Distraction-free focus ke saath high-value kaam karne ka tareeqa." }
    ]
  },
  {
    keywords: ['sci fi', 'scifi', 'science fiction', 'space', 'future', 'robot', 'ai', 'alien', 'technology', 'antariksh', 'bhavishya'],
    replyHinglish: "Sci-Fi aur mind-bending ideas ke shauqeen hain toh in futuristic masterpieces ko zaroor padhein:",
    replyHindi: "विज्ञान कथा (Sci-Fi) और भविष्य की कल्पनाओं के लिए ये कालजयी कृतियां लाजवाब हैं:",
    replyEnglish: "For visionary worldbuilding, interstellar journeys, and technological futures, dive into these sci-fi epics:",
    books: [
      { title: "Dune", author: "Frank Herbert", reason: "Desert planet Arrakis par politics, religion aur ecology ka ultimate epic." },
      { title: "Project Hail Mary", author: "Andy Weir", reason: "Thrilling space survival aur extraordinary interstellar dosti ki kahani." },
      { title: "1984", author: "George Orwell", reason: "Surveillance, totalitarian control aur truth ke baare mein eye-opening classic." }
    ]
  },
  {
    keywords: ['horror', 'scary', 'bhoot', 'ghost', 'darr', 'darawni', 'creepy', 'haunted', 'nightmare'],
    replyHinglish: "Agar aapko spine-chilling horror aur dark atmosphere pasand hai, toh yeh books aapko raat bhar jaga kar rakhengi:",
    replyHindi: "अगर आप रोंगटे खड़े कर देने वाली डरावनी और रहस्यमयी कहानियां पढ़ना चाहते हैं, तो ये किताबें पढ़ें:",
    replyEnglish: "For atmospheric dread, supernatural suspense, and chilling gothic terror, explore these iconic horror works:",
    books: [
      { title: "Dracula", author: "Bram Stoker", reason: "Transylvania ke gothic castle se shuru hone wali timeless vampire horror." },
      { title: "Frankenstein", author: "Mary Shelley", reason: "Creation, ambition aur monstrous tragedy ka dark psychological masterwork." },
      { title: "The Haunting of Hill House", author: "Shirley Jackson", reason: "Psychological terror aur haunted mansion ka benchmark novel." }
    ]
  },
  {
    keywords: ['romance', 'romantic', 'love', 'pyaar', 'prem', 'ishq', 'dil', 'heart', 'relationship', 'shadi'],
    replyHinglish: "Romance aur deep emotions ke liye yeh dil ko chhoo lene wali eternal prem kahaniyan hain:",
    replyHindi: "प्रेम, समर्पण और दिल को छू लेने वाली भावनाओं के लिए ये प्रसिद्ध प्रेम कहानियां ज़रूर पढ़ें:",
    replyEnglish: "For rich emotional intimacy, captivating chemistry, and unforgettable devotion, these romance novels stand supreme:",
    books: [
      { title: "Pride and Prejudice", author: "Jane Austen", reason: "Elizabeth Bennet aur Mr. Darcy ka witty, charming aur timeless romance." },
      { title: "Jane Eyre", author: "Charlotte Brontë", reason: "Self-respect aur profound devotion se bhari gothic love story." },
      { title: "The Song of Achilles", author: "Madeline Miller", reason: "Greek mythology ke backdrop par likhi gayi poetic aur heartbreaking love story." }
    ]
  },
  {
    keywords: ['mystery', 'thriller', 'suspense', 'detective', 'crime', 'murder', 'investigat', 'jasoos', 'rahasya', 'chor'],
    replyHinglish: "Suspense, twists aur detective sleuthing ke liye yeh sabse thrilling crime novels hain:",
    replyHindi: "जासूसी, रहस्य और रोमांच (Thriller) से भरपूर ये कहानियां अंत तक आपको बांधे रखेंगी:",
    replyEnglish: "For razor-sharp deductions, unexpected plot twists, and high-tension investigations, check out these mysteries:",
    books: [
      { title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", reason: "Sherlock Holmes aur Watson ka moorlands par ghana suspense investigation." },
      { title: "And Then There Were None", author: "Agatha Christie", reason: "Ek isolated island par 10 ajnabee aur ek mysterious killer — peak mystery!" },
      { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", reason: "Gritty Scandinavian crime investigation aur brilliant hacking sleuth." }
    ]
  },
  {
    keywords: ['philosophy', 'philosoph', 'meaning', 'life', 'zindagi', 'arth', 'meditat', 'peace', 'spiritual', 'soul'],
    replyHinglish: "Zindagi ki gehraiyon, purpose aur sukoon ko samajhne ke liye yeh philosophical gems zaroor padhein:",
    replyHindi: "जीवन के अर्थ, शांति और आत्म-चिंतन के लिए ये दार्शनिक पुस्तकें अनमोल हैं:",
    replyEnglish: "For deep contemplation, peace of mind, and the pursuit of meaning, these philosophical masterworks guide the soul:",
    books: [
      { title: "The Alchemist", author: "Paulo Coelho", reason: "Apne sapno aur personal legend ko follow karne ki magical fable." },
      { title: "Siddhartha", author: "Hermann Hesse", reason: "Gautam Buddha ke samay spiritual awakening aur self-discovery ki yatra." },
      { title: "Man's Search for Meaning", author: "Viktor E. Frankl", reason: "Sabse mushkil halaat mein bhi jeene ki wajah dhoondhne par aadharit." }
    ]
  },
  {
    keywords: ['fantasy', 'magic', 'adventure', 'jadu', 'dragon', 'sword', 'yatra', 'myth', 'wizard'],
    replyHinglish: "Magic, dragons aur breathtaking adventures ke liye yeh fantasy classics lajawab hain:",
    replyHindi: "जादुई दुनिया, असीमित कल्पनाओं और साहसिक अभियानों के लिए ये फैंटेसी किताबें बेहतरीन हैं:",
    replyEnglish: "For immersive mythical realms, ancient magic, and epic quests, these fantasy classics transport the imagination:",
    books: [
      { title: "The Hobbit", author: "J.R.R. Tolkien", reason: "Middle-earth ka cozy yet epic adventure Bilbo Baggins ke saath." },
      { title: "The Name of the Wind", author: "Patrick Rothfuss", reason: "Lyrical storytelling aur Kvothe naamak legendary wizard ki dastaan." },
      { title: "Good Omens", author: "Neil Gaiman & Terry Pratchett", reason: "Ek angel aur ek demon milkar apocalypse rokne ki koshish karte hain — hilarious fantasy!" }
    ]
  },
  {
    keywords: ['history', 'historical', 'war', 'itihas', 'revolution', 'yuddh', 'ancient', 'purana'],
    replyHinglish: "Itihas ke sabse bade moments aur wars par based yeh historical fiction books dil dehla dene wali hain:",
    replyHindi: "इतिहास के महत्वपूर्ण पन्नों और मानवीय संघर्षों पर आधारित ये ऐतिहासिक उपन्यास अत्यंत प्रभावशाली हैं:",
    replyEnglish: "For rich period immersion, wartime courage, and historical scope, these celebrated novels bring history alive:",
    books: [
      { title: "The Book Thief", author: "Markus Zusak", reason: "Nazi Germany mein ek ladki aur kitabon se uski mohabbat — narrated by Death." },
      { title: "All Quiet on the Western Front", author: "Erich Maria Remarque", reason: "First World War ki sachhai aur soldiers ki emotional tragedy." },
      { title: "A Tale of Two Cities", author: "Charles Dickens", reason: "French Revolution ke dauran London aur Paris ke prem aur balidan ki kahani." }
    ]
  },
  {
    keywords: ['hindi', 'premchand', 'bharat', 'desi', 'indian', 'sahitya', 'kahani', 'kavita', 'dinkar', 'bharti'],
    replyHinglish: "Bhartiya sahitya aur Hindi classics ke shauqeen hain toh yeh iconic works padhna must hai:",
    replyHindi: "हिंदी साहित्य और भारतीय समाज की नब्ज को समझने के लिए ये अमर रचनाएं अवश्य पढ़ें:",
    replyEnglish: "For profound Indian literary masterpieces depicting society, resilience, and human spirit, explore these gems:",
    books: [
      { title: "Godan", author: "Munshi Premchand", reason: "Bhartiya kisaan Hori ki lachaari aur samaj ka aaina dikhane wala maha-upanyas." },
      { title: "Gunahon Ka Devta", author: "Dharamvir Bharati", reason: "Chandar aur Sudha ke nishpap prem ki sabse dardnak aur khubsurat kahani." },
      { title: "Rashmirathi", author: "Ramdhari Singh Dinkar", reason: "Mahabharat ke Karna ke shaurya aur sangharsh par likha gaya tezswi kaavya." }
    ]
  },
  {
    keywords: ['comedy', 'funny', 'laugh', 'haso', 'light', 'mood', 'chuckle', 'mazedar', 'enjoy'],
    replyHinglish: "Agar mood fresh karna hai aur hasna chahte hain, toh yeh hilarious and witty books padhein:",
    replyHindi: "हल्की-फुल्की, मजेदार और चेहरे पर मुस्कान ला देने वाली किताबें:",
    replyEnglish: "For witty British satire, cosmic humor, and laugh-out-loud amusement, these comedies never fail:",
    books: [
      { title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", reason: "Space mein towel le kar bhatakne ki sabse funny cosmic comedy." },
      { title: "Three Men in a Boat", author: "Jerome K. Jerome", reason: "Thames nadi par 3 dosto aur ek kutte ki timeless comical boating trip." },
      { title: "The Code of the Woosters", author: "P.G. Wodehouse", reason: "Bertie Wooster aur genius butler Jeeves ka unmatched hilarious banter." }
    ]
  },
  {
    keywords: ['beginner', 'beginners', 'easy', 'start', 'shuru', 'simple', 'pehli', 'first'],
    replyHinglish: "Agar aap reading habit shuru kar rahe hain, toh yeh simple, engaging aur short books best rahengi:",
    replyHindi: "अगर आप किताबें पढ़ने की शुरुआत कर रहे हैं, तो ये सरल और रोचक किताबें सबसे बेहतरीन हैं:",
    replyEnglish: "If you're beginning your reading journey, these accessible, engrossing, and beautifully paced books are perfect:",
    books: [
      { title: "Animal Farm", author: "George Orwell", reason: "Short, engaging fable jisme animals farm par kabza kar lete hain." },
      { title: "The Little Prince", author: "Antoine de Saint-Exupéry", reason: "Simple bhasha mein zindagi ke sabse bade sabak dene wali magical story." },
      { title: "Tuesdays with Morrie", author: "Mitch Albom", reason: "Ek professor aur student ke beech life lessons par short aur emotional book." }
    ]
  }
];

function generateMultilingualFallback(message, language = 'auto', bookContext = '') {
  const lower = message.toLowerCase();
  const isHindiScript = /[\u0900-\u097F]/.test(message) || language === 'hi';
  const isHinglish = !isHindiScript && (
    lower.includes('mujhe') || lower.includes('batao') || lower.includes('kaun') ||
    lower.includes('kitab') || lower.includes('kaisi') || lower.includes('accha') ||
    lower.includes('padhna') || lower.includes('padhni') || lower.includes('kya') ||
    lower.includes('hai') || lower.includes('yaar') || lower.includes('dost') ||
    lower.includes('karo') || lower.includes('karna') || lower.includes('bhai')
  );

  if (bookContext) {
    if (isHindiScript) {
      return {
        reply: `इस किताब / दस्तावेज के संदर्भ में: प्रस्तुत अंश मुख्य विचारों और पात्रों की स्थिति को दर्शाता है। क्या आप इसके किसी खास पहलू या अध्याय के बारे में पूछना चाहते हैं?`,
        books: []
      };
    }
    if (isHinglish) {
      return {
        reply: `Is book / document ke context mein: Yeh text kahani ke main themes aur characters ke baare mein batata hai. Aap iske plot, summary ya kisi specific line ke baare mein kya discuss karna chahte hain?`,
        books: []
      };
    }
    return {
      reply: `Regarding this book / document excerpt: The passage establishes the central themes and character dynamics. What specific chapter, motif, or question would you like to explore?`,
      books: []
    };
  }

  // Find matching category based on keywords
  for (const item of MULTILINGUAL_BOOK_KNOWLEDGE) {
    const match = item.keywords.some(kw => lower.includes(kw));
    if (match) {
      let reply = item.replyEnglish;
      if (isHindiScript) reply = item.replyHindi;
      else if (isHinglish) reply = item.replyHinglish;

      return {
        reply,
        books: item.books
      };
    }
  }

  // Default fallback if no specific keyword matched
  if (isHindiScript) {
    return {
      reply: `नमस्ते! मैं बुकवाइज़ एआई हूँ — आपकी बहुभाषी (Multilingual) साहित्यिक मार्गदर्शिका। आप मुझसे किसी भी विधा (रोमांस, सस्पेंस, दर्शन, क्लासिक, या सेल्फ-हेल्प) के बारे में पूछ सकते हैं!`,
      books: [
        { title: "Godan", author: "Munshi Premchand", reason: "भारतीय साहित्य का कालजयी महाउपन्यास।" },
        { title: "The Alchemist", author: "Paulo Coelho", reason: "जीवन में अपने सपनों को साकार करने की प्रेरणादायक कथा।" }
      ]
    };
  }

  if (isHinglish) {
    return {
      reply: `Main aapki multilingual book concierge hoon! Aap mujhse kisi bhi genre ke baare mein pooch sakte hain — jaise Romance, Mystery, Sci-Fi, Self-Help, ya Indian Classics. Yeh kuch timeless books hain jinhe aap explore kar sakte hain:`,
      books: [
        { title: "To Kill a Mockingbird", author: "Harper Lee", reason: "Insaaniyat aur himmat ki dil ko chhoo lene wali kahani." },
        { title: "Atomic Habits", author: "James Clear", reason: "Apni daily habits ko transform karke kamyabi pane ka guide." }
      ]
    };
  }

  return {
    reply: `Hello! I am BookWise AI, your multilingual reading companion. Tell me what kind of book, author, or feeling you're curious about, and I'll find the perfect match for you!`,
    books: [
      { title: "The Great Gatsby", author: "F. Scott Fitzgerald", reason: "An evocative masterpiece exploring longing, ambition, and the Jazz Age." },
      { title: "Project Hail Mary", author: "Andy Weir", reason: "An exhilarating, heartwarming tale of space survival and ingenuity." }
    ]
  };
}

async function chatWithBookWise({ message, history = [], language = 'auto', bookContext = '' }) {
  const systemPrompt = `You are BookWise AI, a deeply cultured, warm, and insightful multilingual literary companion and book recommendation concierge.
You fluently understand and speak multiple languages: English, Hindi, Hinglish, Spanish, French, German, and others.
- CRITICAL LANGUAGE RULE: 
  * If the user speaks or writes in Hinglish (e.g. "mujhe horror novel batao", "kaisi kitab hai yeh", "koi achhi book recommend karo"), ALWAYS reply in friendly, conversational, natural Hinglish.
  * If the user writes in Hindi (देवनागरी), reply in fluent, respectful Hindi.
  * If the user writes in English, reply in eloquent English.
  * Always mirror the user's natural language style!
- When suggesting books, provide 2 to 3 great book recommendations in bold (**Title** by Author) with a brief, compelling description.
- If bookContext is provided, treat it as the text of the book/document the user is reading and answer questions accurately from that text.
- Keep replies engaging, warm, and readable (under 250 words unless asked for a detailed summary).`;

  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  if (bookContext) {
    messages.push({
      role: 'system',
      content: `BOOK / DOCUMENT TEXT CONTEXT:
${bookContext.slice(0, 3500)}`
    });
  }

  if (Array.isArray(history)) {
    history.slice(-6).forEach(h => {
      messages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text || ''
      });
    });
  }

  messages.push({ role: 'user', content: message });

  const apiKey = getApiKey();
  if (apiKey) {
    const models = getCandidateModels();
    for (const model of models) {
      try {
        const response = await axios.post(
          GROQ_API_URL,
          {
            model,
            messages,
            temperature: 0.7,
            max_tokens: 700
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
        const reply = response.data.choices?.[0]?.message?.content?.trim();
        if (reply) {
          // 1. Check keyword matches from curated knowledge base
          const lower = message.toLowerCase();
          let matchedBooks = [];
          for (const item of MULTILINGUAL_BOOK_KNOWLEDGE) {
            if (item.keywords.some(kw => lower.includes(kw))) {
              matchedBooks = item.books;
              break;
            }
          }

          // 2. If no knowledge-base keyword matched, extract bold books from Groq's own reply
          if (matchedBooks.length === 0) {
            const bookRegex = /\*\*([^*]+)\*\*(?:\s*(?:by|—|-|:)\s*([^*\n.,]+))?/g;
            let match;
            const seenTitles = new Set();
            while ((match = bookRegex.exec(reply)) !== null && matchedBooks.length < 3) {
              const title = match[1].trim();
              const author = (match[2] || 'Acclaimed Author').trim();
              const skipWords = ['note', 'tip', 'warning', 'important', 'bookwise', 'ai', 'namaste', 'hello'];
              if (title.length > 2 && !seenTitles.has(title.toLowerCase()) && !skipWords.includes(title.toLowerCase())) {
                seenTitles.add(title.toLowerCase());
                matchedBooks.push({
                  title,
                  author,
                  reason: "AI recommended based on your preferences."
                });
              }
            }
          }

          return {
            reply,
            books: matchedBooks
          };
        }
      } catch (err) {
        console.warn(`Groq chat error with model ${model}:`, err.response?.data?.error?.message || err.message);
      }
    }
  }

  return generateMultilingualFallback(message, language, bookContext);
}

export {
  SUPPORTED_MOODS,
  getGenreRecommendations,
  getMoodRecommendations,
  getGenreAndMoodRecommendations,
  getSimilarBooks,
  getPersonalizedRecommendations,
  enrichWithLocalData,
  chatWithBookWise
};