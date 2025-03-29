import os
import re
from langchain_openai import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import json

os.environ["OPENAI_API_KEY"] = "Your API KEY"


class IntegratedNLPSystem:
    def __init__(self):
        self.llm = OpenAI(temperature=0)
        self.task_identifier_chain = self._create_task_identifier_chain()
        self.info_extractor_chains = {
            "task1": self._create_task1_info_extractor_chain(),
            "task2": self._create_task2_info_extractor_chain(),
            "task3": self._create_task3_info_extractor_chain(),
            "task4": self._create_task4_info_extractor_chain()
        }
        self.task_chains = {
            "task1": self._create_task1_chain(),
            "task2": self._create_task2_chain(),
            "task3": self._create_task3_chain(),
            "task4": self._create_task4_chain()
        }

    # Task Classification
    def _create_task_identifier_chain(self):
        prompt = PromptTemplate(
            input_variables=["query"],
            template="""
            You are an expert NLP task classifier with perfect accuracy. Your job is to categorize queries into one of four specific NLP-related tasks. Analyze the given query meticulously and follow these steps:

            1. Identify all key concepts, relationships, and linguistic cues in the query.
            2. Determine the primary intent and the specific question being asked.
            3. Match the query's characteristics with the task descriptions provided below.
            4. Consider potential ambiguities and edge cases before making a final decision.
            5. If uncertain, list pros and cons for each potential task.

            Task Descriptions:

            1. Task 1 (Verify relation or usage between two concepts):
            - Asks about the accuracy, truth, necessity, or usage of a relationship between TWO SPECIFIC concepts.
            - Often uses phrases like "is it true", "is it accurate", "is it necessary", "do I need", "should I know", "is X used for Y", "does X count as Y".
            - Focus is on VERIFYING a relationship or usage, not on learning prerequisites or paths.
            - The relationship or usage in question is typically explicitly stated or strongly implied.
            - Examples:
                * "Do I need to understand probabilities before learning about pretrained language models?"
                * "Is classification actually used for sentence boundary recognition in NLP?"
                * "Does 'penn treebank' count as a more specific version of 'first-order logic,' like a hyponym?"
                * "Is extractive summarization a prerequisite for understanding adversarial search?"

            2. Task 2 (Find prerequisites for a SINGLE concept):
            - Asks about prerequisites, foundational knowledge, or initial topics to learn for ONE SPECIFIC concept.
            - Often uses phrases like "what should I learn before", "what are the prerequisites for", "what topics should I begin with", "what foundational concepts".
            - Focus is on listing MULTIPLE prerequisites or starting points for a SINGLE concept.
            - The concept being asked about is usually clearly stated at the end of the query.
            - Does NOT involve progression from one concept to another or mention of a starting concept.
            - Examples:
                * "What should I learn before studying neural networks?"
                * "If I want to dive into syntax-based machine translation in NLP, what topics should I begin with?"
                * "What foundational concepts should I start with for convolutional neural networks in NLP?"

            3. Task 3 (Find learning path between two concepts):
            - Asks about the learning journey, progression, or steps between TWO DISTINCT concepts.
            - Often uses phrases like "how do I go from X to Y", "what's the path between", "how to progress from", "what's the best way to go from".
            - Focus is on the SEQUENCE of concepts to learn, not just prerequisites.
            - Usually mentions both a clear starting point and an end goal, or implies a current knowledge state and a desired knowledge state.
            - The query often implies movement or progression between concepts.
            - Look for phrases indicating a current state of knowledge and a desired future state.
            - Examples:
                * "How do I go from understanding neural networks to mastering neural language modeling?"
                * "What's the learning path from basic NLP to advanced query expansion?"
                * "I know about optimization in NLP, what should I learn next to understand neural language modeling?"
                * "I get the idea of neural networks, but how do I start learning about training neural networks? What concept should I look into next?"
                * "I know the fundamentals of linguistics in NLP, but I'm not sure where to start with query expansion. What should I study next?"

            4. Task 4 (Identify relationship type in a given context):
            - Explicitly mentions a specific context, subgraph, set of relationships, or triplets.
            - Asks to identify or infer a SPECIFIC TYPE of relationship between two concepts within the given context.
            - Often provides or refers to a list of possible relationship types or a specific relationship framework.
            - The focus is on interpreting given information, not on verifying a proposed relationship.
            - Examples:
                * "Given the subgraph of NLP concepts, what's the relationship between 'word embeddings' and 'language models'?"
                * "Based on the provided triplets, what relationship exists between 'sentence generation' and 'natural language generation'?"
                * "In the context of the given NLP concept map, how are 'tokenization' and 'parsing' related?"

            Critical Differentiators:
            - Task 1 vs Task 3: Task 1 verifies a specific relationship or usage. Task 3 describes a learning journey between concepts.
            - Task 1 vs Task 4: Task 1 verifies a proposed relationship. Task 4 infers a relationship from given context.
            - Task 2 vs Task 3:
            * Task 2 lists prerequisites for ONE concept without mentioning a starting point.
            * Task 3 describes a path between TWO concepts or states of knowledge.
            * If the query mentions a current state of knowledge and asks about next steps, it's likely Task 3.
            * If the query only asks about prerequisites for a single concept without mentioning current knowledge, it's likely Task 2.
            - Task 3 vs Task 4: Task 3 focuses on learning progression. Task 4 focuses on relationship inference in a given context.

            Now, analyze the following query:

            Query: {query}

            Reasoning:
            1. Key concepts and linguistic cues:
            2. Primary intent and specific question:
            3. Matching with task characteristics:
            4. Potential ambiguities or edge cases:
            5. Pros and cons for each potential task (if necessary):

            Based on this analysis, the query best fits:

            Task Classification: [Your answer here: ONLY provide the task number (1, 2, 3, or 4)]

            Remember, you must ONLY return the task number (1, 2, 3, or 4) as your final answer. No other text or explanation in the final output.
            Return only the identified task number from (Task 1, Task 2, Task 3, or Task 4).
            Return only a single number in '1' or '2' or '3' or '4' to represent the task, nothing else.

            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    # Extract key concepts for each task
    def _create_task1_info_extractor_chain(self):
        prompt = PromptTemplate(
            input_variables=["query"],
            template="""
            Extract the following information from the query:
            - concept_1
            - concept_2
            - relation
            - relation_desc (if mentioned)

            Query: {query}

            Provide the extracted information in a JSON format.
            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    def _create_task2_info_extractor_chain(self):
        prompt = PromptTemplate(
            input_variables=["query"],
            template="""
            Extract the following information from the query:
            - concept (the single concept to find prerequisites for)

            Query: {query}

            Provide the extracted information in a JSON format.
            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    def _create_task3_info_extractor_chain(self):
        prompt = PromptTemplate(
            input_variables=["query"],
            template="""
            Extract the following information from the query:
            - concept_1 (starting concept)
            - concept_2 (target concept)

            Query: {query}

            Provide the extracted information in a JSON format.
            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    def _create_task4_info_extractor_chain(self):
        prompt = PromptTemplate(
            input_variables=["query"],
            template="""
            Extract the following information from the query:
            - concept_1
            - concept_2
            - edge_list (list of relationships mentioned in the subgraph)
            - relation_list (list of possible relationship types)

            Query: {query}

            Provide the extracted information in a JSON format.
            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    # Process Chain for each Task
    def _create_task1_chain(self):
        prompt = PromptTemplate(
            input_variables=["concept_1", "concept_2", "relation", "relation_desc"],
            template="""
            In the field of Natural Language Processing, consider the concepts "{concept_1}" and "{concept_2}".
            Given the relationship "{relation}" described as: {relation_desc}
            Determine if it's accurate to say that "{concept_1}" {relation} "{concept_2}".
            Provide your answer as 'True' or 'False', followed by a brief explanation.
            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    def _create_task2_chain(self):
        prompt = PromptTemplate(
            input_variables=["concept"],
            template="""
            In the field of Natural Language Processing, for someone wanting to learn about {concept},
            what concepts should they learn first? These would be prerequisites or foundational concepts for understanding {concept}.
            List only the most crucial prerequisites, separated by semicolons.
            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    def _create_task3_chain(self):
        prompt = PromptTemplate(
            input_variables=["concept_1", "concept_2"],
            template="""
            In the field of Natural Language Processing, consider a learner who understands "{concept_1}" and wants to learn about "{concept_2}".
            What would be the most efficient learning path between these concepts?
            Provide the shortest conceptual path, listing key concepts separated by semicolons.
            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    def _create_task4_chain(self):
        prompt = PromptTemplate(
            input_variables=["concept_1", "concept_2", "edges", "relation_list"],
            template="""
            Given the following subgraph of NLP concepts and their relationships:

            Edges:
            {edges}

            Identify the most likely type of relationship between "{concept_1}" and "{concept_2}".
            Choose from these relationship types:
            {relation_list}

            Provide only the most appropriate relationship type based on the given subgraph.
            """
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    # 执行问答任务（关键的输出输出都在这里）
    def process_query(self, query):
        try:
            #执行对问题的分类任务
            task = self.task_identifier_chain.run(query)

            # 提取任务编号中的数字（避免分类任务输出格式不规范导致的报错）
            match = re.search(r'\b(\d)\b', task)
            if match:
                task_number = int(match.group(1))
            else:
                return u"Error: Task identification failed. The system returned: '{}'. Please rephrase your query.".format(task)

            # 执行关键信息提取任务 extract key components
            extracted_info = self.info_extractor_chains[f"task{task_number}"].run(query=query)

            # Load the extracted information as JSON
            try:
                info_dict = json.loads(extracted_info)
            except json.JSONDecodeError:
                return u"Error: Could not parse the extracted information. Please try rephrasing your query."

            # 执行具体的每个任务的问答
            if task_number == 1:
                return self._process_task1(info_dict)
            elif task_number == 2:
                return self._process_task2(info_dict)
            elif task_number == 3:
                return self._process_task3(info_dict)
            elif task_number == 4:
                return self._process_task4(info_dict)
        except Exception as e:
            return u"An error occurred while processing your query: {}. Please check your input format and try again.".format(str(e))

    def _process_task1(self, info_dict):
        try:
            concept_1 = info_dict.get('concept_1', '')
            concept_2 = info_dict.get('concept_2', '')
            relation = info_dict.get('relation', '')
            relation_desc = info_dict.get('relation_desc', '')

            if not concept_1 or not concept_2 or not relation:
                return "Error: Missing required information for Task 1. Please ensure your query includes all necessary details."

            result = self.task_chains["task1"].run(concept_1=concept_1, concept_2=concept_2, relation=relation, relation_desc=relation_desc)
            return {'task_type': 'binary', 'result': result, 'concept_1': concept_1, 'concept_2': concept_2}
        except Exception as e:
            return u"An error occurred while processing Task 1: {}.".format(str(e))

    def _process_task2(self, info_dict):
        try:
            concept = info_dict.get('concept', '')

            if not concept:
                return "Error: Missing required information for Task 2. Please ensure your query includes the concept."

            result = self.task_chains["task2"].run(concept=concept)
            return {'task_type': 'prerequisite', 'result': result, 'concept_1': concept, 'concept_2': None}
        except Exception as e:
            return u"An error occurred while processing Task 2: {}.".format(str(e))

    def _process_task3(self, info_dict):
        try:
            concept_1 = info_dict.get('concept_1', '')
            concept_2 = info_dict.get('concept_2', '')

            if not concept_1 or not concept_2:
                return "Error: Missing required information for Task 3. Please ensure your query includes both concepts."

            result = self.task_chains["task3"].run(concept_1=concept_1, concept_2=concept_2)
            return {'task_type': 'shortest_path', 'result': result, 'concept_1': concept_1, 'concept_2': concept_2}
        except Exception as e:
            return u"An error occurred while processing Task 3: {}.".format(str(e))

    def _process_task4(self, info_dict):
        try:
            concept_1 = info_dict.get('concept_1', '')
            concept_2 = info_dict.get('concept_2', '')
            edges = info_dict.get('edge_list', [])
            relation_list = info_dict.get('relation_list', [])

            if not all([concept_1, concept_2, edges, relation_list]):
                return "Error: Missing required information for Task 4. Please ensure your query includes two concepts, a list of edges, and a list of possible relationships."

            edges_str = "\n".join(edges)
            relation_list_str = ", ".join(relation_list)

            result = self.task_chains["task4"].run(
                concept_1=concept_1,
                concept_2=concept_2,
                edges=edges_str,
                relation_list=relation_list_str
            )
            return {'task_type': 'predict_relation', 'result': result, 'concept_1': concept_1, 'concept_2': concept_2}
        except Exception as e:
            return u"An error occurred while processing Task 4: {}.".format(str(e))
