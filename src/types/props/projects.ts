export interface Board {
    id: string;
    title: string;
    createdAt: string;
  }
  
  export interface List {
    id: string;
    boardId: string;
    title: string;
    order: number;
    cards: Card[];
  }
  
  export interface Card {
    id: string;
    listId: string;
    title: string;
    description?: string;
    order: number;
  }