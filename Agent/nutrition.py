import pandas as pd
import networkx as nx

class NutritionKG:
    def __init__(self, csv_path = "./test_rows_triples.csv"):
        self.df = pd.read_csv(csv_path)

        # 若有 row_index 欄位，將其丟掉
        if 'row_index' in self.df.columns:
            self.df.drop(columns=['row_index'], inplace=True)

        self.df.columns = ['subject', 'relation', 'object']

        valid_relations = {
            "屬於", "含有", "具有", "食用方式", "食用限制",
            "belongs to", "contains", "has", "cooking method", "dietary restriction"
        }
        self.df = self.df[self.df['relation'].isin(valid_relations)]
        self.df.reset_index(drop=True, inplace=True)

        self.graph = nx.DiGraph()
        for _, row in self.df.iterrows():
            subj = row['subject']
            rel  = row['relation']
            obj  = row['object']
            self.graph.add_node(subj)
            self.graph.add_node(obj)
            self.graph.add_edge(subj, obj, relation=rel)

    def search_by_subject(self, keyword, exact=False):
        if exact:
            return self.df[self.df['subject'] == keyword].copy()
        else:
            return self.df[self.df['subject'].str.contains(keyword, na=False)].copy()

    def search_by_object(self, keyword, exact=False):
        if exact:
            return self.df[self.df['object'] == keyword].copy()
        else:
            return self.df[self.df['object'].str.contains(keyword, na=False)].copy()

    def search_by_relation(self, keyword, exact=True):
        if exact:
            return self.df[self.df['relation'] == keyword].copy()
        else:
            return self.df[self.df['relation'].str.contains(keyword, na=False)].copy()

    def search_any(self, keyword):
        cond = (
            self.df['subject'].str.contains(keyword, na=False) |
            self.df['relation'].str.contains(keyword, na=False) |
            self.df['object'].str.contains(keyword, na=False)
        )
        return self.df[cond]

    def get_subgraph_from_df(self, sub_df):
        g_sub = nx.DiGraph()
        for _, row in sub_df.iterrows():
            subj = row['subject']
            rel  = row['relation']
            obj  = row['object']
            g_sub.add_node(subj)
            g_sub.add_node(obj)
            g_sub.add_edge(subj, obj, relation=rel)
        return g_sub
