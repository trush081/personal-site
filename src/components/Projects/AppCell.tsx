import type { PublicApp } from '@/lib/content';

// A public app from Manage -> Apps, shown alongside projects.
const AppCell = ({ app }: { app: PublicApp }) => {
  const href = app.kind === 'internal' ? `/dashboard/apps/${app.slug}` : app.url ?? '#';

  return (
    <div className="cell-container">
      <article className="mini-post">
        <header>
          <h3><a href={href}>{app.name}</a></h3>
        </header>
        {app.icon_url && (
          <a href={href} className="image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={app.icon_url} alt={app.name} />
          </a>
        )}
        {app.description && (
          <div className="description">
            <p>{app.description}</p>
          </div>
        )}
      </article>
    </div>
  );
};

export default AppCell;
