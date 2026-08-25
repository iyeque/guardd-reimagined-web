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
    duration: "25 min",
    ageGroup: "Ages 10+",
    modules: [
      {
        id: "sm-intro",
        title: "Understanding Your Digital Footprint",
        type: "lesson",
        content:
          "Everything you post online creates a digital footprint that can last forever. Think before you share!"
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
          "Take a moment to reflect on your social media habits and how they affect your mood."
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
    duration: "30 min",
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
    duration: "20 min",
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
          "Think about your average day. When do you feel best? When do screens help vs. when do they drain you?"
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
  }
];
