import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PersonOutlineTwoToneIcon from "@mui/icons-material/PersonOutlineTwoTone";
import Avatar from "@mui/material/Avatar";
import Markdown from "react-markdown";

const useStyles = makeStyles((theme) => ({
  chatBoxContent: {
    color: "#012027",
  },
  userChatBox: {
    backgroundColor: "rgba(232, 229, 216, .5)",
    padding: "10px",
    borderRadius: "10px",
  },
  botChatBox: {
    backgroundColor: "rgba(248, 248, 247, 0.5)",
    padding: "10px",
    borderRadius: "10px",
  },
}));

const ChatBox = ({ chat }) => {
  const classes = useStyles();

  if (chat.from === "bot") {
    return (
      <Box className={classes.botChatBox}>
        <Markdown className={classes.chatBoxContent}>{chat.content}</Markdown>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="row"
      className={classes.userChatBox}
      marginTop={1}
      marginBottom={1}
    >
      <Box marginRight={1}>
        <Avatar sx={{ width: 30, height: 30 }}>
          <PersonOutlineTwoToneIcon />
        </Avatar>
      </Box>
      <Box display="flex" flexDirection="column">
        {chat.content.split("\n").map((paragraph, index) => (
          <Typography
            key={`${chat.id}-paragraph${index}`}
            variant="subtitle2"
            className={classes.chatBoxContent}
          >
            {paragraph}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default ChatBox;
