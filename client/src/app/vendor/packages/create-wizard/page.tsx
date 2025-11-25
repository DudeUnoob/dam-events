import { PackageWizard } from '@/components/vendor/PackageWizard';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PackageWizardData } from '@/types';

export const metadata = {
  title: 'Create Package - DAM Event Platform',
  description: 'Create a new event package for your venue',
};

export default async function CreatePackageWizardPage() {
  const supabase = createServerComponentClient({ cookies });

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is a vendor
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || userData.role !== 'vendor') {
    redirect('/');
  }

  const handleComplete = async (data: PackageWizardData) => {
    'use server';

    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    // TODO: Implement package creation logic
    // This will be implemented in the API route
    console.log('Wizard completed with data:', data);
  };

  return <PackageWizard isAuthenticated={!!user} onComplete={handleComplete} />;
}
