import React, { useEffect, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import IconButton from "@mui/material/IconButton";
import { EmailTwoTone } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";

const useStyles = makeStyles((theme) => ({
  input: {
    border: "0px",
    display: "block",
    width: "100%",
    resize: "none",
    "&:focus": {
      outline: "none",
    },
    boxSizing: "border-box",
    padding: "5px",
    paddingLeft: "8px",
    border: "1px solid rgb(200, 198, 189)",
    borderRadius: "10px",
  },
}));

const ChatInput = ({
  setChats,
  chats,
  waitingResponse,
  setWaitingReponse,
  handleClickOverview,
  userInput,
  setUserInput,
}) => {
  const classes = useStyles();

  const chatBotInput = useRef(null);

  const inputing = (value) => {
    setUserInput(value);
  };

  const sendChat = () => {
    if (userInput.trim().length === 0) return;
    setChats([
      ...chats,
      {
        from: "user",
        content: userInput,
        id: uuidv4(),
      },
    ]);

    setWaitingReponse(true);
    handleClickOverview();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      // Handle Enter key press (e.g., send message)
      sendChat();
      // Perform your action here, e.g., submit the form or send a message
    } else if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      // Handle Shift + Enter key press (e.g., insert newline)
      setUserInput(`${userInput}\n`);
    }
  };

  return (
    <Box display="flex" flexDirection="row" alignItems="top">
      <textarea
        placeholder={
          waitingResponse
            ? "Waiting for response..."
            : "Ask question to chat bot"
        }
        rows={4}
        type="text"
        className={classes.input}
        ref={chatBotInput}
        onInput={(event) => inputing(event.target.value)}
        value={userInput}
        onKeyDown={handleKeyDown}
      />
      <Box height={50}>
        <IconButton onClick={sendChat} disabled={waitingResponse}>
          <EmailTwoTone />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInput;
