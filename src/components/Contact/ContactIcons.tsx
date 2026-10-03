import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import icons from './icons';
import { getContent } from '@/lib/content';
import fallback from '@/data/contact';

const ContactIcons = async () => {
  const data = await getContent('contact', fallback);

  return (
    <ul className="icons">
      {data.filter((s) => icons[s.icon]).map((s) => (
        <li key={s.label}>
          <a href={s.link} aria-label={s.label}>
            <FontAwesomeIcon icon={icons[s.icon]} />
          </a>
        </li>
      ))}
    </ul>
  );
};

export default ContactIcons;
