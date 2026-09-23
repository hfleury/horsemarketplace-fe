import { useEffect } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';

const LAST_UPDATED = '2026-09-23';
const CONTACT_EMAIL = 'henrique@oniweb.com.br';

export const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <section className="py-24 px-6 md:px-12 bg-background">
            <div className="container-custom max-w-3xl">
                <SectionHeader
                    title="Privacy Policy"
                    subtitle={`Last updated: ${LAST_UPDATED}`}
                />

                <div className="space-y-10 text-text-secondary leading-relaxed">
                    <div className="bg-dark-100/40 border border-dark-200 rounded-xl p-5 text-sm">
                        <strong className="text-text-primary">Testing-phase notice: </strong>
                        Horse Marketplace is currently in an early testing phase. Some security
                        measures — such as HTTPS encryption in transit — are still being put in
                        place. Please avoid submitting highly sensitive information until this
                        notice is removed.
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">1. Who we are</h2>
                        <p>
                            This Privacy Policy explains how <strong>Horse Marketplace</strong> (&quot;we&quot;,
                            &quot;us&quot;, &quot;our&quot;) collects, uses, and protects your personal data when you use
                            our website. Horse Marketplace is the data controller for the personal
                            data described in this policy. For any question or request about your
                            personal data, contact us at{' '}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-purple hover:underline">
                                {CONTACT_EMAIL}
                            </a>.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">2. What data we collect</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong className="text-text-primary">Account data:</strong> the username,
                                email address, and password you provide when you register. Passwords
                                are never stored in plain text — only a salted hash.
                            </li>
                            <li>
                                <strong className="text-text-primary">Listing data:</strong> anything you
                                include in a listing you publish — title, description, price, category,
                                city/area, approximate coordinates, category-specific details (e.g. a
                                horse&apos;s breed, age, or height), and any photos you upload.
                            </li>
                            <li>
                                <strong className="text-text-primary">Messages:</strong> the content of
                                messages you exchange with other users through our buyer/seller messaging
                                feature.
                            </li>
                            <li>
                                <strong className="text-text-primary">Activity data:</strong> listings you
                                favorite, listing view counts, and any report you submit about a listing.
                            </li>
                            <li>
                                <strong className="text-text-primary">Technical data:</strong> your IP
                                address and standard web server logs, and a session cookie used to keep
                                you signed in.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">3. How we use your data</h2>
                        <p>We process your personal data to:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Create and manage your account, and let you publish and browse listings (necessary to perform our contract with you).</li>
                            <li>Deliver messages between buyers and sellers, and notify you by email when you receive one.</li>
                            <li>Send account-related emails: signup confirmation, password reset, and message notifications. We do not send marketing email, and we never buy, sell, or import third-party email lists — every address on file comes from a user registering directly on our site.</li>
                            <li>Resolve approximate coordinates for a listing&apos;s stated city/area, to support location-based search.</li>
                            <li>Review reports submitted about a listing, to prevent fraud and abuse (our legitimate interest in keeping the marketplace trustworthy).</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">4. Who we share it with</h2>
                        <p>We do not sell your personal data. We share it only with the service providers needed to run the site:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong className="text-text-primary">Hosting:</strong> our server infrastructure (database, file storage, and application) runs on a DigitalOcean server, currently in an EU region.</li>
                            <li><strong className="text-text-primary">Geocoding:</strong> if you provide a city/area for a listing, we send that text to Mapbox to resolve it into approximate coordinates.</li>
                            <li><strong className="text-text-primary">Email delivery:</strong> account-related emails (signup confirmation, password reset, message notifications) are sent through our email service provider.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">5. How long we keep it</h2>
                        <p>
                            We keep your account and listing data for as long as your account is
                            active. If you ask us to delete your account, we delete or anonymize your
                            personal data, except where we&apos;re required to keep it for longer to
                            comply with a legal obligation.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">6. Your rights</h2>
                        <p>Under the GDPR, you have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Access the personal data we hold about you.</li>
                            <li>Correct inaccurate data.</li>
                            <li>Request deletion of your data.</li>
                            <li>Restrict or object to certain processing.</li>
                            <li>Receive your data in a portable format.</li>
                        </ul>
                        <p className="mt-2">
                            To exercise any of these rights, contact us at{' '}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-purple hover:underline">
                                {CONTACT_EMAIL}
                            </a>. You also have the right to lodge a complaint with Sweden&apos;s data
                            protection authority, the{' '}
                            <a
                                href="https://www.imy.se"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent-purple hover:underline"
                            >
                                Integritetsskyddsmyndigheten (IMY)
                            </a>.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">7. Cookies</h2>
                        <p>
                            We use a single essential cookie to keep you signed in between visits. We
                            do not use advertising or third-party tracking cookies.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">8. Children&apos;s privacy</h2>
                        <p>
                            Horse Marketplace is not directed at, and we do not knowingly collect
                            personal data from, children under 13 years old.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">9. Changes to this policy</h2>
                        <p>
                            We may update this policy as the service evolves. Any change will be
                            posted on this page with an updated &quot;Last updated&quot; date above.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
