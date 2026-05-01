import '@testing-library/jest-dom';

// Mock do Next/Navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    entries: jest.fn(() => []),
  }),
  usePathname: () => '',
  useParams: () => ({ barberId: '123' }),
}));

// Mock Global do Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

// Mocks de Auth e Firestore como jest.fn() para permitir AAA nos testes
const mockSignIn = jest.fn();
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signInWithEmailAndPassword: mockSignIn,
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  setDoc: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDoc: jest.fn(),
  collectionGroup: jest.fn(),
}));

// Mock do Genkit / AI Actions
jest.mock('@/ai/flows/style-recommendation', () => ({
  recommendStyle: jest.fn(() => Promise.resolve({
    hairstyleRecommendation: 'Corte Undercut',
    styleDescription: 'Um corte moderno e versátil recomendado pela nossa IA.',
  })),
}));

// Centralizando o mock do useUser para permitir override dinâmico nos testes
export const mockUseUser = jest.fn(() => ({
  user: { 
    uid: 'test-uid', 
    email: 'teste@uscs.edu.br',
    getIdTokenResult: jest.fn(() => Promise.resolve({ claims: {} }))
  },
  isUserLoading: false,
  isBarber: false,
  profileData: { name: 'Usuário Teste' },
}));

jest.mock('@/firebase', () => ({
  useUser: mockUseUser,
  useFirestore: () => ({}),
  useAuth: () => ({}),
  setDocumentNonBlocking: jest.fn(),
  deleteDocumentNonBlocking: jest.fn(),
  addDocumentNonBlocking: jest.fn(),
}));

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
