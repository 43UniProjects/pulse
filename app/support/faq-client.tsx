'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { SerializedFaq } from './data';

interface FaqClientProps {
  initialFaqs: SerializedFaq[];
}

export default function FaqClient({ initialFaqs }: FaqClientProps) {
  const [query, setQuery] = useState('');

  // Filter FAQs based on real-time search input
  const filteredFaqs = initialFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(query.toLowerCase()) ||
      faq.answer.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="w-full">
      {/* Functional Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search for answers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-12 pl-11 pr-4 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all shadow-sm"
        />
      </div>

      {/* Filtered FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-muted-foreground text-center p-8 bg-card border border-border rounded-lg">
            No matching FAQs found for &quot;{query}&quot;.
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div
              key={faq._id}
              className="p-6 rounded-lg border border-border bg-card transition-colors hover:border-foreground/20"
            >
              <h4 className="font-medium text-foreground mb-2">
                {faq.question}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
