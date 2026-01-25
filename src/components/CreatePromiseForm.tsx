import React, { useState } from 'react';
import { useCreatePromise } from '@/hooks/usePromises';
import { format, addDays } from 'date-fns';

const CreatePromiseForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<7 | 14 | 30 | 'custom'>(7);
  const [customDays, setCustomDays] = useState('');
  const [error, setError] = useState('');

  const createPromise = useCreatePromise();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('A promise requires words. Write them.');
      return;
    }

    const days = duration === 'custom' ? parseInt(customDays) : duration;
    if (!days || days < 1 || days > 365) {
      setError('Duration must be between 1 and 365 days.');
      return;
    }

    const endDate = format(addDays(new Date(), days - 1), 'yyyy-MM-dd');

    try {
      await createPromise.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        end_date: endDate,
      });

      setTitle('');
      setDescription('');
      setDuration(7);
      setCustomDays('');
      setIsOpen(false);
    } catch (err) {
      setError('Failed to create promise. Try again.');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full glass-card p-6 border-dashed hover:border-primary transition-colors text-left group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-border group-hover:border-primary flex items-center justify-center transition-colors">
            <span className="text-2xl text-muted-foreground group-hover:text-primary transition-colors">+</span>
          </div>
          <div>
            <p className="font-medium group-hover:text-primary transition-colors">
              Make a New Promise
            </p>
            <p className="text-sm text-muted-foreground">
              Commit to something. Mean it.
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="glass-card p-6 border-l-2 border-l-primary">
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
        New Commitment
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm mb-2">
            What do you promise to do?
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-input border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            placeholder="I will train every day"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">
            Why does this matter? (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-input border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none h-20"
            placeholder="Because my future self deserves it"
          />
        </div>

        <div>
          <label className="block text-sm mb-3">
            Duration
          </label>
          <div className="grid grid-cols-4 gap-2">
            {([7, 14, 30, 'custom'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`py-2 text-sm font-mono transition-colors ${
                  duration === d
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-input border border-border hover:border-primary'
                }`}
              >
                {d === 'custom' ? 'Custom' : `${d} days`}
              </button>
            ))}
          </div>

          {duration === 'custom' && (
            <input
              type="number"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              className="w-full mt-2 bg-input border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="Number of days (1-365)"
              min="1"
              max="365"
            />
          )}
        </div>

        {error && (
          <div className="p-4 border border-destructive bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn-outline-harsh"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createPromise.isPending}
            className="btn-harsh"
          >
            {createPromise.isPending ? 'Creating...' : 'Make Promise'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePromiseForm;
