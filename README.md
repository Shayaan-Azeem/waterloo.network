# uwaterloo.network

A webring for University of Waterloo students.

---

## Join the Webring

**Requirements:** UWaterloo student + personal website

### 1. Add your photo

Save a square image (400x400px) to:
```
public/photos/your-name.jpg
```

### 2. Add yourself to `src/data/members.ts`

```typescript
{
  id: "your-name",
  name: "Your Name",
  website: "https://yourwebsite.com",
  profilePic: "/photos/your-name.jpg",
  connections: ["shayaan-azeem"],  // friends in the webring
},
```

Optional fields: `program`, `year`, `instagram`, `twitter`, `linkedin` (use full URLs)

### 3. Submit a pull request

---

## Add the Widget to Your Site

```html
<script 
  src="https://uwaterloo.network/embed.js" 
  data-webring
  data-user="your-name"
></script>
```

**What it does:**
- Center icon → links to [uwaterloo.network](https://uwaterloo.network)
- Arrows → open your connections' websites

**Customize:** Add `data-color="red"` or `data-arrow="chevron"` for different styles.

---

made with ❤️ by shayaan, kevin, daniel, casper
