# ChatGPT Workspace Enhancer

A lightweight, fully client-side browser extension designed to transform the standard ChatGPT interface into a structured, insight-rich, and highly productive environment.


## Core Principles

- **Local-First**: All user data, chat metadata, and settings are stored locally in the browser. No external servers are involved, ensuring complete privacy and data ownership.
- **Seamless Integration**: Visually blends with ChatGPT's native light and dark themes, providing a consistent and unobtrusive user experience.
- **Empowerment through Tools**: Introduces powerful navigation, writing, organization, and analytical tools directly within the ChatGPT environment.
- **Cross-Device Sync**: Leverages the browser's built-in synchronization capabilities to keep settings and metadata consistent across devices.

## Features

### Enhanced Chat Organization & Navigation

- **Pinned Chats**: Pin important or frequently accessed chats to the top of the sidebar
- **In-Place Renaming**: Rename any chat thread directly from the sidebar
- **Folders with Color Tags**: Create folders with custom colors to group related chats
- **Multiple Color Tags**: Apply multiple distinct color tags to individual chats
- **Global Fuzzy Search**: Powerful search functionality across your entire chat history
- **Command Palette**: Quick-access command palette (Ctrl/⌘ + K) for all actions
- **Backlink Breadcrumbs**: Navigate easily through organizational structures

### Advanced Writing & Prompting Assistance

- **Enhanced Model Selector**: Clear explanations of each model's strengths and use cases
- **Live Token Counter**: Real-time token counting as you type
- **Prompt-Format Coach**: Context-aware tips for better prompts
- **Syntax-Highlighted Textarea**: Rich text editor with syntax highlighting
- **Prompt Draft History**: Auto-saves versions of your prompt drafts
- **Custom Snippet Library**: Save and insert frequently used prompt snippets

### Improved Content Interaction & Export

- **Collapsible Code Blocks**: Save screen space with collapsible code and lists
- **One-Click Copy Options**: Copy as Markdown, HTML, or Plain Text
- **PDF Export**: Export chat threads to PDF documents

### Productivity & Session Management

- **Session Timer & Message Count**: Track your usage and productivity
- **Scratch-Pad Sidebar**: Always-visible notes panel synced across devices

### Seamless Integration & Customization

- **Theme Matching**: Automatically matches ChatGPT's light/dark theme
- **High-Contrast Mode**: Optional accessibility enhancement
- **Settings Sync**: Sync your preferences across devices
- **Import/Export Settings**: Backup and restore your configuration

## Installation

### Chrome / Edge / Brave (Chromium-based browsers)

1. Download and extract the ZIP file
2. Open your browser's extension page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the extracted extension folder

### Firefox

1. Download and extract the ZIP file
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Navigate to the extracted folder and select the `manifest.json` file

## Usage

After installation, navigate to [chat.openai.com](https://chat.openai.com) and the extension will automatically activate.

### Keyboard Shortcuts

- `Ctrl+K` / `Cmd+K`: Open command palette
- `Ctrl+Shift+E` / `Cmd+Shift+E`: Toggle extension

## Privacy

This extension stores all data locally in your browser using:
- IndexedDB for chat content and search indexing
- Browser's built-in sync storage for settings and metadata

No data is sent to external servers, ensuring complete privacy and data ownership.

## Development

### Project Structure

```
chatgpt-workspace-enhancer/
├── manifest.json           # Extension manifest
├── background/             # Background scripts
├── content/                # Content scripts
│   ├── ui/                 # UI components
│   ├── features/           # Feature implementations
│   └── utils/              # Utility functions
├── assets/                 # Static assets
│   ├── icons/              # Extension icons
│   └── css/                # Stylesheets
└── options/                # Extension options page
```

### Building from Source

1. Clone the repository
2. Make your modifications
3. Load the unpacked extension in your browser


## Acknowledgments

- Inspired by the needs of power users of ChatGPT
- Built with privacy and productivity in mind
