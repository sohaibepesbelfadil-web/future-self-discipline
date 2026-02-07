import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Camera, User, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MobileProfileSetupProps {
  onComplete: (data: { username: string; real_name: string; gender: string; age: number; avatar_url?: string }) => void;
  onBack: () => void;
  isLoading: boolean;
}

const MobileProfileSetup: React.FC<MobileProfileSetupProps> = ({ onComplete, onBack, isLoading }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    real_name: '',
    gender: '',
    age: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Min 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Letters, numbers, underscores only';
    }

    if (!formData.real_name.trim()) {
      newErrors.real_name = 'Name is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Required';
    }

    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = 'Required';
    } else if (isNaN(age) || age < 13) {
      newErrors.age = '13+ only';
    } else if (age > 120) {
      newErrors.age = 'Invalid age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (): Promise<string | undefined> => {
    if (!avatarFile || !user) return undefined;

    setUploading(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({ title: 'Failed to upload avatar', variant: 'destructive' });
      return undefined;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    let uploadedAvatarUrl: string | undefined;
    
    if (avatarFile) {
      uploadedAvatarUrl = await uploadAvatar();
    }

    onComplete({
      username: formData.username.trim().toLowerCase(),
      real_name: formData.real_name.trim(),
      gender: formData.gender,
      age: parseInt(formData.age),
      avatar_url: uploadedAvatarUrl,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="pt-safe px-5 py-6 relative z-10">
        <motion.button
          onClick={onBack}
          className="mb-4 flex items-center gap-1 text-muted-foreground text-sm active:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold tracking-tight mb-2"
        >
          Create Profile
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-muted-foreground"
        >
          Tell us about yourself
        </motion.p>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 py-4 relative z-10 overflow-y-auto">
        {/* Avatar Upload */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <button
            onClick={handleAvatarClick}
            className="relative active:scale-95 transition-transform"
          >
            <div className="w-28 h-28 rounded-3xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden active:border-primary transition-colors">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Camera className="w-5 h-5 text-primary-foreground" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </button>
        </motion.div>

        <div className="space-y-5">
          {/* Username */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="your_username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className={`h-12 text-base ${errors.username ? 'border-destructive' : ''}`}
            />
            {errors.username && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.username}
              </p>
            )}
          </motion.div>

          {/* Real Name */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="real_name">Your Name</Label>
            <Input
              id="real_name"
              placeholder="John Doe"
              value={formData.real_name}
              onChange={(e) => setFormData(prev => ({ ...prev, real_name: e.target.value }))}
              className={`h-12 text-base ${errors.real_name ? 'border-destructive' : ''}`}
            />
            {errors.real_name && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.real_name}
              </p>
            )}
          </motion.div>

          {/* Gender & Age Row */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger className={`h-12 ${errors.gender ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-xs text-destructive">{errors.gender}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="18"
                inputMode="numeric"
                min={13}
                max={120}
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className={`h-12 text-base ${errors.age ? 'border-destructive' : ''}`}
              />
              {errors.age && (
                <p className="text-xs text-destructive">{errors.age}</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Continue button */}
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-xl border-t border-border/50 px-5 py-4 pb-safe z-50">
        <motion.button
          onClick={handleSubmit}
          disabled={isLoading || uploading}
          whileTap={{ scale: 0.98 }}
          className="w-full btn-harsh group flex items-center justify-center gap-2 py-4"
        >
          {isLoading || uploading ? 'Saving...' : 'Continue'}
          <ChevronRight className="w-5 h-5 transition-transform group-active:translate-x-1" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MobileProfileSetup;
