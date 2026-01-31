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
import { useUserScore } from '@/hooks/useScores';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import RankBadge from '@/components/RankBadge';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Check, X, Users, Heart, Search } from 'lucide-react';
import { toast } from 'sonner';

const ConnectionCard: React.FC<{
  connection: any;
  onRemove: () => void;
  isRemoving: boolean;
}> = ({ connection, onRemove, isRemoving }) => {
  const { data: score } = useUserScore(connection.connected_user_id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="premium-card p-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted border border-border/50 flex items-center justify-center">
          <span className="text-lg font-mono font-bold text-muted-foreground">
            {(connection.profile?.display_name || connection.profile?.username || 'U')[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-medium">
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
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        disabled={isRemoving}
        className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};

const PendingRequestCard: React.FC<{
  request: any;
  onAccept: () => void;
  onReject: () => void;
  isProcessing: boolean;
}> = ({ request, onAccept, onReject, isProcessing }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="premium-card p-4 flex items-center justify-between border-warning/30"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-warning/10 border border-warning/30 flex items-center justify-center">
          <span className="text-lg font-mono font-bold text-warning">
            {(request.requester_profile?.display_name || request.requester_profile?.username || 'U')[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-medium">
            {request.requester_profile?.display_name || request.requester_profile?.username || 'Anonymous'}
          </p>
          <p className="text-xs text-muted-foreground">
            wants to be your <span className="text-warning font-medium">{request.connection_type}</span>
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAccept}
          disabled={isProcessing}
          className="p-2 rounded-lg bg-success text-success-foreground hover:bg-success/80 transition-colors"
        >
          <Check className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onReject}
          disabled={isProcessing}
          className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground font-mono"
        >
          Loading...
        </motion.div>
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
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          {/* Header */}
          <StaggerItem>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </StaggerItem>

          <StaggerItem>
            <div className="text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider">
                Connections
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Accountability through observation. Not conversation.
              </p>
            </div>
          </StaggerItem>

          {/* Pending Requests */}
          {pendingRequests && pendingRequests.length > 0 && (
            <StaggerItem>
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
            </StaggerItem>
          )}

          {/* Search and Add */}
          <StaggerItem>
            <PremiumCard className="p-6 space-y-4">
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
                    className="pl-10 rounded-xl bg-muted/50"
                  />
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ConnectionType)}
                  className="bg-muted border border-border/50 px-3 text-sm font-mono rounded-xl"
                >
                  <option value="friend">Friend</option>
                  <option value="family">Family</option>
                </select>
              </div>

              {searchResults && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <motion.div
                      key={result.user_id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-muted/30 border border-border/30 rounded-xl"
                    >
                      <span className="font-medium">
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
                    </motion.div>
                  ))}
                </div>
              )}
            </PremiumCard>
          </StaggerItem>

          {/* Connections Tabs */}
          <StaggerItem>
            <Tabs defaultValue="friends" className="w-full">
              <TabsList className="w-full bg-muted/50 border border-border/50 rounded-xl p-1">
                <TabsTrigger value="friends" className="flex-1 font-mono uppercase tracking-widest text-xs rounded-lg">
                  <Users className="w-4 h-4 mr-2" />
                  Friends ({friends.length})
                </TabsTrigger>
                <TabsTrigger value="family" className="flex-1 font-mono uppercase tracking-widest text-xs rounded-lg">
                  <Heart className="w-4 h-4 mr-2" />
                  Family ({family.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="friends" className="space-y-3 mt-4">
                {friends.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-muted-foreground premium-card"
                  >
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No friends connected yet.</p>
                    <p className="text-sm mt-2">Friends can see your rank and discipline score.</p>
                  </motion.div>
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-muted-foreground premium-card"
                  >
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No family connected yet.</p>
                    <p className="text-sm mt-2">Family sees everything. No hiding.</p>
                  </motion.div>
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
          </StaggerItem>

          {/* Philosophy note */}
          <StaggerItem>
            <div className="message-box">
              <p className="text-sm text-muted-foreground italic">
                "Friends see your progress. Family sees your truth. 
                Both exist to witness, not to comfort."
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Connections;
