# AGENTiGraph

**An Interactive Knowledge Graph System for Intuitive Private Data Management**  

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and provides both a React-based front-end and Python-based back-end. It implements a multi-agent architecture for knowledge extraction, integration, and real-time visualization, enabling intuitive, user-friendly interactions with domain-specific Knowledge Graphs (KGs).

> **Note**  
> Detailed information about the system design, reasoning pipeline, and theoretical foundations can be found in our paper:  
> **[AGENTiGraph: An Interactive Knowledge Graph Platform for Intuitive Private Data Management]**  
> If you use or build upon this project in your research, please kindly cite the paper.

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
  - [Front-End (React)](#front-end-react)
  - [Back-End (Python Agents)](#back-end-python-agents)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## Overview

**AGENTiGraph** is a next-generation web application that allows non-technical users to create, explore, and update domain-specific Knowledge Graphs entirely through natural language. It leverages Large Language Models (LLMs) and a modular multi-agent system to handle complex user requests such as:

- Constructing or expanding knowledge bases from custom/private data.
- Visualizing entities and relations in real-time, offering an interactive graph UI.
- Performing multi-step reasoning and knowledge inference (e.g., “Is A a prerequisite for B?”, “Find a learning path from X to Y.”).
- Dynamically integrating new concepts, linking them to existing nodes and edges, and supporting user-driven data curation.

This project bridges the gap between the powerful but often opaque abilities of LLMs and the structured clarity of KGs. By combining an agent-based task pipeline with flexible user input, AGENTiGraph aims to deliver an efficient, secure, and highly interpretable approach to managing private knowledge.

---

## Features

- **Natural Language Interaction**: Easily query and modify knowledge graphs without writing specialized query languages (no SPARQL/Cypher required for end users).
- **Multi-Agent Workflow**: Specialized agents handle user intent classification, knowledge extraction, graph queries, and system responses.
- **Real-Time Visualization**: Dynamically explore entities and relationships in an interactive web interface.
- **Domain Adaptability**: Extend to private/corporate/medical/legal data via minimal domain-specific configuration.  
- **Modular Architecture**: Agents can be customized or replaced to handle new tasks or domain requirements (e.g., advanced question-answering, summarization).

---

## System Architecture

1. **User Intent Agent**  
   Interprets queries and determines which actions or tasks are requested (e.g., verifying a relation, finding a path, updating the graph).

2. **Key Concept Extraction Agent**  
   Extracts entities and relationships mentioned in the query using advanced NER/RE methods and optionally maps them into the graph schema.

3. **Task Planning Agent**  
   Decomposes high-level requests into a sequence of sub-tasks (e.g., “find path,” “retrieve node,” “create edge”), especially for complex multi-hop queries.

4. **Knowledge Graph Interaction Agent**  
   Translates sub-tasks into underlying graph queries (e.g., Cypher) and executes them on a Neo4j database (or another back-end).

5. **Reasoning Agent**  
   Applies logical inference and multi-step reasoning with LLM-based chain-of-thought approaches to derive coherent answers from partial or aggregated graph data.

6. **Response Generation Agent**  
   Synthesizes and presents results in a clear, human-readable style.

7. **Update Agent**  
   Dynamically updates the knowledge graph with new entities and edges, ensuring real-time integration of user-provided knowledge.

A typical data flow:
```
User Query 
   -> [User Intent Agent]
       -> [Key Concept Extraction Agent]
         -> [Task Planning Agent]
           -> [Knowledge Graph Interaction Agent + Reasoning Agent]
             -> [Response Generation Agent]
               -> Output: Answer or Graph Update 
```

---

## Installation and Setup

1. **Clone this repository**:

2. **Install front-end dependencies** (React app):
   ```bash
   cd prerequisite-vis-master
   yarn install
   ```
   Or if you prefer npm:
   ```bash
   npm install
   ```

3. **Install back-end dependencies** (Python agents):
   ```bash
   pip install -r requirements.txt
   ```
   > Make sure you are in a Python 3.8+ environment (virtualenv or conda recommended).

---

## Usage

### Front-End (React)

- **Development server**:
  ```bash
  yarn start
  ```
  This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.  
  The page will automatically reload when you make changes.  
  You will also see any lint errors in the console.

- **Production build**:
  ```bash
  yarn build
  ```
  Builds the production-ready bundle in the `build` folder.

### Back-End (Python Agents)

1. **Run multi-agent system**:
   ```bash
   python multi_task_kg_system.py
   ```
   This script launches the agent pipeline and connects to the Knowledge Graph (e.g., Neo4j).  

2. **Configuration**:  
   - **`firebase.json`** or **`.firebaserc`** (optional) can be customized if you deploy via Firebase.  
   - **`test_rows_triples.csv`** is an example data file containing sample relationships.  
   - **`nutrition.py`** or other domain-specific scripts demonstrate how to embed additional logic or external knowledge sources.

3. **Environment variables**:  
   If you use a Neo4j database or other external services, set environment variables (e.g., `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`) or modify connection details in `multi_task_kg_system.py`.

---

## Project Structure

```
prerequisite-vis-master/
├─ Agent/
│   ├─ multi_task_kg_system.py   # Main multi-agent orchestration script
│   └─ ...
├─ nutrition.py                  # Example domain-specific script
├─ requirements.txt             # Python dependencies
├─ test_rows_triples.csv        # Sample data for KG
├─ public/                      # Static public assets (React)
│   ├─ favicon.ico
│   ├─ index.html
│   ├─ manifest.json
│   └─ robots.txt
├─ src/                         # React source code
│   ├─ components/...
│   ├─ App.js
│   └─ ...
├─ .gitignore
├─ package.json
├─ firebase.json                # Example config for Firebase deployment
└─ README.md                    # Project README
```

- **`Agent/`**: Houses agent definitions and orchestrators for user queries, concept extraction, and graph interaction.  
- **`src/`**: The React front-end, created with Create React App.  
- **`public/`**: Contains static assets served directly.  
- **`requirements.txt`**: Python dependencies for the multi-agent system.

---

## Deployment

Once you have a production build of the React front-end (`yarn build`), you can deploy it on any static hosting service or integrate with popular platforms (Firebase, Vercel, Netlify, AWS S3, etc.). If you choose Firebase:

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```
2. **Login and init**:
   ```bash
   firebase login
   firebase init
   ```
3. **Deploy**:
   ```bash
   firebase deploy
   ```
For more advanced configurations, see [Create React App Deployment](https://facebook.github.io/create-react-app/docs/deployment).
