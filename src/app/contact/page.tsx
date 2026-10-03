import type { Metadata } from 'next';
import Link from 'next/link';

import Main from '@/components/Template/Main';
import EmailLink from '@/components/Contact/EmailLink';
import ContactIcons from '@/components/Contact/ContactIcons';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Trenton Rush via email @ trush081@gmail.com',
};

const Contact = () => (
  <Main>
    <article className="post" id="contact">
      <header>
        <div className="title">
          <h2><Link href="/contact">Contact</Link></h2>
        </div>
      </header>
      <div className="email-at">
        <p>Feel free to get in touch. You can email me at: </p>
        <EmailLink />
      </div>
      <ContactIcons />
    </article>
  </Main>
);

export default Contact;
