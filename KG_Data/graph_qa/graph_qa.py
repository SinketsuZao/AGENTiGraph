!pip install neo4j langchain langchain_openai langchain_community -q

import re
import torch
import pickle
import numpy as np
import pandas as pd
from tqdm import tqdm
import torch.nn.functional as F
from langchain_openai import ChatOpenAI
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import Neo4jGraph

# Use your own graph database
graph = Neo4jGraph(
    url="Your URL",
    username="neo4j",
    password="You PSW"
    )

graph.refresh_schema()
print(graph.schema)

import os
os.environ["OPENAI_API_KEY"] = "Your API KEY"

chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0, model= "gpt-4o"),
    graph=graph,
    verbose=True,
    return_direct=True,
    top_k=5,
)

llm = ChatOpenAI(model_name="gpt-4o",
                 temperature=0,
                 openai_api_key="Your API KEY")

"""***Task I***"""

data_1 = pd.read_csv("../task1_TureFalse.csv")

def extract_data(data_string):
    concept_1 = []
    concept_2 = []
    relation = []

    concept_1_pattern = re.compile(r"concept_1: (.+)")
    concept_2_pattern = re.compile(r"concept_2: (.+)")
    relation_pattern = re.compile(r"relation_1: (.+)")

    for item in data_string:
        concept_1_match = concept_1_pattern.search(item)
        concept_2_match = concept_2_pattern.search(item)
        relation_match = relation_pattern.search(item)

        if concept_1_match:
            concept_1.append(concept_1_match.group(1).strip().lower())
        if concept_2_match:
            concept_2.append(concept_2_match.group(1).strip().lower())
        if relation_match:
            relation.append(relation_match.group(1).strip())

    return concept_1, concept_2, relation

concept_1, concept_2, relation = extract_data(data_1["input_dict"])

binary_prompt = """
In the field of Natural Language Processing, I have come across the concept "{concept_1}" and "{concept_2}".
Would it be accurate to say that the concept "{concept_1}" "{relation}" "{concept_2}"
Return the path.
"""

paths = []
for i in tqdm(range(250)):
    prompt = binary_prompt.format(concept_1=concept_1[i], concept_2=concept_2[i], relation=relation[i])
    try:
        result = chain.invoke(prompt).get("result", "")
    except Exception as e:
        print(f"Error processing concept pair {concept_1[i]}, {concept_2[i]}, {relation[i]}: {e}")
        result = []
    paths.append(result)

def paths_to_bool(paths):
    return [bool(path) for path in paths]

bool_paths = paths_to_bool(paths)

(bool_paths == data_1["natural answer"]).sum()/250

"""***Task II***"""

data_2 = pd.read_csv("../task2_prerequisite.csv")

def extract_data(data_string):
    concept = []

    concept_pattern = re.compile(r"concept_1: (.+)")

    for item in data_string:
        concept_match = concept_pattern.search(item)

        if concept_match:
            concept.append(concept_match.group(1).strip().lower())

    return concept

concept = extract_data(data_2["input_dict"])

prerequisites_prompt = """
In the field of Natural Language Processing, I want to learn about {concept}.
What concepts should I learn first (concepts "Is-a-Prerequisite-of" {concept})?
Only return the concepts.
"""

concepts = []
for i in tqdm(range(250)):
    prompt = prerequisites_prompt.format(concept=concept[i])
    try:
        result = chain.invoke(prompt).get("result", "")
    except Exception as e:
        print(f"Error processing concept pair {concept[i]}: {e}")
        result = []
    concepts.append(result)

task_II_prompt = """
There is a knowledge graph containing NLP concepts and their relations.
Relevant information are retrieved from the graph based on the question.
If the retrieved information is not empty, answer using only the retrieved information.
If the retrieved information is empty, you must answer based on your own knowledge.

Answer the question in the following format (return only a list):
[concept1, concept2, ...]

### Question
In the field of Natural Language Processing, I want to learn about {concept}.
What concepts should I learn first?

Retrieved Information:
{concepts}
"""

kg_results = []
for i in tqdm(range(250)):
    prompt = task_II_prompt.format(concept=concept[i], concepts=concepts[i])
    result = llm.invoke(prompt).content
    kg_results.append(result)

with open("../task2_kg_results.pkl", "wb") as f:
    pickle.dump(kg_results, f)

"""***Task III***"""

data_3 = pd.read_csv("../task3_shorestpath.csv")

def extract_data(data_string):
    concept_1 = []
    concept_2 = []

    concept_1_pattern = re.compile(r"concept_1: (.+)")
    concept_2_pattern = re.compile(r"concept_2: (.+)")

    for item in data_string:
        concept_1_match = concept_1_pattern.search(item)
        concept_2_match = concept_2_pattern.search(item)

        if concept_1_match:
            concept_1.append(concept_1_match.group(1).strip().lower())
        if concept_2_match:
            concept_2.append(concept_2_match.group(1).strip().lower())

    return concept_1, concept_2

concept_1, concept_2 = extract_data(data_3["input_dict"])

shrotest_path_prompt = """
In the field of Natural Language Processing, I know about "{concept_1}", now I want to learn about "{concept_2}".
What concept path should I follow?
Return the shortest path.
"""

paths = []
for i in tqdm(range(250)):
    prompt = shrotest_path_prompt.format(concept_1=concept_1[i], concept_2=concept_2[i])
    print(prompt)
    try:
        result = chain.invoke(prompt).get("result", "")
    except Exception as e:
        print(f"Error processing concept pair {concept_1[i]}, {concept_2[i]}: {e}")
        result = []
    paths.append(result)

task_III_prompt = """
There is a knowledge graph containing NLP concepts and their relations.
Relevant information are retrieved from the graph based on the question.
If the retrieved information is not empty, answer using only the retrieved information.
If the retrieved information is empty, you must answer based on your own knowledge.

Answer the question in the following format (return only a list):
[concept1, concept2, ...]

### Question
In the field of Natural Language Processing, I know about "{concept_1}", now I want to learn about "{concept_2}".
What concept path should I follow?

Retrieved Information:
{path}
"""

kg_results = []
for i in tqdm(range(250)):
    prompt = task_III_prompt.format(concept_1=concept_1[i], concept_2=concept_2[i], path=paths[i])
    result = llm.invoke(prompt).content
    kg_results.append(result)

with open("../task3_kg_results.pkl", "wb") as f:
    pickle.dump(kg_results, f)

"""***Task V***"""

data_4 = pd.read_csv("../task4_KGCompletion.csv")

def extract_data(data_string):
    concept_1 = []
    concept_2 = []

    concept_1_pattern = re.compile(r"concept_1: (.+)")
    concept_2_pattern = re.compile(r"concept_2: (.+)")

    for item in data_string:
        concept_1_match = concept_1_pattern.search(item)
        concept_2_match = concept_2_pattern.search(item)

        if concept_1_match:
            concept_1.append(concept_1_match.group(1).strip().lower())
        if concept_2_match:
            concept_2.append(concept_2_match.group(1).strip().lower())

    return concept_1, concept_2

concept_1, concept_2 = extract_data(data_4["input_dict"])

def extract_edge_list(data):
    match = re.search(r"edge_list:(.*?)(?:relation_list:|$)", data, re.DOTALL)
    if match:
        edge_list_content = match.group(1).strip()
        edge_list_lines = edge_list_content.split("\n")
        edge_list_lines = [line.strip() for line in edge_list_lines if line.strip()]
        return edge_list_lines
    return None

data_4["extracted_edge_list"] = data_4["input_dict"].apply(extract_edge_list)

edges_list = data_4["extracted_edge_list"].tolist()

link_prompt = """
Please identify and select the possible type of relationship between "{concept_1}" and "{concept_2}"
Return the relationship.
"""

paths = []
for i in tqdm(range(250)):
    prompt = link_prompt.format(concept_1=concept_1[i], concept_2=concept_2[i])
    try:
        result = chain.invoke(prompt).get("result", "")
    except Exception as e:
        print(f"Error processing concept pair {concept_1[i]}, {concept_2[i]}, {relation[i]}: {e}")
        result = []
    paths.append(result)

task_IV_prompt = """
There is a knowledge graph containing NLP concepts and their relations.
Relevant information are retrieved from the graph based on the question.
If the retrieved information is not empty, answer using only the retrieved information.
If the retrieved information is empty, you must answer based on your own knowledge.

Answer the question in the following format (only return the relationship type):
Example:
Hyponym-Of

### Question
Given the following edges constituting a concept subgraph, please identify and select the possible type of relationship between "{concept_1}" and "{concept_2}".

### Subgraph Edges
{edges}

### Relationships Types
Compare
Part-of
Conjunction
Evaluate-for
Is-a-Prerequisite-of
Used-for
Hyponym-Of

Retrieved Information:
{relationship}
"""

kg_results = []
for i in tqdm(range(250)):
    prompt = task_IV_prompt.format(concept_1=concept_1[i], concept_2=concept_2[i], edges=edges_list[i], relation=paths[i])
    result = llm.invoke(prompt).content
    kg_results.append(result)

(kg_results == data_4["natural answer"]).sum()/250