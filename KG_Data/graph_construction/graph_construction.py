!pip install neo4j -q

from tqdm import tqdm
from neo4j import GraphDatabase

# Change to your own neo4j database
uri = "neo4j+s://c1b006d6.databases.neo4j.io"
username = "neo4j"
password = "gI0vxkUVo6BLbEe2jhXAY3vZbdSD3xH4i3z7DSyJwdY"

driver = GraphDatabase.driver(uri, auth=(username, password))

def create_concepts(tx, concepts):
    for concept_id, concept_name in tqdm(concepts, desc="Creating Concepts"):
        tx.run(
            "MERGE (c:Concept {concept_id: $id, concept_name: $name})",
            id=concept_id, name=concept_name
        )

def create_relationships(tx, relationships):
    for source_id, target_id, relation in tqdm(relationships, desc="Creating Relationships"):
        tx.run(
            """
            MATCH (a:Concept {concept_id: $source_id}), (b:Concept {concept_id: $target_id})
            MERGE (a)-[r:RELATION {type: $relation}]->(b)
            """,
            source_id=source_id, target_id=target_id, relation=relation
        )

def import_concepts(tsv_path):
    concepts = []
    with open(tsv_path, "r") as file:
        for line in file:
            parts = line.strip().split("\t")
            concept_id = int(parts[0].strip())
            concept_name = parts[1].strip()
            concepts.append((concept_id, concept_name))

    with driver.session() as session:
        session.execute_write(create_concepts, concepts)

def import_relationships(tsv_path):
    relationships = []
    with open(tsv_path, "r") as file:
        for line in file:
            parts = line.strip().split("\t")
            source_id = int(parts[0].strip())
            target_id = int(parts[1].strip())
            relation = parts[2].strip()
            relationships.append((source_id, target_id, relation))

    with driver.session() as session:
        session.execute_write(create_relationships, relationships)

nodes_path = "../nodes.tsv"
import_concepts(nodes_path)

edges_file_path = "../edges.tsv"
import_relationships(edges_file_path)

