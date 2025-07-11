import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { StateCreator, StoreApi } from 'zustand';

// debounce-утилита
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

const STORAGE_KEY = 'hr-crm-editor-pages-v1';

export interface Component {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  props: Record<string, any>;
  children?: Component[];
}

export interface Page {
  id: string;
  name: string;
  components: Component[];
  background?: string;
  gridEnabled?: boolean;
  gridSize?: number;
}

export interface PagesState {
  pages: Page[];
  activePageId: string | null;
  selectedComponentId: string | null;
  isDirty: boolean;
  isSaved: boolean;
  isModalOpen: boolean;
  
  // Actions
  setPages: (pages: Page[]) => void;
  setActivePage: (pageId: string) => void;
  setSelectedComponent: (componentId: string | null) => void;
  setDirty: (dirty: boolean) => void;
  setSaved: (saved: boolean) => void;
  setModalOpen: (isOpen: boolean) => void;
  
  // Page management
  addPage: (name: string) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  renamePage: (pageId: string, newName: string) => void;
  
  // Component management
  addComponent: (pageId: string, component: Omit<Component, 'id'>) => void;
  updateComponent: (pageId: string, componentId: string, updates: Partial<Component>) => void;
  deleteComponent: (pageId: string, componentId: string) => void;
  moveComponent: (pageId: string, componentId: string, x: number, y: number) => void;
  duplicateComponent: (pageId: string, componentId: string) => void;
  
  // Utility
  getActivePage: () => Page | null;
  getSelectedComponent: () => Component | null;
  getComponentById: (pageId: string, componentId: string) => Component | null;
  saveToStorage: () => void;
  loadFromStorage: () => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const saveStateToStorage = debounce((pages: Page[], activePageId: string | null) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ pages, activePageId })
  );
}, 1000);

const loadStateFromStorage = (): { pages: Page[]; activePageId: string | null } | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// --- Undo/Redo middleware ---
function withHistory<T extends PagesState>(config: StateCreator<T, [], [], T>): StateCreator<T, [], [], T> {
  return (set, get, api) => {
    let undoStack: Array<{ pages: Page[]; activePageId: string | null; selectedComponentId: string | null }> = [];
    let redoStack: Array<{ pages: Page[]; activePageId: string | null; selectedComponentId: string | null }> = [];
    const maxHistory = 50;

    // Обёртка над set для отслеживания изменений
    const wrapSet: typeof set = (partial, replace) => {
      const prev = get();
      let nextState: Partial<T> = {};
      if (typeof partial === 'function') {
        nextState = partial(prev);
      } else {
        nextState = partial;
      }
      // Если изменились pages/activePageId/selectedComponentId — сохраняем историю
      if (
        nextState.pages !== undefined ||
        nextState.activePageId !== undefined ||
        nextState.selectedComponentId !== undefined
      ) {
        undoStack.push({
          pages: JSON.parse(JSON.stringify(prev.pages)),
          activePageId: prev.activePageId,
          selectedComponentId: prev.selectedComponentId,
        });
        if (undoStack.length > maxHistory) undoStack.shift();
        redoStack = [];
      }
      set(partial, false);
    };

    const undo = () => {
      if (undoStack.length === 0) return;
      const state = get();
      redoStack.push({
        pages: JSON.parse(JSON.stringify(state.pages)),
        activePageId: state.activePageId,
        selectedComponentId: state.selectedComponentId,
      });
      const prev = undoStack.pop();
      set({
        pages: prev!.pages,
        activePageId: prev!.activePageId,
        selectedComponentId: prev!.selectedComponentId,
        isDirty: true,
        isSaved: false,
      } as Partial<T>);
    };

    const redo = () => {
      if (redoStack.length === 0) return;
      const state = get();
      undoStack.push({
        pages: JSON.parse(JSON.stringify(state.pages)),
        activePageId: state.activePageId,
        selectedComponentId: state.selectedComponentId,
      });
      const next = redoStack.pop();
      set({
        pages: next!.pages,
        activePageId: next!.activePageId,
        selectedComponentId: next!.selectedComponentId,
        isDirty: true,
        isSaved: false,
      } as Partial<T>);
    };

    const store = config(wrapSet, get, api);
    return {
      ...store,
      undo,
      redo,
      canUndo: () => undoStack.length > 0,
      canRedo: () => redoStack.length > 0,
    };
  };
}

export const usePagesStore = create<PagesState>()(
  devtools(
    withHistory((set, get) => ({
      pages: [],
      activePageId: null,
      selectedComponentId: null,
      isDirty: false,
      isSaved: true,
      isModalOpen: false,
      
      setPages: (pages) => set({ pages, isDirty: true, isSaved: false }),
      setActivePage: (pageId) => {
        set({ activePageId: pageId, isDirty: true, isSaved: false });
        saveStateToStorage(get().pages, pageId); // моментальное сохранение активной вкладки
      },
      setSelectedComponent: (componentId) => set({ selectedComponentId: componentId }),
      setDirty: (dirty) => set({ isDirty: dirty }),
      setSaved: (saved) => set({ isSaved: saved }),
      setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
      
      addPage: (name) => {
        const newPage: Page = {
          id: `page_${Date.now()}`,
          name,
          components: [],
          background: '#ffffff',
          gridEnabled: true,
          gridSize: 10,
        };
        
        set((state) => {
          const pages = [...state.pages, newPage];
          saveStateToStorage(pages, newPage.id);
          return {
            pages,
            activePageId: newPage.id,
            isDirty: true,
            isSaved: false,
          };
        });
      },
      
      updatePage: (pageId, updates) => {
        set((state) => {
          const pages = state.pages.map((page) =>
            page.id === pageId ? { ...page, ...updates } : page
          );
          saveStateToStorage(pages, state.activePageId);
          return { pages, isDirty: true, isSaved: false };
        });
      },
      
      deletePage: (pageId) => {
        set((state) => {
          const newPages = state.pages.filter((page) => page.id !== pageId);
          const newActivePageId = state.activePageId === pageId 
            ? (newPages.length > 0 ? newPages[0].id : null)
            : state.activePageId;
            
          saveStateToStorage(newPages, newActivePageId);
          return {
            pages: newPages,
            activePageId: newActivePageId,
            selectedComponentId: null,
            isDirty: true,
            isSaved: false,
          };
        });
      },
      
      renamePage: (pageId, newName) => {
        get().updatePage(pageId, { name: newName });
      },
      
      addComponent: (pageId, componentData) => {
        const component: Component = {
          id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          width: componentData.width || 300,
          height: componentData.height || 200,
          ...componentData,
        };
        
        set((state) => {
          const pages = state.pages.map((page) =>
            page.id === pageId
              ? { ...page, components: [...page.components, component] }
              : page
          );
          saveStateToStorage(pages, state.activePageId);
          return {
            pages,
            selectedComponentId: component.id,
            isDirty: true,
            isSaved: false,
          };
        });
      },
      
      updateComponent: (pageId, componentId, updates) => {
        set((state) => {
          const pages = state.pages.map((page) =>
            page.id === pageId
              ? {
                  ...page,
                  components: page.components.map((comp) =>
                    comp.id === componentId ? { ...comp, ...updates } : comp
                  ),
                }
              : page
          );
          saveStateToStorage(pages, state.activePageId);
          return { pages, isDirty: true, isSaved: false };
        });
      },
      
      deleteComponent: (pageId, componentId) => {
        set((state) => {
          const pages = state.pages.map((page) =>
            page.id === pageId
              ? {
                  ...page,
                  components: page.components.filter((comp) => comp.id !== componentId),
                }
              : page
          );
          saveStateToStorage(pages, state.activePageId);
          return {
            pages,
            selectedComponentId: state.selectedComponentId === componentId ? null : state.selectedComponentId,
            isDirty: true,
            isSaved: false,
          };
        });
      },
      
      moveComponent: (pageId, componentId, x, y) => {
        get().updateComponent(pageId, componentId, { x, y });
      },
      
      duplicateComponent: (pageId, componentId) => {
        const state = get();
        const component = state.getComponentById(pageId, componentId);
        
        if (component) {
          const duplicatedComponent: Omit<Component, 'id'> = {
            ...component,
            x: component.x + 20,
            y: component.y + 20,
          };
          
          state.addComponent(pageId, duplicatedComponent);
        }
      },
      
      getActivePage: () => {
        const state = get();
        return state.pages.find((page) => page.id === state.activePageId) || null;
      },
      
      getSelectedComponent: () => {
        const state = get();
        const activePage = state.getActivePage();
        if (!activePage || !state.selectedComponentId) return null;
        
        return activePage.components.find((comp) => comp.id === state.selectedComponentId) || null;
      },
      
      getComponentById: (pageId, componentId) => {
        const state = get();
        const page = state.pages.find((p) => p.id === pageId);
        return page?.components.find((comp) => comp.id === componentId) || null;
      },
      
      saveToStorage: () => {
        const state = get();
        saveStateToStorage(state.pages, state.activePageId);
        set({ isDirty: false, isSaved: true });
      },
      
      loadFromStorage: () => {
        const loaded = loadStateFromStorage();
        if (loaded && loaded.pages.length > 0) {
          // Миграция: добавляем значения по умолчанию для сетки для старых страниц
          const migratedPages = loaded.pages.map(page => ({
            ...page,
            gridEnabled: page.gridEnabled ?? true,
            gridSize: page.gridSize ?? 10,
            background: page.background ?? '#ffffff',
          }));
          
          // Проверяем, что activePageId существует в загруженных страницах
          const validActivePageId = loaded.activePageId && 
            migratedPages.some(page => page.id === loaded.activePageId) 
            ? loaded.activePageId 
            : migratedPages[0].id;
          
          set({ pages: migratedPages, activePageId: validActivePageId, isDirty: false, isSaved: true });
        } else {
          // Создаем первую страницу по умолчанию с дашборд-виджетом
          const defaultDashboardComponent: Component = {
            id: `comp_dashboard_${Date.now()}`,
            type: 'dashboard',
            x: 40,
            y: 40,
            width: 600,
            height: 300,
            props: {},
          };
          const defaultPage: Page = {
            id: `page_${Date.now()}`,
            name: 'Главная страница',
            components: [defaultDashboardComponent],
            background: '#ffffff',
            gridEnabled: true,
            gridSize: 10,
          };
          set({ 
            pages: [defaultPage], 
            activePageId: defaultPage.id, 
            isDirty: false, 
            isSaved: true 
          });
          saveStateToStorage([defaultPage], defaultPage.id);
        }
      },
      
      undo: () => {
        get().undo();
      },
      
      redo: () => {
        get().redo();
      },
      
      canUndo: () => {
        return get().canUndo();
      },
      
      canRedo: () => {
        return get().canRedo();
      },
    })),
    {
      name: 'pages-store',
    }
  )
);

// При инициализации store — загрузить из localStorage
usePagesStore.getState().loadFromStorage(); 