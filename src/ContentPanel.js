import React, { useEffect, useRef, useState } from "react";
import {
  TextField,
  Typography,
  List,
  ListItem,
  Divider,
  Box,
  Tab,
  Tabs,
} from "@material-ui/core";
import IconButton from "@mui/material/IconButton";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import TabPanel from "./components/TabPanel";
import ChatInput from "./components/ChatInput";
import ChatBox from "./components/ChatBox";
import { v4 as uuidv4 } from "uuid";
import LinearProgress from "@mui/material/LinearProgress";
import ReplyTwoToneIcon from "@mui/icons-material/ReplyTwoTone";
import { useMutation } from "@tanstack/react-query";
import { SERVER_URL } from "./constant/server";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  ContentPanel: {
    marginX: "20px",
    padding: "20px",
    color: "white",
    border: "1px solid rgb(240, 238, 229)",
    borderRadius: "10px",
    width: "calc(50vw - 50px)",
    backgroundColor: "rgb(240, 238, 229)",
    boxShadow: "-8px 10px 10px grey",
    overflow: "auto",
  },
  content: {
    color: "#012027",
    lineHeight: "1.6",
    textAlign: "justify",
    marginRight: "24px",
  },
  title: {
    color: "#012027",
    marginTop: "40px",
    marginBottom: "5px",
  },
  item: {
    color: "#012027",
    lineHeight: "1",
    pointerEvents: "none",
  },
  topicList: {
    maxHeight: "400px",
    overflowY: "auto",
    marginBottom: "24px",
  },
  firstWord: {
    fontSize: "20px",
    fontWeight: 900,
  },
  underline: {
    width: "50px",
    border: "1px solid rgb(173, 216, 230)",
  },
  pointer: {
    cursor: "pointer",
  },
  tab: {
    color: "#012027",
  },
  tabPanel: {
    maxHeight: "500px",
    backgroundColor: "rgba(232, 229, 216, .2)",
    margin: "10px",
    borderRadius: "10px",
  },
  chatBotTitle: {
    color: "rgb(200, 198, 189)",
    margin: "10px 0px",
    textAlign: "center",
    fontWeight: 900,
  },
  borderBox: {
    boxSizing: "borderBox",
  },
}));

const sendQuestion = async (inputValue) => {
  const response = await fetch(`${SERVER_URL}/question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: `${inputValue}. Please answer it shortly`,
    }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const ContentPanel = ({
  data,
  handleSelectTopic,
  handleClickOverview,
  selectedContent,
  selectedNode,
  isOverview,
  selectedId,
  handleMentionNode,
  setSelectedId,
}) => {
  const classes = useStyles();

  const scrollableChatBox = useRef(null);

  const [value, setValue] = useState(data.nodes[0].name);
  const [inputValue, setInputValue] = useState("");

  const [firstWordLength, setFirstWordLength] = useState(-1);

  const [currentTab, setCurrentTab] = useState(0);

  const [chats, setChats] = useState([]);

  const [waitingResponse, setWaitingReponse] = useState(false);

  const [userInput, setUserInput] = useState("");

  const [hasError, setHasError] = useState(false);

  const mutation = useMutation({
    mutationFn: sendQuestion,
    onSuccess: (data) => {
      const { response, neo4j } = data;
      setChats([
        ...chats,
        {
          from: "bot",
          content: response,
          id: uuidv4(),
        },
      ]);
      setUserInput("");
      setWaitingReponse(false);

      const firstKey = Object.keys(neo4j[0])[0];

      let mentionedNodeNamesInAnswer = [];

      if (firstKey === "related.concept_name") {
        mentionedNodeNamesInAnswer = neo4j.map(
          (node) => node["related.concept_name"],
        );
      } else {
        mentionedNodeNamesInAnswer = neo4j[0][firstKey]
          .filter((node) => {
            return typeof node === "object" && typeof node !== null;
          })
          .map((n) => n["concept_name"]);
      }

      const mentionedNodesInAnswer = selectedNode.filter((node) => {
        return mentionedNodeNamesInAnswer.includes(node.name);
      });

      handleMentionNode(mentionedNodesInAnswer);
      setSelectedId(-1);
    },
    onError: (error) => {
      console.error("Error:", error);
      setWaitingReponse(false);
      setHasError(true);
      setUserInput("");
    },
  });

  useEffect(() => {
    if (!waitingResponse) {
      if (scrollableChatBox.current) {
        const lastChatBox = scrollableChatBox.current.lastElementChild;
        if (lastChatBox) {
          lastChatBox.scrollIntoView({ behavior: "smooth" });
        }
      }
      return;
    }

    sendQuestionToBot();
    if (scrollableChatBox.current) {
      scrollableChatBox.current.scrollTop =
        scrollableChatBox.current.scrollHeight;
    }
  }, [waitingResponse]);

  const sendQuestionToBot = async () => {
    mutation.mutate(userInput);
  };

  useEffect(() => {
    const relevantNode = data.nodes.find((node) => node.id === selectedId);
    setInputValue(relevantNode?.name ?? "");
    if (!selectedContent) return;
    const selectedContentList = selectedContent.content.split(" ");
    setFirstWordLength(selectedContentList[0].length);
  }, [selectedContent, selectedId]);

  return (
    <section className={classes.ContentPanel}>
      <Tabs
        value={currentTab}
        onChange={(event, newValue) => setCurrentTab(newValue)}
      >
        <Tab
          label="Prerequisite Detail"
          {...a11yProps(0)}
          className={classes.tab}
        />
        <Tab label="Chat Bot" {...a11yProps(1)} className={classes.tab} />
      </Tabs>
      <TabPanel value={currentTab} index={0} className={classes.tabPanel}>
        {!isOverview && (
          <Box position="relative">
            <IconButton
              style={{ position: "absolute", top: -15, left: -40 }} // 设置绝对定位
              onClick={() => {
                setInputValue("");
                handleClickOverview();
              }}
            >
              <ReplyTwoToneIcon sx={{ color: "red" }} />
            </IconButton>
          </Box>
        )}
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Autocomplete
            onChange={(event, newValue) => {
              if (!newValue) {
                setInputValue("");
                handleClickOverview();
                return;
              }
              setValue(newValue);
              handleMentionNode([]);
              handleSelectTopic(newValue ? newValue.id : null);
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            options={data.nodes}
            getOptionLabel={(option) => option.name}
            style={{ width: "60%" }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select a topic"
                variant="standard"
              />
            )}
          />
        </Box>

        {!selectedContent && (
          <Typography variant="body2" className={classes.content}>
            Ready to learn? Pick a topic from the list below, and a map showing
            prerequisite topics will be generated. You can select a node from
            top box see a summary of that topic.
          </Typography>
        )}
        {selectedContent && (
          <Typography variant="body2" className={classes.content}>
            <Typography variant="span" className={classes.firstWord}>
              {selectedContent.content.substring(0, firstWordLength)}
            </Typography>
            {selectedContent.content.substring(firstWordLength)}
            {selectedContent.content}
          </Typography>
        )}

        {!isOverview && (
          <>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography variant="body1" className={classes.title}>
                Immediate Prerequisites
              </Typography>
              <Typography className={classes.underline} />
            </Box>

            <List component="nav" className={classes.topicList}>
              {selectedNode
                .filter((node) => node.id !== selectedId)
                .sort((a, b) => {
                  if (a.name < b.name) return -1;

                  return 1;
                })
                .map((node, index) => (
                  <div key={node.id}>
                    <ListItem
                      className={classes.pointer}
                      onClick={() => handleSelectTopic(node.id)}
                    >
                      <Typography variant="body2" className={classes.item}>
                        {index + 1}. {node.name}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </div>
                ))}
            </List>
          </>
        )}
      </TabPanel>
      <TabPanel value={currentTab} index={1} className={classes.tabPanel}>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={hasError}
          autoHideDuration={6000}
          onClose={() => setHasError(false)}
        >
          <Alert
            onClose={() => setHasError(false)}
            severity="error"
            sx={{ width: "100%" }}
          >
            Server error happens!
            <br />
            <Typography variant="caption">Please wait until fix.</Typography>
          </Alert>
        </Snackbar>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          paddingBottom={2}
        >
          {chats.length !== 0 ? (
            <Box overflow="auto" height={360} ref={scrollableChatBox}>
              {chats.map((chat) => (
                <ChatBox key={chat.id} chat={chat} />
              ))}
              {waitingResponse ? <LinearProgress /> : null}
            </Box>
          ) : (
            <Typography variant="subtitle1" className={classes.chatBotTitle}>
              What can I do for you?
            </Typography>
          )}
        </Box>
        <ChatInput
          setChats={setChats}
          chats={chats}
          waitingResponse={waitingResponse}
          setWaitingReponse={setWaitingReponse}
          handleClickOverview={handleClickOverview}
          userInput={userInput}
          setUserInput={setUserInput}
        />
      </TabPanel>
    </section>
  );
};

export default ContentPanel;
