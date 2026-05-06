import { motion } from 'framer-motion';
import { FiPhone, FiHash, FiMusic, FiHeart, FiCode } from 'react-icons/fi';
import './About.css';

const team = [
  {
    id: 1,
    name: 'Kartik Bhatti',
    roll: '2511981126',
    mob: '7696858589',
    role: 'Developer',
    initials: 'KB',
    color: '#FF2D78',
  },
  {
    id: 2,
    name: 'Krish Raj',
    roll: '2511981137',
    mob: '8969558219',
    role: 'Developer',
    initials: 'KR',
    color: '#7C5CFF',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function About() {
  return (
    <motion.div
      className="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero-glow" />
        <motion.div
          className="about-hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="about-badge">
            <FiMusic /> Our Story
          </div>
          <h1 className="about-title">Built with <span className="about-title-accent">Passion</span> &amp; Music</h1>
          <p className="about-subtitle">
            Rave is a music streaming project crafted by two developers who believe that great music
            deserves a great listening experience. We combined sleek design with powerful technology
            to bring you something we're truly proud of.
          </p>
        </motion.div>
      </div>

      {/* Team */}
      <div className="about-section">
        <motion.div
          className="about-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="about-section-title">Meet the Team</h2>
          <p className="about-section-sub">The two people behind Rave</p>
        </motion.div>

        <motion.div
          className="about-team-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {team.map((member) => (
            <motion.div key={member.id} className="about-card" variants={itemVariants}>
              <div className="about-card-top">
                <div className="about-avatar" style={{ '--member-color': member.color }}>
                  {member.initials}
                </div>
                <div className="about-card-badge" style={{ background: member.color + '22', color: member.color }}>
                  <FiCode size={12} /> {member.role}
                </div>
              </div>
              <h3 className="about-card-name">{member.name}</h3>
              <div className="about-card-details">
                <div className="about-card-row">
                  <FiHash className="about-card-icon" />
                  <span className="about-card-label">Roll No.</span>
                  <span className="about-card-value">{member.roll}</span>
                </div>
                <div className="about-card-row">
                  <FiPhone className="about-card-icon" />
                  <span className="about-card-label">Mobile</span>
                  <a href={`tel:${member.mob}`} className="about-card-value about-card-link">
                    {member.mob}
                  </a>
                </div>
              </div>
              <div className="about-card-glow" style={{ '--member-color': member.color }} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Contact */}
      <div className="about-section">
        <motion.div
          className="about-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="about-section-title">Contact Us</h2>
          <p className="about-section-sub">Have questions? Reach out directly to either of us</p>
        </motion.div>

        <motion.div
          className="about-contact-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {team.map((member) => (
            <motion.a
              key={member.id}
              href={`tel:${member.mob}`}
              className="about-contact-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="about-contact-avatar" style={{ '--member-color': member.color }}>
                {member.initials}
              </div>
              <div className="about-contact-info">
                <div className="about-contact-name">{member.name}</div>
                <div className="about-contact-number">
                  <FiPhone size={13} /> {member.mob}
                </div>
              </div>
              <div className="about-contact-action" style={{ color: member.color }}>
                Call →
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* Footer note */}
      <motion.div
        className="about-footer-note"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <FiHeart className="about-heart" /> Made with love for music — Rave &copy; 2025
      </motion.div>
    </motion.div>
  );
}
