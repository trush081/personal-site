import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import Main from '@/components/Template/Main';
import { decideAuthorization } from '@/lib/actions/oauth';
import { getAuthState } from '@/lib/auth';
import { checkOAuthAccess, describeScopes, isAuthorizationId } from '@/lib/oauth';
import createClient from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

const Shell = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <Main fullPage>
    <article className="post" id="consent">
      <header>
        <div className="title">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </header>
      {children}
    </article>
  </Main>
);

const Problem = ({ message }: { message: string }) => (
  <Shell title="Can't sign you in">
    <p>{message}</p>
    <p><Link href="/dashboard">Go to your Overview &rarr;</Link></p>
  </Shell>
);

// Supabase sends people here when an app asks to "Sign in with Trenton".
const Consent = async ({ searchParams }: { searchParams: Promise<{ authorization_id?: string }> }) => {
  const { authorization_id: authorizationId } = await searchParams;
  if (!isAuthorizationId(authorizationId)) return <Problem message="This sign-in link is invalid or incomplete." />;

  const auth = await getAuthState();
  if (auth.status === 'signed-out') {
    redirect(`/login?next=${encodeURIComponent(`/oauth/consent?authorization_id=${authorizationId}`)}`);
  }

  const supabase = await createClient();
  const { data: details, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
  if (error || !details) {
    return <Problem message="This sign-in request has expired or was already used. Go back to the app and try again." />;
  }

  // Approved before: Supabase skips consent and hands back the redirect. Still check
  // access first, so revoking someone's access here keeps them out of the app.
  if (!('authorization_id' in details)) {
    const access = await checkOAuthAccess(supabase, { redirectUri: details.redirect_url });
    if (access.allowed) redirect(details.redirect_url);
    return (
      <Problem
        message={access.appName
          ? `You don't have access to ${access.appName}. Ask the site owner if you think you should.`
          : 'This app is not set up to sign in with this site.'}
      />
    );
  }

  const access = await checkOAuthAccess(supabase, { clientId: details.client.id, redirectUri: details.redirect_uri });
  const appName = access.appName ?? details.client.name;

  if (!access.allowed) {
    return (
      <Shell title="No access" subtitle={appName}>
        <p>
          {access.appName
            ? `${auth.email} doesn't have access to ${appName}. Ask the site owner if you think you should.`
            : 'This app is not set up to sign in with this site.'}
        </p>
        <form action={decideAuthorization}>
          <input type="hidden" name="authorization_id" value={authorizationId} />
          <button type="submit" name="decision" value="deny">Return to the app</button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell title={`Sign in to ${appName}`} subtitle={`as ${auth.email}`}>
      <p>{appName} would like to use your trentonrush.com account. It will be able to see:</p>
      <ul>
        {describeScopes(details.scope).map((label) => <li key={label}>{label}</li>)}
      </ul>
      <form action={decideAuthorization} className="consent-actions">
        <input type="hidden" name="authorization_id" value={authorizationId} />
        <button type="submit" name="decision" value="approve" className="primary">Allow</button>
        <button type="submit" name="decision" value="deny">Cancel</button>
      </form>
      <p className="dashboard-help">
        Not you? <Link href="/dashboard/account">Sign out from your account page</Link>, then try again.
      </p>
    </Shell>
  );
};

export default Consent;
