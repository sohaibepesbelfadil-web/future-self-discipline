import { useState } from "react";
import { Bell, BellOff, Smartphone, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export function PushNotificationSettings() {
  const { toast } = useToast();
  const {
    isSupported, isSubscribed, permission, isLoading, isiOS, isPWA, subscribe, unsubscribe
  } = usePushNotifications();
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast({ title: "Notifications disabled" });
      } else {
        await subscribe();
        toast({ title: "Notifications enabled!" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: user.id,
          payload: {
            title: "Test Notification 🔔",
            body: "Push notifications are working!",
            url: "/"
          }
        }
      });
      toast({ title: "Test sent!" });
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isiOS && !isPWA) {
    return (
      <div className="p-4 rounded-xl bg-muted/30 border border-border">
        <div className="flex items-center gap-3 mb-3">
          <Smartphone className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">Push Notifications</p>
            <p className="text-xs text-muted-foreground">Install the app first</p>
          </div>
        </div>
        <ol className="text-xs text-muted-foreground space-y-1 ml-8 list-decimal">
          <li>Tap the <strong>Share</strong> button in Safari</li>
          <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
          <li>Open the app from your home screen</li>
        </ol>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
        <AlertCircle className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm">Push Notifications</p>
          <p className="text-xs text-muted-foreground">Not supported in this browser</p>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
        <BellOff className="w-5 h-5 text-destructive" />
        <div>
          <p className="font-medium text-sm">Push Notifications</p>
          <p className="text-xs text-muted-foreground">Permission denied — update browser settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubscribed ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Bell className="w-5 h-5 text-muted-foreground" />}
          <div>
            <p className="font-medium text-sm">Push Notifications</p>
            <p className="text-xs text-muted-foreground">{isSubscribed ? "Enabled" : "Disabled"}</p>
          </div>
        </div>
        <Switch
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>
      {isSubscribed && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendTest}
            disabled={isSendingTest}
            className="w-full"
          >
            {isSendingTest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
            Send Test
          </Button>
        </motion.div>
      )}
    </div>
  );
}
