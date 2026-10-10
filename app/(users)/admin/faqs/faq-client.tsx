'use client';

import { useState, useActionState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, X } from 'lucide-react';
import { addFaq, updateFaq, deleteFaq, FaqActionState } from './actions';
import { toast } from 'sonner';

type FaqData = {
  _id: string;
  question: string;
  answer: string;
};

export default function FaqClient({ initialFaqs }: { initialFaqs: FaqData[] }) {
  const [faqs, setFaqs] = useState<FaqData[]>(initialFaqs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqData | null>(null);

  const [state, formAction, isPending] = useActionState<
    FaqActionState,
    FormData
  >(editingFaq ? updateFaq : addFaq, {});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFaqs(initialFaqs);
  }, [initialFaqs]);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsModalOpen(false);

      setEditingFaq(null);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      const result = await deleteFaq(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    }
  };

  const openAddModal = () => {
    setEditingFaq(null);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FaqData) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Existing FAQs</h2>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>

        {faqs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-secondary/30 rounded-lg border border-dashed border-border">
            No FAQs found. Add one to get started.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <div
                key={faq._id}
                className="p-4 border border-border rounded-lg bg-background hover:border-primary/30 transition-colors group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(faq)}
                      className="p-2 text-muted-foreground hover:text-primary bg-secondary rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="p-2 text-muted-foreground hover:text-red-500 bg-secondary rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="font-semibold text-xl">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={formAction} className="p-6 flex flex-col gap-4">
              {editingFaq && (
                <input type="hidden" name="id" value={editingFaq._id} />
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Question</label>
                <input
                  type="text"
                  name="question"
                  defaultValue={editingFaq?.question || ''}
                  required
                  placeholder="e.g. How can I register?"
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Answer</label>
                <textarea
                  name="answer"
                  defaultValue={editingFaq?.answer || ''}
                  required
                  rows={4}
                  placeholder="e.g. You can register by clicking the Register button..."
                  className="w-full p-3 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                />
              </div>

              {state?.error && (
                <div className="flex items-start gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{state.error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {editingFaq ? 'Update FAQ' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
