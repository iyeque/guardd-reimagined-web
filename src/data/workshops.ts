export interface Workshop {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  lightColor: string;
  duration: string;
  ageGroup: string;
  role?: string;
  modulesCount?: number;
  hasAssessment?: boolean;
  actionPauseCount?: number;
  isCourse?: boolean;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  type: "lesson" | "quiz" | "checklist" | "reflection" | "activity";
  content: string;
  items?: QuizItem[] | ChecklistItem[] | ActivityItem[];
}

export interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChecklistItem {
  text: string;
  icon: string;
  tip?: string;
}

export interface ActivityItem {
  title: string;
  description: string;
  action: string;
}

export const workshops: Workshop[] = [
  {
    id: "social-media",
    title: "Navigating Social Media",
    subtitle: "Build Healthy Digital Habits Together",
    description:
      "Learn how to use social media in a healthy, positive way. Understand privacy settings, spot misinformation, and create a family social media agreement.",
    icon: "📱",
    color: "#FF9A8B",
    lightColor: "#FFF5F5",
    duration: "35 min",
    ageGroup: "Ages 10+",
    role: "Whole Family",
    modulesCount: 5,
    hasAssessment: true,
    actionPauseCount: 1,
    isCourse: false,
    modules: [
      {
        id: "sm-intro",
        title: "Understanding Your Digital Footprint",
        type: "lesson",
        content:
          "Everything you post, share, or even like online contributes to your digital footprint. That footprint can last for years, affect college applications, job opportunities, and how others see you. Start by auditing what you’ve shared, review old photos and comments, and practice thinking before you post. Good digital habits begin with awareness, not fear."
      },
      {
        id: "sm-quiz",
        title: "Spot the Fake News",
        type: "quiz",
        content: "Test your ability to identify trustworthy information online.",
        items: [
          {
            question: 'You see a shocking headline on social media. What should you do first?',
            options: [
              "Share it immediately",
              "Check the source website",
              "Comment your opinion",
              "Ignore it completely"
            ],
            correctIndex: 1,
            explanation:
              "Always verify the source before sharing. Check if it's from a reputable news outlet."
          },
          {
            question: 'A "friend" you don\'t know asks for personal info. You should:',
            options: [
              "Share it - they seem nice",
              "Ask your parents first",
              "Give fake info",
              "Block and report"
            ],
            correctIndex: 3,
            explanation:
              "Never share personal info with strangers online. Block and report suspicious accounts."
          },
          {
            question: "Which post is safest to share publicly?",
            options: [
              "Your full home address",
              "Your school schedule",
              "A photo from a public park",
              "Your parent's credit card last 4 digits"
            ],
            correctIndex: 2,
            explanation:
              "General photos from public places are usually fine. Location, schedules, and financial details are risky."
          },
          {
            question: "You get a message with a link claiming you won a prize. Best move?",
            options: [
              "Click to claim it",
              "Send it to friends",
              "Verify the sender and ignore suspicious links",
              "Reply with your details"
            ],
            correctIndex: 2,
            explanation:
              "Unsolicited prize links are often scams. Verify the sender and avoid clicking unknown links."
          }
        ]
      },
      {
        id: "sm-checklist",
        title: "Privacy Check-Up",
        type: "checklist",
        content:
          "Make sure your family accounts are secure and private.",
        items: [
          { text: "Set profiles to private", icon: "🔒", tip: "Open account settings, then set profiles to private/friends-only." },
          { text: "Turn off location sharing", icon: "📍", tip: "Disable location tagging and remove past location history." },
          { text: "Review friend/follower lists", icon: "👥", tip: "Remove accounts you don't recognize." },
          { text: "Enable two-factor authentication", icon: "🛡️", tip: "Use an authenticator app or SMS verification." },
          { text: "Discuss what NOT to share", icon: "🗣️", tip: "Agree on no live location, schedules, or travel photos." },
          { text: "Remove old posts with sensitive info", icon: "🧹", tip: "Search your username and delete risky old posts." },
          { text: "Review app permissions", icon: "📱", tip: "Remove camera/mic/location access you don't use." },
          { text: "Set up shared family rules for posting", icon: "📝", tip: "Write one rule everyone agrees on before posting." }
        ]
      },
      {
        id: "sm-reflection",
        title: "How Does Social Media Make You Feel?",
        type: "reflection",
        content:
          "Take a moment to reflect on your social media habits and how they affect your mood.",
        items: [
          {
            title: "Mood Check",
            description:
              "Notice whether you feel more connected or more anxious after scrolling.",
            action: "Write 1 sentence"
          },
          {
            title: "Role Model Check",
            description:
              "Think about what younger siblings or friends might learn from your posts.",
            action: "List 2 examples"
          },
          {
            title: "Boundary Idea",
            description:
              "Pick one small rule that would improve your social media experience.",
            action: "Share with family"
          },
          {
            title: "Time Audit",
            description:
              "Track one social media session from opening the app to closing it.",
            action: "Note the real duration"
          }
        ]
      },
      {
        id: "sm-activity",
        title: "Create a Family Social Media Agreement",
        type: "activity",
        content:
          "Work together to create rules that work for your family.",
        items: [
          {
            title: "Screen-Free Zones",
            description:
              "Decide where phones stay off (dinner table, bedrooms)",
            action: "List 3 zones"
          },
          {
            title: "Posting Rules",
            description: "Agree on what photos/info can be shared",
            action: "Write your rules"
          },
          {
            title: "Time Limits",
            description: "Set daily social media time limits",
            action: "Set time limits"
          },
          {
            title: "Check-In Ritual",
            description: "Pick one weekly family check-in about social media experiences",
            action: "Schedule check-in"
          }
        ]
      }
    ]
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity for Families",
    subtitle: "Build Your Digital Fortress",
    description:
      "Protect your family from online threats. Learn about passwords, phishing, safe browsing, and building a secure digital home together.",
    icon: "🔐",
    color: "#4FD1C5",
    lightColor: "#E6FFFA",
    duration: "40 min",
    ageGroup: "All Ages",
    role: "Whole Family",
    modulesCount: 5,
    hasAssessment: true,
    actionPauseCount: 1,
    isCourse: false,
    modules: [
      {
        id: "cs-intro",
        title: "Why Cybersecurity Matters",
        type: "lesson",
        content:
          "Just like you lock your front door, you need to lock your digital life. Cybersecurity protects your family's information, photos, and identity. Real risks include stolen accounts, ransomware, phishing scams, and unsafe public Wi-Fi. Start by mapping your family's digital footprint, then build habits that make you harder to target. Good security isn't one big action; it's many small ones done consistently."
      },
      {
        id: "cs-quiz",
        title: "Password Power-Up",
        type: "quiz",
        content: "Test your password knowledge!",
        items: [
          {
            question: "Which password is the STRONGEST?",
            options: [
              "password123",
              "Fluffy2024!",
              "Tr0ub4dor&3",
              "CorrectHorseBatteryStaple!"
            ],
            correctIndex: 3,
            explanation:
              "Long passphrases are stronger than complex short passwords. Think: 4+ random words + symbols."
          },
          {
            question:
              'You get an email saying "Your account is suspended. Click here!" You should:',
            options: [
              "Click the link immediately",
              "Check the sender email carefully",
              "Forward to friends",
              "Reply to the email"
            ],
            correctIndex: 1,
            explanation:
              "This is likely phishing. Check the sender address and go directly to the website instead of clicking links."
          },
          {
            question: "Which habit improves security the most for most families?",
            options: [
              "Writing passwords on a sticky note",
              "Reusing the same password everywhere",
              "Using a password manager with unique passwords",
              "Changing your password every week"
            ],
            correctIndex: 2,
            explanation:
              "A password manager with unique passwords stops credential reuse, which is one of the most common attack paths."
          },
          {
            question: "Public Wi-Fi is safest for:",
            options: [
              "Online banking",
              "Sending sensitive work emails",
              "Browsing public news sites",
              "Entering credit card details"
            ],
            correctIndex: 2,
            explanation:
              "Public Wi-Fi is fine for low-risk browsing, but avoid sensitive logins unless you use a trusted VPN."
          }
        ]
      },
      {
        id: "cs-checklist",
        title: "Family Security Audit",
        type: "checklist",
        content:
          "Complete these steps to secure your family's digital life.",
        items: [
          { text: "Use a password manager", icon: "🔑", tip: "Try Bitwarden, 1Password, or Apple Keychain/Google Password Manager." },
          { text: "Update all devices and apps", icon: "📦", tip: "Enable automatic updates in device settings." },
          { text: "Set up parental controls where needed", icon: "👨‍👩‍👧‍👦", tip: "Use Google Family Link or iOS Screen Time." },
          { text: "Backup important photos/files", icon: "💾", tip: "Use cloud backup plus one external drive." },
          { text: "Create a family safe word for scams", icon: "🆘", tip: "Pick one short word only your family knows." },
          { text: "Enable encryption on phones and laptops", icon: "🔐", tip: "Use device encryption in security settings." },
          { text: "Review account recovery options", icon: "🔄", tip: "Add a backup email and phone number." },
          { text: "Agree on a policy for downloading apps", icon: "📲", tip: "Only download from official stores and review permissions." }
        ]
      },
      {
        id: "cs-reflection",
        title: "Where Could We Be Safer?",
        type: "reflection",
        content:
          "Identify one place your family might be vulnerable online and one small habit that could reduce risk.",
        items: [
          {
            title: "Risk Spot",
            description:
              "Choose one app, account, or routine that might need stronger safety.",
            action: "Name the risk"
          },
          {
            title: "Small Habit",
            description:
              "Pick one 5-minute habit that improves security without slowing life down.",
            action: "Write the habit"
          },
          {
            title: "Support Plan",
            description:
              "Decide how family members will remind each other safely without shaming.",
            action: "Agree on tone"
          },
          {
            title: "Emergency Plan",
            description:
              "Pick one thing to do first if a device, account, or password may be compromised.",
            action: "Write the first step"
          }
        ]
      },
      {
        id: "cs-activity",
        title: "Build Your Family Password Policy",
        type: "activity",
        content:
          "Create a family system for managing passwords safely.",
        items: [
          {
            title: "Password Manager Setup",
            description: "Choose and set up a family password manager",
            action: "Install app"
          },
          {
            title: "Strong Password Rules",
            description: "Create a family password formula",
            action: "Write formula"
          },
          {
            title: "Scam Alert System",
            description: "Agree on how to verify suspicious messages",
            action: "Set protocol"
          },
          {
            title: "Quarterly Security Review",
            description: "Pick a recurring date to review settings and backups as a family",
            action: "Add to calendar"
          }
        ]
      }
    ]
  },
  {
    id: "screen-time",
    title: "Managing Screen Time",
    subtitle: "Find Your Family Balance",
    description:
      "Develop healthy habits for screen time. Create schedules, discover offline activities, and build a balanced digital lifestyle for the whole family.",
    icon: "⏱️",
    color: "#B794F4",
    lightColor: "#FAF5FF",
    duration: "30 min",
    ageGroup: "All Ages",
    role: "Whole Family",
    modulesCount: 5,
    hasAssessment: true,
    actionPauseCount: 1,
    isCourse: false,
    modules: [
      {
        id: "st-intro",
        title: "The Balance Equation",
        type: "lesson",
        content:
          "Screens are tools, not enemies. The key is balance: enough for learning and connection, but not so much that we miss real-world experiences. Research shows that consistent routines matter more than exact minute limits. Work with your family to design a day that includes focused screen blocks, physical movement, face-to-face time, and recovery rituals. The goal is intentional use, not guilt-driven restriction."
      },
      {
        id: "st-quiz",
        title: "Screen Time Reality Check",
        type: "quiz",
        content: "How much do you really know about your habits?",
        items: [
          {
            question: "How long before bed should screens be turned off?",
            options: ["5 minutes", "30 minutes", "1 hour", "2 hours"],
            correctIndex: 2,
            explanation:
              "Blue light from screens suppresses melatonin. Turn off screens at least 1 hour before bed for better sleep."
          },
          {
            question: "A healthy daily screen time limit for kids (non-school) is:",
            options: [
              "No limit",
              "1-2 hours",
              "4-5 hours",
              "As long as homework is done"
            ],
            correctIndex: 1,
            explanation:
              "The AAP recommends 1-2 hours of recreational screen time for children, with co-viewing when possible."
          },
          {
            question: "Which habit most improves evening sleep quality?",
            options: [
              "Using night mode only",
              "Keeping screens in the bedroom overnight",
              "Using a charging station outside the bedroom",
              "Shortening all daytime screen use to zero"
            ],
            correctIndex: 2,
            explanation:
              "A charging station outside the bedroom reduces late-night temptation and notification interruptions."
          },
          {
            question: "Co-viewing with a parent is helpful because:",
            options: [
              "It doubles screen time",
              "It turns passive watching into conversation",
              "It makes kids less independent",
              "It only works for movies"
            ],
            correctIndex: 1,
            explanation:
              "Co-viewing adds context, questions, and shared reflection, which makes media use more intentional."
          }
        ]
      },
      {
        id: "st-checklist",
        title: "Balance Builder",
        type: "checklist",
        content:
          "Steps to create a healthier screen time routine.",
        items: [
          { text: "Create a family screen schedule", icon: "📅", tip: "Use shared calendar blocks for device-free windows." },
          { text: "Designate tech-free times", icon: "🚫", tip: "Meals, homework time, and 1 hour before bed work well." },
          {
            text: "Set up device charging station outside bedrooms",
            icon: "🔌",
            tip: "Buy one charging hub and place it in the kitchen or living room."
          },
          { text: "Plan 3 offline activities per week", icon: "⚽", tip: "Include one walk, one game night, and one hobby session." },
          { text: "Use apps to track actual screen time", icon: "📊", tip: "Try built-in Screen Time or Digital Wellbeing tools." },
          { text: "Name a 'reset activity' after heavy use", icon: "🧘", tip: "Choose stretching, walking, or reading for 10 minutes." },
          { text: "Agree on do-not-disturb windows", icon: "🔕", tip: "Set automatic quiet hours on shared and personal devices." },
          { text: "Review weekly as a family", icon: "🗓️", tip: "Spend 10 minutes checking schedule adherence and adjusting limits." }
        ]
      },
      {
        id: "st-reflection",
        title: "Your Screen Time Story",
        type: "reflection",
        content:
          "Think about your average day. When do you feel best? When do screens help vs. when do they drain you?",
        items: [
          {
            title: "Energy Audit",
            description:
              "Notice whether screen use raises or lowers your energy.",
            action: "Note 1 example"
          },
          {
            title: "Connection Check",
            description:
              "Think about whether screens help or hurt family connection.",
            action: "Name 1 change"
          },
          {
            title: "Recovery Rule",
            description:
              "Pick one reset activity after heavy screen use.",
            action: "Schedule it weekly"
          },
          {
            title: "Triggers List",
            description:
              "List 2 situations where you tend to overuse screens.",
            action: "Write the triggers"
          }
        ]
      },
      {
        id: "st-activity",
        title: "Create Your Family Screen Schedule",
        type: "activity",
        content:
          "Design a weekly schedule that balances screen time with other activities.",
        items: [
          {
            title: "Morning Routine",
            description:
              "No screens until... (breakfast? dressed? out the door?)",
            action: "Set morning rule"
          },
          {
            title: "Homework First",
            description: "Screens only after homework and chores",
            action: "Agree on order"
          },
          {
            title: "Weekend Activities",
            description: "Plan offline fun for weekends",
            action: "List activities"
          },
          {
            title: "Buffer Zones",
            description:
              "Add 15-minute buffers before transitions like dinner or bedtime",
            action: "Add buffers"
          }
        ]
      }
    ]
  },
  {
    id: "online-safety",
    title: "Staying Safe Online",
    subtitle: "Respect, Boundaries, and Reporting",
    description:
      "Learn how to treat others kindly online, recognize risky situations, and know when and how to tell a trusted adult.",
    icon: "🛡️",
    color: "#38BDF8",
    lightColor: "#F0F9FF",
    duration: "30 min",
    ageGroup: "Ages 8+",
    role: "Whole Family",
    modulesCount: 4,
    hasAssessment: true,
    actionPauseCount: 1,
    isCourse: false,
    modules: [
      {
        id: "os-intro",
        title: "Digital Kindness",
        type: "lesson",
        content:
          "Being online doesn't change how we should treat people. Kind comments, respectful disagreements, and honest sharing create a better internet for everyone. Online interactions still have real emotional impact. This workshop helps families set shared standards for respectful behavior, recognize harmful dynamics early, and build a culture where everyone feels safe speaking up—or reaching out for help."
      },
      {
        id: "os-quiz",
        title: "Safety Knowledge Check",
        type: "quiz",
        content: "See how well you understand online boundaries and safety.",
        items: [
          {
            question: "Someone asks you to keep an online interaction secret. You should:",
            options: [
              "Keep it secret to be loyal",
              "Tell a trusted adult",
              "Block them quietly",
              "Share it publicly"
            ],
            correctIndex: 1,
            explanation:
              "Requests for secrecy can be a warning sign. Trusted adults can help you decide what to do next."
          },
          {
            question: "You see a friend being treated badly in a chat. A good next step is:",
            options: [
              "Ignore it",
              "Join in",
              "Support your friend and report it",
              "Tell everyone their secrets"
            ],
            correctIndex: 2,
            explanation:
              "Support and reporting are safer and more helpful than retaliation or silence."
          },
          {
            question: "A strong boundary statement usually includes:",
            options: [
              "An insult back",
              "A clear request and a consequence if ignored",
              "Silence for as long as possible",
              "Copying the rude behavior"
            ],
            correctIndex: 1,
            explanation:
              "Clear, calm boundaries work better than retaliation or silence."
          },
          {
            question: "If someone shares an intimate photo without consent, the best first response is to:",
            options: [
              "Forward it to stop the rumor",
              "Delete all shared photos and tell a trusted adult",
              "Reply publicly to shame them",
              "Ignore it"
            ],
            correctIndex: 1,
            explanation:
              "Preserve evidence, remove it if possible, and involve a trusted adult or platform/reporting path."
          }
        ]
      },
      {
        id: "os-checklist",
        title: "Safety Checklist",
        type: "checklist",
        content:
          "Use this checklist to help keep your family safer online.",
        items: [
          { text: "Use privacy settings together", icon: "🔒", tip: "Set profiles to private/friends-only and review together monthly." },
          { text: "Name 3 trusted adults to contact", icon: "🧑‍🏫", tip: "Include one parent, one teacher, and one family friend." },
          { text: "Save evidence of risky messages", icon: "📁", tip: "Take screenshots with metadata visible and store safely." },
          { text: "Agree on a no-blame reporting rule", icon: "🤝", tip: "Promise no punishment for reporting something uncomfortable." },
          { text: "Review apps and permissions", icon: "📱", tip: "Remove unused apps and revoke unnecessary permissions." },
          { text: "Create a list of safe spaces and safe people", icon: "✅", tip: "Write down apps, rooms, and adults that feel safe." },
          { text: "Set limits on stranger contact and DMs", icon: "🚫", tip: "Switch DMs to followers-only and decline unknown calls." },
          { text: "Practice a quick exit phrase if something feels off", icon: "🆘", tip: "Use a code word like 'red' to leave or get help immediately." }
        ]
      },
      {
        id: "os-reflection",
        title: "Respect and Boundaries",
        type: "reflection",
        content:
          "Consider what respectful online behavior looks like for your family and where boundaries should be stronger.",
        items: [
          {
            title: "Respect Rule",
            description:
              "Name one rule for respectful messaging and commenting.",
            action: "Write the rule"
          },
          {
            title: "Boundary Review",
            description:
              "Identify one app or space that needs clearer boundaries.",
            action: "Adjust settings"
          },
          {
            title: "Help-Seeking Plan",
            description:
              "Agree on how to ask for help without embarrassment.",
            action: "Share the plan"
          },
          {
            title: "Bystander Plan",
            description:
              "Pick one small way to support someone if you see unkind behavior online.",
            action: "Write one action"
          }
        ]
      },
      {
        id: "os-activity",
        title: "Family Online Safety Plan",
        type: "activity",
        content:
          "Create a short plan your family can actually use when something feels off online.",
        items: [
          {
            title: "Warning Signs",
            description:
              "List 4 signs that a conversation or request may be risky.",
            action: "Write list"
          },
          {
            title: "Response Steps",
            description:
              "Agree on 3 steps to take if someone feels uncomfortable.",
            action: "Practice the steps"
          },
          {
            title: "Support Script",
            description:
              "Create a simple script for reporting without shame.",
            action: "Post it nearby"
          },
          {
            title: "Follow-Up Routine",
            description:
              "Choose one weekly check-in question about online experiences.",
            action: "Add to calendar"
          }
        ]
      }
    ]
  },
  {
    id: "teen-digital-identity",
    title: "Social Media & Identity",
    subtitle: "Build a Reputation You Want to Keep",
    description:
      "For teenage users: understand how algorithms shape attention, protect your reputation, and set boundaries that keep social media useful instead of overwhelming.",
    icon: "🧑‍💻",
    color: "#F472B6",
    lightColor: "#FDF2F8",
    duration: "35 min",
    ageGroup: "Ages 13-17",
    role: "Teens",
    modulesCount: 4,
    hasAssessment: true,
    actionPauseCount: 1,
    isCourse: false,
    modules: [
      {
        id: "tdi-intro-1",
        title: "Your Online Identity Is Real",
        type: "lesson",
        content:
          "Colleges, employers, coaches, and future friends often look at public digital profiles before meeting someone in person. A post, photo, or comment can follow you longer than expected. This isn't about fear; it's about intentionality. What story do you want your digital presence to tell? Understanding reputation risk helps you choose posts, privacy settings, and platform behaviors that match your real values."
      },
      {
        id: "tdi-intro-2",
        title: "Algorithms, Attention, and Mental Health",
        type: "lesson",
        content:
          "Most platforms are designed to maximize attention, not wellbeing. Infinite scroll, autoplay, variable rewards, and engagement-driven ranking can increase anxiety, body-image pressure, comparison, and sleep loss. Knowing how these systems work helps you spot when an app is using you, instead of the other way around. You can still enjoy social media, but the best users treat it like a tool with boundaries, not an endless background habit."
      },
      {
        id: "tdi-quiz",
        title: "Digital Reputation Check",
        type: "quiz",
        content: "See how well you understand personal branding, privacy, and algorithm effects.",
        items: [
          {
            question: "A future employer sees your public profile. Which signal is usually strongest?",
            options: [
              "How many posts you have",
              "The tone and topics of what you share",
              "Which app you use most",
              "Your follower count"
            ],
            correctIndex: 1,
            explanation:
              "Employers and coaches usually assess character and judgment from visible posts, comments, and shared values."
          },
          {
            question: "Which choice best reduces algorithmic overuse?",
            options: [
              "Checking every notification instantly",
              "Using app timers, turning off nonessential notifications, and scheduling use",
              "Posting more content to stay visible",
              "Using the same app for hours straight"
            ],
            correctIndex: 1,
            explanation:
              "Intentional limits and fewer notifications reduce passive usage and attention capture."
          },
          {
            question: "A safe post for public sharing is usually:",
            options: [
              "Your address, schedule, or younger sibling's photo without permission",
              "General hobbies or achievements without private metadata",
              "A screenshot of a private group chat",
              "Location tags for your exact school or home"
            ],
            correctIndex: 1,
            explanation:
              "General achievements are usually fine; exact locations, private chats, and identifiable schedules are risky."
          },
          {
            question: "If a platform feels consistently stressful, a strong next step is:",
            options: [
              "Posting more often",
              "Auditing who you follow and setting usage limits",
              "Ignoring it",
              "Comparing yourself to top creators"
            ],
            correctIndex: 1,
            explanation:
              "Curating your feed and setting limits often reduces stress more than simply pushing through discomfort."
          }
        ]
      },
      {
        id: "tdi-checklist",
        title: "Teen Privacy & Reputation Hardening",
        type: "checklist",
        content:
          "Use this checklist to make your digital presence clearer, safer, and more intentional.",
        items: [
          { text: "Review who can see your posts and follower list", icon: "🔒", tip: "Switch to private/friends-only and audit followers monthly." },
          { text: "Turn off nonessential notifications", icon: "🔕", tip: "Keep only calls and texts; mute social apps." },
          { text: "Remove old posts with sensitive or impulsive content", icon: "🧹", tip: "Search your username and delete risky old posts." },
          { text: "Disable exact location sharing by default", icon: "📍", tip: "Turn off location tags and remove location history." },
          { text: "Audit connected apps and authorized logins", icon: "📱", tip: "Revoke access for apps you no longer use." },
          { text: "Choose one quiet time block without phone use", icon: "🧘", tip: "Try 30-60 minutes after school or before homework." },
          { text: "Write a short personal rule for what you will never post", icon: "📝", tip: "Write it down and keep it in notes for reminders." },
          { text: "Create an emergency off switch if a thread feels harmful", icon: "🆘", tip: "Use mute/block/report and tell a trusted adult immediately." }
        ]
      },
      {
        id: "tdi-reflection",
        title: "Platform Impact Check",
        type: "reflection",
        content:
          "Notice how specific apps and posts affect your mood, self-image, and attention.",
        items: [
          {
            title: "Mood Pattern",
            description:
              "Track one session and notice whether you leave feeling better or worse.",
            action: "Write 1 sentence"
          },
          {
            title: "Self-Image Check",
            description:
              "Notice whether a platform increases or decreases body or social confidence.",
            action: "Name 1 feeling"
          },
          {
            title: "Attention Audit",
            description:
              "Notice whether one app makes time feel faster or slower than expected.",
            action: "Note the difference"
          },
          {
            title: "Boundary Draft",
            description:
              "Pick one rule you want to enforce this week to protect your attention.",
            action: "Write the rule"
          }
        ]
      },
      {
        id: "tdi-activity",
        title: "Create Your Personal Digital Brand Plan",
        type: "activity",
        content:
          "Design a digital presence that reflects who you actually are and protects your future options.",
        items: [
          {
            title: "Identity Statement",
            description:
              "Write 2-3 sentences about what you want people to know about you online.",
            action: "Write statement"
          },
          {
            title: "Feed Cleanup",
            description:
              "Unfollow accounts that increase anxiety, comparison, or distraction.",
            action: "Curate 5 accounts"
          },
          {
            title: "Boundary Rules",
            description:
              "Set rules for posting, DMs, location, and time limits.",
            action: "Write 3 rules"
          },
          {
            title: "Weekly Reset",
            description:
              "Pick one weekly action to review your digital presence.",
            action: "Schedule review"
          }
        ]
      }
    ]
  },
  {
    id: "parents-digital-leadership",
    title: "Raising Digital Kids",
    subtitle: "Parent Leadership in a Connected Home",
    description:
      "For parents and caregivers: align household rules with child development, model healthy behavior, and create a family culture where digital tools support real-life growth.",
    icon: "👨‍👩‍👧‍👦",
    color: "#FB923C",
    lightColor: "#FFF7ED",
    duration: "40 min",
    ageGroup: "Parents / Caregivers",
    role: "Parents",
    modulesCount: 4,
    hasAssessment: true,
    actionPauseCount: 1,
    isCourse: false,
    modules: [
      {
        id: "pdl-intro-1",
        title: "Developmental Expectations by Age",
        type: "lesson",
        content:
          "Children and teens process online content differently depending on age, maturity, and neurodevelopment. Younger kids need more structure, fewer open accounts, and more co-viewing. Older kids need autonomy with guardrails, honest conversations, and trusted adult access when things go wrong. Parents do best when rules are age-calibrated, reviewed regularly, and explained as safety systems instead of control for its own sake."
      },
      {
        id: "pdl-intro-2",
        title: "Modeling Behavior Over Enforcing Rules",
        type: "lesson",
        content:
          "Children copy behavior more than they follow instructions. If adults want kids to put phones down during meals, be reachable at home, speak kindly online, and protect sleep, those habits need to be visible at the parent level. Modeling doesn't mean perfection; it means showing repair when you miss the mark. Apologizing for screen interruptions or resetting after a hard day teaches accountability better than a rule handed down without context."
      },
      {
        id: "pdl-quiz",
        title: "Parent Digital Leadership Check",
        type: "quiz",
        content: "Reflect on common parenting digital mistakes and stronger alternatives.",
        items: [
          {
            question: "A strong digital household rule usually:",
            options: [
              "Only targets the child",
              "Applies to the whole household and is explained with reasons",
              "Bans all technology permanently",
              "Changes every day without notice"
            ],
            correctIndex: 1,
            explanation:
              "Rules work better when they are consistent, shared, and explained rather than imposed on children alone."
          },
          {
            question: "Your teen sees an upsetting post. The best first move is:",
            options: [
              "Take the phone forever",
              "Ask open questions before fixing or punishing",
              "Ignore it",
              "Share it publicly"
            ],
            correctIndex: 1,
            explanation:
              "Curiosity and support create safer reporting habits than immediate punishment or dismissal."
          },
          {
            question: "Modeling healthy device use matters because:",
            options: [
              "Children notice adult inconsistency and lose trust in rules",
              "Children do not watch adult behavior",
              "Only school rules matter",
              "Phones are not influential"
            ],
            correctIndex: 0,
            explanation:
              "Modeling builds trust. When adults show repair after screen overuse, kids learn accountability."
          },
          {
            question: "A useful family conversation about social media usually:",
            options: [
              "Lectures without listening",
              "Includes questions, examples, and agreed next steps",
              "Never mentions real risks",
              "Happens only after a problem"
            ],
            correctIndex: 1,
            explanation:
              "Ongoing conversations with questions and agreements work better than lectures or reactive-only talks."
          }
        ]
      },
      {
        id: "pdl-checklist",
        title: "Household Digital Safety Setup",
        type: "checklist",
        content:
          "Create a home environment where digital safety is normal, shared, and supported.",
        items: [
          { text: "Set shared device-free zones and times", icon: "🚫", tip: "Pick dinner table, bedrooms, and one morning block." },
          { text: "Use parental controls matched to age and maturity", icon: "🔒", tip: "Try Google Family Link or iOS Screen Time with grace periods." },
          { text: "Agree on charging outside bedrooms overnight", icon: "🔌", tip: "Use one kitchen/living room charging hub." },
          { text: "Review apps, permissions, and privacy settings together", icon: "📱", tip: "Schedule a 15-minute monthly app review." },
          { text: "Name 3 trusted adults your child can contact anytime", icon: "🧑‍🏫", tip: "Include parent, teacher, and family friend." },
          { text: "Create a no-blame reporting agreement", icon: "🤝", tip: "Promise no punishment for reporting something uncomfortable." },
          { text: "Schedule a weekly 10-minute digital check-in", icon: "🗓️", tip: "Ask one open question about apps, friends, or stress." },
          { text: "Model one intentional screen habit you want to see in your child", icon: "🧘", tip: "Pick one behavior to change first and explain it openly." }
        ]
      },
      {
        id: "pdl-reflection",
        title: "Values, Boundaries, and Trust",
        type: "reflection",
        content:
          "Reflect on whether your household digital habits match the values you want to teach.",
        items: [
          {
            title: "Values Check",
            description:
              "List 3 family values and whether your household digital habits reflect them.",
            action: "Write 3 pairs"
          },
          {
            title: "Boundary Review",
            description:
              "Identify one boundary that feels unclear or inconsistently enforced.",
            action: "Name the boundary"
          },
          {
            title: "Trust Plan",
            description:
              "Pick one way to give your child more autonomy as they demonstrate readiness.",
            action: "Choose 1 step"
          },
          {
            title: "Repair Practice",
            description:
              "Write a short script for how you will acknowledge a digital rule miss as a parent.",
            action: "Write script"
          }
        ]
      },
      {
        id: "pdl-activity",
        title: "Create a Family Media Agreement",
        type: "activity",
        content:
          "Build a living family agreement for devices, privacy, help-seeking, and offline time.",
        items: [
          {
            title: "Device-Free Zones",
            description:
              "Agree on spaces and times where devices stay away or silent.",
            action: "List 3 zones"
          },
          {
            title: "Privacy and Sharing Rules",
            description:
              "Define what can be shared, who decides, and how to ask before posting.",
            action: "Write rules"
          },
          {
            title: "Help-Seeking Protocol",
            description:
              "Create a simple, no-shame path for reporting something uncomfortable.",
            action: "Post protocol"
          },
          {
            title: "Conversation Starters",
            description:
              "Pick 3 weekly prompts to discuss apps, friends, and experiences.",
            action: "Schedule check-ins"
          }
        ]
      }
    ]
  }
];
