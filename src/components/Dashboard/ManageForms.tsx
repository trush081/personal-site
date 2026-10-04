'use client';

import { useActionState, useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  deleteApp, deleteGroup, regenerateOAuthSecret, saveApp, saveAppAccess, saveGroup, saveGroupMembers,
} from '@/lib/actions/manage';
import type { ActionResult } from '@/lib/actions/auth';
import type { App } from '@/lib/apps';

// Client credentials are only ever shown once, right after they're created.
const Credentials = ({ credentials }: { credentials: NonNullable<ActionResult['credentials']> }) => (
  <div className="dashboard-credentials" role="status">
    <p><strong>Copy these now.</strong> The secret won&apos;t be shown again (you can create a new one later).</p>
    <label htmlFor="cred-id">Client ID
      <input id="cred-id" type="text" readOnly value={credentials.clientId} onFocus={(e) => e.target.select()} />
    </label>
    <label htmlFor="cred-secret">Client secret
      <input id="cred-secret" type="text" readOnly value={credentials.clientSecret} onFocus={(e) => e.target.select()} />
    </label>
  </div>
);

const Status = ({ state }: { state?: ActionResult }) => (
  <>
    {state?.error && <p className="dashboard-error" role="alert">{state.error}</p>}
    {state?.ok && <p className="dashboard-ok" role="status">{state.message}</p>}
    {state?.credentials && <Credentials credentials={state.credentials} />}
  </>
);

export const AppForm = ({ app }: { app?: App }) => {
  const [state, action, pending] = useActionState(saveApp, undefined);
  const [kind, setKind] = useState(app?.kind ?? 'internal');

  return (
    // key resets a "new app" form after it's added
    <form action={action} className="dashboard-form dashboard-form-wide" key={!app && state?.ok ? state.message : 'form'}>
      {app && <input type="hidden" name="id" value={app.id} />}
      <div>
        <label htmlFor="app-name">Name
          <input id="app-name" type="text" name="name" defaultValue={app?.name} required maxLength={100} />
        </label>
      </div>
      <div>
        <label htmlFor="app-slug">Slug (used in links and by other projects)
          <input id="app-slug" type="text" name="slug" defaultValue={app?.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={60} placeholder="my-app" />
        </label>
      </div>
      <div>
        <label htmlFor="app-description">Description
          <textarea id="app-description" name="description" defaultValue={app?.description} rows={3} maxLength={1000} />
        </label>
      </div>
      <div>
        <label htmlFor="app-kind">Type
          <select id="app-kind" name="kind" value={kind} onChange={(e) => setKind(e.target.value as App['kind'])}>
            <option value="internal">Internal: a page inside this site</option>
            <option value="shared">Shared sign-in: my project on a trentonrush.com subdomain</option>
            <option value="external">External: a link to another site or tool</option>
            <option value="oauth">Sign in with Trenton: an app that uses these accounts to log in</option>
          </select>
        </label>
      </div>
      {kind !== 'internal' && (
        <div>
          <label htmlFor="app-url">{kind === 'oauth' ? 'App URL (where people open it)' : 'URL'}
            <input id="app-url" name="url" type="url" defaultValue={app?.url ?? ''} required placeholder="https://" />
          </label>
        </div>
      )}
      {kind === 'oauth' && (
        <div>
          <label htmlFor="app-redirects">Callback URLs (one per line, exact match)
            <textarea
              id="app-redirects"
              name="redirect_uris"
              rows={3}
              required
              defaultValue={app?.oauth_redirect_uris.join('\n')}
              placeholder="https://<other-project-ref>.supabase.co/auth/v1/callback"
            />
          </label>
          <p className="dashboard-help">
            For another Supabase project, this is its Callback URL, shown when you add the custom provider there.
          </p>
        </div>
      )}
      <div>
        <label htmlFor="app-visibility">Who can see it
          <select id="app-visibility" name="visibility" defaultValue={app?.visibility ?? 'restricted'}>
            <option value="restricted">Restricted: only people and groups I choose</option>
            <option value="members">Members: anyone signed in</option>
            <option value="public">Public: anyone, even signed out</option>
          </select>
        </label>
      </div>
      <div>
        <label htmlFor="app-icon">Icon URL (optional)
          <input id="app-icon" name="icon_url" type="url" defaultValue={app?.icon_url ?? ''} placeholder="https://" />
        </label>
      </div>
      <div>
        <label htmlFor="app-order">Order (lower shows first)
          <input id="app-order" name="sort_order" type="number" step="1" defaultValue={app?.sort_order ?? 0} />
        </label>
      </div>
      <Status state={state} />
      <button type="submit" disabled={pending}>{pending ? 'Saving…' : app ? 'Save app' : 'Add app'}</button>
    </form>
  );
};

export interface Option { id: string; label: string }

const CheckboxList = ({ name, options, selected }: { name: string; options: Option[]; selected: string[] }) => (
  options.length === 0 ? <p className="dashboard-help">None yet.</p> : (
    <ul className="dashboard-checklist">
      {options.map((o) => (
        <li key={o.id}>
          <input type="checkbox" id={`${name}-${o.id}`} name={name} value={o.id} defaultChecked={selected.includes(o.id)} />
          <label htmlFor={`${name}-${o.id}`}>{o.label}</label>
        </li>
      ))}
    </ul>
  )
);

export const AccessForm = ({ appId, users, groups, selectedUsers, selectedGroups }: {
  appId: string;
  users: Option[];
  groups: Option[];
  selectedUsers: string[];
  selectedGroups: string[];
}) => {
  const [state, action, pending] = useActionState(saveAppAccess, undefined);

  return (
    <form action={action} className="dashboard-form dashboard-form-wide">
      <input type="hidden" name="app_id" value={appId} />
      <h4>Groups</h4>
      <CheckboxList name="group_ids" options={groups} selected={selectedGroups} />
      <h4>People</h4>
      <CheckboxList name="user_ids" options={users} selected={selectedUsers} />
      <Status state={state} />
      <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save access'}</button>
    </form>
  );
};

export const GroupForm = ({ group }: { group?: { id: string; name: string; description: string } }) => {
  const [state, action, pending] = useActionState(saveGroup, undefined);

  return (
    <form action={action} className="dashboard-form" key={!group && state?.ok ? state.message : 'form'}>
      {group && <input type="hidden" name="id" value={group.id} />}
      <div>
        <label htmlFor="group-name">Name
          <input id="group-name" type="text" name="name" defaultValue={group?.name} required maxLength={60} />
        </label>
      </div>
      <div>
        <label htmlFor="group-description">Description
          <input id="group-description" type="text" name="description" defaultValue={group?.description} maxLength={500} />
        </label>
      </div>
      <Status state={state} />
      <button type="submit" disabled={pending}>{pending ? 'Saving…' : group ? 'Save group' : 'Add group'}</button>
    </form>
  );
};

export const MembersForm = ({ groupId, users, selected }: { groupId: string; users: Option[]; selected: string[] }) => {
  const [state, action, pending] = useActionState(saveGroupMembers, undefined);

  return (
    <form action={action} className="dashboard-form dashboard-form-wide">
      <input type="hidden" name="group_id" value={groupId} />
      <CheckboxList name="user_ids" options={users} selected={selected} />
      <Status state={state} />
      <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save members'}</button>
    </form>
  );
};

export const DeleteButton = ({ kind, id, name, redirectTo }: {
  kind: 'app' | 'group';
  id: string;
  name: string;
  redirectTo: string;
}) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const onClick = () => {
    if (!window.confirm(`Delete ${name}? This also removes its access grants. This cannot be undone.`)) return;
    startTransition(async () => {
      const result = kind === 'app' ? await deleteApp(id) : await deleteGroup(id);
      if (result.ok) router.push(redirectTo);
      else setError(result.error ?? 'Could not delete.');
    });
  };

  return (
    <>
      <button type="button" onClick={onClick} disabled={pending}>{pending ? 'Deleting…' : `Delete ${kind}`}</button>
      {error && <p className="dashboard-error" role="alert">{error}</p>}
    </>
  );
};

export const RegenerateSecretButton = ({ appId }: { appId: string }) => {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionResult>();

  const onClick = () => {
    if (!window.confirm('Create a new client secret? The current one stops working right away.')) return;
    startTransition(async () => setState(await regenerateOAuthSecret(appId)));
  };

  return (
    <>
      <button type="button" onClick={onClick} disabled={pending}>{pending ? 'Creating…' : 'Create new secret'}</button>
      <Status state={state} />
    </>
  );
};
