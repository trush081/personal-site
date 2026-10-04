import Link from 'next/link';

import { appHref, opensInNewTab, type App } from '@/lib/apps';

const AppCard = ({ app }: { app: App }) => {
  const body = (
    <>
      {app.icon_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={app.icon_url} alt="" className="dashboard-card-icon" />
      )}
      <h3>{app.name}{opensInNewTab(app) && <span aria-hidden="true"> &#8599;</span>}</h3>
      {app.description && <p>{app.description}</p>}
    </>
  );

  return app.kind === 'internal'
    ? <Link href={appHref(app)} className="dashboard-card">{body}</Link>
    : (
      <a
        href={appHref(app)}
        className="dashboard-card"
        target={opensInNewTab(app) ? '_blank' : undefined}
        rel={opensInNewTab(app) ? 'noopener noreferrer' : undefined}
      >
        {body}
      </a>
    );
};

export default AppCard;
