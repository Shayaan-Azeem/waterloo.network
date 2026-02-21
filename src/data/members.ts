/**
 * UHOUSTON WEBRING MEMBERS
 *
 * To add yourself to the webring, visit the join page at uhouston.network/join
 *
 * Required fields:
 * - id: Your name with hyphens (e.g., "john-doe")
 * - name: Your full name
 * - website: Your personal website URL (required to be part of the webring!)
 *
 * Optional fields:
 * - program: Your program/major at UH
 * - year: Your graduation year
 * - profilePic: Path to your photo (see instructions below)
 * - instagram: Full URL to your Instagram profile
 * - twitter: Full URL to your Twitter/X profile
 * - linkedin: Full URL to your LinkedIn profile
 * - connections: Names of friends with hyphens (e.g., ["john-doe", "jane-smith"])
 *
 * ADDING YOUR PROFILE PICTURE:
 * 1. Use a square image, ideally 400x400 pixels (your Twitter/X profile pic works great!)
 * 2. Save it as: public/photos/your-name.jpg (or .png)
 * 3. Set profilePic to: "/photos/your-name.jpg"
 */

export interface Member {
  id: string;
  name: string;
  website: string;
  program?: string;
  year?: string;
  profilePic?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  connections?: string[]; // IDs of other members you want to connect with
}

// Connection type for the network graph
export interface Connection {
  fromId: string;
  toId: string;
}

export const members: Member[] = [
  // ============================================
  // ADD YOUR ENTRY BELOW THIS LINE
  // ============================================

  // Example entry (copy this as a template):
  // {
  //   id: "john-doe",
  //   name: "John Doe",
  //   website: "https://johndoe.com",
  //   program: "Computer Science",
  //   year: "2026",
  //   profilePic: "/photos/john-doe.jpg",
  //   instagram: "https://instagram.com/johndoe",
  //   twitter: "https://x.com/johndoe",
  //   linkedin: "https://linkedin.com/in/johndoe",
  //   connections: ["jane-smith", "bob-wilson"],
  // },

  // ============================================
  {
    id: "sami-hamdalla",
    name: "Sami Hamdalla",
    website: "https://www.linkedin.com/in/sami-hamdalla/",
    program: "Computer Science",
    year: "2026",
  },
  {
    id: "yusuf-khan",
    name: "Yusuf Khan",
    website: "https://www.linkedin.com/in/yusufkh/",
    program: "Computer Science",
    year: "2026",
    twitter: "https://x.com/Ymkhan0",
    linkedin: "https://www.linkedin.com/in/yusufkh/",
    connections: ["sami-hamdalla", "sami-hamdalla"],
  },
  // ADD YOUR ENTRY ABOVE THIS LINE
  // ============================================
];

// Helper to get all connections for the network graph
export function getConnections(): Connection[] {
  const connections: Connection[] = [];

  members.forEach((member) => {
    if (member.connections) {
      member.connections.forEach((targetId) => {
        // Only add connection if target member exists
        if (members.some((m) => m.id === targetId)) {
          connections.push({
            fromId: member.id,
            toId: targetId,
          });
        }
      });
    }
  });

  return connections;
}

// Helper to get the next and previous members for webring navigation
export function getWebringNavigation(currentWebsite: string): {
  prev: Member | null;
  next: Member | null;
} {
  const index = members.findIndex((m) => m.website === currentWebsite);
  if (index === -1) {
    return { prev: null, next: null };
  }

  const prevIndex = (index - 1 + members.length) % members.length;
  const nextIndex = (index + 1) % members.length;

  return {
    prev: members[prevIndex],
    next: members[nextIndex],
  };
}

// Get a random member (useful for the webring widget)
export function getRandomMember(): Member {
  return members[Math.floor(Math.random() * members.length)];
}
