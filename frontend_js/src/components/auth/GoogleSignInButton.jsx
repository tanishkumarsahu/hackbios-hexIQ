'use client';

import { signInWithGoogle } from '../../services/supabaseAuth';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Icons } from '../icons';

export function GoogleSignInButton() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const { success, error } = await signInWithGoogle();
      if (success) {
        router.push('/dashboard');
      } else {
        console.error('Google sign in failed:', error);
      }
    } catch (error) {
      console.error('Error during Google sign in:', error);
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleSignIn}
    >
      <Icons.google className="h-4 w-4" />
      Continue with Google
    </Button>
  );
}
