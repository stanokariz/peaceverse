import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Linkedin, Twitter, Github } from "lucide-react";
import stank from "../assets/stank.jpg";

const About = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-yellow-50 dark:from-[#0d1117] dark:via-[#161b22] dark:to-[#0d1117] text-gray-800 dark:text-gray-200 min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-12 py-16 sm:py-24">
      {/* Background image overlay */}
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
        alt="Africa pattern"
        className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-5 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-6xl w-full text-center relative z-10"
      >
        {/* 🌍 Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          About <span className="text-amber-600">Peaceverse</span>
        </h1>

        <p className="text-lg sm:text-xl leading-relaxed text-gray-700 dark:text-gray-300 mb-12 px-2 sm:px-6">
          <strong>Peaceverse</strong> is a digital ecosystem dedicated to advancing
          peace, unity, and sustainable development across Africa. It empowers
          communities, enhances collaboration between regional blocs such as{" "}
          <span className="text-amber-700 font-semibold">COMESA</span>,
          <span className="text-red-700 font-semibold"> ECOWAS</span>,
          <span className="text-green-700 font-semibold"> EAC</span>, and
          <span className="text-blue-700 font-semibold"> SADC</span> — enabling
          real-time early warning, dialogue, and peacebuilding actions.
        </p>

        {/* 🔰 Core Pillars */}
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-3 mt-8 px-4">
          {[
            {
              title: "Empowerment",
              desc: "Building capacity for youth and women to lead change through education, innovation, and leadership.",
              color: "border-amber-600",
            },
            {
              title: "Governance",
              desc: "Promoting accountability, transparency, and inclusive institutions that strengthen democracy.",
              color: "border-green-700",
            },
            {
              title: "Peace & Security",
              desc: "Supporting peaceful coexistence and conflict prevention through dialogue and regional cooperation.",
              color: "border-blue-700",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`bg-white dark:bg-[#161b22] shadow-md rounded-2xl p-6 border-t-4 ${item.color}`}
            >
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* 🕊️ Mission, Vision, Objectives */}
        {/* 🕊️ Mission, Vision, Objectives with staggered scroll animation */}
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
  className="mt-24 text-left px-4 sm:px-8 space-y-10 max-w-4xl mx-auto"
>
  {[
    {
      title: "Our Mission",
      color: "text-amber-600",
      text: "To leverage technology and community-driven intelligence to detect, prevent, and mitigate conflicts in Africa through data, dialogue, and peace innovation."
    },
    {
      title: "Our Vision",
      color: "text-amber-600",
      text: "A united, peaceful, and resilient Africa where technology and people work together to sustain harmony and inclusive development."
    },
    {
      title: "Our Objectives",
      color: "text-amber-600",
      text: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Enhance early warning and response capabilities for peace actors.</li>
          <li>Promote youth engagement and digital innovation for conflict prevention.</li>
          <li>Support inclusive governance and data-driven peace strategies.</li>
          <li>Strengthen regional and community collaboration for resilience.</li>
        </ul>
      )
    }
  ].map((section, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ delay: i * 0.3, duration: 0.6 }}
    >
      <h2 className={`text-3xl font-bold mb-4 ${section.color}`}>{section.title}</h2>
      <div className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{section.text}</div>
    </motion.div>
  ))}
</motion.div>


        {/* 👥 Meet the Team */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <h2 className="text-3xl font-bold text-amber-600 mb-8">Meet the Team</h2>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 justify-center">
            {TEAM.map((member, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                onClick={() => setSelectedMember(member)}
                className="cursor-pointer bg-white dark:bg-[#161b22] rounded-2xl shadow-md hover:shadow-lg p-6 flex flex-col items-center text-center border border-amber-100 dark:border-[#21262d]"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-28 h-28 object-cover rounded-full mb-4 shadow-md"
                />
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-amber-700 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* 🪟 Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#161b22] rounded-2xl shadow-lg p-6 sm:p-8 max-w-lg w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
              >
                <X size={22} />
              </button>

              <div className="flex flex-col items-center text-center">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="w-28 h-28 rounded-full object-cover mb-4 shadow-md"
                />
                <h3 className="text-xl font-bold mb-1">{selectedMember.name}</h3>
                <p className="text-amber-700 font-medium mb-3">{selectedMember.role}</p>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{selectedMember.bio}</p>

                <div className="flex gap-4">
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600"><Linkedin size={20} /></a>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-sky-500"><Twitter size={20} /></a>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900"><Github size={20} /></a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const TEAM = [
  {
    name: "Damian Kajwang",
    role: "Project Team Lead",
    bio: "Championing Africa’s peace innovation and digital governance transformation.",
    image: "https://randomuser.me/api/portraits/men/25.jpg",
  },
  {
    name: "Stanley Kariuki Kinuthia",
    role: "Lead Software Developer",
    bio: "Building digital bridges that empower communities through PeaceTech innovation.",
    image: stank,
  },
  {
    name: "Brian Maingi K",
    role: "Graphic Designer",
    bio: "Crafting narratives that unite Africa around peace and shared prosperity.",
    image: "https://randomuser.me/api/portraits/men/26.jpg",
  },
];

export default About;
