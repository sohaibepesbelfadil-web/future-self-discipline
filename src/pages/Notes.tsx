import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, Note } from '@/hooks/useNotes';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

const Notes: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: notes = [], isLoading: notesLoading } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground font-mono">
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createNote.mutateAsync({ title: newTitle, content: newContent });
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim()) return;
    await updateNote.mutateAsync({ id, title: editTitle, content: editContent });
    setEditingId(null);
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content || '');
  };

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-4xl mx-auto">
          <StaggerItem>
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl font-bold">Notes</h1>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setIsCreating(true)}
                  className="gap-2"
                  disabled={isCreating}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Note</span>
                </Button>
              </motion.div>
            </div>
          </StaggerItem>

          {/* Create new note form */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <PremiumCard className="p-4 md:p-6">
                  <div className="space-y-4">
                    <Input
                      placeholder="Note title..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="text-lg font-medium bg-background/50"
                      autoFocus
                    />
                    <Textarea
                      placeholder="Write your note..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="min-h-[120px] bg-background/50"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsCreating(false);
                          setNewTitle('');
                          setNewContent('');
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreate}
                        disabled={!newTitle.trim() || createNote.isPending}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notes list */}
          {notesLoading ? (
            <StaggerItem>
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading notes...</div>
              </div>
            </StaggerItem>
          ) : notes.length === 0 ? (
            <StaggerItem>
              <PremiumCard className="p-8 md:p-12 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Create your first note to start organizing your thoughts.
                  </p>
                  <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Note
                  </Button>
                </motion.div>
              </PremiumCard>
            </StaggerItem>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {notes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PremiumCard className="p-4 md:p-5 h-full">
                      {editingId === note.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="font-medium bg-background/50"
                            autoFocus
                          />
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[100px] bg-background/50"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdate(note.id)}
                              disabled={!editTitle.trim() || updateNote.isPending}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-semibold text-base line-clamp-2">{note.title}</h3>
                            <div className="flex gap-1 shrink-0">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => startEditing(note)}
                                className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteNote.mutate(note.id)}
                                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                          {note.content && (
                            <p className="text-sm text-muted-foreground line-clamp-4 mb-3">
                              {note.content}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground/70 font-mono">
                            {format(new Date(note.created_at), 'MMM d, yyyy')}
                          </div>
                        </>
                      )}
                    </PremiumCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Notes;
