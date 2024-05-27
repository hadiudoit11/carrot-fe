'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Article } from '@/types';

function classNames(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function ArticleSnapshot() {
  const { data: session, status } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    async function fetchData(token: string) {
      const response = await fetch('http://localhost:8000/api/v1/articles/list/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-cache',
    

      });
      console.log(token)
      console.log('Request Headers:', Headers);
      console.log('Request Method:', 'GET');
      
      if (!response.ok) {
        console.error('Failed to fetch data', response.status, response.statusText);
        return null;
      }

      return response.json();
    }

    async function getData() {
      if (session?.accessToken) {
        const data = await fetchData(session.accessToken);
        if (data && Array.isArray(data.posts)) {
          setArticles(data.posts);
          console.log(data.posts)
        } else {
          console.error('Fetched data is not an array:', data);
        }
      } else {
        console.error('No access token found in session');
      }
    }

    if (status === 'authenticated') {
      getData();
    }
  }, [session, status]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="bg-gray-100 px-8 pb-20 pt-16 lg:px-8 lg:pb-8 lg:pt-8 rounded-lg ml-8">
      <div className="relative mx-auto max-w-lg divide-y-2 divide-gray-200 lg:max-w-7xl">
        <div className="mt-4 grid gap-10 pt-2 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12">
          {articles.map((article: Article) => (
            <div key={article.name}>
              <div className="inline-block">
                <span
                  className={classNames(
                    article.category.color,
                    'inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium'
                  )}
                >
                  {article.category.name}
                </span>
              </div>
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0">
                  <a>
                    <span className="sr-only">{article.author.name}</span>
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={article.author.imageUrl}
                      alt={article.author.name}
                      height={40}
                      width={40}
                    />
                  </a>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{article.author.name}</p>
                  <div className="flex space-x-1 text-sm text-gray-500">
                    <time dateTime={article.date_time}>{article.date}</time>
                    <span aria-hidden="true">&middot;</span>
                    <span>{article.reading_time} read</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}