# Research: the media platform — products

Collected 2026-10-11 for TICKET-060. The question: how do AI media products that generate *and*
edit organise the work, the media, the timeline and image editing? Then: what that means for
Aivia's project screen. Sources are vendor docs, help centres, changelogs and blog posts, plus
third-party reviews where an app is behind a login. Several help centres refuse automated reads
(Runway, Canva, Adobe helpx, Freepik return 403). For those, the claims come from search-engine
excerpts of the help pages themselves, and the page URL is cited. Competitors' reviews of each
other (LTX on Higgsfield, Valmera on Kapwing, Dreamina on LTX) are flagged as such.

## 1. Product by product

### 1.1 LTX Studio: the closest model

- **The unit is the Project.** "A project includes its own connected Gen Space, Storyboard,
  Timeline and Pitch Deck." Before Projects these were "separate silos". Clicking image or
  video generation on the homepage "now opens a new Gen Space inside a new Project", so starting
  to create *is* starting a project. You can enter from any of the tools and switch between them
  inside the project. ([Introducing Projects](https://ltx.io/blog/introducing-projects))
- **Where results land:** "All new generations are saved in both the Gen Space of the project
  and in 'My Assets'": a project bin plus a personal library of everything. Inside a project's
  Gen Space, generations are grouped into **sessions** ("by shot, concept or iteration"), which
  you add with a plus and rename. That replaced "one continuous feed". (same source)
- **Consolidation through prompting.** The same release *removed* tools: Motion Editor, Generative
  Fill, Remove Objects, Composition, Face Expressions. "You can now prompt to remove objects
  directly in the Gen Space." The storyboard was "decluttered … less about editing". Separate
  one-purpose edit tools gave way to one prompt surface. (same source)
- **Storyboard → Timeline.** You drag generated clips into sequence in the Storyboard, then set
  duration and transition and add audio layers. The editing is non-destructive: "you're arranging
  references, not files". ([LTX tutorial](https://ltx.io/blog/ltx-studio-tutorial)) Deleting
  or moving a shot on the Timeline "will be reflected in your storyboard"
  ([TechRadar review via search excerpt](https://www.techradar.com/pro/software-services/ltx-studio-ai-video-production-review)).
- **The timeline (January 2026):** "two video channels and up to five audio channels"; reorder,
  split, trim handles, duplicate, insert clips into empty spaces. Any clip "can be selected and
  sent back into the generation space", re-prompted, and the approved version "applies to the
  existing clip … without rebuilding the surrounding edit". Narration comes from text-to-speech
  on its own track. Export is XML for Premiere and Resolve. It cannot import camera footage,
  only images. ([CineD, 2026-01-16](https://www.cined.com/ltx-studio-takes-its-next-big-step-editing/))
  Later: build a timeline straight from the homepage, insert several clips at once from the
  media library, snapping, undo and redo ([Introducing Projects](https://ltx.io/blog/introducing-projects)).
- **Generation from the edit:** Retake regenerates "any 2-16 second segment within a video …
  while preserving surrounding footage". Elements are characters, objects and locations saved
  once and tagged with `@`. ([Top features 2026](https://ltx.io/blog/top-ltx-studio-features))
- **Phone:** none. "The workspace and tools need larger screens … not supported on mobile
  devices, either through browser or a mobile app"; users get a blocker message
  ([LTX help](https://help.ltx.io/hc/en-us/articles/32040016157970-Why-can-t-I-use-LTX-Studio-on-mobile)).
- **What reviews say:** praised for script-to-storyboard, consistency, and revision rollback per
  scene. Criticised for a "steep learning curve compared to simpler clip generators" and slow
  renders at peak ([Dupple](https://dupple.com/reviews/ltx-studio); editorial, not hands-on).

### 1.2 Runway: chat with a timeline tab

- **The unit:** an Agent session. Since August 2026 (Enterprise), "Agent sessions live inside
  Projects", with project assets and brand kits available in the session
  ([changelog](https://runway.com/changelog)). Elsewhere the dashboard has "Projects" (saved work,
  including timelines) and "Assets" (folders): every generation goes automatically to an "All
  Generations" folder, uploads go to "Private", and Shift-click does batch actions
  ([Academy](https://academy.runwayml.com/getting-started/dashboard-overview),
  [organising assets](https://help.runwayml.com/hc/en-us/articles/23998498329107-How-to-organize-assets), via search excerpts).
- **Generation to edit:** on 9 July 2026 "Studio's timeline editor moved into Agent". It is the
  **Final Cut tab of the Agent panel**, opened from a "New timeline" card below the message box,
  "an empty timeline with Agent chat alongside it". You can edit by hand, through chat, or both
  ([help: Trimming and Assembling Clips in Studio](https://help.runwayml.com/hc/en-us/articles/52685547867667-Trimming-and-Assembling-Clips-in-Studio), via search excerpt).
- **The timeline:** drag clips from the Assets panel, or double-click to place one at 0:00.
  Split at the playhead with ⌘B. Trim down to about 0.1 s. Right-click → Detect Shots splits at
  scene changes. **"Images are not currently supported in the timeline."** (same source)
- **Design stance:** the engineers write that the artifact "stays at the center of the
  experience" and the chat is secondary. Many images come back as a grid. Users "need something
  visual to react to before they can refine it". They like, discard, and **drag items back into
  the chat** to redirect the work. Agentic and manual editing happen in one session.
  ([Inside building Runway Agent](https://runway.com/news/engineering/inside-building-runway-agent))
- **Image editing:** Seedream 5.0 Layers splits an image into layers you can transform (August
  2026). Edit Studio applies a one-frame edit to the whole video (May 2026). ([changelog](https://runway.com/changelog))
- **Reviews:** the Agent does well on simple projects. "Complex sequences with specific timing
  requirements" still go to manual tools, and costs add up (about 250 credits for 10 s at 1080p)
  ([fast.io](https://fast.io/resources/runway-ai-review-2026/); written by a vendor of a competing workspace).

### 1.3 Krea: a timeline in the agent's preview panel

- **Shell:** one sidebar holds every tool (image, video, enhance, edit, 3D, realtime). "Sessions
  carry over between them", live indicators show running jobs, and a global search covers
  sessions. Results drag between tools ("dragging it straight into the enhancer"). Mobile was
  "rebuilt from scratch … now its own thing", not the desktop on a smaller screen.
  ([Krea redesign, 2026-03-02](https://www.krea.ai/blog/redesign))
- **The timeline (17 September 2026):** it sits in the **preview panel beside the chat**. Clicking
  a generated video opens it in the preview with the timeline below. Two video and two audio
  tracks to start, up to eight, with mute per audio track. **Add media** picks a generation from
  the session or an upload. Video, audio, PNG, JPG and WebP are accepted: "Still images work as
  title or end cards". Cut at the playhead (`C`), drag to move, drag an edge to trim, Delete,
  snap to clip edges. **Generative extend:** hold ⌘ and drag a clip's end. A striped "+6s
  extension" region appears, then an optional prompt (2 to 10 s, priced like a generation of
  that length). Export renders on the server to an MP4 in the session files (1280×720 at 24 fps
  by default). The timeline autosaves in the session. "The agent … does not operate the
  timeline." ([How to edit video with Krea Agent](https://www.krea.ai/blog/how-to-edit-video-with-krea-agent))
- **Item actions** (from research-app.md §3): image hover gives fullscreen, edit, upscale, video
  (as a start frame) and download. Row hover gives retry, reuse parameters, download all.

### 1.4 Kapwing: chat makes it, the studio finishes it

- **Unit:** the Studio project, a canvas with layers. Kai, the agent, is reachable from the left
  sidebar, the homepage box ("What are you creating today") and an **AI tab inside the editor**.
  Before spending credits it returns a **storyboard** "to make changes to the script, B-roll,
  aspect ratio, and voice over". Detailed edits go to the Studio: "use Kapwing Studio for those
  edits". ([AI video generator help](https://www.kapwing.com/help/ai-video-generator/))
  "Every project you make with Kai can be edited layer-by-layer", because "generative AI is
  rarely 100% correct" ([Giving AI a canvas](https://www.kapwing.com/blog/giving-ai-a-canvas-to-paint-on/)).
- **Layout:** media sidebar on the left (each thumbnail has a Preview to trim before adding), the
  canvas in the middle, an edit sidebar on the right for the selected layer, the timeline at the
  bottom with an X to close it and "Open Timeline" to reopen it. **An image project is the same
  editor with no duration.** Setting one in the Timing tab adds a timeline, and "Convert to Image"
  removes it. Split with `S` or the Split button. "Ripple Delete" closes the gap. Export as MP4,
  GIF, JPEG or MP3. ([Timeline tutorial](https://www.kapwing.com/help/timeline-tutorial/))
- **Image editing:** describe the change in chat (colours, viewpoint, expand, add or remove
  objects, background), or select the image in the Studio and use the right panel (colour and
  lighting, enhance, blur, opacity, Erase for the background)
  ([AI image editor help](https://www.kapwing.com/help/how-to-edit-an-image/)).
- **Complaints:** a generation that misses "generally consumes the credits". "My Media … can be
  cleared with browser cache or site data and is explicitly not recommended as a permanent
  archive". Delete is permanent with no trash. "Later changes may be unrecoverable" after a
  browser failure. ([Valmera, 2026-08](https://valmera.io/blog/kapwing-review); a competitor)

### 1.5 Descript: the timeline collapsed by default

- **Unit:** a project holds **compositions** (where editing happens, non-destructive) and
  **Files** (imported and recorded media, in folders) in one Project panel
  ([projects overview](https://help.descript.com/working-in-projects/overview), via search excerpt).
- **Layout:** script editor, scene editor (the preview), timeline, and a sidebar of panels:
  Project, Scene, Layer, Elements, Media, AI Tools, Underlord
  ([editor interface](https://help.descript.com/descript-tour/the-editor-interface.md)).
  "When you open a project, the timeline is fully collapsed." "Most editing in Descript happens
  in the script, but the timeline is where you finesse the details." Tools: Blade, Slip, Hand,
  Range. Storyboard View is a grid of all scenes.
  ([Timeline overview](https://help.descript.com/timeline/timeline-overview.md))
- **Generation from the edit:** put **placeholders** in scenes where B-roll should go, open
  "Generate a video" in the AI Tools panel, and the result "is added as a layer in your scene".
  Then point the placeholder at it and trim it like any clip.
  ([Custom B-roll, 2026-07-29](https://www.descript.com/blog/article/custom-b-roll-in-descript))

### 1.6 Adobe Firefly: Boards for making, an editor for assembling

- **Boards:** "an effectively unlimited canvas where you can generate, organize, edit, and connect
  images and clips". Generated assets can be "loaded back into the prompt bar for targeted
  edits", and there is a "direct handoff to Premiere"
  ([CineD, NAB 2026](https://www.cined.com/adobe-firefly-at-nab-2026-from-location-scout-to-premiere-timeline-with-ai/)).
  Generate image and Generate video sit at the bottom of the board. Upscale lives in a placed
  video's **context menu**
  ([helpx: Add videos](https://helpx.adobe.com/firefly/web/create-mood-boards/firefly-boards/add-videos.html),
  [Upscale](https://helpx.adobe.com/firefly/web/create-mood-boards/firefly-boards/upscale-videos-with-topaz-astra.html), via search excerpts).
- **Video editor (beta since December 2025):** a multi-track timeline (video, text, audio) that
  is "available as soon as a project opens". Generate a clip mid-edit and it "drops into your
  media library". Trim, split, rearrange, text layers, audio levels. The reviewer: the timeline
  "behaves more like a storyboard with time than a traditional editing bay", with a low learning
  curve and limited precision ([Feisworld](https://www.feisworld.com/blog/adobe-firefly-video-editor-beta)).
  Transitions and in-editor generation with partner models arrived in January 2026, and Quick
  Cut (a prompt-built first draft) in February 2026. **Chrome desktop only.**
  ([known limitations](https://helpx.adobe.com/ae_en/firefly/web/firefly-video-editor/troubleshoot/known-limitations-in-firefly-video-editor.html), via search excerpt)

### 1.7 Canva, CapCut, Freepik, Higgsfield, Pika

- **Canva** moved its video editor "from a page-based tool to a multi-track timeline" (rolling
  out). It has a **main track** (the thick one with a plus), Add Audio, waveforms, and split with
  `S` or right-click ([help](https://www.canva.com/help/creating-and-editing-videos/), via search
  excerpt). **Image editing:** select the photo, then **Edit** in the toolbar opens a side panel
  with Adjust, Filters, Crop and the AI tools (background remover, Magic Eraser). Reset in Adjust
  and Undo revert. ([photo editor help](https://www.canva.com/help/image-editor/),
  [design school](https://www.canva.com/design-school/resources/uploading-and-editing-photos), via search excerpts)
- **CapCut web:** "a full timeline editor in the browser, with a left rail carrying Media,
  Templates, Elements, Audio, Text, Captions, Transcript, Effects, Transitions, Filters, Brand
  kit and Plugins" ([Nemo review](https://www.nemovideo.com/blog/capcut-review-2026), via search
  excerpt). Reviewers value the basics (trim, captions, background removal). They complain about
  paywall creep: "99% of the transitions etc were only for Pro"
  ([BigVU](https://bigvu.tv/blog/capcut-online-desktop-editor-review)).
- **Freepik:** Spaces is a node canvas
  ([launch](https://www.businesswire.com/news/home/20251104023735/en/Freepik-Launches-Freepik-Spaces-to-Power-AI-Visual-Creation-and-Collaboration-in-Real-Time)).
  The video editor is entered from a piece of content: "select the 'Open in Video Editor'
  option" ([docs](https://www.freepik.com/ai/docs/video-editor), via search excerpt).
- **Higgsfield:** no established timeline ("has not established that" it replaces an editor).
  Video Extend works forward, backward or as a bridge. Poster templates edit through Layers, and
  "other template categories are regenerated rather than edited"
  ([DIY AI, inspected 2026-09-24](https://diyai.io/ai-tools/video-generation/reviews/higgsfield-review/)).
- **Pika:** generation and effects with no timeline editor
  ([itechguides](https://www.itechguides.com/products/pika/), via search excerpt). It is not a
  model for this question.

## 2. What the evidence says, by question

### 2.1 The unit, and where results land

1. **The project holds three kinds of thing:** the making (Gen Space sessions, an Agent chat),
   the media (a bin), and the assembled things (timelines, compositions, cuts). LTX, Descript
   and Runway (Enterprise) all landed here, and LTX says why: separate tools were "silos".
2. **Starting to make something starts a project.** LTX's homepage generate opens a new
   project, Kapwing's homepage box opens a Kai project, and Runway's composer starts a session.
   Nobody asks for a project name first.
3. **Media is saved twice:** in the project and in a personal library of everything (LTX "My
   Assets", Runway "All Generations"). The library is the global view and the project is the
   scoped one. A clip in a cut is a *reference* to library media, not a copy (LTX "arranging
   references, not files", Descript compositions "non-destructive").
4. **Results land in the making surface first, then get placed.** Krea "Add media", Runway's
   drag or double-click, Firefly "drops into your media library", Descript "added as a layer".
   Only agents assemble on their own (Runway Agent). Krea's agent explicitly does not touch the
   timeline. Placing is a deliberate act, with one step per item.

### 2.2 The media bin

- **Placement:** a panel beside the stage. It is on the left in full-screen editors (Kapwing
  media sidebar, CapCut's Media tab, Runway's Assets panel, Descript's Project panel), which have
  no app sidebar while editing. LTX and Krea make the session/Gen Space itself the bin.
- **Grouping:** LTX groups by session (concept, shot, iteration). Runway uses folders made
  automatically by tool. Nobody groups a project's bin by date; dates belong in the global
  library.
- **Actions** seen on an item: fullscreen, edit, upscale, animate as start frame, download
  (Krea); use as image/style/prompt reference (Midjourney); load back into the prompt bar and
  upscale from a context menu (Firefly Boards); share from "…" (Runway); drag into the chat
  (Runway Agent); open in the video editor (Freepik); preview-and-trim before adding (Kapwing);
  send back to generation from the timeline (LTX).
- **Multi-select:** Shift-click for batch organise and delete (Runway). LTX inserts several clips
  into the timeline at once. That is the one bulk action that matters for assembling.
- **Drag and drop** is the connective tissue: bin → timeline (Runway, Kapwing, LTX), result → tool
  (Krea), result → chat (Runway).

### 2.3 The timeline: the light version is very consistent

| | Tracks | Edit operations | Generation from the timeline |
|---|---|---|---|
| Krea | 2 video + 2 audio, up to 8; stills as cards | split at playhead (`C`), move, trim, delete, snap | ⌘-drag an edge to extend, with an optional prompt |
| LTX | 2 video + up to 5 audio | reorder, split, trim, duplicate, fill empty space, snap, undo | send a clip back to generation, swap in place; Retake a 2–16 s range |
| Runway | video + audio; **no images** | split (⌘B), trim, reorder, Detect Shots | the agent assembles through chat |
| Firefly | video, text, audio | trim, split, rearrange, text, audio levels, transitions | generate mid-edit into the media library |
| Kapwing | layers of video/image/audio/text | split (`S`), trim, move, ripple delete | Kai edits the timeline through chat |
| Descript | script + layer lanes, collapsed by default | blade, slip, range | placeholder → generate → layer |
| Canva | main track + layers + audio | split (`S`), trim, arrange | — |

The light timeline has trim by edge, split at the playhead (one key), drag to reorder, delete
(ripple on the main track), snapping, undo, one or two audio tracks, text as cards or a track,
and one export button. Transitions are a short list (LTX, Firefly, Canva), and CapCut's large
paid set draws complaints. What sets the AI products apart is **one generative verb on a clip**:
extend (Krea, Higgsfield), regenerate in place (LTX), or fill a gap (LTX, Descript).

### 2.4 Image editing inside the product

There are three approaches, and the trend favours the first:
1. **Prompt edits replace tool suites.** LTX deleted Generative Fill and Remove Objects in favour
   of "prompt to remove objects". Krea Edit does text-driven region changes. Kapwing edits images
   by chat. Firefly loads an asset back into the prompt bar.
2. **Select → Edit opens a side panel** of Crop, Adjust, Filters and AI tools, with Reset and Undo
   (Canva, Kapwing's right panel). You enter from the item and exit by deselecting. The result
   replaces the image in place, and the original survives through undo.
3. **Layers** (Runway's Seedream Layers, Higgsfield posters) are paid, recent and narrow.

Nobody ships a separate photo-editing *page*. The editor is a state of the item, entered from
it and left back to where you were.

### 2.5 Navigation

- Inside a project, the tools are **views of one project**: LTX switches Gen Space, Storyboard,
  Timeline and Pitch Deck. Runway puts a Final Cut tab beside the chat, and Krea a preview panel
  beside the chat. Chat and timeline sit **side by side** in both agent products (Runway, Krea).
- Editors are desktop-first, often desktop-only: LTX blocks phones, the Firefly editor is Chrome
  desktop only, and Krea built a separate mobile product rather than shrink the desktop one.
- The app shell stays: Krea keeps one sidebar for everything, with sessions searchable across
  tools.

### 2.6 What matters most, from reviews

- **Praised:** going from idea to a finished piece without leaving the tool (Firefly, LTX); a low
  learning curve (Firefly's "storyboard with time"); swapping one shot without rebuilding the
  edit (LTX, Kapwing "change one generated element without regenerating every layer"); captions
  and the basics done well (CapCut).
- **Criticised:** steep learning curves (LTX); paying for misses (Kapwing, Runway); browser-only
  storage that can vanish and autosave gaps (Kapwing); precision missing for complex timing
  (Runway Agent, Firefly); gaps like no images on the timeline (Runway).

## 3. Recommendation for Aivia

### 3.1 The unit: a project

A **project** holds four things: its **briefs** (today's runs, the thread), its **media** (every
output and upload, plus edited versions), its **cuts** (timelines assembled from that media),
and nothing else. The mapping from today is one to one: a `Session` becomes a project, its
runs are the briefs, its `Asset` rows are the media, and the cut saved by `POST /api/cuts`
becomes the first cut. One thread per project in v1. LTX's several sessions per project solve a
team-scale problem that a solo user making a 30-second film does not have.

- Starting from "What are we making?" creates the project (LTX, Kapwing). The title comes from
  the first brief as it does now.
- Media lives in the project *and* in the Library (LTX "My Assets", Runway "All Generations").
  The Library becomes the global bin, filterable by project, with an "Open project" link on every
  item. It is no longer a separate destination you have to visit to find things.
- A cut references media and never copies it. Editing an image saves a **new version** next to
  the original in the tray, which is how Aivia avoids Kapwing's destructive-delete complaint
  without building an undo history across sessions.

### 3.2 The project screen, desktop (1440)

Two views of one project, **Make** and **Cut**, in a segmented control in the header (LTX's
views, Runway's tab). The media tray is always on the right, so it is in the same place in
both views. The app sidebar stays on the left as today. Opening Cut collapses it to the 52 px
rail to give the timeline width, and leaving Cut restores the user's own setting.

```
Make view
┌────┬──────────────────────────────────────────────────────┬──────────────────┐
│rail│ Night market teaser        [ Make | Cut ]   Export ▾ │ Media     ▦ ≡    │
│    │                                                      │ All Img Vid Aud  │
│ ⌂  │   a poster, a teaser and a soundtrack…               │ ── brief 1 ───── │
│ ▤  │   ┌────────┐ ┌──────────────────────┐                │ ▣ ▣ ▣  ▶▭ ▶▭    │
│ ✎  │   │ poster │ │ clip                 │                │ ♪ night market   │
│    │   └────────┘ └──────────────────────┘                │ ── brief 2 ───── │
│    │   ▶ night market lo-fi ▂▃▅▆▅▃▂ 0:30                  │ ▣ ▣              │
│    │                                                      │ ── cuts ──────── │
│    │   a closer shot of the lanterns                       │ ▶ Cut 1  0:18    │
│    │   …                                                  │                  │
│    │   ╭────────────────────────────────────────────╮     │ + Upload         │
│    │   │ composer                                    │     │ + From library   │
│    │   ╰────────────────────────────────────────────╯     │                  │
└────┴──────────────────────────────────────────────────────┴──────────────────┘

Cut view
┌────┬──────────────────────────────────────────────────────┬──────────────────┐
│rail│ Night market teaser        [ Make | Cut ]   Export ▾ │ Media            │
│    │ ┌──────────────────────────────────────────────────┐ │ (same tray; drag │
│    │ │                                                  │ │  onto the        │
│    │ │                 stage (player)                   │ │  timeline, or    │
│    │ │                                                  │ │  "Add to cut")   │
│    │ └──────────────────────────────────────────────────┘ │                  │
│    │  ▶  0:07 / 0:18      ✂ split  ⌫  ↶ ↷     − ⎯⎯ +  fit │ Selected clip:   │
│    │ T  ▭title▭                    ▭end card▭             │ crossfade in ☑   │
│    │ ▣  ▭▭clip 1▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭ │ New take…        │
│    │ ♪  ▂▃▅▆▅▃▂▃▅▆▅▃▂▃▅▆▅▃▂▃▅▆▅▃▂▃▅▆▅▃▂ score          │                  │
│    │ ♪  ·  ·  ▂▅▂ whoosh  ·  ·                             │                  │
└────┴──────────────────────────────────────────────────────┴──────────────────┘
```

- Tray 300 px, collapsible (⌘. or a control), state in a cookie like the sidebar. Grouped **by
  brief**, newest brief first, each group headed by its brief in one line of `--mute`, with cuts
  as their own group. This is LTX's session grouping applied to Aivia's runs. Dates stay in the
  Library.
- In Make view the tray mirrors the thread, so the thread can stay as it is. The tray adds the
  scoped, filterable bin and the drag source.
- The selected clip's few properties (crossfade, volume, New take) show at the foot of the tray
  rather than in a third panel. Two side panels are Kapwing and CapCut density, not Aivia's.
- Cut view with no cut yet: an empty stage, "Start a cut", which lays out today's template (title
  card on the first tagline, clips with crossfades, end card on the poster, score under) as
  editable clips. "Cut it together" becomes the starting point of the editor rather than a
  dialog with a fixed result.

### 3.3 The project screen, phone (390)

The evidence says not to shrink a desktop timeline (LTX blocks phones, Firefly is desktop-only,
Krea rebuilt mobile as its own thing). On a phone:

```
┌──────────────────────────┐
│ ≡  Night market…   ⋯     │
│ ┌──────────────────────┐ │
│ │ stage / thread       │ │
│ └──────────────────────┘ │
│ (Make: thread + composer)│
│ (Media: 2-col grid,      │
│   tap → item sheet)      │
│ (Cut: player, then the   │
│   cut as a vertical list │
│   of shots: drag ≡ to    │
│   reorder, swipe remove, │
│   tap → trim sheet)      │
│──────────────────────────│
│  Make    Media    Cut    │
└──────────────────────────┘
```

- A bottom tab bar switches Make, Media and Cut. The tray becomes the Media tab, a two-column
  grid; tapping an item opens its action sheet.
- **Cut on a phone is a storyboard, not a timeline:** the player, then the shots as a list in
  order (drag handle to reorder, swipe to remove, tap for a sheet with trim handles on that one
  clip, crossfade on or off), the score as one row, and Export. This is the Firefly reviewer's
  "storyboard with time", made literal where precision is impossible anyway. The full multi-track
  timeline starts at 1024 px. Between 640 and 1024 px the tray becomes a sheet from the right.

### 3.4 One set of actions for every item

One `MediaActions` definition per kind, rendered the same way in the thread, the tray, the
Library grid and the lightbox: up to three primary actions on hover (or as buttons in the
lightbox panel) and "⋯" for the rest. The sources show the same handful of verbs
everywhere (Krea, Midjourney, Firefly, Runway). Aivia's problem today is that each surface has
its own subset.

| Kind | Primary (hover) | In "⋯" |
|---|---|---|
| Image | Open, Edit, Animate | Add to cut, Use in a brief (reference), Reuse prompt, Download, Favourite, Delete |
| Video | Open (plays), Add to cut, New take | Use a frame as an image, Reuse prompt, Download, Favourite, Delete |
| Music / sound | Play, Add to cut | Reuse prompt, Download, Favourite, Delete |
| Cut | Open in Cut, Export | Duplicate, Rename, Delete |

- "Add to cut" appends to the end of the project's current cut (or starts one). Multi-select
  (⇧/⌘-click in the tray and the Library) offers Add to cut, Download and Delete, which are the
  bulk actions with evidence (Runway Shift-click, LTX inserting several clips at once).
- Drag works for the same verbs: tray → timeline (add at the drop point), tray → composer (attach
  as a reference, as in Runway's drag back into chat).
- "Use a frame as an image" grabs the frame at the playhead in the browser and saves it as an
  image, which then feeds Animate or Edit. It is free, and it is the bridge between kinds that
  Firefly Boards and Krea show (image → video → image).
- Upscale and Variations are left out: Aivia has no upscale capability today, and "Reuse prompt"
  covers variations.

### 3.5 Timeline v1

**Tracks (fixed, four):** Text (title and end cards, captions from the run's taglines), Picture
(clips *and* stills on one magnetic main track, the way Canva's main track and Krea's stills as
cards work; Runway's "no images" is a gap to avoid), Score (music), Sound (effects). Fixed
tracks rather than free layers keep it LTX-sized, not Kapwing-sized.

**Operations:** add (drag or Add to cut), reorder by drag on the main track (ripple, no gaps),
trim by edge with snapping, split at the playhead (`S`; Kapwing and Canva use `S`, Runway ⌘B, so
bind both), delete (ripple on Picture, gap elsewhere), a crossfade toggle at each join plus fade
in and fade out (one transition type, which is what the current renderer already does), still
duration (default 3 s), a text card's words and its two styles (display-face title, grotesk
caption), volume and fade on audio clips, undo and redo, zoom and fit, Space to play. Export
reuses the browser renderer (`components/studio/cut-render.ts`, mediabunny), so it stays free.
Autosave to the project, which avoids Kapwing's lost-changes complaint. For the guest, keep it in
the browser and claim it on sign-up, as already decided, but say so plainly given Kapwing's
"cleared with browser cache" warning.

**Generation from the timeline, v1: one verb, New take.** On a selected clip it opens the brief
that made it, prefilled, in Video mode (or Image for a still). The new result replaces the clip
in place on the timeline, and the old one stays in the tray. This is LTX's "send back to
generation … applies to the existing clip". It uses the existing generation path and
`lib/ai/guard.ts`, adds no new model, and answers the most-praised behaviour in the reviews
(swap one shot without rebuilding the edit). Extend (Krea ⌘-drag, Higgsfield) and fill-gap are
the second wave, gated on the engineering research finding a priced fal model.

**Not in v1:** more than one picture track, picture-in-picture, keyframes, speed, colour, effects
and filters, a transition library, transcription captions (Aivia makes no speech), the agent
operating the timeline (Krea ships without it), XML/ProRes export, multi-cam, Retake-style range
regeneration.

### 3.6 Image editor v1

Entered from any image's **Edit** action, wherever it is. It takes over the stage area (in Make
view the thread gives way to it, and the tray stays). Done saves and returns you to where you
came from; Cancel discards. This is Canva's select → Edit, without a separate page. `/edit`
redirects into it.

```
┌────┬───────────────────────────────────────────────┬──────────┐
│rail│ ← Back   Editing "lantern poster"  Cancel Done│ Media    │
│    │        ┌───────────────────────────┐          │          │
│    │        │                           │          │          │
│    │        │      image (hold to       │          │          │
│    │        │      compare original)    │          │          │
│    │        └───────────────────────────┘          │          │
│    │  Crop   Adjust   Text   AI                     │          │
│    │  [ 1:1  3:4  4:3  16:9  9:16  Free ]  ↺ Reset │          │
└────┴───────────────────────────────────────────────┴──────────┘
```

- **Crop:** the generation aspects plus free, rotate 90°, flip.
- **Adjust:** brightness, contrast, saturation, warmth, with Reset (Canva's Adjust tab and Reset).
- **Text:** one or more text boxes in the two faces, colour, size, drag to place. This is what
  makes a poster out of a still, and it is the gap between Aivia's outputs and a usable asset.
- **AI:** the five Cloudinary transforms as they are (Restore, Remove background, Recolor,
  Remove object, Fill), plus, if the engineering part finds a priced model, "Describe a change",
  the prompt edit that LTX, Krea, Kapwing and Firefly all moved to. Each AI action costs a
  generation and says so on its button, as the composer does.
- **Saving** writes a new image beside the original (a version, linked to its parent), never over
  it. Undo works within the session of the editor.
- **Not in v1:** layers, brushes and hand-drawn masks, a filter gallery, compositing several
  images, stickers and shapes, background generation beyond Fill.

### 3.7 Home and navigation

- **The sidebar's "Recent" becomes "Projects"** (up to eight, running ring and unseen dot as now,
  then "All projects"). Studio, Library and Edit as separate items give way to **Home** (new
  project + recent projects), **Library** (the global bin), and Characters (kept for now).
- **Home / All projects:** the "What are we making?" composer on top (a send creates the
  project), then a grid of project cards: a mosaic of the first three pieces of media, the title,
  "Updated 2 h ago", a running ring. This follows the LTX and Kapwing homes, where the prompt box
  *is* the new-project button.
- URLs: `/p/[id]` (Make), `/p/[id]/cut`, editing as `?edit=[assetId]` so Back works.
  `/studio/[id]` redirects to `/p/[id]`.

### 3.8 What not to build

- **An infinite canvas or node graph** (Firefly Boards, Freepik Spaces, Krea Nodes, Runway
  Workflows). Each is a product of its own, reviewers call node canvases "overwhelming for
  beginners", and Aivia's agent already plans the steps.
- **A full NLE:** free layers, keyframes, effects, a big transition set. Every review of the light
  editors (Firefly, LTX) is happy with "storyboard with time". CapCut's breadth is what draws its
  paywall complaints.
- **A timeline on phones.**
- **Sessions inside projects, folders, teams, comments, brand kits** (Runway and LTX at team
  scale).
- **A separate photo-editing page.** No product in the set has one any more.
- **A paid generative verb on every surface.** One (New take) in v1, through the guard, with the
  cost on the button. Reviews punish paying for misses.

### 3.9 Order of value

1. Projects (rename and regroup what exists: a session becomes a project, the tray on the right,
   Home with cards, the Library as the global bin) and the shared item actions. This is what makes
   it feel like one product, and it is cheap.
2. Cut view with the template as the starting cut, then trim, split, reorder, crossfade toggle,
   text cards, audio and export. This turns the most distinctive feature (Cut it together) from a
   dead end into an editor.
3. The image editor (crop, adjust, text, the existing AI tools), replacing `/edit`.
4. New take from the timeline.
5. Second wave: extend, fill a gap, prompt edits on images, the phone storyboard's trim sheet.


# Research: the media platform — engineering

TICKET-060, 2026-10-11. How to build a light timeline editor and a basic image editor into
Aivia on the stack it already has: Next 16, React 19.3, Tailwind 4, Prisma on Postgres,
Supabase auth, Railway, mediabunny. Versions, licences and sizes were checked on this date.
Bundle sizes were measured, not quoted: each library was bundled with esbuild (minified, ESM,
React external) and gzipped at level 9, importing only the parts named in the table.

## 0. What the repo already has

- **A renderer that works in production.** `components/studio/cut-render.ts` (TICKET-040 to
  059) opens fal MP4s with `mediabunny` `Input` + `UrlSource`, decodes frames with
  `CanvasSink(fit: "cover", poolSize: 2)`, draws a 2D canvas per frame (title card, clips with
  crossfades, an end card with a slow push-in and text over a gradient), mixes one track in
  an `OfflineAudioContext` with fades, and encodes through `CanvasSource` and
  `AudioBufferSource` to MP4 (H.264 + AAC) or WebM (VP9 + Opus). It checks
  `window.isSecureContext` and `canEncodeVideo` / `canEncodeAudio` first. fal URLs therefore
  already pass CORS and range reads in production. Nothing else on the market starts this far
  along.
- **A plan that is already a timeline.** `lib/cut.ts` `planCut()` returns `Segment[]` with
  `start`, `end`, `fadeIn`, `fadeOut`, `src`, `text` and `zoom`, and `alphaAt()` is a pure
  opacity function. That is a timeline with one visual track, one audio track and fixed
  rules. The new model should be a generalisation of it, and "Cut it together" should become
  a function that writes a starter timeline document.
- **Limits that will bite.** `/api/cuts` and the dialog cap a kept cut at 4 MB
  (`KEEP_BYTES`, `MAX_BYTES`). At the current 2.5 Mbps that is about 13 seconds of video, so a
  timeline export needs a different upload path (§3.5). `renderCut` calls `getCanvas(t)` once
  per frame per clip. That is random access; the sinks' iterators (`canvases()`,
  `canvasesAtTimestamps()`) decode in sequence and are faster for export.
- **Edit is stateless.** `components/edit/workspace.tsx` + `lib/edit.ts`: the source is
  uploaded to Cloudinary through the unsigned preset `aivia_transformation`, and each AI tool
  is a `getCldImageUrl` transformation URL, spent through `/api/edit/spend`. Results are not
  saved as Assets. Cloudinary sends `access-control-allow-origin: *` (checked with curl on
  `res.cloudinary.com`), so its results can be drawn to a canvas and exported.
- **Data.** `Session` keeps `messages Json`. `Asset` has `kind`
  (image | video | music | sound), `url`, `posterUrl`, `params Json`, `width`, `height` and
  `durationSec`. Guests keep up to 5 sessions in localStorage (`lib/guest-local.ts`); the
  server re-validates them on claim (`lib/claim.ts`: `sanitizeMessages`, `SAFE_URL`, caps, and
  deterministic `claimedSessionId` so a retried claim does not duplicate). The new documents
  should follow the same pattern.
- `mediabunny` is pinned at 1.59.1 (MPL-2.0). The latest is 1.61.3 (2026-10-05) and the repo
  is active (7.3k stars).

## 1. The timeline data model

### 1.1 What others do

| System | Time unit | Track model | Trim | Transitions |
|---|---|---|---|---|
| OpenTimelineIO (Apache-2.0, ASWF) | `RationalTime{value, rate}` | `Timeline > Stack > Track(kind Video/Audio) > [Clip, Gap, Transition]`. Children are **sequential**: position comes from order plus `Gap`s | `Clip.source_range` (start, duration) on a `media_reference` (`ExternalReference.target_url`) | A `Transition` item between two clips, with `in_offset` / `out_offset` overlapping its neighbours (`SMPTE_Dissolve`) |
| Remotion (React) | integer frames at a composition `fps` | Nested `<Sequence from durationInFrames>`. Editor Starter and most Remotion editors keep `tracks[{id, items: id[]}]` + `items: Record<id, Item>` + `assets: Record<id, Asset>` | `trimBefore` / `trimAfter` (formerly `startFrom` / `endAt`) on `<Video>` | Manual, or `@remotion/transitions` `TransitionSeries` |
| @xzdarcy/react-timeline-editor | seconds (float) | `rows[{id, actions[{id, start, end, effectId}]}]`, **absolute** positions | none (start/end only; the in-point is yours) | none |
| CapCut / Premiere-style NLEs | frames | A magnetic main track (sequential) + free overlay tracks (absolute) | in/out on source | A transition object attached to a cut |

Lessons: (a) a **media table** separate from items (OTIO `media_reference`, Remotion
`assets`) is what makes relinking, preloading and claim rewriting one pass; (b) **absolute
positions** are simpler to draw and to drag than OTIO's gaps, so the "magnetic" behaviour of a
main track is an editing operation, not part of the data; (c) store **integers**, not floats
(OTIO uses rationals, Remotion frames); (d) a transition is the overlap of two neighbouring
items, so give it to the incoming item rather than modelling it as a separate track item.

Do not depend on OTIO in JS. The npm `opentimelineio` package is 0.1.0 (October 2025, not
maintained). Exporting `.otio` JSON from our model is about 80 lines and can come later (v2)
as an "Open in Resolve or Premiere" extra.

### 1.2 Proposed type (`lib/timeline/schema.ts`, zod 3 already in deps)

```ts
/** Integer milliseconds: no float drift, frame-rate free; snapped to frames by the editor. */
type Ms = number;
type Id = string; // nanoid-ish, unique within the doc

export type TimelineDoc = {
  schema: "aivia.timeline";
  version: 1;                       // bumped only by a migration
  fps: 24 | 30;                     // snapping and export; fal clips are 24 or 30
  aspect: "16:9" | "9:16" | "1:1" | "4:5";
  background: "black" | "white";    // a name, mapped to colours by the renderer
  media: Record<Id, Media>;         // what the items point at
  tracks: Track[];                  // index 0 draws first (bottom); audio tracks are not drawn
};

export type Media = {
  url: string;                      // https only (claim's SAFE_URL rule)
  assetId?: string;                 // absent for a guest; filled on claim
  kind: "video" | "image" | "music" | "sound";
  width?: number; height?: number;
  durationMs?: Ms;                  // read from the file once and cached
  posterUrl?: string;
};

export type Track =
  | { id: Id; kind: "main";    items: VisualItem[]; muted?: boolean } // exactly one; magnetic
  | { id: Id; kind: "overlay"; items: VisualItem[]; hidden?: boolean }  // v2: picture in picture
  | { id: Id; kind: "text";    items: TextItem[]; hidden?: boolean }
  | { id: Id; kind: "audio";   items: AudioItem[]; muted?: boolean };

type Span = { id: Id; start: Ms; duration: Ms };      // place on the timeline
type Fades = { fadeIn?: Ms; fadeOut?: Ms };            // to and from transparent or silent

export type Transition = { kind: "crossfade" | "dip-black"; duration: Ms };

export type VideoItem = Span & Fades & {
  type: "video"; media: Id;
  in: Ms;                           // source in-point; out = in + duration (speed 1 in v1)
  volume: number;                   // 0..1, for clips that carry sound
  fit: "cover" | "contain";
  transitionIn?: Transition;        // overlaps the previous item on the main track
};
export type ImageItem = Span & Fades & {
  type: "image"; media: Id;
  fit: "cover" | "contain";
  motion?: { from: Frame; to: Frame }; // slow push-in, as cut's `zoom` does today
  transitionIn?: Transition;
};
type Frame = { scale: number; x: number; y: number };  // x/y as a fraction of the frame
export type VisualItem = VideoItem | ImageItem;

export type AudioItem = Span & Fades & {
  type: "audio"; media: Id; in: Ms; volume: number;
};

export type TextItem = Span & Fades & {
  type: "text"; text: string;       // max ~200 chars, \n allowed
  style: {
    preset: "title" | "caption" | "lower-third";      // v1 ships presets, not free styling
    font: "display" | "sans";       // mapped to the app's font tokens at draw time
    size: number;                   // fraction of frame height (0.09 matches cut's title)
    color: "light" | "dark";
    align: "start" | "center" | "end";
    backdrop: "none" | "shadow" | "scrim" | "box";
    x: number; y: number;           // anchor, fractions of the frame
  };
  animation?: "none" | "rise" | "fade";
};
```

Invariants are checked by a pure `validate(doc)` and kept by every edit operation:

- items on one track are sorted by `start` and do not overlap, except that a main-track item
  may overlap its predecessor by exactly `transitionIn.duration`;
- `0 ≤ in`, and `in + duration ≤ media.durationMs` for video and audio;
- `fadeIn + fadeOut ≤ duration`;
- the doc's duration is the latest item end on visual or text tracks. An audio item that runs
  past it is cut at render time.

Why these choices:

- **Colours and fonts are names** (`"light"`, `"display"`), not hex values, so the document
  follows the design tokens rule and the renderer resolves them, as `renderCut` does today
  with `--color-fg` and `--font-cormorant`.
- **Presets in v1** stop the text panel from turning into a type editor.
- **`main` is a track kind** so the magnetic behaviour (ripple on delete, close gaps on move)
  has a clear home.

### 1.3 Versioning

- `version` is an integer. `lib/timeline/migrate.ts` exports
  `migrate(raw: unknown): TimelineDoc`, which chains `v1→v2→…` pure steps and then runs the
  zod parse. It is unit-tested with a frozen fixture for each version.
- The server and client both load through `migrate`. A document whose version is newer than
  the code (an old tab) opens read-only and says so, never silently downgrades.
- Additive fields are optional and need no version bump. A renamed or reshaped field needs
  one.
- Optimistic concurrency is a separate `rev` column, not a field in the document (§1.4).

### 1.4 Storage

Store the document as a **JSON column on a new table**, not as normalised rows. It is always
loaded and saved whole, it is small (30 items ≈ 10–15 KB), one person edits it, and nothing
queries inside it. Rows per item would turn every autosave into N writes for no gain.
Postgres `jsonb` through Prisma `Json` is what `Session.messages` already does.

```prisma
enum EditKind { timeline  image }

model Edit {
  id          String   @id @default(uuid())
  userId      String
  projectId   String?            // the Project from D-005 (or sessionId until Projects land)
  kind        EditKind
  title       String   @default("Untitled edit")
  doc         Json               // TimelineDoc | ImageEditDoc, parsed by migrate()
  version     Int                // doc schema version, duplicated for cheap filtering
  rev         Int      @default(0) // bumped on each save; PUT requires the rev it read
  posterUrl   String?
  outputAssetId String?          // the last export kept in the library
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([userId, updatedAt])
  @@index([projectId])
}
```

Add a lineage column to `Asset`: `parentAssetId String?` plus `params.edit` holding the edit
that made it. An exported cut or edited image is then a normal library item that knows its
origin and can reopen its edit.

- **API**: `GET/POST /api/edits`, `GET/PUT/DELETE /api/edits/[id]`. `PUT` body is
  `{doc, rev}` and runs `updateMany({where: {id, userId, rev}, data: {doc, rev: rev + 1}})`.
  Zero rows means a 409, and the client reloads. The server re-validates with the same zod
  schema and caps the document at 200 KB.
- The client autosaves debounced (about 1 s after the last change, and on `pagehide`). The
  shared guest account never writes: the storage-layer rule `isGuestId` (TICKET-038) extends
  to `Edit`.
- **Undo and redo**: a snapshot stack of documents in the editor's zustand store (zustand 5
  is already a dependency). Documents are small, so whole snapshots capped at 100 are simpler
  than patches. Undo history is not persisted.
- **Deleted media**: when an Asset is deleted, the item keeps rendering from `media.url` while
  the URL lives, and shows a "missing media" slate if it does not. Do not cascade-delete
  edits.

### 1.5 Guest storage and the claim path

Mirror TICKET-041:

- `lib/guest-local.ts` gains `aivia:guest-edits`, at most 5 edits, each at most 100 KB of
  JSON, saved with the same try/catch guards and a `LOCAL_CHANGED` event.
- A guest has no asset ids, so `media` entries hold `url` only.
- Exports are never put in localStorage (5 MB origin cap). A guest downloads them. An
  IndexedDB cache of the last export is a possible v2 convenience.
- **Claim**: `POST /api/claim` accepts `{sessions, edits}`. `parseClaim` grows a
  `parseEdits()` step. It runs each edit through `migrate()` and zod, drops media whose URL
  fails `SAFE_URL` or exceeds `MAX_URL`, and enforces the caps. The server then:
  1. derives a deterministic id per edit, reusing the `claimedSessionId` hash with a
     different salt, so retries are idempotent;
  2. maps a local `projectId`/session id to its claimed id;
  3. resolves each `media.url` to the Asset that the session claim just created for the same
     URL (`assetsFromMessages` already makes one per output). If no Asset matches, it creates
     one with the media's `kind`, so every item in an account points at a library item.
  Do this in one transaction with the session claim. Clear the browser copy only on 200.

## 2. Preview

### 2.1 Options

| Option | Version / licence | Gz size (measured) | Fit |
|---|---|---|---|
| **Plain canvas compositor + mediabunny decoding** (CanvasSink iterators, AudioBufferSink on an AudioContext clock) | mediabunny 1.61.3, MPL-2.0 (file-level copyleft: using it unmodified as a library has no obligations for our code) | ~105 KB for the preview subset (`Input`, `UrlSource`, `ALL_FORMATS`, `CanvasSink`, `AudioBufferSink`); ~142 KB with the encoding parts `renderCut` uses. Already in the app, loaded lazily | Same decoder and same drawing code as export, so preview equals export frame for frame. Mediabunny's own `examples/media-player/media-player.ts` (785 lines) is the pattern: AudioContext `currentTime` is the clock, `CanvasSink.canvases(t)` iterates frames with `poolSize: 2`, and `AudioBufferSink.buffers(t)` schedules about 1 s ahead |
| Canvas compositor fed by hidden `<video>` elements | platform | 0 | Native, hardware-decoded, smooth, with audio included. But seeking is asynchronous and keyframe-bound, several elements drift and need resync, and frames do not match the mediabunny export exactly. `requestVideoFrameCallback`: Chrome 83, Safari 15.4, Firefox 132. A fallback, not the main path |
| Remotion Player (`@remotion/player` 4.0.534) | Remotion License: free for individuals, for-profit companies of up to 3 people, and non-profits. Otherwise a Company License: "Automators" $0.01/render, $100/mo minimum, and that tier explicitly covers "embedding the Remotion Player"; "Creators" $25/seat/mo. Remotion 5 counts contractors toward team size (PR #3750) | ~105 KB (Player + `remotion` core) | Very good DX, React-native, React 19 supported (peer `>=16.8`). Export would mean `@remotion/web-renderer` (stable since 4.0.491; Chrome 94, Firefox 130, Safari 26; WebCodecs via mediabunny). That supports only a subset of DOM/CSS (no `z-index`, `backdrop-filter`, blend modes, or CSS `@font-face` fonts outside SVG text) and **CSS filters do not work in Safari**. It also **sends a telemetry event per render** carrying IP and origin, even with no key. We would run a second media stack next to the one we own |
| Revideo (`@revideo/core` / `player-react` 0.11.0) | MIT, 4.1k stars, last push 2026-07; "the engine behind Midrender" | ~48 KB player wrapper | A Motion Canvas fork: generator-function scenes and a Vite plugin. Export is server or headless first. It fits Next/Turbopack poorly and does not fit a data-driven editor |
| `@diffusionstudio/core` 4.0.3 | MPL-2.0, 1.2k stars, **last publish 2025-11-30** | ~125 KB | The closest off-the-shelf engine (layers, clips, transitions, captions, export), and itself built on mediabunny (`^1.25`). Stale for 10 months, so do not depend on it. Worth reading as reference |
| Etro 0.14.1 | **GPL-3.0** | — | Excluded by licence |
| ffmpeg.wasm (`@ffmpeg/ffmpeg` 0.12.15 + `@ffmpeg/core`, ~31 MB wasm) | MIT / LGPL-GPL core | MBs | Too heavy, too slow, and needs COOP/COEP for threads. Excluded |

### 2.2 Recommendation: own a small canvas compositor and use mediabunny for decoding

Split the code into a pure description layer and two thin drivers:

```
lib/timeline/schema.ts     types, zod, defaults
lib/timeline/migrate.ts    versions
lib/timeline/ops.ts        split, trim, move, ripple delete, add, set transition (pure)
lib/timeline/snap.ts       snap targets and nearest snap (pure)
lib/timeline/layout.ts     at(doc, tMs) -> DrawOp[]  (who is visible, alpha, transform, source time)
                           gainAt(item, tMs), audioPlan(doc) -> scheduled gain ramps (pure)
lib/timeline/from-cut.ts   CutPieces -> TimelineDoc (replaces planCut as "Cut it together")
components/timeline/compositor.ts  drawFrame(ctx, ops, frames, theme)   (2D canvas only)
components/timeline/sources.ts     FrameSource: getFrame(mediaId, sourceMs) via CanvasSink
components/timeline/player.ts      AudioContext clock, iterators per active item, rAF draw
components/timeline/export.ts      the same compositor + layout into CanvasSource/AudioBufferSource
```

- `layout.at()` is `alphaAt()` and the segment loop of `renderCut`, generalised and made
  testable (vitest). The compositor is the drawing half of `renderCut`: cover/contain, push-in,
  text with wrap and scrim. Preview and export call the same two functions, so a mismatch can
  only come from decoding, and both use mediabunny.
- **Playback**: one `Input` + `CanvasSink` per media item, opened lazily. Only items active
  in a window from 1 s behind to 3 s ahead of the playhead hold a running iterator; the rest
  are released (`iterator.return()`). At a crossfade two iterators run. Audio: an
  `AudioBufferSink` per audio or sounding video item, buffers scheduled through a `GainNode`
  whose ramps come from `gainAt()`. The clock is `AudioContext.currentTime`, as in the
  mediabunny example. Music and sound effects can be decoded whole with `decodeAudioData`
  (90 s of stereo 48 kHz is about 35 MB), which is simpler and works on browsers whose
  WebCodecs lacks audio decoding.
- **Scrubbing** (paused): `getCanvas(sourceTime)` per visible item, coalesced to one request
  per animation frame, with stale requests dropped. Show the last good frame while the next
  one decodes.
- **Preview resolution**: draw at the canvas's CSS size × devicePixelRatio, capped at 1280 on
  the long edge (`CanvasSink` width/height). That is cheaper than 1080p and is what export
  uses by default.
- **Filmstrips** for the timeline UI: `canvasesAtTimestamps()` at about 64 px height, one
  frame per visible second, cached per media id as `ImageBitmap`s. This is the mediabunny
  thumbnail-generation example.
- **Waveforms**: peaks from the decoded `AudioBuffer`, reduced to about 1,000 bins and drawn
  on a canvas. wavesurfer.js 8.0.2 (BSD-3) is not needed for a static strip.
- **Fallback**: browsers without WebCodecs decoding (Firefox for Android; Safari below 16.4)
  get a static storyboard and a "Preview and export need a recent browser" note. A
  `<video>`-element `FrameSource` (about 150 lines, same compositor) is the v2 answer if usage
  data asks for it.

Why not Remotion, given its quality:

- The licence is fine for a solo portfolio today. But the moment Aivia is a company of more
  than 3 people, or takes revenue as a video-creation tool, the "Automators" tier ($100/mo
  minimum) applies to exactly this use.
- Its web export sends telemetry per render.
- Filters do not work in Safari.
- It would duplicate a decoder/encoder stack Aivia already owns and has shipped.

The custom path is perhaps 1,000–1,400 lines more than adopting a player. It is also the more
convincing portfolio piece, because it is real media engineering rather than a wrapper.

## 3. Export

### 3.1 In-browser via WebCodecs + mediabunny (recommended, the only path in v1/v2)

Browser support in October 2026 (caniuse): WebCodecs is in Chrome/Edge 94+, Firefox desktop
130+, and Safari macOS/iOS 26+ (full; 16.4–18.x partial, video codecs without
`AudioEncoder`/`AudioDecoder`). Firefox for Android has none. That is 95.6% of global usage
(91.6% full).

- **A secure context is required** (TICKET-059). Production is https. In development, use
  `localhost`, `next dev --experimental-https`, or an https tunnel when testing from the
  MacBook over the LAN (see the memory note: LAN IP origins are not secure contexts).
- **Codecs**: keep the current probe order, MP4 (`avc` + `aac`) and then WebM (`vp9` +
  `opus`). Add the **`@mediabunny/aac-encoder`** extension (1.61.3, MPL-2.0, a WASM build of
  FFmpeg's AAC-LC encoder, **~257 KB gz, measured**), registered only when
  `canEncodeAudio("aac")` is false. That turns "Safari 16.4–18 with a music bed" from a
  failure into an MP4. It also lets Firefox produce MP4 where it can encode H.264, and MP4
  plays everywhere a cut will be shared (WebM does not play in older iOS or most social
  uploaders).
- **Speed**: decode with `canvasesAtTimestamps()` / `canvases()` iterators per item rather
  than `getCanvas(t)` per frame. Encode with hardware H.264 at 1280 px long edge, 24/30 fps,
  2.5 Mbps (720p) or 5 Mbps (1080p, v2). Expect faster than real time on a desktop. Keep the
  tab visible: rAF and timers throttle in background tabs.
- **Memory**: `BufferTarget` holds the whole file. 60 s at 5 Mbps is about 38 MB, fine. Cap
  timelines at 60 s in v1 (twelve 5-second clips), which also matches generation cost caps.
  Longer exports would use `StreamTarget`, with chunks collected into a `Blob` (which the
  browser may page to disk) or written through the File System Access API on Chrome.
- **Workers** (v2): moving export into a Worker with `OffscreenCanvas` keeps the editor
  responsive. Text in a worker needs `FontFace` loaded in the worker. Do it after v1 works on
  the main thread, as `renderCut` does now.
- **Do not use `ctx.filter`** in the compositor. It is disabled by default in Safari 18–27
  (caniuse). Colour adjustments go through an explicit pixel pass or WebGL (§5).

### 3.2 Keeping the export (fixes the 4 MB cap)

Replace the multipart upload through Railway with a **direct upload**:

1. `POST /api/edits/[id]/upload` checks auth (not guest), size (≤ 100 MB) and type, and returns
   a signed upload URL.
2. The browser PUTs the blob straight to storage.
3. `POST /api/edits/[id]/export {path, seconds}` records the `Asset` (with `parentAssetId` /
   `params.edit`) after checking the magic bytes with a ranged read, the way `/api/cuts`
   checks `ftyp` today.

Candidates for the store:

- **Supabase Storage**: `createSignedUploadUrl` + `uploadToSignedUrl`, already a dependency.
  The free plan has a 50 MB per-file limit and 1 GB in total, so check the plan.
- **fal storage**, server-minted, as cuts use now.

Pick one in D-005. Supabase keeps exports under the app's control, and fal URLs' lifetime is
already an open question in §12 of the design doc.

### 3.3 Server-side render: not worth it now

| Option | Cost and effort | Verdict |
|---|---|---|
| ffmpeg on a Railway worker (filtergraph built from the doc) | Railway bills about $20/vCPU-month and $10/GB-month, per minute; a 30 s 720p x264 render is seconds of CPU, so cents per thousand renders. HTTP requests are capped at 15 min per community reports, so it needs a job queue and status polling. **Main cost: a second renderer** whose text, fades and push-ins must match the canvas compositor | No, unless browser export failure rates prove high |
| fal `ffmpeg-api/compose` | Tracks of `{timestamp, duration, url}` keyframes. No transitions or text in the schema | Too limited (hard cuts only) |
| Same compositor on Node: mediabunny + `@mediabunny/server` (1.61.3, MPL-2.0, NodeAV-based encoders/decoders) + `skia-canvas` 3.0.8 (MIT) for the 2D canvas API | One worker service; the compositor is reused because it only uses Canvas 2D | **The v3 option** if needed, for Firefox Android and old Safari. Keeps one renderer |
| Headless Chromium on Railway running the browser export | ≥1 GB RAM per render, slow cold start | Inferior to the row above |

Browser export covers about 95% of visitors and costs nothing per render. Spend the effort
on the editor.

## 4. Timeline UI

### 4.1 Libraries

| Library | Version / licence | Gz (measured) | Notes |
|---|---|---|---|
| `@xzdarcy/react-timeline-editor` | 1.0.0 (2026-01), MIT, 798 stars | ~67 KB (with interactjs 1.10 and react-virtualized 9.22) | Drag and resize actions on rows, scale and cursor. Data is `start/end` only with no source in-point, styling is its own Less CSS (fights the token rule), and there is no magnetic track or snapping to a playhead in the core. Fine for a prototype, wrong for the finish standard |
| `@dnd-kit/react` 0.5.0 (pre-1.0) / `@dnd-kit/core` 6.3.1 (last release 2024-12) | MIT | ~33 KB | A drag-and-drop framework for lists and droppables, not a time axis. Possible use: dragging from the media tray into the timeline. Pointer events do it too |
| Twick (`@twick/timeline`, `@twick/video-editor` 0.15.31) | **Sustainable Use License**: no hosted service or SaaS without a commercial agreement | — | Excluded by licence |
| OpenVideo / designcombo react-video-editor (`@designcombo/timeline` 5.5.8) | Two-tier licence like Remotion's (free up to small companies) | — | A whole CapCut-clone editor. Too heavy and opinionated; we would rewrite its look anyway |
| Remotion Editor Starter | Paid template (one-time purchase for individuals), Remotion licence | — | Ties the editor to Remotion |

### 4.2 Recommendation: build it

A light timeline is about 800–1,200 lines of React on pointer events, and every behaviour
that matters (magnetic main track, in-point trims, crossfade handles, the app's tokens, phone
layout) is custom anyway. The library fit is poor in every case above.

Shape:

- **Geometry**: one horizontally scrolling container, a ruler, and rows (text, main, audio;
  overlay in v2). An item is an absolutely positioned element at `left = start × pxPerMs`,
  `width = duration × pxPerMs`, with trim handles at both ends (24 px hit area, 8 px visual).
  The main track shows filmstrips, the audio track a waveform. Virtualisation is not needed
  at 60 s and ≤ 40 items.
- **Interaction**: `pointerdown` → `setPointerCapture` → `pointermove` computes a candidate
  edit through `lib/timeline/ops.ts`, which is snapped and validated. The candidate shows live,
  and `pointerup` commits one undo step. Moves on the main track reorder (insert at the nearest
  gap, ripple the rest). On text and audio tracks they are free with no overlap. Trims change
  `in` and `duration` on the left edge and `duration` on the right edge, clamped to the media
  length.
- **Snapping** (`snap.ts`, pure): targets are 0, the playhead, every item edge on every
  track, and transition midpoints. The threshold is 8 px converted to ms at the current zoom.
  The result is rounded to the frame grid (`1000 / fps`). Show a hairline at the snap. Alt
  disables snapping.
- **Zoom**: `pxPerSecond` from about 8 to 400. Ctrl/⌘ + wheel zooms around the pointer;
  trackpad pinch arrives as `wheel` with `ctrlKey`. Two-pointer pinch on touch. A fit-to-view
  button. Zoom keeps the playhead's screen position.
- **Scrub**: drag on the ruler or the playhead. The playhead follows the player's clock at
  60 fps through a CSS transform, not React state per frame.
- **Keyboard** (only when focus is inside the editor and not in a text field):
  - Space play/pause; J/K/L back/stop/forward;
  - ←/→ one frame, Shift + ←/→ one second, Home/End;
  - S split at the playhead (CapCut ⌘B, Premiere ⌘K: offer both S and ⌘B);
  - Delete / Backspace removes, Shift + Delete ripple-deletes;
  - ⌘Z / ⇧⌘Z; + / − zoom;
  - with an item focused, Alt + ←/→ trims its end by a frame and ⌘ + ←/→ moves it.
  - Items are buttons with `aria-label="Clip 2, 0:05 to 0:10"` and a roving tabindex per
    track.
- **Touch and phones**:
  - Pointer events cover touch. Set `touch-action: pan-x` on the scroller and
    `touch-action: none` on handles and on an item being dragged. Start a drag on a
    long-press (about 300 ms) so a swipe still scrolls.
  - At 390 px a multi-track timeline is not usable. Below `md`, use a **storyboard**: the
    main track as a vertical list of cards that reorder by long-press drag, with trim in a
    bottom sheet (a two-thumb range over the filmstrip). Text and music edit in sheets. Same
    document, same ops.
  - The full timeline appears from 768 px. This is a design call for revamp.md.

## 5. Image editor v1

### 5.1 Libraries

| Library | Version / licence | Gz (measured) | Fit |
|---|---|---|---|
| **react-easy-crop** | 6.2.4 (2026-10-06), MIT, 2.8k stars | **~8 KB** | Crop with aspect presets, zoom, rotation and pinch on touch. Returns `croppedAreaPixels`; we draw it. The right size for v1 |
| react-image-crop | 11.1.2, ISC | ~4 KB | Free-form crop box with no zoom or rotation gestures. An alternative if free-form matters more than pinch |
| Konva + react-konva | konva 10.7.1 (MIT), react-konva 19.3.0 (peer `react ^19.3.0`, matches) | ~105 KB (react-konva brings a React reconciler) | A scene graph with `Transformer` handles and built-in pixel filters (Brighten, Contrast, HSL). Worth it in v2 if layers, stickers or drawing arrive. Overkill for one text layer |
| Fabric.js | 7.4.0, MIT, 31k stars | ~88 KB | Capable, imperative, with WebGL filters. Not React-shaped; same verdict as Konva |
| Filerobot Image Editor (`react-filerobot-image-editor`) | MIT, but `latest` is **5.0.0-beta.159**; needs `styled-components` + `react-konva` | large | A complete UI with its own look. Theming it to our tokens means fighting styled-components, and v5 has been in beta for a long time. No |
| Pintura (`@pqina/pintura` 8.100.4) | Commercial: Personal €169/yr (one product), Developer €749/seat/yr; perpetual fallback; closed source | — | The best ready-made UX, but it costs money and hides the engineering a portfolio should show. No |
| tldraw 5.5.2 | tldraw licence: production use needs a licence key (commercial, value-based pricing; hobby licence by application; 100-day trial) | — | A whiteboard, not a photo editor, and licence-keyed. No |
| CSS filters + transforms for preview, canvas for export | platform | 0 | Preview with `filter: brightness() contrast() saturate()` and CSS transforms on an `<img>`. Export by drawing to a canvas, then applying the same colour matrix in JS, because `ctx.filter` is off in Safari |

### 5.2 Recommendation: react-easy-crop, CSS preview, and a pure colour-matrix export

The edit is a document applied to the source, and the source is never modified:

```ts
export type ImageEditDoc = {
  schema: "aivia.image-edit"; version: 1;
  source: { url: string; assetId?: string; width: number; height: number };
  ops: ImageOp[];   // applied in order; AI ops first, then geometry, colour, text
};
export type ImageOp =
  | { op: "ai"; tool: EditTool; input: EditInput; resultUrl: string } // Cloudinary result: the new base
  | { op: "crop"; x: number; y: number; w: number; h: number }        // fractions of the base
  | { op: "rotate"; quarter: 0 | 1 | 2 | 3; fine?: number }           // fine: −45..45° (v2)
  | { op: "flip"; h: boolean; v: boolean }
  | { op: "adjust"; brightness: number; contrast: number; saturation: number } // 1 = unchanged
  | { op: "text"; text: string; style: TextItem["style"] };           // the timeline's text style
```

- **One renderer, two outputs.** `lib/image-edit/render.ts` turns the document into canvas
  steps:
  1. load the base (the last `ai` result or the source);
  2. rotate and flip with `ctx.setTransform`;
  3. crop with `drawImage` source rectangles;
  4. apply the colour matrix to `ImageData`;
  5. draw text with the timeline compositor's text function.
  The matrices are the Filter Effects spec's for `brightness`, `contrast` and `saturate`, so
  the CSS preview and the export agree. Add a pixel test comparing both on a fixture, since
  browsers apply the shorthand functions in sRGB. A 2048 × 2048 image is 4 M pixels: about
  30–60 ms in a plain loop, fine on export. Cap the export at 4096 px on the long edge, the
  iOS canvas area limit (16.7 Mpx); iOS also caps total canvas memory, which raises "Total
  canvas memory use exceeds the maximum limit".
- **Cloudinary AI tools stay** as `ai` ops. The spend still goes through `/api/edit/spend`
  (`lib/ai/guard.ts`), and the `resultUrl` becomes the base for later ops. Cloudinary can do
  crop, rotate and colour by URL too, but its `e_brightness`/`e_contrast` formulas differ from
  CSS, so the preview would not match the result. Using local canvas for manual tools also
  means guests and offline edits need no network calls and no Cloudinary credits.
- **Saving**: export to WebP (or PNG when transparent, after "Remove background"), upload
  directly (§3.2), and record a new `Asset(kind: image, parentAssetId, params.edit = doc)`.
  Reopening that asset opens the editor on the original source with the same ops, so edits
  stay non-destructive and repeatable. Guests download, and their docs live in
  `aivia:guest-edits` like timelines.
- **Images entering a timeline** are just media. An edited image is its own Asset, so the
  timeline never runs the image pipeline at playback time.

## 6. Phased plan

Sizes are rough: S ≈ under a day, M ≈ 2–4 days, L ≈ a week, for one person with this codebase.

**v0: groundwork (M), no visible change**

1. `lib/timeline/` schema, zod, `migrate`, `layout.at`, `gainAt`, `ops`, `snap`, with unit
   tests.
2. `from-cut.ts` converts `CutPieces` into a `TimelineDoc`. The compositor and export are
   extracted from `cut-render.ts`. "Cut it together" now renders the doc. Prove there is no
   regression with a Playwright export smoke in Chromium (export, then assert duration and
   size through `mediabunny` `Input`).
3. Bump mediabunny 1.59.1 → 1.61.x. Load the AAC polyfill lazily.

**v1: the editor (L + L)**

1. `Edit` model, `/api/edits`, autosave with `rev`, guest local storage, claim of edits.
   Direct-upload keep path, retiring the 4 MB cap. (M)
2. Preview player: mediabunny sinks, AudioContext clock, scrub, filmstrips, waveform. (M–L)
3. Timeline UI: main track (reorder, trim, split, ripple delete, crossfade/dip toggle), one
   audio track (trim, volume, fades), text track (presets, edit in place, drag duration).
   Snapping, zoom, keyboard, undo. Phone storyboard. (L)
4. Export: MP4/WebM, 720p, 60 s cap, progress and cancel (reuse the cut dialog's states),
   download or keep. (S–M, mostly done in v0)
5. Image editor: react-easy-crop, rotate and flip, three sliders, one text, CSS preview,
   canvas export, AI ops from current Edit, save as a new Asset with lineage. (M)
6. Landing page sections updated in the same tickets (CLAUDE.md rule 9).

**v2: depth (M each, pick by use)**

- Overlay track (picture in picture), Ken Burns controls, more transitions, per-clip sound,
  1080p and 9:16 export, export in a Worker.
- Konva if image layers or stickers arrive.
- `.otio` export.
- The agent emits a timeline doc ("assemble_timeline") instead of only a run.
- An IndexedDB media cache.

**v3, only if data demands it**: a server render with the same compositor (mediabunny +
`@mediabunny/server` + skia-canvas) for browsers without WebCodecs.

### Risks

- **Memory and VRAM**: CanvasSink canvases live in VRAM. Keep `poolSize` at 2, only hold
  sinks for items near the playhead, release iterators, close `VideoFrame`s (CanvasSink does
  this), and downscale stills once to ≤ 1280 px before use. iOS Safari is the tightest (canvas
  memory cap).
- **Mobile**: WebCodecs needs iOS/Safari 26 for audio. Firefox for Android has no WebCodecs.
  Hardware decoder counts are limited on phones, so keep at most 2–3 concurrent video decoders
  (a crossfade needs 2). Test export on a mid-range Android and an iPhone before closing v1.
- **CORS and URL lifetime**: fal and Cloudinary send `Access-Control-Allow-Origin: *`, and
  `crossOrigin="anonymous"` is needed on every image. A URL without CORS taints the canvas and
  export throws, so allow only known hosts as media. fal URL expiry would break old timelines;
  the mirroring follow-up in §12 of the design doc becomes important once documents point at
  URLs for months.
- **Codecs**: always probe (`canEncodeVideo`, `canEncodeAudio`, `canDecode`) and never assume.
  Some fal models return 30 fps clips while others return 24, so the export fps is the doc's
  and frames are sampled, not copied. Veo-style clips may carry audio and Kling's usually do
  not: read `getPrimaryAudioTrack()` per clip.
- **Fonts**: canvas text needs `document.fonts.load()` before drawing, as `renderCut` does. In
  a Worker, load the `FontFace` there.
- **Concurrency**: two tabs on one edit. `rev` turns it into a reload prompt, not lost work.

### What to avoid

- ffmpeg.wasm, Etro (GPL), Twick (SaaS-restricted), tldraw and Pintura (paid or keyed), and
  Filerobot (beta, styled-components).
- Remotion, unless the team decides to rebuild the media stack around it. If so, budget for
  its company licence and its per-render telemetry.
- HTML5 drag-and-drop for the timeline (no touch). `ctx.filter` (Safari). Float seconds in
  the document. Pixel positions in the document. Data URLs or exported blobs in localStorage.
- A preview path (`<video>` elements) that differs from the export path, as the default.
- Sending exports through the 4 MB `/api/cuts` route.
- Adding a generation path that bypasses `lib/ai/guard.ts`. Editing and exporting spend
  nothing; only the AI image ops spend.

### Sources

- mediabunny: https://mediabunny.dev/guide/introduction ,
  https://mediabunny.dev/guide/media-sinks ,
  https://mediabunny.dev/guide/supported-formats-and-codecs ,
  https://mediabunny.dev/guide/extensions/aac-encoder ,
  https://github.com/Vanilagy/mediabunny/blob/main/examples/media-player/media-player.ts
- WebCodecs support: https://caniuse.com/webcodecs ; `requestVideoFrameCallback`:
  https://caniuse.com/mdn-api_htmlvideoelement_requestvideoframecallback ;
  `ctx.filter`: https://caniuse.com/mdn-api_canvasrenderingcontext2d_filter
- Remotion licence and pricing: https://github.com/remotion-dev/remotion/blob/main/LICENSE.md ,
  https://www.remotion.pro/license , https://github.com/remotion-dev/remotion/pull/3750 ;
  web renderer: https://www.remotion.dev/docs/client-side-rendering ,
  https://www.remotion.dev/docs/client-side-rendering/limitations ,
  https://www.remotion.dev/docs/telemetry ; Editor Starter:
  https://www.remotion.dev/docs/editor-starter
- Revideo: https://github.com/midrender/revideo ; Diffusion Studio:
  https://github.com/diffusionstudio/core
- OpenTimelineIO: https://github.com/AcademySoftwareFoundation/OpenTimelineIO
- Timeline: https://github.com/xzdarcy/react-timeline-editor ;
  Twick licence: https://github.com/ncounterspecialist/twick/blob/main/LICENSE.md ;
  OpenVideo: https://github.com/openvideodev/react-video-editor
- Image: https://github.com/ValentinH/react-easy-crop ,
  https://github.com/dominictobias/react-image-crop , https://konvajs.org ,
  https://github.com/fabricjs/fabric.js ,
  https://github.com/scaleflex/filerobot-image-editor , https://pqina.nl/pintura/pricing/ ,
  https://tldraw.dev/pricing , https://github.com/tldraw/tldraw/blob/main/LICENSE.md
- Server options: https://fal.ai/models/fal-ai/ffmpeg-api/compose/api ; Railway timeouts and
  pricing (community threads at station.railway.com; verify on railway.com/pricing);
  `@mediabunny/server` and `skia-canvas` on npm.
- Versions, licences and dates: `npm view` and the GitHub API, 2026-10-11. Gzip sizes:
  esbuild 0.28.2 bundle of the named imports, minified, React external, `gzip -9`.
