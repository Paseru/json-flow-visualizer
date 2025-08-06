# JSON Flow Visualizer

A modern, interactive JSON visualization tool that displays JSON data as a node-based flow diagram, similar to n8n or Node-RED.

![JSON Flow Visualizer](https://img.shields.io/badge/Next.js-15.4.5-black?style=flat-square&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=flat-square&logo=tailwind-css)
![React Flow](https://img.shields.io/badge/React_Flow-Latest-61DAFB?style=flat-square&logo=react)

## Features

- 🎨 **Interactive Node Graph**: Visualize JSON structures as draggable, connected nodes
- 🔍 **Real-time Parsing**: Instant visualization as you type or paste JSON
- 🎯 **Smart Layout**: Automatic node arrangement with reorganization button
- 🌈 **Color-coded Types**: Different colors for strings, numbers, objects, arrays, etc.
- 🖱️ **Fully Interactive**: Pan, zoom, and drag nodes for perfect viewing
- 🗺️ **Mini-map Navigation**: Overview map for large JSON structures
- 🌙 **Dark Mode Interface**: Modern dark theme for comfortable viewing

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/json-flow-visualizer.git

# Navigate to the project
cd json-flow-visualizer

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Paste your JSON data in the left panel
2. The visualization appears instantly on the right
3. Drag nodes to rearrange them
4. Use the "Reorganize Layout" button to auto-arrange nodes
5. Zoom and pan using mouse wheel and drag
6. Use the mini-map for navigation in large structures

## Node Types & Colors

- 🟢 **String** - Green nodes
- 🔵 **Number** - Blue nodes
- 🟡 **Boolean** - Yellow nodes
- 🟣 **Array** - Purple nodes with item count
- 🔷 **Object** - Indigo nodes with property count
- ⚫ **Null** - Gray nodes

## Tech Stack

- **Framework**: Next.js 15.4.5
- **Styling**: Tailwind CSS 4.1
- **Flow Visualization**: React Flow (xyflow)
- **Language**: TypeScript
- **Runtime**: Node.js

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Author

Created with ❤️ using Next.js and React Flow