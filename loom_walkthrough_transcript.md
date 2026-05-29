# 🎙️ Loom Walkthrough Transcript: Ghost Coach Demonstration

This document provides a highly conversational, natural, and humanized script for your **3-5 minute Loom video walkthrough**. It is structured to help you speak smoothly and confidently while showcasing the premium design, engineering details, and robust feature sync.

---

## ⏱️ Video Scene & Timeline Guide

| Scene | Duration | Screen Focus | Speaking Goal |
|---|---|---|---|
| **1. Intro & Stack** | 0:00 - 0:45 | IDE / Docker / Dashboard | Welcome, system health, and 3-container docker orchestration |
| **2. Secure Auth** | 0:45 - 1:20 | Register / Login UI | Dynamic athlete profile capture, BCrypt-12, and JWT |
| **3. AI Stance Upload** | 1:20 - 2:15 | Upload Page | Upload stance photo, explain Tika magic-byte checks & Gemini 2.5 Flash |
| **4. Feedback & Legend** | 2:15 - 3:00 | Session Detail Page | Walk through score card, priority fixes, and anatomical legend |
| **5. Live Session Sync** | 3:00 - 3:45 | Navbar Navigation | Show real-time state persistence across navigation tabs |
| **6. Coach's Chat & Progress**| 3:45 - 5:00 | Chat Panel / Progress | Ask a live question, show Recharts analytics, and wrap up |

---

## 🎬 Conversational Script & Stage Directions

### Scene 1: Introduction & System Health (0:00 - 0:45)
* **Visuals**: Start with your browser open to the **Dashboard** (`http://localhost:3000`) or showing a terminal window with your Docker containers actively running.
* **Stage Direction**: *Smile, speak with an energetic, friendly, and conversational tone. Act as if you are showing this to a fellow developer.*

> **"Hey everyone! Welcome to Ghost Coach. I am super excited to show you this platform today. It is a production-grade, AI-powered sports coaching assistant designed to help athletes analyze their technique, get structured reviews, and chat directly with an AI coach.**
>
> **Under the hood, everything is orchestrated using Docker Compose across three separate containers: we have our React frontend serving on port 3000, our Spring Boot Java API running on port 8080, and a PostgreSQL 15 database on port 5432. All systems are fully active, verified as healthy, and talking to each other in real-time. Let's dive in!"**

---

### Scene 2: Authentication & Profile Calibration (0:45 - 1:20)
* **Visuals**: Navigate to the **Register Page** (`http://localhost:3000/register`).
* **Stage Direction**: *Type out a quick test user. Highlight how simple the form is but how much is happening under the hood.*

> **"First, let's create a new athlete profile. As you can see, our registration captures key athletic dimensions—like the sport, experience level, and targeted role. This is crucial because every single piece of coaching feedback generated later is calibrated exactly to this profile.**
>
> **Security-wise, we take no shortcuts. Passwords are salted and hashed using BCrypt with a strength factor of 12 right at our database boundary. Once registered, the backend issues a stateless JWT token using the `jjwt` library, which is automatically saved in local storage to keep the session secure."**

---

### Scene 3: Intelligent Stance Upload & Security Checks (1:20 - 2:15)
* **Visuals**: Click **"Analyze"** in the navigation bar to go to the Upload page. Drag and drop a sports stance photo (e.g., a football shooting stance or basketball form).
* **Stage Direction**: *Click 'Analyze with Ghost Coach'. As the loading spinner works, explain the backend validation.*

> **"Now, here is where the magic happens. I'm going to head to the Analyze section and drop in a photo of a player striking a football. When I click 'Analyze', a series of security filters are triggered immediately.**
>
> **Rather than just trusting a basic file extension—which can be easily faked—our API uses Apache Tika to inspect the raw magic bytes of the image stream. This guarantees that the file is a genuine image under 5 megabytes, completely neutralizing malicious executable uploads.**
>
> **The backend then packages our user profile and image bytes into a highly structured prompt and shoots it over to the Google Gemini 2.5 Flash Vision API using Spring's reactive `WebClient` for fast, non-blocking performance."**

---

### Scene 4: Stance Feedback & Anatomical Legend (2:15 - 3:00)
* **Visuals**: Let the analysis load and reveal the **Session Detail Page**. Hover over the strengths, areas to improve, and point to the interactive annotation legend panel.
* **Stage Direction**: *Speak with excitement about the visual aesthetics and clean typography.*

> **"And check this out! Our feedback card is rendered. The Gemini 2.5 model has analyzed our form, returning an overall score of 6 out of 10, complete with high-confidence indicators.**
>
> **Architecturally, I opted for a hybrid database design. While user profiles are strictly structured, all the AI-generated feedback lists and joint annotations are saved in PostgreSQL JSONB columns. This lets us save nested, variable-length AI outputs with zero N+1 database queries.**
>
> **Our React frontend parses this data elegantly, displaying strengths, formatted improvement cards, and an interactive anatomical legend board that numbers exactly what to fix and how critical it is."**

---

### Scene 5: Real-Time Session & Navigation Sync (3:00 - 3:45)
* **Visuals**: Click on **"Dashboard"** in the Navbar, then click **"Progress"**, and finally click **"Analyze"** to return back to the upload screen. Show that the uploaded image and result are still fully loaded!
* **Stage Direction**: *Show the transition between pages. Highlight how smooth and synchronized it feels.*

> **"Now, let me show you one of the coolest engineering updates we've made: real-time routing synchronization.**
>
> **In standard React apps, navigating between navigation tabs unmounts the page, which would normally wipe out your active file, loading wheel, or newly generated coaching card. To prevent this, I built a global `UploadContext` wrapper.**
>
> **Watch this: if I click away to our Dashboard or check out our Progress charts, and then come right back to the Analyze section... everything is perfectly preserved in real-time! The active preview, the AI result, and the upload states are completely synchronized across the entire application lifecycle."**

---

### Scene 6: Coach Chat, Progress, & Wrap-Up (3:45 - 5:00)
* **Visuals**: Scroll down to the **"Coach Chat"** panel. Type: *"Can you break down the Wall Passing Drill into 3 simple steps for a beginner?"* and hit send. Watch the response render, then quickly show the **Progress Page** Recharts analytics and the **Swagger UI** (`http://localhost:8080/docs`).
* **Stage Direction**: *Keep it casual but highly professional as you wrap up the video.*

> **"We also added an interactive 'Coach Chat' for follow-up questions. I'll ask for some beginner tips on my recommended drill. When I press send, the backend loads the entire session context—including our score and flaws—and feeds it to the AI. **
>
> **Our custom parsing engine handles the text beautifully, displaying clean, flex-based lists and badge numbers without any broken markdown fences or raw asterisks.**
>
> **Finally, athletes can track their performance over time in the 'Progress' tab, featuring a premium, gradient-filled area chart powered by Recharts. For developer testing, we also have fully authorized interactive Swagger documentation exposed at `/docs`.**
>
> **With Flyway migration files, whitelisted JWT controllers, and JSR-380 validation, this is a clean, fully-optimized codebase ready for production. Thanks so much for watching!"**

---

## 💡 Quick Tips for a Flawless Recording

1. **Clear Your Console**: Make sure your browser developer console has no active warnings showing.
2. **Slow Down Your Clicks**: Give the viewer 1-2 seconds to read the screen before clicking on the next navigation tab.
3. **No Dead Air**: If the AI chat or stance analysis is processing, fill that time by explaining the background context (e.g., *"Right now, WebClient is handling this asynchronously, keeping our server threads free..."*).
4. **Use a Quiet Room**: Clean audio makes a massive difference in how professional the presentation feels!
