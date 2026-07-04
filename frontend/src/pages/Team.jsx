import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Mail, ArrowUpRight, ArrowRight, Sparkles, Plus } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import { CONTACT, TEAM } from "@/data/site";
import { BACKEND_URL, apiClient } from "@/config/api";

function fullPhoto(p) {
  if (!p) return null;
  if (p.startsWith("http")) return p;
  if (p.startsWith("/api/")) return `${BACKEND_URL}${p}`;
  if (p.startsWith("/team/")) return p.replace("/team/", "/team-members/");
  return p;
}

/* —————————————————— Hero —————————————————— */
function Hero() {
  return (
    <section className="relative pt-28 sm:pt-32 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40"/>
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-[#1E6BFF]/15 blur-[100px]"/>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-[11.5px] tracking-[0.22em] uppercase text-[#4D8BFF]">— The team behind DortX</div>
        <h1 className="font-display page-heading text-[clamp(2rem,5vw,3.5rem)] leading-[1.12] tracking-normal font-semibold mt-6 max-w-4xl">
          Engineers, designers <br/>
          and builders — <span className="italic font-normal text-[#4D8BFF]">united</span> by craft.
        </h1>
      </div>
    </section>
  );
}

/* —————————————————— Philosophy intro —————————————————— */
function Philosophy() {
  return (
    <section className="relative py-12">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-[24px] sm:text-[36px] lg:text-[42px] leading-[1.25] font-medium"
        >
          Our strength isn't measured by years on a resume. It's measured by
          <span className="text-[#4D8BFF]"> curiosity</span>, by
          <span className="text-[#4D8BFF]"> commitment</span>, by how often we
          choose to learn over to look right — and by our shared
          <span className="text-[#4D8BFF]"> passion</span> for building software that genuinely helps a business.
        </motion.p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            "Continuous Learning",
            "Engineering Excellence",
            "Collaboration",
            "Customer Commitment",
          ].map((v, i) => (
            <motion.div
              key={v}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-5"
            >
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-[#6B7385] mb-2">Value 0{i + 1}</div>
              <div className="font-display text-white text-[15px] font-semibold">{v}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* —————————————————— Initials / photo avatar —————————————————— */
function Avatar({ name, photo, size = 120, big = false }) {
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ width: "100%", aspectRatio: big ? "1 / 1.05" : "1 / 1" }}>
      {/* Always render the gradient + glow as a background so transparent / loading
          photos still feel premium. */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F1830] via-[#0A0F1C] to-[#16204A]"/>
      <div className="absolute inset-0 bg-grid opacity-25"/>
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#1E6BFF]/25 blur-3xl"/>
      <div className="absolute -bottom-12 -left-8 w-36 h-36 rounded-full bg-[#4D8BFF]/15 blur-3xl"/>

      {photo ? (
        <img
          src={photo}
          alt={`${name} — DortX team`}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="font-display font-semibold gradient-text"
            style={{ fontSize: big ? 140 : size * 0.6, lineHeight: 1 }}
          >
            {initials}
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#05080F] to-transparent"/>
    </div>
  );
}

/* —————————————————— Leadership —————————————————— */
function Leadership({ team }) {
  const leader = team.find((m) => m.leadership) || team[0];
  const leadershipDetails = [
    "💻 Full-Stack Development",
    "🏗️ Software Architecture",
    "📈 Product Strategy",
  ];
  if (!leader) return null;
  return (
    <section className="relative py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-[11.5px] tracking-[0.22em] uppercase text-[#4D8BFF] mb-5">FOUNDER</div>
        <h2 className="font-display section-heading font-medium max-w-3xl">
          Thrisha J C
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mt-6 grid lg:grid-cols-12 gap-8 lg:gap-8 items-start"
        >
          <div className="lg:col-span-5">
            <div className="relative max-w-[24rem]">
              <div className="absolute -inset-3 bg-[#1E6BFF]/20 blur-2xl rounded-3xl pointer-events-none"/>
              <div className="relative">
                <Avatar name={leader.name} photo={fullPhoto(leader.photo)} big />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="text-[11.5px] tracking-[0.14em] uppercase text-[#4D8BFF]">{leader.role}</div>

            <p className="mt-6 text-[15.5px] text-[#C9D2E0] leading-[1.7] max-w-2xl">
              DortX was founded with a simple belief: technology should solve real business problems, not create more complexity. As Founder & CEO and Founding Engineer, Thrisha leads the company's vision, product strategy, software architecture, and software development, ensuring every solution is practical, scalable, and built for long-term business value.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-2.5 max-w-lg">
              {leadershipDetails.map((r) => (
                <div key={r} className="flex items-center gap-2.5 text-[13.5px] text-[#9AA3B8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4D8BFF]"/> {r}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2">
              {leader.linkedin && (
                <a href={leader.linkedin} target="_blank" rel="noopener noreferrer" aria-label="View LinkedIn" title="View LinkedIn" className="w-9 h-9 rounded-full glass flex items-center justify-center text-[#C9D2E0] hover:text-white hover:border-[#1E6BFF]/40 transition">
                  <Linkedin size={14}/>
                </a>
              )}
              <a href={`mailto:${leader.email_address || CONTACT.founder}`} aria-label="Email Thrisha J C" title="Email Thrisha J C" className="w-9 h-9 rounded-full glass flex items-center justify-center text-[#C9D2E0] hover:text-white hover:border-[#1E6BFF]/40 transition">
                <Mail size={14}/>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* —————————————————— Member card with expand-on-hover —————————————————— */
function MemberCard({ member, index }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className="spotlight relative group rounded-2xl border border-white/8 bg-white/[0.02] p-5 overflow-hidden"
      data-testid={`team-card-${member.name.toLowerCase()}`}
    >
      {/* subtle floating gradient */}
      <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full bg-[#1E6BFF]/10 blur-3xl pointer-events-none group-hover:bg-[#1E6BFF]/20 transition-all duration-500"/>

      <div className="relative">
        <Avatar name={member.name} photo={fullPhoto(member.photo)} />
      </div>

      <div className="relative mt-5">
        <div className="font-display text-[18px] font-semibold text-white">{member.name}</div>
        <div className="text-[11.5px] tracking-[0.14em] uppercase text-[#4D8BFF] mt-1.5">{member.role}</div>
        <p className="mt-3 text-[13.5px] text-[#9AA3B8] leading-relaxed line-clamp-3">{member.bio}</p>

        {/* Expertise pill */}
        <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/4 border border-white/8 text-[11px] text-[#C9D2E0]">
          <Sparkles size={10} className="text-[#4D8BFF]"/> {member.expertise}
        </div>

        {/* Hover panel — responsibilities */}
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-4 border-t border-white/8">
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-[#6B7385] mb-3">Responsibilities</div>
                <ul className="space-y-1.5">
                  {(member.responsibilities || []).map((r) => (
                    <li key={r} className="flex items-center gap-2 text-[12.5px] text-[#C9D2E0]">
                      <Plus size={11} className="text-[#4D8BFF]"/> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 flex items-center gap-2">
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`} className="w-8 h-8 rounded-full bg-white/4 border border-white/8 flex items-center justify-center text-[#9AA3B8] hover:text-white hover:border-[#1E6BFF]/40 transition">
              <Linkedin size={12}/>
            </a>
          )}
          {member.email_address && (
            <a href={`mailto:${member.email_address}`} aria-label={`${member.name} Email`} className="w-8 h-8 rounded-full bg-white/4 border border-white/8 flex items-center justify-center text-[#9AA3B8] hover:text-white hover:border-[#1E6BFF]/40 transition">
              <Mail size={12}/>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* —————————————————— Team grid —————————————————— */
function TheTeam({ team }) {
  const others = team.filter((m) => !m.leadership);
  return (
    <section className="relative py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between gap-5 mb-7 flex-wrap">
          <div>
            <div className="text-[11.5px] tracking-[0.22em] uppercase text-[#4D8BFF] mb-5">— The team</div>
            <h2 className="font-display section-heading font-medium max-w-2xl">
              The people you'll actually work with.
            </h2>
          </div>
          <div className="text-[13.5px] text-[#9AA3B8] max-w-sm">
            Hover any card to see what each person owns at DortX.
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {others.map((m, i) => <MemberCard key={m.id || m.name} member={m} index={i}/>)}
        </div>
      </div>
    </section>
  );
}

/* —————————————————— CTA —————————————————— */
function CTA() {
  return (
    <section className="relative py-14">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="relative rounded-3xl border border-white/10 overflow-hidden p-5 lg:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1430] via-[#05080F] to-[#0A1430]"/>
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-[#1E6BFF]/20 blur-[60px]"/>
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-[11.5px] tracking-[0.22em] uppercase text-[#4D8BFF] mb-4">Want to join us</div>
              <h3 className="font-display text-[24px] sm:text-[30px] leading-[1.1] font-semibold">
                We grow slowly, and only with the right people.
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <MagneticButton><Link to="/careers" className="btn-primary">See open roles <ArrowUpRight size={15}/></Link></MagneticButton>
              <Link to="/contact" className="btn-ghost">Talk to us <ArrowRight size={15}/></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Team() {
  const [team, setTeam] = useState(TEAM);
  useEffect(() => {
    let active = true;
    apiClient.get("/team")
      .then((r) => {
        if (!active) return;
        const items = r.data.items || [];
        setTeam(items.length ? items : TEAM);
      })
      .catch(() => {
        if (active) setTeam(TEAM);
      });
    return () => { active = false; };
  }, []);
  return (
    <div data-testid="team-page">
      <Hero />
      <Philosophy />
      <Leadership team={team} />
      <TheTeam team={team} />
      <CTA />
    </div>
  );
}
