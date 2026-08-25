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
    modules: [
      {
        id: "sm-intro",
        title: "Understanding Your Digital Footprint",
        type: "lesson",
        content:
          "Everything you post online creates a digital footprint that can last forever. Think before you share."
      },
      {
        id: "sm-quiz",
        title: "Spot the Fake News",
        type: "quiz",
        content: "Test your ability to identify trustworthy information online.",
        items: [
          {
            question:
              'You see a shocking headline on social media. What should you do first?',
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
            question:
              'A "friend" you don\'t know asks for personal info. You should:',
            options: [
              "Share it - they seem nice",
              "Ask your parents first",
              "Give fake info",
              "Block and report"
            ],
            correctIndex: 3,
            explanation:
              "Never share personal info with strangers online. Block and report suspicious accounts."
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
          { text: "Set profiles to private", icon: "🔒" },
          { text: "Turn off location sharing", icon: "📍" },
          { text: "Review friend/follower lists", icon: "👥" },
          { text: "Enable two-factor authentication", icon: "🛡️" },
          { text: "Discuss what NOT to share", icon: "🗣️" }
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
    modules: [
      {
        id: "cs-intro",
        title: "Why Cybersecurity Matters",
        type: "lesson",
        content:
          "Just like you lock your front door, you need to lock your digital life. Cybersecurity protects your family's information, photos, and identity."
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
          { text: "Use a password manager", icon: "🔑" },
          { text: "Update all devices and apps", icon: "📦" },
          { text: "Set up parental controls", icon: "👨‍👩‍👧‍👦" },
          { text: "Backup important photos/files", icon: "💾" },
          { text: "Create a family safe word for scams", icon: "🆘" }
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
    modules: [
      {
        id: "st-intro",
        title: "The Balance Equation",
        type: "lesson",
        content:
          "Screens are tools, not enemies. The key is balance - enough for learning and connection, but not so much that we miss real-world experiences."
      },
      {
        id: "st-quiz",
        title: "Screen Time Reality Check",
        type: "quiz",
        content: "How much do you really know about your habits?",
        items: [
          {
            question:
              "How long before bed should screens be turned off?",
            options: ["5 minutes", "30 minutes", "1 hour", "2 hours"],
            correctIndex: 2,
            explanation:
              "Blue light from screens suppresses melatonin. Turn off screens at least 1 hour before bed for better sleep."
          },
          {
            question:
              "A healthy daily screen time limit for kids (non-school) is:",
            options: [
              "No limit",
              "1-2 hours",
              "4-5 hours",
              "As long as homework is done"
            ],
            correctIndex: 1,
            explanation:
              "The AAP recommends 1-2 hours of recreational screen time for children, with co-viewing when possible."
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
          { text: "Create a family screen schedule", icon: "📅" },
          { text: "Designate tech-free times", icon: "🚫" },
          {
            text: "Set up device charging station outside bedrooms",
            icon: "🔌"
          },
          { text: "Plan 3 offline activities per week", icon: "⚽" },
          { text: "Use apps to track actual screen time", icon: "📊" }
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
    modules: [
      {
        id: "os-intro",
        title: "Digital Kindness",
        type: "lesson",
        content:
          "Being online doesn't change how we should treat people. Kind comments, respectful disagreements, and honest sharing create a better internet for everyone."
      },
      {
        id: "os-quiz",
        title: "Safety Knowledge Check",
        type: "quiz",
        content: "See how well you understand online boundaries and safety.",
        items: [
          {
            question:
              "Someone asks you to keep an online interaction secret. You should:",
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
            question:
              "You see a friend being treated badly in a chat. A good next step is:",
            options: [
              "Ignore it",
              "Join in",
              "Support your friend and report it",
              "Tell everyone their secrets"
            ],
            correctIndex: 2,
            explanation:
              "Support and reporting are safer and more helpful than retaliation or silence."
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
          { text: "Use privacy settings together", icon: "🔒" },
          { text: "Name 3 trusted adults to contact", icon: "🧑‍🏫" },
          { text: "Save evidence of risky messages", icon: "📁" },
          { text: "Agree on a no-blame reporting rule", icon: "🤝" },
          { text: "Review apps and permissions", icon: "📱" }
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
          }
        ]
      }
    ]
  }
];
