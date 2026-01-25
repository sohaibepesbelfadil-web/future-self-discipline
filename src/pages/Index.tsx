import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="slide-up max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            FUTURE YOU
          </h1>
          <div className="w-24 h-px bg-primary mx-auto mb-8" />
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-lg mx-auto">
            A psychological accountability system. No games. No rewards. Just you and your word.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/auth')} className="btn-harsh">
              Enter
            </button>
          </div>
        </div>
      </div>
      <footer className="p-6 text-center">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Discipline is the bridge between goals and accomplishment
        </p>
      </footer>
    </div>
  );
};

export default Index;
