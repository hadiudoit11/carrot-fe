import Image from 'next/image'
import { useEffect, useState } from 'react';


const posts = [
    { 
        name: 'Total Subscribers', 
        stat: '71,897', 
        href: '#',
        description: 'loremp ipsum dolor loremp ipsum dolor', 
        previousStat: '70,946', 
        change: '12%',
        changeType: 'increase', 
        date_time: 'Aug 4',
        date: 'Aug 4',
        reading_time:'6 min',
        author: {
            name: 'John D',
            imageUrl: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=48&h=48&q=80',
        },
        category: { name: 'Engineering', color: 'bg-indigo-100' },
    },
    { 
        name: 'Total Subscribers', 
        stat: '71,897', 
        href: '#',
        description: 'loremp ipsum dolor loremp ipsum dolor', 
        previousStat: '70,946', 
        change: '12%',
        changeType: 'increase', 
        date_time: 'Aug 4',
        date: 'Aug 4',
        reading_time:'6 min',
        author: {
            name: 'John D',
            imageUrl: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=48&h=48&q=80',
        },
        category: { name: 'Engineering', color: 'bg-indigo-100' },
    },
    { 
        name: 'Total Subscribers', 
        stat: '71,897', 
        href: '#',
        description: 'loremp ipsum dolor loremp ipsum dolor', 
        previousStat: '70,946', 
        change: '12%',
        changeType: 'increase', 
        date_time: 'Aug 4',
        date: 'Aug 4',
        reading_time:'6 min',
        author: {
            name: 'John D',
            imageUrl: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=48&h=48&q=80',
        },
        category: { name: 'Engineering', color: 'bg-indigo-100' },
    }
    
  ]

function classNames(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  name: string;
}

interface Posts {
  id: number;
  title: string;
  description: string;
  slug: string;
  created_at: string;
  updated_at: string;
  author: User | null;
  category: string;
  logo: string;
}
// async function getData() {
//   const response = await fetch('http://127.0.0.1:8000/api/campaigns', {cache: "no-cache"})
//   return response.json()
// }

export default async function ArticleSnapshot() {
  
//   const data = await getData()
//   console.log(data)

  return (
    <div className="bg-gray-100 px-8 pb-20 pt-16 lg:px-8 lg:pb-8 lg:pt-8 rounded-lg ml-8">
      <div className="relative mx-auto max-w-lg divide-y-2 divide-gray-200 lg:max-w-7xl">
        <div className="mt-4 grid gap-10 pt-2 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12">
          {posts.map((post) => (
            <div key={post.name}>
              <div className="inline-block">
   
                  <span
                    className={classNames(
                      post.category.color,
                      'inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium'
                    )}
                  >
                    {post.category.name}
                  </span>
    
              </div>
              {/* <a href={post.href} className="mt-4 block">
                <p className="text-xl font-semibold text-gray-900">{post.name}</p>
                <p className="mt-3 text-base text-gray-500">{post.description}</p>
              </a> */}
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0">
                  <a>
                    <span className="sr-only">line 64</span>
                    {/* <Image
                      className="h-10 w-10 rounded-full"
                      src={post.author.imageUrl}
                      alt=""
                      height={40}
                      width={40} /> */}
                  </a>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {post.author?.name}
                  </p>
                  <div className="flex space-x-1 text-sm text-gray-500">
                    <time dateTime={post.date_time}>{post.date}</time>
                    <span aria-hidden="true">&middot;</span>
                    <span>{post.reading_time} read</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}