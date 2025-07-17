import { useEffect, useState } from 'react';
import { apiGet } from '@/providers/apiRequest';

export interface Post {
  id: string;
  title: string;
  content?: string;
  status: string;
  index: number;
}

export type PostsByStatus = Record<string, Post[]>;

// Fetch organization-specific statuses using the correct endpoint
export const useOrgProjectStatuses = () => {
  const [statuses, setStatuses] = useState<string[]>([]);
  const [statusNames, setStatusNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        // Use the correct API endpoint to fetch statuses
        const response = await apiGet(`${backendURL}/api/v1/project/status/`);
        console.log('Status API response:', response);
        
        if (Array.isArray(response) && response.length > 0) {
          // Extract status values and display names
          const statusValues = response.map(status => status.id || status.type);
          
          // Create a mapping of status values to display names
          const nameMapping = response.reduce((acc, status) => {
            acc[status.id || status.type] = status.name;
            return acc;
          }, {} as Record<string, string>);
          
          setStatuses(statusValues);
          setStatusNames(nameMapping);
        } else {
          console.warn('Status API returned empty array or invalid format, using fallback statuses');
          // Fallback to basic statuses if response format is invalid or empty
          setStatuses(['todo', 'inProgress', 'review', 'done']);
          setStatusNames({
            todo: 'To Do',
            inProgress: 'In Progress', 
            review: 'Review',
            done: 'Done'
          });
        }
      } catch (err) {
        console.error('Error fetching statuses:', err);
        // Fallback to default statuses
        setStatuses(['todo', 'inProgress', 'review', 'done']);
        setStatusNames({
          todo: 'To Do',
          inProgress: 'In Progress',
          review: 'Review',
          done: 'Done'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  return { statuses, statusNames, loading, error };
};

// Function to organize posts by status
export const getPostsByStatus = (unorderedPosts: Post[], availableStatuses: string[]) => {
  console.log('getPostsByStatus called with:', { unorderedPosts, availableStatuses });
  
  if (!unorderedPosts || !Array.isArray(unorderedPosts) || !availableStatuses || !Array.isArray(availableStatuses)) {
    console.warn('Invalid inputs to getPostsByStatus:', { unorderedPosts, availableStatuses });
    return {} as PostsByStatus;
  }

  // Initialize with empty arrays for all statuses
  const postsByStatus: PostsByStatus = availableStatuses.reduce(
    (obj, status) => ({ ...obj, [status]: [] }),
    {} as PostsByStatus
  );
  
  console.log('Initial postsByStatus:', postsByStatus);
  
  // Add posts to their respective status arrays
  unorderedPosts.forEach(post => {
    console.log('Processing post:', post);
    if (post && post.status) {
      console.log(`Post ${post.id} has status: ${post.status}`);
      // If the status exists in our status list, add the post
      if (availableStatuses.includes(post.status)) {
        console.log(`Adding post ${post.id} to status: ${post.status}`);
        postsByStatus[post.status].push(post);
      } else if (availableStatuses.length > 0) {
        // If status doesn't exist, add to first available status
        console.log(`Post ${post.id} status "${post.status}" not found, adding to first available status: ${availableStatuses[0]}`);
        postsByStatus[availableStatuses[0]].push({
          ...post,
          status: availableStatuses[0]
        });
      }
    } else {
      console.warn('Post missing or has no status:', post);
    }
  });
  
  // Sort each status column by index
  Object.keys(postsByStatus).forEach(status => {
    if (Array.isArray(postsByStatus[status])) {
      postsByStatus[status].sort((a, b) => a.index - b.index);
    }
  });
  
  console.log('Final postsByStatus:', postsByStatus);
  return postsByStatus;
};