import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Camera, User, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileSetupFormProps {
  onComplete: (data: { username: string; real_name: string; gender: string; age: number; avatar_url?: string }) => void;
  onBack: () => void;
  isLoading: boolean;
}

const ProfileSetupForm: React.FC<ProfileSetupFormProps> = ({ onComplete, onBack, isLoading }) => {
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
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.real_name.trim()) {
      newErrors.real_name = 'Name is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(age) || age < 13) {
      newErrors.age = 'You must be at least 13 years old';
    } else if (age > 120) {
      newErrors.age = 'Please enter a valid age';
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setAvatarFile(file);
    
    // Create preview
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
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex justify-center">
        <motion.div
          className="relative cursor-pointer group"
          onClick={handleAvatarClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-24 h-24 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.div>
      </div>
      <p className="text-center text-xs text-muted-foreground">Tap to add a profile picture</p>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">Username *</Label>
        <Input
          id="username"
          placeholder="your_username"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          className={errors.username ? 'border-destructive' : ''}
        />
        {errors.username && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.username}
          </p>
        )}
      </div>

      {/* Real Name */}
      <div className="space-y-2">
        <Label htmlFor="real_name">Your Name *</Label>
        <Input
          id="real_name"
          placeholder="John Doe"
          value={formData.real_name}
          onChange={(e) => setFormData(prev => ({ ...prev, real_name: e.target.value }))}
          className={errors.real_name ? 'border-destructive' : ''}
        />
        {errors.real_name && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.real_name}
          </p>
        )}
      </div>

      {/* Gender & Age Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
          >
            <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.gender}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            placeholder="18"
            min={13}
            max={120}
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            className={errors.age ? 'border-destructive' : ''}
          />
          {errors.age && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.age}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <motion.button
          type="button"
          onClick={onBack}
          className="btn-outline-harsh flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || uploading}
          className="btn-harsh flex-1 group flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading || uploading ? 'Saving...' : 'Continue'}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </div>
    </div>
  );
};

export default ProfileSetupForm;
