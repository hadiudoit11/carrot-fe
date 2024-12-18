import React from 'react';

interface Article {
    id: number;
    title: string;
    description: string;
}

const articles: Article[] = [
    { id: 1, title: 'Article 1', description: 'Description for article 1' },
    { id: 2, title: 'Article 2', description: 'Description for article 2' },
    { id: 3, title: 'Article 3', description: 'Description for article 3' },
    // Add more articles as needed
];

const ArticlesGridList: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {articles.map((article) => (
                    <div key={article.id} className="p-4 border rounded shadow-sm">
                        <h2 className="text-xl font-bold mb-2">{article.title}</h2>
                        <p>{article.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ArticlesGridList;