import React, { useEffect, useState } from 'react';
import { apiGet } from '@/providers/apiRequest';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import ListView from '../list/ListView';
import CreateListForm from '../list/CreateListForm';

interface Board {
  id: string;
  title: string;
}

interface List {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
}

interface BoardViewProps {
  boardId: string;
}

export default function BoardView({ boardId }: BoardViewProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        setIsLoading(true);
        const boardData = await apiGet(`/api/v1/boards/${boardId}/`);
        setBoard(boardData);
        
        const listsData = await apiGet(`/api/v1/boards/${boardId}/lists/`);
        // Sort lists by order
        setLists(listsData.sort((a: List, b: List) => a.order - b.order));
        
        setError(null);
      } catch (err) {
        console.error('Error fetching board data:', err);
        setError('Failed to load board');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();
  }, [boardId]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;
    
    // Dropped outside the list
    if (!destination) return;
    
    // No movement
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    // Handle list reordering
    if (type === 'list') {
      const reorderedLists = [...lists];
      const [movedList] = reorderedLists.splice(source.index, 1);
      reorderedLists.splice(destination.index, 0, movedList);
      
      // Update order property
      const updatedLists = reorderedLists.map((list, index) => ({
        ...list,
        order: index
      }));
      
      setLists(updatedLists);
      
      // Update backend
      try {
        await apiPost(`/api/v1/lists/${movedList.id}/reorder/`, {
          order: destination.index
        });
      } catch (err) {
        console.error('Error updating list order:', err);
        // Revert to previous state on error
      }
      
      return;
    }
    
    // Handle card reordering
    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;
    
    // Copy lists
    const newLists = [...lists];
    
    // Find source and destination lists
    const sourceList = newLists.find(list => list.id === sourceListId);
    const destList = newLists.find(list => list.id === destListId);
    
    if (!sourceList || !destList) return;
    
    // Moving within the same list
    if (sourceListId === destListId) {
      const reorderedCards = [...sourceList.cards];
      const [movedCard] = reorderedCards.splice(source.index, 1);
      reorderedCards.splice(destination.index, 0, movedCard);
      
      // Update order property
      const updatedCards = reorderedCards.map((card, index) => ({
        ...card,
        order: index
      }));
      
      sourceList.cards = updatedCards;
      setLists(newLists);
      
      // Update backend
      try {
        await apiPost(`/api/v1/cards/${movedCard.id}/reorder/`, {
          listId: sourceListId,
          order: destination.index
        });
      } catch (err) {
        console.error('Error updating card order:', err);
      }
    } else {
      // Moving to another list
      const sourceCards = [...sourceList.cards];
      const destCards = [...destList.cards];
      
      const [movedCard] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedCard);
      
      // Update order property
      sourceList.cards = sourceCards.map((card, index) => ({
        ...card,
        order: index
      }));
      
      destList.cards = destCards.map((card, index) => ({
        ...card,
        order: index
      }));
      
      setLists(newLists);
      
      // Update backend
      try {
        await apiPost(`/api/v1/cards/${movedCard.id}/move/`, {
          sourceListId,
          destListId,
          order: destination.index
        });
      } catch (err) {
        console.error('Error moving card between lists:', err);
      }
    }
  };

  if (isLoading) return <div className="p-6">Loading board...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!board) return <div className="p-6">Board not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{board.title}</h1>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex overflow-x-auto pb-8">
          {lists.map((list, index) => (
            <ListView 
              key={list.id} 
              list={list} 
              index={index}
            />
          ))}
          
          <CreateListForm boardId={boardId} onListCreated={(newList) => {
            setLists([...lists, newList]);
          }} />
        </div>
      </DragDropContext>
    </div>
  );
}