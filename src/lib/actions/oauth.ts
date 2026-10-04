'use server';

import { redirect } from 'next/navigation';

import { getAuthState } from '@/lib/auth';
import { checkOAuthAccess, isAuthorizationId } from '@/lib/oauth';
import createClient from '@/lib/supabase/server';

// Handles Approve / Deny on the consent page. Re-checks everything, since server
// actions can be called directly: the user must be signed in and have access to the
// requesting app, otherwise the request is denied.
export const decideAuthorization = async (formData: FormData) => {
  const authorizationId = formData.get('authorization_id');
  const approve = formData.get('decision') === 'approve';
  if (!isAuthorizationId(authorizationId)) redirect('/dashboard');

  if ((await getAuthState()).status === 'signed-out') {
    redirect(`/login?next=${encodeURIComponent(`/oauth/consent?authorization_id=${authorizationId}`)}`);
  }

  const supabase = await createClient();
  const { data: details, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
  if (error || !details) redirect(`/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`);

  const access = 'authorization_id' in details
    ? await checkOAuthAccess(supabase, { clientId: details.client.id, redirectUri: details.redirect_uri })
    : await checkOAuthAccess(supabase, { redirectUri: details.redirect_url });

  const { data } = approve && access.allowed
    ? await supabase.auth.oauth.approveAuthorization(authorizationId)
    : await supabase.auth.oauth.denyAuthorization(authorizationId);

  // Supabase only returns URLs registered for the app, so this can't redirect elsewhere.
  redirect(data?.redirect_url ?? '/dashboard');
};
