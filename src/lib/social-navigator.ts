/**
 * Social Navigator scenario data and verdict logic.
 *
 * Extracted from the component so the verdict rule is testable rather than
 * living inside JSX. The bug this guards against: the result panel used to be
 * coloured by matching English words in the copy —
 *
 *   outcome.includes("Great") || outcome.includes("Perfect") || ...
 *
 * — so the colour of an answer depended on its wording. Editing a single word
 * could flip a wrong answer to green, and the whole thing breaks the moment the
 * content is translated. The `ok` field on each option is the verdict; the copy
 * is only what the user reads.
 */

export type SocialOption = {
  text: string;
  result: string;
  /** The verdict. This, and only this, decides whether an answer is safe. */
  ok: boolean;
};

export type SocialScenario = {
  text: string;
  options: SocialOption[];
};

export const SOCIAL_NAVIGATOR_SCENARIOS: SocialScenario[] = [
  {
    text: "A friend posts something mean about another friend. They ask you to 'like' it. What do you do?",
    options: [
      { text: "Like it to stay in the group.", result: "Bad move. You encouraged bullying.", ok: false },
      { text: "Ignore it and talk to them privately.", result: "Great choice! You didn't escalate and showed maturity.", ok: true },
    ],
  },
  {
    text: "A stranger in a game offers you 'free credits' if you click a link and login. What is your response?",
    options: [
      { text: "Click it—I need the credits!", result: "Phishing attack! Your account was stolen.", ok: false },
      { text: "Report the player and ignore the link.", result: "Perfect! You recognized a scam and protected your data.", ok: true },
    ],
  },
  {
    text: "Your sibling leaves their phone unlocked. You see an embarrassing text. What do you do?",
    options: [
      { text: "Take a photo and send it to your friends.", result: "Privacy violation. This destroys trust and could lead to trouble.", ok: false },
      { text: "Lock the phone and respect their privacy.", result: "Honorable! You treated their digital space with respect.", ok: true },
    ],
  },
  {
    text: "You want to post a photo of your friends, but one of them looks bad in it. They didn't see it yet.",
    options: [
      { text: "Post it anyway, I look great!", result: "Disrespectful. Always ask for consent before posting others.", ok: false },
      { text: "Ask them if they're okay with you posting it.", result: "Consent is key! Your friends appreciate the respect.", ok: true },
    ],
  },
];

/**
 * The verdict for a chosen option. Deliberately reads only `ok` — never the
 * wording of `result`, which is translated copy and must not carry meaning.
 */
export function isSafeChoice(option: SocialOption): boolean {
  return option.ok === true;
}
