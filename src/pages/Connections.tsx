import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import {
  useConnections,
  usePendingRequests,
  useSearchUsers,
  useSendConnectionRequest,
  useRespondToRequest,
  useRemoveConnection,
  ConnectionType,
} from '@/hooks/useConnections';
import { useUserScore, getRankFromScore } from '@/hooks/useScores';
import Navbar from '@/components/Navbar';
import RankBadge from '@/components/RankBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, UserPlus, Check, X, Users, Heart, Search } from 'lucide-react';
import { toast } from 'sonner';

const ConnectionCard: React.FC<{
  connection: any;
  onRemove: () => void;
  isRemoving: boolean;
}> = ({ connection, onRemove, isRemoving }) => {
  const { data: score } = useUserScore(connection.connected_user_id);

  return (
    <div className="glass-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center">
          <span className="text-lg font-mono font-bold text-muted-foreground">
            {(connection.profile?.display_name || connection.profile?.username || 'U')[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-mono font-medium">
            {connection.profile?.display_name || connection.profile?.username || 'Anonymous'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {score && <RankBadge score={score.discipline_score} size="sm" />}
            <span className="text-xs text-muted-foreground uppercase font-mono">
              {connection.connection_type}
            </span>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={isRemoving}
        className="text-destructive hover:text-destructive"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

const PendingRequestCard: React.FC<{
  request: any;
  onAccept: () => void;
  onReject: () => void;
  isProcessing: boolean;
}> = ({ request, onAccept, onReject, isProcessing }) => {
  return (
    <div className="glass-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center">
          <span className="text-lg font-mono font-bold text-muted-foreground">
            {(request.requester_profile?.display_name || request.requester_profile?.username || 'U')[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-mono font-medium">
            {request.requester_profile?.display_name || request.requester_profile?.username || 'Anonymous'}
          </p>
          <p className="text-xs text-muted-foreground uppercase font-mono">
            wants to be your {request.connection_type}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onAccept}
          disabled={isProcessing}
          className="bg-success hover:bg-success/80"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReject}
          disabled={isProcessing}
          className="text-destructive hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const Connections: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: connections, isLoading: connectionsLoading } = useConnections();
  const { data: pendingRequests } = usePendingRequests();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ConnectionType>('friend');
  const { data: searchResults } = useSearchUsers(searchTerm);

  const sendRequest = useSendConnectionRequest();
  const respondToRequest = useRespondToRequest();
  const removeConnection = useRemoveConnection();

  const isLoading = authLoading || profileLoading || connectionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const friends = connections?.filter(c => c.connection_type === 'friend') || [];
  const family = connections?.filter(c => c.connection_type === 'family') || [];

  const handleSendRequest = async (addresseeId: string) => {
    try {
      await sendRequest.mutateAsync({
        addressee_id: addresseeId,
        connection_type: selectedType,
      });
      toast.success(`${selectedType === 'friend' ? 'Friend' : 'Family'} request sent`);
      setSearchTerm('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send request');
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      await respondToRequest.mutateAsync({ connectionId, accept: true });
      toast.success('Connection accepted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept request');
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      await respondToRequest.mutateAsync({ connectionId, accept: false });
      toast.success('Request rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject request');
    }
  };

  const handleRemove = async (connectionId: string) => {
    try {
      await removeConnection.mutateAsync(connectionId);
      toast.success('Connection removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove connection');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-mono font-bold uppercase tracking-widest">
              Connections
            </h1>
            <p className="text-sm text-muted-foreground">
              Accountability through observation. Not conversation.
            </p>
          </div>

          {/* Pending Requests */}
          {pendingRequests && pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-warning">
                Pending Requests ({pendingRequests.length})
              </h2>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <PendingRequestCard
                    key={request.id}
                    request={request}
                    onAccept={() => handleAccept(request.id)}
                    onReject={() => handleReject(request.id)}
                    isProcessing={respondToRequest.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Search and Add */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-mono uppercase tracking-widest text-sm text-muted-foreground">
              Add Connection
            </h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by username..."
                  className="pl-10"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ConnectionType)}
                className="bg-input border border-border px-3 text-sm font-mono"
              >
                <option value="friend">Friend</option>
                <option value="family">Family</option>
              </select>
            </div>

            {searchResults && searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.user_id}
                    className="flex items-center justify-between p-3 bg-muted/50 border border-border"
                  >
                    <span className="font-mono">
                      {result.display_name || result.username || 'Anonymous'}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(result.user_id)}
                      disabled={sendRequest.isPending}
                      className="btn-harsh text-xs py-1"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add as {selectedType}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connections Tabs */}
          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="w-full bg-muted border border-border">
              <TabsTrigger value="friends" className="flex-1 font-mono uppercase tracking-widest text-xs">
                <Users className="w-4 h-4 mr-2" />
                Friends ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="family" className="flex-1 font-mono uppercase tracking-widest text-xs">
                <Heart className="w-4 h-4 mr-2" />
                Family ({family.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-3 mt-4">
              {friends.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No friends connected yet.</p>
                  <p className="text-sm mt-2">Friends can see your rank and discipline score.</p>
                </div>
              ) : (
                friends.map((connection) => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    onRemove={() => handleRemove(connection.id)}
                    isRemoving={removeConnection.isPending}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="family" className="space-y-3 mt-4">
              {family.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No family connected yet.</p>
                  <p className="text-sm mt-2">Family sees everything. No hiding.</p>
                </div>
              ) : (
                family.map((connection) => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    onRemove={() => handleRemove(connection.id)}
                    isRemoving={removeConnection.isPending}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Philosophy note */}
          <div className="message-box">
            <p className="text-sm text-muted-foreground italic">
              "Friends see your progress. Family sees your truth. 
              Both exist to witness, not to comfort."
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Connections;
