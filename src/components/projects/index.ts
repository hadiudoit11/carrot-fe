// Export types
export interface Post {
  id: string;
  title: string;
  content?: string;
  status: string;
  index: number;
}

// Export components
export { PostList } from './PostList';
export { PostListContent } from './PostListContent';
export { PostColumn } from './PostColumn';
export { PostCard } from './PostCard';

// Export utilities
export { 
  statuses, 
  statusNames, 
  getPostsByStatus, 
  type PostsByStatus 
} from './statuses'; 