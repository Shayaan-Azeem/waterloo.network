/**
 * UWATERLOO WEBRING MEMBERS
 * 
 * To add yourself to the webring:
 * 1. Fork this repository
 * 2. Add your profile picture to /public/photos/ (see below)
 * 3. Add your entry to the members array below
 * 4. Submit a pull request
 * 
 * Required fields:
 * - id: Your name with hyphens (e.g., "john-doe")
 * - name: Your full name
 * - website: Your personal website URL (required to be part of the webring!)
 * 
 * Optional fields:
 * - program: Your program at UWaterloo
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

  {
    id: "shayaan-azeem",
    name: "Shayaan Azeem",
    website: "https://shayaanazeem.com",
    program: "Applied Math",
    profilePic: "/photos/shayaan-azeem.jpg",
    instagram: "https://instagram.com/shayaan.azeem",
    twitter: "https://x.com/shayaan",
    linkedin: "https://linkedin.com/in/shayaan-azeem",
    connections: ["daniel-ching", "fiona-cai", "kevin-thomas"],
  },
  {
    id: "zane-beeai",
    name: "Zane Beeai",
    website: "https://zanebeeai.com/c/waterloo network",
    program: "Biomedical Engineering",
    year: "2030",
    profilePic: "/photos/zane-beeai.png",
    instagram: "https://www.instagram.com/zanevsgravity/",
    twitter: "https://x.com/zanebeeai",
    linkedin: "https://www.linkedin.com/in/zane-beeai/",
    connections: ["shayaan-azeem"],
  },
  {
    id: "daniel-ching",
    name: "Daniel Ching",
    website: "https://danielcwq.com",
    program: "Computer Science",
    year: "2030",
    profilePic: "/photos/daniel-ching.png",
    instagram: "https://www.instagram.com/daniel_cwq/",
    twitter: "https://x.com/danielchingwq",
    linkedin: "https://www.linkedin.com/in/danching/",
    connections: ["shayaan-azeem"],
  },
  {
    id: "kevin-thomas",
    name: "Kevin Thomas",
    website: "https://kevinjosethomas.com",
    program: "Computer Science",
    profilePic: "/photos/kevin-thomas.png",
    instagram: "https://instagram.com/kevinjosethomas",
    twitter: "https://x.com/kevinjosethomas",
    linkedin: "https://linkedin.com/in/kevinjosethomas",
    connections: ["shayaan-azeem", "daniel-ching"],
  },
  {
    id: "fiona-cai",
    name: "Fiona Cai",
    website: "https://fiona-cai.vercel.app",
    program: "Computer Science",
    year: "2030",
    profilePic: "/photos/fiona-cai.jpg",
    instagram: "https://instagram.com/fcaiona",
    twitter: "https://x.com/fcaiona",
    linkedin: "https://linkedin.com/in/fiona--cai",
    connections: [],
  },
  {
    id: "muhib-waqar",
    name: "Muhib Waqar",
    website: "https://muhibwaqar.com",
    program: "Math/Business",
    year: "2030",
    profilePic: "/photos/muhib-waqar.jpg",
    instagram: "https://instagram.com/muhibwqr",
    twitter: "https://x.com/muhibwqr",
    linkedin: "https://linkedin.com/muhibwaqar",
    connections: ["shayaan-azeem"],
  },
  {
    id: "aayan-rahman",
    name: "Aayan Rahman",
    website: "https://aayanrahman.me",
    program: "Electrical Engineering",
    year: "2030",
    profilePic: "/photos/aayan-rahman.PNG",
    instagram: "https://www.instagram.com/aayanr300/",
    twitter: "https://x.com/aayanr07",
    linkedin: "https://www.linkedin.com/in/aayan-rahman/",
    connections: ["zane-beeai", "shayaan-azeem"],
  },
  {
    id: "ibrahim-ansari",
    name: "Ibrahim Ansari",
    website: "https://ibrahimansari.ca/",
    program: "Management Engineering",
    year: "2030",
    profilePic: "/photos/ibrahim-ansari.png",
    instagram: "https://www.instagram.com/ibrahim.ansr/",
    twitter: "https://x.com/ibrahimansr",
    linkedin: "https://www.linkedin.com/in/ibrahim-ansari-code/",
    connections: ["muhib-waqar"],
  },
  {
    id: "pranav-marthi",
    name: "Pranav Marthi",
    website: "https://pranavmarthi.com",
    program: "Software Engineering",
    year: "2030",
    profilePic: "/photos/pranav-marthi.png",
    instagram: "https://www.instagram.com/pranav.marthi/",
    twitter: "https://x.com/pranavcmarthi",
    linkedin: "https://www.linkedin.com/in/pranav-marthi-7714a4215/",
    connections: ["shayaan-azeem", "zane-beeai", "kevin-thomas"]
  },
  {
    id: "victor-huang",
    name: "Victor Huang",
    website: "https://victor-huang.ca",
    program: "Computer Science",
    year: "2029",
    profilePic: "/photos/victor-huang.png",
    instagram: "https://www.instagram.com/vichua061001/",
    linkedin: "https://www.linkedin.com/in/victor-qibin-huang/",
    connections: ["shayaan-azeem"]
  },
  {
    id: "avaansh-nanda",
    name: "Avaansh Nanda",
    website: "https://www.avaansh-nanda.com/",
    program: "CFM",
    year: "2030",
    profilePic: "/photos/avaansh-nanda.jpg",
    instagram: "https://www.instagram.com/avaanshnanda/",
    linkedin: "https://www.linkedin.com/in/avaansh-nanda/",
    connections: ["shayaan-azeem", "pranav-marthi"]
  },
    {
    id: "casper-dong",
    name: "Casper Dong",
    website: "https://casperdong.com",
    program: "Knowledge Integration",
    year: "2030",
    profilePic: "/photos/casper-dong.jpg",
    twitter: "https://x.com/casperkeyidong",
    linkedin: "https://www.linkedin.com/in/casper-dong-64b623207/",
    connections: ["shayaan-azeem", "pranav-marthi", "kevin-thomas"]
  },
  {
    id: "justin-wu",
    name: "Justin Wu",
    website: "https://justinwu.net",
    program: "Systems Design Engineering",
    year: "2030",
    profilePic: "/photos/justin-wu.jpg",
    twitter: "https://x.com/byjustinwu",
    linkedin: "https://www.linkedin.com/in/justin-wu-171481162/",
    connections: ["shayaan-azeem", "daniel-ching", "casper-dong", "kevin-thomas", "aayan-rahman"]
  },
  {
    id: "tony-pan",
    name: "Tony Pan",
    website: "https://www.tony-pan.com",
    program: "Computer Science",
    year: "2030",
    profilePic: "/photos/tony-pan.jpg",
    instagram: "https://www.instagram.com/7onypan/",
    twitter: "https://x.com/tpypan",
    linkedin: "https://www.linkedin.com/in/tony-py-pan/",
    connections: ["shayaan-azeem", "zane-beeai", "pranav-marthi", "casper-dong", "aayan-rahman"]
  },
  {
    id: "alex-xu",
    name: "Alex Xu",
    website: "https://www.alexxu.ca/",
    program: "Computer Science",
    year: "2028",
    profilePic: "/photos/alex-xu.jpg",
    twitter: "https://x.com/aalex_xu",
    linkedin: "https://www.linkedin.com/in/alex-xu7/",
    connections: ["shayaan-azeem"]
  },
  // ============================================
  // ADD YOUR ENTRY ABOVE THIS LINE
  // ============================================
];

// Helper to get all connections for the network graph
export function getConnections(): Connection[] {
  const connections: Connection[] = [];
  
  members.forEach(member => {
    if (member.connections) {
      member.connections.forEach(targetId => {
        // Only add connection if target member exists
        if (members.some(m => m.id === targetId)) {
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
export function getWebringNavigation(currentWebsite: string): { prev: Member | null; next: Member | null } {
  const index = members.findIndex(m => m.website === currentWebsite);
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
